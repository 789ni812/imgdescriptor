"use client";

import { useReducer, useEffect } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ImagePreview } from '@/components/ImagePreview';
import { DescriptionDisplay } from '@/components/DescriptionDisplay';
import { StoryDisplay } from '@/components/StoryDisplay';
import { Button } from '@/components/ui/Button';
import { DevDebugWrapper } from '@/components/dev/DevDebugWrapper';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useImageAnalysis } from '@/hooks/useImageAnalysis';
import { useStoryGeneration } from '@/hooks/useStoryGeneration';

export default function Home() {
  const { 
    description, 
    isDescriptionLoading, 
    error: descriptionError, 
    analyzeImage 
  } = useImageAnalysis();
  
  const { 
    story, 
    isStoryLoading, 
    storyError, 
    generateStory 
  } = useStoryGeneration();

  const [imageUrl, setImageUrl] = useReducer((_: string | null, newUrl: string | null) => {
    if (newUrl === null && _ !== null) {
      URL.revokeObjectURL(_);
    }
    return newUrl;
  }, null);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleImageSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    analyzeImage(file);
  };

  const handleGenerateStory = () => {
    if (description) {
      generateStory(description);
    }
  };

  const handleReset = () => {
    setImageUrl(null);
    // Future: The hooks could also expose reset functions
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div 
        data-testid="main-content-container"
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
          <div className="space-y-8" data-testid="input-column">
            {imageUrl ? (
              <DevDebugWrapper key="image-preview" filename="ImagePreview.tsx">
                <ImagePreview imageUrl={imageUrl} onRemove={handleReset} />
              </DevDebugWrapper>
            ) : (
              <DevDebugWrapper key="image-upload" filename="ImageUpload.tsx">
                <ImageUpload onImageSelect={handleImageSelect} />
              </DevDebugWrapper>
            )}
          </div>
          <div className="space-y-8" data-testid="output-column">
            {isDescriptionLoading && (
              <div className="flex justify-center items-center h-full min-h-[80px]">
                <LoadingSpinner />
              </div>
            )}
            {!isDescriptionLoading && (description || descriptionError) && (
              <DevDebugWrapper filename="DescriptionDisplay.tsx">
                <DescriptionDisplay description={description} error={descriptionError} />
              </DevDebugWrapper>
            )}
            {description && !isDescriptionLoading && !descriptionError && (
              <div className="text-center">
                <Button onClick={handleGenerateStory} disabled={isStoryLoading}>
                  {isStoryLoading ? 'Generating Story...' : 'Generate a Story'}
                </Button>
              </div>
            )}
            {(isStoryLoading || story || storyError) && (
              <DevDebugWrapper filename="StoryDisplay.tsx">
                <StoryDisplay story={story} isLoading={isStoryLoading} error={storyError} />
              </DevDebugWrapper>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
