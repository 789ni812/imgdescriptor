import { useState } from 'react';
import { DEFAULT_STORY_GENERATION_PROMPT } from '@/lib/constants';

export function useStoryGeneration() {
  const [story, setStory] = useState<string | null>(null);
  const [isStoryLoading, setIsStoryLoading] = useState<boolean>(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  const generateStory = async (description: string, customPrompt?: string) => {
    if (!description) {
      setStoryError('Cannot generate a story without a description.');
      return;
    }

    setIsStoryLoading(true);
    setStory(null);
    setStoryError(null);

    const prompt = customPrompt || DEFAULT_STORY_GENERATION_PROMPT;

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