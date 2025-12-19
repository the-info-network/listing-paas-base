'use client';

import React, { useCallback, useRef } from 'react';
import { cn } from '../utils/cn';
import { useImageUpload } from '../hooks/useImageUpload';
import type { ImageUploadOptions } from '../types';

export interface ImageUploaderProps extends ImageUploadOptions {
  onUpload?: (urls: string[]) => void;
  className?: string;
}

export function ImageUploader({ onUpload, className, ...options }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploads, upload, isUploading } = useImageUpload(options);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const urls = await upload(Array.from(files));
    onUpload?.(urls);
  }, [upload, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={cn(
        'cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-blue-400',
        isUploading && 'pointer-events-none opacity-50',
        className
      )}
    >
      <input ref={inputRef} type="file" multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} className="hidden" />
      <div className="text-4xl mb-2">📷</div>
      <p className="text-gray-600">{isUploading ? 'Uploading...' : 'Drop images here or click to upload'}</p>
      {uploads.length > 0 && (
        <div className="mt-4 space-y-1 text-sm">
          {uploads.map((u, i) => (
            <div key={i} className={cn('flex justify-between', u.status === 'error' ? 'text-red-500' : u.status === 'completed' ? 'text-green-500' : 'text-gray-500')}>
              <span className="truncate">{u.file.name}</span>
              <span>{u.status === 'uploading' ? `${u.progress}%` : u.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
