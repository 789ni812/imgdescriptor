import { NextRequest, NextResponse } from 'next/server';

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

    // For now, return fallback slogans immediately to test the API
    console.log('Returning fallback slogans');
    
    return NextResponse.json({
      success: true,
      slogans: [
        `The ${fighterName}`,
        `Ready for battle!`,
        `Champion material!`
      ],
      description: imageDescription || `A formidable fighter ready to prove their worth.`
    });

  } catch (error) {
    console.error('Error generating fighter slogans:', error);
    return NextResponse.json(
      { error: 'Failed to generate fighter slogans' },
      { status: 500 }
    );
  }
} 