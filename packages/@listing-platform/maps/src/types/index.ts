/**
 * Types for Maps SDK
 */

export type MapProvider = 'mapbox' | 'google' | 'openstreetmap';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapConfig {
  provider: MapProvider;
  apiKey?: string;
  center: Coordinates;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  style?: string;
  clustering?: boolean;
  clusterRadius?: number;
  showUserLocation?: boolean;
  enableDirections?: boolean;
  interactive?: boolean;
}

export interface MapMarker {
  id: string;
  position: Coordinates;
  title?: string;
  description?: string;
  icon?: string | MarkerIcon;
  popup?: MarkerPopup;
  draggable?: boolean;
  onClick?: (marker: MapMarker) => void;
}

export interface MarkerIcon {
  url: string;
  size: [number, number];
  anchor?: [number, number];
}

export interface MarkerPopup {
  content: string | React.ReactNode;
  offset?: [number, number];
  closeButton?: boolean;
}

export interface ServiceArea {
  id: string;
  listingId: string;
  areaType: 'city' | 'region' | 'postal_code' | 'radius' | 'polygon';
  areaName: string;
  geometry?: GeoJSON.Geometry;
  radiusKm?: number;
  center?: Coordinates;
  city?: string;
  region?: string;
  country?: string;
  postalCodes?: string[];
  displayOrder: number;
  createdAt: string;
}

export interface NearbyPlace {
  id: string;
  listingId: string;
  placeType: 'school' | 'hospital' | 'restaurant' | 'transit' | 'park' | 'shopping' | string;
  name: string;
  location: Coordinates;
  address?: string;
  distanceMeters: number;
  travelTimeMinutes?: number;
  rating?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Neighborhood {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  city: string;
  region?: string;
  country: string;
  geometry?: GeoJSON.Polygon;
  centerPoint?: Coordinates;
  description?: string;
  highlights?: string[];
  demographics?: NeighborhoodDemographics;
  schoolRatings?: Record<string, number>;
  crimeIndex?: number;
  walkabilityScore?: number;
  transitScore?: number;
  featuredImage?: string;
  images?: string[];
  seoMetadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface NeighborhoodDemographics {
  population?: number;
  medianIncome?: number;
  medianAge?: number;
  householdSize?: number;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  formatted: string;
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  confidence?: number;
}

export interface ReverseGeocodingResult {
  formatted: string;
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

export interface NearbyListingsFilters {
  radiusKm?: number;
  limit?: number;
  category?: string;
  minRating?: number;
}

export interface NearbyListing {
  id: string;
  title: string;
  distanceKm: number;
  location: Coordinates;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewState {
  center: Coordinates;
  zoom: number;
  bounds?: MapBounds;
  pitch?: number;
  bearing?: number;
}

export interface ClusterProperties {
  cluster: boolean;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: string;
}

// React import for JSX types
import type React from 'react';
