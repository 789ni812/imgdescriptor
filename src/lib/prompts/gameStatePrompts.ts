import { Character, CharacterStats, ChoiceOutcome, StoryEntry } from '../types/character';
import { PromptContext } from './dynamicPrompts';

// Game State Analysis Interface
export interface GameStateAnalysis {
  turnProgress: {
    current: number;
    total: number;
    percentage: number;
    remaining: number;
    phase: 'early' | 'middle' | 'late' | 'final';
  };
  storyThemes: string[];
  choicePatterns: {
    successRate: number;
    types: string[];
    recentTrends: string[];
  };
  performanceMetrics: {
    overall: 'excellent' | 'good' | 'average' | 'poor' | 'struggling';
    successRate: number;
    consistency: number;
  };
  difficultyRecommendation: {
    currentLevel: string;
    recommendedLevel: string;
    adjustment: 'increase' | 'decrease' | 'maintain';
    reasoning: string;
  };
}

// Advanced Game State Prompt Generation
export function createAdvancedGameStatePrompt(context: PromptContext): string {
  if (!context.character || !context.gameState || !context.dmConfig) {
    throw new Error('Missing required context for advanced game state prompt');
  }

  const { character, gameState, dmConfig, currentImage } = context;
  const analysis = analyzeGameState(context);

  return `Advanced Game State Prompt:

Character: ${character.name} (Level ${character.level})
Stats: STR ${character.stats.strength}, DEX ${character.stats.dexterity}, CON ${character.stats.constitution}, INT ${character.stats.intelligence}, WIS ${character.stats.wisdom}, CHA ${character.stats.charisma}
Health: ${character.health}/${character.maxHealth}
Experience: ${character.experience}

Game Progress: Turn ${gameState.currentTurn} of ${gameState.totalTurns} (${analysis.turnProgress.percentage}% complete)
DM Style: ${dmConfig.personality} personality, ${dmConfig.style} style, ${dmConfig.difficulty} difficulty

Story History (${gameState.storyHistory.length} segments):
${gameState.storyHistory.map((story, index) => `${index + 1}. ${story}`).join('\n')}

Choice History (${gameState.choiceHistory.length} choices):
${gameState.choiceHistory.map(choice => `- ${choice.text}: ${choice.outcome.success ? 'Success' : 'Failure'} - ${choice.outcome.description}`).join('\n')}

Current Image: ${currentImage?.description || 'No image'}

Performance Analysis:
- Success Rate: ${analysis.choicePatterns.successRate}%
- Story Themes: ${analysis.storyThemes.join(', ')}
- Choice Patterns: ${analysis.choicePatterns.types.join(', ')}
- Difficulty Recommendation: ${analysis.difficultyRecommendation.recommendation}

Generate the next story segment that builds upon this rich context, considering the character's development, previous choices, and the overall narrative arc.`;
}

// Turn Progression Prompt
export function createTurnProgressionPrompt(context: PromptContext): string {
  if (!context.gameState) {
    throw new Error('Missing game state for turn progression prompt');
  }

  const { currentTurn, totalTurns } = context.gameState;
  const percentage = Math.round((currentTurn / totalTurns) * 100);
  const remaining = totalTurns - currentTurn;

  let phase = 'early';
  if (percentage >= 80) phase = 'final';
  else if (percentage >= 60) phase = 'late';
  else if (percentage >= 30) phase = 'middle';

  return `Turn Progression Context:

Current Turn: ${currentTurn} of ${totalTurns} (${percentage}% complete)
Turns Remaining: ${remaining}
Game Phase: ${phase.charAt(0).toUpperCase() + phase.slice(1)} game

Progression Milestones:
${percentage < 25 ? '- Early game: Establishing character and world' : ''}
${percentage >= 25 && percentage < 50 ? '- Mid-game: Building tension and complexity' : ''}
${percentage >= 50 && percentage < 75 ? '- Late game: Escalating challenges and consequences' : ''}
${percentage >= 75 ? '- Final phase: Climax and resolution' : ''}

Consider the narrative pacing appropriate for this game phase when generating the next story segment.`;
}

