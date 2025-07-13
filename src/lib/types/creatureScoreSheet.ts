export interface CreatureType {
  name: string;
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge';
  strength: { min: number; max: number; };
  agility: { min: number; max: number; };
  health: { min: number; max: number; };
  defense: { min: number; max: number; };
  luck: { min: number; max: number; };
  examples: string[];
  description: string;
}

export interface ScoreSheet {
  version: string;
  lastUpdated: string;
  creatureTypes: CreatureType[];
}

// Initial score sheet with realistic boundaries
export const initialScoreSheet: ScoreSheet = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  creatureTypes: [
    {
      name: 'rodent',
      size: 'tiny',
      strength: { min: 1, max: 5 },
      agility: { min: 60, max: 90 },
      health: { min: 20, max: 50 },
      defense: { min: 5, max: 15 },
      luck: { min: 25, max: 40 },
      examples: ['mouse', 'rat', 'hamster', 'gerbil', 'shrew'],
      description: 'Small, quick creatures with high agility and low strength'
    },
    {
      name: 'small_animal',
      size: 'small',
      strength: { min: 5, max: 20 },
      agility: { min: 50, max: 80 },
      health: { min: 50, max: 120 },
      defense: { min: 10, max: 25 },
      luck: { min: 20, max: 35 },
      examples: ['cat', 'dog', 'rabbit', 'squirrel', 'fox'],
      description: 'Small animals with good agility and moderate strength'
    },
    {
      name: 'human',
      size: 'medium',
      strength: { min: 15, max: 50 },
      agility: { min: 30, max: 70 },
      health: { min: 80, max: 150 },
      defense: { min: 15, max: 40 },
      luck: { min: 10, max: 25 },
      examples: ['human', 'person', 'fighter', 'warrior', 'athlete'],
      description: 'Humans with balanced stats and good adaptability'
    },
    {
      name: 'large_animal',
      size: 'large',
      strength: { min: 40, max: 80 },
      agility: { min: 25, max: 50 },
      health: { min: 200, max: 400 },
      defense: { min: 30, max: 60 },
      luck: { min: 8, max: 20 },
      examples: ['bear', 'tiger', 'lion', 'wolf', 'horse'],
      description: 'Large animals with high strength and moderate agility'
    },
    {
      name: 'kaiju',
      size: 'huge',
      strength: { min: 150, max: 200 },
      agility: { min: 5, max: 20 },
      health: { min: 800, max: 1000 },
      defense: { min: 70, max: 100 },
      luck: { min: 5, max: 15 },
      examples: ['godzilla', 'king kong', 'kaiju', 'giant monster', 'dinosaur'],
      description: 'Massive creatures with overwhelming strength but low agility'
    },
    {
      name: 'insect',
      size: 'tiny',
      strength: { min: 1, max: 3 },
      agility: { min: 70, max: 95 },
      health: { min: 10, max: 30 },
      defense: { min: 3, max: 10 },
      luck: { min: 20, max: 35 },
      examples: ['spider', 'ant', 'bee', 'wasp', 'beetle'],
      description: 'Tiny creatures with high agility and very low strength'
    },
    {
      name: 'bird',
      size: 'small',
      strength: { min: 3, max: 15 },
      agility: { min: 80, max: 100 },
      health: { min: 40, max: 100 },
      defense: { min: 8, max: 20 },
      luck: { min: 20, max: 35 },
      examples: ['eagle', 'hawk', 'crow', 'sparrow', 'owl'],
      description: 'Birds with exceptional agility and moderate strength'
    },
    {
      name: 'aquatic',
      size: 'medium',
      strength: { min: 25, max: 60 },
      agility: { min: 40, max: 70 },
      health: { min: 150, max: 300 },
      defense: { min: 25, max: 50 },
      luck: { min: 12, max: 25 },
      examples: ['shark', 'dolphin', 'whale', 'fish', 'octopus'],
      description: 'Aquatic creatures with good strength and agility'
    }
  ]
};

export function getCreatureType(description: string, label?: string): CreatureType | null {
  const searchText = `${description} ${label || ''}`.toLowerCase();
  
  for (const creatureType of initialScoreSheet.creatureTypes) {
    // Check if any examples match
    if (creatureType.examples.some(example => searchText.includes(example))) {
      return creatureType;
    }
    
    // Check if the creature type name matches
    if (searchText.includes(creatureType.name.replace('_', ' '))) {
      return creatureType;
    }
  }
  
  return null;
}

export function generateStatsFromScoreSheet(creatureType: CreatureType) {
  return {
    strength: Math.floor(Math.random() * (creatureType.strength.max - creatureType.strength.min + 1)) + creatureType.strength.min,
    agility: Math.floor(Math.random() * (creatureType.agility.max - creatureType.agility.min + 1)) + creatureType.agility.min,
    health: Math.floor(Math.random() * (creatureType.health.max - creatureType.health.min + 1)) + creatureType.health.min,
    defense: Math.floor(Math.random() * (creatureType.defense.max - creatureType.defense.min + 1)) + creatureType.defense.min,
    luck: Math.floor(Math.random() * (creatureType.luck.max - creatureType.luck.min + 1)) + creatureType.luck.min,
  };
} 