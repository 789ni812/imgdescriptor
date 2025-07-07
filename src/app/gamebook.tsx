"use client";

import { useEffect, useState, useRef } from 'react';
import { GamebookImageUpload } from '@/components/GamebookImageUpload';
import { GamebookPage as GamebookPageComponent } from '@/components/GamebookPage';
import { MinimalHUD } from '@/components/MinimalHUD';
import { BookMenu } from '@/components/BookMenu';
import { InterfaceToggle } from '@/components/InterfaceToggle';
import { Button } from '@/components/ui/Button';
import { useImageAnalysis } from '@/hooks/useImageAnalysis';
import { useStoryGeneration } from '@/hooks/useStoryGeneration';
import { useCharacterStore } from '@/lib/stores/characterStore';
import { useDMStore } from '@/lib/stores/dmStore';
import { createGoodVsBadConfig, GoodVsBadConfig } from '@/lib/types/goodVsBad';
import { v4 as uuidv4 } from 'uuid';
import { buildFinalStoryPrompt } from '@/hooks/useStoryGeneration';
import type { StoryDescription, ImageDescription } from '@/lib/types';

// Debug logging utility
const DEBUG = process.env.NODE_ENV === 'development';
const debugLog = (component: string, action: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[${component}] ${action}`, data || '');
  }
};

export default function GamebookApp() {
  const [currentInterface, setCurrentInterface] = useState<'original' | 'gamebook'>('gamebook');
  const { 
    isDescriptionLoading, 
    analyzeImage 
  } = useImageAnalysis();
  
  const { 
    character, 
    addExperience, 
    resetCharacter,
    addImageToHistory,
    makeChoice,
    incrementTurn,
    updateStat,
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

  const hasProcessed = useRef(false);

  // Reset the flag only when description changes
  useEffect(() => {
    hasProcessed.current = false;
  }, [character.currentDescription]);



  const [isFinalStoryLoading, setIsFinalStoryLoading] = useState(false);
  const [finalStory, setFinalStory] = useState<string | null>(null);
  const [finalStoryError, setFinalStoryError] = useState<string | null>(null);

  const description: string | null = character.currentDescription ?? null;

  // Per-turn state helpers
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

  // Helper function to build turn data for GamebookPageComponent
  const buildTurnData = (turnNumber: number) => {
    const imageEntry = (character.imageHistory || []).find(img => img.turn === turnNumber);
    const storyEntry = (character.storyHistory || []).find(story => story.turnNumber === turnNumber);
    // Only get choices for this turn
    const turnChoices = character.choicesHistory?.find(entry => entry.turn === turnNumber)?.choices || [];
    // Get the outcome for this turn (the user's chosen choice and stat changes)
    const choiceOutcome = character.choiceHistory?.find(outcome => outcome.turnNumber === turnNumber);
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
    // Stats after this turn
    const stats = choiceOutcome ? { ...character.stats } : { ...character.stats };
    // Check for 'death' (e.g., wisdom <= 0)
    const isDead = stats.wisdom <= 0;
    return {
      turnNumber,
      imageUrl: imageEntry?.url || '',
      imageDescription: imageDescObj,
      story: storyObj,
      isStoryLoading: isStoryLoading && character.currentTurn === turnNumber,
      choices: turnChoices,
      isChoicesLoading: isChoicesLoading && character.currentTurn === turnNumber,
      isDescriptionLoading: isDescriptionLoading && character.currentTurn === turnNumber,
      isCurrentTurn: character.currentTurn === turnNumber,
      choiceOutcome,
      stats,
      isDead,
    };
  };

  const handleImageSelect = (image: { url: string; file: File }, prompt?: string) => {
    debugLog('Gamebook', 'Image selected', { 
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
    
    debugLog('Gamebook', 'Image added to history', { 
      imageHistoryLength: character.imageHistory.length,
      currentTurn: character.currentTurn 
    });

    analyzeImage(image.file, prompt);
    addExperience(50);
  };

  const handleGenerateStory = async () => {
    if (!description) return;
    
    try {
      await generateStory(description);
    } catch (error) {
      console.error('Error generating story:', error);
    }
  };

  const [dmOutcome, setDMOutcome] = useState(null);
  const [isDMOutcomeLoading, setIsDMOutcomeLoading] = useState(false);
  const [dmOutcomeError, setDMOutcomeError] = useState<string | null>(null);

  const handleChoiceSelect = async (choiceId: string) => {
    debugLog('Gamebook', 'Choice selected', { choiceId, currentTurn: character.currentTurn });
    setIsDMOutcomeLoading(true);
    setDMOutcome(null);
    setDMOutcomeError(null);
    try {
      const selectedChoice = character.currentChoices.find(c => c.id === choiceId);
      const previousStory = character.storyHistory.length > 0 ? character.storyHistory[character.storyHistory.length - 1].text : '';
      const response = await fetch('/api/dm-outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character, previousStory, selectedChoice }),
      });
      if (!response.ok) throw new Error('Failed to get DM outcome');
      const data = await response.json();
      setDMOutcome(data);
      // Apply stat changes (if any)
      if (data.statChanges) {
        Object.entries(data.statChanges).forEach(([stat, change]) => {
          if (typeof change === 'number') updateStat(stat as keyof typeof character.stats, character.stats[stat as keyof typeof character.stats] + change);
        });
      }
      if (!data.gameOver) {
        makeChoice(choiceId);
        incrementTurn();
      } else {
        // Optionally set a game over state here
      }
    } catch (err) {
      setDMOutcomeError('Failed to get DM outcome.');
    } finally {
      setIsDMOutcomeLoading(false);
    }
  };

  const handleReset = () => {
    resetCharacter();
    setFinalStory(null);
    setFinalStoryError(null);
  };

  const handleGenerateFinalStory = async () => {
    setIsFinalStoryLoading(true);
    setFinalStoryError(null);
    
    try {
      const prompt = buildFinalStoryPrompt(character);
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: '', prompt }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const formattedStory = formatStoryObject(data.story);
        setFinalStory(formattedStory);
      } else {
        setFinalStoryError(data.error || 'An unknown error occurred while generating the final story.');
      }
    } catch {
      setFinalStoryError('An unexpected error occurred while generating the final story.');
    } finally {
      setIsFinalStoryLoading(false);
    }
  };

  // Check if all turns are complete
  const allTurnsHaveImages = character.imageHistory.length >= 3;
  const allTurnsHaveStories = character.storyHistory.length >= 3;
  const isTurnLimitReached = character.currentTurn > 3;

  // Auto-generate story when description is available
  useEffect(() => {
    if (description && !hasProcessed.current && !storyEntry && !isStoryLoading) {
      hasProcessed.current = true;
      handleGenerateStory();
    }
  }, [description, storyEntry, isStoryLoading, handleGenerateStory]);

  // Auto-generate choices when story is available
  useEffect(() => {
    if (storyEntry && !choiceOutcome && !isChoicesLoading && character.currentTurn <= 3) {
      // Choices will be generated automatically by the story generation hook
    }
  }, [storyEntry, choiceOutcome, isChoicesLoading, character.currentTurn]);

  // Redirect to original interface if selected
  if (currentInterface === 'original') {
    // Use router navigation to avoid circular dependency
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 dark:from-amber-950 dark:via-amber-900 dark:to-amber-800">
      <InterfaceToggle 
        currentInterface={currentInterface}
        onToggle={setCurrentInterface}
      />
      {/* Minimal HUD */}
      <MinimalHUD
        characterStats={character.stats}
        currentTurn={character.currentTurn}
        currentLocation={storyEntry ? parseStoryDescription(storyEntry.text)?.sceneTitle : undefined}
      />

      {/* Book Menu */}
      <BookMenu
        onReset={handleReset}
        currentTurn={character.currentTurn}
        hasContent={character.imageHistory.length > 0}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-amber-800 dark:text-amber-200 mb-2">
            AI Image Describer RPG
          </h1>
          <p className="text-amber-600 dark:text-amber-400">
            Your adventure awaits...
          </p>
        </div>

        {/* Image Upload Section */}
        {(!imageForCurrentTurn && !isDescriptionLoading && character.currentTurn <= 3) && (
          <GamebookImageUpload 
            onImageSelect={handleImageSelect} 
            disabled={isTurnLimitReached} 
          />
        )}

        {/* Gamebook Pages */}
        <div className="space-y-8">
          {Array.from({ length: Math.min(character.currentTurn, 3) }, (_, i) => i + 1).reverse().map(turnNumber => {
            const turnData = buildTurnData(turnNumber);
            return (
              <GamebookPageComponent
                key={turnNumber}
                {...turnData}
                onSelectChoice={handleChoiceSelect}
              />
            );
          })}
        </div>

        {/* Final Story Generation */}
        {allTurnsHaveImages && allTurnsHaveStories && !finalStory && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white dark:bg-amber-900/50 rounded-lg p-8 border-2 border-amber-300 dark:border-amber-700">
              <h2 className="text-2xl font-serif text-amber-800 dark:text-amber-200 mb-4">
                Complete Your Adventure
              </h2>
              <p className="text-amber-600 dark:text-amber-400 mb-6">
                Generate a final cohesive story that ties together all three turns of your adventure.
              </p>
              <Button 
                onClick={handleGenerateFinalStory} 
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3"
                disabled={isFinalStoryLoading}
              >
                {isFinalStoryLoading ? 'Generating...' : 'Generate Final Story'}
              </Button>
            </div>
          </div>
        )}

        {/* Final Story Display */}
        {finalStory && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-amber-900/50 rounded-lg p-8 border-2 border-amber-300 dark:border-amber-700">
              <h2 className="text-2xl font-serif text-amber-800 dark:text-amber-200 mb-6 text-center">
                Your Complete Adventure
              </h2>
              <div className="prose prose-amber max-w-none">
                <div className="text-amber-700 dark:text-amber-300 leading-relaxed font-serif text-lg">
                  {finalStory}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {finalStoryError && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/50 rounded-lg p-6 border-2 border-red-300 dark:border-red-700">
              <p className="text-red-600 dark:text-red-400 text-center">
                {finalStoryError}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 