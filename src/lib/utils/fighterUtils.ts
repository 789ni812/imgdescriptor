import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export interface FighterMetadata {
  id: string;
  name: string;
  image: string;
  stats: {
    health: number;
    strength: number;
    agility: number;
    defense: number;
    luck: number;
  };
  matchHistory: Array<{
    opponentId: string;
    result: 'win' | 'loss' | 'draw';
    date: string;
  }>;
}

export interface FighterListResult {
  success: boolean;
  fighters: FighterMetadata[];
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
    
    const fighters: FighterMetadata[] = [];
    
    // Read each JSON file and parse fighter metadata
    for (const file of jsonFiles) {
      try {
        const filePath = join(directory, file);
        const fileContent = await readFile(filePath, 'utf-8');
        const fighterData = JSON.parse(fileContent) as FighterMetadata;
        
        // Validate required fields
        if (fighterData.id && fighterData.name && fighterData.image && fighterData.stats) {
          fighters.push(fighterData);
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