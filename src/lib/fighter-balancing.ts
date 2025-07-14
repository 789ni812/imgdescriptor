export interface FighterData {
  id: string;
  name: string;
  image: string;
  stats: {
    health: number;
    maxHealth: number;
    strength: number;
    luck: number;
    agility: number;
    defense: number;
    age: number;
    size: 'small' | 'medium' | 'large';
    build: 'thin' | 'average' | 'muscular' | 'heavy';
    magic?: number;
    ranged?: number;
    intelligence?: number;
    uniqueAbilities?: string[];
  };
  matchHistory: unknown[];
}

export interface FighterType {
  name: string;
  healthRange: [number, number];
  strengthRange: [number, number];
  agilityRange: [number, number];
  defenseRange: [number, number];
  luckRange: [number, number];
  magicRange?: [number, number];
  rangedRange?: [number, number];
  intelligenceRange?: [number, number];
  uniqueAbilities?: string[];
}

export const FIGHTER_TYPES: Record<string, FighterType> = {
  'regular_human': {
    name: 'Regular Human',
    healthRange: [80, 120],
    strengthRange: [15, 40],
    agilityRange: [30, 60],
    defenseRange: [15, 30],
    luckRange: [10, 25],
    intelligenceRange: [20, 40]
  },
  'peak_human': {
    name: 'Peak Human',
    healthRange: [100, 150],
    strengthRange: [35, 50],
    agilityRange: [50, 70],
    defenseRange: [20, 35],
    luckRange: [15, 25],
    intelligenceRange: [25, 45],
    uniqueAbilities: ['Martial Arts', 'Combat Training']
  },
  'force_user': {
    name: 'Force User',
    healthRange: [120, 180],
    strengthRange: [40, 60],
    agilityRange: [45, 75],
    defenseRange: [25, 40],
    luckRange: [20, 35],
    magicRange: [50, 80],
    rangedRange: [30, 60],
    intelligenceRange: [30, 50],
    uniqueAbilities: ['Force Push', 'Force Choke', 'Lightsaber Combat']
  },
  'sith_lord': {
    name: 'Sith Lord',
    healthRange: [150, 200],
    strengthRange: [50, 70],
    agilityRange: [40, 65],
    defenseRange: [30, 45],
    luckRange: [25, 40],
    magicRange: [70, 90],
    rangedRange: [50, 80],
    intelligenceRange: [40, 60],
    uniqueAbilities: ['Force Lightning', 'Force Choke', 'Dark Side Powers', 'Lightsaber Mastery']
  },
  'large_animal': {
    name: 'Large Animal',
    healthRange: [200, 400],
    strengthRange: [40, 80],
    agilityRange: [25, 50],
    defenseRange: [30, 60],
    luckRange: [8, 20],
    intelligenceRange: [5, 15]
  },
  'legendary_monster': {
    name: 'Legendary Monster',
    healthRange: [800, 2000],
    strengthRange: [150, 200],
    agilityRange: [5, 20],
    defenseRange: [60, 100],
    luckRange: [10, 25],
    magicRange: [0, 50],
    rangedRange: [50, 100],
    intelligenceRange: [8, 25],
    uniqueAbilities: ['Atomic Breath', 'Tail Whip', 'Monster Strength']
  },
  'rodent': {
    name: 'Rodent',
    healthRange: [3, 9],
    strengthRange: [1, 5],
    agilityRange: [60, 95],
    defenseRange: [1, 8],
    luckRange: [15, 30],
    intelligenceRange: [2, 3],
    uniqueAbilities: ['Quick Escape']
  }
};

