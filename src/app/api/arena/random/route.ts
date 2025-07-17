import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export interface ArenaMetadata {
  id: string;
  name: string;
  image: string;
  description?: string;
  environmentalObjects?: string[];
  createdAt?: string;
}

export async function GET() {
  try {
    const arenasDir = join(process.cwd(), 'public', 'vs', 'arena');
    const files = await readdir(arenasDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      // Return default arena if no arenas exist
      return NextResponse.json({
        id: 'default-tournament-arena',
        name: 'Tournament Arena',
        image: '/vs/arena/battle-arena-1-1752763667035-og3my7.jpg',
        description: 'A grand arena where champions are made and legends are born.',
        environmentalObjects: ['marble throne', 'broken column', 'sand-covered ground'],
        createdAt: new Date().toISOString()
      });
    }

    // Pick a random arena
    const randomFile = jsonFiles[Math.floor(Math.random() * jsonFiles.length)];
    const filePath = join(arenasDir, randomFile);
    const fileContent = await readFile(filePath, 'utf-8');
    const arenaData = JSON.parse(fileContent);

    // Return the arena data with the full image path
    return NextResponse.json({
      ...arenaData,
      image: `/vs/arena/${arenaData.image}`
    });
  } catch (error) {
    console.error('Error getting random arena:', error);
    // Return default arena on error
    return NextResponse.json({
      id: 'default-tournament-arena',
      name: 'Tournament Arena',
      image: '/vs/arena/battle-arena-1-1752763667035-og3my7.jpg',
      description: 'A grand arena where champions are made and legends are born.',
      environmentalObjects: ['marble throne', 'broken column', 'sand-covered ground'],
      createdAt: new Date().toISOString()
    });
  }
} 