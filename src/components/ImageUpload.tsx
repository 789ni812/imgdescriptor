"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { ImageUploadProps } from '@/lib/types';
import { CustomPromptInput } from './CustomPromptInput';
import { DEFAULT_IMAGE_DESCRIPTION_PROMPT } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';

export function ImageUpload({ onImageSelect, maxSize = 10 * 1024 * 1024, disabled = false }: ImageUploadProps) {
  const [customPrompt, setCustomPrompt] = useState('Analyze the architectural elements');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && !disabled) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, [disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.jpg'] },
    multiple: false,
    maxSize,
    disabled,
  });

  const handlePromptChange = (prompt: string) => {
    if (!disabled) {
      setCustomPrompt(prompt);
    }
  };

  const uploadImageToApi = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.url;
    } catch {
      // Optionally show error to user
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleUploadWithPrompt = async (prompt: string) => {
    if (selectedFile && !disabled) {
      const url = await uploadImageToApi(selectedFile);
      if (url) {
        onImageSelect({ url, file: selectedFile }, prompt);
      }
    }
  };

  const handleUploadWithDefaultPrompt = () => handleUploadWithPrompt(DEFAULT_IMAGE_DESCRIPTION_PROMPT);
  const handleUploadWithCustomPrompt = () => handleUploadWithPrompt(customPrompt);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed">
        <CardContent className="p-8">
          <div
            data-testid="image-upload"
            {...getRootProps()}
            className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ease-in-out
              ${disabled 
                ? 'border-border bg-muted/30 cursor-not-allowed opacity-50' 
                : isDragActive 
                  ? 'border-primary bg-primary/10 cursor-pointer' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
              }`}
          >
            <input {...getInputProps({ id: 'image-upload', 'aria-label': 'Upload an image' })} />
            <div style={{ width: '50px', height: '50px' }}>
              <ArrowUpOnSquareIcon className="w-full h-full text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
          </div>
        </CardContent>
      </Card>
      
      <CustomPromptInput 
        onPromptChange={handlePromptChange}
        value={customPrompt}
        disabled={disabled}
      />

      {selectedFile && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
            <div className="flex gap-4">
              <Button
                onClick={handleUploadWithDefaultPrompt}
                disabled={disabled || uploading}
                variant="default"
                className="flex-1"
              >
                {uploading ? 'Uploading...' : 'Upload with Default Prompt'}
              </Button>
              <Button
                onClick={handleUploadWithCustomPrompt}
                disabled={disabled || uploading}
                variant="secondary"
                className="flex-1"
              >
                {uploading ? 'Uploading...' : 'Upload with Custom Prompt'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 