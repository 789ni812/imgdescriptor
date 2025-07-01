import { describe, it, expect } from '@jest/globals';
import { 
  DynamicPromptTemplate, 
  replacePlaceholders,
  validatePromptTemplate,
  createPromptContext
} from './dynamicPrompts';
import { createCharacter } from '../types/character';

describe('Dynamic Prompts', () => {
  describe('replacePlaceholders', () => {
    it('should replace character placeholders', () => {
      const prompt = 'Character {{CHARACTER_NAME}} has level {{CHARACTER_LEVEL}}';
      const context = {
        CHARACTER_NAME: 'Gandalf',
        CHARACTER_LEVEL: '5'
      };

      const result = replacePlaceholders(prompt, context);
      
      expect(result).toBe('Character Gandalf has level 5');
    });

    it('should replace multiple placeholders', () => {
      const prompt = '{{CHARACTER_NAME}} is a {{CHARACTER_CLASS}} with {{CHARACTER_LEVEL}} levels';
      const context = {
        CHARACTER_NAME: 'Aragorn',
        CHARACTER_CLASS: 'Ranger',
        CHARACTER_LEVEL: '10'
      };

      const result = replacePlaceholders(prompt, context);
      
      expect(result).toBe('Aragorn is a Ranger with 10 levels');
    });

    it('should handle undefined values', () => {
      const prompt = 'Character {{CHARACTER_NAME}} has {{CHARACTER_LEVEL}} levels';
      const context = {
        CHARACTER_NAME: 'Gandalf',
        CHARACTER_LEVEL: undefined
      };

      const result = replacePlaceholders(prompt, context);
      
      expect(result).toBe('Character Gandalf has {{CHARACTER_LEVEL}} levels');
    });

    it('should handle null values', () => {
      const prompt = 'Character {{CHARACTER_NAME}} has {{CHARACTER_LEVEL}} levels';
      const context = {
        CHARACTER_NAME: 'Gandalf',
        CHARACTER_LEVEL: null
      };

      const result = replacePlaceholders(prompt, context);
      
      expect(result).toBe('Character Gandalf has {{CHARACTER_LEVEL}} levels');
    });

    it('should replace game state placeholders', () => {
      const prompt = 'Turn {{CURRENT_TURN}} of {{MAX_TURNS}}';
      const context = {
        CURRENT_TURN: '2',
        MAX_TURNS: '3'
      };

      const result = replacePlaceholders(prompt, context);
      
      expect(result).toBe('Turn 2 of 3');
    });

    it('should replace DM personality placeholders', () => {
      const prompt = 'You are {{DM_PERSONALITY}} with style {{DM_STYLE}}';
      const context = {
        DM_PERSONALITY: 'Action Hero',
        DM_STYLE: 'action-oriented'
      };

      const result = replacePlaceholders(prompt, context);
      
      expect(result).toBe('You are Action Hero with style action-oriented');
    });

    it('should handle missing placeholders gracefully', () => {
      const prompt = 'Simple prompt without placeholders';
      const context = {};

      const result = replacePlaceholders(prompt, context);
      
      expect(result).toBe('Simple prompt without placeholders');
    });
  });

  describe('validatePromptTemplate', () => {
    it('should validate a correct template', () => {
      const template: DynamicPromptTemplate = {
        id: 'test-template',
        name: 'Test Template',
        type: 'story-generation',
        basePrompt: 'Create a story for {{CHARACTER_NAME}}',
        placeholders: {
          '{{CHARACTER_NAME}}': { description: 'Character name', required: true }
        },
        requiredContext: ['character'],
        version: '1.0.0',
        tags: [],
        description: 'Test template'
      };

      const isValid = validatePromptTemplate(template);
      expect(isValid).toBe(true);
    });

    it('should reject template with missing id', () => {
      const template: DynamicPromptTemplate = {
        id: '',
        name: 'Test Template',
        type: 'story-generation',
        basePrompt: 'Create a story',
        placeholders: {},
        requiredContext: [],
        version: '1.0.0',
        tags: [],
        description: 'Test template'
      };

      const isValid = validatePromptTemplate(template);
      expect(isValid).toBe(false);
    });

    it('should reject template with missing name', () => {
      const template: DynamicPromptTemplate = {
        id: 'test-template',
        name: '',
        type: 'story-generation',
        basePrompt: 'Create a story',
        placeholders: {},
        requiredContext: [],
        version: '1.0.0',
        tags: [],
        description: 'Test template'
      };

      const isValid = validatePromptTemplate(template);
      expect(isValid).toBe(false);
    });

    it('should reject template with missing basePrompt', () => {
      const template: DynamicPromptTemplate = {
        id: 'test-template',
        name: 'Test Template',
        type: 'story-generation',
        basePrompt: '',
        placeholders: {},
        requiredContext: [],
        version: '1.0.0',
        tags: [],
        description: 'Test template'
      };

      const isValid = validatePromptTemplate(template);
      expect(isValid).toBe(false);
    });

    it('should reject template with invalid placeholder config', () => {
      const template: DynamicPromptTemplate = {
        id: 'test-template',
        name: 'Test Template',
        type: 'story-generation',
        basePrompt: 'Create a story',
        placeholders: {
          '{{CHARACTER_NAME}}': { description: '', required: true }
        },
        requiredContext: [],
        version: '1.0.0',
        tags: [],
        description: 'Test template'
      };

      const isValid = validatePromptTemplate(template);
      expect(isValid).toBe(false);
    });
  });

  describe('createPromptContext', () => {
    it('should create context with character data', () => {
      const character = createCharacter({
        persona: 'Gandalf',
        stats: { intelligence: 15, creativity: 12, perception: 14, wisdom: 16 },
        health: 150,
        experience: 100,
        level: 5
      });

      const context = createPromptContext(character);

      expect(context.character).toBe(character);
      expect(context.characterName).toBe('Gandalf');
      expect(context.characterLevel).toBe(5);
      expect(context.characterStats).toBe(JSON.stringify(character.stats));
      expect(context.characterHealth).toBe(150);
    });

    it('should create context with DM config', () => {
      const character = createCharacter({
        persona: 'Aragorn'
      });

      const dmConfig = {
        personality: {
          name: 'Action Hero',
          style: 'action-oriented',
          description: 'Fast-paced storyteller'
        },
        style: 'fast-paced',
        difficulty: 'hard'
      };

      const context = createPromptContext(character, dmConfig);

      expect(context.dmPersonality).toEqual({
        name: 'Action Hero',
        style: 'action-oriented',
        description: 'Fast-paced storyteller'
      });
      expect(context.dmStyle).toBe('fast-paced');
      expect(context.difficulty).toBe('hard');
    });

    it('should create context with game state', () => {
      const character = createCharacter({
        persona: 'Legolas'
      });

      const gameState = {
        currentTurn: 2,
        maxTurns: 5,
        storyHistory: [],
        choiceHistory: []
      };

      const context = createPromptContext(character, undefined, gameState);

      expect(context.gameState).toBe(gameState);
    });

    it('should use default values when config is not provided', () => {
      const character = createCharacter({
        persona: 'Gimli'
      });

      const context = createPromptContext(character);

      expect(context.dmPersonality).toBe('balanced');
      expect(context.dmStyle).toBe('narrative');
      expect(context.difficulty).toBe('medium');
    });
  });
}); 