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
import { GalleryCard } from '@/components/GalleryCard';
import { v4 as uuidv4 } from 'uuid';
import { buildFinalStoryPrompt } from '@/hooks/useStoryGeneration';
import { MOCK_STORY } from '@/lib/config';
import { TemplateManager } from '@/components/TemplateManager';

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
    addImageToHistory,
    updateImageDescription,
    updateImageStory,
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

  const [isFinalStoryLoading, setIsFinalStoryLoading] = useState(false);
  const [finalStory, setFinalStory] = useState<string | null>(null);
  const [finalStoryError, setFinalStoryError] = useState<string | null>(null);

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

  // Save description to imageHistory when it changes
  useEffect(() => {
    if (description && character.imageHistory.length > 0) {
      const latestImage = character.imageHistory[character.imageHistory.length - 1];
      if (latestImage && latestImage.description !== description) {
        updateImageDescription(latestImage.id, description);
      }
    }
  }, [description, character.imageHistory, updateImageDescription]);

  // Save story to imageHistory when it changes
  useEffect(() => {
    if (story && character.imageHistory.length > 0) {
      const latestImage = character.imageHistory[character.imageHistory.length - 1];
      if (latestImage && latestImage.story !== story) {
        updateImageStory(latestImage.id, story);
      }
    }
  }, [story, character.imageHistory, updateImageStory]);

  const handleGenerateFinalStory = async () => {
    setIsFinalStoryLoading(true);
    setFinalStory(null);
    setFinalStoryError(null);
    // Use mock if enabled
    if (MOCK_STORY) {
      setTimeout(() => {
        setFinalStory(
          `# Final Story\n\nThis is your final adventure, combining all your turns into one epic tale!\n\n(Replace this with real AI output.)`
        );
        setIsFinalStoryLoading(false);
      }, 1200);
      return;
    }
    try {
      const prompt = buildFinalStoryPrompt(character);
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: '', prompt }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setFinalStory(data.story);
      } else {
        setFinalStoryError(data.error || 'An unknown error occurred while generating the final story.');
      }
    } catch {
      setFinalStoryError('An unexpected error occurred while generating the final story.');
    } finally {
      setIsFinalStoryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main>
        <div 
          data-testid="main-content-container"
          className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
        >
          {/* Template Manager */}
          <div className="mb-6">
            <TemplateManager />
          </div>
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

            {/* Final Story Generation Button - only show on Turn 3 after story is generated */}
            {character.currentTurn === 3 && story && !isStoryLoading && !storyError && !finalStory && (
              <Card className="w-full sm:w-auto min-w-[300px] max-w-[400px]">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Complete Your Adventure</h3>
                    <p className="text-sm text-gray-300">
                      Generate a final cohesive story that ties together all three turns of your adventure.
                    </p>
                    <Button 
                      onClick={handleGenerateFinalStory}
                      className="w-full"
                      size="lg"
                      disabled={isFinalStoryLoading}
                    >
                      {isFinalStoryLoading ? 'Generating...' : 'Generate Final Story'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Final Story Loading Indicator */}
            {isFinalStoryLoading && (
              <Card className="w-full sm:w-auto min-w-[300px] max-w-[400px]">
                <CardContent className="p-6 flex items-center justify-center">
                  <span className="text-primary text-lg font-semibold">Generating your final story...</span>
                </CardContent>
              </Card>
            )}
            {/* Final Story Error */}
            {finalStoryError && (
              <Card className="w-full sm:w-auto min-w-[300px] max-w-[400px] border-red-500">
                <CardContent className="p-6">
                  <span className="text-red-400 font-semibold">{finalStoryError}</span>
                </CardContent>
              </Card>
            )}
            {/* Final Story Display */}
            {finalStory && (
              <Card className="w-full sm:w-auto min-w-[300px] max-w-[400px]">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-2" role="heading">Final Story</h2>
                  <div className="prose prose-invert max-w-none">
                    <div data-testid="final-story-markdown">{finalStory}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Image Gallery - replaced with stacked GalleryCards */}
          <div className="mt-8 space-y-6">
            {[...character.imageHistory].slice().reverse().map((img) => (
              <div key={img.id} className="w-full max-w-md mx-auto">
                <div className="text-xs text-gray-400 mb-1">Turn {img.turn}</div>
                <GalleryCard
                  id={img.id}
                  url={img.url}
                  description={img.description}
                  story={img.story || ''}
                  turn={img.turn}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
