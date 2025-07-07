import { useState, useCallback } from 'react';
import { DEFAULT_STORY_GENERATION_PROMPT } from '@/lib/constants';
import { MOCK_STORY, MOCK_STORY_TEXT, TURN_BASED_MOCK_DATA } from '@/lib/config';
import { useCharacterStore } from '@/lib/stores/characterStore';
import type { Character, StoryEntry, Choice } from '@/lib/types/character';
import type { DMAdaptation } from '@/lib/types/dmAdaptation';
import { v4 as uuidv4 } from 'uuid';
import type { StoryDescription } from '@/lib/types';
import { playGenerationSound } from '@/lib/utils/soundUtils';

// Debug logging utility
const DEBUG = process.env.NODE_ENV === 'development';
const debugLog = (component: string, action: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[${component}] ${action}`, data || '');
  }
};

// Helper to format image description as readable text
function formatImageDescription(desc: any): string {
  if (!desc) return '';
  return `**Setting:** ${desc.setting || ''}
**Objects:** ${Array.isArray(desc.objects) ? desc.objects.join(', ') : desc.objects || ''}
**Characters:** ${Array.isArray(desc.characters) ? desc.characters.join(', ') : desc.characters || ''}
**Mood & Atmosphere:** ${desc.mood || ''}
**Narrative Hooks:** ${Array.isArray(desc.hooks) ? desc.hooks.join(', ') : desc.hooks || ''}`;
}

export function buildStoryPrompt({ character, description, customPrompt, goodVsBadConfig, debugConfig }: {
  character: Character,
  description: string | object,
  customPrompt?: string,
  goodVsBadConfig?: import('@/lib/types/goodVsBad').GoodVsBadConfig,
  debugConfig?: import('@/lib/types/template').GameTemplate['debugConfig']
}) {
  const turn = character.currentTurn;
  const stats = character.stats;
  const statsString = `INT ${stats.intelligence}, CRE ${stats.creativity}, PER ${stats.perception}, WIS ${stats.wisdom}`;
  const previousStories = character.storyHistory
    .filter((s: StoryEntry) => s.turnNumber < turn)
    .map((s: StoryEntry) => s.text)
    .join('\n');
  const previousStoryContext = previousStories ? `Previous story: ${previousStories}` : '';

  // Robustly format the image description
  let formattedDescription = '';
  if (typeof description === 'string') {
    try {
      const imageDesc = JSON.parse(description);
      formattedDescription = formatImageDescription(imageDesc);
    } catch {
      formattedDescription = description;
    }
  } else if (typeof description === 'object' && description !== null) {
    formattedDescription = formatImageDescription(description);
  } else {
    formattedDescription = String(description);
  }

  // Inject GoodVsBad context if enabled
  let goodVsBadContext = '';
  if (goodVsBadConfig && goodVsBadConfig.isEnabled) {
    goodVsBadContext = [
      'Good vs Bad Dynamic:',
      `Theme: ${goodVsBadConfig.theme}`,
      `Hero: ${goodVsBadConfig.userRole}`,
      `Villain: ${goodVsBadConfig.badRole}`,
      `Villain Definition: ${goodVsBadConfig.badDefinition}`,
      goodVsBadConfig.badProfilePicture ? `Villain Profile Picture: ${goodVsBadConfig.badProfilePicture}` : ''
    ].filter(Boolean).join('\n');
  }

  // Add moral alignment context
  const moralAlignmentContext = [
    'Moral Alignment Context:',
    `Alignment Level: ${character.moralAlignment.level}`,
    `Moral Score: ${character.moralAlignment.score}`,
    `Reputation: ${character.moralAlignment.reputation}`,
    character.moralAlignment.recentChoices.length > 0 ? 
      `Recent Moral Choices: ${character.moralAlignment.recentChoices.slice(0, 3).join(', ')}` : 
      'No recent moral choices'
  ].join('\n');

  // Add story length instruction if debugConfig is present
  let storyLengthInstruction = '';
  if (debugConfig) {
    if (debugConfig.storyLengthCustom) {
      storyLengthInstruction += `\n\n[DEBUG] Write a story segment of ${debugConfig.storyLengthCustom} tokens or words.`;
    } else if (debugConfig.storyLength) {
      storyLengthInstruction += `\n\n[DEBUG] Write a ${debugConfig.storyLength} story segment.`;
    }
    if (debugConfig.summaryEnabled) {
      storyLengthInstruction += `\n\nAfter the story, provide a bullet list summary of all changes and the reasons for each change. Format: '- [change], Reason: [reason]'`;
    }
  }

  const contextPrompt = [
    goodVsBadContext,
    moralAlignmentContext,
    `Turn: ${turn}`,
    `Stats: ${statsString}`,
    previousStoryContext,
    `**IMAGE DESCRIPTION:**\n${formattedDescription}`
  ].filter(Boolean).join('\n\n');

  return customPrompt
    ? `${customPrompt}${storyLengthInstruction}\n\n${contextPrompt}`
    : `${DEFAULT_STORY_GENERATION_PROMPT}${storyLengthInstruction}\n\n${contextPrompt}`;
}

export function buildAdaptiveStoryPrompt({ character, description, customPrompt, goodVsBadConfig, dmAdaptations }: {
  character: Character,
  description: string | object,
  customPrompt?: string,
  goodVsBadConfig?: import('@/lib/types/goodVsBad').GoodVsBadConfig,
  dmAdaptations?: DMAdaptation['adaptations']
}) {
  const turn = character.currentTurn;
  const stats = character.stats;
  const statsString = `INT ${stats.intelligence}, CRE ${stats.creativity}, PER ${stats.perception}, WIS ${stats.wisdom}`;
  const previousStories = character.storyHistory
    .filter((s: StoryEntry) => s.turnNumber < turn)
    .map((s: StoryEntry) => s.text)
    .join('\n');
  const previousStoryContext = previousStories ? `Previous story: ${previousStories}` : '';

  // Robustly format the image description
  let formattedDescription = '';
  if (typeof description === 'string') {
    try {
      const imageDesc = JSON.parse(description);
      formattedDescription = formatImageDescription(imageDesc);
    } catch {
      formattedDescription = description;
    }
  } else if (typeof description === 'object' && description !== null) {
    formattedDescription = formatImageDescription(description);
  } else {
    formattedDescription = String(description);
  }

  // Inject GoodVsBad context if enabled
  let goodVsBadContext = '';
  if (goodVsBadConfig && goodVsBadConfig.isEnabled) {
    goodVsBadContext = [
      'Good vs Bad Dynamic:',
      `Theme: ${goodVsBadConfig.theme}`,
      `Hero: ${goodVsBadConfig.userRole}`,
      `Villain: ${goodVsBadConfig.badRole}`,
      `Villain Definition: ${goodVsBadConfig.badDefinition}`,
      goodVsBadConfig.badProfilePicture ? `Villain Profile Picture: ${goodVsBadConfig.badProfilePicture}` : ''
    ].filter(Boolean).join('\n');
  }

  // Add moral alignment context
  const moralAlignmentContext = [
    'Moral Alignment Context:',
    `Alignment Level: ${character.moralAlignment.level}`,
    `Moral Score: ${character.moralAlignment.score}`,
    `Reputation: ${character.moralAlignment.reputation}`,
    character.moralAlignment.recentChoices.length > 0 ? 
      `Recent Moral Choices: ${character.moralAlignment.recentChoices.slice(0, 3).join(', ')}` : 
      'No recent moral choices'
  ].join('\n');

  // Add DM adaptation context if provided
  let dmAdaptationContext = '';
  if (dmAdaptations) {
    const difficultySign = dmAdaptations.difficultyAdjustment >= 0 ? '+' : '';
    const challengeLevel = dmAdaptations.difficultyAdjustment > 0.2 ? 'Elevated' : 
                          dmAdaptations.difficultyAdjustment < -0.2 ? 'Reduced' : 'Standard';
    
    dmAdaptationContext = [
      'DM Adaptation Context:',
      `Difficulty Adjustment: ${difficultySign}${dmAdaptations.difficultyAdjustment}`,
      `Narrative Direction: ${dmAdaptations.narrativeDirection}`,
      `DM Mood: ${dmAdaptations.moodChange}`,
      `Challenge Level: ${challengeLevel}`,
      dmAdaptations.personalityEvolution.length > 0 ? 
        `DM Evolution: ${dmAdaptations.personalityEvolution.join(', ')}` : 
        'No personality changes',
      dmAdaptations.storyModifications.length > 0 ? 
        `Story Modifications: ${dmAdaptations.storyModifications.join(', ')}` : 
        'No story modifications'
    ].filter(Boolean).join('\n');
  }

  const contextPrompt = [
    goodVsBadContext,
    moralAlignmentContext,
    dmAdaptationContext,
    `Turn: ${turn}`,
    `Stats: ${statsString}`,
    previousStoryContext,
    `**IMAGE DESCRIPTION:**\n${formattedDescription}`
  ].filter(Boolean).join('\n\n');

  return customPrompt
    ? `${customPrompt}\n\n${contextPrompt}`
    : `${DEFAULT_STORY_GENERATION_PROMPT}\n\n${contextPrompt}`;
}

export function buildFinalStoryPrompt(character: Character & { name?: string }) {
  const stats = character.stats;
  const statsString = `INT ${stats.intelligence}, CRE ${stats.creativity}, PER ${stats.perception}, WIS ${stats.wisdom}`;
  const name = character.name || character.persona;
  
  // Create a structured summary of the character's journey
  const journeySummary = character.storyHistory.map((story, index) => {
    const choice = character.choiceHistory.find(c => c.turnNumber === story.turnNumber);
    return {
      turn: index + 1,
      imageDescription: story.imageDescription,
      story: story.text,
      choice: choice?.text || 'No choice made',
      outcome: choice?.outcome || 'No outcome recorded'
    };
  });

  return `Create a final, epic conclusion to this character's adventure. This is the culmination of their journey across three turns.

CHARACTER: ${name}
STATS: ${statsString}
ALIGNMENT: ${character.moralAlignment.level} (${character.moralAlignment.score}/100)
REPUTATION: ${character.moralAlignment.reputation}

JOURNEY SUMMARY:
${journeySummary.map(j => 
  `Turn ${j.turn}: ${j.imageDescription} - ${j.story} - Choice: ${j.choice} - Outcome: ${j.outcome}`
).join('\n')}

INSTRUCTIONS:
- Output ONLY a valid JSON object with the following keys: "sceneTitle", "summary", "dilemmas", "cues", "consequences".
- All property names and string values MUST be double-quoted.
- "dilemmas" and "consequences" must be arrays of strings (even if only one item).
- Do NOT output any text, markdown, code blocks, comments, explanations, or extra keys/objects—ONLY the JSON object.
- If a field contains quotes, escape them properly (use \").
- If you cannot determine a value, use an empty string or empty array as appropriate.
- Output ONLY the JSON object, nothing else.
- Do NOT include any comments, explanations, extra keys, or extra objects.
- If you are about to output anything other than a valid JSON object with ONLY the required fields, STOP and output {} instead.
- If you are unsure, output an empty string or empty array for that field.
- If you cannot output a valid JSON object, output: {}

Create a final story that weaves together all the character's choices, consequences, and growth into an epic conclusion. The story should reflect their moral alignment, reputation, and the consequences of their choices throughout the adventure.`;
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
  goodVsBadConfig?: import('@/lib/types/goodVsBad').GoodVsBadConfig;
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
  storeOverride?: StoreDependencies,
  debugConfigOverride?: import('@/lib/types/template').GameTemplate['debugConfig']
) {
  const [story, setStoryState] = useState<StoryDescription | undefined>(undefined);
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
  const setStory = useCallback((s: StoryDescription | undefined) => {
    setStoryState(s);
    if (storeFromHook.updateCurrentStory) {
      storeFromHook.updateCurrentStory(s);
    }
  }, [storeFromHook]);

  const generateStory = async (description: string, customPrompt?: string) => {
    debugLog('useStoryGeneration', 'Starting story generation', { 
      descriptionLength: description.length, 
      customPrompt: !!customPrompt,
      mockMode: config.MOCK_STORY,
      currentTurn: effectiveCharacter.currentTurn 
    });
    
    if (!description) {
      debugLog('useStoryGeneration', 'No description provided');
      setStoryError('Cannot generate a story without a description.');
      return;
    }

    setIsStoryLoading(true);
    setStory(undefined);
    setStoryError(null);
    setIsChoicesLoading(true);

    // Mock mode: instantly return mock story
    if (config.MOCK_STORY) {
      setTimeout(() => {
        // Try to get turn-based mock data first
        const turnBasedStory = config.TURN_BASED_MOCK_DATA.stories[effectiveCharacter.currentTurn as keyof typeof config.TURN_BASED_MOCK_DATA.stories];
        
        // Use turn-based data if available, otherwise fall back to default
        const mockStoryText = turnBasedStory || config.MOCK_STORY_TEXT;
        // Convert mock text to StoryDescription object
        const mockStory: StoryDescription = {
          sceneTitle: 'Mock Story Scene',
          summary: mockStoryText,
          dilemmas: ['Mock dilemma 1', 'Mock dilemma 2'],
          cues: 'Mock visual cues',
          consequences: ['Mock consequence 1', 'Mock consequence 2']
        };
        setStory(mockStory);
        // Add the story to character history
        if (storeFromHook.addStory) {
          const entry: StoryEntry = {
            id: uuidv4(),
            text: JSON.stringify(mockStory),
            timestamp: new Date().toISOString(),
            turnNumber: effectiveCharacter.currentTurn,
            imageDescription: description,
          };
          storeFromHook.addStory(entry);
        }
        // Generate choices after story (using static generation for mock mode)
        const choices = generateChoicesFromStory(mockStoryText);
        choices.forEach(choice => {
          if (storeFromHook.addChoice) {
            storeFromHook.addChoice(choice);
          }
        });
        setIsChoicesLoading(false);
        setIsStoryLoading(false);
        playGenerationSound(); // Play after mock story+choices
      }, 300); // Simulate a short delay
      return;
    }

    const prompt = buildStoryPrompt({ 
      character: effectiveCharacter, 
      description, 
      customPrompt,
      goodVsBadConfig: 'goodVsBadConfig' in store ? store.goodVsBadConfig : undefined,
      debugConfig: debugConfigOverride
    });

    // DEBUG: Log the full prompt being sent to the LLM
    console.log('[StoryGeneration] Full prompt sent to LLM:', prompt);

    debugLog('useStoryGeneration', 'Story prompt built', { 
      promptLength: prompt.length,
      hasGoodVsBadConfig: 'goodVsBadConfig' in store 
    });

    try {
      debugLog('useStoryGeneration', 'Sending story generation API request');
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, prompt, debugConfig: debugConfigOverride }),
      });

      debugLog('useStoryGeneration', 'Story API response received', { 
        status: response.status, 
        ok: response.ok 
      });

      const data = await response.json();

      if (response.ok && data.success) {
        debugLog('useStoryGeneration', 'Story generation successful', { 
          story: data.story 
        });
        
        setStory(data.story);
        
        // Add the story to character history
        if (storeFromHook.addStory) {
          const entry: StoryEntry = {
            id: uuidv4(),
            text: JSON.stringify(data.story),
            timestamp: new Date().toISOString(),
            turnNumber: effectiveCharacter.currentTurn,
            imageDescription: description,
          };
          storeFromHook.addStory(entry);
          debugLog('useStoryGeneration', 'Story added to character history', { 
            turnNumber: effectiveCharacter.currentTurn 
          });
        }

        // --- DM Reflection Integration ---
        let dmReflection = '';
        try {
          const dmReflectionRes = await fetch('/api/dm-reflection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              character: effectiveCharacter,
              currentTurn: effectiveCharacter.currentTurn,
              imageDescription: description,
              generatedStory: data.story,
              playerChoices: effectiveCharacter.choiceHistory || [],
              choiceOutcomes: effectiveCharacter.choicesHistory || [],
              dmPersonality: {
                name: 'Default DM',
                style: 'neutral',
                personality: 'balanced',
                description: 'A balanced dungeon master'
              },
              currentMood: 'neutral',
              previousAdaptations: [],
              playerPerformance: {
                alignmentChange: 0,
                choiceQuality: 'neutral',
                storyEngagement: 0.5,
                difficultyRating: 0.5
              }
            }),
          });
          if (dmReflectionRes.ok) {
            const dmReflectionData = await dmReflectionRes.json();
            if (dmReflectionData && dmReflectionData.reflection) {
              dmReflection = dmReflectionData.reflection;
              playGenerationSound(); // Play after DM reflection
            }
          }
        } catch (e) {
          debugLog('useStoryGeneration', 'DM Reflection API failed', e);
        }
        // --- End DM Reflection Integration ---
        
        // Generate LLM-based choices after story, passing DM Reflection
        await generateLLMChoices(data.story, effectiveCharacter, dmReflection);
      } else {
        debugLog('useStoryGeneration', 'Story generation failed', { error: data.error });
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

  const generateAdaptiveStory = async (description: string, dmAdaptations: DMAdaptation['adaptations'], customPrompt?: string) => {
    if (!description) {
      setStoryError('Cannot generate a story without a description.');
      return;
    }

    setIsStoryLoading(true);
    setStory(undefined);
    setStoryError(null);
    setIsChoicesLoading(true);

    // Mock mode: instantly return mock story
    if (config.MOCK_STORY) {
      setTimeout(() => {
        // Try to get turn-based mock data first
        const turnBasedStory = config.TURN_BASED_MOCK_DATA.stories[effectiveCharacter.currentTurn as keyof typeof config.TURN_BASED_MOCK_DATA.stories];
        
        // Use turn-based data if available, otherwise fall back to default
        const mockStoryText = turnBasedStory || config.MOCK_STORY_TEXT;
        // Convert mock text to StoryDescription object
        const mockStory: StoryDescription = {
          sceneTitle: 'Mock Story Scene',
          summary: mockStoryText,
          dilemmas: ['Mock dilemma 1', 'Mock dilemma 2'],
          cues: 'Mock visual cues',
          consequences: ['Mock consequence 1', 'Mock consequence 2']
        };
        setStory(mockStory);
        // Add the story to character history
        if (storeFromHook.addStory) {
          const entry: StoryEntry = {
            id: uuidv4(),
            text: JSON.stringify(mockStory),
            timestamp: new Date().toISOString(),
            turnNumber: effectiveCharacter.currentTurn,
            imageDescription: description,
          };
          storeFromHook.addStory(entry);
        }
        // Generate choices after story (using static generation for mock mode)
        const choices = generateChoicesFromStory(mockStoryText);
        choices.forEach(choice => {
          if (storeFromHook.addChoice) {
            storeFromHook.addChoice(choice);
          }
        });
        setIsChoicesLoading(false);
        setIsStoryLoading(false);
        playGenerationSound(); // Play after mock story+choices
      }, 300); // Simulate a short delay
      return;
    }

    const prompt = buildAdaptiveStoryPrompt({ 
      character: effectiveCharacter, 
      description, 
      customPrompt,
      goodVsBadConfig: 'goodVsBadConfig' in store ? store.goodVsBadConfig : undefined,
      dmAdaptations
    });

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
            text: JSON.stringify(data.story),
            timestamp: new Date().toISOString(),
            turnNumber: effectiveCharacter.currentTurn,
            imageDescription: description,
          };
          storeFromHook.addStory(entry);
        }
        
        // --- DM Reflection Integration ---
        let dmReflection = '';
        try {
          const dmReflectionRes = await fetch('/api/dm-reflection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              character: effectiveCharacter,
              currentTurn: effectiveCharacter.currentTurn,
              imageDescription: description,
              generatedStory: data.story,
              playerChoices: effectiveCharacter.choiceHistory || [],
              choiceOutcomes: effectiveCharacter.choicesHistory || [],
              dmPersonality: {
                name: 'Default DM',
                style: 'neutral',
                personality: 'balanced',
                description: 'A balanced dungeon master'
              },
              currentMood: 'neutral',
              previousAdaptations: dmAdaptations || [],
              playerPerformance: {
                alignmentChange: 0,
                choiceQuality: 'neutral',
                storyEngagement: 0.5,
                difficultyRating: 0.5
              }
            }),
          });
          if (dmReflectionRes.ok) {
            const dmReflectionData = await dmReflectionRes.json();
            if (dmReflectionData && dmReflectionData.reflection) {
              dmReflection = dmReflectionData.reflection;
              playGenerationSound(); // Play after DM reflection
            }
          }
        } catch (e) {
          debugLog('useStoryGeneration', 'DM Reflection API failed', e);
        }
        // --- End DM Reflection Integration ---
        
        // Generate LLM-based choices after story, passing DM Reflection
        await generateLLMChoices(data.story, effectiveCharacter, dmReflection);
      } else {
        setStoryError(data.error || 'An unknown error occurred while generating the adaptive story.');
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

  const generateLLMChoices = async (story: string, character: Character, dmReflection?: string) => {
    try {
      setIsChoicesLoading(true);
      const response = await fetch('/api/generate-choices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story, character, turn: character.currentTurn, dmReflection }),
      });
      const data = await response.json();
      if (response.ok && data.success && Array.isArray(data.choices)) {
        data.choices.forEach((choice: Choice) => {
          if (storeFromHook.addChoice) {
            storeFromHook.addChoice(choice);
          }
        });
        playGenerationSound(); // Play after LLM choices
      }
    } catch (e) {
      debugLog('useStoryGeneration', 'Choice generation failed', e);
    } finally {
      setIsChoicesLoading(false);
    }
  };

  return { story, isStoryLoading, storyError, generateStory, generateAdaptiveStory, setStory, isChoicesLoading };
} 