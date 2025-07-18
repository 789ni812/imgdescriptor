import { describe, it, expect, beforeEach } from '@jest/globals';
import { createVotingStore } from './votingStore';
import { VoteSession, VoteRound, FighterVote } from '../types/voting';

describe('Voting Store', () => {
  let store: ReturnType<typeof createVotingStore>;
  let fighters: FighterVote[];

  beforeEach(() => {
    fighters = [
      {
        fighterId: 'fighter-1',
        name: 'Godzilla',
        imageUrl: '/fighters/godzilla.jpg',
        description: 'A giant prehistoric monster',
        stats: { health: 800, strength: 150, agility: 60, defense: 80, luck: 25 }
      },
      {
        fighterId: 'fighter-2',
        name: 'King Kong',
        imageUrl: '/fighters/kingkong.jpg',
        description: 'A giant ape from Skull Island',
        stats: { health: 750, strength: 140, agility: 70, defense: 75, luck: 30 }
      }
    ];
    store = createVotingStore();
  });

  it('should initialize a voting session', () => {
    store.initSession({
      id: 'session-1',
      title: 'Test Vote',
      description: 'Test voting session',
      fighters,
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T10:30:00Z')
    });
    const session = store.getSession();
    expect(session).toBeDefined();
    expect(session?.id).toBe('session-1');
    expect(session?.rounds.length).toBe(1);
    expect(session?.rounds[0].fighters).toHaveLength(2);
  });

  it('should advance to the next round', () => {
    store.initSession({
      id: 'session-1',
      title: 'Test Vote',
      description: 'Test voting session',
      fighters,
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T10:30:00Z')
    });
    store.nextRound();
    const session = store.getSession();
    expect(session?.rounds.length).toBe(2);
    expect(session?.rounds[1].roundNumber).toBe(2);
  });

  it('should record a vote for a fighter', () => {
    store.initSession({
      id: 'session-1',
      title: 'Test Vote',
      description: 'Test voting session',
      fighters,
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T10:30:00Z')
    });
    const voterId = 'user-1';
    store.vote(fighters[0].fighterId, voterId, '127.0.0.1');
    const round = store.getCurrentRound();
    expect(round?.votes.length).toBe(1);
    expect(round?.votes[0].fighterId).toBe(fighters[0].fighterId);
    expect(round?.votes[0].voterId).toBe(voterId);
  });

  it('should return the current round', () => {
    store.initSession({
      id: 'session-1',
      title: 'Test Vote',
      description: 'Test voting session',
      fighters,
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T10:30:00Z')
    });
    const round = store.getCurrentRound();
    expect(round).toBeDefined();
    expect(round?.roundNumber).toBe(1);
  });

  it('should return session results', () => {
    store.initSession({
      id: 'session-1',
      title: 'Test Vote',
      description: 'Test voting session',
      fighters,
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T10:30:00Z')
    });
    store.vote(fighters[0].fighterId, 'user-1', '127.0.0.1');
    const results = store.getResults();
    expect(results).toBeDefined();
    expect(results?.sessionId).toBe('session-1');
    expect(results?.rounds[0].fighters[0].voteCount).toBe(1);
  });
}); 