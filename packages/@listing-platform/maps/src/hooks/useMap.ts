'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { MapConfig, Coordinates, MapViewState, MapBounds } from '../types';

interface UseMapResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  map: unknown | null;
  isLoading: boolean;
  error: Error | null;
  viewState: MapViewState;
  setCenter: (center: Coordinates) => void;
  setZoom: (zoom: number) => void;
  fitBounds: (bounds: MapBounds, padding?: number) => void;
  flyTo: (center: Coordinates, zoom?: number) => void;
}

/**
 * Hook to initialize and control a map instance
 */
export function useMap(config: MapConfig): UseMapResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [viewState, setViewState] = useState<MapViewState>({
    center: config.center,
    zoom: config.zoom,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const initializeMap = async () => {
      setIsLoading(true);
      setError(null);

      try {
        switch (config.provider) {
          case 'mapbox':
            await initializeMapbox(containerRef.current!, config, mapRef, setViewState);
            break;
          case 'google':
            // Google Maps initialization would go here
            console.warn('Google Maps provider not yet implemented');
            break;
          case 'openstreetmap':
            // OpenStreetMap/Leaflet initialization would go here
            console.warn('OpenStreetMap provider not yet implemented');
            break;
          default:
            throw new Error(`Unknown map provider: ${config.provider}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize map'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      // Cleanup map instance
      if (mapRef.current && config.provider === 'mapbox') {
        const map = mapRef.current as { remove?: () => void };
        map.remove?.();
        mapRef.current = null;
      }
    };
  }, [config.provider, config.apiKey, config.style]);

  const setCenter = useCallback((center: Coordinates) => {
    setViewState(prev => ({ ...prev, center }));
    if (mapRef.current && config.provider === 'mapbox') {
      const map = mapRef.current as { setCenter?: (center: [number, number]) => void };
      map.setCenter?.([center.lng, center.lat]);
    }
  }, [config.provider]);

  const setZoom = useCallback((zoom: number) => {
    setViewState(prev => ({ ...prev, zoom }));
    if (mapRef.current && config.provider === 'mapbox') {
      const map = mapRef.current as { setZoom?: (zoom: number) => void };
      map.setZoom?.(zoom);
    }
  }, [config.provider]);

  const fitBounds = useCallback((bounds: MapBounds, padding = 50) => {
    if (mapRef.current && config.provider === 'mapbox') {
      const map = mapRef.current as { fitBounds?: (bounds: [[number, number], [number, number]], options: { padding: number }) => void };
      map.fitBounds?.(
        [[bounds.west, bounds.south], [bounds.east, bounds.north]],
        { padding }
      );
    }
  }, [config.provider]);

  const flyTo = useCallback((center: Coordinates, zoom?: number) => {
    if (mapRef.current && config.provider === 'mapbox') {
      const map = mapRef.current as { flyTo?: (options: { center: [number, number]; zoom?: number }) => void };
      map.flyTo?.({
        center: [center.lng, center.lat],
        zoom: zoom ?? viewState.zoom,
      });
    }
  }, [config.provider, viewState.zoom]);

  return {
    containerRef,
    map: mapRef.current,
    isLoading,
    error,
    viewState,
    setCenter,
    setZoom,
    fitBounds,
    flyTo,
  };
}

/**
 * Initialize Mapbox GL JS map
 */
async function initializeMapbox(
  container: HTMLElement,
  config: MapConfig,
  mapRef: React.MutableRefObject<unknown>,
  setViewState: React.Dispatch<React.SetStateAction<MapViewState>>
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const mapboxgl = await import('mapbox-gl').then(m => m.default);
  
  if (!config.apiKey) {
    throw new Error('Mapbox API key is required');
  }

  mapboxgl.accessToken = config.apiKey;

  const map = new mapboxgl.Map({
    container,
    style: config.style || 'mapbox://styles/mapbox/streets-v12',
    center: [config.center.lng, config.center.lat],
    zoom: config.zoom,
    minZoom: config.minZoom,
    maxZoom: config.maxZoom,
    interactive: config.interactive !== false,
  });

  map.on('move', () => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    
    setViewState({
      center: { lat: center.lat, lng: center.lng },
      zoom,
      bounds: bounds ? {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      } : undefined,
      pitch: map.getPitch(),
      bearing: map.getBearing(),
    });
  });

  if (config.showUserLocation) {
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      })
    );
  }

  map.addControl(new mapboxgl.NavigationControl());

  mapRef.current = map;

  // Wait for map to load
  await new Promise<void>((resolve) => {
    map.on('load', () => resolve());
  });
}
