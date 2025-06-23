// Character, Item, and StoryEntry types for RPG game

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'key' | 'misc' | string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | string;
  value: number;
}

export interface StoryEntry {
  id: string;
  text: string;
  timestamp: string;
  turnNumber: number;
  imageDescription: string;
}

export interface Character {
  health: number; // 0-200
  heartrate: number; // 40-180
  age: number; // 12-100
  persona: string;
  traits: string[];
  experience: number;
  level: number; // >= 1
  inventory: Item[];
  storyHistory: StoryEntry[];
  currentTurn: number; // >= 1
}

export function createCharacter(overrides: Partial<Character> = {}): Character {
  return {
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
    ...overrides,
  };
}

export function validateCharacter(character: Character): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (character.health < 0 || character.health > 200) {
    errors.push('Health must be between 0 and 200');
  }
  if (character.heartrate < 40 || character.heartrate > 180) {
    errors.push('Heartrate must be between 40 and 180');
  }
  if (character.age < 12 || character.age > 100) {
    errors.push('Age must be between 12 and 100');
  }
  if (character.level < 1) {
    errors.push('Level must be at least 1');
  }
  if (character.currentTurn < 1) {
    errors.push('Current turn must be at least 1');
  }
  // Add more validation as needed
  return { isValid: errors.length === 0, errors };
} 