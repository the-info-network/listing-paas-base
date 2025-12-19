'use client';

import React, { useEffect, useRef } from 'react';
import type { ServiceArea, Coordinates } from '../types';

export interface ServiceAreaOverlayProps {
  serviceArea: ServiceArea;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  map?: unknown; // Passed from parent Map component
}

export function ServiceAreaOverlay({
  serviceArea,
  fillColor = '#3B82F6',
  fillOpacity = 0.2,
  strokeColor = '#3B82F6',
  strokeWidth = 2,
  map,
}: ServiceAreaOverlayProps) {
  const sourceIdRef = useRef<string>(`service-area-${serviceArea.id}`);

  useEffect(() => {
    if (!map) return;

    const addServiceArea = async () => {
      const mapInstance = map as {
        getSource?: (id: string) => unknown;
        addSource?: (id: string, source: unknown) => void;
        addLayer?: (layer: unknown) => void;
        removeLayer?: (id: string) => void;
        removeSource?: (id: string) => void;
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
      const fillLayerId = `${sourceId}-fill`;
      const strokeLayerId = `${sourceId}-stroke`;

      // Remove existing layers/source if they exist
      if (mapInstance.getSource?.(sourceId)) {
        mapInstance.removeLayer?.(fillLayerId);
        mapInstance.removeLayer?.(strokeLayerId);
        mapInstance.removeSource?.(sourceId);
      }

      let geometry: GeoJSON.Geometry;

      if (serviceArea.areaType === 'radius' && serviceArea.center && serviceArea.radiusKm) {
        // Create a circle polygon for radius type
        geometry = createCirclePolygon(serviceArea.center, serviceArea.radiusKm);
      } else if (serviceArea.geometry) {
        geometry = serviceArea.geometry;
      } else {
        console.warn('Service area has no valid geometry');
        return;
      }

      // Add source
      mapInstance.addSource?.(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry,
          properties: {
            id: serviceArea.id,
            name: serviceArea.areaName,
          },
        },
      });

      // Add fill layer
      mapInstance.addLayer?.({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': fillColor,
          'fill-opacity': fillOpacity,
        },
      });

      // Add stroke layer
      mapInstance.addLayer?.({
        id: strokeLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': strokeColor,
          'line-width': strokeWidth,
        },
      });
    };

    addServiceArea();

    return () => {
      const mapInstance = map as {
        getSource?: (id: string) => unknown;
        removeLayer?: (id: string) => void;
        removeSource?: (id: string) => void;
      };

      const sourceId = sourceIdRef.current;
      const fillLayerId = `${sourceId}-fill`;
      const strokeLayerId = `${sourceId}-stroke`;

      try {
        if (mapInstance.getSource?.(sourceId)) {
          mapInstance.removeLayer?.(fillLayerId);
          mapInstance.removeLayer?.(strokeLayerId);
          mapInstance.removeSource?.(sourceId);
        }
      } catch {
        // Map may have been removed
      }
    };
  }, [map, serviceArea, fillColor, fillOpacity, strokeColor, strokeWidth]);

  return null;
}

/**
 * Create a GeoJSON polygon approximating a circle
 */
function createCirclePolygon(center: Coordinates, radiusKm: number, points = 64): GeoJSON.Polygon {
  const coords: [number, number][] = [];
  const earthRadius = 6371; // km

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    
    const lat = center.lat + (radiusKm / earthRadius) * (180 / Math.PI) * Math.sin(angle);
    const lng = center.lng + (radiusKm / earthRadius) * (180 / Math.PI) * Math.cos(angle) / Math.cos(center.lat * Math.PI / 180);
    
    coords.push([lng, lat]);
  }

  return {
    type: 'Polygon',
    coordinates: [coords],
  };
}
