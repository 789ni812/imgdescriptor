import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TournamentPage from './page';
import { Tournament, TournamentMatch } from '@/lib/types/tournament';
import { PreGeneratedBattleRound } from '@/lib/stores/fightingGameStore';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock the components

// Mock the components
jest.mock('@/components/tournament/TournamentCreator', () => ({
  TournamentCreator: ({ onTournamentCreated }: { onTournamentCreated: (tournament: Tournament) => void }) => (
    <div data-testid="tournament-creator">
      <button onClick={() => onTournamentCreated(mockTournamentData)}>Create Tournament</button>
    </div>
  )
}));

jest.mock('@/components/tournament/TournamentList', () => ({
  TournamentList: ({ onTournamentSelect }: { onTournamentSelect: (tournament: Tournament) => void }) => (
    <div data-testid="tournament-list">
      <button onClick={() => onTournamentSelect(mockTournamentData)}>Select Tournament</button>
    </div>
  )
}));

jest.mock('@/components/tournament/TournamentBracket', () => ({
  TournamentBracket: ({ onMatchClick }: { tournament: Tournament; onMatchClick?: (match: TournamentMatch) => void }) => (
    <div data-testid="tournament-bracket">
      <button onClick={() => onMatchClick?.(mockCompletedMatch)}>Click Match</button>
    </div>
  )
}));

jest.mock('@/components/tournament/TournamentControls', () => ({
  TournamentControls: ({ onTournamentUpdated }: { tournament: Tournament; onTournamentUpdated: (tournament: Tournament) => void }) => (
    <div data-testid="tournament-controls">
      <button onClick={() => onTournamentUpdated(mockTournamentData)}>Update Tournament</button>
    </div>
  )
}));

jest.mock('@/components/fighting/BattleViewer', () => ({
  __esModule: true,
  default: ({ onBattleReplayComplete }: { onBattleReplayComplete?: () => void }) => (
    <div data-testid="battle-viewer">
      <button onClick={() => onBattleReplayComplete?.()}>Complete Replay</button>
    </div>
  )
}));

jest.mock('@/components/fighting/WinnerAnimation', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? (
      <div data-testid="winner-animation">
        <button onClick={onClose}>Close Results</button>
      </div>
    ) : null
  )
}));

// Mock data
const mockFighter = {
  id: 'fighter-1',
  name: 'Test Fighter',
  imageUrl: '/test-image.jpg',
  stats: {
    health: 100,
    maxHealth: 100,
    strength: 10,
    luck: 10,
    agility: 10,
    defense: 10,
    age: 25,
    size: 'medium' as const,
    build: 'average' as const,
  },
  description: '',
  visualAnalysis: {
    age: 'unknown',
    size: 'medium',
    build: 'average',
    appearance: [],
    weapons: [],
    armor: []
  },
  combatHistory: [],
  winLossRecord: { wins: 0, losses: 0, draws: 0 },
  createdAt: new Date().toISOString()
};

const mockBattleLog: PreGeneratedBattleRound[] = [
  {
    round: 1,
    attacker: 'Test Fighter',
    defender: 'Test Fighter 2',
    attackCommentary: 'Test attack',
    defenseCommentary: 'Test defense',
    attackerDamage: 10,
    defenderDamage: 5,
    healthAfter: {
      attacker: 95,
      defender: 90
    }
  }
];

const mockCompletedMatch: TournamentMatch = {
  id: 'match-1',
  fighterA: mockFighter,
  fighterB: { ...mockFighter, id: 'fighter-2', name: 'Test Fighter 2' },
  winner: mockFighter,
  battleLog: mockBattleLog,
  status: 'completed',
  round: 1,
  matchNumber: 1
};

const mockTournamentData: Tournament = {
  id: 'tournament-1',
  name: 'Test Tournament',
  createdAt: new Date(),
  status: 'completed',
  fighters: [mockFighter, { ...mockFighter, id: 'fighter-2', name: 'Test Fighter 2' }],
  brackets: [
    {
      round: 1,
      matches: [mockCompletedMatch]
    }
  ],
  currentRound: 1,
  winner: mockFighter,
  totalRounds: 1
};

