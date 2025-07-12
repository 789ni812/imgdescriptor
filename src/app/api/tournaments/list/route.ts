import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const tournamentsDir = join(process.cwd(), 'public', 'tournaments');
    const files = await readdir(tournamentsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    return NextResponse.json({ battles: jsonFiles });
  } catch (error) {
    return NextResponse.json({ battles: [], error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 