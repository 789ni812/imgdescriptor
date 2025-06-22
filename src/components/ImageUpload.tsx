"use client";

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageUploadProps } from '@/lib/types';

// Simple SVG Upload Icon
const UploadIcon = () => (
  <svg
    data-testid="upload-icon"
    className="w-10 h-10 mb-4 text-gray-500"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 16"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
    />
  </svg>
);

export function ImageUpload({ onImageSelect, maxSize = 10 * 1024 * 1024 }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      return;
    }
    const file = acceptedFiles[0];
    onImageSelect(file);
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize,
    multiple: false,
    validator: (file) => {
      if (file.size > maxSize) {
        console.error(`File is too large. Max size is ${maxSize / 1024 / 1024}MB.`);
        return {
          code: 'file-too-large',
          message: `File is too large. Max size is ${maxSize / 1024 / 1024}MB.`,
        };
      }
      return null;
    },
  });

  return (
    <div
      {...getRootProps()}
      data-testid="dropzone"
      className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-gray-600 hover:border-primary'
      }`}
    >
      <input {...getInputProps({ id: 'image-upload', 'aria-label': 'Upload an image' })} className="sr-only" />
      <UploadIcon />
      <p className="mb-2 text-sm text-gray-400">
        <span className="font-semibold">Drag & drop your image here</span>
      </p>
      <p className="text-xs text-gray-500">or click to select a file</p>
    </div>
  );
} 