describe('TournamentPage', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock API responses
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/random-arena')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            name: 'Test Arena',
            description: 'A test arena for battles',
            imageUrl: '/test-arena.jpg'
          })
        });
      }
      
      if (url.includes('/api/fighting-game/generate-fighter-slogans')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            slogans: ['The Test Fighter', 'Ready for battle!', 'Champion material!'],
            description: 'A formidable fighter ready to prove their worth.'
          })
        });
      }
      
      if (url.includes('/api/fighting-game/generate-tournament-commentary')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            commentary: 'The crowd is buzzing with excitement as the fighters prepare to enter the arena!'
          })
        });
      }
      
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
    });
  });

  test('should render tournament list view by default', () => {
    render(<TournamentPage />);
    
    expect(screen.getByTestId('tournament-list')).toBeInTheDocument();
    expect(screen.getByText('🏆 Tournament System')).toBeInTheDocument();
  });

  test('should switch to create tournament view', () => {
    render(<TournamentPage />);
    
    fireEvent.click(screen.getByTestId('create-tournament-btn'));
    
    expect(screen.getByTestId('tournament-creator')).toBeInTheDocument();
  });

  test('should switch to tournament detail view when tournament is selected', () => {
    render(<TournamentPage />);
    
    fireEvent.click(screen.getByText('Select Tournament'));
    
    expect(screen.getByTestId('tournament-detail-view')).toBeInTheDocument();
    expect(screen.getByText('🏆 Test Tournament')).toBeInTheDocument();
  });

  test('should handle tournament match click for completed matches', async () => {
    render(<TournamentPage />);
    
    // Select tournament first
    fireEvent.click(screen.getByText('Select Tournament'));
    
    // Click on a completed match
    fireEvent.click(screen.getByText('Click Match'));
    
    // Should show slideshow first
    await waitFor(() => {
      expect(screen.getByTestId('fighter-slideshow')).toBeInTheDocument();
    });
    
    // Click through slideshow to advance (first fighter)
    fireEvent.click(screen.getByText('Next Fighter'));
    
    // Wait for transition to complete and then click the final button
    await waitFor(() => {
      expect(screen.getByText('Start Battle!')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Start Battle!'));
    
    // Should show commentary after slideshow
    await waitFor(() => {
      expect(screen.getByTestId('tournament-commentary')).toBeInTheDocument();
    });
    
    // Click continue on commentary
    fireEvent.click(screen.getByText('Continue'));
    
    // Should switch to battle replay view
    await waitFor(() => {
      expect(screen.getByTestId('tournament-battle-replay-view')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('tournament-battle-viewer-container')).toBeInTheDocument();
    expect(screen.getByText('Round 1 • Match 1')).toBeInTheDocument();
  });

  test('should show battle viewer when in replay mode', async () => {
    render(<TournamentPage />);
    
    // Select tournament and click match
    fireEvent.click(screen.getByText('Select Tournament'));
    fireEvent.click(screen.getByText('Click Match'));
    
    // Advance through slideshow
    await waitFor(() => {
      expect(screen.getByTestId('fighter-slideshow')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Next Fighter'));
    await waitFor(() => {
      expect(screen.getByText('Start Battle!')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Start Battle!'));
    
    // Advance through commentary
    await waitFor(() => {
      expect(screen.getByTestId('tournament-commentary')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Continue'));
    
    await waitFor(() => {
      expect(screen.getByTestId('battle-viewer')).toBeInTheDocument();
    });
  });

  test('should show battle results modal after replay completion', async () => {
    render(<TournamentPage />);
    
    // Select tournament and click match
    fireEvent.click(screen.getByText('Select Tournament'));
    fireEvent.click(screen.getByText('Click Match'));
    
    // Advance through slideshow and commentary
    await waitFor(() => {
      expect(screen.getByTestId('fighter-slideshow')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Next Fighter'));
    await waitFor(() => {
      expect(screen.getByText('Start Battle!')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Start Battle!'));
    
    await waitFor(() => {
      expect(screen.getByTestId('tournament-commentary')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Continue'));
    
    await waitFor(() => {
      expect(screen.getByTestId('battle-viewer')).toBeInTheDocument();
    });
    
    // Complete the battle replay
    fireEvent.click(screen.getByText('Complete Replay'));
    
    await waitFor(() => {
      expect(screen.getByTestId('winner-animation')).toBeInTheDocument();
    });
  });

  test('should return to tournament view when back button is clicked', async () => {
    render(<TournamentPage />);
    
    // Select tournament and click match
    fireEvent.click(screen.getByText('Select Tournament'));
    fireEvent.click(screen.getByText('Click Match'));
    
    // Advance through slideshow and commentary
    await waitFor(() => {
      expect(screen.getByTestId('fighter-slideshow')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Next Fighter'));
    await waitFor(() => {
      expect(screen.getByText('Start Battle!')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Start Battle!'));
    
    await waitFor(() => {
      expect(screen.getByTestId('tournament-commentary')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Continue'));
    
    await waitFor(() => {
      expect(screen.getByTestId('tournament-battle-replay-view')).toBeInTheDocument();
    });
    
    // Click back to tournament
    fireEvent.click(screen.getByTestId('back-to-tournament-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('tournament-detail-view')).toBeInTheDocument();
    });
  });

  test('should close battle results modal', async () => {
    render(<TournamentPage />);
    
    // Select tournament and click match
    fireEvent.click(screen.getByText('Select Tournament'));
    fireEvent.click(screen.getByText('Click Match'));
    
    // Advance through slideshow and commentary
    await waitFor(() => {
      expect(screen.getByTestId('fighter-slideshow')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Next Fighter'));
    await waitFor(() => {
      expect(screen.getByText('Start Battle!')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Start Battle!'));
    
    await waitFor(() => {
      expect(screen.getByTestId('tournament-commentary')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Continue'));
    
    await waitFor(() => {
      expect(screen.getByTestId('battle-viewer')).toBeInTheDocument();
    });
    
    // Complete the battle replay
    fireEvent.click(screen.getByText('Complete Replay'));
    
    await waitFor(() => {
      expect(screen.getByTestId('winner-animation')).toBeInTheDocument();
    });
    
    // Close the results modal
    fireEvent.click(screen.getByText('Close Results'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('winner-animation')).not.toBeInTheDocument();
    });
  });

  test('should show fighter slideshow and commentary before battle replay', async () => {
    render(<TournamentPage />);

    // Select tournament and click match
    fireEvent.click(screen.getByText('Select Tournament'));
    fireEvent.click(screen.getByText('Click Match'));

    // Slideshow should appear first
    await waitFor(() => {
      expect(screen.getByTestId('fighter-slideshow')).toBeInTheDocument();
    });

    // Advance through slideshow
    fireEvent.click(screen.getByText('Next Fighter'));
    await waitFor(() => {
      expect(screen.getByText('Start Battle!')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Start Battle!'));

    // Commentary should appear after slideshow
    await waitFor(() => {
      expect(screen.getByTestId('tournament-commentary')).toBeInTheDocument();
    });

    // Advance through commentary
    fireEvent.click(screen.getByText('Continue'));

    // Then the battle viewer should appear
    await waitFor(() => {
      expect(screen.getByTestId('battle-viewer')).toBeInTheDocument();
    });
  });
}); 