import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TournamentControls } from './TournamentControls';
import { Tournament, TournamentMatch } from '@/lib/types/tournament';

// Mock the UI components
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, className, variant, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className}
      data-testid={props['data-testid']}
      {...props}
    >
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} data-testid={props['data-testid']} {...props}>
      {children}
    </div>
  )
}));

jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>
}));

jest.mock('@/components/ui/ErrorMessage', () => ({
  ErrorMessage: ({ message, ...props }: any) => (
    <div data-testid={props['data-testid']} className="error-message">
      {message}
    </div>
  )
}));

// Mock fetch
global.fetch = jest.fn();

const mockFighterA = {
  id: 'fighter-1',
  name: 'Fighter A',
  imageUrl: '/fighter-a.jpg',
  description: 'Test fighter A',
  stats: {
    health: 100,
    maxHealth: 100,
    strength: 50,
    luck: 10,
    agility: 30,
    defense: 20,
    age: 25,
    size: 'medium' as const,
    build: 'muscular' as const,
  },
  visualAnalysis: {
    age: 'young',
    size: 'medium',
    build: 'muscular',
    appearance: ['strong'],
    weapons: [],
    armor: [],
  },
  combatHistory: [],
  winLossRecord: { wins: 0, losses: 0, draws: 0 },
  createdAt: new Date().toISOString(),
};

const mockFighterB = {
  id: 'fighter-2',
  name: 'Fighter B',
  imageUrl: '/fighter-b.jpg',
  description: 'Test fighter B',
  stats: {
    health: 100,
    maxHealth: 100,
    strength: 50,
    luck: 10,
    agility: 30,
    defense: 20,
    age: 25,
    size: 'medium' as const,
    build: 'muscular' as const,
  },
  visualAnalysis: {
    age: 'young',
    size: 'medium',
    build: 'muscular',
    appearance: ['strong'],
    weapons: [],
    armor: [],
  },
  combatHistory: [],
  winLossRecord: { wins: 0, losses: 0, draws: 0 },
  createdAt: new Date().toISOString(),
};

const mockFighterC = {
  id: 'fighter-3',
  name: 'Fighter C',
  imageUrl: '/fighter-c.jpg',
  description: 'Test fighter C',
  stats: {
    health: 100,
    maxHealth: 100,
    strength: 50,
    luck: 10,
    agility: 30,
    defense: 20,
    age: 25,
    size: 'medium' as const,
    build: 'muscular' as const,
  },
  visualAnalysis: {
    age: 'young',
    size: 'medium',
    build: 'muscular',
    appearance: ['strong'],
    weapons: [],
    armor: [],
  },
  combatHistory: [],
  winLossRecord: { wins: 0, losses: 0, draws: 0 },
  createdAt: new Date().toISOString(),
};

const mockFighterD = {
  id: 'fighter-4',
  name: 'Fighter D',
  imageUrl: '/fighter-d.jpg',
  description: 'Test fighter D',
  stats: {
    health: 100,
    maxHealth: 100,
    strength: 50,
    luck: 10,
    agility: 30,
    defense: 20,
    age: 25,
    size: 'medium' as const,
    build: 'muscular' as const,
  },
  visualAnalysis: {
    age: 'young',
    size: 'medium',
    build: 'muscular',
    appearance: ['strong'],
    weapons: [],
    armor: [],
  },
  combatHistory: [],
  winLossRecord: { wins: 0, losses: 0, draws: 0 },
  createdAt: new Date().toISOString(),
};

const mockTournament: Tournament = {
  id: 'test-tournament',
  name: 'Test Tournament',
  status: 'setup',
  currentRound: 1,
  createdAt: new Date(),
  fighters: [mockFighterA, mockFighterB, mockFighterC, mockFighterD],
  totalRounds: 2,
  brackets: [
    {
      round: 1,
      matches: [
        {
          id: 'match-1',
          round: 1,
          matchNumber: 1,
          fighterA: mockFighterA,
          fighterB: mockFighterB,
          status: 'pending',
          winner: undefined,
          battleLog: []
        },
        {
          id: 'match-2',
          round: 1,
          matchNumber: 2,
          fighterA: mockFighterC,
          fighterB: mockFighterD,
          status: 'pending',
          winner: undefined,
          battleLog: []
        }
      ]
    }
  ],
  winner: undefined
};

