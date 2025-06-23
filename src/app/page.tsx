"use client";

import { useReducer, useEffect, useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ImagePreview } from '@/components/ImagePreview';
import { DescriptionDisplay } from '@/components/DescriptionDisplay';
import { StoryDisplay } from '@/components/StoryDisplay';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { useImageAnalysis } from '@/hooks/useImageAnalysis';
import { useStoryGeneration } from '@/hooks/useStoryGeneration';
import { CustomPromptInput } from '@/components/CustomPromptInput';

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

  const [customStoryPrompt, setCustomStoryPrompt] = useState('Write a fantasy adventure story');

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleImageSelect = (file: File, prompt?: string) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    analyzeImage(file, prompt);
  };

  const handleGenerateStoryWithDefaultPrompt = () => {
    if (description) {
      generateStory(description);
    }
  };

  const handleGenerateStoryWithCustomPrompt = () => {
    if (description) {
      generateStory(description, customStoryPrompt);
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
        <div className="flex flex-wrap gap-6 justify-start">
          {/* Image Upload/Preview Card */}
          <Card className="w-full sm:w-auto min-w-[300px] max-w-[400px]">
            <CardContent className="p-6">
              {imageUrl ? (
                <ImagePreview imageUrl={imageUrl} onRemove={handleReset} />
              ) : (
                <ImageUpload onImageSelect={handleImageSelect} />
              )}
            </CardContent>
          </Card>

          {/* Loading Spinner Card */}
          {isDescriptionLoading && (
            <Card className="w-full sm:w-auto min-w-[300px] max-w-[400px]">
              <CardContent className="p-6">
                <div className="flex justify-center items-center h-full min-h-[80px]">
                  <LoadingSpinner />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description Display Card */}
          {!isDescriptionLoading && (description || descriptionError) && (
            <Card className="w-full sm:w-auto min-w-[300px] max-w-[400px]">
              <CardContent className="p-6">
                <DescriptionDisplay description={description} error={descriptionError} />
              </CardContent>
            </Card>
          )}

          {/* Generate Story Card with Dual Prompt System */}
          {description && !isDescriptionLoading && !descriptionError && (
            <Card className="w-full sm:w-auto min-w-[300px] max-w-[400px]">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Generate Story</h3>
                  <CustomPromptInput 
                    onPromptChange={setCustomStoryPrompt}
                    value={customStoryPrompt}
                  />
                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleGenerateStoryWithDefaultPrompt} 
                      disabled={isStoryLoading}
                      className="flex-1"
                    >
                      {isStoryLoading ? 'Generating...' : 'Default Prompt'}
                    </Button>
                    <Button 
                      onClick={handleGenerateStoryWithCustomPrompt} 
                      disabled={isStoryLoading}
                      className="flex-1"
                    >
                      {isStoryLoading ? 'Generating...' : 'Custom Prompt'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Story Display Card */}
          {(isStoryLoading || story || storyError) && (
            <Card className="w-full sm:w-auto min-w-[300px] max-w-[400px]">
              <CardContent className="p-6">
                <StoryDisplay story={story} isLoading={isStoryLoading} error={storyError} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
