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
    const round: VoteRound = {
      id: `${id}-round-1`,
      sessionId: id,
      roundNumber: 1,
      status: 'active',
      startTime,
      endTime,
      fighters,
      votes: [],
      totalVotes: 0,
      winner: null
    };
    session = {
      id,
      title,
      description,
      status: 'active',
      startTime,
      endTime,
      rounds: [round],
      totalVotes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    currentRoundIndex = 0;
  }

  function nextRound() {
    if (!session) return;
    const roundNumber = session.rounds.length + 1;
    const newRound: VoteRound = {
      id: `${session.id}-round-${roundNumber}`,
      sessionId: session.id,
      roundNumber,
      status: 'active',
      startTime: session.startTime,
      endTime: session.endTime,
      fighters: session.rounds[0].fighters,
      votes: [],
      totalVotes: 0,
      winner: null
    };
    session.rounds.push(newRound);
    currentRoundIndex = session.rounds.length - 1;
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
    nextRound,
    vote,
    getSession,
    getCurrentRound,
    getResults
  };
}

export { createVotingStore }; 