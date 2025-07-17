import { NextRequest, NextResponse } from 'next/server';
import { generateEnhancedArenaDescription } from '@/lib/lmstudio-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      arenaName, 
      imageDescription, 
      arenaType, 
      existingFeatures 
    } = body;

    if (!arenaName || !imageDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await generateEnhancedArenaDescription(
      arenaName,
      imageDescription,
      arenaType,
      existingFeatures
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate enhanced arena description' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      description: result.description
    });
  } catch (error) {
    console.error('Enhanced arena description generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 