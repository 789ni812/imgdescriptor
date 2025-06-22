"use client";
import React from 'react';
import { Button } from './ui/Button';
import type { ImagePreviewProps } from '@/lib/types';
import { ErrorMessage } from './ui/ErrorMessage';

const PlaceholderIcon = () => (
  <svg
    data-testid="placeholder-icon"
    className="w-12 h-12 mb-2 text-gray-300"
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
  isLoading,
  onRemove,
  alt = 'Image preview',
  error,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <svg
          className="animate-spin text-white w-12 h-12 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          data-testid="loading-spinner-svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      );
    }

    if (error) {
      return <ErrorMessage message={error} />;
    }

    if (imageUrl) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          {onRemove && (
            <Button
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={onRemove}
              aria-label="Remove Image"
            >
              Remove Image
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <PlaceholderIcon />
        <p className="text-base font-medium">Upload an image to see preview</p>
      </div>
    );
  };

  return (
    <div
      data-testid="image-preview-container"
      className="w-full h-64 bg-white shadow-lg rounded-xl flex items-center justify-center overflow-hidden"
    >
      {renderContent()}
    </div>
  );
}; 