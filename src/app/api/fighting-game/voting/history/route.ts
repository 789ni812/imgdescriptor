import { NextRequest, NextResponse } from 'next/server';
import { getSharedVotingStore } from '@/lib/stores/sharedVotingStore';

export async function GET(_request: NextRequest) {
  try {
    const votingStore = getSharedVotingStore();
    const session = votingStore.getSession();
    
    if (!session) {
      return NextResponse.json(
        { history: [] },
        { status: 200 }
      );
    }

    const results = votingStore.getResults();
    
    if (!results) {
      return NextResponse.json(
        { history: [] },
        { status: 200 }
      );
    }

    // Convert rounds to history format
    const history = results.rounds.map(round => {
      // Find the winner (fighter with most votes)
      const winner = round.fighters.reduce((prev, current) => 
        (current.voteCount > prev.voteCount) ? current : prev
      );

      return {
        round: round.roundNumber,
        winner: winner.name,
        votes: round.totalVotes,
        timestamp: round.startTime.toISOString(),
        fighters: round.fighters.map(f => ({
          fighterId: f.fighterId,
          name: f.name,
          voteCount: f.voteCount,
          percentage: f.percentage
        }))
      };
    });

    return NextResponse.json(
      { 
        history,
        totalRounds: history.length,
        sessionId: session.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching voting history:', error);
    return NextResponse.json(
      { history: [] },
      { status: 200 }
    );
  }
} 