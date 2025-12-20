'use client';

import React, { useEffect, useRef, ReactNode } from 'react';
import type { Coordinates } from '../types';

export interface MarkerHeadlessProps {
  position: Coordinates;
  map: unknown;
  renderMarker: (props: MarkerRenderProps) => ReactNode;
  draggable?: boolean;
  onDragEnd?: (position: Coordinates) => void;
}

export interface MarkerRenderProps {
  position: Coordinates;
  element: HTMLDivElement | null;
  updatePosition: (position: Coordinates) => void;
}

export function MarkerHeadless({
  position,
  map,
  renderMarker,
  draggable = false,
  onDragEnd,
}: MarkerHeadlessProps) {
  const markerRef = useRef<unknown>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [currentPosition, setCurrentPosition] = React.useState(position);

  useEffect(() => {
    if (!map) return;

    const initMarker = async () => {
      const mapboxgl = await import('mapbox-gl').then(m => m.default);

      // Create custom element for marker
      const el = document.createElement('div');
      el.className = 'headless-marker';
      elementRef.current = el;

      const marker = new mapboxgl.Marker({
        element: el,
        draggable,
      })
        .setLngLat([position.lng, position.lat])
        .addTo(map as mapboxgl.Map);

      if (draggable && onDragEnd) {
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          const newPos = { lat: lngLat.lat, lng: lngLat.lng };
          setCurrentPosition(newPos);
          onDragEnd(newPos);
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
  }, [map, draggable]);

  useEffect(() => {
    if (markerRef.current) {
      const marker = markerRef.current as { setLngLat?: (coords: [number, number]) => void };
      marker.setLngLat?.([position.lng, position.lat]);
      setCurrentPosition(position);
    }
  }, [position.lat, position.lng]);

  const updatePosition = (newPosition: Coordinates) => {
    if (markerRef.current) {
      const marker = markerRef.current as { setLngLat?: (coords: [number, number]) => void };
      marker.setLngLat?.([newPosition.lng, newPosition.lat]);
      setCurrentPosition(newPosition);
    }
  };

  return (
    <>
      {renderMarker({
        position: currentPosition,
        element: elementRef.current,
        updatePosition,
      })}
    </>
  );
}
