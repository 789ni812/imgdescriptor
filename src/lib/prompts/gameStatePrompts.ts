import { PromptContext } from './dynamicPrompts';
import { StoryEntry, ChoiceOutcome, CharacterStats } from '../types/character';

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

// Type guard for choice outcomes
interface ChoiceOutcomeWithSuccess {
  id: string;
  choiceId?: string; // Optional for backward compatibility
  text: string;
  outcome: string | { success: boolean; description: string };
  statChanges?: Partial<CharacterStats>;
  timestamp: string | number; // Handle both string and number for backward compatibility
  turnNumber?: number; // Optional for backward compatibility
}

function isChoiceOutcomeWithSuccess(obj: unknown): obj is ChoiceOutcomeWithSuccess {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    'text' in obj &&
    'outcome' in obj &&
    'timestamp' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    typeof (obj as Record<string, unknown>).text === 'string' &&
    (typeof (obj as Record<string, unknown>).outcome === 'string' || 
     (typeof (obj as Record<string, unknown>).outcome === 'object' && 
      (obj as Record<string, unknown>).outcome !== null &&
      'success' in ((obj as Record<string, unknown>).outcome as Record<string, unknown>))) &&
    (typeof (obj as Record<string, unknown>).timestamp === 'string' || typeof (obj as Record<string, unknown>).timestamp === 'number')
  );
}

// Helper function to determine if a choice outcome was successful
function isChoiceSuccessful(outcome: string | { success: boolean; description: string }): boolean {
  // Handle object format (for backward compatibility with tests)
  if (typeof outcome === 'object' && outcome !== null && 'success' in outcome) {
    return outcome.success;
  }
  
  // Handle string format
  if (typeof outcome === 'string') {
    const successKeywords = ['success', 'succeed', 'win', 'victory', 'achieved', 'completed', 'positive'];
    const failureKeywords = ['fail', 'failure', 'lose', 'defeat', 'missed', 'negative', 'error'];
    
    const lowerOutcome = outcome.toLowerCase();
    const successCount = successKeywords.filter(keyword => lowerOutcome.includes(keyword)).length;
    const failureCount = failureKeywords.filter(keyword => lowerOutcome.includes(keyword)).length;
    
    return successCount > failureCount;
  }
  
  return false;
}

// Helper function to get outcome description
function getOutcomeDescription(outcome: string | { success: boolean; description: string }): string {
  if (typeof outcome === 'object' && outcome !== null && 'description' in outcome) {
    return outcome.description;
  }
  return typeof outcome === 'string' ? outcome : '';
}

// Advanced Game State Prompt Generation
export function createAdvancedGameStatePrompt(context: PromptContext): string {
  if (!context.character || !context.gameState) {
    throw new Error('Missing required context for advanced game state prompt');
  }

  const { character, gameState, dmConfig, imageDescription } = context;
  const { currentTurn = 1, maxTurns = 3, storyHistory, choiceHistory } = gameState;
  const analysis = analyzeGameState(context);
  const percentage = Math.round((currentTurn / maxTurns) * 100);
  const remaining = maxTurns - currentTurn;

  return `Advanced Game State Analysis:

Character: ${character.persona} (Level ${character.level})
Stats: INT ${character.stats.intelligence}, CRE ${character.stats.creativity}, PER ${character.stats.perception}, WIS ${character.stats.wisdom}
Health: ${character.health}
Experience: ${character.experience}

Turn Progress: ${currentTurn}/${maxTurns} (${percentage}% complete, ${remaining} remaining)
Game Phase: ${analysis.turnProgress.phase.charAt(0).toUpperCase() + analysis.turnProgress.phase.slice(1)} game
DM Style: ${dmConfig?.personality?.name || 'Unknown'} personality, ${dmConfig?.style || 'narrative'} style, ${dmConfig?.difficulty || 'medium'} difficulty

Story History (${(storyHistory ?? []).length} segments):
${(storyHistory ?? []).map((story, index) => `${index + 1}. ${story.text}`).join('\n')}

Choice Analysis (${Array.isArray(choiceHistory) ? choiceHistory.filter(isChoiceOutcomeWithSuccess).length : 0} choices):
${Array.isArray(choiceHistory) ? choiceHistory.filter(isChoiceOutcomeWithSuccess).map((choice) => `- ${choice.text}: ${isChoiceSuccessful(choice.outcome) ? 'Success' : 'Failure'} - ${getOutcomeDescription(choice.outcome)}`).join('\n') : ''}

Current Image: ${imageDescription || 'No image'}

Performance Analysis:
- Success Rate: ${analysis.choicePatterns.successRate}%
- Story Themes: ${analysis.storyThemes.join(', ')}
- Choice Patterns: ${analysis.choicePatterns.types.join(', ')}
- Difficulty Recommendation: ${analysis.difficultyRecommendation.recommendedLevel}

Generate the next story segment that builds upon this rich context, considering the character's development, previous choices, and the overall narrative arc.`;
}

