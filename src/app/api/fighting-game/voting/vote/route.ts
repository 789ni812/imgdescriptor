import { NextRequest, NextResponse } from 'next/server';
import { loadVotingStore, saveVotingStore } from '@/lib/stores/fileVotingStore';
import { votingIntegrationService } from '@/lib/services/votingIntegrationService';

export async function POST(request: NextRequest) {
  try {
    const votingStore = await loadVotingStore();
    const body = await request.json();
    const { fighterId, voterId, ipAddress } = body;

    // Validate required fields
    if (!fighterId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: fighterId' },
        { status: 400 }
      );
    }

    // Generate voter ID and IP address if not provided
    const generatedVoterId = voterId || `voter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const generatedIpAddress = ipAddress || '127.0.0.1';

    // Get current round to validate the vote
    const currentRound = votingStore.getCurrentRound();
    const session = votingStore.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No active voting session found. Please create a session first.' },
        { status: 400 }
      );
    }
    
    if (!currentRound) {
      return NextResponse.json(
        { success: false, error: 'No active voting round' },
        { status: 400 }
      );
    }

    // Check if the fighter exists in the current round
    console.log('Vote request - fighterId:', fighterId);
    console.log('Current round fighters:', currentRound.fighters.map(f => ({ fighterId: f.fighterId, name: f.name })));
    
    const fighterExists = currentRound.fighters.some(f => f.fighterId === fighterId);
    if (!fighterExists) {
      console.log('Fighter not found in current round. Available fighterIds:', currentRound.fighters.map(f => f.fighterId));
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid fighter ID for current round',
          requestedFighterId: fighterId,
          availableFighterIds: currentRound.fighters.map(f => f.fighterId)
        },
        { status: 400 }
      );
    }

    // Check for duplicate votes from the same user in the current round
    const hasVoted = currentRound.votes.some(vote => 
      vote.voterId === generatedVoterId && vote.fighterId === fighterId
    );
    if (hasVoted) {
      return NextResponse.json(
        { success: false, error: 'User has already voted for this fighter in this round' },
        { status: 400 }
      );
    }

    // Record the vote
    votingStore.vote(fighterId, generatedVoterId, generatedIpAddress);
    
    // Check if there are more rounds and advance automatically
    const hasMoreRounds = votingStore.hasNextRound();
    let nextRound = null;
    let sessionCompleted = false;
    
    if (hasMoreRounds) {
      const advanced = votingStore.nextRound();
      if (advanced) {
        nextRound = votingStore.getCurrentRound();
      }
    } else {
      // Session is completed - integrate voting data
      sessionCompleted = true;
      try {
        const votingResults = votingStore.getResults();
        if (votingResults) {
          await votingIntegrationService.integrateVotingData(votingResults);
          console.log('Voting data integrated successfully for completed session');
        }
      } catch (error) {
        console.error('Error integrating voting data:', error);
        // Don't fail the vote if integration fails
      }
    }
    
    await saveVotingStore(votingStore);

    // Get updated round data
    const updatedRound = votingStore.getCurrentRound();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Vote recorded successfully',
        round: updatedRound,
        hasMoreRounds,
        nextRound,
        sessionCompleted,
        totalRounds: session?.rounds.length || 1
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