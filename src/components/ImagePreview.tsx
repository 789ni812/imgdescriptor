"use client";
import React from 'react';
import Image from 'next/image';
import { Button } from './ui/Button';
import type { ImagePreviewProps } from '@/lib/types';
import { Card, CardContent } from './ui/card';

const PlaceholderIcon = () => (
  <svg
    data-testid="placeholder-icon"
    className="w-12 h-12 mb-2 text-muted-foreground"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="9" cy="9" r="2" fill="currentColor" />
    <path d="M21 17l-5-5-4 4-7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  onRemove,
  alt = 'Image preview',
}) => {
  return (
    <Card data-testid="image-preview-container" className="w-full h-64 overflow-hidden">
      <CardContent className="p-0 w-full h-full flex items-center justify-center relative">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={alt}
              width={256}
              height={256}
              className="object-contain"
            />
            {onRemove && (
              <Button
                variant="destructive"
                className="absolute top-2 right-2 z-10"
                onClick={onRemove}
                aria-label="Upload Image"
              >
                Upload Image
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <PlaceholderIcon />
            <p className="text-base font-medium">Upload an image to see preview</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};