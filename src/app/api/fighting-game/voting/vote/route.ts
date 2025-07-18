import { NextRequest, NextResponse } from 'next/server';
import { createVotingStore } from '@/lib/stores/votingStore';

// In-memory store for demo purposes (in production, this would be a database)
let votingStore = createVotingStore();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fighterId, voterId, ipAddress } = body;

    // Validate required fields
    if (!fighterId || !voterId || !ipAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: fighterId, voterId, ipAddress' },
        { status: 400 }
      );
    }

    // Get current round to validate the vote
    const currentRound = votingStore.getCurrentRound();
    if (!currentRound) {
      return NextResponse.json(
        { success: false, error: 'No active voting round' },
        { status: 400 }
      );
    }

    // Check if the fighter exists in the current round
    const fighterExists = currentRound.fighters.some(f => f.fighterId === fighterId);
    if (!fighterExists) {
      return NextResponse.json(
        { success: false, error: 'Invalid fighter ID for current round' },
        { status: 400 }
      );
    }

    // Check for duplicate votes from the same user in the current round
    const hasVoted = currentRound.votes.some(vote => 
      vote.voterId === voterId && vote.fighterId === fighterId
    );
    if (hasVoted) {
      return NextResponse.json(
        { success: false, error: 'User has already voted for this fighter in this round' },
        { status: 400 }
      );
    }

    // Record the vote
    votingStore.vote(fighterId, voterId, ipAddress);

    // Get updated round data
    const updatedRound = votingStore.getCurrentRound();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Vote recorded successfully',
        round: updatedRound
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 