export function classifyFighter(name: string): string {
  const lowerName = name.toLowerCase();
  
  // Rodents
  if (lowerName.includes('mouse') || lowerName.includes('rat') || lowerName.includes('rodent')) {
    return 'rodent';
  }
  // Sith Lords and Force Users
  if (lowerName.includes('darth') || lowerName.includes('vader') || lowerName.includes('sith')) {
    return 'sith_lord';
  }
  if (lowerName.includes('jedi') || lowerName.includes('force')) {
    return 'force_user';
  }
  
  // Legendary Monsters
  if (lowerName.includes('godzilla') || lowerName.includes('kaiju') || lowerName.includes('dragon')) {
    return 'legendary_monster';
  }
  
  // Peak Humans (martial artists, athletes)
  if (lowerName.includes('bruce') || lowerName.includes('lee') || 
      lowerName.includes('stephen') || lowerName.includes('siegal') ||
      lowerName.includes('victor') || lowerName.includes('martel') ||
      lowerName.includes('martial') || lowerName.includes('champion')) {
    return 'peak_human';
  }
  
  // Large Animals
  if (lowerName.includes('bear') || lowerName.includes('tiger') || lowerName.includes('lion') ||
      lowerName.includes('shark') || lowerName.includes('wolf')) {
    return 'large_animal';
  }
  
  // Default to regular human
  return 'regular_human';
}

export function generateBalancedStats(fighterType: FighterType, currentStats: FighterData['stats']) {
  const stats = { ...currentStats };
  
  // Generate new stats within the type's ranges
  stats.health = Math.floor(Math.random() * (fighterType.healthRange[1] - fighterType.healthRange[0] + 1)) + fighterType.healthRange[0];
  stats.maxHealth = stats.health;
  stats.strength = Math.floor(Math.random() * (fighterType.strengthRange[1] - fighterType.strengthRange[0] + 1)) + fighterType.strengthRange[0];
  stats.agility = Math.floor(Math.random() * (fighterType.agilityRange[1] - fighterType.agilityRange[0] + 1)) + fighterType.agilityRange[0];
  stats.defense = Math.floor(Math.random() * (fighterType.defenseRange[1] - fighterType.defenseRange[0] + 1)) + fighterType.defenseRange[0];
  stats.luck = Math.floor(Math.random() * (fighterType.luckRange[1] - fighterType.luckRange[0] + 1)) + fighterType.luckRange[0];
  
  // Add optional stats if the type has them
  if (fighterType.magicRange) {
    stats.magic = Math.floor(Math.random() * (fighterType.magicRange[1] - fighterType.magicRange[0] + 1)) + fighterType.magicRange[0];
  }
  if (fighterType.rangedRange) {
    stats.ranged = Math.floor(Math.random() * (fighterType.rangedRange[1] - fighterType.rangedRange[0] + 1)) + fighterType.rangedRange[0];
  }
  if (fighterType.intelligenceRange) {
    stats.intelligence = Math.floor(Math.random() * (fighterType.intelligenceRange[1] - fighterType.intelligenceRange[0] + 1)) + fighterType.intelligenceRange[0];
  }
  if (fighterType.uniqueAbilities) {
    stats.uniqueAbilities = [...fighterType.uniqueAbilities];
  }
  
  return stats;
}

export function balanceFighter(fighterData: FighterData): { 
  name: string; 
  type: string; 
  oldStats: FighterData['stats']; 
  newStats: FighterData['stats']; 
  balancedFighter: FighterData;
} {
  // Classify the fighter
  const fighterTypeKey = classifyFighter(fighterData.name);
  const typeConfig = FIGHTER_TYPES[fighterTypeKey];
  
  // Generate balanced stats
  const balancedStats = generateBalancedStats(typeConfig, fighterData.stats);
  
  // Create balanced fighter data
  const balancedFighter: FighterData = {
    ...fighterData,
    stats: balancedStats
  };
  
  return {
    name: fighterData.name,
    type: typeConfig.name,
    oldStats: fighterData.stats,
    newStats: balancedStats,
    balancedFighter
  };
}

export function balanceAllFighters(fighters: FighterData[]): {
  results: Array<{ name: string; type: string; oldStats: FighterData['stats']; newStats: FighterData['stats']; balancedFighter: FighterData }>;
  message: string;
} {
  const results = fighters.map(fighter => balanceFighter(fighter));
  
  return {
    results,
    message: `Balanced ${results.length} fighters`
  };
} 