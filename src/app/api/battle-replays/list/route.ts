import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

interface BattleReplay {
  id: string;
  fighterA: {
    id: string;
    name: string;
    imageUrl: string;
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
    };
  };
  fighterB: {
    id: string;
    name: string;
    imageUrl: string;
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
    };
  };
  scene: {
    name: string;
    imageUrl: string;
    description?: string;
  };
  battleLog: Array<{
    round: number;
    attacker: string;
    defender: string;
    attackCommentary: string;
    defenseCommentary: string;
    attackerDamage: number;
    defenderDamage: number;
    randomEvent: string | null;
    arenaObjectsUsed: string | null;
    healthAfter: {
      attacker: number;
      defender: number;
    };
  }>;
  winner: string;
  date: string;
}

export async function GET() {
  try {
    const directory = join(process.cwd(), 'public', 'tournaments');
    
    // Read directory contents
    const files = await readdir(directory);
    
    // Filter for JSON files only (excluding .gitkeep)
    const jsonFiles = files.filter(file => file.endsWith('.json') && file !== '.gitkeep');
    
    const battleReplays: BattleReplay[] = [];
    
    // Read each JSON file and parse battle data
    for (const file of jsonFiles) {
      try {
        const filePath = join(directory, file);
        const fileContent = await readFile(filePath, 'utf-8');
        const battleData = JSON.parse(fileContent);
        
        // Validate required fields
        if (battleData.metadata && battleData.battleLog) {
          const metadata = battleData.metadata;
          
          // Convert to BattleReplay format
          const battleReplay: BattleReplay = {
            id: file.replace('.json', ''),
            fighterA: {
              id: `fighterA-${metadata.timestamp}`,
              name: metadata.fighterA.name,
              imageUrl: metadata.fighterA.imageUrl,
              stats: {
                health: metadata.fighterA.stats.health,
                maxHealth: metadata.fighterA.stats.maxHealth,
                strength: metadata.fighterA.stats.strength,
                luck: metadata.fighterA.stats.luck,
                agility: metadata.fighterA.stats.agility,
                defense: metadata.fighterA.stats.defense,
                age: metadata.fighterA.stats.age,
                size: metadata.fighterA.stats.size,
                build: metadata.fighterA.stats.build,
              },
            },
            fighterB: {
              id: `fighterB-${metadata.timestamp}`,
              name: metadata.fighterB.name,
              imageUrl: metadata.fighterB.imageUrl,
              stats: {
                health: metadata.fighterB.stats.health,
                maxHealth: metadata.fighterB.stats.maxHealth,
                strength: metadata.fighterB.stats.strength,
                luck: metadata.fighterB.stats.luck,
                agility: metadata.fighterB.stats.agility,
                defense: metadata.fighterB.stats.defense,
                age: metadata.fighterB.stats.age,
                size: metadata.fighterB.stats.size,
                build: metadata.fighterB.stats.build,
              },
            },
            scene: {
              name: metadata.arena.name,
              imageUrl: metadata.arena.imageUrl,
              description: metadata.arena.description,
            },
            battleLog: battleData.battleLog,
            winner: metadata.winner,
            date: metadata.timestamp,
          };
          
          battleReplays.push(battleReplay);
        }
      } catch (error) {
        // Skip invalid JSON files
        console.warn(`Failed to parse battle file ${file}:`, error);
        continue;
      }
    }
    
    // Sort by date (newest first)
    battleReplays.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return NextResponse.json({
      success: true,
      battleReplays: battleReplays
    });
    
  } catch (error) {
    console.error('Failed to read battle replays directory:', error);
    return NextResponse.json({
      success: false,
      battleReplays: [],
      error: 'Failed to read battle replays directory'
    }, { status: 500 });
  }
} 