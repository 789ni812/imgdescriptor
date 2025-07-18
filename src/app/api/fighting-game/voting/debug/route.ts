import { NextRequest, NextResponse } from 'next/server';
import { getSharedVotingStore } from '@/lib/stores/sharedVotingStore';

export async function GET(_request: NextRequest) {
  try {
    const votingStore = getSharedVotingStore();
    const session = votingStore.getSession();
    const currentRound = votingStore.getCurrentRound();
    
    return NextResponse.json({
      session: session,
      currentRound: currentRound,
      hasSession: !!session,
      hasCurrentRound: !!currentRound
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Debug API error' },
      { status: 500 }
    );
  }
} 