/**
 * Types for Favorites SDK
 */

export interface SavedListing {
  id: string;
  userId: string;
  listingId: string;
  collectionId?: string;
  notes?: string;
  createdAt: string;
  listing?: ListingSummary;
}

export interface ListingSummary {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string;
  price?: number;
  currency?: string;
  location?: {
    city?: string;
    region?: string;
  };
  rating?: number;
  reviewCount?: number;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  coverImage?: string;
  listingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  searchParams: SearchParams;
  notificationFrequency: NotificationFrequency;
  isActive: boolean;
  lastNotifiedAt?: string;
  newResultsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchParams {
  query?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  filters?: Record<string, unknown>;
  sortBy?: string;
}

export type NotificationFrequency = 'instant' | 'daily' | 'weekly' | 'never';

export interface FavoritesFilters {
  collectionId?: string;
  sortBy?: 'created_at' | 'listing_title' | 'listing_price';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface CreateSavedSearchInput {
  name: string;
  searchParams: SearchParams;
  notificationFrequency?: NotificationFrequency;
}
