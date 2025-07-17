import { NextRequest, NextResponse } from 'next/server';
import { generateTournamentCommentary } from '@/lib/lmstudio-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      commentaryType,
      tournamentName, 
      arenaName, 
      currentMatch, 
      totalMatches, 
      fighterA, 
      fighterB, 
      winner, 
      tournamentContext,
      fighterStats
    } = body;

    if (!commentaryType || !tournamentName || !arenaName || currentMatch === undefined || totalMatches === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const commentary = await generateTournamentCommentary(
      commentaryType,
      tournamentName,
      arenaName,
      currentMatch,
      totalMatches,
      fighterA,
      fighterB,
      winner,
      tournamentContext,
      fighterStats
    );

    return NextResponse.json({
      success: true,
      commentary
    });
  } catch (error) {
    console.error('Tournament commentary generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 