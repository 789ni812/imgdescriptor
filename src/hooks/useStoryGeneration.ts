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
  // Structure each turn's info, including choice and outcome
  const turns = character.storyHistory.map((s, i) => {
    // Find the choice and outcome for this turn
    const choiceOutcome = character.choiceHistory.find(c => c.turnNumber === s.turnNumber);
    return [
      `Turn ${i + 1}:`,
      `Image Description: ${s.imageDescription}`,
      `Story: ${s.text}`,
      choiceOutcome ? `Choice: ${choiceOutcome.text}` : '',
      choiceOutcome && choiceOutcome.outcome ? `Outcome: ${choiceOutcome.outcome}` : ''
    ].filter(Boolean).join('\n');
  }).join('\n\n');

  return [
    `Character: ${name}`,
    `Stats: ${statsString}`,
    turns,
    `\nINSTRUCTIONS:\n1. Carefully read the descriptions, stories, choices, and outcomes for each turn above.\n2. Briefly summarize the main event of each turn, including the player's choices and their outcomes.\n3. Then, write a single, cohesive final story that weaves together the key events, choices, and consequences from all three turns into an epic adventure.\n4. Make sure the final story references important details, choices, and outcomes from each turn and feels like a natural conclusion to the adventure.\n\nFirst, provide the summaries for each turn. Then, write the final story below:`
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
  const [isChoicesLoading, setIsChoicesLoading] = useState<boolean>(false);
  
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
    setIsChoicesLoading(true);

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
          const entry: StoryEntry = {
            id: uuidv4(),
            text: mockStory,
            timestamp: new Date().toISOString(),
            turnNumber: effectiveCharacter.currentTurn,
            imageDescription: description,
          };
          storeFromHook.addStory(entry);
        }
        
        // Generate choices after story (using static generation for mock mode)
        const choices = generateChoicesFromStory(mockStory);
        choices.forEach(choice => {
          if (storeFromHook.addChoice) {
            storeFromHook.addChoice(choice);
          }
        });
        
        setIsChoicesLoading(false);
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
          const entry: StoryEntry = {
            id: uuidv4(),
            text: data.story,
            timestamp: new Date().toISOString(),
            turnNumber: effectiveCharacter.currentTurn,
            imageDescription: description,
          };
          storeFromHook.addStory(entry);
        }
        
        // Generate LLM-based choices after story
        await generateLLMChoices(data.story, effectiveCharacter);
      } else {
        setStoryError(data.error || 'An unknown error occurred while generating the story.');
        setIsChoicesLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setStoryError(`An unexpected error occurred: ${errorMessage}`);
      setIsChoicesLoading(false);
    } finally {
      setIsStoryLoading(false);
    }
  };

  const generateLLMChoices = async (story: string, character: Character) => {
    setIsChoicesLoading(true);
    try {
      const response = await fetch('/api/generate-choices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          story,
          character,
          turn: character.currentTurn
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Add the generated choices to the character store
        data.choices.forEach((choice: Choice) => {
          if (storeFromHook.addChoice) {
            storeFromHook.addChoice(choice);
          }
        });
      } else {
        console.error('Failed to generate choices:', data.error);
        // Fallback to static choices if LLM generation fails
        const fallbackChoices = generateChoicesFromStory(story);
        fallbackChoices.forEach(choice => {
          if (storeFromHook.addChoice) {
            storeFromHook.addChoice(choice);
          }
        });
      }
    } catch (error) {
      console.error('Error generating LLM choices:', error);
      // Fallback to static choices if API call fails
      const fallbackChoices = generateChoicesFromStory(story);
      fallbackChoices.forEach(choice => {
        if (storeFromHook.addChoice) {
          storeFromHook.addChoice(choice);
        }
      });
    } finally {
      setIsChoicesLoading(false);
    }
  };

  return { story, isStoryLoading, storyError, generateStory, setStory, isChoicesLoading };
} 