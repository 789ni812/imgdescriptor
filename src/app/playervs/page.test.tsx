import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerVsPage from './page';
import { renderHook, act } from '@testing-library/react';
import { useFightingGameStore } from '@/lib/stores/fightingGameStore';

// Demo data for testing
const demoFighterA = {
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
    size: 'large' as const,
    build: 'muscular' as const,
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
};

const demoFighterB = {
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
    size: 'medium' as const,
    build: 'average' as const,
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
};

const demoScene = {
  id: 'scene-castle-1',
  name: 'Castle Bridge',
  imageUrl: '/vs/starWars1/scene-castle-1.jpg',
  description: 'A stone castle with a moat and a wooden bridge. The perfect place for an epic duel.',
  environmentalObjects: ['bridge', 'moat', 'castle walls'],
  createdAt: new Date().toISOString(),
};

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
    setCurrentRound: jest.fn(),
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

describe('Battle Timing Synchronization', () => {
  it('should show current round in both animation and storyboard', async () => {
    const { result } = renderHook(() => useFightingGameStore());
    
    // Setup fighters and scene
    act(() => {
      result.current.setFighter('fighterA', demoFighterA);
      result.current.setFighter('fighterB', demoFighterB);
      result.current.setScene(demoScene);
      result.current.setGamePhase('combat');
      result.current.setCurrentRound(1);
      result.current.setShowRoundAnim(true);
    });

    // Mock the LLM response
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        story: 'Darth Vader swings his lightsaber with force!\nLuke Skywalker blocks with his saber and counters.'
      })
    });

    // Start the first round
    act(() => {
      result.current.setFighterHealth(demoFighterA.id, demoFighterA.stats.health);
      result.current.setFighterHealth(demoFighterB.id, demoFighterB.stats.health);
    });

    // Verify round animation shows current round
    expect(result.current.currentRound).toBe(1);
    expect(result.current.showRoundAnim).toBe(true);

    // After round logic completes, verify storyboard shows current round data
    await act(async () => {
      // Simulate round completion
      result.current.updateHealthAndCommentary({
        attackerId: demoFighterA.id,
        defenderId: demoFighterB.id,
        attackerDamage: 10,
        defenderDamage: 5,
        attackCommentary: 'Darth Vader swings his lightsaber with force!',
        defenseCommentary: 'Luke Skywalker blocks with his saber and counters.',
        round: 1,
      });
    });

    // Verify the combat log has the current round data
    expect(result.current.combatLog).toHaveLength(1);
    expect(result.current.combatLog[0].round).toBe(1);
  });

  it('should synchronize round animation and storyboard display', async () => {
    const { result } = renderHook(() => useFightingGameStore());
    
    // Setup initial state
    act(() => {
      result.current.setFighter('fighterA', demoFighterA);
      result.current.setFighter('fighterB', demoFighterB);
      result.current.setScene(demoScene);
      result.current.setGamePhase('combat');
      result.current.setCurrentRound(1);
      result.current.setShowRoundAnim(true);
    });

    // Verify initial state: animation shows round 1, no combat log yet
    expect(result.current.currentRound).toBe(1);
    expect(result.current.showRoundAnim).toBe(true);
    expect(result.current.combatLog).toHaveLength(0);

    // Complete round 1
    await act(async () => {
      result.current.updateHealthAndCommentary({
        attackerId: demoFighterA.id,
        defenderId: demoFighterB.id,
        attackerDamage: 10,
        defenderDamage: 5,
        attackCommentary: 'Round 1 attack commentary',
        defenseCommentary: 'Round 1 defense commentary',
        round: 1,
      });
    });

    // Verify round 1 is in combat log
    expect(result.current.combatLog).toHaveLength(1);
    expect(result.current.combatLog[0].round).toBe(1);

    // Start round 2
    act(() => {
      result.current.setCurrentRound(2);
      result.current.setShowRoundAnim(true);
    });

    // Verify round 2 animation is shown
    expect(result.current.currentRound).toBe(2);
    expect(result.current.showRoundAnim).toBe(true);

    // Complete round 2
    await act(async () => {
      result.current.updateHealthAndCommentary({
        attackerId: demoFighterB.id,
        defenderId: demoFighterA.id,
        attackerDamage: 8,
        defenderDamage: 3,
        attackCommentary: 'Round 2 attack commentary',
        defenseCommentary: 'Round 2 defense commentary',
        round: 2,
      });
    });

    // Verify both rounds are in combat log
    expect(result.current.combatLog).toHaveLength(2);
    expect(result.current.combatLog[0].round).toBe(1);
    expect(result.current.combatLog[1].round).toBe(2);
  });
}); 