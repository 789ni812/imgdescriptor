import { NextRequest, NextResponse } from 'next/server';
import { getArenasList } from '@/lib/utils/arenaUtils';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const result = await getArenasList();
  if (result.success) {
    return NextResponse.json({ success: true, arenas: result.arenas });
  } else {
    return NextResponse.json({ success: false, error: result.error || 'Failed to list arenas' }, { status: 500 });
  }
} 