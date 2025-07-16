import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { Fighter } from '@/lib/stores/fightingGameStore';

export interface FighterMetadata {
  id: string;
  name: string;
  image: string;
  stats: {
    health: number;
    maxHealth?: number;
    strength: number;
    agility: number;
    defense: number;
    luck: number;
    age?: number;
    size?: string;
    build?: string;
    magic?: number;
    ranged?: number;
    intelligence?: number;
    uniqueAbilities?: string[];
  };
  matchHistory?: Array<{
    opponentId: string;
    result: 'win' | 'loss' | 'draw';
    date: string;
  }>;
}

export interface FighterListResult {
  success: boolean;
  fighters: Fighter[];
  error?: string;
}

export async function getFightersList(fightersDir?: string): Promise<FighterListResult> {
  try {
    // Use provided directory or default to public/vs/fighters
    const directory = fightersDir || join(process.cwd(), 'public', 'vs', 'fighters');
    
    // Read directory contents
    const files = await readdir(directory);
    
    // Filter for JSON files only
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const fighters: Fighter[] = [];
    
    // Read each JSON file and parse fighter metadata
    for (const file of jsonFiles) {
      try {
        const filePath = join(directory, file);
        const fileContent = await readFile(filePath, 'utf-8');
        const fighterData = JSON.parse(fileContent) as FighterMetadata;
        
        // Validate required fields
        if (fighterData.id && fighterData.name && fighterData.image && fighterData.stats) {
          // Convert to Fighter format
          const fighter: Fighter = {
            id: fighterData.id,
            name: fighterData.name,
            imageUrl: `/vs/fighters/${fighterData.image}`,
            description: '',
            stats: {
              health: fighterData.stats.health,
              maxHealth: fighterData.stats.maxHealth || fighterData.stats.health,
              strength: fighterData.stats.strength,
              luck: fighterData.stats.luck,
              agility: fighterData.stats.agility,
              defense: fighterData.stats.defense,
              age: fighterData.stats.age || 25,
              size: (fighterData.stats.size as 'small' | 'medium' | 'large') || 'medium',
              build: (fighterData.stats.build as 'thin' | 'average' | 'muscular' | 'heavy') || 'average'
            },
            visualAnalysis: {
              age: 'adult',
              size: 'medium',
              build: 'average',
              appearance: [],
              weapons: [],
              armor: []
            },
            combatHistory: [],
            winLossRecord: { wins: 0, losses: 0, draws: 0 },
            createdAt: new Date().toISOString()
          };
          
          fighters.push(fighter);
        }
      } catch (error) {
        // Skip invalid JSON files
        console.warn(`Failed to parse fighter file ${file}:`, error);
        continue;
      }
    }
    
    return {
      success: true,
      fighters: fighters
    };
    
  } catch (error) {
    console.error('Failed to read fighters directory:', error);
    return {
      success: false,
      fighters: [],
      error: 'Failed to read fighters directory'
    };
  }
} 