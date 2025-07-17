import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const arenasDir = path.join(process.cwd(), 'public', 'vs', 'arena');
    const files = await fs.readdir(arenasDir);
    
    // Filter for JSON files that contain arena data
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      // Return a default arena if no JSON files exist
      return NextResponse.json({
        name: "Default Arena",
        description: "A mysterious arena shrouded in darkness, where legends are made and champions are crowned.",
        imageUrl: "/vs/arena/default-arena.jpg"
      });
    }
    
    // Pick a random JSON file
    const randomFile = jsonFiles[Math.floor(Math.random() * jsonFiles.length)];
    const filePath = path.join(arenasDir, randomFile);
    
    // Read and parse the JSON file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const arenaData = JSON.parse(fileContent);
    
    // Extract arena information based on the actual JSON structure
    const arena = {
      name: arenaData.name || "Unknown Arena",
      description: arenaData.description || "An arena of legend.",
      imageUrl: `/vs/arena/${arenaData.image}`
    };
    
    return NextResponse.json(arena);
  } catch (error) {
    console.error('Error getting random arena:', error);
    return NextResponse.json(
      { error: 'Failed to get random arena' },
      { status: 500 }
    );
  }
} 