import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { image, name, description, environmentalObjects } = await req.json();
    if (!image || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const arenasDir = path.join(process.cwd(), 'public', 'vs', 'arena');
    await fs.promises.mkdir(arenasDir, { recursive: true });
    const base = path.basename(image, path.extname(image));
    const jsonName = `${base}.json`;
    const jsonPath = path.join(arenasDir, jsonName);
    const arenaData = {
      id: base,
      name,
      image,
      description: description || '',
      environmentalObjects: environmentalObjects || [],
      createdAt: new Date().toISOString(),
    };
    await fs.promises.writeFile(jsonPath, JSON.stringify(arenaData, null, 2), 'utf-8');
    return NextResponse.json({ success: true, path: `/vs/arena/${jsonName}` });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
} 