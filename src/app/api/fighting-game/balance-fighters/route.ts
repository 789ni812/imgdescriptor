import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { balanceAllFighters, type FighterData } from '@/lib/fighter-balancing';

export async function POST(_req: NextRequest) {
  // Artificial delay for E2E test reliability
  await new Promise(r => setTimeout(r, 500));
  try {
    const fightersDir = join(process.cwd(), 'public', 'vs', 'fighters');
    const files = await readdir(fightersDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const fighters: FighterData[] = [];
    
    // Read all fighter files
    for (const file of jsonFiles) {
      const filePath = join(fightersDir, file);
      const content = await readFile(filePath, 'utf-8');
      const fighterData: FighterData = JSON.parse(content);
      fighters.push(fighterData);
    }
    
    // Use the pure function to balance all fighters
    const balanceResult = balanceAllFighters(fighters);
    
    // Write balanced fighters back to files
    for (const result of balanceResult.results) {
      const filePath = join(fightersDir, `${result.balancedFighter.id}.json`);
      await writeFile(filePath, JSON.stringify(result.balancedFighter, null, 2), 'utf-8');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: balanceResult.message,
      results: balanceResult.results.map(r => ({
        name: r.name,
        type: r.type,
        oldStats: r.oldStats,
        newStats: r.newStats
      }))
    });
    
  } catch (error) {
    console.error('Error balancing fighters:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 