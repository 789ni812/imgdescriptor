import { Character, Item, StoryEntry, createCharacter, validateCharacter } from './character';

describe('Character Schema and Types', () => {
  describe('Character Creation', () => {
    it('should create a character with default values', () => {
      const character = createCharacter();
      
      expect(character.health).toBe(100);
      expect(character.heartrate).toBe(70);
      expect(character.age).toBe(18);
      expect(character.persona).toBe('Adventurer');
      expect(character.traits).toEqual([]);
      expect(character.experience).toBe(0);
      expect(character.level).toBe(1);
      expect(character.inventory).toEqual([]);
      expect(character.storyHistory).toEqual([]);
      expect(character.currentTurn).toBe(1);
    });

    it('should create a character with custom values', () => {
      const customCharacter = createCharacter({
        health: 85,
        heartrate: 65,
        age: 25,
        persona: 'Mage',
        traits: ['Intelligent', 'Mysterious'],
        experience: 150,
        level: 3,
      });

      expect(customCharacter.health).toBe(85);
      expect(customCharacter.heartrate).toBe(65);
      expect(customCharacter.age).toBe(25);
      expect(customCharacter.persona).toBe('Mage');
      expect(customCharacter.traits).toEqual(['Intelligent', 'Mysterious']);
      expect(customCharacter.experience).toBe(150);
      expect(customCharacter.level).toBe(3);
      expect(customCharacter.inventory).toEqual([]);
      expect(customCharacter.storyHistory).toEqual([]);
      expect(customCharacter.currentTurn).toBe(1);
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
        stats: {
          intelligence: 10,
          creativity: 10,
          perception: 10,
          wisdom: 10,
        },
      };

      const result = validateCharacter(validCharacter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject character with invalid health', () => {
      const invalidCharacter: Character = {
        health: -10, // Invalid: negative health
        heartrate: 70,
        age: 18,
        persona: 'Adventurer',
        traits: [],
        experience: 0,
        level: 1,
        inventory: [],
        storyHistory: [],
        currentTurn: 1,
        stats: {
          intelligence: 10,
          creativity: 10,
          perception: 10,
          wisdom: 10,
        },
      };

      const result = validateCharacter(invalidCharacter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Health must be between 0 and 200');
    });

    it('should reject character with invalid age', () => {
      const invalidCharacter: Character = {
        health: 100,
        heartrate: 70,
        age: 5, // Invalid: too young
        persona: 'Adventurer',
        traits: [],
        experience: 0,
        level: 1,
        inventory: [],
        storyHistory: [],
        currentTurn: 1,
        stats: {
          intelligence: 10,
          creativity: 10,
          perception: 10,
          wisdom: 10,
        },
      };

      const result = validateCharacter(invalidCharacter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Age must be between 12 and 100');
    });

    it('should reject character with invalid heartrate', () => {
      const invalidCharacter: Character = {
        health: 100,
        heartrate: 200, // Invalid: too high
        age: 18,
        persona: 'Adventurer',
        traits: [],
        experience: 0,
        level: 1,
        inventory: [],
        storyHistory: [],
        currentTurn: 1,
        stats: {
          intelligence: 10,
          creativity: 10,
          perception: 10,
          wisdom: 10,
        },
      };

      const result = validateCharacter(invalidCharacter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Heartrate must be between 40 and 180');
    });

    it('should reject character with invalid level', () => {
      const invalidCharacter: Character = {
        health: 100,
        heartrate: 70,
        age: 18,
        persona: 'Adventurer',
        traits: [],
        experience: 0,
        level: 0, // Invalid: level must be at least 1
        inventory: [],
        storyHistory: [],
        currentTurn: 1,
        stats: {
          intelligence: 10,
          creativity: 10,
          perception: 10,
          wisdom: 10,
        },
      };

      const result = validateCharacter(invalidCharacter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Level must be at least 1');
    });

    it('should reject character with invalid turn count', () => {
      const invalidCharacter: Character = {
        health: 100,
        heartrate: 70,
        age: 18,
        persona: 'Adventurer',
        traits: [],
        experience: 0,
        level: 1,
        inventory: [],
        storyHistory: [],
        currentTurn: 0, // Invalid: turn must be at least 1
        stats: {
          intelligence: 10,
          creativity: 10,
          perception: 10,
          wisdom: 10,
        },
      };

      const result = validateCharacter(invalidCharacter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Current turn must be at least 1');
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
      // Arrange
      const character = createCharacter();
      
      // Assert
      expect(character.choiceHistory).toBeDefined();
      expect(Array.isArray(character.choiceHistory)).toBe(true);
    });

    it('should have current choices available', () => {
      // Arrange
      const character = createCharacter();
      
      // Assert
      expect(character.currentChoices).toBeDefined();
      expect(Array.isArray(character.currentChoices)).toBe(true);
    });

    it('should track choice outcomes and stat changes', () => {
      // Arrange
      const character = createCharacter();
      const choice = {
        id: 'choice-1',
        text: 'Explore the cave',
        outcome: 'You found ancient treasure',
        statChanges: { intelligence: +2, creativity: +1 }
      };
      
      // Act
      character.choiceHistory.push(choice);
      
      // Assert
      expect(character.choiceHistory).toHaveLength(1);
      expect(character.choiceHistory[0]).toEqual(choice);
    });
  });
}); 