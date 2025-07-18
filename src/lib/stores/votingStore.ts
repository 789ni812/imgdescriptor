import { VoteSession, VoteRound, FighterVote, VoteResult, VoteSessionResults } from '../types/voting';

function createVotingStore() {
  let session: VoteSession | null = null;
  let currentRoundIndex = 0;

  function initSession({ id, title, description, fighters, startTime, endTime }: {
    id: string;
    title: string;
    description: string;
    fighters: FighterVote[];
    startTime: Date;
    endTime: Date;
  }) {
    // Create multiple rounds with pairs of fighters
    const rounds: VoteRound[] = [];
    const fightersPerRound = 2;
    
    for (let i = 0; i < fighters.length; i += fightersPerRound) {
      const roundFighters = fighters.slice(i, i + fightersPerRound);
      const roundNumber = Math.floor(i / fightersPerRound) + 1;
      
      const round: VoteRound = {
        id: `${id}-round-${roundNumber}`,
        sessionId: id,
        roundNumber,
        status: i === 0 ? 'active' : 'pending', // Only first round is active
        startTime,
        endTime,
        fighters: roundFighters,
        votes: [],
        totalVotes: 0,
        winner: null
      };
      rounds.push(round);
    }
    
    session = {
      id,
      title,
      description,
      status: 'active',
      startTime,
      endTime,
      rounds,
      totalVotes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    currentRoundIndex = 0;
  }

  function restoreSession(savedSession: VoteSession) {
    session = savedSession;
    // Find the active round index
    currentRoundIndex = session.rounds.findIndex(round => round.status === 'active');
    if (currentRoundIndex === -1) {
      // If no active round found, start with the first round
      currentRoundIndex = 0;
    }
    console.log(`Restored session - active round: ${currentRoundIndex + 1}, fighters:`, session.rounds[currentRoundIndex]?.fighters.map(f => f.fighterId));
  }

  function nextRound() {
    if (!session) return false;
    
    console.log(`Advancing from round ${currentRoundIndex + 1} to ${currentRoundIndex + 2}`);
    console.log('Current round fighters:', session.rounds[currentRoundIndex]?.fighters.map(f => f.fighterId));
    
    // Mark current round as completed
    if (session.rounds[currentRoundIndex]) {
      session.rounds[currentRoundIndex].status = 'completed';
    }
    
    // Move to next round
    currentRoundIndex++;
    
    // Check if there are more rounds
    if (currentRoundIndex < session.rounds.length) {
      session.rounds[currentRoundIndex].status = 'active';
      console.log('New round fighters:', session.rounds[currentRoundIndex].fighters.map(f => f.fighterId));
      return true; // Successfully advanced
    } else {
      // All rounds completed
      session.status = 'completed';
      return false; // No more rounds
    }
  }

  function hasNextRound() {
    if (!session) return false;
    return currentRoundIndex + 1 < session.rounds.length;
  }

  function vote(fighterId: string, voterId: string, ipAddress: string) {
    if (!session) return;
    const round = session.rounds[currentRoundIndex];
    const vote: VoteResult = {
      id: `${round.id}-vote-${round.votes.length + 1}`,
      roundId: round.id,
      sessionId: session.id,
      fighterId,
      voterId,
      timestamp: new Date(),
      ipAddress
    };
    round.votes.push(vote);
    round.totalVotes++;
    session.totalVotes++;
  }

  function getSession() {
    return session;
  }

  function getCurrentRound() {
    if (!session) return null;
    return session.rounds[currentRoundIndex];
  }

  function getResults(): VoteSessionResults | null {
    if (!session) return null;
    return {
      sessionId: session.id,
      title: session.title,
      status: session.status,
      totalVotes: session.totalVotes,
      rounds: session.rounds.map((round) => ({
        roundId: round.id,
        sessionId: round.sessionId,
        roundNumber: round.roundNumber,
        status: round.status,
        startTime: round.startTime,
        endTime: round.endTime,
        fighters: round.fighters.map((f) => ({
          fighterId: f.fighterId,
          name: f.name,
          imageUrl: f.imageUrl,
          voteCount: round.votes.filter(v => v.fighterId === f.fighterId).length,
          percentage: round.votes.length > 0 ? (round.votes.filter(v => v.fighterId === f.fighterId).length / round.votes.length) * 100 : 0
        })),
        totalVotes: round.totalVotes,
        winner: round.winner
      })),
      finalWinner: null
    };
  }

  return {
    initSession,
    restoreSession,
    nextRound,
    hasNextRound,
    vote,
    getSession,
    getCurrentRound,
    getResults
  };
}

export { createVotingStore }; 