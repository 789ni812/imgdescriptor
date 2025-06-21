import { NextResponse } from 'next/server';
import { generateStory } from '@/lib/lmstudio-client';

interface GenerateStoryRequest {
  description: string;
}

export async function POST(request: Request) {
  try {
    const { description } = (await request.json()) as GenerateStoryRequest;

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'Description is required.' },
        { status: 400 }
      );
    }
    
    const storyResult = await generateStory(description);

    if (!storyResult.success) {
      return NextResponse.json(
        { success: false, error: storyResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      story: storyResult.story,
    });

  } catch (error) {
    console.error('API /generate-story Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 }
    );
  }
} 