'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ServiceArea } from '../types';

interface UseServiceAreaResult {
  serviceAreas: ServiceArea[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch service areas for a listing
 */
export function useServiceArea(listingId: string | null): UseServiceAreaResult {
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchServiceAreas = useCallback(async () => {
    if (!listingId) {
      setServiceAreas([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/${listingId}/service-areas`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch service areas');
      }

      const data = await response.json();
      
      const mappedAreas: ServiceArea[] = (data.service_areas || []).map((area: Record<string, unknown>) => ({
        id: area.id as string,
        listingId: area.listing_id as string,
        areaType: area.area_type as ServiceArea['areaType'],
        areaName: area.area_name as string,
        geometry: area.area_geometry as GeoJSON.Geometry | undefined,
        radiusKm: area.radius_km as number | undefined,
        center: area.center as { lat: number; lng: number } | undefined,
        city: area.city as string | undefined,
        region: area.region as string | undefined,
        country: area.country as string | undefined,
        postalCodes: area.postal_codes as string[] | undefined,
        displayOrder: area.display_order as number,
        createdAt: area.created_at as string,
      }));
      
      setServiceAreas(mappedAreas);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchServiceAreas();
  }, [fetchServiceAreas]);

  return {
    serviceAreas,
    isLoading,
    error,
    refetch: fetchServiceAreas,
  };
}
