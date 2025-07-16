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

export async function balanceFighterWithLLM(fighterData: FighterData): Promise<{ 
  name: string; 
  type: string; 
  oldStats: FighterData['stats']; 
  newStats: FighterData['stats']; 
  balancedFighter: FighterData;
  method: 'llm' | 'rule-based';
}> {
  try {
    // First, classify the fighter to get context
    const fighterTypeKey = classifyFighter(fighterData.name);
    const typeConfig = FIGHTER_TYPES[fighterTypeKey];
    
    // Create a context-aware prompt that includes fighter type information
    const contextPrompt = `Generate balanced stats for a fighting game character.

Fighter: ${fighterData.name}
Type: ${typeConfig.name}
Size: ${fighterData.stats.size}
Build: ${fighterData.stats.build}

Type Guidelines:
- ${typeConfig.name}: Health ${typeConfig.healthRange[0]}-${typeConfig.healthRange[1]}, Strength ${typeConfig.strengthRange[0]}-${typeConfig.strengthRange[1]}, Agility ${typeConfig.agilityRange[0]}-${typeConfig.agilityRange[1]}, Defense ${typeConfig.defenseRange[0]}-${typeConfig.defenseRange[1]}, Luck ${typeConfig.luckRange[0]}-${typeConfig.luckRange[1]}
${typeConfig.magicRange ? `- Magic: ${typeConfig.magicRange[0]}-${typeConfig.magicRange[1]}` : ''}
${typeConfig.rangedRange ? `- Ranged: ${typeConfig.rangedRange[0]}-${typeConfig.rangedRange[1]}` : ''}
${typeConfig.intelligenceRange ? `- Intelligence: ${typeConfig.intelligenceRange[0]}-${typeConfig.intelligenceRange[1]}` : ''}

Important: Respect the type guidelines and ensure logical relationships (e.g., a mouse should have much lower strength than a Sith Lord).`;
    
    console.log(`Attempting LLM-based balancing for ${fighterData.name} (${typeConfig.name})...`);
    
    // Use a custom prompt instead of the generic generateFighterStats
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'local-model', // Use the same model as other functions
          messages: [
            {
              role: 'system',
              content: `You are an expert fighting game balance designer specializing in creating fair, competitive, and engaging fighter statistics.

CRITICAL REQUIREMENTS:
- Respect the fighter type guidelines while maintaining character authenticity
- Ensure stats are logically consistent with the fighter's characteristics
- Create balanced stats that allow for competitive gameplay
- Consider the fighter's size, build, and apparent abilities when adjusting stats
- Maintain the fighter's unique identity while improving balance

BALANCING PRINCIPLES:
- Larger fighters should generally have higher health and strength
- Smaller fighters should have higher agility and potentially luck
- Muscular builds should favor strength and health
- Thin builds should favor agility and potentially intelligence
- Equipment and apparent abilities should influence relevant stats
- Ensure no single stat dominates the fighter's profile

STAT VALIDATION:
- All stats must fall within the specified type ranges
- Maintain logical relationships between stats
- Consider the fighter's visual characteristics and apparent skills
- Ensure the fighter remains competitive and fun to play

Return ONLY a valid JSON object with the exact field names specified above. All numbers must be integers within the provided ranges.`,
            },
            {
              role: 'user',
              content: contextPrompt,
            },
          ],
          temperature: 0.3, // Lower temperature for more consistent results
          max_tokens: 512,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`LM Studio fighter balancing API response error: ${response.status} ${errorBody}`);
        throw new Error(`API Error: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      const rawContent = data.choices[0]?.message?.content;
      if (!rawContent) {
        throw new Error('The model did not return fighter stats.');
      }

      // Try to parse the JSON object
      try {
        // Remove markdown/code block wrappers if present
        const cleaned = rawContent.replace(/```json|```/gi, '').trim();
        const parsed = JSON.parse(cleaned);
        
        // Validate required fields
        if (
          typeof parsed.strength === 'number' &&
          typeof parsed.agility === 'number' &&
          typeof parsed.health === 'number' &&
          typeof parsed.defense === 'number' &&
          typeof parsed.luck === 'number' &&
          typeof parsed.age === 'number' &&
          typeof parsed.size === 'string' &&
          typeof parsed.build === 'string'
        ) {
          // Validate that stats are within the type's ranges
          const isValidHealth = parsed.health >= typeConfig.healthRange[0] && parsed.health <= typeConfig.healthRange[1];
          const isValidStrength = parsed.strength >= typeConfig.strengthRange[0] && parsed.strength <= typeConfig.strengthRange[1];
          const isValidAgility = parsed.agility >= typeConfig.agilityRange[0] && parsed.agility <= typeConfig.agilityRange[1];
          const isValidDefense = parsed.defense >= typeConfig.defenseRange[0] && parsed.defense <= typeConfig.defenseRange[1];
          const isValidLuck = parsed.luck >= typeConfig.luckRange[0] && parsed.luck <= typeConfig.luckRange[1];
          
          if (isValidHealth && isValidStrength && isValidAgility && isValidDefense && isValidLuck) {
            console.log(`LLM successfully balanced ${fighterData.name}:`, parsed);
            
            // Convert LLM stats to our FighterData format
            const balancedStats = {
              health: parsed.health,
              maxHealth: parsed.health,
              strength: parsed.strength,
              agility: parsed.agility,
              defense: parsed.defense,
              luck: parsed.luck,
              age: parsed.age,
              size: parsed.size,
              build: parsed.build,
              magic: fighterData.stats.magic, // Preserve existing magic if any
              ranged: fighterData.stats.ranged, // Preserve existing ranged if any
              intelligence: fighterData.stats.intelligence, // Preserve existing intelligence if any
              uniqueAbilities: fighterData.stats.uniqueAbilities // Preserve existing abilities
            };
            
            const balancedFighter: FighterData = {
              ...fighterData,
              stats: balancedStats
            };
            
            return {
              name: fighterData.name,
              type: `${typeConfig.name} (LLM Balanced)`,
              oldStats: fighterData.stats,
              newStats: balancedStats,
              balancedFighter,
              method: 'llm'
            };
          } else {
            console.log(`LLM stats for ${fighterData.name} outside valid ranges, falling back to rule-based`);
            throw new Error('Stats outside valid ranges');
          }
        } else {
          throw new Error('Missing required fields in fighter stats JSON.');
        }
      } catch (e) {
        console.error('Failed to parse fighter stats JSON:', rawContent, e);
        throw new Error('Failed to parse fighter stats JSON.');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.log(`Falling back to rule-based balancing for ${fighterData.name}:`, error instanceof Error ? error.message : 'Unknown error');
    // Fall back to rule-based balancing
    const ruleBasedResult = balanceFighter(fighterData);
    return {
      ...ruleBasedResult,
      method: 'rule-based'
    };
  }
}

export async function balanceAllFightersWithLLM(fighters: FighterData[]): Promise<{
  results: Array<{ name: string; type: string; oldStats: FighterData['stats']; newStats: FighterData['stats']; balancedFighter: FighterData; method: 'llm' | 'rule-based' }>;
  message: string;
  llmCount: number;
  ruleBasedCount: number;
}> {
  const results = [];
  let llmCount = 0;
  let ruleBasedCount = 0;
  
  for (const fighter of fighters) {
    const result = await balanceFighterWithLLM(fighter);
    results.push(result);
    
    if (result.method === 'llm') {
      llmCount++;
    } else {
      ruleBasedCount++;
    }
  }
  
  return {
    results,
    message: `Balanced ${results.length} fighters (${llmCount} LLM, ${ruleBasedCount} rule-based)`,
    llmCount,
    ruleBasedCount
  };
} 