// Story History Prompt
export function createStoryHistoryPrompt(context: PromptContext): string {
  if (!context.gameState) {
    throw new Error('Missing game state for story history prompt');
  }

  const { storyHistory } = context.gameState;
  const themes = extractStoryThemes(storyHistory);

  if (storyHistory.length === 0) {
    return `Story History (0 segments):
This is the beginning of the adventure. No previous story context exists.

Generate an opening story segment that establishes the setting, introduces the character, and sets up the initial conflict or challenge.`;
  }

  return `Story History (${storyHistory.length} segments):

${storyHistory.map((story, index) => `${index + 1}. ${story}`).join('\n')}

Story Themes Identified: ${themes.join(', ')}

Narrative Patterns:
- Story progression: ${storyHistory.length > 1 ? 'Building complexity' : 'Establishing foundation'}
- Tone consistency: Maintain the established narrative voice
- Character development: Continue character growth and challenges

Use this story history to maintain narrative continuity and build upon established themes and character development.`;
}

// Choice Outcome Prompt
export function createChoiceOutcomePrompt(context: PromptContext): string {
  if (!context.gameState) {
    throw new Error('Missing game state for choice outcome prompt');
  }

  const { choiceHistory } = context.gameState;
  const successCount = choiceHistory.filter(choice => choice.outcome.success).length;
  const successRate = choiceHistory.length > 0 ? Math.round((successCount / choiceHistory.length) * 100) : 0;
  const choiceTypes = extractChoiceTypes(choiceHistory);

  return `Choice Outcomes Analysis:

Total Choices: ${choiceHistory.length}
Success Rate: ${successRate}% (${successCount} successful, ${choiceHistory.length - successCount} failed)

Choice History:
${choiceHistory.map(choice => `- ${choice.text}: ${choice.outcome.success ? 'Success' : 'Failure'} - ${choice.outcome.description}`).join('\n')}

Choice Patterns:
- Types: ${choiceTypes.join(', ')}
- Recent trend: ${getRecentChoiceTrend(choiceHistory)}
- Player style: ${analyzePlayerStyle(choiceHistory)}

Consider the player's choice patterns and success rate when generating new choices and outcomes. Balance challenge with player skill level.`;
}

// Adaptive Difficulty Prompt
export function createAdaptiveDifficultyPrompt(context: PromptContext): string {
  if (!context.gameState || !context.dmConfig) {
    throw new Error('Missing required context for adaptive difficulty prompt');
  }

  const analysis = analyzeGameState(context);
  const { difficultyRecommendation } = analysis;

  return `Adaptive Difficulty Context:

Current Difficulty Level: ${difficultyRecommendation.currentLevel}
Player Performance: ${analysis.performanceMetrics.overall}
Success Rate: ${analysis.choicePatterns.successRate}%

Difficulty Adjustment: ${difficultyRecommendation.adjustment}
Reasoning: ${difficultyRecommendation.reasoning}

Performance Metrics:
- Consistency: ${analysis.performanceMetrics.consistency}%
- Choice patterns: ${analysis.choicePatterns.types.join(', ')}
- Recent trends: ${analysis.choicePatterns.recentTrends.join(', ')}

Adjust the challenge level and choice complexity based on player performance while maintaining engagement and narrative quality.`;
}

// Game State Analysis
export function analyzeGameState(context: PromptContext): GameStateAnalysis {
  if (!context.gameState) {
    throw new Error('Missing game state for analysis');
  }

  const { currentTurn, totalTurns, storyHistory, choiceHistory } = context.gameState;
  const percentage = Math.round((currentTurn / totalTurns) * 100);
  const remaining = totalTurns - currentTurn;

  let phase: 'early' | 'middle' | 'late' | 'final' = 'early';
  if (percentage >= 80) phase = 'final';
  else if (percentage >= 60) phase = 'late';
  else if (percentage >= 30) phase = 'middle';

  const successCount = choiceHistory.filter(choice => choice.outcome.success).length;
  const successRate = choiceHistory.length > 0 ? Math.round((successCount / choiceHistory.length) * 100) : 0;
  const choiceTypes = extractChoiceTypes(choiceHistory);
  const storyThemes = extractStoryThemes(storyHistory);

  const performance = calculatePerformanceLevel(successRate, choiceHistory);
  const difficulty = calculateAdaptiveDifficulty(context);

  return {
    turnProgress: {
      current: currentTurn,
      total: totalTurns,
      percentage,
      remaining,
      phase
    },
    storyThemes,
    choicePatterns: {
      successRate,
      types: choiceTypes,
      recentTrends: getRecentChoiceTrends(choiceHistory)
    },
    performanceMetrics: {
      overall: performance,
      successRate,
      consistency: calculateConsistency(choiceHistory)
    },
    difficultyRecommendation: difficulty
  };
}

