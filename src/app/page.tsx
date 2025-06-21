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
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-gray-900 text-white">
      <div className="w-full max-w-6xl z-10">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold">AI Image Describer</h1>
          <p className="text-xl text-gray-400 mt-2">
            Upload an image and let our AI describe it for you.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Image Upload and Preview */}
          <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-lg shadow-lg">
            <ImageUpload onImageSelect={handleImageSelect} />
            <ImagePreview imageUrl={previewUrl} isLoading={false} /> {/* No longer show loading here */}
          </div>

          {/* Right Column: Description Display */}
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg min-h-[300px]">
            <DescriptionDisplay description={description} isLoading={isLoading} error={error} />
            {description && !isLoading && !error && (
              <div className="mt-4 text-center">
                <Button onClick={handleGenerateStory} disabled={isStoryLoading}>
                  {isStoryLoading ? 'Generating Story...' : 'Generate a Story'}
                </Button>
              </div>
            )}
            <StoryDisplay story={story} isLoading={isStoryLoading} error={storyError} />
          </div>
        </div>
      </div>
    </main>
  );
}
