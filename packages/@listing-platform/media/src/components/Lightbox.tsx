'use client';

import React, { useEffect } from 'react';
import { cn } from '../utils/cn';
import type { MediaImage } from '../types';

export interface LightboxProps {
  images: MediaImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Lightbox({ images, currentIndex, isOpen, onClose, onNext, onPrev }: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen) return null;
  const image = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 text-white text-4xl hover:opacity-70">‹</button>
      <img src={image.url} alt={image.alt || ''} className="max-h-[90vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} />
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 text-white text-4xl hover:opacity-70">›</button>
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl hover:opacity-70">×</button>
      <div className="absolute bottom-4 text-white text-sm">{currentIndex + 1} / {images.length}</div>
    </div>
  );
}
