import { NextRequest, NextResponse } from 'next/server';
import { generateTournamentOverview } from '@/lib/lmstudio-client';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('Tournament overview API called');
    const body = await request.json();
    const {
      tournamentId,
      tournamentName,
      tournamentDate,
      arena,
      fighters
    } = body;

    // If tournamentId is provided, try to load and persist overview in the tournament file
    if (tournamentId) {
      const tournamentsDir = join(process.cwd(), 'public', 'tournaments');
      const tournamentPath = join(tournamentsDir, `${tournamentId}.json`);
      let tournament;
      try {
        const content = await readFile(tournamentPath, 'utf-8');
        tournament = JSON.parse(content);
      } catch (err) {
        console.error('Could not read tournament file:', err);
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      }
      // If overview already exists, return it
      if (tournament.overview) {
        console.log('Returning cached tournament overview from file');
        return NextResponse.json({
          success: true,
          data: tournament.overview
        });
      }
      // Otherwise, generate and persist
      if (!tournamentName || !tournamentDate || !arena || !fighters) {
        return NextResponse.json(
          { error: 'Missing required fields: tournamentName, tournamentDate, arena, fighters' },
          { status: 400 }
        );
      }
      console.log('Generating tournament overview with LLM...');
      const overviewText = await generateTournamentOverview(
        tournamentName,
        arena.name,
        arena.description,
        1, // current round
        Math.ceil(Math.log2(fighters.length)), // total rounds
      );
      const highlights = [
        `${fighters.length} fighters competing for the championship`,
        `Epic battles in the ${arena.name}`,
        `Only one will emerge victorious`
      ];
      const overviewObj = {
        overview: overviewText,
        arenaDescription: arena.description,
        tournamentHighlights: highlights,
        generatedAt: new Date().toISOString()
      };
      tournament.overview = overviewObj;
      await writeFile(tournamentPath, JSON.stringify(tournament, null, 2));
      console.log('Saved tournament overview to file');
      return NextResponse.json({
        success: true,
        data: overviewObj
      });
    }

    // Fallback: stateless (legacy) mode
    if (!tournamentName || !tournamentDate || !arena || !fighters) {
      return NextResponse.json(
        { error: 'Missing required fields: tournamentName, tournamentDate, arena, fighters' },
        { status: 400 }
      );
    }
    // Generate tournament overview using LLM (stateless)
    console.log('Generating tournament overview with LLM (stateless mode)...');
    const overview = await generateTournamentOverview(
      tournamentName,
      arena.name,
      arena.description,
      1, // current round
      Math.ceil(Math.log2(fighters.length)), // total rounds
    );
    const highlights = [
      `${fighters.length} fighters competing for the championship`,
      `Epic battles in the ${arena.name}`,
      `Only one will emerge victorious`
    ];
    return NextResponse.json({
      success: true,
      data: {
        overview,
        arenaDescription: arena.description,
        tournamentHighlights: highlights
      }
    });
  } catch (error) {
    console.error('Tournament overview generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate tournament overview'
    }, { status: 500 });
  }
} 