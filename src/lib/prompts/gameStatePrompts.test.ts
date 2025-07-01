import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  createAdvancedGameStatePrompt,
  createTurnProgressionPrompt,
  createStoryHistoryPrompt,
  createChoiceOutcomePrompt,
  createAdaptiveDifficultyPrompt,
  analyzeGameState,
  calculateAdaptiveDifficulty,
  createPerformanceBasedPrompt,
  createGameStateSummaryPrompt
} from './gameStatePrompts';
import { createCharacter } from '../types/character';
import { PromptContext } from './dynamicPrompts';

describe('Advanced Game State Integration', () => {
  let baseContext: PromptContext;
  let sampleGameState: any;

  beforeEach(() => {
    const character = createCharacter({
      persona: 'Test Hero',
      stats: {
        intelligence: 12,
        creativity: 10,
        perception: 14,
        wisdom: 13
      }
    });

    sampleGameState = {
      currentTurn: 3,
      totalTurns: 10,
      storyHistory: [
        'The hero enters a mysterious forest.',
        'A dark figure emerges from the shadows.',
        'The hero must choose: fight or flee.'
      ],
      choiceHistory: [
        {
          id: 'choice-1',
          text: 'Fight the dark figure',
          outcome: { success: true, description: 'Victory! The figure was a friendly guide.' },
          timestamp: Date.now() - 60000
        },
        {
          id: 'choice-2',
          text: 'Investigate the shadows',
          outcome: { success: false, description: 'The shadows hide dangerous creatures.' },
          timestamp: Date.now() - 30000
        }
      ],
      imageHistory: [
        { url: '/image1.jpg', description: 'Forest entrance', story: 'The hero enters a mysterious forest.' },
        { url: '/image2.jpg', description: 'Dark figure', story: 'A dark figure emerges from the shadows.' },
        { url: '/image3.jpg', description: 'Choice point', story: 'The hero must choose: fight or flee.' }
      ]
    };

    baseContext = {
      character,
      dmConfig: {
        personality: {
          name: 'Strategic DM',
          style: 'strategic',
          description: 'A strategic and analytical dungeon master'
        },
        style: 'challenging',
        difficulty: 'medium'
      },
      gameState: sampleGameState,
      currentImage: {
        url: '/image3.jpg',
        description: 'Choice point'
      }
    };
  });

  describe('createAdvancedGameStatePrompt', () => {
    it('should create a comprehensive game state prompt', () => {
      const prompt = createAdvancedGameStatePrompt(baseContext);
      
      expect(prompt).toContain('Test Hero');
      expect(prompt).toContain('Level 1');
      expect(prompt).toContain('Turn 3 of 10');
      expect(prompt).toContain('3 story segments');
      expect(prompt).toContain('2 previous choices');
      expect(prompt).toContain('strategic');
      expect(prompt).toContain('medium difficulty');
    });

    it('should include character stats in the prompt', () => {
      const prompt = createAdvancedGameStatePrompt(baseContext);
      
      expect(prompt).toContain('STR: 15');
      expect(prompt).toContain('DEX: 14');
      expect(prompt).toContain('CON: 16');
      expect(prompt).toContain('INT: 12');
      expect(prompt).toContain('WIS: 13');
      expect(prompt).toContain('CHA: 10');
    });

    it('should include story history summary', () => {
      const prompt = createAdvancedGameStatePrompt(baseContext);
      
      expect(prompt).toContain('Story History:');
      expect(prompt).toContain('The hero enters a mysterious forest');
      expect(prompt).toContain('A dark figure emerges from the shadows');
      expect(prompt).toContain('The hero must choose: fight or flee');
    });

    it('should include choice history analysis', () => {
      const prompt = createAdvancedGameStatePrompt(baseContext);
      
      expect(prompt).toContain('Choice History:');
      expect(prompt).toContain('Fight the dark figure');
      expect(prompt).toContain('Investigate the shadows');
      expect(prompt).toContain('Victory! The figure was a friendly guide');
      expect(prompt).toContain('The shadows hide dangerous creatures');
    });
  });

  describe('createTurnProgressionPrompt', () => {
    it('should create a turn progression prompt', () => {
      const prompt = createTurnProgressionPrompt(baseContext);
      
      expect(prompt).toContain('Turn 3 of 10');
      expect(prompt).toContain('30% complete');
      expect(prompt).toContain('7 turns remaining');
    });

    it('should include progression milestones', () => {
      const prompt = createTurnProgressionPrompt(baseContext);
      
      expect(prompt).toContain('Progression:');
      expect(prompt).toContain('Early game');
    });

    it('should handle different turn positions', () => {
      const lateGameContext = {
        ...baseContext,
        gameState: { ...sampleGameState, currentTurn: 8, totalTurns: 10 }
      };
      
      const prompt = createTurnProgressionPrompt(lateGameContext);
      
      expect(prompt).toContain('Turn 8 of 10');
      expect(prompt).toContain('80% complete');
      expect(prompt).toContain('Late game');
    });
  });

  describe('createStoryHistoryPrompt', () => {
    it('should create a story history prompt', () => {
      const prompt = createStoryHistoryPrompt(baseContext);
      
      expect(prompt).toContain('Story History (3 segments):');
      expect(prompt).toContain('1. The hero enters a mysterious forest');
      expect(prompt).toContain('2. A dark figure emerges from the shadows');
      expect(prompt).toContain('3. The hero must choose: fight or flee');
    });

    it('should include story themes and patterns', () => {
      const prompt = createStoryHistoryPrompt(baseContext);
      
      expect(prompt).toContain('Story Themes:');
      expect(prompt).toContain('mystery');
      expect(prompt).toContain('choice');
      expect(prompt).toContain('conflict');
    });

    it('should handle empty story history', () => {
      const emptyContext = {
        ...baseContext,
        gameState: { ...sampleGameState, storyHistory: [] }
      };
      
      const prompt = createStoryHistoryPrompt(emptyContext);
      
      expect(prompt).toContain('Story History (0 segments):');
      expect(prompt).toContain('This is the beginning of the adventure');
    });
  });

  describe('createChoiceOutcomePrompt', () => {
    it('should create a choice outcome prompt', () => {
      const prompt = createChoiceOutcomePrompt(baseContext);
      
      expect(prompt).toContain('Choice Outcomes:');
      expect(prompt).toContain('Fight the dark figure');
      expect(prompt).toContain('Success: Victory! The figure was a friendly guide');
      expect(prompt).toContain('Investigate the shadows');
      expect(prompt).toContain('Failure: The shadows hide dangerous creatures');
    });

    it('should calculate success rate', () => {
      const prompt = createChoiceOutcomePrompt(baseContext);
      
      expect(prompt).toContain('Success Rate: 50%');
      expect(prompt).toContain('1 successful choices');
      expect(prompt).toContain('1 failed choices');
    });

    it('should include choice patterns', () => {
      const prompt = createChoiceOutcomePrompt(baseContext);
      
      expect(prompt).toContain('Choice Patterns:');
      expect(prompt).toContain('combat');
      expect(prompt).toContain('investigation');
    });
  });

  describe('createAdaptiveDifficultyPrompt', () => {
    it('should create an adaptive difficulty prompt', () => {
      const prompt = createAdaptiveDifficultyPrompt(baseContext);
      
      expect(prompt).toContain('Adaptive Difficulty:');
      expect(prompt).toContain('Current Level: Medium');
      expect(prompt).toContain('Player Performance: Average');
    });

    it('should adjust difficulty based on performance', () => {
      const highPerformanceContext = {
        ...baseContext,
        gameState: {
          ...sampleGameState,
          choiceHistory: [
            { id: '1', text: 'Choice 1', outcome: { success: true, description: 'Success' }, timestamp: Date.now() },
            { id: '2', text: 'Choice 2', outcome: { success: true, description: 'Success' }, timestamp: Date.now() },
            { id: '3', text: 'Choice 3', outcome: { success: true, description: 'Success' }, timestamp: Date.now() }
          ]
        }
      };
      
      const prompt = createAdaptiveDifficultyPrompt(highPerformanceContext);
      
      expect(prompt).toContain('Player Performance: Excellent');
      expect(prompt).toContain('Difficulty Adjustment: Increase challenge');
    });

    it('should handle poor performance', () => {
      const poorPerformanceContext = {
        ...baseContext,
        gameState: {
          ...sampleGameState,
          choiceHistory: [
            { id: '1', text: 'Choice 1', outcome: { success: false, description: 'Failure' }, timestamp: Date.now() },
            { id: '2', text: 'Choice 2', outcome: { success: false, description: 'Failure' }, timestamp: Date.now() }
          ]
        }
      };
      
      const prompt = createAdaptiveDifficultyPrompt(poorPerformanceContext);
      
      expect(prompt).toContain('Player Performance: Struggling');
      expect(prompt).toContain('Difficulty Adjustment: Reduce challenge');
    });
  });

  describe('analyzeGameState', () => {
    it('should analyze game state comprehensively', () => {
      const analysis = analyzeGameState(baseContext);
      
      expect(analysis).toHaveProperty('turnProgress');
      expect(analysis).toHaveProperty('storyThemes');
      expect(analysis).toHaveProperty('choicePatterns');
      expect(analysis).toHaveProperty('performanceMetrics');
      expect(analysis).toHaveProperty('difficultyRecommendation');
    });

    it('should calculate turn progress correctly', () => {
      const analysis = analyzeGameState(baseContext);
      
      expect(analysis.turnProgress).toEqual({
        current: 3,
        total: 10,
        percentage: 30,
        remaining: 7,
        phase: 'early'
      });
    });

    it('should identify story themes', () => {
      const analysis = analyzeGameState(baseContext);
      
      expect(analysis.storyThemes).toContain('mystery');
      expect(analysis.storyThemes).toContain('choice');
      expect(analysis.storyThemes).toContain('conflict');
    });

    it('should analyze choice patterns', () => {
      const analysis = analyzeGameState(baseContext);
      
      expect(analysis.choicePatterns).toHaveProperty('successRate');
      expect(analysis.choicePatterns).toHaveProperty('types');
      expect(analysis.choicePatterns.successRate).toBe(50);
      expect(analysis.choicePatterns.types).toContain('combat');
      expect(analysis.choicePatterns.types).toContain('investigation');
    });
  });

  describe('calculateAdaptiveDifficulty', () => {
    it('should calculate adaptive difficulty based on performance', () => {
      const difficulty = calculateAdaptiveDifficulty(baseContext);
      
      expect(difficulty).toHaveProperty('currentLevel');
      expect(difficulty).toHaveProperty('recommendedLevel');
      expect(difficulty).toHaveProperty('adjustment');
      expect(difficulty).toHaveProperty('reasoning');
    });

    it('should recommend difficulty increase for high performance', () => {
      const highPerformanceContext = {
        ...baseContext,
        gameState: {
          ...sampleGameState,
          choiceHistory: Array(5).fill(null).map((_, i) => ({
            id: `choice-${i}`,
            text: `Choice ${i}`,
            outcome: { success: true, description: 'Success' },
            timestamp: Date.now() - (i * 60000)
          }))
        }
      };
      
      const difficulty = calculateAdaptiveDifficulty(highPerformanceContext);
      
      expect(difficulty.recommendedLevel).toBe('hard');
      expect(difficulty.adjustment).toBe('increase');
    });

    it('should recommend difficulty decrease for poor performance', () => {
      const poorPerformanceContext = {
        ...baseContext,
        gameState: {
          ...sampleGameState,
          choiceHistory: Array(3).fill(null).map((_, i) => ({
            id: `choice-${i}`,
            text: `Choice ${i}`,
            outcome: { success: false, description: 'Failure' },
            timestamp: Date.now() - (i * 60000)
          }))
        }
      };
      
      const difficulty = calculateAdaptiveDifficulty(poorPerformanceContext);
      
      expect(difficulty.recommendedLevel).toBe('easy');
      expect(difficulty.adjustment).toBe('decrease');
    });
  });

  describe('createPerformanceBasedPrompt', () => {
    it('should create a performance-based prompt', () => {
      const prompt = createPerformanceBasedPrompt(baseContext);
      
      expect(prompt).toContain('Performance Analysis:');
      expect(prompt).toContain('Success Rate: 50%');
      expect(prompt).toContain('Choice Patterns: combat, investigation');
      expect(prompt).toContain('Story Progress: 30%');
    });

    it('should include performance recommendations', () => {
      const prompt = createPerformanceBasedPrompt(baseContext);
      
      expect(prompt).toContain('Recommendations:');
      expect(prompt).toContain('Consider character strengths');
      expect(prompt).toContain('Balance risk and reward');
    });
  });

  describe('createGameStateSummaryPrompt', () => {
    it('should create a comprehensive game state summary', () => {
      const prompt = createGameStateSummaryPrompt(baseContext);
      
      expect(prompt).toContain('Game State Summary:');
      expect(prompt).toContain('Character: Test Hero (Level 1)');
      expect(prompt).toContain('Progress: Turn 3 of 10 (30%)');
      expect(prompt).toContain('Performance: 50% success rate');
      expect(prompt).toContain('Story Themes: mystery, choice, conflict');
    });

    it('should include adaptive recommendations', () => {
      const prompt = createGameStateSummaryPrompt(baseContext);
      
      expect(prompt).toContain('Adaptive Recommendations:');
      expect(prompt).toContain('Difficulty: Maintain current level');
      expect(prompt).toContain('Focus: Balance challenge and engagement');
    });
  });
}); 