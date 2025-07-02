import { Character, Choice, ChoiceOutcome } from './character';
import { v4 as uuidv4 } from 'uuid';

// DM Adaptation Types
export interface PlayerPerformanceMetrics {
  alignmentChange: number;
  choiceQuality: 'good' | 'neutral' | 'poor';
  storyEngagement: number;              // 0-100 scale
  difficultyRating: number;             // 1-10 scale
  responseTime: number;                 // Average time to make choices (seconds)
  choiceConsistency: number;            // How consistent choices are (0-1)
}

export interface DMAdaptation {
  id: string;
  turnNumber: number;
  timestamp: string;
  
  // Reflection data
  reflection: string;
  playerPerformance: PlayerPerformanceMetrics;
  
  // Adaptation decisions
  adaptations: {
    difficultyAdjustment: number;        // -10 to +10 scale
    narrativeDirection: string;          // e.g., "darken tone", "increase mystery"
    moodChange: 'positive' | 'negative' | 'neutral';
    personalityEvolution: string[];     // New traits or changes
    storyModifications: string[];       // Specific story changes
  };
  
  // Impact tracking
  impact: {
    storyQuality: number;               // 1-10 scale
    playerEngagement: number;           // 0-100 scale
    narrativeCoherence: number;         // 1-10 scale
  };
}

// Extended Character interface with DM adaptations
export interface ExtendedCharacter extends Character {
  dmAdaptations: DMAdaptation[];
  currentDMMood: 'positive' | 'negative' | 'neutral';
  dmPersonalityEvolution: string[];
  difficultyModifier: number;
}

/**
 * Validates a DM adaptation object
 */
