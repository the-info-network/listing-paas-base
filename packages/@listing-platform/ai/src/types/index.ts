/**
 * Types for AI SDK
 */
export interface Recommendation {
  listingId: string;
  score: number;
  reason?: string;
  listing: RecommendedListing;
}

export interface RecommendedListing {
  id: string;
  title: string;
  imageUrl?: string;
  price?: number;
  location?: string;
}

export type GenerationType = 'title' | 'description' | 'summary' | 'tags' | 'seo';

export interface GenerationInput {
  type: GenerationType;
  context: Record<string, unknown>;
  maxLength?: number;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
}

export interface GenerationResult {
  content: string;
  alternatives?: string[];
  tokens?: number;
}

export interface ImageAnalysis {
  labels: string[];
  objects: DetectedObject[];
  colors: string[];
  suggestedCategory?: string;
}

export interface DetectedObject {
  name: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface SimilarListing {
  listingId: string;
  similarity: number;
  listing: RecommendedListing;
}
