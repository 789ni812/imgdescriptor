import { describe, it, expect } from '@jest/globals';
import { 
  DynamicPromptTemplate, 
  PromptContext, 
  DynamicPromptEngine,
  replacePlaceholders,
  validatePromptTemplate,
  createPromptContext
} from './dynamicPrompts';
import { createCharacter } from '../types/character';
import { PersonalityType } from '../types/dungeonMaster';

describe('Dynamic Prompt System', () => {
  describe('DynamicPromptTemplate', () => {
    it('should create a valid prompt template', () => {
      const template: DynamicPromptTemplate = {
        id: 'test-template',
        name: 'Test Template',
        type: 'story-generation',
        basePrompt: 'Create a story for {{CHAR_NAME}} with stats {{CHAR_STATS}}',
        placeholders: {
          '{{CHAR_NAME}}': {
            description: 'Character name',
            required: true
          },
          '{{CHAR_STATS}}': {
            description: 'Character stats',
            required: true
          }
        },
        requiredContext: ['character'],
        version: '1.0.0',
        tags: ['test', 'story']
      };

      expect(template.id).toBe('test-template');
      expect(template.type).toBe('story-generation');
      expect(template.placeholders['{{CHAR_NAME}}'].required).toBe(true);
    });

    it('should validate prompt template structure', () => {
      const validTemplate: DynamicPromptTemplate = {
        id: 'valid-template',
        name: 'Valid Template',
        type: 'image-description',
        basePrompt: 'Describe {{IMAGE_CONTEXT}}',
        placeholders: {
          '{{IMAGE_CONTEXT}}': {
            description: 'Image context',
            required: true
          }
        },
        requiredContext: ['image'],
        version: '1.0.0',
        tags: []
      };

      const result = validatePromptTemplate(validTemplate);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid prompt template', () => {
      const invalidTemplate = {
        id: 'invalid-template',
        name: 'Invalid Template',
        type: 'invalid-type',
        basePrompt: '',
        placeholders: {},
        requiredContext: [],
        version: '1.0.0'
      } as DynamicPromptTemplate;

      const result = validatePromptTemplate(invalidTemplate);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('PromptContext', () => {
    it('should create a valid prompt context from character', () => {
      const character = createCharacter({
        health: 150,
        level: 5,
        stats: {
          intelligence: 15,
          creativity: 12,
          perception: 14,
          wisdom: 16
        }
      });

      const context = createPromptContext({
        character,
        currentTurn: 2,
        totalTurns: 3,
        imageDescription: 'A mysterious forest',
        dmPersonality: null
      });

      expect(context.character.stats.intelligence).toBe(15);
      expect(context.character.health).toBe(150);
      expect(context.character.level).toBe(5);
      expect(context.game.currentTurn).toBe(2);
      expect(context.game.totalTurns).toBe(3);
      expect(context.current.imageDescription).toBe('A mysterious forest');
    });

    it('should include DM personality in context', () => {
      const character = createCharacter();
      const dmPersonality: PersonalityType = {
        name: 'Mysterious Sage',
        style: 'mysterious',
        description: 'An enigmatic storyteller'
      };

      const context = createPromptContext({
        character,
        currentTurn: 1,
        totalTurns: 3,
        imageDescription: 'A dark cave',
        dmPersonality
      });

      expect(context.dm.personality.name).toBe('Mysterious Sage');
      expect(context.dm.personality.style).toBe('mysterious');
    });
  });

  describe('replacePlaceholders', () => {
    it('should replace character stat placeholders', () => {
      const prompt = 'Your character has {{CHAR_STATS}} and health {{CHAR_HEALTH}}';
      const context: PromptContext = {
        character: {
          stats: { intelligence: 15, creativity: 12, perception: 14, wisdom: 16 },
          health: 150,
          experience: 100,
          level: 5,
          inventory: []
        },
        game: {
          currentTurn: 2,
          totalTurns: 3,
          storyHistory: [],
          choiceHistory: [],
          imageHistory: []
        },
        dm: {
          personality: null,
          mood: 'neutral',
          style: 'neutral'
        },
        current: {
          imageDescription: 'A forest',
          previousStory: undefined,
          availableChoices: undefined
        }
      };

      const result = replacePlaceholders(prompt, context);
      
      expect(result).toContain('INT: 15, CRE: 12, PER: 14, WIS: 16');
      expect(result).toContain('150');
      expect(result).not.toContain('{{CHAR_STATS}}');
      expect(result).not.toContain('{{CHAR_HEALTH}}');
    });

    it('should replace game state placeholders', () => {
      const prompt = 'Turn {{CURRENT_TURN}} of {{TOTAL_TURNS}}';
      const context: PromptContext = {
        character: {
          stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
          health: 100,
          experience: 0,
          level: 1,
          inventory: []
        },
        game: {
          currentTurn: 2,
          totalTurns: 3,
          storyHistory: [],
          choiceHistory: [],
          imageHistory: []
        },
        dm: {
          personality: null,
          mood: 'neutral',
          style: 'neutral'
        },
        current: {
          imageDescription: 'A forest',
          previousStory: undefined,
          availableChoices: undefined
        }
      };

      const result = replacePlaceholders(prompt, context);
      
      expect(result).toBe('Turn 2 of 3');
    });

    it('should replace DM personality placeholders', () => {
      const prompt = 'You are {{DM_PERSONALITY}} with style {{DM_STYLE}}';
      const context: PromptContext = {
        character: {
          stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
          health: 100,
          experience: 0,
          level: 1,
          inventory: []
        },
        game: {
          currentTurn: 1,
          totalTurns: 3,
          storyHistory: [],
          choiceHistory: [],
          imageHistory: []
        },
        dm: {
          personality: {
            name: 'Action Hero',
            style: 'action-oriented',
            description: 'Fast-paced storyteller'
          },
          mood: 'positive',
          style: 'action-oriented'
        },
        current: {
          imageDescription: 'A battlefield',
          previousStory: undefined,
          availableChoices: undefined
        }
      };

      const result = replacePlaceholders(prompt, context);
      
      expect(result).toBe('You are Action Hero with style action-oriented');
    });

    it('should handle missing placeholders gracefully', () => {
      const prompt = 'Simple prompt without placeholders';
      const context: PromptContext = {
        character: {
          stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
          health: 100,
          experience: 0,
          level: 1,
          inventory: []
        },
        game: {
          currentTurn: 1,
          totalTurns: 3,
          storyHistory: [],
          choiceHistory: [],
          imageHistory: []
        },
        dm: {
          personality: null,
          mood: 'neutral',
          style: 'neutral'
        },
        current: {
          imageDescription: 'A forest',
          previousStory: undefined,
          availableChoices: undefined
        }
      };

      const result = replacePlaceholders(prompt, context);
      
      expect(result).toBe('Simple prompt without placeholders');
    });
  });

  describe('DynamicPromptEngine', () => {
    let engine: DynamicPromptEngine;

    beforeEach(() => {
      engine = new DynamicPromptEngine();
    });

    it('should generate prompt with context', () => {
      const template: DynamicPromptTemplate = {
        id: 'test-template',
        name: 'Test Template',
        type: 'story-generation',
        basePrompt: 'Create a story for a character with {{CHAR_STATS}} on turn {{CURRENT_TURN}}',
        placeholders: {
          '{{CHAR_STATS}}': { description: 'Character stats', required: true },
          '{{CURRENT_TURN}}': { description: 'Current turn', required: true }
        },
        requiredContext: ['character', 'game'],
        version: '1.0.0',
        tags: []
      };

      const context: PromptContext = {
        character: {
          stats: { intelligence: 15, creativity: 12, perception: 14, wisdom: 16 },
          health: 150,
          experience: 100,
          level: 5,
          inventory: []
        },
        game: {
          currentTurn: 2,
          totalTurns: 3,
          storyHistory: [],
          choiceHistory: [],
          imageHistory: []
        },
        dm: {
          personality: null,
          mood: 'neutral',
          style: 'neutral'
        },
        current: {
          imageDescription: 'A mysterious forest',
          previousStory: undefined,
          availableChoices: undefined
        }
      };

      const result = engine.generatePrompt(template, context);
      
      expect(result).toContain('INT: 15, CRE: 12, PER: 14, WIS: 16');
      expect(result).toContain('2');
      expect(result).not.toContain('{{CHAR_STATS}}');
      expect(result).not.toContain('{{CURRENT_TURN}}');
    });

    it('should validate prompt before generation', () => {
      const invalidTemplate: DynamicPromptTemplate = {
        id: 'invalid-template',
        name: 'Invalid Template',
        type: 'story-generation',
        basePrompt: '',
        placeholders: {},
        requiredContext: [],
        version: '1.0.0',
        tags: []
      };

      const context: PromptContext = {
        character: {
          stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
          health: 100,
          experience: 0,
          level: 1,
          inventory: []
        },
        game: {
          currentTurn: 1,
          totalTurns: 3,
          storyHistory: [],
          choiceHistory: [],
          imageHistory: []
        },
        dm: {
          personality: null,
          mood: 'neutral',
          style: 'neutral'
        },
        current: {
          imageDescription: 'A forest',
          previousStory: undefined,
          availableChoices: undefined
        }
      };

      const isValid = engine.validatePrompt(invalidTemplate, context);
      expect(isValid).toBe(false);
    });

    it('should cache generated prompts', () => {
      const template: DynamicPromptTemplate = {
        id: 'cache-test',
        name: 'Cache Test',
        type: 'story-generation',
        basePrompt: 'Test prompt',
        placeholders: {},
        requiredContext: [],
        version: '1.0.0',
        tags: []
      };

      const context: PromptContext = {
        character: {
          stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
          health: 100,
          experience: 0,
          level: 1,
          inventory: []
        },
        game: {
          currentTurn: 1,
          totalTurns: 3,
          storyHistory: [],
          choiceHistory: [],
          imageHistory: []
        },
        dm: {
          personality: null,
          mood: 'neutral',
          style: 'neutral'
        },
        current: {
          imageDescription: 'A forest',
          previousStory: undefined,
          availableChoices: undefined
        }
      };

      // Generate prompt first time
      const firstResult = engine.generatePrompt(template, context);
      
      // Check cache
      const cachedResult = engine.getCachedPrompt('cache-test');
      expect(cachedResult).toBe(firstResult);
    });
  });
}); 