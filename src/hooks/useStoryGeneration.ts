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

export function buildFinalStoryPrompt(character: Character & { name?: string }) {
  const stats = character.stats;
  const statsString = `INT ${stats.intelligence}, CRE ${stats.creativity}, PER ${stats.perception}, WIS ${stats.wisdom}`;
  const name = character.name || character.persona;
  const descriptions = character.storyHistory.map((s, i) => `Image ${i + 1} Description: ${s.imageDescription}`).join('\n');
  const stories = character.storyHistory.map((s, i) => `Turn ${i + 1} Story: ${s.text}`).join('\n');
  return [
    `Character: ${name}`,
    `Stats: ${statsString}`,
    descriptions,
    stories,
    'Write a single, cohesive final story that weaves together all the above descriptions and stories into an epic adventure.'
  ].filter(Boolean).join('\n\n');
}

// Types for dependency injection
interface ConfigDependencies {
  MOCK_STORY: boolean;
  MOCK_STORY_TEXT: string;
  TURN_BASED_MOCK_DATA: {
    stories: Record<number, string>;
  };
}

interface StoreDependencies {
  character: Character;
}

export function useStoryGeneration(
  configOverride?: ConfigDependencies,
  storeOverride?: StoreDependencies
) {
  const [story, setStory] = useState<string | null>(null);
  const [isStoryLoading, setIsStoryLoading] = useState<boolean>(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  
  // Always call the hook unconditionally
  const storeFromHook = useCharacterStore();
  // Use injected dependencies or fall back to real modules
  const config = configOverride || { MOCK_STORY, MOCK_STORY_TEXT, TURN_BASED_MOCK_DATA };
  const store = storeOverride || storeFromHook;
  const effectiveCharacter = store.character;

  const generateStory = async (description: string, customPrompt?: string) => {
    if (!description) {
      setStoryError('Cannot generate a story without a description.');
      return;
    }

    setIsStoryLoading(true);
    setStory(null);
    setStoryError(null);

    // Mock mode: instantly return mock story
    if (config.MOCK_STORY) {
      setTimeout(() => {
        // Try to get turn-based mock data first
        const turnBasedStory = config.TURN_BASED_MOCK_DATA.stories[effectiveCharacter.currentTurn as keyof typeof config.TURN_BASED_MOCK_DATA.stories];
        
        // Use turn-based data if available, otherwise fall back to default
        const mockStory = turnBasedStory || config.MOCK_STORY_TEXT;
        
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