// Calculate Adaptive Difficulty
export function calculateAdaptiveDifficulty(context: PromptContext) {
  if (!context.gameState || !context.dmConfig) {
    throw new Error('Missing required context for difficulty calculation');
  }

  const { choiceHistory } = context.gameState;
  const { difficulty: currentDifficulty } = context.dmConfig;
  
  const successCount = choiceHistory.filter(choice => choice.outcome.success).length;
  const successRate = choiceHistory.length > 0 ? Math.round((successCount / choiceHistory.length) * 100) : 0;

  let recommendedLevel = currentDifficulty;
  let adjustment: 'increase' | 'decrease' | 'maintain' = 'maintain';
  let reasoning = '';

  if (successRate >= 80 && choiceHistory.length >= 3) {
    recommendedLevel = 'hard';
    adjustment = 'increase';
    reasoning = 'Player showing excellent performance, ready for increased challenge';
  } else if (successRate <= 30 && choiceHistory.length >= 3) {
    recommendedLevel = 'easy';
    adjustment = 'decrease';
    reasoning = 'Player struggling, reducing difficulty to maintain engagement';
  } else {
    reasoning = 'Player performance within acceptable range, maintaining current difficulty';
  }

  return {
    currentLevel: currentDifficulty,
    recommendedLevel,
    adjustment,
    reasoning
  };
}

// Performance-Based Prompt
export function createPerformanceBasedPrompt(context: PromptContext): string {
  if (!context.gameState) {
    throw new Error('Missing game state for performance-based prompt');
  }

  const analysis = analyzeGameState(context);
  const { performanceMetrics, choicePatterns } = analysis;

  return `Performance-Based Story Generation:

Player Performance: ${performanceMetrics.overall.toUpperCase()}
Success Rate: ${performanceMetrics.successRate}%
Choice Patterns: ${choicePatterns.types.join(', ')}
Story Progress: ${analysis.turnProgress.percentage}%

Performance Analysis:
- Consistency: ${performanceMetrics.consistency}%
- Recent trends: ${choicePatterns.recentTrends.join(', ')}
- Player style: ${analyzePlayerStyle(context.gameState.choiceHistory)}

Recommendations:
${generatePerformanceRecommendations(analysis)}

Generate story content that matches the player's skill level and engagement patterns while maintaining narrative quality and challenge.`;
}

// Game State Summary Prompt
export function createGameStateSummaryPrompt(context: PromptContext): string {
  if (!context.character || !context.gameState) {
    throw new Error('Missing required context for game state summary');
  }

  const analysis = analyzeGameState(context);
  const { character, gameState } = context;

  return `Game State Summary:

Character: ${character.name} (Level ${character.level})
Progress: Turn ${gameState.currentTurn} of ${gameState.totalTurns} (${analysis.turnProgress.percentage}%)
Performance: ${analysis.choicePatterns.successRate}% success rate
Story Themes: ${analysis.storyThemes.join(', ')}

Current State:
- Health: ${character.health}/${character.maxHealth}
- Experience: ${character.experience}
- Game Phase: ${analysis.turnProgress.phase}
- Choice Patterns: ${analysis.choicePatterns.types.join(', ')}

Adaptive Recommendations:
- Difficulty: ${analysis.difficultyRecommendation.adjustment} (${analysis.difficultyRecommendation.reasoning})
- Focus: ${generateFocusRecommendation(analysis)}
- Pacing: ${generatePacingRecommendation(analysis)}

Use this comprehensive game state to generate contextually appropriate and engaging story content.`;
}

// Utility Functions

function extractStoryThemes(storyHistory: string[]): string[] {
  const themes: string[] = [];
  const allText = storyHistory.join(' ').toLowerCase();

  if (allText.includes('mystery') || allText.includes('mysterious') || allText.includes('unknown')) {
    themes.push('mystery');
  }
  if (allText.includes('choice') || allText.includes('decide') || allText.includes('choose')) {
    themes.push('choice');
  }
  if (allText.includes('fight') || allText.includes('battle') || allText.includes('conflict')) {
    themes.push('conflict');
  }
  if (allText.includes('magic') || allText.includes('spell') || allText.includes('magical')) {
    themes.push('magic');
  }
  if (allText.includes('treasure') || allText.includes('gold') || allText.includes('loot')) {
    themes.push('treasure');
  }
  if (allText.includes('friend') || allText.includes('ally') || allText.includes('companion')) {
    themes.push('companionship');
  }

  return themes.length > 0 ? themes : ['adventure'];
}

