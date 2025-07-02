import { Character } from '../types/character';
import { Choice, ChoiceOutcome } from '../types/character';
import { DungeonMasterTemplate } from '../types/dungeonMaster';

// Types for DM reflection system
export interface DMReflectionContext {
  // Current game state
  character: Character;
  currentTurn: number;
  imageDescription: string;
  generatedStory: string;
  playerChoices: Choice[];
  choiceOutcomes: ChoiceOutcome[];
  
  // DM personality and state
  dmPersonality: DungeonMasterTemplate;
  currentMood: 'positive' | 'negative' | 'neutral';
  previousAdaptations: DMAdaptation[];
  
  // Player performance metrics
  playerPerformance: {
    alignmentChange: number;
    choiceQuality: 'good' | 'neutral' | 'poor';
    storyEngagement: number;
    difficultyRating: number;
  };
}

export interface DMReflectionResponse {
  reflection: string;
  adaptations: {
    difficultyAdjustment: number;
    narrativeDirection: string;
    moodChange: 'positive' | 'negative' | 'neutral';
    personalityEvolution: string[];
    storyModifications: string[];
  };
  playerAssessment: {
    engagement: number;
    understanding: number;
    satisfaction: number;
  };
}

// Temporary interface for DMAdaptation (will be moved to separate file in Task 29.2)
export interface DMAdaptation {
  id: string;
  turnNumber: number;
  timestamp: string;
  reflection: string;
  playerPerformance: {
    alignmentChange: number;
    choiceQuality: 'good' | 'neutral' | 'poor';
    storyEngagement: number;
    difficultyRating: number;
    responseTime: number;
    choiceConsistency: number;
  };
  adaptations: {
    difficultyAdjustment: number;
    narrativeDirection: string;
    moodChange: 'positive' | 'negative' | 'neutral';
    personalityEvolution: string[];
    storyModifications: string[];
  };
  impact: {
    storyQuality: number;
    playerEngagement: number;
    narrativeCoherence: number;
  };
}

/**
 * Builds a DM reflection prompt based on the current game context
 */
export function buildDMReflectionPrompt(context: DMReflectionContext): string {
  const { character, currentTurn, imageDescription, generatedStory, playerChoices, choiceOutcomes, dmPersonality, currentMood, previousAdaptations, playerPerformance } = context;

  // Format player choices and outcomes
  const choicesText = playerChoices.map(choice => `- ${choice.text}`).join('\n');
  const outcomesText = choiceOutcomes.map(outcome => `- ${outcome.outcome}`).join('\n');

  // Format previous adaptations
  const adaptationsText = previousAdaptations.length > 0 
    ? previousAdaptations.map(adapt => 
        `Turn ${adapt.turnNumber}: "${adapt.reflection}" - ${adapt.adaptations.narrativeDirection} - ${adapt.adaptations.personalityEvolution.join(', ')}`
      ).join('\n')
    : 'None';

  return `
You are ${dmPersonality.personality.name}, a ${dmPersonality.personality.style} Dungeon Master.

CURRENT GAME STATE:
- Player Alignment: ${character.moralAlignment.level} (${character.moralAlignment.score})
- Player Stats: INT ${character.stats.intelligence}, CRE ${character.stats.creativity}, PER ${character.stats.perception}, WIS ${character.stats.wisdom}
- Current Turn: ${currentTurn}
- Recent Choices: ${character.moralAlignment.recentChoices.join(', ')}

TURN SUMMARY:
- Image Description: ${imageDescription}
- Generated Story: ${generatedStory}
- Player Choices: 
${choicesText}
- Outcomes: 
${outcomesText}

PLAYER PERFORMANCE:
- Alignment Change: ${playerPerformance.alignmentChange}
- Choice Quality: ${playerPerformance.choiceQuality}
- Story Engagement: ${playerPerformance.storyEngagement}/100
- Difficulty Rating: ${playerPerformance.difficultyRating}/10

Previous Adaptations:
${adaptationsText}

CURRENT DM MOOD: ${currentMood}

REFLECTION TASK:
1. Analyze the player's choices and their moral implications
2. Consider how the story is progressing and if it aligns with your DM style
3. Assess the player's engagement and understanding of the narrative
4. Determine if difficulty adjustments are needed
5. Plan adaptations for the next turn based on your personality and the player's behavior

Provide your reflection in this exact format:
REFLECTION: [Your thoughts on the turn and player behavior]
DIFFICULTY_ADJUSTMENT: [+/- number based on player performance]
NARRATIVE_DIRECTION: [How you want to guide the story next]
MOOD_CHANGE: [positive/negative/neutral based on satisfaction]
PERSONALITY_EVOLUTION: [How this turn affects your DM personality, comma-separated list]
`;
}

