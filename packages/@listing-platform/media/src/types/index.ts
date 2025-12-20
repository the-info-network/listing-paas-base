/**
 * Types for Media SDK
 */

export interface MediaImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
  order?: number;
}

export interface MediaVideo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  duration?: number;
  mimeType?: string;
}

export interface VirtualTourData {
  id: string;
  panoramaUrl: string;
  thumbnailUrl?: string;
  title?: string;
  hotspots?: Hotspot[];
}

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  targetSceneId?: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export interface ImageUploadOptions {
  maxFiles?: number;
  maxSize?: number;
  acceptedFormats?: string[];
  generateThumbnails?: boolean;
}
