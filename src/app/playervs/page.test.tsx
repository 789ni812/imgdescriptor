import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerVsPage from './page';

// Mock the fighting game store
jest.mock('@/lib/stores/fightingGameStore', () => ({
  useFightingGameStore: jest.fn(() => ({
    gamePhase: 'setup',
    fighters: [],
    scene: null,
    combatLog: [],
    resetGame: jest.fn(),
    setGamePhase: jest.fn(),
  })),
}));

describe('PlayerVsPage', () => {
  it('renders the fighting game page with correct title', () => {
    render(<PlayerVsPage />);
    expect(screen.getByRole('heading', { name: /Fighter vs Fighter/i, level: 1 })).toBeInTheDocument();
  });

  it('displays the setup phase when game is in setup mode', () => {
    render(<PlayerVsPage />);
    // The setup phase heading is a level 2 heading
    expect(screen.getByRole('heading', { name: /Upload Your Fighters/i, level: 2 })).toBeInTheDocument();
  });

  it('shows fighter upload sections for both fighters', () => {
    render(<PlayerVsPage />);
    // The fighter section headings are level 3
    expect(screen.getByRole('heading', { name: /Fighter A/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Fighter B/i, level: 3 })).toBeInTheDocument();
  });

  it('displays scene upload section', () => {
    render(<PlayerVsPage />);
    // The scene section heading is level 3
    expect(screen.getByRole('heading', { name: /Battle Arena/i, level: 3 })).toBeInTheDocument();
  });

  it('shows start fight button when setup is complete', () => {
    render(<PlayerVsPage />);
    expect(screen.getByRole('button', { name: /Start Fight/i })).toBeInTheDocument();
  });
}); 