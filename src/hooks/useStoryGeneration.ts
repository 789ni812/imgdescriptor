import { useState, useCallback } from 'react';
import { DEFAULT_STORY_GENERATION_PROMPT } from '@/lib/constants';
import { MOCK_STORY, MOCK_STORY_TEXT, TURN_BASED_MOCK_DATA } from '@/lib/config';
import { useCharacterStore } from '@/lib/stores/characterStore';
import type { Character, StoryEntry, Choice } from '@/lib/types/character';
import { v4 as uuidv4 } from 'uuid';

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
  // Structure each turn's info
  const turns = character.storyHistory.map((s, i) =>
    `Turn ${i + 1}:
Image Description: ${s.imageDescription}
Story: ${s.text}`
  ).join('\n\n');

  return [
    `Character: ${name}`,
    `Stats: ${statsString}`,
    turns,
    `\nINSTRUCTIONS:\n1. Carefully read the descriptions and stories for each turn above.\n2. Briefly summarize the main event of each turn.\n3. Then, write a single, cohesive final story that weaves together the key events, characters, and settings from all three turns into an epic adventure.\n4. Make sure the final story references important details from each turn and feels like a natural conclusion to the adventure.\n\nFirst, provide the summaries for each turn. Then, write the final story below:`
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

// Function to generate choices based on story content
function generateChoicesFromStory(story: string): Choice[] {
  const choices: Choice[] = [];
  
  // Simple choice generation logic based on story keywords
  const storyLower = story.toLowerCase();
  
  // Choice 1: Exploration-based choice
  if (storyLower.includes('cave') || storyLower.includes('forest') || storyLower.includes('ruins')) {
    choices.push({
      id: uuidv4(),
      text: 'Explore further',
      description: 'Venture deeper into the unknown to discover more secrets',
      statRequirements: { perception: 8, intelligence: 6 },
      consequences: ['May find valuable treasures', 'Risk of encountering danger'],
    });
  }
  
  // Choice 2: Caution-based choice
  choices.push({
    id: uuidv4(),
    text: 'Proceed with caution',
    description: 'Take a careful, measured approach to the situation',
    statRequirements: { wisdom: 7 },
    consequences: ['Safer approach', 'May miss opportunities'],
  });
  
  // Choice 3: Creative solution
  if (storyLower.includes('puzzle') || storyLower.includes('riddle') || storyLower.includes('symbol')) {
    choices.push({
      id: uuidv4(),
      text: 'Think creatively',
      description: 'Use your imagination to find an unconventional solution',
      statRequirements: { creativity: 9 },
      consequences: ['May find unique solutions', 'Could be risky'],
    });
  }
  
  // Choice 4: Return/retreat option
  choices.push({
    id: uuidv4(),
    text: 'Return to safety',
    description: 'Head back to a known safe location',
    consequences: ['Guaranteed safety', 'Miss potential rewards'],
  });
  
  // Return 2-3 choices, prioritizing based on story content
  return choices.slice(0, 3);
}

export function useStoryGeneration(
  configOverride?: ConfigDependencies,
  storeOverride?: StoreDependencies
) {
  const [story, setStoryState] = useState<string | null>(null);
  const [isStoryLoading, setIsStoryLoading] = useState<boolean>(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  
  // Always call the hook unconditionally
  const storeFromHook = useCharacterStore();
  // Use injected dependencies or fall back to real modules
  const config = configOverride || { MOCK_STORY, MOCK_STORY_TEXT, TURN_BASED_MOCK_DATA };
  const store = storeOverride || storeFromHook;
  const effectiveCharacter = store.character;

  // Update both local state and global store
  const setStory = useCallback((s: string | null) => {
    setStoryState(s);
    if (storeFromHook.updateCurrentStory) {
      storeFromHook.updateCurrentStory(s);
    }
  }, [storeFromHook]);

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
        
        // Add the story to character history
        if (storeFromHook.addStory) {
          storeFromHook.addStory({
            id: uuidv4(),
            title: `Story ${effectiveCharacter.currentTurn}`,
            description: description,
            story: mockStory,
            imageUrl: '',
            createdAt: new Date(),
          });
        }
        
        // Generate choices after story
        const choices = generateChoicesFromStory(mockStory);
        choices.forEach(choice => {
          if (storeFromHook.addChoice) {
            storeFromHook.addChoice(choice);
          }
        });
        
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
        
        // Add the story to character history
        if (storeFromHook.addStory) {
          storeFromHook.addStory({
            id: uuidv4(),
            title: `Story ${effectiveCharacter.currentTurn}`,
            description: description,
            story: data.story,
            imageUrl: '',
            createdAt: new Date(),
          });
        }
        
        // Generate choices after story
        const choices = generateChoicesFromStory(data.story);
        choices.forEach(choice => {
          if (storeFromHook.addChoice) {
            storeFromHook.addChoice(choice);
          }
        });
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

  return { story, isStoryLoading, storyError, generateStory, setStory };
} 