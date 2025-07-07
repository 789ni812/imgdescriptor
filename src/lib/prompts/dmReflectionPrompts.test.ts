import { 
  buildDMReflectionPrompt, 
  parseDMReflectionResponse,
  validateReflectionContext,
  DMReflectionContext
} from './dmReflectionPrompts';
import { Character, createCharacter } from '../types/character';
import { Choice, ChoiceOutcome } from '../types/character';
import { DungeonMasterTemplate } from '../types/dungeonMaster';

describe('DM Reflection Prompt System', () => {
  const mockCharacter: Character = createCharacter({
    persona: 'Adventurer',
    moralAlignment: {
      score: 25,
      level: 'good',
      reputation: 'A respected hero',
      recentChoices: ['Helped villagers', 'Defended the weak'],
      alignmentHistory: []
    }
  });

  const mockDM: DungeonMasterTemplate = {
    personality: {
      name: 'Mysterious DM',
      style: 'descriptive',
      description: 'A mysterious and challenging Dungeon Master'
    },
    notes: 'Mysterious DM configuration'
  };

  const mockChoices: Choice[] = [
    { id: '1', text: 'Help the villagers' },
    { id: '2', text: 'Ignore their plight' }
  ];

  const mockOutcomes: ChoiceOutcome[] = [
    { 
      id: 'outcome-1',
      choiceId: '1', 
      text: 'Help the villagers',
      outcome: 'Villagers grateful', 
      timestamp: '2025-07-02T00:00:00Z',
      turnNumber: 2
    }
  ];

  describe('buildDMReflectionPrompt', () => {
    it('should generate a reflection prompt with valid context', () => {
      const context: DMReflectionContext = {
        character: mockCharacter,
        currentTurn: 2,
        imageDescription: 'A dark forest with mysterious shadows',
        generatedStory: 'The adventurer enters the dark forest...',
        playerChoices: mockChoices,
        choiceOutcomes: mockOutcomes,
        dmPersonality: mockDM,
        currentMood: 'neutral',
        previousAdaptations: [],
        playerPerformance: {
          alignmentChange: 10,
          choiceQuality: 'good',
          storyEngagement: 85,
          difficultyRating: 6
        }
      };

      const prompt = buildDMReflectionPrompt(context);

      expect(prompt).toContain('You are Mysterious DM');
      expect(prompt).toContain('Player Alignment: good (25)');
      expect(prompt).toContain('Current Turn: 2');
      expect(prompt).toContain('A dark forest with mysterious shadows');
      expect(prompt).toContain('The adventurer enters the dark forest');
      expect(prompt).toContain('Help the villagers');
      expect(prompt).toContain('REFLECTION:');
      expect(prompt).toContain('DIFFICULTY_ADJUSTMENT:');
      expect(prompt).toContain('NARRATIVE_DIRECTION:');
      expect(prompt).toContain('MOOD_CHANGE:');
      expect(prompt).toContain('PERSONALITY_EVOLUTION:');
    });

    it('should include previous adaptations in context', () => {
      const previousAdaptations = [
        {
          id: 'adapt-1',
          turnNumber: 1,
          timestamp: '2025-07-02T00:00:00Z',
          reflection: 'Player showed good judgment by helping villagers',
          playerPerformance: {
            alignmentChange: 10,
            choiceQuality: 'good' as const,
            storyEngagement: 85,
            difficultyRating: 6,
            responseTime: 30,
            choiceConsistency: 0.8
          },
          adaptations: {
            difficultyAdjustment: 2,
            narrativeDirection: 'increase mystery',
            moodChange: 'positive' as const,
            personalityEvolution: ['more encouraging', 'prefers moral choices'],
            storyModifications: ['add more mystery elements']
          },
          impact: {
            storyQuality: 8,
            playerEngagement: 85,
            narrativeCoherence: 9
          }
        }
      ];

      const context: DMReflectionContext = {
        character: mockCharacter,
        currentTurn: 2,
        imageDescription: 'A dark forest with mysterious shadows',
        generatedStory: 'The adventurer enters the dark forest...',
        playerChoices: mockChoices,
        choiceOutcomes: mockOutcomes,
        dmPersonality: mockDM,
        currentMood: 'positive',
        previousAdaptations,
        playerPerformance: {
          alignmentChange: 10,
          choiceQuality: 'good',
          storyEngagement: 85,
          difficultyRating: 6
        }
      };

      const prompt = buildDMReflectionPrompt(context);

      expect(prompt).toContain('Previous Adaptations:');
      expect(prompt).toContain('Player showed good judgment');
      expect(prompt).toContain('increase mystery');
      expect(prompt).toContain('more encouraging');
    });

    it('should handle empty previous adaptations', () => {
      const context: DMReflectionContext = {
        character: mockCharacter,
        currentTurn: 1,
        imageDescription: 'A peaceful village',
        generatedStory: 'The adventure begins...',
        playerChoices: mockChoices,
        choiceOutcomes: mockOutcomes,
        dmPersonality: mockDM,
        currentMood: 'neutral',
        previousAdaptations: [],
        playerPerformance: {
          alignmentChange: 0,
          choiceQuality: 'neutral',
          storyEngagement: 70,
          difficultyRating: 5
        }
      };

      const prompt = buildDMReflectionPrompt(context);

      expect(prompt).toContain('Previous Adaptations:\nNone');
      expect(prompt).toContain('Current Turn: 1');
    });
  });

  describe('parseDMReflectionResponse', () => {
    it('should parse a valid reflection response', () => {
      const mockResponse = `
REFLECTION: The player showed good judgment by helping the villagers. Their moral alignment is developing well, and they seem engaged with the story.

DIFFICULTY_ADJUSTMENT: +2

NARRATIVE_DIRECTION: Increase the mystery and add more moral dilemmas

MOOD_CHANGE: positive

PERSONALITY_EVOLUTION: Becoming more encouraging of good choices, developing a preference for moral complexity
      `;

      const result = parseDMReflectionResponse(mockResponse);

      expect(result).toEqual({
        reflection: 'The player showed good judgment by helping the villagers. Their moral alignment is developing well, and they seem engaged with the story.',
        adaptations: {
          difficultyAdjustment: 2,
          narrativeDirection: 'Increase the mystery and add more moral dilemmas',
          moodChange: 'positive',
          personalityEvolution: ['Becoming more encouraging of good choices', 'developing a preference for moral complexity'],
          storyModifications: []
        },
        playerAssessment: {
          engagement: 0,
          understanding: 0,
          satisfaction: 0
        }
      });
    });

    it('should handle missing optional fields', () => {
      const mockResponse = `
REFLECTION: Basic reflection without all fields.

DIFFICULTY_ADJUSTMENT: 0

NARRATIVE_DIRECTION: Continue current direction

MOOD_CHANGE: neutral
      `;

      const result = parseDMReflectionResponse(mockResponse);

      expect(result.reflection).toBe('Basic reflection without all fields.');
      expect(result.adaptations.difficultyAdjustment).toBe(0);
      expect(result.adaptations.narrativeDirection).toBe('Continue current direction');
      expect(result.adaptations.moodChange).toBe('neutral');
      expect(result.adaptations.personalityEvolution).toEqual([]);
      expect(result.adaptations.storyModifications).toEqual([]);
    });

    it('should return fallback response for invalid response format', () => {
      const invalidResponse = 'Invalid response without required fields';

      const result = parseDMReflectionResponse(invalidResponse);

      expect(result).toEqual({
        reflection: 'The Dungeon Master is momentarily silent, reflecting on the events... (No valid reflection returned by AI)',
        adaptations: {
          difficultyAdjustment: 0,
          narrativeDirection: 'Continue the story as best as possible.',
          moodChange: 'neutral',
          personalityEvolution: [],
          storyModifications: []
        },
        playerAssessment: {
          engagement: 0,
          understanding: 0,
          satisfaction: 0
        }
      });
    });

    it('should handle negative difficulty adjustments', () => {
      const mockResponse = `
REFLECTION: Player is struggling, need to reduce difficulty.

DIFFICULTY_ADJUSTMENT: -3

NARRATIVE_DIRECTION: Simplify the story and provide more guidance

MOOD_CHANGE: negative
      `;

      const result = parseDMReflectionResponse(mockResponse);

      expect(result.adaptations.difficultyAdjustment).toBe(-3);
      expect(result.adaptations.moodChange).toBe('negative');
    });
  });

  describe('validateReflectionContext', () => {
    it('should validate a correct reflection context', () => {
      const context: DMReflectionContext = {
        character: mockCharacter,
        currentTurn: 2,
        imageDescription: 'A dark forest',
        generatedStory: 'The story continues...',
        playerChoices: mockChoices,
        choiceOutcomes: mockOutcomes,
        dmPersonality: mockDM,
        currentMood: 'neutral',
        previousAdaptations: [],
        playerPerformance: {
          alignmentChange: 10,
          choiceQuality: 'good',
          storyEngagement: 85,
          difficultyRating: 6
        }
      };

      const result = validateReflectionContext(context);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject context with missing required fields', () => {
      const invalidContext = {
        character: mockCharacter,
        currentTurn: 2,
        // Missing imageDescription, generatedStory, etc.
      } as any;

      const result = validateReflectionContext(invalidContext);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('imageDescription is required');
      expect(result.errors).toContain('generatedStory is required');
      expect(result.errors).toContain('playerChoices is required');
    });

    it('should validate player performance metrics', () => {
      const context: DMReflectionContext = {
        character: mockCharacter,
        currentTurn: 2,
        imageDescription: 'A dark forest',
        generatedStory: 'The story continues...',
        playerChoices: mockChoices,
        choiceOutcomes: mockOutcomes,
        dmPersonality: mockDM,
        currentMood: 'neutral',
        previousAdaptations: [],
        playerPerformance: {
          alignmentChange: 10,
          choiceQuality: 'invalid' as any, // Invalid choice quality
          storyEngagement: 150, // Invalid engagement (should be 0-100)
          difficultyRating: 6
        }
      };

      const result = validateReflectionContext(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('choiceQuality must be one of: good, neutral, poor');
      expect(result.errors).toContain('storyEngagement must be between 0 and 100');
    });

    it('should validate mood values', () => {
      const context: DMReflectionContext = {
        character: mockCharacter,
        currentTurn: 2,
        imageDescription: 'A dark forest',
        generatedStory: 'The story continues...',
        playerChoices: mockChoices,
        choiceOutcomes: mockOutcomes,
        dmPersonality: mockDM,
        currentMood: 'invalid' as any, // Invalid mood
        previousAdaptations: [],
        playerPerformance: {
          alignmentChange: 10,
          choiceQuality: 'good',
          storyEngagement: 85,
          difficultyRating: 6
        }
      };

      const result = validateReflectionContext(context);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('currentMood must be one of: positive, negative, neutral');
    });
  });
}); 