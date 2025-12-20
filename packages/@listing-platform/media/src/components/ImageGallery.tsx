'use client';

import React from 'react';
import { cn } from '../utils/cn';
import type { MediaImage } from '../types';

export interface ImageGalleryProps {
  images: MediaImage[];
  onImageClick?: (index: number) => void;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ImageGallery({ images, onImageClick, columns = 3, className }: ImageGalleryProps) {
  const gridCols = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };

  if (images.length === 0) {
    return <div className={cn('rounded-lg border-2 border-dashed border-gray-200 p-8 text-center text-gray-500', className)}>No images</div>;
  }

  return (
    <div className={cn('grid gap-2', gridCols[columns], className)}>
      {images.map((image, index) => (
        <button
          key={image.id}
          onClick={() => onImageClick?.(index)}
          className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
        >
          <img src={image.thumbnailUrl || image.url} alt={image.alt || ''} className="h-full w-full object-cover transition-transform hover:scale-105" />
        </button>
      ))}
    </div>
  );
}
