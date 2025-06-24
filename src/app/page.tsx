"use client";

import { useReducer, useEffect, useState, useRef } from 'react';
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
import { useCharacterStore } from '@/lib/stores/characterStore';
import { ImageGallery } from '@/components/ImageGallery';
import { v4 as uuidv4 } from 'uuid';

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

  const { 
    character, 
    initializeCharacterFromDescription, 
    addExperience, 
    incrementTurn, 
    resetCharacter,
    addImageToHistory
  } = useCharacterStore();

  const [imageUrl, setImageUrl] = useReducer((_: string | null, newUrl: string | null) => {
    if (newUrl === null && _ !== null) {
      URL.revokeObjectURL(_);
    }
    return newUrl;
  }, null);

  const [customStoryPrompt, setCustomStoryPrompt] = useState('Write a fantasy adventure story');

  const hasProcessed = useRef(false);

  // Reset the flag only when description changes
  useEffect(() => {
    hasProcessed.current = false;
  }, [description]);

  // Track if we need to initialize the character after analysis
  const [shouldInitCharacter, setShouldInitCharacter] = useState(false);

  const handleImageSelect = (file: File, prompt?: string) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    // Add to imageHistory in the store
    addImageToHistory({
      id: uuidv4(),
      url,
      description: `Uploaded image ${(character.imageHistory ? character.imageHistory.length : 0) + 1}`,
      turn: character.currentTurn + 1, // incrementTurn is called after this
      uploadedAt: new Date().toISOString(),
    });
    analyzeImage(file, prompt);

    // Only increment turn and add experience here
    addExperience(50);
    incrementTurn();

    // If this is the first analysis, set flag to initialize character after description is available
    if (character.currentTurn === 0) {
      setShouldInitCharacter(true);
    }
  };

  // After description is available, initialize character if needed
  useEffect(() => {
    if (shouldInitCharacter && description) {
      initializeCharacterFromDescription(description);
      setShouldInitCharacter(false);
    }
  }, [shouldInitCharacter, description, initializeCharacterFromDescription]);

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
    // No need to reset galleryUrls; imageHistory is session-only and will reset on reload
  };

  const isTurnLimitReached = character.currentTurn >= 3;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main>
        <div 
          data-testid="main-content-container"
          className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
        >
          {/* Reset Game Button */}
          {character.currentTurn > 0 && (
            <div className="mb-4">
              <Button onClick={resetCharacter} variant="outline" size="sm">
                Reset Game
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-6 justify-start">
            {/* Image Upload/Preview Card */}
            <Card className="w-full sm:w-auto min-w-[300px] max-w-[400px]">
              <CardContent className="p-6">
                {imageUrl ? (
                  <ImagePreview imageUrl={imageUrl} onRemove={handleReset} />
                ) : (
                  <div className="space-y-4">
                    {isTurnLimitReached && (
                      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 text-yellow-200 text-sm">
                        <p className="font-medium">Turn limit reached!</p>
                        <p className="text-xs text-yellow-300/80">
                          You&apos;ve used all 3 turns. Your character has gained experience and stats from analyzing images.
                        </p>
                      </div>
                    )}
                    <ImageUpload 
                      onImageSelect={handleImageSelect} 
                      disabled={isTurnLimitReached}
                    />
                  </div>
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
          {/* Image Gallery */}
          <div className="mt-8">
            <ImageGallery images={character.imageHistory} />
          </div>
        </div>
      </main>
    </div>
  );
}
