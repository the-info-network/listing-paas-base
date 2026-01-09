import { createClient } from "@/core/database/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, listings: [] as any[], reviews: [] as any[] };
  }

  const { data: listings = [] } = await supabase
    .from("listings")
    .select("id, title")
    .eq("owner_id", user.id);

  const listingIds = listings.map((l) => l.id);

  const { data: reviews = [] } =
    listingIds.length === 0
      ? { data: [] }
      : await supabase
          .from("reviews")
          .select("id, listing_id, rating, title, content, status, owner_response, created_at")
          .in("listing_id", listingIds)
          .order("created_at", { ascending: false });

  return { user, listings, reviews };
}

export async function respondToReview(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const reviewId = String(formData.get("reviewId") || "");
  const response = String(formData.get("response") || "").trim();

  if (!reviewId || !response) {
    throw new Error("Response cannot be empty");
  }

  const { error } = await supabase.rpc("respond_to_review", {
    p_review_id: reviewId,
    p_response: response,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/reviews");
}

export default async function ReviewsPage() {
  const { user, listings, reviews } = await getContext();

  if (!user) {
    redirect("/signin");
  }

  const listingLookup = listings.reduce<Record<string, string>>((acc, l) => {
    acc[l.id] = l.title;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-600">
          View reviews for your listings and post owner responses.
        </p>
      </header>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-600">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">
                    {listingLookup[review.listing_id] || "Listing"}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {review.title || "Review"}
                  </p>
                  <p className="text-xs text-gray-500">Rating: {review.rating} / 5</p>
                  <p className="mt-2 text-sm text-gray-700">{review.content}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {review.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-900">Owner response</p>
                {review.owner_response ? (
                  <div className="rounded-lg bg-indigo-50 p-3 text-sm text-gray-800">
                    {review.owner_response}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No response yet.</p>
                )}
              </div>

              <form action={respondToReview} className="mt-4 space-y-2">
                <input type="hidden" name="reviewId" value={review.id} />
                <textarea
                  name="response"
                  rows={3}
                  placeholder="Write a reply to this review."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue={review.owner_response || ""}
                />
                <button
                  type="submit"
                  className="bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
                >
                  Post response
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { createClient } from "@/core/database/server";
import Link from "next/link";
import { redirect } from "next/navigation";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  return user;
}

export default async function ReviewsPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-600">
          View feedback left on your listings and respond as the owner.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-700">
          Reviews and owner responses will live here. Upcoming work will add the review list for your listings and a safe
          reply form backed by the new Supabase RPC.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/dashboard" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
            Back to dashboard
          </Link>
          <Link href="/listings" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Go to listings
          </Link>
        </div>
      </div>
    </div>
  );
}

