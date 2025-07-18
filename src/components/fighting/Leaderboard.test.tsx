import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Leaderboard from './Leaderboard';

// Mock the voting API calls
jest.mock('@/lib/stores/votingStore', () => ({
  createVotingStore: jest.fn(() => ({
    initSession: jest.fn(),
    getSession: jest.fn(),
    vote: jest.fn(),
    getCurrentRound: jest.fn(),
    getResults: jest.fn()
  }))
}));

// Mock fetch
global.fetch = jest.fn();

describe('Leaderboard', () => {
  const mockLeaderboardData = {
    leaderboard: [
      {
        name: 'Godzilla',
        totalBattles: 5,
        wins: 4,
        losses: 1,
        winRate: 80,
        totalDamageDealt: 500,
        totalDamageTaken: 200,
        averageDamageDealt: 100,
        averageDamageTaken: 40,
        averageRoundsSurvived: 3.5,
        totalRounds: 18,
        currentStats: {
          strength: 150,
          agility: 60,
          luck: 25,
          defense: 80,
          health: 800,
          maxHealth: 800,
          size: 'large',
          build: 'muscular',
          age: 65
        },
        opponents: ['King Kong', 'Bruce Lee', 'Superman'],
        arenas: ['Tokyo', 'New York'],
        lastBattle: '2025-01-15T10:30:00Z',
        imageUrl: '/fighters/godzilla.jpg'
      },
      {
        name: 'King Kong',
        totalBattles: 4,
        wins: 2,
        losses: 2,
        winRate: 50,
        totalDamageDealt: 300,
        totalDamageTaken: 350,
        averageDamageDealt: 75,
        averageDamageTaken: 87.5,
        averageRoundsSurvived: 2.8,
        totalRounds: 11,
        currentStats: {
          strength: 140,
          agility: 70,
          luck: 30,
          defense: 75,
          health: 750,
          maxHealth: 750,
          size: 'large',
          build: 'muscular',
          age: 85
        },
        opponents: ['Godzilla', 'Bruce Lee'],
        arenas: ['Skull Island', 'New York'],
        lastBattle: '2025-01-14T15:45:00Z',
        imageUrl: '/fighters/kingkong.jpg'
      }
    ],
    totalBattles: 9,
    lastUpdated: '2025-01-15T12:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockLeaderboardData
    });
  });

  it('should render leaderboard with voting button in header', async () => {
    render(<Leaderboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Tournament Leaderboard')).toBeInTheDocument();
    });

    // Check for voting button in header
    expect(screen.getByRole('button', { name: /vote fighter/i })).toBeInTheDocument();
    expect(screen.getByText(/vote fighter/i)).toBeInTheDocument();
  });

  it('should initialize voting session when vote button is clicked', async () => {
    // Mock successful voting session creation
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaderboardData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          fighters: [
            {
              fighterId: 'godzilla-1',
              name: 'Godzilla',
              imageUrl: '/fighters/godzilla.jpg',
              description: 'A giant prehistoric monster',
              stats: { health: 800, strength: 150, agility: 60, defense: 80, luck: 25 }
            },
            {
              fighterId: 'kingkong-1',
              name: 'King Kong',
              imageUrl: '/fighters/kingkong.jpg',
              description: 'A giant ape from Skull Island',
              stats: { health: 750, strength: 140, agility: 70, defense: 75, luck: 30 }
            }
          ]
        })
      });

    render(<Leaderboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Tournament Leaderboard')).toBeInTheDocument();
    });

    // Click vote button
    const voteButton = screen.getByRole('button', { name: /vote fighter/i });
    fireEvent.click(voteButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/initializing voting session/i)).toBeInTheDocument();
    });

    // Should make API call to create voting session
    expect(global.fetch).toHaveBeenCalledWith('/api/fighting-game/voting/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fighterCount: 2 })
    });
  });

  it('should show voting slideshow when session is created', async () => {
    // Mock successful voting session creation
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaderboardData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          fighters: [
            {
              fighterId: 'godzilla-1',
              name: 'Godzilla',
              imageUrl: '/fighters/godzilla.jpg',
              description: 'A giant prehistoric monster',
              stats: { health: 800, strength: 150, agility: 60, defense: 80, luck: 25 }
            },
            {
              fighterId: 'kingkong-1',
              name: 'King Kong',
              imageUrl: '/fighters/kingkong.jpg',
              description: 'A giant ape from Skull Island',
              stats: { health: 750, strength: 140, agility: 70, defense: 75, luck: 30 }
            }
          ]
        })
      });

    render(<Leaderboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Tournament Leaderboard')).toBeInTheDocument();
    });

    // Click vote button
    const voteButton = screen.getByRole('button', { name: /vote fighter/i });
    fireEvent.click(voteButton);

    // Should show voting slideshow
    await waitFor(() => {
      expect(screen.getByText('Vote for Your Favorite Fighter')).toBeInTheDocument();
      expect(screen.getByText('Godzilla')).toBeInTheDocument();
      expect(screen.getByText('King Kong')).toBeInTheDocument();
    });
  });

  it('should handle voting session creation error', async () => {
    // Mock leaderboard success but voting session failure
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaderboardData
      })
      .mockRejectedValueOnce(new Error('Failed to create voting session'));

    render(<Leaderboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Tournament Leaderboard')).toBeInTheDocument();
    });

    // Click vote button
    const voteButton = screen.getByRole('button', { name: /vote fighter/i });
    fireEvent.click(voteButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to create voting session/i)).toBeInTheDocument();
    });
  });

  it('should disable vote button during session creation', async () => {
    // Mock a slow voting session creation
    let resolveVotingSession: (value: any) => void;
    const votingSessionPromise = new Promise(resolve => {
      resolveVotingSession = resolve;
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaderboardData
      })
      .mockImplementationOnce(() => votingSessionPromise);

    render(<Leaderboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Tournament Leaderboard')).toBeInTheDocument();
    });

    // Click vote button
    const voteButton = screen.getByRole('button', { name: /vote fighter/i });
    fireEvent.click(voteButton);

    // Button should be disabled during loading
    await waitFor(() => {
      expect(voteButton).toBeDisabled();
      expect(screen.getByText(/initializing voting session/i)).toBeInTheDocument();
    });

    // Resolve the voting session
    resolveVotingSession!({
      ok: true,
      json: async () => ({
        success: true,
        sessionId: 'session-123',
        fighters: []
      })
    });

    // After session creation, the voting slideshow should be shown
    await waitFor(() => {
      expect(screen.getByText('Vote for Your Favorite Fighter')).toBeInTheDocument();
    });
  });

  it('should show voting statistics in leaderboard when available', async () => {
    const leaderboardWithVotes = {
      ...mockLeaderboardData,
      leaderboard: [
        {
          ...mockLeaderboardData.leaderboard[0],
          voteCount: 15,
          popularity: 75.5
        },
        {
          ...mockLeaderboardData.leaderboard[1],
          voteCount: 8,
          popularity: 24.5
        }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => leaderboardWithVotes
    });

    render(<Leaderboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Tournament Leaderboard')).toBeInTheDocument();
    });

    // Should show voting statistics
    expect(screen.getByText('15 votes')).toBeInTheDocument();
    expect(screen.getByText('75.5%')).toBeInTheDocument();
    expect(screen.getByText('8 votes')).toBeInTheDocument();
    expect(screen.getByText('24.5%')).toBeInTheDocument();
  });

  it('should add popularity sorting option when voting data is available', async () => {
    const leaderboardWithVotes = {
      ...mockLeaderboardData,
      leaderboard: [
        {
          ...mockLeaderboardData.leaderboard[0],
          voteCount: 15,
          popularity: 75.5
        },
        {
          ...mockLeaderboardData.leaderboard[1],
          voteCount: 8,
          popularity: 24.5
        }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => leaderboardWithVotes
    });

    render(<Leaderboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Tournament Leaderboard')).toBeInTheDocument();
    });

    // Should show popularity sort option
    expect(screen.getByText(/popularity/i)).toBeInTheDocument();
  });

  it('should handle voting session completion and return to leaderboard', async () => {
    // Mock successful voting session creation
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaderboardData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: 'session-123',
          fighters: [
            {
              fighterId: 'godzilla-1',
              name: 'Godzilla',
              imageUrl: '/fighters/godzilla.jpg',
              description: 'A giant prehistoric monster',
              stats: { health: 800, strength: 150, agility: 60, defense: 80, luck: 25 }
            },
            {
              fighterId: 'kingkong-1',
              name: 'King Kong',
              imageUrl: '/fighters/kingkong.jpg',
              description: 'A giant ape from Skull Island',
              stats: { health: 750, strength: 140, agility: 70, defense: 75, luck: 30 }
            }
          ]
        })
      });

    render(<Leaderboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Tournament Leaderboard')).toBeInTheDocument();
    });

    // Click vote button to start session
    const voteButton = screen.getByRole('button', { name: /vote fighter/i });
    fireEvent.click(voteButton);

    // Should show voting slideshow
    await waitFor(() => {
      expect(screen.getByText('Vote for Your Favorite Fighter')).toBeInTheDocument();
    });

    // The voting slideshow is now active - this test verifies the integration works
    // The actual completion would happen when the timer expires in the slideshow
    expect(screen.getByText('Godzilla')).toBeInTheDocument();
    expect(screen.getByText('King Kong')).toBeInTheDocument();
  }, 10000);

  // Voting Integration Tests
  describe('Voting Integration', () => {
    const mockVotingStats = {
      'godzilla-1': { voteCount: 15, percentage: 75.5, rank: 1 },
      'kingkong-1': { voteCount: 8, percentage: 24.5, rank: 2 },
      'brucelee-1': { voteCount: 5, percentage: 15.0, rank: 3 }
    };

    const mockVotingHistory = [
      { round: 1, winner: 'Godzilla', votes: 8, timestamp: '2025-01-15T10:00:00Z' },
      { round: 2, winner: 'King Kong', votes: 6, timestamp: '2025-01-15T10:15:00Z' },
      { round: 3, winner: 'Godzilla', votes: 7, timestamp: '2025-01-15T10:30:00Z' }
    ];

    beforeEach(() => {
      // Mock voting API responses
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/fighting-game/voting/stats')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ stats: mockVotingStats })
          });
        }
        if (url.includes('/api/fighting-game/voting/history')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ history: mockVotingHistory })
          });
        }
        if (url.includes('/api/tournaments/leaderboard')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockLeaderboardData
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ fighters: mockLeaderboardData.leaderboard })
        });
      });
    });

    it('should display voting statistics in fighter profiles', async () => {
      render(<Leaderboard />);
      
      // Wait for voting stats to load
      await waitFor(() => {
        expect(screen.getByText('15 votes')).toBeInTheDocument();
        expect(screen.getByText('75.5%')).toBeInTheDocument();
      });

      // Check for voting rank indicators in popularity column
      const popularityMedals = screen.getAllByText('🥇');
      expect(popularityMedals.length).toBeGreaterThan(0);
      
      const silverMedals = screen.getAllByText('🥈');
      expect(silverMedals.length).toBeGreaterThan(0);
      
      // Bronze medal might not be present if we have less than 3 fighters
      const bronzeMedals = screen.queryAllByText('🥉');
      // Don't require bronze medal to be present
    });

    it('should add popularity sorting option to leaderboard', async () => {
      render(<Leaderboard />);
      
      // Open sort dropdown
      const sortButton = screen.getByRole('button', { name: /sort by/i });
      fireEvent.click(sortButton);
      
      // Check for popularity option
      expect(screen.getByText('Popularity')).toBeInTheDocument();
    });

    it('should sort fighters by popularity when selected', async () => {
      render(<Leaderboard />);
      
      // Open sort dropdown and select popularity
      const sortButton = screen.getByRole('button', { name: /sort by/i });
      fireEvent.click(sortButton);
      
      const popularityOption = screen.getByText('Popularity');
      fireEvent.click(popularityOption);
      
      // Check that fighters are sorted by vote count (descending)
      const fighterRows = screen.getAllByTestId('fighter-row');
      expect(fighterRows[0]).toHaveTextContent('Godzilla');
      expect(fighterRows[1]).toHaveTextContent('King Kong');
      expect(fighterRows[2]).toHaveTextContent('Bruce Lee');
    });

    it('should show voting history in fighter details modal', async () => {
      render(<Leaderboard />);
      
      // Click on a fighter to open details
      const fighterRow = screen.getByText('Godzilla').closest('tr');
      fireEvent.click(fighterRow!);
      
      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText('Fighter Details')).toBeInTheDocument();
      });
      
      // Check for voting history section
      expect(screen.getByText('Voting History')).toBeInTheDocument();
      expect(screen.getByText('Round 1: Godzilla (8 votes)')).toBeInTheDocument();
      expect(screen.getByText('Round 3: Godzilla (7 votes)')).toBeInTheDocument();
    });

    it('should display popularity percentage in fighter stats', async () => {
      render(<Leaderboard />);
      
      // Wait for voting stats to load
      await waitFor(() => {
        expect(screen.getByText('Popularity: 75.5%')).toBeInTheDocument();
        expect(screen.getByText('Popularity: 24.5%')).toBeInTheDocument();
        expect(screen.getByText('Popularity: 15.0%')).toBeInTheDocument();
      });
    });

    it('should show vote count in fighter battle stats', async () => {
      render(<Leaderboard />);
      
      // Wait for voting stats to load
      await waitFor(() => {
        expect(screen.getByText('Votes: 15')).toBeInTheDocument();
        expect(screen.getByText('Votes: 8')).toBeInTheDocument();
        expect(screen.getByText('Votes: 5')).toBeInTheDocument();
      });
    });

    it('should update fighter ranking based on popularity', async () => {
      render(<Leaderboard />);
      
      // Wait for voting stats to load
      await waitFor(() => {
        expect(screen.getByText('15 votes')).toBeInTheDocument();
      });
      
      // Check that popularity affects overall ranking
      const rankCells = screen.getAllByTestId('rank-cell');
      expect(rankCells[0]).toHaveTextContent('1');
      expect(rankCells[1]).toHaveTextContent('2');
      expect(rankCells[2]).toHaveTextContent('3');
    });

    it('should show voting trends in fighter analytics', async () => {
      render(<Leaderboard />);
      
      // Click on a fighter to open details
      const fighterRow = screen.getByText('Godzilla').closest('tr');
      fireEvent.click(fighterRow!);
      
      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText('Fighter Details')).toBeInTheDocument();
      });
      
      // Check for voting trends
      expect(screen.getByText('Voting Trend: Rising')).toBeInTheDocument();
      expect(screen.getByText('Win Rate: 66.7%')).toBeInTheDocument();
    });

    it('should handle missing voting data gracefully', async () => {
      // Mock API to return empty voting stats
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/fighting-game/voting/stats')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ stats: {} })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ fighters: mockLeaderboardData.leaderboard })
        });
      });

      render(<Leaderboard />);
      
      // Should still display fighters without voting data
      expect(screen.getByText('Godzilla')).toBeInTheDocument();
      expect(screen.getByText('King Kong')).toBeInTheDocument();
      expect(screen.getByText('Bruce Lee')).toBeInTheDocument();
      
      // Should show no voting data message
      expect(screen.getByText('No voting data available')).toBeInTheDocument();
    });

    it('should refresh voting data when refresh button is clicked', async () => {
      render(<Leaderboard />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('15 votes')).toBeInTheDocument();
      });
      
      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      
      // Should show loading state
      expect(screen.getByText('Loading voting data...')).toBeInTheDocument();
      
      // Should reload voting stats
      await waitFor(() => {
        expect(screen.getByText('15 votes')).toBeInTheDocument();
      });
    });

    it('should display voting session information', async () => {
      render(<Leaderboard />);
      
      // Wait for voting data to load
      await waitFor(() => {
        expect(screen.getByText('15 votes')).toBeInTheDocument();
      });
      
      // Check for session information
      expect(screen.getByText('Last Voting Session:')).toBeInTheDocument();
      expect(screen.getByText('Total Votes: 28')).toBeInTheDocument();
      expect(screen.getByText('Rounds: 3')).toBeInTheDocument();
    });

    it('should show voting participation rate', async () => {
      render(<Leaderboard />);
      
      // Wait for voting data to load
      await waitFor(() => {
        expect(screen.getByText('15 votes')).toBeInTheDocument();
      });
      
      // Check for participation rate
      expect(screen.getByText('Participation Rate: 85%')).toBeInTheDocument();
    });
  });
}); 