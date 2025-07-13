import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { image, name, stats } = await req.json();
    if (!image || !name || !stats) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const fightersDir = path.join(process.cwd(), 'public', 'vs', 'fighters');
    await fs.promises.mkdir(fightersDir, { recursive: true });
    const base = path.basename(image, path.extname(image));
    const jsonName = `${base}.json`;
    const jsonPath = path.join(fightersDir, jsonName);
    const fighterData = {
      id: base,
      name,
      image,
      stats,
      matchHistory: [],
    };
    await fs.promises.writeFile(jsonPath, JSON.stringify(fighterData, null, 2), 'utf-8');
    return NextResponse.json({ success: true, path: `/vs/fighters/${jsonName}` });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
} 