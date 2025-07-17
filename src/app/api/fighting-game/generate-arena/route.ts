import { NextRequest, NextResponse } from 'next/server';
import { generateEnhancedArenaDescription } from '@/lib/lmstudio-client';

export async function POST(req: NextRequest) {
  try {
    const { imageDescription, arenaId, imageUrl } = await req.json();

    if (!imageDescription || !arenaId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate arena name from the image description
    const arenaNameResponse = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: '', // We don't need the image again, just use the description
        prompt: `Based on this description: "${imageDescription}", generate a dramatic and memorable name for this arena. The name should be epic and fitting for a legendary battleground. Return only the name, nothing else.`
      }),
    });

    if (!arenaNameResponse.ok) {
      throw new Error('Failed to generate arena name');
    }

    const arenaNameData = await arenaNameResponse.json();
    const arenaName = arenaNameData.description || 'Mysterious Arena';

    // Generate enhanced arena description
    const enhancedDescription = await generateEnhancedArenaDescription(
      arenaName,
      imageDescription,
      'battle',
      []
    );

    if (!enhancedDescription.success) {
      throw new Error('Failed to generate enhanced arena description');
    }

    // Extract environmental objects from the description
    const environmentalObjects = extractEnvironmentalObjects(imageDescription);

    // Create arena metadata
    const arenaMetadata = {
      id: arenaId,
      name: arenaName,
      image: imageUrl.split('/').pop() || `${arenaId}.jpg`,
      description: enhancedDescription.description,
      environmentalObjects,
      createdAt: new Date().toISOString(),
    };

    // Save arena metadata
    const saveResponse = await fetch('/api/save-arena-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: arenaMetadata.image,
        name: arenaMetadata.name,
        description: arenaMetadata.description,
        environmentalObjects: arenaMetadata.environmentalObjects,
      }),
    });

    if (!saveResponse.ok) {
      console.warn('Failed to save arena metadata, but continuing...');
    }

    return NextResponse.json({
      success: true,
      arena: arenaMetadata
    });
  } catch (error) {
    console.error('Arena generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate arena metadata' },
      { status: 500 }
    );
  }
}

// Helper function to extract environmental objects from description
function extractEnvironmentalObjects(description: string): string[] {
  const objects: string[] = [];
  const desc = description.toLowerCase();
  
  // Common arena objects to look for
  const commonObjects = [
    'candles', 'wooden tables', 'glass bottles', 'crystals', 'witches tools',
    'throne', 'torch', 'mat', 'banner', 'sand', 'gate', 'pillar', 'statue',
    'fire', 'water', 'ice', 'rock', 'tree', 'building', 'wall', 'floor',
    'ceiling', 'stairs', 'bridge', 'tower', 'castle', 'temple', 'cave',
    'mountain', 'forest', 'desert', 'ocean', 'river', 'lake', 'volcano'
  ];

  for (const obj of commonObjects) {
    if (desc.includes(obj)) {
      objects.push(obj);
    }
  }

  // If no objects found, add some generic ones based on the description
  if (objects.length === 0) {
    if (desc.includes('indoor') || desc.includes('room')) {
      objects.push('walls', 'floor', 'ceiling');
    } else if (desc.includes('outdoor') || desc.includes('nature')) {
      objects.push('terrain', 'environment');
    } else {
      objects.push('battlefield', 'arena');
    }
  }

  return objects.slice(0, 5); // Limit to 5 objects
} 