import React from 'react';
import type { ImagePreviewProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  isLoading,
  alt = 'Image preview',
}) => {
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Image preview will appear here</p>
      </div>
    );
  };

  return (
    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
      {renderContent()}
    </div>
  );
}; 