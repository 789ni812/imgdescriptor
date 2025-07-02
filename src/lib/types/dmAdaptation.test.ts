import { 
  DMAdaptation, 
  PlayerPerformanceMetrics, 
  validateDMAdaptation,
  createDMAdaptation,
  calculatePlayerPerformance
} from './dmAdaptation';
import { createCharacter, Choice, ChoiceOutcome } from './character';

describe('DM Adaptation Types and State Management', () => {
  const mockChoices: Choice[] = [
    { id: '1', text: 'Help the villagers' },
    { id: '2', text: 'Ignore their plight' }
  ];

  const mockChoiceOutcomes: ChoiceOutcome[] = [
    {
      id: 'outcome-1',
      choiceId: '1',
      text: 'Help the villagers',
      outcome: 'The villagers are grateful and offer you supplies',
      timestamp: new Date().toISOString(),
      turnNumber: 1
    }
  ];

  describe('DMAdaptation Interface', () => {
    it('should have all required properties', () => {
      const adaptation: DMAdaptation = {
        id: 'adapt-1',
        turnNumber: 1,
        timestamp: new Date().toISOString(),
        reflection: 'Player showed good judgment',
        playerPerformance: {
          alignmentChange: 5,
          choiceQuality: 'good',
          storyEngagement: 85,
          difficultyRating: 7,
          responseTime: 30,
          choiceConsistency: 0.8
        },
        adaptations: {
          difficultyAdjustment: 1,
          narrativeDirection: 'Continue with positive reinforcement',
          moodChange: 'positive',
          personalityEvolution: ['More encouraging'],
          storyModifications: ['Add more moral dilemmas']
        },
        impact: {
          storyQuality: 8,
          playerEngagement: 85,
          narrativeCoherence: 9
        }
      };

      expect(adaptation.id).toBe('adapt-1');
      expect(adaptation.turnNumber).toBe(1);
      expect(adaptation.reflection).toBe('Player showed good judgment');
      expect(adaptation.playerPerformance.alignmentChange).toBe(5);
      expect(adaptation.adaptations.difficultyAdjustment).toBe(1);
    });
  });

  describe('PlayerPerformanceMetrics Interface', () => {
    it('should have all required performance metrics', () => {
      const metrics: PlayerPerformanceMetrics = {
        alignmentChange: 10,
        choiceQuality: 'good',
        storyEngagement: 90,
        difficultyRating: 8,
        responseTime: 25,
        choiceConsistency: 0.9
      };

      expect(metrics.alignmentChange).toBe(10);
      expect(metrics.choiceQuality).toBe('good');
      expect(metrics.storyEngagement).toBe(90);
      expect(metrics.difficultyRating).toBe(8);
      expect(metrics.responseTime).toBe(25);
      expect(metrics.choiceConsistency).toBe(0.9);
    });

    it('should validate choice quality values', () => {
      const validQualities: Array<'good' | 'neutral' | 'poor'> = ['good', 'neutral', 'poor'];
      
      validQualities.forEach(quality => {
        const metrics: PlayerPerformanceMetrics = {
          alignmentChange: 0,
          choiceQuality: quality,
          storyEngagement: 50,
          difficultyRating: 5,
          responseTime: 30,
          choiceConsistency: 0.5
        };
        
        expect(metrics.choiceQuality).toBe(quality);
      });
    });
  });

  describe('validateDMAdaptation', () => {
    it('should validate a correct DM adaptation', () => {
      const adaptation: DMAdaptation = {
        id: 'adapt-1',
        turnNumber: 1,
        timestamp: new Date().toISOString(),
        reflection: 'Valid reflection',
        playerPerformance: {
          alignmentChange: 5,
          choiceQuality: 'good',
          storyEngagement: 85,
          difficultyRating: 7,
          responseTime: 30,
          choiceConsistency: 0.8
        },
        adaptations: {
          difficultyAdjustment: 1,
          narrativeDirection: 'Continue story',
          moodChange: 'positive',
          personalityEvolution: ['More encouraging'],
          storyModifications: ['Add mystery']
        },
        impact: {
          storyQuality: 8,
          playerEngagement: 85,
          narrativeCoherence: 9
        }
      };

      const result = validateDMAdaptation(adaptation);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject adaptation with missing required fields', () => {
      const invalidAdaptation = {
        id: 'adapt-1',
        turnNumber: 1
        // Missing other required fields
      } as any;

      const result = validateDMAdaptation(invalidAdaptation);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate performance metrics ranges', () => {
      const adaptation: DMAdaptation = {
        id: 'adapt-1',
        turnNumber: 1,
        timestamp: new Date().toISOString(),
        reflection: 'Test reflection',
        playerPerformance: {
          alignmentChange: 5,
          choiceQuality: 'good',
          storyEngagement: 150, // Invalid: > 100
          difficultyRating: 7,
          responseTime: 30,
          choiceConsistency: 0.8
        },
        adaptations: {
          difficultyAdjustment: 1,
          narrativeDirection: 'Continue story',
          moodChange: 'positive',
          personalityEvolution: ['More encouraging'],
          storyModifications: ['Add mystery']
        },
        impact: {
          storyQuality: 8,
          playerEngagement: 85,
          narrativeCoherence: 9
        }
      };

      const result = validateDMAdaptation(adaptation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('storyEngagement must be between 0 and 100');
    });
  });

  describe('createDMAdaptation', () => {
    it('should create a new DM adaptation with valid data', () => {
      const adaptation = createDMAdaptation({
        turnNumber: 2,
        reflection: 'Player made a difficult choice',
        playerPerformance: {
          alignmentChange: -5,
          choiceQuality: 'poor',
          storyEngagement: 60,
          difficultyRating: 9,
          responseTime: 45,
          choiceConsistency: 0.3
        },
        adaptations: {
          difficultyAdjustment: -2,
          narrativeDirection: 'Provide more guidance',
          moodChange: 'negative',
          personalityEvolution: ['More patient', 'Clearer instructions'],
          storyModifications: ['Simplify choices', 'Add hints']
        },
        impact: {
          storyQuality: 6,
          playerEngagement: 60,
          narrativeCoherence: 7
        }
      });

      expect(adaptation.id).toBeDefined();
      expect(adaptation.turnNumber).toBe(2);
      expect(adaptation.timestamp).toBeDefined();
      expect(adaptation.reflection).toBe('Player made a difficult choice');
      expect(adaptation.playerPerformance.choiceQuality).toBe('poor');
      expect(adaptation.adaptations.difficultyAdjustment).toBe(-2);
    });

    it('should generate unique IDs for different adaptations', () => {
      const adaptation1 = createDMAdaptation({
        turnNumber: 1,
        reflection: 'First reflection',
        playerPerformance: {
          alignmentChange: 5,
          choiceQuality: 'good',
          storyEngagement: 85,
          difficultyRating: 7,
          responseTime: 30,
          choiceConsistency: 0.8
        },
        adaptations: {
          difficultyAdjustment: 1,
          narrativeDirection: 'Continue story',
          moodChange: 'positive',
          personalityEvolution: ['More encouraging'],
          storyModifications: ['Add mystery']
        },
        impact: {
          storyQuality: 8,
          playerEngagement: 85,
          narrativeCoherence: 9
        }
      });

      const adaptation2 = createDMAdaptation({
        turnNumber: 2,
        reflection: 'Second reflection',
        playerPerformance: {
          alignmentChange: 3,
          choiceQuality: 'neutral',
          storyEngagement: 75,
          difficultyRating: 6,
          responseTime: 35,
          choiceConsistency: 0.6
        },
        adaptations: {
          difficultyAdjustment: 0,
          narrativeDirection: 'Maintain current path',
          moodChange: 'neutral',
          personalityEvolution: ['No change'],
          storyModifications: ['Continue as planned']
        },
        impact: {
          storyQuality: 7,
          playerEngagement: 75,
          narrativeCoherence: 8
        }
      });

      expect(adaptation1.id).not.toBe(adaptation2.id);
    });
  });

  describe('calculatePlayerPerformance', () => {
    it('should calculate performance metrics from choices and outcomes', () => {
      const character = createCharacter({
        moralAlignment: {
          score: 20,
          level: 'good',
          reputation: 'A respected hero',
          recentChoices: ['Helped villagers', 'Defended the weak'],
          alignmentHistory: []
        }
      });

      const performance = calculatePlayerPerformance(
        character,
        mockChoices,
        mockChoiceOutcomes,
        30 // response time in seconds
      );

      expect(performance.alignmentChange).toBeDefined();
      expect(performance.choiceQuality).toBeDefined();
      expect(performance.storyEngagement).toBeGreaterThanOrEqual(0);
      expect(performance.storyEngagement).toBeLessThanOrEqual(100);
      expect(performance.difficultyRating).toBeGreaterThanOrEqual(1);
      expect(performance.difficultyRating).toBeLessThanOrEqual(10);
      expect(performance.responseTime).toBe(30);
      expect(performance.choiceConsistency).toBeGreaterThanOrEqual(0);
      expect(performance.choiceConsistency).toBeLessThanOrEqual(1);
    });

    it('should handle empty choices and outcomes', () => {
      const character = createCharacter();
      
      const performance = calculatePlayerPerformance(
        character,
        [],
        [],
        0
      );

      expect(performance.alignmentChange).toBe(0);
      expect(performance.choiceQuality).toBe('neutral');
      expect(performance.storyEngagement).toBe(50);
      expect(performance.difficultyRating).toBe(1); // Default difficulty for empty choices
      expect(performance.responseTime).toBe(0);
      expect(performance.choiceConsistency).toBe(0.5);
    });

    it('should calculate choice consistency based on alignment patterns', () => {
      const goodCharacter = createCharacter({
        moralAlignment: {
          score: 30,
          level: 'good',
          reputation: 'A heroic figure',
          recentChoices: ['Help', 'Protect', 'Save', 'Defend'],
          alignmentHistory: []
        }
      });

      const performance = calculatePlayerPerformance(
        goodCharacter,
        mockChoices,
        mockChoiceOutcomes,
        25
      );

      // Good character with consistent good choices should have reasonable consistency
      expect(performance.choiceConsistency).toBeGreaterThanOrEqual(0.5);
    });
  });
}); 