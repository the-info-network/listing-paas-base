/**
 * Types for Search SDK
 */

export interface SearchFilters {
  query?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  amenities?: string[];
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  description?: string;
  featuredImage?: string;
  price?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
  category?: string;
  highlights?: string[];
  createdAt: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  facets?: Facet[];
}

export interface Facet {
  name: string;
  field: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  options: FacetOption[];
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
  selected?: boolean;
}

export interface RangeFacet extends Facet {
  type: 'range';
  min: number;
  max: number;
  step?: number;
}

export interface SearchSuggestion {
  type: 'query' | 'listing' | 'category' | 'location';
  value: string;
  label: string;
  sublabel?: string;
  icon?: string;
  url?: string;
}

export interface SearchConfig {
  enableFullTextSearch: boolean;
  enableFuzzySearch: boolean;
  enableVoiceSearch: boolean;
  enableImageSearch: boolean;
  enableAIRecommendations: boolean;
  cacheResults: boolean;
  cacheDuration: number;
}
