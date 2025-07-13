import { NextRequest, NextResponse } from 'next/server';
import { getFightersList } from '@/lib/utils/fighterUtils';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const result = await getFightersList();
  
  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 500 });
  }
} 