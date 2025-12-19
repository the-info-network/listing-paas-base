'use client';

import React, { useEffect, useRef } from 'react';
import type { NearbyListing } from '../types';

export interface ListingClusterProps {
  listings: NearbyListing[];
  onListingClick?: (listing: NearbyListing) => void;
  clusterRadius?: number;
  clusterColor?: string;
  markerColor?: string;
  map?: unknown; // Passed from parent Map component
}

export function ListingCluster({
  listings,
  onListingClick,
  clusterRadius = 50,
  clusterColor = '#3B82F6',
  markerColor = '#10B981',
  map,
}: ListingClusterProps) {
  const sourceIdRef = useRef<string>('listing-clusters');

  useEffect(() => {
    if (!map || listings.length === 0) return;

    const addClusters = async () => {
      const mapInstance = map as {
        getSource?: (id: string) => unknown;
        addSource?: (id: string, source: unknown) => void;
        addLayer?: (layer: unknown) => void;
        removeLayer?: (id: string) => void;
        removeSource?: (id: string) => void;
        on?: (event: string, layer: string, callback: (e: unknown) => void) => void;
        off?: (event: string, layer: string, callback: (e: unknown) => void) => void;
        getCanvas?: () => { style: { cursor: string } };
      };

      // Wait for map to be loaded
      await new Promise<void>((resolve) => {
        const checkLoaded = () => {
          const isLoaded = (map as { isStyleLoaded?: () => boolean }).isStyleLoaded?.();
          if (isLoaded) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });

      const sourceId = sourceIdRef.current;

      // Remove existing if present
      try {
        if (mapInstance.getSource?.(sourceId)) {
          mapInstance.removeLayer?.(`${sourceId}-clusters`);
          mapInstance.removeLayer?.(`${sourceId}-cluster-count`);
          mapInstance.removeLayer?.(`${sourceId}-unclustered`);
          mapInstance.removeSource?.(sourceId);
        }
      } catch {
        // Ignore errors
      }

      // Create GeoJSON from listings
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: listings.map((listing) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [listing.location.lng, listing.location.lat],
          },
          properties: {
            id: listing.id,
            title: listing.title,
            distanceKm: listing.distanceKm,
          },
        })),
      };

      // Add clustered source
      mapInstance.addSource?.(sourceId, {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius,
      });

      // Add cluster circles
      mapInstance.addLayer?.({
        id: `${sourceId}-clusters`,
        type: 'circle',
        source: sourceId,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            clusterColor,
            10, '#F59E0B',
            50, '#EF4444',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10, 30,
            50, 40,
          ],
        },
      });

      // Add cluster count labels
      mapInstance.addLayer?.({
        id: `${sourceId}-cluster-count`,
        type: 'symbol',
        source: sourceId,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Add unclustered point markers
      mapInstance.addLayer?.({
        id: `${sourceId}-unclustered`,
        type: 'circle',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': markerColor,
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Handle click on unclustered points
      if (onListingClick) {
        const handleClick = (e: unknown) => {
          const event = e as { features?: { properties?: { id: string } }[] };
          const feature = event.features?.[0];
          if (feature?.properties?.id) {
            const listing = listings.find(l => l.id === feature.properties!.id);
            if (listing) {
              onListingClick(listing);
            }
          }
        };

        mapInstance.on?.('click', `${sourceId}-unclustered`, handleClick);

        // Change cursor on hover
        mapInstance.on?.('mouseenter', `${sourceId}-unclustered`, () => {
          const canvas = mapInstance.getCanvas?.();
          if (canvas) {
            canvas.style.cursor = 'pointer';
          }
        });

        mapInstance.on?.('mouseleave', `${sourceId}-unclustered`, () => {
          const canvas = mapInstance.getCanvas?.();
          if (canvas) {
            canvas.style.cursor = '';
          }
        });
      }
    };

    addClusters();

    return () => {
      const mapInstance = map as {
        getSource?: (id: string) => unknown;
        removeLayer?: (id: string) => void;
        removeSource?: (id: string) => void;
      };

      const sourceId = sourceIdRef.current;

      try {
        if (mapInstance.getSource?.(sourceId)) {
          mapInstance.removeLayer?.(`${sourceId}-clusters`);
          mapInstance.removeLayer?.(`${sourceId}-cluster-count`);
          mapInstance.removeLayer?.(`${sourceId}-unclustered`);
          mapInstance.removeSource?.(sourceId);
        }
      } catch {
        // Map may have been removed
      }
    };
  }, [map, listings, clusterRadius, clusterColor, markerColor, onListingClick]);

  return null;
}
