import { NextRequest, NextResponse } from 'next/server';
import { TournamentCommentaryService } from '@/lib/services/tournament-commentary-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tournament, match, historicalData } = body;

    if (!tournament || !match || !historicalData) {
      return NextResponse.json(
        { error: 'Missing required data: tournament, match, or historicalData' },
        { status: 400 }
      );
    }

    const commentaryService = TournamentCommentaryService.getInstance();
    
    // Generate commentary with historical context
    const commentary = await commentaryService.generateMatchCommentary(
      tournament,
      match,
      historicalData
    );

    return NextResponse.json({
      success: true,
      commentary: commentary.commentary,
      context: commentary.context
    });

  } catch (error) {
    console.error('Tournament commentary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate tournament commentary' },
      { status: 500 }
    );
  }
} 