// Turn Progression Prompt
export function createTurnProgressionPrompt(context: PromptContext): string {
  if (!context.gameState) {
    throw new Error('Missing game state for turn progression prompt');
  }

  const { currentTurn = 1, maxTurns = 3 } = context.gameState;
  const percentage = Math.round((currentTurn / maxTurns) * 100);
  const remaining = maxTurns - currentTurn;

  let phase = 'early';
  if (percentage >= 80) phase = 'final';
  else if (percentage >= 60) phase = 'late';
  else if (percentage >= 30) phase = 'middle';

  return `Turn Progression Context:

Current Turn: ${currentTurn} of ${maxTurns} (${percentage}% complete)
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
  const themes = extractStoryThemes(storyHistory ?? []);

  if ((storyHistory ?? []).length === 0) {
    return `Story History (0 segments):
This is the beginning of the adventure. No previous story context exists.

Generate an opening story segment that establishes the setting, introduces the character, and sets up the initial conflict or challenge.`;
  }

  return `Story History (${(storyHistory ?? []).length} segments):

${(storyHistory ?? []).map((story, index) => `${index + 1}. ${story.text}`).join('\n')}

Story Themes Identified: ${themes.join(', ')}

Narrative Patterns:
- Story progression: ${(storyHistory ?? []).length > 1 ? 'Building complexity' : 'Establishing foundation'}
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
  const safeChoiceHistory = Array.isArray(choiceHistory)
    ? choiceHistory.filter(isChoiceOutcomeWithSuccess)
    : [];
  const successCount = safeChoiceHistory.filter((choice) => isChoiceSuccessful(choice.outcome)).length;
  const successRate = safeChoiceHistory.length > 0 ? Math.round((successCount / safeChoiceHistory.length) * 100) : 0;
  const choiceTypes = extractChoiceTypes(safeChoiceHistory);

  return `Choice Outcomes Analysis:

Total Choices: ${safeChoiceHistory.length}
Success Rate: ${successRate}% (${successCount} successful, ${safeChoiceHistory.length - successCount} failed)

Choice History:
${safeChoiceHistory.map(choice => `- ${choice.text}: ${isChoiceSuccessful(choice.outcome) ? 'Success' : 'Failure'} - ${getOutcomeDescription(choice.outcome)}`).join('\n')}

Choice Patterns:
- Types: ${choiceTypes.join(', ')}
- Recent trend: ${getRecentChoiceTrend(safeChoiceHistory)}
- Player style: ${analyzePlayerStyle(safeChoiceHistory)}

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

  const { currentTurn = 1, maxTurns = 3, storyHistory, choiceHistory } = context.gameState;
  const totalTurns = maxTurns;
  const percentage = Math.round((currentTurn / totalTurns) * 100);
  const remaining = totalTurns - currentTurn;
  const safeChoiceHistory = Array.isArray(choiceHistory)
    ? choiceHistory.filter(isChoiceOutcomeWithSuccess)
    : [];

  let phase: 'early' | 'middle' | 'late' | 'final' = 'early';
  if (percentage >= 80) phase = 'final';
  else if (percentage >= 60) phase = 'late';
  else if (percentage >= 30) phase = 'middle';

  const successCount = safeChoiceHistory.filter((choice) => isChoiceSuccessful(choice.outcome)).length;
  const successRate = safeChoiceHistory.length > 0 ? Math.round((successCount / safeChoiceHistory.length) * 100) : 0;
  const choiceTypes = extractChoiceTypes(safeChoiceHistory);
  const storyThemes = extractStoryThemes(storyHistory ?? []);

  const performance = calculatePerformanceLevel(successRate, safeChoiceHistory);
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
      recentTrends: getRecentChoiceTrends(safeChoiceHistory)
    },
    performanceMetrics: {
      overall: performance,
      successRate,
      consistency: calculateConsistency(safeChoiceHistory)
    },
    difficultyRecommendation: difficulty
  };
}

// Calculate Adaptive Difficulty
export function calculateAdaptiveDifficulty(context: PromptContext) {
  if (!context.gameState || !context.dmConfig) {
    return {
      currentLevel: 'medium',
      recommendedLevel: 'medium',
      adjustment: 'maintain' as const,
      reasoning: 'Insufficient data for difficulty adjustment'
    };
  }

  const { choiceHistory = [] } = context.gameState;
  const { difficulty: currentDifficulty } = context.dmConfig;
  
  const successCount = choiceHistory.filter(choice => isChoiceSuccessful(choice.outcome)).length;
  const successRate = choiceHistory.length > 0 ? Math.round((successCount / choiceHistory.length) * 100) : 0;

  let recommendedLevel = currentDifficulty || 'medium';
  let adjustment: 'increase' | 'decrease' | 'maintain' = 'maintain';
  let reasoning = '';

  if (successRate > 80) {
    recommendedLevel = 'hard';
    adjustment = 'increase';
    reasoning = 'Player performing excellently, increasing challenge';
  } else if (successRate > 60) {
    recommendedLevel = 'medium';
    adjustment = 'maintain';
    reasoning = 'Player performing well, maintaining current difficulty';
  } else if (successRate > 40) {
    recommendedLevel = 'medium';
    adjustment = 'maintain';
    reasoning = 'Player performing adequately, maintaining current difficulty';
  } else {
    recommendedLevel = 'easy';
    adjustment = 'decrease';
    reasoning = 'Player struggling, decreasing difficulty';
  }

  return {
    currentLevel: currentDifficulty || 'medium',
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

  const { currentTurn = 1, maxTurns = 3 } = context.gameState ?? {};
  const totalTurns = maxTurns;
  const progress = totalTurns ? Math.round((currentTurn / totalTurns) * 100) : 0;
  const analysis = analyzeGameState(context);

  return `Performance-Based Story Generation:

Player Performance: ${analysis.performanceMetrics.overall.toUpperCase()}
Success Rate: ${analysis.choicePatterns.successRate}%
Choice Patterns: ${analysis.choicePatterns.types.join(', ')}
Story Progress: ${progress}%

Performance Analysis:
- Consistency: ${analysis.performanceMetrics.consistency}%
- Recent trends: ${analysis.choicePatterns.recentTrends.join(', ')}
- Player style: ${analyzePlayerStyle(Array.isArray(context.gameState?.choiceHistory) ? context.gameState.choiceHistory : [])}

Recommendations:
- Balance risk and reward
- Mix familiar and new challenge types
- Maintain engagement through variety

Generate story content that matches the player's skill level and engagement patterns while maintaining narrative quality and challenge.`;
}

