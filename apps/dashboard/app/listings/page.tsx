import { createClient } from "@/core/database/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureUniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, tenantId: string | null, base: string) {
  let candidate = base;
  let attempt = 1;
  while (true) {
    const { data } = await supabase
      .from("listings")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
}

export async function createListing(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!title) {
    throw new Error("Title is required");
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user!.id)
    .single();

  const tenantId = userRow?.tenant_id ?? null;
  const baseSlug = slugify(title);
  const slug = await ensureUniqueSlug(supabase, tenantId, baseSlug || crypto.randomUUID());

  const { error } = await supabase
    .from("listings")
    // @ts-expect-error Supabase type inference
    .insert({
      title,
      slug,
      description,
      status: "draft",
      owner_id: user!.id,
      tenant_id: tenantId,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/listings");
}

export default async function ListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data: listings = [] } = await supabase
    .from("listings")
    .select("id, title, slug, status, created_at, rating_average, rating_count")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-900">Listings</h1>
        <p className="text-sm text-gray-600">
          Manage your listings. Drafts stay hidden until you publish them from the platform admin.
        </p>
      </header>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Create a listing</h2>
        <form action={createListing} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="title">
              Title
            </label>
            <input id="title" name="title" required placeholder="e.g. Happy Paws Grooming" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Short description of your service."
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
            >
              Save draft
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Your listings</h2>
        {listings.length === 0 ? (
          <p className="text-sm text-gray-600">No listings yet. Create your first listing above.</p>
        ) : (
          <div className="grid gap-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                    <p className="text-xs text-gray-500">Slug: {listing.slug}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Ratings: {listing.rating_average ?? "–"} ({listing.rating_count ?? 0})
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {listing.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

