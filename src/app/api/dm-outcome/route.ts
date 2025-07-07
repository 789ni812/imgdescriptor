import { NextRequest, NextResponse } from 'next/server';
import { getDMOutcome } from './dmOutcomeHandler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { character, selectedChoice } = body;
    if (!character || !selectedChoice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const result = getDMOutcome({ character, selectedChoice });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
} 