// Game State Summary Prompt
export function createGameStateSummaryPrompt(context: PromptContext): string {
  if (!context.character || !context.gameState) {
    throw new Error('Missing required context for game state summary');
  }

  const { character, gameState } = context;
  const { currentTurn = 1, maxTurns = 3 } = gameState ?? {};
  const totalTurns = maxTurns;
  const progress = totalTurns ? Math.round((currentTurn / totalTurns) * 100) : 0;
  const analysis = analyzeGameState(context);

  return `Game State Summary:

Character: ${character?.persona || 'Unknown'} (Level ${character?.level || 1})
Progress: Turn ${currentTurn} of ${totalTurns} (${progress}%)
Performance: ${analysis.choicePatterns.successRate}% success rate
Story Themes: ${analysis.storyThemes.join(', ')}

Current State:
- Health: ${character?.health || 0}/${(character && typeof character === 'object' && 'maxHealth' in character ? (character as Record<string, unknown>).maxHealth as number : character?.health) ?? 100}
- Experience: ${character?.experience || 0}
- Game Phase: ${analysis.turnProgress.phase}
- Choice Patterns: ${analysis.choicePatterns.types.join(', ')}

Adaptive Recommendations:
- Difficulty: ${analysis.difficultyRecommendation.adjustment} (${analysis.difficultyRecommendation.reasoning})
- Focus: ${generateFocusRecommendation(analysis)}
- Pacing: ${generatePacingRecommendation(analysis)}

Use this comprehensive game state to generate contextually appropriate and engaging story content.`;
}

