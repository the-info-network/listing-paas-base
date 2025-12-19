'use client';

import React, { ReactNode } from 'react';
import { useMap } from '../hooks/useMap';
import type { Coordinates, MapConfig, MapViewState, MapBounds } from '../types';

export interface MapHeadlessProps {
  config: MapConfig;
  renderMap: (props: MapRenderProps) => ReactNode;
  renderLoading?: () => ReactNode;
  renderError?: (error: Error) => ReactNode;
}

export interface MapRenderProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  map: unknown | null;
  viewState: MapViewState;
  setCenter: (center: Coordinates) => void;
  setZoom: (zoom: number) => void;
  fitBounds: (bounds: MapBounds, padding?: number) => void;
  flyTo: (center: Coordinates, zoom?: number) => void;
}

export function MapHeadless({
  config,
  renderMap,
  renderLoading,
  renderError,
}: MapHeadlessProps) {
  const {
    containerRef,
    map,
    isLoading,
    error,
    viewState,
    setCenter,
    setZoom,
    fitBounds,
    flyTo,
  } = useMap(config);

  if (isLoading && renderLoading) {
    return <>{renderLoading()}</>;
  }

  if (error && renderError) {
    return <>{renderError(error)}</>;
  }

  return (
    <>
      {renderMap({
        containerRef,
        map,
        viewState,
        setCenter,
        setZoom,
        fitBounds,
        flyTo,
      })}
    </>
  );
}
