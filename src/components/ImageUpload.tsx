"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { ImageUploadProps } from '@/lib/types';
import { CustomPromptInput } from './CustomPromptInput';
import { DEFAULT_IMAGE_DESCRIPTION_PROMPT } from '@/lib/constants';

export function ImageUpload({ onImageSelect, maxSize = 10 * 1024 * 1024 }: ImageUploadProps) {
  const [customPrompt, setCustomPrompt] = useState('Analyze the architectural elements');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.jpg'] },
    multiple: false,
    maxSize,
  });

  const handlePromptChange = (prompt: string) => {
    setCustomPrompt(prompt);
  };

  const handleUploadWithDefaultPrompt = () => {
    if (selectedFile) {
      onImageSelect(selectedFile, DEFAULT_IMAGE_DESCRIPTION_PROMPT);
    }
  };

  const handleUploadWithCustomPrompt = () => {
    if (selectedFile) {
      onImageSelect(selectedFile, customPrompt);
    }
  };

  return (
    <div className="space-y-6">
      <div
        data-testid="image-upload"
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer
          ${isDragActive ? 'border-primary bg-primary-light/10' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'}
          transition-colors duration-200 ease-in-out`}
      >
        <input {...getInputProps({ id: 'image-upload', 'aria-label': 'Upload an image' })} />
        <div style={{ width: '50px', height: '50px' }}>
          <ArrowUpOnSquareIcon className="w-full h-full text-gray-400 heroicon-stroke-1" />
        </div>
        <p className="mt-4 text-lg text-gray-400">
          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
      </div>
      
      <CustomPromptInput 
        onPromptChange={handlePromptChange}
        value={customPrompt}
      />

      {selectedFile && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Selected: {selectedFile.name}</p>
          <div className="flex space-x-4">
            <button
              onClick={handleUploadWithDefaultPrompt}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Upload with Default Prompt
            </button>
            <button
              onClick={handleUploadWithCustomPrompt}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Upload with Custom Prompt
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 