export function validateDMAdaptation(adaptation: DMAdaptation): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!adaptation.reflection) {
    errors.push('reflection is required');
  }
  if (!adaptation.playerPerformance) {
    errors.push('playerPerformance is required');
  }
  if (!adaptation.adaptations) {
    errors.push('adaptations is required');
  }
  if (!adaptation.impact) {
    errors.push('impact is required');
  }

  // Validate turn number
  if (adaptation.turnNumber < 1) {
    errors.push('turnNumber must be at least 1');
  }

  // Validate player performance if present
  if (adaptation.playerPerformance) {
    const { storyEngagement, difficultyRating, choiceQuality } = adaptation.playerPerformance;
    
    if (storyEngagement !== undefined && (storyEngagement < 0 || storyEngagement > 100)) {
      errors.push('storyEngagement must be between 0 and 100');
    }
    
    if (difficultyRating !== undefined && (difficultyRating < 1 || difficultyRating > 10)) {
      errors.push('difficultyRating must be between 1 and 10');
    }
    
    if (choiceQuality && !['good', 'neutral', 'poor'].includes(choiceQuality)) {
      errors.push('choiceQuality must be one of: good, neutral, poor');
    }
  }

  // Validate adaptations if present
  if (adaptation.adaptations) {
    const { difficultyAdjustment, moodChange } = adaptation.adaptations;
    
    if (difficultyAdjustment !== undefined && (difficultyAdjustment < -10 || difficultyAdjustment > 10)) {
      errors.push('difficultyAdjustment must be between -10 and 10');
    }
    
    if (moodChange && !['positive', 'negative', 'neutral'].includes(moodChange)) {
      errors.push('moodChange must be one of: positive, negative, neutral');
    }
  }

  // Validate impact if present
  if (adaptation.impact) {
    const { storyQuality, playerEngagement, narrativeCoherence } = adaptation.impact;
    
    if (storyQuality !== undefined && (storyQuality < 1 || storyQuality > 10)) {
      errors.push('storyQuality must be between 1 and 10');
    }
    
    if (playerEngagement !== undefined && (playerEngagement < 0 || playerEngagement > 100)) {
      errors.push('playerEngagement must be between 0 and 100');
    }
    
    if (narrativeCoherence !== undefined && (narrativeCoherence < 1 || narrativeCoherence > 10)) {
      errors.push('narrativeCoherence must be between 1 and 10');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Creates a new DM adaptation with generated ID and timestamp
 */
export function createDMAdaptation(data: Omit<DMAdaptation, 'id' | 'timestamp'>): DMAdaptation {
  return {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...data
  };
}

/**
 * Calculates player performance metrics from character state and choices
 */
export function calculatePlayerPerformance(
  character: Character,
  choices: Choice[],
  outcomes: ChoiceOutcome[],
  responseTime: number
): PlayerPerformanceMetrics {
  // Calculate alignment change from recent history
  const alignmentChange = character.moralAlignment.alignmentHistory.length > 0
    ? character.moralAlignment.alignmentHistory[0].impact
    : 0;

  // Determine choice quality based on alignment change
  let choiceQuality: 'good' | 'neutral' | 'poor';
  if (alignmentChange > 5) {
    choiceQuality = 'good';
  } else if (alignmentChange < -5) {
    choiceQuality = 'poor';
  } else {
    choiceQuality = 'neutral';
  }

  // Calculate story engagement based on character stats and recent activity
  const totalStats = character.stats.intelligence + character.stats.creativity + 
                    character.stats.perception + character.stats.wisdom;
  const baseEngagement = Math.min(100, Math.max(0, (totalStats / 80) * 100));
  
  // Adjust based on recent choices (more choices = higher engagement)
  const recentActivityBonus = Math.min(20, character.moralAlignment.recentChoices.length * 5);
  const storyEngagement = Math.min(100, baseEngagement + recentActivityBonus);

  // Calculate difficulty rating based on character level and current turn
  const baseDifficulty = Math.min(10, Math.max(1, character.level + character.currentTurn - 1));
  const difficultyRating = Math.min(10, Math.max(1, baseDifficulty));

  // Calculate choice consistency based on alignment history
  let choiceConsistency = 0.5; // Default neutral consistency
  
  if (character.moralAlignment.alignmentHistory.length >= 2) {
    const recentImpacts = character.moralAlignment.alignmentHistory
      .slice(0, 3)
      .map(entry => entry.impact);
    
    // Check if recent choices are consistent (all positive, all negative, or mixed)
    const allPositive = recentImpacts.every(impact => impact > 0);
    const allNegative = recentImpacts.every(impact => impact < 0);
    
    if (allPositive || allNegative) {
      choiceConsistency = 0.9; // High consistency
    } else if (recentImpacts.some(impact => impact === 0)) {
      choiceConsistency = 0.7; // Medium consistency
    } else {
      choiceConsistency = 0.3; // Low consistency (mixed positive/negative)
    }
  }

  return {
    alignmentChange,
    choiceQuality,
    storyEngagement: Math.round(storyEngagement),
    difficultyRating,
    responseTime,
    choiceConsistency
  };
}

/**
 * Creates an extended character with DM adaptation state
 */
export function createExtendedCharacter(character: Character): ExtendedCharacter {
  return {
    ...character,
    dmAdaptations: [],
    currentDMMood: 'neutral',
    dmPersonalityEvolution: [],
    difficultyModifier: 0
  };
}

/**
 * Adds a DM adaptation to an extended character
 */
export function addDMAdaptation(
  character: ExtendedCharacter,
  adaptation: DMAdaptation
): ExtendedCharacter {
  return {
    ...character,
    dmAdaptations: [...character.dmAdaptations, adaptation],
    currentDMMood: adaptation.adaptations.moodChange,
    dmPersonalityEvolution: [
      ...character.dmPersonalityEvolution,
      ...adaptation.adaptations.personalityEvolution
    ],
    difficultyModifier: character.difficultyModifier + adaptation.adaptations.difficultyAdjustment
  };
}

/**
 * Gets DM adaptations for a specific turn
 */
export function getDMAdaptationsForTurn(
  character: ExtendedCharacter,
  turnNumber: number
): DMAdaptation[] {
  return character.dmAdaptations.filter(adaptation => adaptation.turnNumber === turnNumber);
}

/**
 * Gets the current difficulty level including modifiers
 */
export function getCurrentDifficulty(character: ExtendedCharacter): number {
  const baseDifficulty = character.level + character.currentTurn - 1;
  const adjustedDifficulty = baseDifficulty + character.difficultyModifier;
  return Math.min(10, Math.max(1, adjustedDifficulty));
}

/**
 * Gets active personality traits from evolution history
 */
export function getActivePersonalityTraits(character: ExtendedCharacter): string[] {
  // Return the last 5 personality evolution entries
  return character.dmPersonalityEvolution.slice(-5);
} 