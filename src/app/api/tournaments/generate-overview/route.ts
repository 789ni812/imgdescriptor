import { NextRequest, NextResponse } from 'next/server';
import { generateTournamentOverview } from '@/lib/lmstudio-client';

export async function POST(request: NextRequest) {
  try {
    console.log('Tournament overview API called');
    const body = await request.json();
    const {
      tournamentName,
      tournamentDate,
      arena,
      fighters
    } = body;

    console.log('Received data:', {
      tournamentName: !!tournamentName,
      tournamentDate: !!tournamentDate,
      arena: !!arena,
      fighters: !!fighters,
      fighterCount: fighters?.length
    });

    if (!tournamentName || !tournamentDate || !arena || !fighters) {
      console.log('Missing required fields:', {
        tournamentName: !tournamentName,
        tournamentDate: !tournamentDate,
        arena: !arena,
        fighters: !fighters
      });
      return NextResponse.json(
        { error: 'Missing required fields: tournamentName, tournamentDate, arena, fighters' },
        { status: 400 }
      );
    }

    // Generate tournament overview using LLM
    console.log('Generating tournament overview with LLM...');
    const overview = await generateTournamentOverview(
      tournamentName,
      arena.name,
      arena.description,
      1, // current round
      Math.ceil(Math.log2(fighters.length)), // total rounds
    );

    if (!overview) {
      console.error('Failed to generate tournament overview');
      // Return fallback overview
      return NextResponse.json({
        success: true,
        data: {
          overview: `Welcome to the ${tournamentName}! This epic tournament features ${fighters.length} warriors battling for glory in the legendary ${arena.name}.`,
          arenaDescription: arena.description,
          tournamentHighlights: [
            `${fighters.length} fighters competing for the championship`,
            `Epic battles in the ${arena.name}`,
            `Only one will emerge victorious`
          ]
        }
      });
    }

    console.log('Successfully generated tournament overview');

    // Parse the overview to extract highlights
    const highlights = [
      `${fighters.length} fighters competing for the championship`,
      `Epic battles in the ${arena.name}`,
      `Only one will emerge victorious`
    ];

    return NextResponse.json({
      success: true,
      data: {
        overview,
        arenaDescription: arena.description,
        tournamentHighlights: highlights
      }
    });

  } catch (error) {
    console.error('Tournament overview generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate tournament overview'
    }, { status: 500 });
  }
} 