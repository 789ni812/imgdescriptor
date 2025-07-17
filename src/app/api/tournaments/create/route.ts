import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { Tournament, CreateTournamentRequest, TournamentResponse } from '@/lib/types/tournament';
import { generateTournamentName, generateBracket, calculateTotalRounds } from '@/lib/utils/tournamentUtils';
import { Fighter } from '@/lib/stores/fightingGameStore';

// Helper function to get random arena
const getRandomArena = async () => {
  try {
    const arenasDir = join(process.cwd(), 'public', 'imgRepository', 'arenas');
    const files = await readdir(arenasDir);
    const arenaFiles = files.filter((file: string) => file.endsWith('.json'));
    
    if (arenaFiles.length === 0) {
      return {
        name: 'Tournament Arena',
        description: 'A neutral arena for tournament battles'
      };
    }
    
    const randomFile = arenaFiles[Math.floor(Math.random() * arenaFiles.length)];
    const arenaPath = join(arenasDir, randomFile);
    const arenaContent = await readFile(arenaPath, 'utf-8');
    const arenaData = JSON.parse(arenaContent);
    
    return {
      name: arenaData.name || 'Tournament Arena',
      description: arenaData.description || 'A neutral arena for tournament battles'
    };
  } catch (error) {
    console.error('Failed to load random arena:', error);
    return {
      name: 'Tournament Arena',
      description: 'A neutral arena for tournament battles'
    };
  }
};

export async function POST(req: NextRequest) {
  try {
    const body: CreateTournamentRequest = await req.json();
    const { fighterIds } = body;

    if (!fighterIds || fighterIds.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'At least 2 fighters are required to create a tournament'
      }, { status: 400 });
    }

    // Load fighters from the provided IDs
    const fightersDir = join(process.cwd(), 'public', 'vs', 'fighters');
    const fighters: Fighter[] = [];

    for (const fighterId of fighterIds) {
      try {
        const filePath = join(fightersDir, `${fighterId}.json`);
        const content = await readFile(filePath, 'utf-8');
        const fighterData = JSON.parse(content);
        
        // Convert to Fighter format
        const fighter: Fighter = {
          id: fighterData.id || fighterId,
          name: fighterData.name,
          imageUrl: `/vs/fighters/${fighterData.image || `${fighterId}.jpg`}`,
          description: fighterData.description || '',
          stats: {
            health: fighterData.stats.health,
            maxHealth: fighterData.stats.maxHealth || fighterData.stats.health,
            strength: fighterData.stats.strength,
            luck: fighterData.stats.luck,
            agility: fighterData.stats.agility,
            defense: fighterData.stats.defense,
            age: fighterData.stats.age || 25,
            size: fighterData.stats.size || 'medium',
            build: fighterData.stats.build || 'average'
          },
          visualAnalysis: {
            age: fighterData.visualAnalysis?.age || 'adult',
            size: fighterData.visualAnalysis?.size || 'medium',
            build: fighterData.visualAnalysis?.build || 'average',
            appearance: fighterData.visualAnalysis?.appearance || [],
            weapons: fighterData.visualAnalysis?.weapons || [],
            armor: fighterData.visualAnalysis?.armor || []
          },
          combatHistory: fighterData.combatHistory || [],
          winLossRecord: fighterData.winLossRecord || { wins: 0, losses: 0, draws: 0 },
          createdAt: fighterData.createdAt || new Date().toISOString()
        };
        
        fighters.push(fighter);
      } catch (error) {
        console.error(`Failed to load fighter ${fighterId}:`, error);
        return NextResponse.json({
          success: false,
          error: `Failed to load fighter ${fighterId}`
        }, { status: 400 });
      }
    }

    if (fighters.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'At least 2 valid fighters are required'
      }, { status: 400 });
    }

    // Get a random arena for the tournament
    const arena = await getRandomArena();

    // Generate tournament
    const tournamentId = `tournament-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const totalRounds = calculateTotalRounds(fighters.length);
    const brackets = generateBracket(fighters);

    const tournament: Tournament = {
      id: tournamentId,
      name: generateTournamentName(),
      createdAt: new Date(),
      status: 'setup',
      fighters,
      brackets,
      currentRound: 1,
      totalRounds,
      arenaName: arena.name,
      arenaDescription: arena.description
    };

    // Save tournament to file
    const tournamentsDir = join(process.cwd(), 'public', 'tournaments');
    const tournamentPath = join(tournamentsDir, `${tournamentId}.json`);
    
    const { writeFile, mkdir } = await import('fs/promises');
    await mkdir(tournamentsDir, { recursive: true });
    await writeFile(tournamentPath, JSON.stringify(tournament, null, 2));

    const response: TournamentResponse = {
      success: true,
      tournament
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 