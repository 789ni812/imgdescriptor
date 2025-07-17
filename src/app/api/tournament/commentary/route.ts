import { NextRequest, NextResponse } from 'next/server';
import { generateTournamentCommentary } from '@/lib/lmstudio-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      tournamentName,
      arenaName,
      matchNumber,
      totalMatches,
      fighterAName,
      fighterBName,
      winnerName,
      historicalContext
    } = body;

    const commentary = await generateTournamentCommentary(
      type,
      tournamentName,
      arenaName,
      matchNumber,
      totalMatches,
      fighterAName,
      fighterBName,
      winnerName,
      historicalContext
    );

    return NextResponse.json({ commentary });
  } catch (error) {
    console.error('Error generating tournament commentary:', error);
    return NextResponse.json(
      { error: 'Failed to generate commentary' },
      { status: 500 }
    );
  }
} 