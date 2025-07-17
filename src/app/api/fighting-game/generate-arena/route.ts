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

    // Generate arena name directly from the image description
    const arenaName = generateArenaNameFromDescription(imageDescription);

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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const saveResponse = await fetch(`${baseUrl}/api/save-arena-metadata`, {
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

// Helper function to generate arena name from description
function generateArenaNameFromDescription(description: string): string {
  const desc = description.toLowerCase();
  
  // Look for specific arena types and generate dramatic names
  if (desc.includes('castle') || desc.includes('fortress') || desc.includes('tower')) {
    return 'The Iron Citadel';
  }
  if (desc.includes('cave') || desc.includes('cavern') || desc.includes('underground')) {
    return 'The Shadow Depths';
  }
  if (desc.includes('forest') || desc.includes('woods') || desc.includes('jungle')) {
    return 'The Verdant Battlefield';
  }
  if (desc.includes('desert') || desc.includes('sand') || desc.includes('dunes')) {
    return 'The Scorched Wasteland';
  }
  if (desc.includes('mountain') || desc.includes('peak') || desc.includes('summit')) {
    return 'The Thunder Peak';
  }
  if (desc.includes('water') || desc.includes('ocean') || desc.includes('sea')) {
    return 'The Abyssal Arena';
  }
  if (desc.includes('volcano') || desc.includes('lava') || desc.includes('fire')) {
    return 'The Infernal Forge';
  }
  if (desc.includes('ice') || desc.includes('snow') || desc.includes('frozen')) {
    return 'The Frozen Heart';
  }
  if (desc.includes('city') || desc.includes('urban') || desc.includes('street')) {
    return 'The Concrete Colosseum';
  }
  if (desc.includes('temple') || desc.includes('shrine') || desc.includes('sacred')) {
    return 'The Hallowed Grounds';
  }
  if (desc.includes('candles') || desc.includes('mystical') || desc.includes('ritual')) {
    return 'The Candlelit Sanctum';
  }
  if (desc.includes('dojo') || desc.includes('training') || desc.includes('martial')) {
    return 'The Warrior\'s Crucible';
  }
  if (desc.includes('arena') || desc.includes('colosseum') || desc.includes('stadium')) {
    return 'The Grand Arena';
  }
  
  // Default dramatic names based on general characteristics
  if (desc.includes('dark') || desc.includes('shadow') || desc.includes('night')) {
    return 'The Shadow Realm';
  }
  if (desc.includes('ancient') || desc.includes('old') || desc.includes('ruins')) {
    return 'The Ancient Battleground';
  }
  if (desc.includes('mysterious') || desc.includes('strange') || desc.includes('unknown')) {
    return 'The Mysterious Arena';
  }
  
  // Fallback to a dramatic generic name
  return 'The Arena of Legends';
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