import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerVsPage from './page';

// Mock the fighting game store
const mockSetFighter = jest.fn();
const mockSetScene = jest.fn();

jest.mock('@/lib/stores/fightingGameStore', () => ({
  useFightingGameStore: jest.fn(() => ({
    gamePhase: 'setup',
    fighters: { 
      fighterA: {
        id: 'darth-1',
        name: 'Darth Vader',
        imageUrl: '/vs/starWars1/Darth-1.jpg',
        description: 'A tall, armored figure with a black helmet and cape. Wields a red lightsaber. Strong, intimidating, and experienced.',
        stats: {
          health: 180,
          maxHealth: 180,
          strength: 19,
          luck: 12,
          agility: 10,
          defense: 18,
          age: 45,
          size: 'large',
          build: 'muscular',
        },
        visualAnalysis: {
          age: 'adult',
          size: 'large',
          build: 'muscular',
          appearance: ['armored', 'helmeted', 'intimidating'],
          weapons: ['red lightsaber'],
          armor: ['black armor'],
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
      }, 
      fighterB: {
        id: 'luke-1',
        name: 'Luke Skywalker',
        imageUrl: '/vs/starWars1/luke-1.jpg',
        description: 'A young man in white robes wielding a blue lightsaber. Agile, determined, and hopeful.',
        stats: {
          health: 130,
          maxHealth: 130,
          strength: 14,
          luck: 16,
          agility: 18,
          defense: 10,
          age: 22,
          size: 'medium',
          build: 'average',
        },
        visualAnalysis: {
          age: 'young',
          size: 'medium',
          build: 'average',
          appearance: ['determined', 'hopeful'],
          weapons: ['blue lightsaber'],
          armor: [],
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
      }
    },
    scene: {
      id: 'scene-castle-1',
      name: 'Castle Bridge',
      imageUrl: '/vs/starWars1/scene-castle-1.jpg',
      description: 'A stone castle with a moat and a wooden bridge. The perfect place for an epic duel.',
      environmentalObjects: ['bridge', 'moat', 'castle walls'],
      createdAt: new Date().toISOString(),
    },
    combatLog: [],
    currentRound: 0,
    maxRounds: 6,
    fighterAHealth: null,
    fighterBHealth: null,
    roundStep: 'attack',
    isLLMGenerating: false,
    winner: null,
    showRoundAnim: false,
    resetGame: jest.fn(),
    setGamePhase: jest.fn(),
    setFighter: mockSetFighter,
    setScene: mockSetScene,
    removeFighter: jest.fn(),
    setFighterHealth: jest.fn(),
    setRoundStep: jest.fn(),
    setIsLLMGenerating: jest.fn(),
    setWinner: jest.fn(),
    setShowRoundAnim: jest.fn(),
    addCombatRound: jest.fn(),
    updateHealthAndCommentary: jest.fn(),
    getFighterById: jest.fn(),
    getCurrentFighters: jest.fn(),
  })),
}));

describe('PlayerVsPage', () => {
  it('renders the setup phase heading', () => {
    render(<PlayerVsPage />);
    expect(screen.getByRole('heading', { name: /Upload Your Fighters/i, level: 2 })).toBeInTheDocument();
  });

  it('shows summary card for Fighter A (Darth Vader)', () => {
    render(<PlayerVsPage />);
    expect(screen.getAllByText(/Darth Vader/i).length).toBeGreaterThan(0);
  });

  it('shows summary card for Fighter B (Luke Skywalker)', () => {
    render(<PlayerVsPage />);
    expect(screen.getAllByText(/Luke Skywalker/i).length).toBeGreaterThan(0);
  });

  it('displays scene upload section', () => {
    render(<PlayerVsPage />);
    expect(screen.getByRole('heading', { name: /Battle Arena/i, level: 3 })).toBeInTheDocument();
  });

  it('shows start fight button when setup is complete', () => {
    render(<PlayerVsPage />);
    expect(screen.getByRole('button', { name: /Start Fight/i })).toBeInTheDocument();
  });
}); 