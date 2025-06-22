import React from 'react';
import type { ImagePreviewProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';

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
  alt = 'Image preview',
  onRemove,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
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
            <button
              type="button"
              className="btn-secondary absolute top-2 right-2 px-3 py-1 text-xs rounded shadow"
              onClick={onRemove}
              aria-label="Remove Image"
            >
              Remove Image
            </button>
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