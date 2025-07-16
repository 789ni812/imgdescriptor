import { NextResponse } from 'next/server';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { balanceAllFightersWithLLM, type FighterData } from '@/lib/fighter-balancing';

export async function POST() {
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
      const fighterData = JSON.parse(content) as FighterData;
      fighters.push(fighterData);
    }
    
    if (fighters.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fighter files found to balance'
      }, { status: 404 });
    }
    
    console.log(`Starting LLM-powered balancing for ${fighters.length} fighters...`);
    
    // Balance all fighters using LLM (with rule-based fallback)
    const result = await balanceAllFightersWithLLM(fighters);
    
    console.log(`Balancing complete: ${result.llmCount} LLM-balanced, ${result.ruleBasedCount} rule-based`);
    
    // Write updated fighter files
    for (const { balancedFighter } of result.results) {
      const filePath = join(fightersDir, `${balancedFighter.id}.json`);
      await writeFile(filePath, JSON.stringify(balancedFighter, null, 2));
    }
    
    return NextResponse.json({
      success: true,
      message: result.message,
      results: result.results,
      llmCount: result.llmCount,
      ruleBasedCount: result.ruleBasedCount
    });
  } catch (error) {
    console.error('Error balancing fighters:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 