import { NextRequest, NextResponse } from 'next/server';
import { generateFighterSlogans } from '@/lib/lmstudio-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      fighterName, 
      fighterStats, 
      visualAnalysis, 
      imageDescription 
    } = body;

    if (!fighterName || !fighterStats || !visualAnalysis || !imageDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await generateFighterSlogans(
      fighterName,
      fighterStats,
      visualAnalysis,
      imageDescription
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate slogans' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      slogans: result.slogans,
      description: result.description
    });
  } catch (error) {
    console.error('Fighter slogans generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 