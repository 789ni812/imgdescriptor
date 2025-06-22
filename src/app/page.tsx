"use client";

import { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ImagePreview } from '@/components/ImagePreview';
import { DescriptionDisplay } from '@/components/DescriptionDisplay';
import { StoryDisplay } from '@/components/StoryDisplay';
import { Button } from '@/components/ui/Button';

export default function Home() {
  // State for the selected image file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // State for the image preview URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // State for the AI-generated description
  const [description, setDescription] = useState<string | null>(null);
  // State for loading indicators
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State for any errors
  const [error, setError] = useState<string | null>(null);

  // New state for the story generation
  const [story, setStory] = useState<string | null>(null);
  const [isStoryLoading, setIsStoryLoading] = useState<boolean>(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  // Effect to clean up the object URL
  useEffect(() => {
    // This function will be called when the component unmounts or when previewUrl changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageSelect = (file: File) => {
    // If there's an existing preview URL, revoke it before creating a new one
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Reset all states for a new analysis
    setDescription(null);
    setError(null);
    setIsLoading(true);
    setStory(null);
    setStoryError(null);
    setIsStoryLoading(false);

    // Convert file to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      try {
        const base64Image = (reader.result as string).split(',')[1];
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            prompt: 'Describe this image in detail.',
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setDescription(data.description);
        } else {
          setError(data.error || 'An unknown error occurred.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`An unexpected error occurred: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read the image file.');
      setIsLoading(false);
    };
  };

  const handleGenerateStory = async () => {
    if (!description) {
      setStoryError('Cannot generate a story without a description.');
      return;
    }

    setIsStoryLoading(true);
    setStory(null);
    setStoryError(null);

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStory(data.story);
      } else {
        setStoryError(data.error || 'An unknown error occurred while generating the story.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setStoryError(`An unexpected error occurred: ${errorMessage}`);
    } finally {
      setIsStoryLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div 
        data-testid="main-content-container"
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Image Upload and Preview */}
          <div className="space-y-6">
            <ImageUpload onImageSelect={handleImageSelect} />
            <ImagePreview 
              imageUrl={previewUrl} 
              isLoading={isLoading} 
              onRemove={() => {
                setPreviewUrl(null);
                setSelectedFile(null);
                setDescription(null);
                setError(null);
                setStory(null);
                setStoryError(null);
              }}
            />
          </div>

          {/* Right Column: Description Display and Story */}
          <div className="space-y-6">
            <DescriptionDisplay description={description} isLoading={isLoading} error={error} />
            
            {description && !isLoading && !error && (
              <div className="text-center">
                <Button onClick={handleGenerateStory} disabled={isStoryLoading}>
                  {isStoryLoading ? 'Generating Story...' : 'Generate a Story'}
                </Button>
              </div>
            )}

            { (isStoryLoading || story || storyError) && (
              <StoryDisplay story={story} isLoading={isStoryLoading} error={storyError} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
