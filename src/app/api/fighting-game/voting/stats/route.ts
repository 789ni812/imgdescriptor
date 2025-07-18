import { NextRequest, NextResponse } from 'next/server';
import { getSharedVotingStore } from '@/lib/stores/sharedVotingStore';

export async function GET(_request: NextRequest) {
  try {
    const votingStore = getSharedVotingStore();
    const session = votingStore.getSession();
    
    if (!session) {
      return NextResponse.json(
        { stats: {} },
        { status: 200 }
      );
    }

    const results = votingStore.getResults();
    
    if (!results) {
      return NextResponse.json(
        { stats: {} },
        { status: 200 }
      );
    }

    // Aggregate stats across all rounds
    const stats: Record<string, { voteCount: number; percentage: number; rank: number }> = {};
    
    results.rounds.forEach(round => {
      round.fighters.forEach(fighter => {
        if (!stats[fighter.fighterId]) {
          stats[fighter.fighterId] = {
            voteCount: 0,
            percentage: 0,
            rank: 0
          };
        }
        stats[fighter.fighterId].voteCount += fighter.voteCount;
      });
    });

    // Calculate percentages and rankings
    const totalVotes = Object.values(stats).reduce((sum, stat) => sum + stat.voteCount, 0);
    
    Object.keys(stats).forEach(fighterId => {
      if (totalVotes > 0) {
        stats[fighterId].percentage = Math.round((stats[fighterId].voteCount / totalVotes) * 100);
      }
    });

    // Sort by vote count and assign ranks
    const sortedFighters = Object.entries(stats)
      .sort(([, a], [, b]) => b.voteCount - a.voteCount)
      .map(([fighterId], index) => ({ fighterId, rank: index + 1 }));

    sortedFighters.forEach(({ fighterId, rank }) => {
      stats[fighterId].rank = rank;
    });

    return NextResponse.json(
      { 
        stats,
        totalVotes,
        totalRounds: results.rounds.length,
        sessionId: session.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching voting stats:', error);
    return NextResponse.json(
      { stats: {} },
      { status: 200 }
    );
  }
} 