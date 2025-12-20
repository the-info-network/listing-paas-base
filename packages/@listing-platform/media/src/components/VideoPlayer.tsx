'use client';

import React from 'react';
import { cn } from '../utils/cn';

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
}

export function VideoPlayer({ src, poster, autoPlay = false, controls = true, className }: VideoPlayerProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-black', className)}>
      <video src={src} poster={poster} autoPlay={autoPlay} controls={controls} className="h-full w-full" playsInline />
    </div>
  );
}
