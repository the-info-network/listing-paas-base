'use client';

import React, { useEffect, useRef } from 'react';
import type { Coordinates } from '../types';

export interface MarkerProps {
  position: Coordinates;
  title?: string;
  popup?: React.ReactNode | string;
  color?: string;
  draggable?: boolean;
  onClick?: () => void;
  onDragEnd?: (position: Coordinates) => void;
  map?: unknown; // Passed from parent Map component
}

export function Marker({
  position,
  title,
  popup,
  color = '#3B82F6',
  draggable = false,
  onClick,
  onDragEnd,
  map,
}: MarkerProps) {
  const markerRef = useRef<unknown>(null);
  const popupRef = useRef<unknown>(null);

  useEffect(() => {
    if (!map) return;

    const initMarker = async () => {
      const mapboxgl = await import('mapbox-gl').then(m => m.default);

      // Create marker element
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundColor = color;
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';

      const marker = new mapboxgl.Marker({
        element: el,
        draggable,
      })
        .setLngLat([position.lng, position.lat])
        .addTo(map as mapboxgl.Map);

      if (title || popup) {
        const popupContent = typeof popup === 'string' 
          ? popup 
          : popup 
            ? '<div class="marker-popup"></div>' 
            : title || '';

        const mapboxPopup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(popupContent);
        
        marker.setPopup(mapboxPopup);
        popupRef.current = mapboxPopup;
      }

      if (onClick) {
        el.addEventListener('click', onClick);
      }

      if (draggable && onDragEnd) {
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          onDragEnd({ lat: lngLat.lat, lng: lngLat.lng });
        });
      }

      markerRef.current = marker;
    };

    initMarker();

    return () => {
      if (markerRef.current) {
        const marker = markerRef.current as { remove?: () => void };
        marker.remove?.();
        markerRef.current = null;
      }
    };
  }, [map, color, draggable]);

  // Update position when it changes
  useEffect(() => {
    if (markerRef.current) {
      const marker = markerRef.current as { setLngLat?: (coords: [number, number]) => void };
      marker.setLngLat?.([position.lng, position.lat]);
    }
  }, [position.lat, position.lng]);

  return null;
}
