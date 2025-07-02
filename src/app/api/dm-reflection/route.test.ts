/**
 * @jest-environment node
 */
// Polyfill TextEncoder/TextDecoder for undici and web APIs
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

import { POST } from './route';
import { Character, createCharacter } from '@/lib/types/character';
import { Choice, ChoiceOutcome } from '@/lib/types/character';
import { DungeonMasterTemplate } from '@/lib/types/dungeonMaster';

// Mock the DM reflection prompts module
jest.mock('@/lib/prompts/dmReflectionPrompts', () => ({
  buildDMReflectionPrompt: jest.fn(() => 'Mock reflection prompt'),
  parseDMReflectionResponse: jest.fn(() => ({
    reflection: 'Mock reflection response',
    adaptations: {
      difficultyAdjustment: 1,
      narrativeDirection: 'Continue with positive reinforcement',
      moodChange: 'positive',
      personalityEvolution: ['More encouraging'],
      storyModifications: ['Add more moral dilemmas']
    },
    playerAssessment: {
      engagement: 85,
      understanding: 80,
      satisfaction: 90
    }
  })),
  validateReflectionContext: jest.fn(() => ({ isValid: true, errors: [] }))
}));

// Mock fetch for external API calls
global.fetch = jest.fn();

describe('DM Reflection API Route', () => {
  const mockCharacter: Character = createCharacter({
    moralAlignment: {
      score: 25,
      level: 'good',
      reputation: 'A respected hero',
      recentChoices: ['Helped villagers', 'Defended the weak'],
      alignmentHistory: []
    }
  });

  const mockChoices: Choice[] = [
    { id: '1', text: 'Help the villagers' },
    { id: '2', text: 'Ignore their plight' }
  ];

  const mockOutcomes: ChoiceOutcome[] = [
    {
      id: 'outcome-1',
      choiceId: '1',
      text: 'Help the villagers',
      outcome: 'The villagers are grateful and offer you supplies',
      timestamp: new Date().toISOString(),
      turnNumber: 1
    }
  ];

  const mockDMPersonality: DungeonMasterTemplate = {
    personality: {
      name: 'Gandalf',
      style: 'wise',
      description: 'A wise and encouraging Dungeon Master'
    },
    notes: 'Prefers moral choices and character development'
  };

  const createMockRequest = (body: any): Request => {
    return new Request('http://localhost:3000/api/dm-reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    
    // Reset mocks to default values
    const { buildDMReflectionPrompt, parseDMReflectionResponse, validateReflectionContext } = await import('@/lib/prompts/dmReflectionPrompts');
    (buildDMReflectionPrompt as jest.Mock).mockReturnValue('Mock reflection prompt');
    (parseDMReflectionResponse as jest.Mock).mockReturnValue({
      reflection: 'Mock reflection response',
      adaptations: {
        difficultyAdjustment: 1,
        narrativeDirection: 'Continue with positive reinforcement',
        moodChange: 'positive',
        personalityEvolution: ['More encouraging'],
        storyModifications: ['Add more moral dilemmas']
      },
      playerAssessment: {
        engagement: 85,
        understanding: 80,
        satisfaction: 90
      }
    });
    (validateReflectionContext as jest.Mock).mockReturnValue({ isValid: true, errors: [] });
  });

  describe('POST /api/dm-reflection', () => {
    it('should return 400 for missing required fields', async () => {
      const request = createMockRequest({
        character: mockCharacter,
        currentTurn: 1
        // Missing imageDescription, generatedStory, etc.
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 for invalid reflection context', async () => {
      const { validateReflectionContext } = await import('@/lib/prompts/dmReflectionPrompts');
      (validateReflectionContext as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Invalid character data', 'Missing player choices']
      });

      const request = createMockRequest({
        character: mockCharacter,
        currentTurn: 1,
        imageDescription: 'A dark cave with ancient symbols',
        generatedStory: 'The adventurer enters the mysterious cave.',
        playerChoices: mockChoices,
        choiceOutcomes: mockOutcomes,
        dmPersonality: mockDMPersonality,
        currentMood: 'positive',
        previousAdaptations: [],
        playerPerformance: {
          alignmentChange: 5,
          choiceQuality: 'good',
          storyEngagement: 85,
          difficultyRating: 7
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid reflection context');
    });

    it('should successfully process DM reflection request', async () => {
      const { buildDMReflectionPrompt, parseDMReflectionResponse } = await import('@/lib/prompts/dmReflectionPrompts');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'REFLECTION: Player showed good judgment\nDIFFICULTY_ADJUSTMENT: 1\nNARRATIVE_DIRECTION: Continue with positive reinforcement\nMOOD_CHANGE: positive\nPERSONALITY_EVOLUTION: More encouraging, Patient with choices'
              }
            }
          ]
        })
      });

      const request = createMockRequest({
        character: mockCharacter,
        currentTurn: 1,
        imageDescription: 'A dark cave with ancient symbols',
        generatedStory: 'The adventurer enters the mysterious cave.',
        playerChoices: mockChoices,
        choiceOutcomes: mockOutcomes,
        dmPersonality: mockDMPersonality,
        currentMood: 'positive',
        previousAdaptations: [],
        playerPerformance: {
          alignmentChange: 5,
          choiceQuality: 'good',
          storyEngagement: 85,
          difficultyRating: 7
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.reflection).toBeDefined();
      expect(data.adaptations).toBeDefined();
      expect(data.playerAssessment).toBeDefined();
      expect(buildDMReflectionPrompt).toHaveBeenCalled();
      expect(parseDMReflectionResponse).toHaveBeenCalled();
    });

    it('should handle LLM API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const request = createMockRequest({
        character: mockCharacter,
        currentTurn: 1,
        imageDescription: 'A dark cave with ancient symbols',
        generatedStory: 'The adventurer enters the mysterious cave.',
        playerChoices: mockChoices,
        choiceOutcomes: mockOutcomes,
        dmPersonality: mockDMPersonality,
        currentMood: 'positive',
        previousAdaptations: [],
        playerPerformance: {
          alignmentChange: 5,
          choiceQuality: 'good',
          storyEngagement: 85,
          difficultyRating: 7
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to generate DM reflection');
    });

    it('should handle invalid LLM response format', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Invalid response format without required fields'
              }
            }
          ]
        })
      });

      const { parseDMReflectionResponse } = await import('@/lib/prompts/dmReflectionPrompts');
      (parseDMReflectionResponse as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid reflection response format');
      });

      const request = createMockRequest({
        character: mockCharacter,
        currentTurn: 1,
        imageDescription: 'A dark cave with ancient symbols',
        generatedStory: 'The adventurer enters the mysterious cave.',
        playerChoices: mockChoices,
        choiceOutcomes: mockOutcomes,
        dmPersonality: mockDMPersonality,
        currentMood: 'positive',
        previousAdaptations: [],
        playerPerformance: {
          alignmentChange: 5,
          choiceQuality: 'good',
          storyEngagement: 85,
          difficultyRating: 7
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to parse DM reflection response');
    });

    it('should validate request body structure', async () => {
      const request = createMockRequest({
        invalidField: 'should not be here',
        character: 'not a character object'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should handle missing player performance metrics', async () => {
      const request = createMockRequest({
        character: mockCharacter,
        currentTurn: 1,
        imageDescription: 'A dark cave with ancient symbols',
        generatedStory: 'The adventurer enters the mysterious cave.',
        playerChoices: mockChoices,
        choiceOutcomes: mockOutcomes,
        dmPersonality: mockDMPersonality,
        currentMood: 'positive',
        previousAdaptations: []
        // Missing playerPerformance
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required fields');
    });

    it('should validate player performance metrics ranges', async () => {
      const { validateReflectionContext } = await import('@/lib/prompts/dmReflectionPrompts');
      (validateReflectionContext as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['storyEngagement must be between 0 and 100']
      });

      const request = createMockRequest({
        character: mockCharacter,
        currentTurn: 1,
        imageDescription: 'A dark cave with ancient symbols',
        generatedStory: 'The adventurer enters the mysterious cave.',
        playerChoices: mockChoices,
        choiceOutcomes: mockOutcomes,
        dmPersonality: mockDMPersonality,
        currentMood: 'positive',
        previousAdaptations: [],
        playerPerformance: {
          alignmentChange: 5,
          choiceQuality: 'good',
          storyEngagement: 150, // Invalid: > 100
          difficultyRating: 7
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid reflection context');
    });

    it('should include proper CORS headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'REFLECTION: Valid response\nDIFFICULTY_ADJUSTMENT: 0\nNARRATIVE_DIRECTION: Continue current path\nMOOD_CHANGE: neutral\nPERSONALITY_EVOLUTION: No change'
              }
            }
          ]
        })
      });

      const request = createMockRequest({
        character: mockCharacter,
        currentTurn: 1,
        imageDescription: 'A dark cave with ancient symbols',
        generatedStory: 'The adventurer enters the mysterious cave.',
        playerChoices: mockChoices,
        choiceOutcomes: mockOutcomes,
        dmPersonality: mockDMPersonality,
        currentMood: 'positive',
        previousAdaptations: [],
        playerPerformance: {
          alignmentChange: 5,
          choiceQuality: 'good',
          storyEngagement: 85,
          difficultyRating: 7
        }
      });

      const response = await POST(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    });
  });
}); 