// Story Continuity Prompt - NEW
export function createStoryContinuityPrompt(context: PromptContext): string {
  if (!context.gameState) {
    throw new Error('Missing game state for story continuity prompt');
  }

  const { storyHistory, choiceHistory, currentTurn = 1 } = context.gameState;
  const recentStories = storyHistory?.slice(-2) || [];
  const recentChoices = choiceHistory?.slice(-2) || [];

  if (recentStories.length === 0) {
    return `Story Continuity (Turn ${currentTurn}):
This is the beginning of the adventure. No previous story context exists.

Generate an opening story segment that establishes the setting, introduces the character, and sets up the initial conflict or challenge.`;
  }

  const continuitySummary = recentStories.map((story, index) => {
    const choice = recentChoices[index];
    return {
      turn: currentTurn - recentStories.length + index + 1,
      story: story.text,
      choice: choice?.text || 'No choice made',
      outcome: choice?.outcome || 'No outcome recorded'
    };
  });

  return `Story Continuity (Turn ${currentTurn}):

Previous Story Context:
${continuitySummary.map(c => 
  `Turn ${c.turn}: ${c.story} - Choice: ${c.choice} - Outcome: ${c.outcome}`
).join('\n')}

Continuity Requirements:
- Reference previous story events and choices
- Build upon established character development
- Maintain consistent tone and style
- Advance the overall narrative arc
- Create meaningful progression from previous scenes

Narrative Guidelines:
- Each scene should feel like a natural continuation
- Reference specific details from previous turns
- Show consequences of previous choices
- Maintain character consistency
- Build toward a larger story goal

Use this continuity to create a cohesive narrative that feels like part of a larger adventure.`;
}

// Utility Functions

function extractStoryThemes(storyHistory: StoryEntry[]): string[] {
  const themes: string[] = [];
  const allText = storyHistory.map(story => story.text).join(' ').toLowerCase();

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

function extractChoiceTypes(choiceHistory: ChoiceOutcome[]): string[] {
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

function getRecentChoiceTrend(choiceHistory: ChoiceOutcome[]): string {
  if (choiceHistory.length < 2) return 'insufficient data';
  
  const recent = choiceHistory.slice(-3);
  const recentSuccesses = recent.filter(c => isChoiceSuccessful(c.outcome)).length;
  
  if (recentSuccesses === recent.length) return 'improving';
  if (recentSuccesses === 0) return 'declining';
  return 'mixed';
}

function getRecentChoiceTrends(choiceHistory: ChoiceOutcome[]): string[] {
  if (choiceHistory.length < 2) return ['insufficient data'];
  
  const recent = choiceHistory.slice(-3);
  const trends: string[] = [];
  
  const successRate = recent.filter(c => isChoiceSuccessful(c.outcome)).length / recent.length;
  if (successRate > 0.66) trends.push('improving');
  else if (successRate < 0.33) trends.push('declining');
  else trends.push('stable');
  
  return trends;
}

function calculatePerformanceLevel(successRate: number, choiceHistory: ChoiceOutcome[]): 'excellent' | 'good' | 'average' | 'poor' | 'struggling' {
  if (choiceHistory.length < 3) return 'average';
  
  if (successRate >= 80) return 'excellent';
  if (successRate >= 60) return 'good';
  if (successRate >= 40) return 'average';
  if (successRate >= 20) return 'poor';
  return 'struggling';
}

function calculateConsistency(choiceHistory: ChoiceOutcome[]): number {
  if (choiceHistory.length < 2) return 100;
  
  const outcomes = choiceHistory.map(c => c.outcome);
  let consistency = 0;
  
  for (let i = 1; i < outcomes.length; i++) {
    if (outcomes[i] === outcomes[i-1]) consistency++;
  }
  
  return Math.round((consistency / (outcomes.length - 1)) * 100);
}

function analyzePlayerStyle(choiceHistory: ChoiceOutcome[]): string {
  if (choiceHistory.length === 0) return 'unknown';
  
  const types = extractChoiceTypes(choiceHistory);
  const successRate = choiceHistory.filter(c => isChoiceSuccessful(c.outcome)).length / choiceHistory.length;
  
  if (types.includes('combat') && successRate > 0.7) return 'aggressive warrior';
  if (types.includes('investigation') && successRate > 0.7) return 'cautious investigator';
  if (types.includes('social') && successRate > 0.7) return 'diplomatic negotiator';
  if (types.includes('stealth') && successRate > 0.7) return 'stealthy rogue';
  if (successRate < 0.3) return 'struggling adventurer';
  
  return 'balanced adventurer';
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
  const { turnProgress } = analysis;
  
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