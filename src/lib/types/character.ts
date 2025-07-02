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

// Add moral alignment system
export interface MoralAlignment {
  score: number; // -100 to +100, where negative is "bad" and positive is "good"
  level: 'evil' | 'villainous' | 'neutral' | 'good' | 'heroic';
  reputation: string; // Descriptive reputation based on actions
  recentChoices: string[]; // Last 5 moral choices made
  alignmentHistory: {
    timestamp: string;
    choice: string;
    impact: number;
    newScore: number;
  }[];
}

// Per-turn choices history
export interface ChoicesHistoryEntry {
  turn: number;
  choices: Choice[];
}

export interface Character {
  persona: string;
  traits: string[];
  stats: CharacterStats;
  health: number;
  heartrate: number;
  age: number;
  level: number;
  experience: number;
  currentTurn: number;
  imageHistory: ImageHistoryEntry[];
  storyHistory: StoryEntry[];
  choiceHistory: ChoiceOutcome[];
  currentChoices: Choice[];
  inventory: Item[];
  currentDescription?: string;
  currentStory?: string;
  finalStory?: string;
  choicesHistory: ChoicesHistoryEntry[];
  // Add moral alignment
  moralAlignment: MoralAlignment;
}

export function createCharacter(overrides: Partial<Character> = {}): Character {
  return {
    persona: 'Adventurer',
    traits: ['brave', 'curious'],
    stats: {
      intelligence: 10,
      creativity: 10,
      perception: 10,
      wisdom: 10,
    },
    health: 100,
    heartrate: 70,
    age: 25,
    level: 1,
    experience: 0,
    currentTurn: 1,
    imageHistory: [],
    storyHistory: [],
    choiceHistory: [],
    currentChoices: [],
    inventory: [],
    choicesHistory: [],
    moralAlignment: {
      score: 0,
      level: 'neutral',
      reputation: 'An unknown adventurer',
      recentChoices: [],
      alignmentHistory: [],
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

// Moral alignment utility functions
export function updateMoralAlignment(
  currentAlignment: MoralAlignment,
  choice: string,
  impact: number
): MoralAlignment {
  const newScore = Math.max(-100, Math.min(100, currentAlignment.score + impact));
  const newLevel = getAlignmentLevel(newScore);
  const newReputation = getAlignmentReputation(newScore);
  
  const newRecentChoices = [
    choice,
    ...currentAlignment.recentChoices.slice(0, 4) // Keep last 5 choices
  ];
  
  const newAlignmentHistory = [
    {
      timestamp: new Date().toISOString(),
      choice,
      impact,
      newScore,
    },
    ...currentAlignment.alignmentHistory.slice(0, 19) // Keep last 20 entries
  ];

  return {
    score: newScore,
    level: newLevel,
    reputation: newReputation,
    recentChoices: newRecentChoices,
    alignmentHistory: newAlignmentHistory,
  };
}

export function getAlignmentLevel(score: number): MoralAlignment['level'] {
  if (score <= -80) return 'evil';
  if (score <= -20) return 'villainous';
  if (score <= 20) return 'neutral';
  if (score <= 80) return 'good';
  return 'heroic';
}

export function getAlignmentReputation(score: number): string {
  const level = getAlignmentLevel(score);
  
  switch (level) {
    case 'evil':
      return 'A feared and ruthless villain known for cruelty';
    case 'villainous':
      return 'A dangerous individual with a dark reputation';
    case 'neutral':
      return 'An adventurer whose motives remain unclear';
    case 'good':
      return 'A respected hero known for honorable deeds';
    case 'heroic':
      return 'A legendary champion of justice and virtue';
    default:
      return 'An unknown adventurer';
  }
}

export function getMoralChoiceImpact(choice: Choice): number {
  const choiceText = choice.text.toLowerCase();
  const choiceDescription = choice.description?.toLowerCase() || '';
  const fullText = `${choiceText} ${choiceDescription}`;
  
  // Define moral keywords and their impact values
  const moralKeywords = {
    // Good actions
    'help': 5, 'save': 8, 'protect': 6, 'heal': 7, 'rescue': 8, 'defend': 6,
    'kind': 4, 'generous': 5, 'honest': 4, 'forgive': 6, 'mercy': 7,
    'sacrifice': 10, 'noble': 5, 'virtuous': 6, 'compassionate': 7,
    
    // Bad actions
    'kill': -8, 'steal': -6, 'betray': -10, 'torture': -15, 'destroy': -7,
    'deceive': -5, 'corrupt': -8, 'abandon': -6, 'exploit': -7, 'harm': -6,
    'selfish': -4, 'cruel': -8, 'greedy': -5, 'vengeful': -6, 'ruthless': -7,
    
    // Neutral actions
    'observe': 0, 'wait': 0, 'avoid': 0, 'ignore': -2, 'retreat': -1,
  };
  
  let totalImpact = 0;
  let keywordCount = 0;
  
  for (const [keyword, impact] of Object.entries(moralKeywords)) {
    if (fullText.includes(keyword)) {
      totalImpact += impact;
      keywordCount++;
    }
  }
  
  // If no keywords found, return small random impact (-2 to +2)
  if (keywordCount === 0) {
    return Math.floor(Math.random() * 5) - 2;
  }
  
  // Average the impact and add some randomness
  const averageImpact = totalImpact / keywordCount;
  const randomVariation = (Math.random() - 0.5) * 2; // -1 to +1
  
  return Math.round(averageImpact + randomVariation);
} 