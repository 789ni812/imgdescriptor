import React from 'react';
import Image from 'next/image';

export interface ImageGalleryProps {
  imageUrls: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ imageUrls }) => {
  if (!imageUrls || imageUrls.length === 0) {
    return <div className="text-gray-400 text-center py-8">No images uploaded yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {imageUrls.slice(0, 3).map((url, idx) => (
        <div key={url} className="rounded overflow-hidden border border-gray-700 bg-gray-800 flex items-center justify-center p-2">
          <Image
            src={url}
            alt={`Uploaded image ${idx + 1}`}
            width={128}
            height={128}
            className="object-contain max-h-32 max-w-full"
            data-testid="gallery-image"
          />
        </div>
      ))}
    </div>
  );
}; 