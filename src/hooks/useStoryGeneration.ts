import { useState } from 'react';
import { DEFAULT_STORY_GENERATION_PROMPT } from '@/lib/constants';
import { MOCK_STORY, MOCK_STORY_TEXT, TURN_BASED_MOCK_DATA } from '@/lib/config';
import { useCharacterStore } from '@/lib/stores/characterStore';
import type { Character, StoryEntry } from '@/lib/types/character';

export function buildStoryPrompt({ character, description, customPrompt }: {
  character: Character,
  description: string,
  customPrompt?: string
}) {
  const turn = character.currentTurn;
  const stats = character.stats;
  const statsString = `INT ${stats.intelligence}, CRE ${stats.creativity}, PER ${stats.perception}, WIS ${stats.wisdom}`;
  const previousStories = character.storyHistory
    .filter((s: StoryEntry) => s.turnNumber < turn)
    .map((s: StoryEntry) => s.text)
    .join('\n');
  const previousStoryContext = previousStories ? `Previous story: ${previousStories}` : '';

  const contextPrompt = [
    `Turn: ${turn}`,
    `Stats: ${statsString}`,
    previousStoryContext,
    description
  ].filter(Boolean).join('\n\n');

  return customPrompt
    ? `${customPrompt}\n\n${contextPrompt}`
    : `${DEFAULT_STORY_GENERATION_PROMPT}\n\n${contextPrompt}`;
}

export function useStoryGeneration(injectedCharacter?: Character) {
  const [story, setStory] = useState<string | null>(null);
  const [isStoryLoading, setIsStoryLoading] = useState<boolean>(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  const { character } = useCharacterStore();
  const effectiveCharacter = injectedCharacter || character;

  const generateStory = async (description: string, customPrompt?: string) => {
    if (!description) {
      setStoryError('Cannot generate a story without a description.');
      return;
    }

    setIsStoryLoading(true);
    setStory(null);
    setStoryError(null);

    // Mock mode: instantly return mock story
    if (MOCK_STORY) {
      setTimeout(() => {
        // Try to get turn-based mock data first
        const turnBasedStory = TURN_BASED_MOCK_DATA.stories[effectiveCharacter.currentTurn as keyof typeof TURN_BASED_MOCK_DATA.stories];
        
        // Use turn-based data if available, otherwise fall back to default
        const mockStory = turnBasedStory || MOCK_STORY_TEXT;
        
        setStory(mockStory);
        setIsStoryLoading(false);
      }, 300); // Simulate a short delay
      return;
    }

    const prompt = buildStoryPrompt({ character: effectiveCharacter, description, customPrompt });

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, prompt }),
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

  return { story, isStoryLoading, storyError, generateStory };
} 