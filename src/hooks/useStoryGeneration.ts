import { useState, useCallback } from 'react';
import { DEFAULT_STORY_GENERATION_PROMPT } from '@/lib/constants';
import { MOCK_STORY, MOCK_STORY_TEXT, TURN_BASED_MOCK_DATA } from '@/lib/config';
import { useCharacterStore } from '@/lib/stores/characterStore';
import type { Character, StoryEntry, Choice } from '@/lib/types/character';
import type { DMAdaptation } from '@/lib/types/dmAdaptation';
import { v4 as uuidv4 } from 'uuid';
import type { StoryDescription } from '@/lib/types';
import { playGenerationSound } from '@/lib/utils/soundUtils';
import { createStoryContinuityPrompt } from '@/lib/prompts/gameStatePrompts';
// API function to call the generate-story endpoint
async function generateStoryApi(description: string, prompt?: string, debugConfig?: import('@/lib/types/template').GameTemplate['debugConfig']) {
  const response = await fetch('/api/generate-story', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description,
      prompt,
      debugConfig,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return { success: false, error: errorData.error || 'Failed to generate story' };
  }

  const data = await response.json();
  return { success: true, story: data.story, warning: data.warning };
}

// Debug logging utility
const DEBUG = process.env.NODE_ENV === 'development';
const debugLog = (component: string, action: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[${component}] ${action}`, data || '');
  }
};

// Helper to format image description as readable text
function formatImageDescription(desc: Record<string, unknown>): string {
  if (!desc) return '';
  return `**Setting:** ${typeof desc.setting === 'string' ? desc.setting : ''}
**Objects:** ${Array.isArray(desc.objects) ? desc.objects.join(', ') : typeof desc.objects === 'string' ? desc.objects : ''}
**Characters:** ${Array.isArray(desc.characters) ? desc.characters.join(', ') : typeof desc.characters === 'string' ? desc.characters : ''}
**Mood & Atmosphere:** ${typeof desc.mood === 'string' ? desc.mood : ''}
**Narrative Hooks:** ${Array.isArray(desc.hooks) ? desc.hooks.join(', ') : typeof desc.hooks === 'string' ? desc.hooks : ''}`;
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

  // Robustly format the image description
  let formattedDescription = '';
  if (typeof description === 'string') {
    try {
      const imageDesc = JSON.parse(description);
      formattedDescription = formatImageDescription(imageDesc as Record<string, unknown>);
    } catch {
      formattedDescription = description;
    }
  } else if (typeof description === 'object' && description !== null) {
    formattedDescription = formatImageDescription(description as Record<string, unknown>);
  } else {
    formattedDescription = String(description);
  }

  // Enhanced GoodVsBad context with villain personality
  let goodVsBadContext = '';
  if (goodVsBadConfig && goodVsBadConfig.isEnabled) {
    const villain = goodVsBadConfig.villainPersonality;
    const villainState = goodVsBadConfig.villainState;
    const conflict = goodVsBadConfig.conflictMechanics;
    goodVsBadContext = `
VILLAIN CONTEXT:
Name: ${goodVsBadConfig.badRole}
Theme: ${goodVsBadConfig.theme}
Personality:
  - Motivations: ${villain?.motivations?.join(', ') || 'Unknown'}
  - Fears: ${villain?.fears?.join(', ') || 'Unknown'}
  - Strengths: ${villain?.strengths?.join(', ') || 'Unknown'}
  - Weaknesses: ${villain?.weaknesses?.join(', ') || 'Unknown'}
  - Backstory: ${villain?.backstory || 'Unknown'}
  - Goals: ${villain?.goals?.join(', ') || 'Unknown'}
  - Speech Style: ${villain?.speechStyle || 'Unknown'}
  - Dialogue Patterns: ${villain?.dialoguePatterns?.join(', ') || 'Unknown'}
  - Relationship with Player: ${villain?.relationshipWithPlayer || 'Unknown'}
  - Influence Level: ${villain?.influenceLevel ?? 'Unknown'}
  - Resources: ${villain?.resources?.join(', ') || 'Unknown'}
  - Territory: ${villain?.territory?.join(', ') || 'Unknown'}

STATE:
  - Health: ${villainState?.health ?? 'Unknown'}
  - Resources: ${villainState?.resources ?? 'Unknown'}
  - Influence: ${villainState?.influence ?? 'Unknown'}
  - Anger: ${villainState?.anger ?? 'Unknown'}
  - Respect: ${villainState?.respect ?? 'Unknown'}
  - Memory: ${villainState?.memory?.join('; ') || 'None'}
  - Current Goal: ${villainState?.currentGoal || 'Unknown'}
  - Last Action: ${villainState?.lastAction || 'Unknown'}
  - Territory Control: ${villainState?.territoryControl?.join(', ') || 'Unknown'}

CONFLICT MECHANICS:
  - Escalation Level: ${conflict?.escalationLevel ?? 'Unknown'}
  - Confrontation Type: ${conflict?.confrontationType || 'Unknown'}
  - Villain Reaction Style: ${conflict?.villainReactionStyle || 'Unknown'}
  - Player Advantage: ${conflict?.playerAdvantage ?? 'Unknown'}
  - Villain Advantage: ${conflict?.villainAdvantage ?? 'Unknown'}
  - Conflict History: ${conflict?.conflictHistory?.join('; ') || 'None'}

VILLAIN INSTRUCTIONS:
- Make the villain a driving force in the story, not just an obstacle
- Reference their personality traits, strengths, weaknesses, and current state
- Show how their actions affect the player's situation
- Create meaningful confrontations that test the player's values
- Build tension through the villain's presence and influence`;
  }

  // Add story continuity context
  const continuityContext = createStoryContinuityPrompt({
    character,
    gameState: {
      storyHistory: character.storyHistory.map(s => ({ 
        text: s.text, 
        turnNumber: s.turnNumber,
        id: s.id,
        timestamp: s.timestamp,
        imageDescription: s.imageDescription
      })),
      choiceHistory: character.choiceHistory,
      currentTurn: turn,
      maxTurns: 3
    }
  });

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

  // Add first turn specific instructions
  let firstTurnInstructions = '';
  if (turn === 1) {
    firstTurnInstructions = `

FIRST TURN REQUIREMENTS:
CRITICAL: This is the opening scene of the adventure. You MUST reference the following image details in the first paragraph: setting, objects, mood, hooks. If you do not reference the image elements, the story will be rejected.

FIRST TURN IMAGE INTEGRATION:
- Your opening paragraph MUST directly reference the image's setting, objects, mood, and hooks
- This establishes the visual foundation for the entire adventure
- Failure to integrate image elements will result in story rejection
- The image elements are: ${formattedDescription.split('\n').slice(0, 5).join(', ')}

FIRST TURN NARRATIVE REQUIREMENTS:
- Establish the character's initial situation and motivation
- Set up the primary conflict or challenge
- Create a strong hook that draws the player into the adventure
- Reference specific visual elements from the image description
- Make the scene feel immediate and engaging`;
  }

  const gamebookInstruction = `
GAMEBOOK STYLE REQUIREMENTS:
- Write in clear, coherent English
- Avoid repetitive or nonsensical text
- Make each scene feel like part of a larger adventure
- Include specific details from the image description
- Create meaningful moral or tactical choices
- Maintain consistent tone and style
- Reference previous story events and choices
- Show consequences of previous decisions
- Build toward a larger narrative goal

STORY STRUCTURE:
1. Opening: Set the scene using image details
2. Conflict: Present a clear challenge or decision point
3. Choices: Set up 2-3 meaningful options for the player
4. Consequences: Explain what each choice might lead to

**General Instructions:**
- The new story must be set in the scene described by the image.
- You MUST reference the following image details in the first paragraph: setting, objects, mood, hooks. If you do not, the story will be rejected.
- Reference the image's setting, objects, mood, and hooks.
- Make explicit, gamebook-style decisions and consequences.
- Adjust the player's health/stats if appropriate.
- If the player's health reaches zero, narrate their demise.
- End with a clear dilemma or choice for the player.
- The villain should be a driving force in the story, not just an obstacle.
`;

  const contextPrompt = [
    continuityContext,
    goodVsBadContext,
    moralAlignmentContext,
    `Turn: ${turn}`,
    `Stats: ${statsString}`,
    `**IMAGE DESCRIPTION:**\n${formattedDescription}`
  ].filter(Boolean).join('\n\n');

  const finalPrompt = customPrompt
    ? `${customPrompt}${storyLengthInstruction}${firstTurnInstructions}\n\n${gamebookInstruction}\n\n${contextPrompt}`
    : `${DEFAULT_STORY_GENERATION_PROMPT}${storyLengthInstruction}${firstTurnInstructions}\n\n${gamebookInstruction}\n\n${contextPrompt}`;

  return finalPrompt;
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

  // Robustly format the image description
  let formattedDescription = '';
  if (typeof description === 'string') {
    try {
      const imageDesc = JSON.parse(description);
      formattedDescription = formatImageDescription(imageDesc as Record<string, unknown>);
    } catch {
      formattedDescription = description;
    }
  } else if (typeof description === 'object' && description !== null) {
    formattedDescription = formatImageDescription(description as Record<string, unknown>);
  } else {
    formattedDescription = String(description);
  }

  // Enhanced GoodVsBad context with villain personality
  let goodVsBadContext = '';
  if (goodVsBadConfig && goodVsBadConfig.isEnabled) {
    const villain = goodVsBadConfig.villainPersonality;
    const villainState = goodVsBadConfig.villainState;
    const conflict = goodVsBadConfig.conflictMechanics;
    
    goodVsBadContext = `
VILLAIN CONTEXT:
Name: ${goodVsBadConfig.badRole}
Personality: ${villain?.motivations.join(', ') || 'Unknown'}
Current State: Health ${villainState?.health || 100}/100, Influence ${villainState?.influence || 100}/100
Conflict Level: ${conflict?.escalationLevel || 5}
Recent Actions: ${villainState?.lastAction || 'None recorded'}

VILLAIN INSTRUCTIONS:
- Make the villain a driving force in the story, not just an obstacle
- Reference their personality traits and current state
- Show how their actions affect the player's situation
- Create meaningful confrontations that test the player's values
- Build tension through the villain's presence and influence`;
  }

  // Add story continuity context
  const continuityContext = createStoryContinuityPrompt({
    character,
    gameState: {
      storyHistory: character.storyHistory.map(s => ({ 
        text: s.text, 
        turnNumber: s.turnNumber,
        id: s.id,
        timestamp: s.timestamp,
        imageDescription: s.imageDescription
      })),
      choiceHistory: character.choiceHistory,
      currentTurn: turn,
      maxTurns: 3
    }
  });

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
    setIsStoryLoading(true);
    setStoryError(null);
    // Use the effectiveCharacter from the hook scope
    try {
      // Determine temperature based on turn (unless overridden by debugConfig)
      let aiResponseTuning = debugConfigOverride?.aiResponseTuning;
      if (!aiResponseTuning) {
        aiResponseTuning = {
          temperature: effectiveCharacter.currentTurn === 1 ? 0.3 : 0.6,
          maxTokens: 1500,
          topP: 0.85,
          frequencyPenalty: 0.2,
          presencePenalty: 0.15,
        };
      }
      // Always build the prompt using buildStoryPrompt
      const prompt = buildStoryPrompt({
        character: effectiveCharacter,
        description,
        customPrompt,
        goodVsBadConfig: storeOverride?.goodVsBadConfig,
        debugConfig: debugConfigOverride
      });
      // Build a minimal valid debugConfig for generateStoryApi
      const debugConfig: import('@/lib/types/template').GameTemplate['debugConfig'] = {
        storyLength: debugConfigOverride?.storyLength || 'medium',
        choiceCount: debugConfigOverride?.choiceCount || 3,
        enableVerboseLogging: debugConfigOverride?.enableVerboseLogging || false,
        summaryEnabled: debugConfigOverride?.summaryEnabled || false,
        performanceMetrics: debugConfigOverride?.performanceMetrics || { enabled: false, trackStoryGeneration: false, trackChoiceGeneration: false, trackImageAnalysis: false, trackDMReflection: false },
        aiResponseTuning,
        userExperience: debugConfigOverride?.userExperience || { storyPacing: 'medium', choiceComplexity: 'moderate', narrativeDepth: 'medium', characterDevelopment: 'medium', moralComplexity: 'medium' },
        testing: debugConfigOverride?.testing || { enableMockMode: false, mockResponseDelay: 0, enableStressTesting: false, maxConcurrentRequests: 1 },
      };
      const result = await generateStoryApi(
        description,
        prompt,
        debugConfig
      );
      if (result.success) {
        debugLog('useStoryGeneration', 'Story generation successful', { 
          story: result.story 
        });
        
        // --- IMAGE REFERENCE CHECK ---
        let imageReferenceWarning = '';
        try {
          const imageDesc = typeof description === 'string' ? JSON.parse(description) : description;
          const storyText = JSON.stringify(result.story).toLowerCase();
          const hasSetting = imageDesc.setting && storyText.includes(imageDesc.setting.toLowerCase());
          const hasObject = imageDesc.objects && imageDesc.objects.some((obj: string) => storyText.includes(obj.toLowerCase()));
          const hasMood = imageDesc.mood && storyText.includes(imageDesc.mood.toLowerCase());
          const hasHook = imageDesc.hooks && imageDesc.hooks.some((hook: string) => storyText.includes(hook.toLowerCase()));
          if (!hasSetting && !hasObject && !hasMood && !hasHook) {
            imageReferenceWarning = 'The story does not reference the image description. Please retry or regenerate.';
          }
        } catch {}
        // --- END IMAGE REFERENCE CHECK ---
        setStoryState(result.story);
        if (imageReferenceWarning) {
          setStoryError(imageReferenceWarning);
        }
        
        // Add the story to character history
        if (storeFromHook.addStory) {
          const entry: StoryEntry = {
            id: uuidv4(),
            text: JSON.stringify(result.story),
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
              generatedStory: result.story,
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
        
        // --- GAME OVER CHECK ---
        const isDead = effectiveCharacter.stats.wisdom <= 0; // You can change to health or another stat if needed
        if (isDead) {
          setStoryError('Game Over: Your character has died.');
          setIsChoicesLoading(false);
          return;
        }
        // --- END GAME OVER CHECK ---
        
        // Generate LLM-based choices after story, passing DM Reflection
        if (result.story && typeof result.story.summary === 'string') {
          await generateLLMChoices(result.story.summary, effectiveCharacter, dmReflection);
        }
      } else {
        debugLog('useStoryGeneration', 'Story generation failed', { error: result.error });
        setStoryError(result.error || 'An unknown error occurred while generating the story.');
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
        
        // --- GAME OVER CHECK ---
        const isDead = effectiveCharacter.stats.wisdom <= 0; // You can change to health or another stat if needed
        if (isDead) {
          setStoryError('Game Over: Your character has died.');
          setIsChoicesLoading(false);
          return;
        }
        // --- END GAME OVER CHECK ---
        
        // Generate LLM-based choices after story, passing DM Reflection
        if (data.story && typeof data.story.summary === 'string') {
          await generateLLMChoices(data.story.summary, effectiveCharacter, dmReflection);
        }
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