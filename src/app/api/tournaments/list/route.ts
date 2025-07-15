import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { Tournament, TournamentListResponse } from '@/lib/types/tournament';

export async function GET() {
  try {
    const tournamentsDir = join(process.cwd(), 'public', 'tournaments');
    
    // Check if tournaments directory exists
    try {
      await readdir(tournamentsDir);
    } catch {
      // Directory doesn't exist, return empty list
      const response: TournamentListResponse = {
        success: true,
        tournaments: []
      };
      return NextResponse.json(response);
    }

    const files = await readdir(tournamentsDir);
    const tournamentFiles = files.filter(file => file.endsWith('.json'));
    
    const tournaments: Tournament[] = [];
    
    for (const file of tournamentFiles) {
      try {
        const filePath = join(tournamentsDir, file);
        const content = await readFile(filePath, 'utf-8');
        const tournamentData = JSON.parse(content);
        
        // Convert dates back to Date objects
        const tournament: Tournament = {
          ...tournamentData,
          createdAt: new Date(tournamentData.createdAt)
        };
        
        tournaments.push(tournament);
      } catch (error) {
        console.error(`Failed to load tournament from ${file}:`, error);
        // Continue loading other tournaments
      }
    }
    
    // Sort tournaments by creation date (newest first)
    tournaments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const response: TournamentListResponse = {
      success: true,
      tournaments
    };
    
    return NextResponse.json(response);
  } catch {
    console.error('Error listing tournaments');
    return NextResponse.json({
      success: false,
      error: 'Unknown error occurred'
    }, { status: 500 });
  }
} 