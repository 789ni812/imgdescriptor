"use client";

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { ImageUploadProps } from '@/lib/types';

export function ImageUpload({ onImageSelect, maxSize = 10 * 1024 * 1024 }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.jpg'] },
    multiple: false,
    maxSize,
  });

  return (
    <div
      data-testid="image-upload"
      {...getRootProps()}
      className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer
        ${isDragActive ? 'border-primary bg-primary-light/10' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'}
        transition-colors duration-200 ease-in-out`}
    >
      <input {...getInputProps({ id: 'image-upload', 'aria-label': 'Upload an image' })} />
      <ArrowUpOnSquareIcon className="w-16 h-16 text-gray-400 heroicon-stroke-1" />
      <p className="mt-4 text-lg text-gray-400">
        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
      </p>
      <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
    </div>
  );
} 