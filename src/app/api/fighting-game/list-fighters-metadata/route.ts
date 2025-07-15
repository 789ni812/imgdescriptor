import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { FighterMetadata } from '@/lib/utils/fighterUtils';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const directory = join(process.cwd(), 'public', 'vs', 'fighters');
    
    // Read directory contents
    const files = await readdir(directory);
    
    // Filter for JSON files only
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const fighters: FighterMetadata[] = [];
    
    // Read each JSON file and parse fighter metadata
    for (const file of jsonFiles) {
      try {
        const filePath = join(directory, file);
        const fileContent = await readFile(filePath, 'utf-8');
        const fighterData = JSON.parse(fileContent) as FighterMetadata;
        
        // Validate required fields
        if (fighterData.id && fighterData.name && fighterData.image && fighterData.stats) {
          fighters.push(fighterData);
        }
      } catch (error) {
        // Skip invalid JSON files
        console.warn(`Failed to parse fighter file ${file}:`, error);
        continue;
      }
    }
    
    return NextResponse.json({
      success: true,
      fighters: fighters
    });
    
  } catch (error) {
    console.error('Failed to read fighters directory:', error);
    return NextResponse.json({
      success: false,
      fighters: [],
      error: 'Failed to read fighters directory'
    }, { status: 500 });
  }
} 