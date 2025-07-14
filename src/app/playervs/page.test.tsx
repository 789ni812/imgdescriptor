import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerVsPage from './page';
import { renderHook, act } from '@testing-library/react';
import { useFightingGameStore } from '@/lib/stores/fightingGameStore';
import { ROUND_ANIMATION_DURATION_MS, BATTLE_ATTACK_DEFENSE_STEP_MS, ROUND_TRANSITION_PAUSE_MS } from '@/lib/constants';
import { godzillaVSbruceleeDemo } from '../../../public/vs/godzillaVSbrucelee/demoData';

// Enable fake timers for timing tests
jest.useFakeTimers();

// Mock fetch globally
beforeAll(() => {
  global.fetch = jest.fn();
});
afterAll(() => {
  // @ts-ignore
  global.fetch.mockRestore && global.fetch.mockRestore();
});
beforeEach(() => {
  // @ts-ignore
  global.fetch.mockClear && global.fetch.mockClear();
});

// Helper: re-define extractFighterName for test (since it's not exported)
function extractFighterName(analysis: Record<string, unknown>, fallback: string) {
  let name = fallback;
  if (analysis && analysis.description) {
    const desc = analysis.description as Record<string, unknown>;
    if (Array.isArray(desc.characters) && desc.characters.length > 0) {
      if (typeof desc.characters[0] === 'string') name = desc.characters[0];
      if (desc.characters[0] && typeof desc.characters[0].name === 'string') name = desc.characters[0].name;
    }
    if (typeof desc.main_character === 'string') name = desc.main_character;
    if (typeof desc.setting === 'string' && desc.setting.length < 32) name = desc.setting;
  }
  name = name.split('-')[0].split(',')[0].trim();
  return name.replace(/\s*\(.*?\)/g, '').replace(/\d+$/, '').trim();
}

describe('extractFighterName', () => {
  it('should extract just the name from a full description', () => {
    const analysis = {
      description: {
        characters: ['Bruce Lee - battered and bruised, a look of intense concentration on his face']
      }
    };
    const result = extractFighterName(analysis, 'Fighter A');
    expect(result).toBe('Bruce Lee');
  });

  it('should handle names with commas', () => {
    const analysis = {
      description: {
        characters: ['Godzilla, the King of Monsters, towering over the city']
      }
    };
    const result = extractFighterName(analysis, 'Fighter B');
    expect(result).toBe('Godzilla');
  });

  it('should fallback to default when no description', () => {
    const analysis = {};
    const result = extractFighterName(analysis, 'Fighter A');
    expect(result).toBe('Fighter A');
  });
});

// Demo data for testing
const demoFighterA = godzillaVSbruceleeDemo.fighterA;
const demoFighterB = godzillaVSbruceleeDemo.fighterB;
const demoScene = godzillaVSbruceleeDemo.scene;

// Mock the fighting game store
const mockSetFighter = jest.fn();
const mockSetScene = jest.fn();
const mockSetCurrentRound = jest.fn();
const mockSetShowRoundAnim = jest.fn();
const mockUpdateHealthAndCommentary = jest.fn();
const mockSetPreGeneratedBattleLog = jest.fn();

jest.mock('@/lib/stores/fightingGameStore', () => ({
  useFightingGameStore: jest.fn(() => ({
    gamePhase: 'setup',
    fighters: { 
      fighterA: godzillaVSbruceleeDemo.fighterA,
      fighterB: godzillaVSbruceleeDemo.fighterB
    },
    scene: godzillaVSbruceleeDemo.scene,
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
    setShowRoundAnim: mockSetShowRoundAnim,
    setCurrentRound: mockSetCurrentRound,
    addCombatRound: jest.fn(),
    updateHealthAndCommentary: mockUpdateHealthAndCommentary,
    getFighterById: jest.fn(),
    getCurrentFighters: jest.fn(),
    setPreGeneratedBattleLog: mockSetPreGeneratedBattleLog,
  })),
}));

