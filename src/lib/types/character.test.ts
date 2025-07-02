import { Character, Item, StoryEntry, ChoiceOutcome, createCharacter, validateCharacter } from './character';

describe('Character Schema and Types', () => {
  describe('Character Creation', () => {
    it('should create a character with default values', () => {
      const character = createCharacter();
      
      expect(character.health).toBe(100);
      expect(character.heartrate).toBe(70);
      expect(character.age).toBe(25);
      expect(character.persona).toBe('Adventurer');
      expect(character.traits).toEqual(['brave', 'curious']);
      expect(character.experience).toBe(0);
      expect(character.level).toBe(1);
      expect(character.inventory).toEqual([]);
      expect(character.storyHistory).toEqual([]);
      expect(character.currentTurn).toBe(1);
      expect(character.stats.intelligence).toBe(10);
      expect(character.stats.creativity).toBe(10);
      expect(character.stats.perception).toBe(10);
      expect(character.stats.wisdom).toBe(10);
      expect(character.moralAlignment.score).toBe(0);
      expect(character.moralAlignment.level).toBe('neutral');
      expect(character.moralAlignment.reputation).toBe('An unknown adventurer');
    });

    it('should create a character with custom values', () => {
      const customCharacter = createCharacter({
        persona: 'Warrior',
        health: 150,
        age: 30,
        traits: ['strong', 'brave'],
        stats: {
          intelligence: 12,
          creativity: 8,
          perception: 14,
          wisdom: 10,
        },
        moralAlignment: {
          score: 25,
          level: 'good',
          reputation: 'A respected hero',
          recentChoices: ['Helped villagers', 'Defended the weak'],
          alignmentHistory: [],
        },
      });
      
      expect(customCharacter.persona).toBe('Warrior');
      expect(customCharacter.health).toBe(150);
      expect(customCharacter.age).toBe(30);
      expect(customCharacter.traits).toEqual(['strong', 'brave']);
      expect(customCharacter.stats.intelligence).toBe(12);
      expect(customCharacter.stats.creativity).toBe(8);
      expect(customCharacter.stats.perception).toBe(14);
      expect(customCharacter.stats.wisdom).toBe(10);
      expect(customCharacter.moralAlignment.score).toBe(25);
      expect(customCharacter.moralAlignment.level).toBe('good');
      expect(customCharacter.moralAlignment.reputation).toBe('A respected hero');
    });
  });

  describe('Character Validation', () => {
    it('should validate a valid character', () => {
      const validCharacter: Character = {
        health: 100,
        heartrate: 70,
        age: 18,
        persona: 'Adventurer',
        traits: [],
        experience: 0,
        level: 1,
        inventory: [],
        storyHistory: [],
        currentTurn: 1,
        imageHistory: [],
        choiceHistory: [],
        currentChoices: [],
        choicesHistory: [],
        stats: {
          intelligence: 10,
          creativity: 10,
          perception: 10,
          wisdom: 10,
        },
        moralAlignment: {
          score: 0,
          level: 'neutral',
          reputation: 'An unknown adventurer',
          recentChoices: [],
          alignmentHistory: [],
        },
      };

      const result = validateCharacter(validCharacter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject character with invalid health', () => {
      const character = createCharacter({
        health: 250,
        imageHistory: [],
        choiceHistory: [],
        currentChoices: [],
        choicesHistory: [],
        moralAlignment: {
          score: 0,
          level: 'neutral',
          reputation: 'An unknown adventurer',
          recentChoices: [],
          alignmentHistory: [],
        },
      });
      
      const validation = validateCharacter(character);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Health must be between 0 and 200');
    });

    it('should reject character with invalid age', () => {
      const character = createCharacter({
        age: 5,
        imageHistory: [],
        choiceHistory: [],
        currentChoices: [],
        choicesHistory: [],
        moralAlignment: {
          score: 0,
          level: 'neutral',
          reputation: 'An unknown adventurer',
          recentChoices: [],
          alignmentHistory: [],
        },
      });
      
      const validation = validateCharacter(character);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Age must be between 12 and 100');
    });

    it('should reject character with invalid heartrate', () => {
      const character = createCharacter({
        heartrate: 200,
        imageHistory: [],
        choiceHistory: [],
        currentChoices: [],
        choicesHistory: [],
        moralAlignment: {
          score: 0,
          level: 'neutral',
          reputation: 'An unknown adventurer',
          recentChoices: [],
          alignmentHistory: [],
        },
      });
      
      const validation = validateCharacter(character);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Heartrate must be between 40 and 180');
    });

    it('should reject character with invalid level', () => {
      const character = createCharacter({
        level: 0,
        imageHistory: [],
        choiceHistory: [],
        currentChoices: [],
        choicesHistory: [],
        moralAlignment: {
          score: 0,
          level: 'neutral',
          reputation: 'An unknown adventurer',
          recentChoices: [],
          alignmentHistory: [],
        },
      });
      
      const validation = validateCharacter(character);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Level must be at least 1');
    });

    it('should reject character with invalid turn count', () => {
      const character = createCharacter({
        currentTurn: 0,
        imageHistory: [],
        choiceHistory: [],
        currentChoices: [],
        choicesHistory: [],
        moralAlignment: {
          score: 0,
          level: 'neutral',
          reputation: 'An unknown adventurer',
          recentChoices: [],
          alignmentHistory: [],
        },
      });
      
      const validation = validateCharacter(character);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Current turn must be at least 1');
    });
  });

  describe('Item and StoryEntry Types', () => {
    it('should validate Item structure', () => {
      const validItem: Item = {
        id: 'sword-001',
        name: 'Iron Sword',
        type: 'weapon',
        rarity: 'common',
        value: 50,
      };

      expect(validItem.id).toBe('sword-001');
      expect(validItem.name).toBe('Iron Sword');
      expect(validItem.type).toBe('weapon');
      expect(validItem.rarity).toBe('common');
      expect(validItem.value).toBe(50);
    });

    it('should validate StoryEntry structure', () => {
      const validStoryEntry: StoryEntry = {
        id: 'story-001',
        text: 'You find yourself in a mysterious forest...',
        timestamp: new Date().toISOString(),
        turnNumber: 0,
        imageDescription: 'A dark forest with ancient trees',
      };

      expect(validStoryEntry.id).toBe('story-001');
      expect(validStoryEntry.text).toBe('You find yourself in a mysterious forest...');
      expect(validStoryEntry.turnNumber).toBe(0);
      expect(validStoryEntry.imageDescription).toBe('A dark forest with ancient trees');
    });
  });

  describe('Character Choice System', () => {
    it('should have choice history in character', () => {
      const character = createCharacter();
      
      expect(character.choiceHistory).toBeDefined();
      expect(Array.isArray(character.choiceHistory)).toBe(true);
      expect(character.currentChoices).toBeDefined();
      expect(Array.isArray(character.currentChoices)).toBe(true);
    });

    it('should have current choices available', () => {
      const character = createCharacter();
      
      expect(character.currentChoices).toBeDefined();
      expect(Array.isArray(character.currentChoices)).toBe(true);
    });

    it('should track choice outcomes and stat changes', () => {
      const choiceOutcome: ChoiceOutcome = {
        id: 'choice-1',
        choiceId: 'original-choice-1',
        text: 'Help the villagers',
        outcome: 'Successfully helped the villagers',
        statChanges: { intelligence: 2, creativity: 1 },
        timestamp: new Date().toISOString(),
        turnNumber: 1,
      };
      
      expect(choiceOutcome.id).toBe('choice-1');
      expect(choiceOutcome.text).toBe('Help the villagers');
      expect(choiceOutcome.outcome).toBe('Successfully helped the villagers');
      expect(choiceOutcome.statChanges?.intelligence).toBe(2);
      expect(choiceOutcome.statChanges?.creativity).toBe(1);
    });
  });
}); 