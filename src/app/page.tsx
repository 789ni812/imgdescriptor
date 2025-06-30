"use client";

import { useEffect, useState, useRef } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ImagePreview } from '@/components/ImagePreview';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { useImageAnalysis } from '@/hooks/useImageAnalysis';
import { useStoryGeneration } from '@/hooks/useStoryGeneration';
import { CustomPromptInput } from '@/components/CustomPromptInput';
import { useCharacterStore } from '@/lib/stores/characterStore';
import { v4 as uuidv4 } from 'uuid';
import { buildFinalStoryPrompt } from '@/hooks/useStoryGeneration';
import { MOCK_STORY } from '@/lib/config';
import { TemplateManager } from '@/components/TemplateManager';
import TurnCard from '@/components/TurnCard';
import type { CharacterStats } from '@/lib/types/character';

export default function Home() {
  const { 
    isDescriptionLoading, 
    error: descriptionError, 
    analyzeImage 
  } = useImageAnalysis();
  
  const { 
    isStoryLoading, 
    storyError, 
    generateStory, 
    isChoicesLoading 
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
    makeChoice,
  } = useCharacterStore();

  // Derive current imageUrl from store
  const currentImageEntry = character.imageHistory.find(img => img.turn === character.currentTurn);
  const imageUrl = currentImageEntry?.url || null;

  const [customStoryPrompt, setCustomStoryPrompt] = useState('Write a fantasy adventure story');

  const hasProcessed = useRef(false);

  // Reset the flag only when description changes
  useEffect(() => {
    hasProcessed.current = false;
  }, [character.currentDescription]);

  // Track if we need to initialize the character after analysis
  const [shouldInitCharacter, setShouldInitCharacter] = useState(false);

  const [isFinalStoryLoading, setIsFinalStoryLoading] = useState(false);
  const [finalStory, setFinalStory] = useState<string | null>(null);
  const [finalStoryError, setFinalStoryError] = useState<string | null>(null);

  const story = character.currentStory;

  const description = character.currentDescription ?? null;

  // Per-turn state helpers (use latest image entry for current turn)
  const latestImageEntry = character.imageHistory[character.imageHistory.length - 1];
  const latestTurn = latestImageEntry?.turn;
  const storyEntry = latestTurn ? character.storyHistory.find(story => story.turnNumber === latestTurn) : undefined;
  const choiceOutcome = latestTurn ? character.choiceHistory.find(outcome => outcome.turnNumber === latestTurn) : undefined;

  // Helper function to build turn data for TurnCard
  const buildTurnData = (turnNumber: number) => {
    const imageEntry = (character.imageHistory || []).find(img => img.turn === turnNumber);
    const storyEntry = (character.storyHistory || []).find(story => story.turnNumber === turnNumber);
    const choiceOutcome = (character.choiceHistory || []).find(outcome => outcome.turnNumber === turnNumber);
    
    // Calculate stat changes for this turn
    let statChanges: Partial<CharacterStats> = {};
    if (choiceOutcome?.statChanges) {
      statChanges = choiceOutcome.statChanges;
    }

    return {
      turnNumber,
      imageUrl: imageEntry?.url || '',
      imageDescription: imageEntry?.description || '',
      story: storyEntry?.text || '',
      isStoryLoading: isStoryLoading && character.currentTurn === turnNumber,
      choices: character.currentChoices,
      isChoicesLoading: isChoicesLoading && character.currentTurn === turnNumber,
      selectedChoiceId: choiceOutcome?.choiceId,
      choiceOutcome,
      characterStats: character.stats,
      statChanges,
      isCurrentTurn: character.currentTurn === turnNumber,
    };
  };

  const handleImageSelect = (image: { url: string; file: File }, prompt?: string) => {
    // Add to imageHistory in the store
    addImageToHistory({
      id: uuidv4(),
      url: image.url,
      description: `Uploaded image ${(character.imageHistory ? character.imageHistory.length : 0) + 1}`,
      turn: character.currentTurn,
      uploadedAt: new Date().toISOString(),
    });
    analyzeImage(image.file, prompt);

    // Only add experience here
    addExperience(50);

    // Debug: Log turn numbers after image upload
    const latestImage = character.imageHistory[character.imageHistory.length - 1];
    const latestStory = character.storyHistory[character.storyHistory.length - 1];
    console.log('[DEBUG] After image upload:', {
      currentTurn: character.currentTurn,
      latestImageTurn: latestImage?.turn,
      latestStoryTurn: latestStory?.turnNumber,
    });

    // If this is the first analysis, set flag to initialize character after description is available
    if (character.currentTurn === 1) {
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
    // No need to reset galleryUrls; imageHistory is session-only and will reset on reload
  };

  const handleChoiceSelect = (choiceId: string) => {
    makeChoice(choiceId);
    // Debug: Log state after making a choice
    setTimeout(() => {
      console.log('[DEBUG] After choice:', {
        imageHistory: character.imageHistory,
        storyHistory: character.storyHistory,
        choiceHistory: character.choiceHistory,
        currentTurn: character.currentTurn,
      });
    }, 100);
    incrementTurn();
    // Optionally, reset any per-turn UI state if needed
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
          {/* Turn Indicator */}
          <div className="mb-8 flex justify-center">
            <h1 className="text-4xl font-extrabold text-primary drop-shadow-lg" data-testid="turn-indicator">
              {`Turn ${character.currentTurn}`}
            </h1>
          </div>

          {/* Template Manager */}
          <div className="mb-6">
            <TemplateManager />
          </div>
          
          {/* Reset Game Button */}
          {character.currentTurn > 1 && (
            <div className="mb-4">
              <Button onClick={resetCharacter} variant="outline" size="sm">
                Reset Game
              </Button>
            </div>
          )}

          {/* Image Upload Section - Only visible if no image is uploaded for the current turn, not generating description, no image description, and not at turn limit */}
          {(!latestImageEntry && !isDescriptionLoading && !isTurnLimitReached) && (
            <div className="mb-8">
              <Card className="w-full max-w-md mx-auto">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <ImageUpload 
                      onImageSelect={handleImageSelect} 
                      disabled={isTurnLimitReached}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {/* Image Preview Section - Only visible if image is uploaded and before story/choices are generated */}
          {(imageUrl && !description && !isTurnLimitReached) && (
            <div className="mb-8">
              <Card className="w-full max-w-md mx-auto">
                <CardContent className="p-6">
                  <ImagePreview imageUrl={imageUrl} onRemove={handleReset} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Generate Story Controls - Only show if latest image has description, not generating description, no story yet, and not generating story */}
          {latestImageEntry && latestImageEntry.description && !isDescriptionLoading && !storyEntry && !isStoryLoading && !descriptionError && (
            <div className="mb-8">
              <Card className="w-full max-w-md mx-auto">
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
            </div>
          )}

          {/* Choices Controls - Only show if story exists for latest turn, no choices yet, and not generating choices */}
          {storyEntry && storyEntry.text && !choiceOutcome && !isChoicesLoading && (
            <div className="mb-8">
              <Card className="w-full max-w-md mx-auto">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Choices</h3>
                    <div className="text-gray-300">Choices will appear here after story generation.</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Turn Cards - Display all completed turns (0-based, inclusive) */}
          <div className="space-y-6">
            {Array.from({ length: character.currentTurn }, (_, i) => i + 1).map(turnNumber => {
              // Get choices for this turn if available
              const turnChoices = (character.currentTurn === turnNumber) ? character.currentChoices : [];
              const turnCardProps = {
                ...buildTurnData(turnNumber),
                choices: turnChoices,
                isDescriptionLoading: isDescriptionLoading && character.currentTurn === turnNumber,
                onSelectChoice: handleChoiceSelect,
              };
              return (
                <TurnCard
                  key={turnNumber}
                  {...turnCardProps}
                />
              );
            })}
          </div>

          {/* Final Story Generation - only show on Turn 3 after story is generated */}
          {character.currentTurn === 3 && story && !isStoryLoading && !storyError && !finalStory && (
            <div className="mt-8">
              <Card className="w-full max-w-md mx-auto">
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
            </div>
          )}

          {/* Final Story Loading Indicator */}
          {isFinalStoryLoading && (
            <div className="mt-8">
              <Card className="w-full max-w-md mx-auto">
                <CardContent className="p-6 flex items-center justify-center">
                  <span className="text-primary text-lg font-semibold">Generating your final story...</span>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Final Story Error */}
          {finalStoryError && (
            <div className="mt-8">
              <Card className="w-full max-w-md mx-auto border-red-500">
                <CardContent className="p-6">
                  <span className="text-red-400 font-semibold">{finalStoryError}</span>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Final Story Display */}
          {finalStory && (
            <div className="mt-8">
              <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-2" role="heading">Final Story</h2>
                  <div className="prose prose-invert max-w-none">
                    <div data-testid="final-story-markdown">{finalStory}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