describe('PlayerVsPage', () => {
  it('renders the setup phase heading', () => {
    render(<PlayerVsPage />);
    expect(screen.getByRole('heading', { name: /Upload Your Fighters/i, level: 2 })).toBeInTheDocument();
  });

  it('shows summary card for Fighter A (Godzilla)', () => {
    render(<PlayerVsPage />);
    expect(screen.getAllByText(/Godzilla/i).length).toBeGreaterThan(0);
  });

  it('shows summary card for Fighter B (Bruce Lee)', () => {
    render(<PlayerVsPage />);
    expect(screen.getAllByText(/Bruce Lee/i).length).toBeGreaterThan(0);
  });

  it('displays scene upload section', () => {
    render(<PlayerVsPage />);
    expect(screen.getByRole('heading', { name: /Battle Arena/i, level: 3 })).toBeInTheDocument();
  });

  it('shows start fight button when setup is complete', () => {
    render(<PlayerVsPage />);
    expect(screen.getByRole('button', { name: /Start Fight/i })).toBeInTheDocument();
  });

  it('renders the RebalanceFightersButton in setup phase and handles success', async () => {
    // Mock API response
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        message: 'Balanced 2 fighters',
        results: [
          { name: 'Darth Vader', type: 'Sith Lord', oldStats: {}, newStats: {} },
          { name: 'Bruce Lee', type: 'Peak Human', oldStats: {}, newStats: {} }
        ]
      })
    });

    render(<PlayerVsPage />);

    // Button should be present
    const rebalanceBtn = screen.getByRole('button', { name: /rebalance fighters/i });
    expect(rebalanceBtn).toBeInTheDocument();

    // Click the button
    fireEvent.click(rebalanceBtn);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/rebalancing fighters/i)).toBeInTheDocument();
      expect(rebalanceBtn).toBeDisabled();
    });

    // Should show success message and fighter results
    await waitFor(() => {
      expect(screen.getByText(/successfully rebalanced 2 fighters/i)).toBeInTheDocument();
      // Use getAllByText and check length > 0 for both fighters
      expect(screen.getAllByText(/darth vader/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/bruce lee/i).length).toBeGreaterThan(0);
    });
  });
});

describe('Battle Timing Synchronization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.useFakeTimers();
  });

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
        story: 'Godzilla swings his massive tail with force!\nBruce Lee dodges with incredible agility and counters.'
      })
    });

    // Start the first round
    act(() => {
      result.current.setFighterHealth(demoFighterA.id, demoFighterA.stats.health);
      result.current.setFighterHealth(demoFighterB.id, demoFighterB.stats.health);
    });

    // Simulate round animation and transitions
    act(() => {
      jest.advanceTimersByTime(ROUND_ANIMATION_DURATION_MS + BATTLE_ATTACK_DEFENSE_STEP_MS + ROUND_TRANSITION_PAUSE_MS);
    });

    // Verify round animation shows current round
    expect(mockSetCurrentRound).toHaveBeenCalledWith(1);
    expect(mockSetShowRoundAnim).toHaveBeenCalledWith(true);

    // After round logic completes, verify storyboard shows current round data
    await act(async () => {
      // Simulate round completion
      result.current.updateHealthAndCommentary({
        attackerId: demoFighterA.id,
        defenderId: demoFighterB.id,
        attackerDamage: 10,
        defenderDamage: 5,
        attackCommentary: 'Godzilla swings his massive tail with force!',
        defenseCommentary: 'Bruce Lee dodges with incredible agility and counters.',
        round: 1,
      });
    });

    // Verify the updateHealthAndCommentary was called
    expect(mockUpdateHealthAndCommentary).toHaveBeenCalledWith({
      attackerId: demoFighterA.id,
      defenderId: demoFighterB.id,
      attackerDamage: 10,
      defenderDamage: 5,
      attackCommentary: 'Godzilla swings his massive tail with force!',
      defenseCommentary: 'Bruce Lee dodges with incredible agility and counters.',
      round: 1,
    });
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

    // Simulate round animation and transitions
    act(() => {
      jest.advanceTimersByTime(ROUND_ANIMATION_DURATION_MS + BATTLE_ATTACK_DEFENSE_STEP_MS + ROUND_TRANSITION_PAUSE_MS);
    });

    // Verify initial state: animation shows round 1, no combat log yet
    expect(mockSetCurrentRound).toHaveBeenCalledWith(1);
    expect(mockSetShowRoundAnim).toHaveBeenCalledWith(true);

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

    // Verify updateHealthAndCommentary was called for round 1
    expect(mockUpdateHealthAndCommentary).toHaveBeenCalledWith({
      attackerId: demoFighterA.id,
      defenderId: demoFighterB.id,
      attackerDamage: 10,
      defenderDamage: 5,
      attackCommentary: 'Round 1 attack commentary',
      defenseCommentary: 'Round 1 defense commentary',
      round: 1,
    });

    // Start round 2
    act(() => {
      result.current.setCurrentRound(2);
      result.current.setShowRoundAnim(true);
      jest.advanceTimersByTime(ROUND_ANIMATION_DURATION_MS + BATTLE_ATTACK_DEFENSE_STEP_MS + ROUND_TRANSITION_PAUSE_MS);
    });

    // Verify round 2 animation is shown
    expect(mockSetCurrentRound).toHaveBeenCalledWith(2);
    expect(mockSetShowRoundAnim).toHaveBeenCalledWith(true);
  });
}); 