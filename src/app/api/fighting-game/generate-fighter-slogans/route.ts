import { NextRequest, NextResponse } from 'next/server';
import { generateFighterSlogans } from '@/lib/lmstudio-client';

export async function POST(request: NextRequest) {
  try {
    console.log('Fighter slogans API called');
    const body = await request.json();
    const {
      fighterName,
      fighterStats,
      visualAnalysis,
      imageDescription
    } = body;

    console.log('Received data:', {
      fighterName: !!fighterName,
      fighterStats: !!fighterStats,
      visualAnalysis: !!visualAnalysis,
      imageDescription: !!imageDescription,
      fighterNameValue: fighterName,
      imageDescriptionValue: imageDescription
    });

    if (!fighterName || !fighterStats || !visualAnalysis || !imageDescription) {
      console.log('Missing required fields:', {
        fighterName: !fighterName,
        fighterStats: !fighterStats,
        visualAnalysis: !visualAnalysis,
        imageDescription: !imageDescription
      });
      return NextResponse.json(
        { error: 'Missing required fields: fighterName, fighterStats, visualAnalysis, imageDescription' },
        { status: 400 }
      );
    }

    // Generate slogans using LLM
    console.log('Generating slogans with LLM...');
    const result = await generateFighterSlogans(
      fighterName,
      fighterStats,
      visualAnalysis,
      imageDescription
    );

    if (!result.success) {
      console.error('Failed to generate slogans:', result.error);
      // Return fallback slogans if LLM generation fails
      return NextResponse.json({
        success: true,
        slogans: [
          `The ${fighterName}`,
          `Ready for battle!`,
          `Champion material!`
        ],
        description: imageDescription || `A formidable fighter ready to prove their worth.`
      });
    }

    console.log('Successfully generated slogans:', result.slogans);
    return NextResponse.json({
      success: true,
      slogans: result.slogans || [],
      description: result.description || imageDescription || `A formidable fighter ready to prove their worth.`
    });

  } catch (error) {
    console.error('Error generating fighter slogans:', error);
    return NextResponse.json(
      { error: 'Failed to generate fighter slogans' },
      { status: 500 }
    );
  }
} 