/**
 * Parses a DM reflection response from the LLM
 */
export function parseDMReflectionResponse(response: string): DMReflectionResponse {
  const lines = response.trim().split('\n');
  
  let reflection = '';
  let difficultyAdjustment = 0;
  let narrativeDirection = '';
  let moodChange: 'positive' | 'negative' | 'neutral' = 'neutral';
  let personalityEvolution: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('REFLECTION:')) {
      reflection = trimmedLine.replace('REFLECTION:', '').trim();
    } else if (trimmedLine.startsWith('DIFFICULTY_ADJUSTMENT:')) {
      const value = trimmedLine.replace('DIFFICULTY_ADJUSTMENT:', '').trim();
      difficultyAdjustment = parseInt(value) || 0;
    } else if (trimmedLine.startsWith('NARRATIVE_DIRECTION:')) {
      narrativeDirection = trimmedLine.replace('NARRATIVE_DIRECTION:', '').trim();
    } else if (trimmedLine.startsWith('MOOD_CHANGE:')) {
      const mood = trimmedLine.replace('MOOD_CHANGE:', '').trim();
      if (mood === 'positive' || mood === 'negative' || mood === 'neutral') {
        moodChange = mood;
      }
    } else if (trimmedLine.startsWith('PERSONALITY_EVOLUTION:')) {
      const evolution = trimmedLine.replace('PERSONALITY_EVOLUTION:', '').trim();
      personalityEvolution = evolution.split(',').map(e => e.trim()).filter(e => e.length > 0);
    }
  }

  // Validate that we have the required fields
  if (!reflection || !narrativeDirection) {
    throw new Error('Invalid reflection response format');
  }

  return {
    reflection,
    adaptations: {
      difficultyAdjustment,
      narrativeDirection,
      moodChange,
      personalityEvolution,
      storyModifications: []
    },
    playerAssessment: {
      engagement: 0,
      understanding: 0,
      satisfaction: 0
    }
  };
}

/**
 * Validates a DM reflection context
 */
export function validateReflectionContext(context: DMReflectionContext): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!context.imageDescription) {
    errors.push('imageDescription is required');
  }
  if (!context.generatedStory) {
    errors.push('generatedStory is required');
  }
  if (!context.playerChoices || context.playerChoices.length === 0) {
    errors.push('playerChoices is required');
  }
  if (!context.choiceOutcomes) {
    errors.push('choiceOutcomes is required');
  }
  if (!context.dmPersonality) {
    errors.push('dmPersonality is required');
  }
  if (!context.character) {
    errors.push('character is required');
  }

  // Validate player performance metrics
  if (context.playerPerformance) {
    const { choiceQuality, storyEngagement } = context.playerPerformance;
    
    if (choiceQuality && !['good', 'neutral', 'poor'].includes(choiceQuality)) {
      errors.push('choiceQuality must be one of: good, neutral, poor');
    }
    
    if (storyEngagement !== undefined && (storyEngagement < 0 || storyEngagement > 100)) {
      errors.push('storyEngagement must be between 0 and 100');
    }
  }

  // Validate mood
  if (context.currentMood && !['positive', 'negative', 'neutral'].includes(context.currentMood)) {
    errors.push('currentMood must be one of: positive, negative, neutral');
  }

  // Validate turn number
  if (context.currentTurn !== undefined && context.currentTurn < 1) {
    errors.push('currentTurn must be at least 1');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 