'use client';

import { useState, useCallback } from 'react';
import type { GeocodingResult, ReverseGeocodingResult, Coordinates, MapProvider } from '../types';

interface UseGeocodeOptions {
  provider?: MapProvider;
  apiKey?: string;
}

interface UseGeocodeResult {
  geocode: (address: string) => Promise<GeocodingResult | null>;
  reverseGeocode: (coordinates: Coordinates) => Promise<ReverseGeocodingResult | null>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for geocoding addresses and reverse geocoding coordinates
 */
export function useGeocode(options: UseGeocodeOptions = {}): UseGeocodeResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const geocode = useCallback(async (address: string): Promise<GeocodingResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = options.provider || 'mapbox';
      
      switch (provider) {
        case 'mapbox':
          return await geocodeWithMapbox(address, options.apiKey);
        case 'google':
          // Google geocoding would go here
          throw new Error('Google geocoding not yet implemented');
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Geocoding failed');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options.provider, options.apiKey]);

  const reverseGeocode = useCallback(async (coordinates: Coordinates): Promise<ReverseGeocodingResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = options.provider || 'mapbox';
      
      switch (provider) {
        case 'mapbox':
          return await reverseGeocodeWithMapbox(coordinates, options.apiKey);
        case 'google':
          throw new Error('Google reverse geocoding not yet implemented');
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Reverse geocoding failed');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options.provider, options.apiKey]);

  return {
    geocode,
    reverseGeocode,
    isLoading,
    error,
  };
}

/**
 * Geocode using Mapbox Geocoding API
 */
async function geocodeWithMapbox(
  address: string, 
  apiKey?: string
): Promise<GeocodingResult | null> {
  const token = apiKey || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  if (!token) {
    throw new Error('Mapbox API key is required for geocoding');
  }

  const encodedAddress = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${token}&limit=1`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Geocoding request failed');
  }

  const data = await response.json();
  
  if (!data.features || data.features.length === 0) {
    return null;
  }

  const feature = data.features[0];
  const [lng, lat] = feature.center;
  
  // Parse context for address components
  const context = feature.context || [];
  const getContext = (type: string) => 
    context.find((c: { id: string; text: string }) => c.id.startsWith(type))?.text;

  return {
    lat,
    lng,
    formatted: feature.place_name,
    street: feature.text,
    city: getContext('place') || getContext('locality'),
    region: getContext('region'),
    postalCode: getContext('postcode'),
    country: getContext('country'),
    confidence: feature.relevance,
  };
}

/**
 * Reverse geocode using Mapbox Geocoding API
 */
async function reverseGeocodeWithMapbox(
  coordinates: Coordinates,
  apiKey?: string
): Promise<ReverseGeocodingResult | null> {
  const token = apiKey || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  if (!token) {
    throw new Error('Mapbox API key is required for reverse geocoding');
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.lng},${coordinates.lat}.json?access_token=${token}&limit=1`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Reverse geocoding request failed');
  }

  const data = await response.json();
  
  if (!data.features || data.features.length === 0) {
    return null;
  }

  const feature = data.features[0];
  const context = feature.context || [];
  const getContext = (type: string) => 
    context.find((c: { id: string; text: string }) => c.id.startsWith(type))?.text;

  return {
    formatted: feature.place_name,
    street: feature.text,
    city: getContext('place') || getContext('locality'),
    region: getContext('region'),
    postalCode: getContext('postcode'),
    country: getContext('country'),
  };
}
