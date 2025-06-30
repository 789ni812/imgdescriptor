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

export interface ImageHistoryEntry {
  id: string;
  url: string;
  description: string;
  story?: string;
  turn: number;
  uploadedAt: string;
}

// Choice system interfaces
export interface Choice {
  id: string;
  type?: string;
  text: string;
  description?: string;
  statRequirements?: Partial<CharacterStats>;
  consequences?: string[];
}

export interface ChoiceOutcome {
  id: string;
  choiceId: string;
  text: string;
  outcome: string;
  statChanges?: Partial<CharacterStats>;
  timestamp: string;
  turnNumber: number;
}

// RPG Stats interface
export interface CharacterStats {
  intelligence: number; // 1-20
  creativity: number;   // 1-20
  perception: number;   // 1-20
  wisdom: number;       // 1-20
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
  imageHistory: ImageHistoryEntry[];
  choiceHistory: ChoiceOutcome[];
  currentChoices: Choice[];
  currentTurn: number; // >= 1
  stats: CharacterStats; // RPG stats
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
    imageHistory: [],
    choiceHistory: [],
    currentChoices: [],
    currentTurn: 1,
    stats: {
      intelligence: 10,
      creativity: 10,
      perception: 10,
      wisdom: 10,
    },
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
  
  // Validate stats
  const stats = character.stats;
  if (!stats) {
    errors.push('Stats are required');
  } else {
    if (stats.intelligence < 1 || stats.intelligence > 20) {
      errors.push('Intelligence must be between 1 and 20');
    }
    if (stats.creativity < 1 || stats.creativity > 20) {
      errors.push('Creativity must be between 1 and 20');
    }
    if (stats.perception < 1 || stats.perception > 20) {
      errors.push('Perception must be between 1 and 20');
    }
    if (stats.wisdom < 1 || stats.wisdom > 20) {
      errors.push('Wisdom must be between 1 and 20');
    }
  }
  
  return { isValid: errors.length === 0, errors };
} 