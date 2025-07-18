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
    // Add more fighters to create multiple rounds
    const moreFighters = [
      ...fighters,
      {
        fighterId: 'fighter-3',
        name: 'Bruce Lee',
        imageUrl: '/fighters/brucelee.jpg',
        description: 'A martial arts master',
        stats: { health: 100, strength: 80, agility: 95, defense: 60, luck: 40 }
      },
      {
        fighterId: 'fighter-4',
        name: 'Chuck Norris',
        imageUrl: '/fighters/chucknorris.jpg',
        description: 'A legendary fighter',
        stats: { health: 120, strength: 90, agility: 85, defense: 70, luck: 35 }
      }
    ];
    
    store.initSession({
      id: 'session-1',
      title: 'Test Vote',
      description: 'Test voting session',
      fighters: moreFighters,
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T10:30:00Z')
    });
    
    // Should have 2 rounds with 4 fighters (2 per round)
    const session = store.getSession();
    expect(session?.rounds.length).toBe(2);
    
    // Advance to next round
    const hasNext = store.hasNextRound();
    expect(hasNext).toBe(true);
    
    const advanced = store.nextRound();
    expect(advanced).toBe(true);
    
    const currentRound = store.getCurrentRound();
    expect(currentRound?.roundNumber).toBe(2);
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