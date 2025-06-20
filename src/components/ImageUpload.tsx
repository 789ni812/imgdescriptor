import React, { useState, useCallback } from 'react';
import type { ImageUploadProps } from '@/lib/types';

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onError,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize = 10 * 1024 * 1024, // 10 MB
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > maxSize) {
        onError?.(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
        return;
      }
      if (!acceptedFormats.includes(file.type)) {
        onError?.(`Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`);
        return;
      }
      onImageSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <label
      htmlFor="image-upload"
      className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      aria-label="Upload an image"
    >
      <div className="text-center">
        <p className="text-gray-500">Drag & drop your image here, or click to select</p>
      </div>
      <input
        id="image-upload"
        name="image-upload"
        type="file"
        className="sr-only"
        onChange={(e) => handleFileChange(e.target.files)}
        accept={acceptedFormats.join(',')}
      />
    </label>
  );
}; 