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
import { useDMStore } from '@/lib/stores/dmStore';
import { createGoodVsBadConfig, GoodVsBadConfig } from '@/lib/types/goodVsBad';
import { v4 as uuidv4 } from 'uuid';
import { buildFinalStoryPrompt } from '@/hooks/useStoryGeneration';
import { MOCK_STORY } from '@/lib/config';
import { TemplateManager } from '@/components/TemplateManager';
import TurnCard from '@/components/TurnCard';
import type { CharacterStats, StoryDescription, ImageDescription } from '@/lib/types';

// Debug logging utility
const DEBUG = process.env.NODE_ENV === 'development';
const debugLog = (component: string, action: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[${component}] ${action}`, data || '');
  }
};

export default function Home() {
  const { 
    isDescriptionLoading, 
    error: descriptionError, 
    analyzeImage 
  } = useImageAnalysis();
  
  const { 
    character, 
    initializeCharacterFromDescription, 
    addExperience, 
    incrementTurn, 
    resetCharacter,
    addImageToHistory,
    updateImageDescription,
    makeChoice,
  } = useCharacterStore();

  const { freeformAnswers } = useDMStore();

  // Extract GoodVsBadConfig from DM store
  let goodVsBadConfig: GoodVsBadConfig = createGoodVsBadConfig();
  if (freeformAnswers.goodVsBadConfig) {
    try {
      goodVsBadConfig = JSON.parse(freeformAnswers.goodVsBadConfig);
    } catch {
      goodVsBadConfig = createGoodVsBadConfig();
    }
  }

  const { 
    isStoryLoading, 
    generateStory, 
    isChoicesLoading 
  } = useStoryGeneration(undefined, { character, goodVsBadConfig });

  // Derive image for current turn
  const imageForCurrentTurn = character.imageHistory.find(img => img.turn === character.currentTurn);
  const imageUrl = imageForCurrentTurn?.url || null;

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
  const [finalStoryWarning, setFinalStoryWarning] = useState<string | null>(null);

  // Removed unused setStory state

  const description: string | null = character.currentDescription ?? null;

  // Per-turn state helpers (use latest image entry for current turn)
  const latestImageEntry = character.imageHistory[character.imageHistory.length - 1];
  const latestTurn = latestImageEntry?.turn;
  const storyEntry = latestTurn ? character.storyHistory.find(story => story.turnNumber === latestTurn) : undefined;
  const choiceOutcome = latestTurn ? character.choiceHistory.find(outcome => outcome.turnNumber === latestTurn) : undefined;

  const parseStoryDescription = (text: string | undefined): StoryDescription | null => {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const formatStoryObject = (story: StoryDescription): string => {
    return `# ${story.sceneTitle}

${story.summary}

## Dilemmas
${story.dilemmas.map(dilemma => `- ${dilemma}`).join('\n')}

## Visual Cues
${story.cues}

## Consequences
${story.consequences.map(consequence => `- ${consequence}`).join('\n')}`;
  };

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

    // Parse structured story
    const storyObj = parseStoryDescription(storyEntry?.text);

    // Parse structured image description
    let imageDescObj: ImageDescription | null = null;
    if (imageEntry?.description) {
      if (typeof imageEntry.description === 'string') {
        try {
          imageDescObj = JSON.parse(imageEntry.description);
        } catch {
          imageDescObj = null;
        }
      } else {
        imageDescObj = imageEntry.description;
      }
    }

    // Extract summary if present (not used for strict JSON)
    const summary: string | null = null;

    return {
      turnNumber,
      imageUrl: imageEntry?.url || '',
      imageDescription: imageDescObj,
      story: storyObj,
      summary,
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
    debugLog('Home', 'Image selected', { 
      fileName: image.file.name, 
      size: image.file.size, 
      currentTurn: character.currentTurn,
      prompt 
    });

    // Add to imageHistory in the store
    addImageToHistory({
      id: uuidv4(),
      url: image.url,
      description: `Uploaded image ${(character.imageHistory ? character.imageHistory.length : 0) + 1}`,
      turn: character.currentTurn,
      uploadedAt: new Date().toISOString(),
    });
    
    debugLog('Home', 'Image added to history', { 
      imageHistoryLength: character.imageHistory.length,
      currentTurn: character.currentTurn 
    });

    analyzeImage(image.file, prompt);

    // Only add experience here
    addExperience(50);

    // Debug: Log turn numbers after image upload
    const latestImage = character.imageHistory[character.imageHistory.length - 1];
    const latestStory = character.storyHistory[character.storyHistory.length - 1];
    debugLog('Home', 'After image upload', {
      currentTurn: character.currentTurn,
      latestImageTurn: latestImage?.turn,
      latestStoryTurn: latestStory?.turnNumber,
    });

    // If this is the first analysis, set flag to initialize character after description is available
    if (character.currentTurn === 1) {
      setShouldInitCharacter(true);
      debugLog('Home', 'Character initialization flag set');
    }
  };

  // After description is available, initialize character if needed
  useEffect(() => {
    if (shouldInitCharacter && description) {
      let imageDesc: ImageDescription | null = null;
      try {
        imageDesc = typeof description === 'string' ? JSON.parse(description) : description;
      } catch {
        imageDesc = null;
      }
      if (imageDesc) {
        initializeCharacterFromDescription(imageDesc);
      }
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
    resetCharacter();
    setFinalStory(null);
    setFinalStoryError(null);
    setFinalStoryWarning(null);
    setIsFinalStoryLoading(false);
    // Optionally reset other local state if needed
  };

  const handleChoiceSelect = (choiceId: string) => {
    debugLog('Home', 'Choice selected', { choiceId, currentTurn: character.currentTurn });
    
    makeChoice(choiceId);
    
    // Debug: Log state after making a choice
    setTimeout(() => {
      debugLog('Home', 'After choice made', {
        imageHistory: character.imageHistory,
        storyHistory: character.storyHistory,
        choiceHistory: character.choiceHistory,
        currentTurn: character.currentTurn,
        characterStats: character.stats,
      });
    }, 100);
    
    incrementTurn();
    debugLog('Home', 'Turn incremented', { newTurn: character.currentTurn + 1 });
  };

  // Only limit after all 3 turns have images
  const allTurnsHaveImages = [1, 2, 3].every(turn => character.imageHistory.some(img => img.turn === turn));
  const allTurnsHaveStories = [1, 2, 3].every(turn => character.storyHistory.some(story => story.turnNumber === turn));
  const isTurnLimitReached = character.currentTurn > 3;

  // Save description to imageHistory when it changes
  useEffect(() => {
    if (description && character.imageHistory.length > 0) {
      const latestImage = character.imageHistory[character.imageHistory.length - 1];
      if (latestImage && latestImage.description !== description) {
        updateImageDescription(latestImage.id, description);
      }
    }
  }, [description, character.imageHistory, updateImageDescription]);

  // Story is now handled through character store, no need for local story state

  const handleGenerateFinalStory = async () => {
    setIsFinalStoryLoading(true);
    setFinalStory(null);
    setFinalStoryError(null);
    setFinalStoryWarning(null);
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
        // Convert story object to formatted string
        const formattedStory = formatStoryObject(data.story);
        setFinalStory(formattedStory);
        if (data.warning) {
          setFinalStoryWarning(data.warning);
        }
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
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <section className="container mx-auto px-4 py-8" data-testid="main-content-container">
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
              <Button onClick={handleReset} variant="outline" size="sm">
                Reset Game
              </Button>
            </div>
          )}

          {/* Image Upload Section */}
          {(!imageForCurrentTurn && !isDescriptionLoading && character.currentTurn <= 3) && (
            <Card className="w-full max-w-md mx-auto mb-8">
              <CardContent className="p-6">
                <ImageUpload onImageSelect={handleImageSelect} disabled={isTurnLimitReached} />
              </CardContent>
            </Card>
          )}

          {/* Image Preview Section */}
          {(imageUrl && !description && !isTurnLimitReached) && (
            <Card className="w-full max-w-md mx-auto mb-8">
              <CardContent className="p-6">
                <ImagePreview imageUrl={imageUrl} onRemove={handleReset} />
              </CardContent>
            </Card>
          )}

          {/* Generate Story Controls */}
          {latestImageEntry && latestImageEntry.description && !isDescriptionLoading && !storyEntry && !isStoryLoading && !descriptionError && (
            <Card className="w-full max-w-md mx-auto mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Generate Story</h3>
                <CustomPromptInput onPromptChange={setCustomStoryPrompt} value={customStoryPrompt} />
                <div className="flex space-x-4 mt-4">
                  <Button onClick={handleGenerateStoryWithDefaultPrompt} disabled={isStoryLoading} className="flex-1">
                    {isStoryLoading ? 'Generating...' : 'Default Prompt'}
                  </Button>
                  <Button onClick={handleGenerateStoryWithCustomPrompt} disabled={isStoryLoading} className="flex-1">
                    {isStoryLoading ? 'Generating...' : 'Custom Prompt'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Choices Controls */}
          {storyEntry && storyEntry.text && !choiceOutcome && !isChoicesLoading && (
            <Card className="w-full max-w-md mx-auto mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Choices</h3>
                <div className="text-muted-foreground">Choices will appear here after story generation.</div>
              </CardContent>
            </Card>
          )}

          {/* Turn Cards */}
          <section className="space-y-6">
            {Array.from({ length: Math.min(character.currentTurn, 3) }, (_, i) => i + 1).reverse().map(turnNumber => {
              const turnChoices = character.choicesHistory?.find(entry => entry.turn === turnNumber)?.choices || [];
              const turnCardProps = {
                ...buildTurnData(turnNumber),
                choices: turnChoices,
                isDescriptionLoading: isDescriptionLoading && character.currentTurn === turnNumber,
                onSelectChoice: handleChoiceSelect,
                isStoryLoading: isStoryLoading
              };
              return (
                <TurnCard key={turnNumber} {...turnCardProps} />
              );
            })}
          </section>

          {/* Turns Over message */}
          {character.currentTurn > 3 && (
            <div className="mt-8 text-center text-2xl font-bold text-green-400">Turns Over</div>
          )}

          {/* Final Story Generation */}
          {allTurnsHaveImages && allTurnsHaveStories && !finalStory && (
            <Card className="w-full max-w-md mx-auto mt-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Complete Your Adventure</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a final cohesive story that ties together all three turns of your adventure.
                </p>
                <Button onClick={handleGenerateFinalStory} className="w-full" size="lg" disabled={isFinalStoryLoading}>
                  {isFinalStoryLoading ? 'Generating...' : 'Generate Final Story'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Final Story Loading Indicator */}
          {isFinalStoryLoading && (
            <Card className="w-full max-w-md mx-auto mt-8">
              <CardContent className="p-6 flex items-center justify-center">
                <span className="text-primary text-lg font-semibold">Generating your final story...</span>
              </CardContent>
            </Card>
          )}

          {/* Final Story Error */}
          {finalStoryError && (
            <Card className="w-full max-w-md mx-auto mt-8 border-destructive">
              <CardContent className="p-6">
                <span className="text-destructive font-semibold">{finalStoryError}</span>
              </CardContent>
            </Card>
          )}

          {/* Final Story Warning */}
          {finalStoryWarning && (
            <Card className="w-full max-w-4xl mx-auto mt-8 border-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-yellow-500">Story Generation Warning</h3>
                    <div className="mt-2 text-sm text-yellow-400">
                      <p className="mb-2">The AI encountered some issues while generating your story, but we were able to create a fallback version.</p>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-yellow-300 hover:text-yellow-200">
                          Technical Details (click to expand)
                        </summary>
                        <pre className="mt-2 text-xs bg-yellow-900/20 p-3 rounded overflow-auto max-h-40">
                          {finalStoryWarning}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Story Display */}
          {finalStory && (
            <Card className="w-full max-w-4xl mx-auto mt-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2" role="heading">Final Story</h2>
                <div className="prose prose-invert max-w-none">
                  <div data-testid="final-story-markdown">{finalStory}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
