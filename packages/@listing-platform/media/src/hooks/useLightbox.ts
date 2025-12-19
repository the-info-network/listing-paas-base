'use client';

import { useState, useCallback } from 'react';
import type { MediaImage } from '../types';

interface UseLightboxResult {
  isOpen: boolean;
  currentIndex: number;
  currentImage: MediaImage | null;
  open: (index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

export function useLightbox(images: MediaImage[]): UseLightboxResult {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const open = useCallback((index: number) => { setCurrentIndex(index); setIsOpen(true); }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const next = useCallback(() => setCurrentIndex(i => (i + 1) % images.length), [images.length]);
  const prev = useCallback(() => setCurrentIndex(i => (i - 1 + images.length) % images.length), [images.length]);
  const goTo = useCallback((index: number) => setCurrentIndex(index), []);

  return { isOpen, currentIndex, currentImage: isOpen ? images[currentIndex] : null, open, close, next, prev, goTo };
}