const mockCompletedTournament: Tournament = {
  ...mockTournament,
  status: 'completed',
  winner: mockFighterA,
  brackets: [
    {
      round: 1,
      matches: [
        {
          id: 'match-1',
          round: 1,
          matchNumber: 1,
          fighterA: mockFighterA,
          fighterB: mockFighterB,
          status: 'completed',
          winner: mockFighterA,
          battleLog: []
        }
      ]
    }
  ]
};

describe('TournamentControls', () => {
  const mockOnTournamentUpdated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders tournament controls with correct initial state', () => {
    render(
      <TournamentControls 
        tournament={mockTournament} 
        onTournamentUpdated={mockOnTournamentUpdated} 
      />
    );

    expect(screen.getByTestId('tournament-controls')).toBeInTheDocument();
    expect(screen.getByTestId('tournament-controls-title')).toHaveTextContent('Tournament Controls');
    expect(screen.getByTestId('matches-progress')).toHaveTextContent('0 / 2 matches completed');
    expect(screen.getByTestId('execute-next-match-btn')).toBeInTheDocument();
    expect(screen.getByTestId('automate-match-execution-btn')).toBeInTheDocument();
  });

  it('shows tournament completion message when tournament is completed', () => {
    render(
      <TournamentControls 
        tournament={mockCompletedTournament} 
        onTournamentUpdated={mockOnTournamentUpdated} 
      />
    );

    expect(screen.getByTestId('tournament-complete')).toBeInTheDocument();
    expect(screen.getByTestId('tournament-champion')).toHaveTextContent('Champion: Fighter A');
  });

  it('executes next match successfully', async () => {
    const mockResponse = {
      success: true,
      tournament: mockCompletedTournament,
      match: mockCompletedTournament.brackets[0].matches[0]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse
    });

    render(
      <TournamentControls 
        tournament={mockTournament} 
        onTournamentUpdated={mockOnTournamentUpdated} 
      />
    );

    const executeButton = screen.getByTestId('execute-next-match-btn');
    fireEvent.click(executeButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/tournaments/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: 'test-tournament' })
      });
    });

    expect(mockOnTournamentUpdated).toHaveBeenCalledWith(mockCompletedTournament);
  });

  it('handles automation start and stop correctly', async () => {
    const mockResponse = {
      success: true,
      tournament: mockCompletedTournament,
      match: mockCompletedTournament.brackets[0].matches[0]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse
    });

    render(
      <TournamentControls 
        tournament={mockTournament} 
        onTournamentUpdated={mockOnTournamentUpdated} 
      />
    );

    const automateButton = screen.getByTestId('automate-match-execution-btn');
    fireEvent.click(automateButton);

    // Should show automation in progress
    await waitFor(() => {
      expect(screen.getByTestId('automating-status')).toHaveTextContent('Automating...');
      expect(screen.getByTestId('cancel-automation-btn')).toBeInTheDocument();
    });

    // Should execute match
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/tournaments/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: 'test-tournament' })
      });
    });

    // Should stop automation when tournament is completed
    await waitFor(() => {
      expect(screen.queryByTestId('automating-status')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cancel-automation-btn')).not.toBeInTheDocument();
    });
  });

  it('stops automation when API returns no pending matches', async () => {
    const noMatchesResponse = {
      success: false,
      error: 'No pending matches found'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => noMatchesResponse
    });

    render(
      <TournamentControls 
        tournament={mockTournament} 
        onTournamentUpdated={mockOnTournamentUpdated} 
      />
    );

    const automateButton = screen.getByTestId('automate-match-execution-btn');
    fireEvent.click(automateButton);

    // Should start automation
    await waitFor(() => {
      expect(screen.getByTestId('automating-status')).toHaveTextContent('Automating...');
    });

    // Should stop automation when no matches found
    await waitFor(() => {
      expect(screen.queryByTestId('automating-status')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cancel-automation-btn')).not.toBeInTheDocument();
    });
  });

  it('allows manual cancellation of automation', async () => {
    // Mock a successful response that doesn't complete the tournament
    const mockResponse = {
      success: true,
      tournament: {
        ...mockTournament,
        status: 'in_progress',
        brackets: [
          {
            round: 1,
            matches: [
              {
                ...mockTournament.brackets[0].matches[0],
                status: 'completed',
                winner: mockFighterA
              },
              {
                ...mockTournament.brackets[0].matches[1],
                status: 'pending'
              }
            ]
          }
        ]
      },
      match: mockTournament.brackets[0].matches[0]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse
    });

    render(
      <TournamentControls 
        tournament={mockTournament} 
        onTournamentUpdated={mockOnTournamentUpdated} 
      />
    );

    const automateButton = screen.getByTestId('automate-match-execution-btn');
    fireEvent.click(automateButton);

    // Should show automation in progress
    await waitFor(() => {
      expect(screen.getByTestId('automating-status')).toHaveTextContent('Automating...');
      expect(screen.getByTestId('cancel-automation-btn')).toBeInTheDocument();
    });

    // Cancel automation
    const cancelButton = screen.getByTestId('cancel-automation-btn');
    fireEvent.click(cancelButton);

    // Should stop automation
    await waitFor(() => {
      expect(screen.queryByTestId('automating-status')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cancel-automation-btn')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const errorResponse = {
      success: false,
      error: 'Failed to execute match'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => errorResponse
    });

    render(
      <TournamentControls 
        tournament={mockTournament} 
        onTournamentUpdated={mockOnTournamentUpdated} 
      />
    );

    const executeButton = screen.getByTestId('execute-next-match-btn');
    fireEvent.click(executeButton);

    await waitFor(() => {
      expect(screen.getByTestId('tournament-controls-error')).toHaveTextContent('Failed to execute match');
    });
  });

  it('disables buttons when tournament is completed', () => {
    render(
      <TournamentControls 
        tournament={mockCompletedTournament} 
        onTournamentUpdated={mockOnTournamentUpdated} 
      />
    );

    expect(screen.getByTestId('execute-next-match-btn')).toBeDisabled();
    expect(screen.getByTestId('automate-match-execution-btn')).toBeDisabled();
  });

  it('shows next match information when available', () => {
    render(
      <TournamentControls 
        tournament={mockTournament} 
        onTournamentUpdated={mockOnTournamentUpdated} 
      />
    );

    expect(screen.getByText('Next Match')).toBeInTheDocument();
    expect(screen.getByText('Fighter A vs Fighter B')).toBeInTheDocument();
  });

  it('updates currentTournamentRef when tournament is updated', async () => {
    const mockResponse = {
      success: true,
      tournament: mockCompletedTournament,
      match: mockCompletedTournament.brackets[0].matches[0]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse
    });

    render(
      <TournamentControls 
        tournament={mockTournament} 
        onTournamentUpdated={mockOnTournamentUpdated} 
      />
    );

    const automateButton = screen.getByTestId('automate-match-execution-btn');
    fireEvent.click(automateButton);

    // Should execute match and update tournament
    await waitFor(() => {
      expect(mockOnTournamentUpdated).toHaveBeenCalledWith(mockCompletedTournament);
    });

    // The currentTournamentRef should be updated internally
    // This is tested indirectly by the automation stopping when tournament completes
    await waitFor(() => {
      expect(screen.queryByTestId('automating-status')).not.toBeInTheDocument();
    });
  });
}); 