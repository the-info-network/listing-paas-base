"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/core/database/server";

export async function listListings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("listings")
    .select("id, title, slug, status, price, currency, featured_image, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listListings error", error);
    return [];
  }

  return data || [];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function upsertListing(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString() || "";
  const slugInput = formData.get("slug")?.toString();
  const description = formData.get("description")?.toString() || null;
  const status = formData.get("status")?.toString() || "draft";
  const priceValue = formData.get("price")?.toString();
  const price = priceValue ? Number(priceValue) : null;
  const currency = formData.get("currency")?.toString() || "USD";
  const featuredImage = formData.get("featured_image")?.toString() || null;

  if (!title) throw new Error("Title is required");

  const { data: userRow } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  const payload = {
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    description,
    status,
    price,
    currency,
    featured_image: featuredImage,
  };

  if (id) {
    const { error } = await supabase.from("listings").update(payload).eq("id", id);
    if (error) {
      console.error("update listing error", error);
      throw error;
    }
  } else {
    const { error } = await supabase.from("listings").insert({
      ...payload,
      owner_id: user.id,
      tenant_id: userRow?.tenant_id || null,
    });
    if (error) {
      console.error("create listing error", error);
      throw error;
    }
  }

  revalidatePath("/listings");
}

export async function deleteListing(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) {
    console.error("delete listing error", error);
  }

  revalidatePath("/listings");
}

export async function addListingImage(formData: FormData) {
  const listingId = formData.get("listing_id")?.toString();
  const imageUrl = formData.get("image_url")?.toString();
  if (!listingId || !imageUrl) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("listing_images").insert({
    listing_id: listingId,
    storage_key: imageUrl,
    cdn_url: imageUrl,
  });

  if (error) {
    console.error("add listing image error", error);
  }

  revalidatePath("/listings");
}

