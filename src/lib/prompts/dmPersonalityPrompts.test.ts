import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  createDMPersonalityPrompt,
  createPersonalityDrivenStoryPrompt,
  createDMMoodSystemPrompt,
  createPersonalityAdaptationPrompt,
  analyzeDMPersonality,
  generatePersonalityModifiers,
  createDMStylePrompt,
  createPersonalityConsistencyPrompt
} from './dmPersonalityPrompts';
import { createCharacter, Character } from '../types/character';
import { PersonalityType } from '../types/dungeonMaster';
import { PromptContext } from './dynamicPrompts';

describe('DM Personality Integration', () => {
  let baseContext: PromptContext;
  let sampleDMPersonality: PersonalityType;

  beforeEach(() => {
    baseContext = {
      character: {
        stats: { intelligence: 12, creativity: 10, perception: 14, wisdom: 11 },
        health: 120,
        experience: 50,
        level: 2,
        inventory: []
      },
      game: {
        currentTurn: 2,
        totalTurns: 3,
        storyHistory: [
          { id: '1', text: 'First adventure', timestamp: '2025-01-27', turnNumber: 1, imageDescription: 'Forest' }
        ],
        choiceHistory: [],
        imageHistory: []
      },
      dm: {
        personality: null,
        mood: 'neutral',
        style: 'neutral'
      },
      current: {
        imageDescription: 'A mysterious cave entrance',
        previousStory: 'The character discovered a hidden cave',
        availableChoices: undefined
      }
    };

    sampleDMPersonality = {
      name: 'Mysterious Sage',
      style: 'mysterious',
      description: 'An enigmatic storyteller who weaves tales of ancient wisdom and hidden knowledge'
    };
  });

  describe('createDMPersonalityPrompt', () => {
    it('should generate prompt that incorporates DM personality', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: sampleDMPersonality,
          mood: 'positive',
          style: 'mysterious'
        }
      };

      const prompt = createDMPersonalityPrompt(context);

      expect(prompt).toContain('Mysterious Sage');
      expect(prompt).toContain('mysterious');
      expect(prompt).toContain('enigmatic storyteller');
      expect(prompt).toContain('ancient wisdom');
    });

    it('should include DM mood in prompt generation', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: sampleDMPersonality,
          mood: 'negative',
          style: 'mysterious'
        }
      };

      const prompt = createDMPersonalityPrompt(context);

      expect(prompt).toContain('negative');
      expect(prompt).toContain('mood');
      expect(prompt).toContain('tone');
    });

    it('should handle missing DM personality gracefully', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: null,
          mood: 'neutral',
          style: 'neutral'
        }
      };

      const prompt = createDMPersonalityPrompt(context);

      expect(prompt).toContain('neutral');
      expect(prompt).toContain('balanced');
      expect(prompt).not.toContain('undefined');
    });

    it('should include character context in DM personality prompt', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: sampleDMPersonality,
          mood: 'positive',
          style: 'mysterious'
        }
      };

      const prompt = createDMPersonalityPrompt(context);

      expect(prompt).toContain('character');
      expect(prompt).toContain('INT: 12, CRE: 10, PER: 14, WIS: 11');
      expect(prompt).toContain('level 2');
    });
  });

  describe('createPersonalityDrivenStoryPrompt', () => {
    it('should create story prompt that reflects DM personality', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: sampleDMPersonality,
          mood: 'positive',
          style: 'mysterious'
        }
      };

      const prompt = createPersonalityDrivenStoryPrompt(context);

      expect(prompt).toContain('Mysterious Sage');
      expect(prompt).toContain('mysterious style');
      expect(prompt).toContain('personality-driven');
      expect(prompt).toContain('storytelling approach');
    });

    it('should adapt story tone based on DM mood', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: sampleDMPersonality,
          mood: 'negative',
          style: 'mysterious'
        }
      };

      const prompt = createPersonalityDrivenStoryPrompt(context);

      expect(prompt).toContain('negative mood');
      expect(prompt).toContain('darker tone');
      expect(prompt).toContain('challenging');
    });

    it('should include character development in personality-driven stories', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: sampleDMPersonality,
          mood: 'positive',
          style: 'mysterious'
        }
      };

      const prompt = createPersonalityDrivenStoryPrompt(context);

      expect(prompt).toContain('character development');
      expect(prompt).toContain('personal growth');
      expect(prompt).toContain('character arc');
    });
  });

  describe('createDMMoodSystemPrompt', () => {
    it('should create mood-based prompt modifications', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: sampleDMPersonality,
          mood: 'positive',
          style: 'mysterious'
        }
      };

      const prompt = createDMMoodSystemPrompt(context);

      expect(prompt).toContain('positive mood');
      expect(prompt).toContain('optimistic');
      expect(prompt).toContain('encouraging');
    });

    it('should handle negative mood appropriately', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: sampleDMPersonality,
          mood: 'negative',
          style: 'mysterious'
        }
      };

      const prompt = createDMMoodSystemPrompt(context);

      expect(prompt).toContain('negative mood');
      expect(prompt).toContain('challenging');
      expect(prompt).toContain('difficult');
    });

    it('should provide neutral mood guidance', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: sampleDMPersonality,
          mood: 'neutral',
          style: 'mysterious'
        }
      };

      const prompt = createDMMoodSystemPrompt(context);

      expect(prompt).toContain('neutral mood');
      expect(prompt).toContain('balanced');
      expect(prompt).toContain('objective');
    });
  });

  describe('createPersonalityAdaptationPrompt', () => {
    it('should create prompt for personality adaptation', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: sampleDMPersonality,
          mood: 'positive',
          style: 'mysterious'
        }
      };

      const prompt = createPersonalityAdaptationPrompt(context);

      expect(prompt).toContain('personality adaptation');
      expect(prompt).toContain('character preferences');
      expect(prompt).toContain('adaptive storytelling');
    });

    it('should consider character choices in adaptation', () => {
      const context: PromptContext = {
        ...baseContext,
        game: {
          ...baseContext.game,
          choiceHistory: [
            {
              id: '1',
              choiceId: 'bold-choice',
              text: 'Bold action',
              outcome: 'Success',
              statChanges: { courage: 1 },
              timestamp: '2025-01-27T10:00:00Z',
              turnNumber: 1
            }
          ]
        },
        dm: {
          personality: sampleDMPersonality,
          mood: 'positive',
          style: 'mysterious'
        }
      };

      const prompt = createPersonalityAdaptationPrompt(context);

      expect(prompt).toContain('choice history');
      expect(prompt).toContain('character tendencies');
      expect(prompt).toContain('adaptive response');
    });
  });

  describe('analyzeDMPersonality', () => {
    it('should analyze DM personality characteristics', () => {
      const analysis = analyzeDMPersonality(sampleDMPersonality);

      expect(analysis).toHaveProperty('traits');
      expect(analysis).toHaveProperty('storytellingStyle');
      expect(analysis).toHaveProperty('communicationStyle');
      expect(analysis).toHaveProperty('difficultyPreference');
    });

    it('should identify personality traits from description', () => {
      const analysis = analyzeDMPersonality(sampleDMPersonality);

      expect(analysis.traits).toContain('mysterious');
      expect(analysis.traits).toContain('enigmatic');
      expect(analysis.traits).toContain('wise');
    });

    it('should determine storytelling style', () => {
      const analysis = analyzeDMPersonality(sampleDMPersonality);

      expect(analysis.storytellingStyle).toBe('mysterious');
      expect(analysis.communicationStyle).toContain('enigmatic');
    });

    it('should handle different personality types', () => {
      const actionDM: PersonalityType = {
        name: 'Action Hero',
        style: 'action-oriented',
        description: 'Fast-paced, dynamic storyteller who emphasizes combat and thrilling encounters'
      };

      const analysis = analyzeDMPersonality(actionDM);

      expect(analysis.traits).toContain('action');
      expect(analysis.traits).toContain('dynamic');
      expect(analysis.storytellingStyle).toBe('action-oriented');
    });
  });

  describe('generatePersonalityModifiers', () => {
    it('should generate modifiers based on DM personality', () => {
      const modifiers = generatePersonalityModifiers(sampleDMPersonality);

      expect(modifiers).toHaveProperty('storyTone');
      expect(modifiers).toHaveProperty('choiceStyle');
      expect(modifiers).toHaveProperty('difficultyAdjustment');
      expect(modifiers).toHaveProperty('communicationStyle');
    });

    it('should create mysterious personality modifiers', () => {
      const modifiers = generatePersonalityModifiers(sampleDMPersonality);

      expect(modifiers.storyTone).toContain('mysterious');
      expect(modifiers.communicationStyle).toContain('enigmatic');
      expect(modifiers.choiceStyle).toContain('mysterious');
    });

    it('should handle different personality styles', () => {
      const humorousDM: PersonalityType = {
        name: 'Humorous Bard',
        style: 'humorous',
        description: 'Witty and entertaining storyteller who adds comedy and light-hearted moments'
      };

      const modifiers = generatePersonalityModifiers(humorousDM);

      expect(modifiers.storyTone).toContain('humorous');
      expect(modifiers.communicationStyle).toContain('witty');
      expect(modifiers.choiceStyle).toContain('entertaining');
    });
  });

  describe('createDMStylePrompt', () => {
    it('should create style-specific prompt modifications', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: sampleDMPersonality,
          mood: 'positive',
          style: 'mysterious'
        }
      };

      const prompt = createDMStylePrompt(context);

      expect(prompt).toContain('mysterious style');
      expect(prompt).toContain('storytelling approach');
      expect(prompt).toContain('narrative voice');
    });

    it('should adapt style based on personality', () => {
      const actionDM: PersonalityType = {
        name: 'Action Hero',
        style: 'action-oriented',
        description: 'Fast-paced storyteller'
      };

      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: actionDM,
          mood: 'positive',
          style: 'action-oriented'
        }
      };

      const prompt = createDMStylePrompt(context);

      expect(prompt).toContain('action-oriented');
      expect(prompt).toContain('fast-paced');
      expect(prompt).toContain('dynamic');
    });
  });

  describe('createPersonalityConsistencyPrompt', () => {
    it('should create prompt for maintaining personality consistency', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: sampleDMPersonality,
          mood: 'positive',
          style: 'mysterious'
        }
      };

      const prompt = createPersonalityConsistencyPrompt(context);

      expect(prompt).toContain('personality consistency');
      expect(prompt).toContain('character voice');
      expect(prompt).toContain('consistent style');
    });

    it('should emphasize maintaining DM voice throughout', () => {
      const context: PromptContext = {
        ...baseContext,
        dm: {
          personality: sampleDMPersonality,
          mood: 'positive',
          style: 'mysterious'
        }
      };

      const prompt = createPersonalityConsistencyPrompt(context);

      expect(prompt).toContain('maintain voice');
      expect(prompt).toContain('consistent personality');
      expect(prompt).toContain('character voice');
    });

    it('should consider story progression in consistency', () => {
      const context: PromptContext = {
        ...baseContext,
        game: {
          ...baseContext.game,
          storyHistory: [
            { id: '1', text: 'Previous mysterious story', timestamp: '2025-01-27', turnNumber: 1, imageDescription: 'Forest' }
          ]
        },
        dm: {
          personality: sampleDMPersonality,
          mood: 'positive',
          style: 'mysterious'
        }
      };

      const prompt = createPersonalityConsistencyPrompt(context);

      expect(prompt).toContain('story progression');
      expect(prompt).toContain('narrative consistency');
      expect(prompt).toContain('character development');
    });
  });
}); 