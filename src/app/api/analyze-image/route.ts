import { NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/lmstudio-client';
import type { AnalyzeImageRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeImageRequest;
    const { image, prompt } = body;

    if (!image || !prompt) {
      return NextResponse.json(
        { success: false, error: 'Image data and prompt are required.' },
        { status: 400 }
      );
    }

    // The 'image' is already base64 encoded from the client
    const analysisResult = await analyzeImage(image, prompt);

    if (!analysisResult.success) {
      return NextResponse.json(
        { success: false, error: analysisResult.error || 'Failed to analyze image.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      description: analysisResult.description,
    });
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 }
    );
  }
} 