function extractChoiceTypes(choiceHistory: Choice[]): string[] {
  const types: string[] = [];
  const allText = choiceHistory.map(c => c.text).join(' ').toLowerCase();

  if (allText.includes('fight') || allText.includes('attack') || allText.includes('battle')) {
    types.push('combat');
  }
  if (allText.includes('investigate') || allText.includes('examine') || allText.includes('search')) {
    types.push('investigation');
  }
  if (allText.includes('talk') || allText.includes('speak') || allText.includes('negotiate')) {
    types.push('social');
  }
  if (allText.includes('run') || allText.includes('flee') || allText.includes('escape')) {
    types.push('stealth');
  }
  if (allText.includes('magic') || allText.includes('spell') || allText.includes('cast')) {
    types.push('magic');
  }

  return types.length > 0 ? types : ['general'];
}

function getRecentChoiceTrend(choiceHistory: Choice[]): string {
  if (choiceHistory.length < 2) return 'insufficient data';
  
  const recent = choiceHistory.slice(-3);
  const recentSuccesses = recent.filter(c => c.outcome.success).length;
  
  if (recentSuccesses === recent.length) return 'improving';
  if (recentSuccesses === 0) return 'declining';
  return 'mixed';
}

function getRecentChoiceTrends(choiceHistory: Choice[]): string[] {
  if (choiceHistory.length < 2) return ['insufficient data'];
  
  const recent = choiceHistory.slice(-3);
  const trends: string[] = [];
  
  const successRate = recent.filter(c => c.outcome.success).length / recent.length;
  if (successRate > 0.66) trends.push('improving');
  else if (successRate < 0.33) trends.push('declining');
  else trends.push('stable');
  
  return trends;
}

function calculatePerformanceLevel(successRate: number, choiceHistory: Choice[]): 'excellent' | 'good' | 'average' | 'poor' | 'struggling' {
  if (choiceHistory.length < 3) return 'average';
  
  if (successRate >= 80) return 'excellent';
  if (successRate >= 60) return 'good';
  if (successRate >= 40) return 'average';
  if (successRate >= 20) return 'poor';
  return 'struggling';
}

function calculateConsistency(choiceHistory: Choice[]): number {
  if (choiceHistory.length < 2) return 100;
  
  const outcomes = choiceHistory.map(c => c.outcome.success);
  let consistency = 0;
  
  for (let i = 1; i < outcomes.length; i++) {
    if (outcomes[i] === outcomes[i-1]) consistency++;
  }
  
  return Math.round((consistency / (outcomes.length - 1)) * 100);
}

function analyzePlayerStyle(choiceHistory: Choice[]): string {
  if (choiceHistory.length === 0) return 'unknown';
  
  const types = extractChoiceTypes(choiceHistory);
  const successRate = choiceHistory.filter(c => c.outcome.success).length / choiceHistory.length;
  
  if (types.includes('combat') && successRate > 0.7) return 'aggressive warrior';
  if (types.includes('investigation') && successRate > 0.7) return 'cautious investigator';
  if (types.includes('social') && successRate > 0.7) return 'diplomatic negotiator';
  if (types.includes('stealth') && successRate > 0.7) return 'stealthy rogue';
  if (successRate < 0.3) return 'struggling adventurer';
  
  return 'balanced adventurer';
}

function generatePerformanceRecommendations(analysis: GameStateAnalysis): string {
  const { performanceMetrics, choicePatterns } = analysis;
  
  if (performanceMetrics.overall === 'excellent') {
    return '- Increase challenge complexity\n- Introduce multi-layered choices\n- Add consequences for previous decisions';
  } else if (performanceMetrics.overall === 'struggling') {
    return '- Simplify choice options\n- Provide more guidance\n- Focus on character strengths';
  } else {
    return '- Balance risk and reward\n- Mix familiar and new challenge types\n- Maintain engagement through variety';
  }
}

function generateFocusRecommendation(analysis: GameStateAnalysis): string {
  const { turnProgress, performanceMetrics } = analysis;
  
  if (turnProgress.phase === 'final') {
    return 'Build toward climax and resolution';
  } else if (performanceMetrics.overall === 'struggling') {
    return 'Character development and confidence building';
  } else {
    return 'Progressive challenge and story advancement';
  }
}

function generatePacingRecommendation(analysis: GameStateAnalysis): string {
  const { turnProgress, performanceMetrics } = analysis;
  
  if (turnProgress.phase === 'early') {
    return 'Establish setting and character';
  } else if (turnProgress.phase === 'middle') {
    return 'Build tension and complexity';
  } else if (turnProgress.phase === 'late') {
    return 'Escalate challenges and consequences';
  } else {
    return 'Drive toward resolution';
  }
} 