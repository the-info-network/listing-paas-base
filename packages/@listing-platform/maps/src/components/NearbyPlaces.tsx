'use client';

import React from 'react';
import { cn } from '../utils/cn';
import type { NearbyPlace } from '../types';

export interface NearbyPlacesProps {
  places: NearbyPlace[];
  variant?: 'list' | 'compact' | 'icons';
  onPlaceClick?: (place: NearbyPlace) => void;
  className?: string;
}

const placeTypeIcons: Record<string, string> = {
  school: '🏫',
  hospital: '🏥',
  restaurant: '🍽️',
  transit: '🚇',
  park: '🌳',
  shopping: '🛒',
  default: '📍',
};

const placeTypeLabels: Record<string, string> = {
  school: 'Schools',
  hospital: 'Healthcare',
  restaurant: 'Dining',
  transit: 'Transit',
  park: 'Parks',
  shopping: 'Shopping',
};

export function NearbyPlaces({
  places,
  variant = 'list',
  onPlaceClick,
  className,
}: NearbyPlacesProps) {
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // Group places by type
  const groupedPlaces = places.reduce((acc, place) => {
    const type = place.placeType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(place);
    return acc;
  }, {} as Record<string, NearbyPlace[]>);

  if (variant === 'icons') {
    // Show just icons summary
    const typeCounts = Object.entries(groupedPlaces).map(([type, items]) => ({
      type,
      count: items.length,
      icon: placeTypeIcons[type] || placeTypeIcons.default,
    }));

    return (
      <div className={cn('nearby-places flex flex-wrap gap-3', className)}>
        {typeCounts.map(({ type, count, icon }) => (
          <div
            key={type}
            className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
            title={`${count} ${placeTypeLabels[type] || type} nearby`}
          >
            <span>{icon}</span>
            <span className="text-gray-600">{count}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    // Show compact list
    return (
      <div className={cn('nearby-places space-y-2', className)}>
        {places.slice(0, 5).map((place) => (
          <button
            key={place.id}
            onClick={() => onPlaceClick?.(place)}
            className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-gray-50"
          >
            <span className="text-lg">
              {placeTypeIcons[place.placeType] || placeTypeIcons.default}
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {place.name}
              </p>
            </div>
            <span className="text-xs text-gray-500">
              {formatDistance(place.distanceMeters)}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Default list view grouped by type
  return (
    <div className={cn('nearby-places space-y-4', className)}>
      {Object.entries(groupedPlaces).map(([type, typePlaces]) => (
        <div key={type}>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <span>{placeTypeIcons[type] || placeTypeIcons.default}</span>
            {placeTypeLabels[type] || type}
          </h4>
          <ul className="space-y-1">
            {typePlaces.map((place) => (
              <li key={place.id}>
                <button
                  onClick={() => onPlaceClick?.(place)}
                  className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-900">{place.name}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistance(place.distanceMeters)}
                    {place.travelTimeMinutes && (
                      <> · {place.travelTimeMinutes} min</>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
