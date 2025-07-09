import { NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/lmstudio-client';
import type { AnalyzeImageRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    // Debug: Check content type and log raw body
    const contentType = request.headers.get('content-type') || '';
    console.log('DEBUG /api/analyze-image content-type:', contentType);
    
    if (!contentType.includes('application/json')) {
      const rawBody = await request.text();
      console.log('DEBUG /api/analyze-image raw body (first 200 chars):', rawBody.substring(0, 200));
      return NextResponse.json(
        { success: false, error: `Expected JSON but received: ${contentType}` },
        { status: 400 }
      );
    }
    
    const { image, prompt } = (await request.json()) as AnalyzeImageRequest;

    if (!image || !prompt) {
      return NextResponse.json(
        { success: false, error: 'Image data and prompt are required.' },
        { status: 400 }
      );
    }
    
    const analysisResult = await analyzeImage(image, prompt);

    if (!analysisResult.success) {
      return NextResponse.json(
        { success: false, error: analysisResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      description: analysisResult.description,
    });

  } catch (error) {
    console.error('API /analyze-image Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 }
    );
  }
} 