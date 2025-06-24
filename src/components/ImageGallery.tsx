import React from 'react';
import Image from 'next/image';

export interface GalleryImage {
  id: string;
  url: string;
  description: string;
  turn: number;
}

export interface ImageGalleryProps {
  images?: GalleryImage[];
  imageUrls?: string[]; // For backward compatibility
  onImageClick?: (image: GalleryImage) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images = [], 
  imageUrls = [], 
  onImageClick 
}) => {
  // Convert legacy imageUrls to new format if no images provided
  const displayImages = images.length > 0 
    ? images 
    : imageUrls.map((url, idx) => ({
        id: `legacy-${idx}`,
        url,
        description: `Uploaded image ${idx + 1}`,
        turn: idx + 1
      }));

  if (!displayImages || displayImages.length === 0) {
    return (
      <div 
        className="text-gray-400 text-center py-8"
        role="region" 
        aria-label="image gallery"
      >
        No images uploaded yet
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      role="region" 
      aria-label="image gallery"
    >
      {displayImages.slice(0, 3).map((image) => (
        <div 
          key={image.id} 
          className="rounded overflow-hidden border border-gray-700 bg-gray-800 p-4 cursor-pointer hover:border-gray-500 transition-colors"
          onClick={() => onImageClick?.(image)}
        >
          <div className="flex items-center justify-center mb-2">
            <Image
              src={image.url}
              alt={image.description}
              width={128}
              height={128}
              className="object-contain max-h-32 max-w-full"
              data-testid="gallery-image"
            />
          </div>
          <div className="text-sm text-gray-300">
            <div className="font-semibold text-blue-400">Turn {image.turn}</div>
            <div className="text-xs mt-1 line-clamp-2">{image.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}; 