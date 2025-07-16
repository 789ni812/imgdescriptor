import { NextRequest, NextResponse } from 'next/server';
import { generateFighterDescription } from '@/lib/lmstudio-client';

export async function POST(req: NextRequest) {
  try {
    const { fighter } = await req.json();

    if (!fighter) {
      return NextResponse.json(
        { success: false, error: 'Fighter data is required.' },
        { status: 400 }
      );
    }

    const description = await generateFighterDescription(fighter);

    return NextResponse.json({
      success: true,
      description: description,
    });

  } catch (error) {
    console.error('API /generate-fighter-description Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 }
    );
  }
} 