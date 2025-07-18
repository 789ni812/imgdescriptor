import { VotingIntegrationService, FighterVotingData, EnhancedFighterData } from './votingIntegrationService';
import { VoteSessionResults, VoteRoundResults, FighterVoteStats } from '../types/voting';

// Mock the file system operations
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  readdir: jest.fn()
}));

describe('VotingIntegrationService', () => {
  let service: VotingIntegrationService;
  let mockReadFile: jest.MockedFunction<any>;
  let mockWriteFile: jest.MockedFunction<any>;
  let mockReaddir: jest.MockedFunction<any>;

  beforeEach(() => {
    service = new VotingIntegrationService();
    mockReadFile = require('fs/promises').readFile;
    mockWriteFile = require('fs/promises').writeFile;
    mockReaddir = require('fs/promises').readdir;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateFighterVotingStats', () => {
    it('should calculate correct voting statistics for a fighter', () => {
      const mockVotingResults: VoteSessionResults = {
        sessionId: 'test-session-1',
        title: 'Test Voting Session',
        status: 'completed',
        totalVotes: 20,
        rounds: [
          {
            roundId: 'round-1',
            sessionId: 'test-session-1',
            roundNumber: 1,
            status: 'completed',
            startTime: new Date('2024-01-01T10:00:00Z'),
            endTime: new Date('2024-01-01T10:30:00Z'),
            fighters: [
              {
                fighterId: 'fighter-1',
                name: 'Test Fighter 1',
                imageUrl: '/test1.jpg',
                voteCount: 12,
                percentage: 60
              },
              {
                fighterId: 'fighter-2',
                name: 'Test Fighter 2',
                imageUrl: '/test2.jpg',
                voteCount: 8,
                percentage: 40
              }
            ],
            totalVotes: 20,
            winner: {
              fighterId: 'fighter-1',
              name: 'Test Fighter 1',
              imageUrl: '/test1.jpg',
              description: 'Test fighter',
              stats: { health: 100, strength: 50, agility: 50, defense: 50, luck: 50 }
            }
          },
          {
            roundId: 'round-2',
            sessionId: 'test-session-1',
            roundNumber: 2,
            status: 'completed',
            startTime: new Date('2024-01-01T11:00:00Z'),
            endTime: new Date('2024-01-01T11:30:00Z'),
            fighters: [
              {
                fighterId: 'fighter-1',
                name: 'Test Fighter 1',
                imageUrl: '/test1.jpg',
                voteCount: 15,
                percentage: 75
              },
              {
                fighterId: 'fighter-3',
                name: 'Test Fighter 3',
                imageUrl: '/test3.jpg',
                voteCount: 5,
                percentage: 25
              }
            ],
            totalVotes: 20,
            winner: {
              fighterId: 'fighter-1',
              name: 'Test Fighter 1',
              imageUrl: '/test1.jpg',
              description: 'Test fighter',
              stats: { health: 100, strength: 50, agility: 50, defense: 50, luck: 50 }
            }
          }
        ],
        finalWinner: {
          fighterId: 'fighter-1',
          name: 'Test Fighter 1',
          imageUrl: '/test1.jpg',
          description: 'Test fighter',
          stats: { health: 100, strength: 50, agility: 50, defense: 50, luck: 50 }
        }
      };

      // Use private method through any type assertion for testing
      const result = (service as any).calculateFighterVotingStats('fighter-1', mockVotingResults);

      expect(result).toBeDefined();
      expect(result.totalVotes).toBe(27); // 12 + 15
      expect(result.totalWins).toBe(2);
      expect(result.totalLosses).toBe(0);
      expect(result.winRate).toBe(1.0);
      // crowdFavorite depends on popularity score calculation
      expect(result.popularityScore).toBeGreaterThan(0);
      expect(result.crowdFavorite).toBeDefined();
      expect(result.votingHistory).toHaveLength(2);
      expect(result.votingHistory[0].roundNumber).toBe(1);
      expect(result.votingHistory[0].voteCount).toBe(12);
      expect(result.votingHistory[0].won).toBe(true);
      expect(result.votingHistory[1].roundNumber).toBe(2);
      expect(result.votingHistory[1].voteCount).toBe(15);
      expect(result.votingHistory[1].won).toBe(true);
    });

    it('should return null for fighter not in voting session', () => {
      const mockVotingResults: VoteSessionResults = {
        sessionId: 'test-session-1',
        title: 'Test Voting Session',
        status: 'completed',
        totalVotes: 20,
        rounds: [
          {
            roundId: 'round-1',
            sessionId: 'test-session-1',
            roundNumber: 1,
            status: 'completed',
            startTime: new Date('2024-01-01T10:00:00Z'),
            endTime: new Date('2024-01-01T10:30:00Z'),
            fighters: [
              {
                fighterId: 'fighter-1',
                name: 'Test Fighter 1',
                imageUrl: '/test1.jpg',
                voteCount: 12,
                percentage: 60
              }
            ],
            totalVotes: 20,
            winner: null
          }
        ],
        finalWinner: null
      };

      const result = (service as any).calculateFighterVotingStats('fighter-999', mockVotingResults);
      expect(result).toBeNull();
    });
  });

  describe('calculatePopularityScore', () => {
    it('should calculate popularity score correctly', () => {
      const mockVotingHistory: FighterVotingData['votingHistory'] = [
        {
          sessionId: 'session-1',
          roundNumber: 1,
          voteCount: 50,
          totalVotesInRound: 100,
          percentage: 50,
          won: true,
          date: '2024-01-01T10:00:00Z'
        },
        {
          sessionId: 'session-1',
          roundNumber: 2,
          voteCount: 60,
          totalVotesInRound: 100,
          percentage: 60,
          won: true,
          date: '2024-01-01T11:00:00Z'
        }
      ];

      const result = (service as any).calculatePopularityScore(110, 1.0, mockVotingHistory);
      
      // Expected calculation:
      // voteScore = min(110/100, 1) = 1.0
      // winRateScore = 1.0
      // consistencyBonus = min(2/5, 0.2) = 0.2
      // recentBonus = 55/100 = 0.55
      // popularityScore = (1.0 * 0.4) + (1.0 * 0.3) + 0.2 + (0.55 * 0.1) = 0.4 + 0.3 + 0.2 + 0.055 = 0.955
      
      expect(result).toBeCloseTo(0.955, 3);
    });
  });

  describe('calculateVotingTrend', () => {
    it('should identify rising trend', () => {
      const mockVotingHistory: FighterVotingData['votingHistory'] = [
        {
          sessionId: 'session-1',
          roundNumber: 1,
          voteCount: 30,
          totalVotesInRound: 100,
          percentage: 30,
          won: false,
          date: '2024-01-01T10:00:00Z'
        },
        {
          sessionId: 'session-1',
          roundNumber: 2,
          voteCount: 50,
          totalVotesInRound: 100,
          percentage: 50,
          won: true,
          date: '2024-01-01T11:00:00Z'
        }
      ];

      const result = (service as any).calculateVotingTrend(mockVotingHistory);
      expect(result).toBe('rising');
    });

    it('should identify falling trend', () => {
      const mockVotingHistory: FighterVotingData['votingHistory'] = [
        {
          sessionId: 'session-1',
          roundNumber: 1,
          voteCount: 70,
          totalVotesInRound: 100,
          percentage: 70,
          won: true,
          date: '2024-01-01T10:00:00Z'
        },
        {
          sessionId: 'session-1',
          roundNumber: 2,
          voteCount: 40,
          totalVotesInRound: 100,
          percentage: 40,
          won: false,
          date: '2024-01-01T11:00:00Z'
        }
      ];

      const result = (service as any).calculateVotingTrend(mockVotingHistory);
      expect(result).toBe('falling');
    });

    it('should identify stable trend', () => {
      const mockVotingHistory: FighterVotingData['votingHistory'] = [
        {
          sessionId: 'session-1',
          roundNumber: 1,
          voteCount: 50,
          totalVotesInRound: 100,
          percentage: 50,
          won: true,
          date: '2024-01-01T10:00:00Z'
        },
        {
          sessionId: 'session-1',
          roundNumber: 2,
          voteCount: 52,
          totalVotesInRound: 100,
          percentage: 52,
          won: true,
          date: '2024-01-01T11:00:00Z'
        }
      ];

      const result = (service as any).calculateVotingTrend(mockVotingHistory);
      expect(result).toBe('stable');
    });
  });

  describe('getAllFightersWithVotingData', () => {
    it('should return fighters sorted by popularity score', async () => {
      const mockFighterFiles = ['fighter1.json', 'fighter2.json', 'fighter3.json'];
      mockReaddir.mockResolvedValue(mockFighterFiles);

      const mockFighterData: EnhancedFighterData[] = [
        {
          id: 'fighter-1',
          name: 'Fighter 1',
          image: 'fighter1.jpg',
          stats: { health: 100, strength: 50, agility: 50, defense: 50, luck: 50 },
          votingData: {
            totalVotes: 50,
            totalWins: 2,
            totalLosses: 0,
            winRate: 1.0,
            popularityScore: 0.8,
            votingHistory: [],
            recentVotingTrend: 'rising',
            crowdFavorite: true
          }
        },
        {
          id: 'fighter-2',
          name: 'Fighter 2',
          image: 'fighter2.jpg',
          stats: { health: 100, strength: 50, agility: 50, defense: 50, luck: 50 },
          votingData: {
            totalVotes: 30,
            totalWins: 1,
            totalLosses: 1,
            winRate: 0.5,
            popularityScore: 0.6,
            votingHistory: [],
            recentVotingTrend: 'stable',
            crowdFavorite: false
          }
        },
        {
          id: 'fighter-3',
          name: 'Fighter 3',
          image: 'fighter3.jpg',
          stats: { health: 100, strength: 50, agility: 50, defense: 50, luck: 50 },
          votingData: {
            totalVotes: 20,
            totalWins: 0,
            totalLosses: 2,
            winRate: 0.0,
            popularityScore: 0.3,
            votingHistory: [],
            recentVotingTrend: 'falling',
            crowdFavorite: false
          }
        }
      ];

      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockFighterData[0]))
        .mockResolvedValueOnce(JSON.stringify(mockFighterData[1]))
        .mockResolvedValueOnce(JSON.stringify(mockFighterData[2]));

      const result = await service.getAllFightersWithVotingData();

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('fighter-1'); // Highest popularity score
      expect(result[1].id).toBe('fighter-2'); // Medium popularity score
      expect(result[2].id).toBe('fighter-3'); // Lowest popularity score
    });
  });
}); 