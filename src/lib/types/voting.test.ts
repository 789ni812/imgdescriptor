import { describe, it, expect } from '@jest/globals';
import { 
  VoteSession, 
  VoteRound, 
  VoteResult, 
  FighterVote, 
  VoteSessionStatus,
  VoteRoundStatus 
} from './voting';

describe('Voting Types', () => {
  describe('VoteSession', () => {
    it('should have required properties for a voting session', () => {
      const session: VoteSession = {
        id: 'session-123',
        title: 'Weekly Fighter Vote',
        description: 'Vote for your favorite fighters',
        status: 'active',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T10:30:00Z'),
        rounds: [],
        totalVotes: 0,
        createdAt: new Date('2024-01-01T09:00:00Z'),
        updatedAt: new Date('2024-01-01T09:00:00Z')
      };

      expect(session.id).toBe('session-123');
      expect(session.title).toBe('Weekly Fighter Vote');
      expect(session.status).toBe('active');
      expect(session.rounds).toEqual([]);
      expect(session.totalVotes).toBe(0);
    });

    it('should allow completed status', () => {
      const session: VoteSession = {
        id: 'session-456',
        title: 'Completed Vote',
        description: 'A completed voting session',
        status: 'completed',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T10:30:00Z'),
        rounds: [],
        totalVotes: 150,
        createdAt: new Date('2024-01-01T09:00:00Z'),
        updatedAt: new Date('2024-01-01T10:30:00Z')
      };

      expect(session.status).toBe('completed');
      expect(session.totalVotes).toBe(150);
    });
  });

  describe('VoteRound', () => {
    it('should have required properties for a voting round', () => {
      const round: VoteRound = {
        id: 'round-123',
        sessionId: 'session-123',
        roundNumber: 1,
        status: 'active',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T10:30:00Z'),
        fighters: [
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
        ],
        votes: [],
        totalVotes: 0,
        winner: null
      };

      expect(round.id).toBe('round-123');
      expect(round.sessionId).toBe('session-123');
      expect(round.roundNumber).toBe(1);
      expect(round.status).toBe('active');
      expect(round.fighters).toHaveLength(2);
      expect(round.votes).toEqual([]);
      expect(round.winner).toBeNull();
    });

    it('should allow completed status with winner', () => {
      const round: VoteRound = {
        id: 'round-456',
        sessionId: 'session-123',
        roundNumber: 1,
        status: 'completed',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T10:30:00Z'),
        fighters: [
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
        ],
        votes: [],
        totalVotes: 85,
        winner: { 
          fighterId: 'fighter-1', 
          name: 'Godzilla', 
          imageUrl: '/fighters/godzilla.jpg',
          description: 'A giant prehistoric monster',
          stats: { health: 800, strength: 150, agility: 60, defense: 80, luck: 25 }
        }
      };

      expect(round.status).toBe('completed');
      expect(round.winner).toEqual({ 
        fighterId: 'fighter-1', 
        name: 'Godzilla', 
        imageUrl: '/fighters/godzilla.jpg',
        description: 'A giant prehistoric monster',
        stats: { health: 800, strength: 150, agility: 60, defense: 80, luck: 25 }
      });
    });
  });

  describe('FighterVote', () => {
    it('should have required properties for a fighter in voting', () => {
      const fighterVote: FighterVote = {
        fighterId: 'fighter-123',
        name: 'Mega Dragon',
        imageUrl: '/fighters/mega-dragon.jpg',
        description: 'A fearsome dragon with fire breath',
        stats: {
          health: 800,
          strength: 150,
          agility: 60,
          defense: 80,
          luck: 25
        }
      };

      expect(fighterVote.fighterId).toBe('fighter-123');
      expect(fighterVote.name).toBe('Mega Dragon');
      expect(fighterVote.imageUrl).toBe('/fighters/mega-dragon.jpg');
      expect(fighterVote.stats.health).toBe(800);
    });
  });

  describe('VoteResult', () => {
    it('should have required properties for vote results', () => {
      const result: VoteResult = {
        id: 'result-123',
        roundId: 'round-123',
        sessionId: 'session-123',
        fighterId: 'fighter-1',
        voterId: 'user-456',
        timestamp: new Date('2024-01-01T10:15:00Z'),
        ipAddress: '192.168.1.1'
      };

      expect(result.id).toBe('result-123');
      expect(result.roundId).toBe('round-123');
      expect(result.fighterId).toBe('fighter-1');
      expect(result.voterId).toBe('user-456');
    });
  });

  describe('VoteSessionStatus', () => {
    it('should allow all valid session statuses', () => {
      const statuses: VoteSessionStatus[] = ['active', 'completed', 'cancelled'];
      
      expect(statuses).toContain('active');
      expect(statuses).toContain('completed');
      expect(statuses).toContain('cancelled');
    });
  });

  describe('VoteRoundStatus', () => {
    it('should allow all valid round statuses', () => {
      const statuses: VoteRoundStatus[] = ['pending', 'active', 'completed'];
      
      expect(statuses).toContain('pending');
      expect(statuses).toContain('active');
      expect(statuses).toContain('completed');
    });
  });

  describe('Type Exports', () => {
    it('should export VoteSession interface', () => {
      // Test that we can create an object that matches the interface
      const session: VoteSession = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        status: 'active',
        startTime: new Date(),
        endTime: new Date(),
        rounds: [],
        totalVotes: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      expect(session).toBeDefined();
      expect(session.id).toBe('test');
    });

    it('should export VoteRound interface', () => {
      // Test that we can create an object that matches the interface
      const round: VoteRound = {
        id: 'test',
        sessionId: 'test',
        roundNumber: 1,
        status: 'active',
        startTime: new Date(),
        endTime: new Date(),
        fighters: [],
        votes: [],
        totalVotes: 0,
        winner: null
      };
      expect(round).toBeDefined();
      expect(round.id).toBe('test');
    });

    it('should export VoteResult interface', () => {
      // Test that we can create an object that matches the interface
      const result: VoteResult = {
        id: 'test',
        roundId: 'test',
        sessionId: 'test',
        fighterId: 'test',
        voterId: 'test',
        timestamp: new Date(),
        ipAddress: '127.0.0.1'
      };
      expect(result).toBeDefined();
      expect(result.id).toBe('test');
    });

    it('should export FighterVote interface', () => {
      // Test that we can create an object that matches the interface
      const fighter: FighterVote = {
        fighterId: 'test',
        name: 'Test Fighter',
        imageUrl: '/test.jpg',
        description: 'Test description',
        stats: {
          health: 100,
          strength: 50,
          agility: 50,
          defense: 50,
          luck: 25
        }
      };
      expect(fighter).toBeDefined();
      expect(fighter.fighterId).toBe('test');
    });
  });
}); 