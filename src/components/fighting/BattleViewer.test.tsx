import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import BattleViewer from './BattleViewer';
import { act } from 'react-dom/test-utils';

// Mock the child components
jest.mock('./HealthBar', () => {
  return function MockHealthBar({ current, max, color }: { current: number; max: number; color: string }) {
    return <div data-testid={`health-bar-${color}`}>Health: {current}/{max}</div>;
  };
});

jest.mock('./RoundStartAnimation', () => {
  return function MockRoundStartAnimation({ round }: { round: number }) {
    return <div data-testid="round-start-animation">Round {round}</div>;
  };
});

jest.mock('./WinnerAnimation', () => {
  return function MockWinnerAnimation({ winner }: { winner: string }) {
    return <div data-testid="winner-animation">{winner} wins!</div>;
  };
});

// Mock fighter data
const mockFighterA = {
  id: 'fighter-a',
  name: 'Godzilla',
  imageUrl: '/test-godzilla.jpg',
  description: 'King of the Monsters',
  visualAnalysis: {
    age: '65',
    size: 'large',
    build: 'heavy',
    appearance: [],
    weapons: [],
    armor: []
  },
  combatHistory: [],
  winLossRecord: { wins: 0, losses: 0, draws: 0 },
  createdAt: new Date().toISOString(),
  stats: {
    health: 800,
    maxHealth: 800,
    strength: 180,
    agility: 30,
    defense: 90,
    luck: 15,
    age: 65,
    size: 'large' as const,
    build: 'heavy' as const,
  }
};

const mockFighterB = {
  id: 'fighter-b',
  name: 'Bruce Lee',
  imageUrl: '/test-bruce.jpg',
  description: 'Martial Arts Legend',
  visualAnalysis: {
    age: '32',
    size: 'medium',
    build: 'muscular',
    appearance: [],
    weapons: [],
    armor: []
  },
  combatHistory: [],
  winLossRecord: { wins: 0, losses: 0, draws: 0 },
  createdAt: new Date().toISOString(),
  stats: {
    health: 120,
    maxHealth: 120,
    strength: 35,
    agility: 85,
    defense: 25,
    luck: 20,
    age: 32,
    size: 'medium' as const,
    build: 'muscular' as const,
  }
};

const mockScene = {
  id: 'test-arena',
  name: 'Arena',
  imageUrl: '/test-arena.jpg',
  description: 'A battle arena',
  environmentalObjects: [],
  createdAt: new Date().toISOString()
};

const mockBattleLog = [
  {
    round: 1,
    attacker: 'Godzilla',
    defender: 'Bruce Lee',
    attackCommentary: 'Godzilla unleashes a devastating atomic breath!',
    defenseCommentary: 'Bruce Lee dodges with incredible speed!',
    attackerDamage: 0,
    defenderDamage: 25,
    randomEvent: null,
    arenaObjectsUsed: null,
    healthAfter: { attacker: 800, defender: 95 },
  },
  {
    round: 2,
    attacker: 'Bruce Lee',
    defender: 'Godzilla',
    attackCommentary: 'Bruce Lee delivers a lightning-fast kick!',
    defenseCommentary: 'Godzilla barely feels the impact!',
    attackerDamage: 5,
    defenderDamage: 0,
    randomEvent: null,
    arenaObjectsUsed: null,
    healthAfter: { attacker: 795, defender: 95 },
  },
];

describe('BattleViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders fighter information with fade effect during round animations', async () => {
    render(
      <BattleViewer
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        scene={mockScene}
        battleLog={mockBattleLog}
      />
    );

    // Check that fighter information is initially visible
    expect(screen.getAllByText('Godzilla')).toHaveLength(2); // One in main display, one in commentary
    expect(screen.getAllByText('Bruce Lee')).toHaveLength(2); // One in main display, one in commentary
    expect(screen.getByText('VS')).toBeInTheDocument();

    // Check that fighter information has fade-out class initially (during round animation)
    const fighterInfoContainer = screen.getAllByText('Godzilla')[0].closest('.bg-gray-800\\/90');
    expect(fighterInfoContainer).toHaveClass('battle-info-fade-out');

    // Wait for round animation to complete
    await waitFor(() => {
      expect(fighterInfoContainer).toHaveClass('battle-info-fade-in');
    }, { timeout: 2000 });
  });

  it('applies fade transitions smoothly between round animations', async () => {
    render(
      <BattleViewer
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        scene={mockScene}
        battleLog={mockBattleLog}
      />
    );

    const fighterInfoContainer = screen.getAllByText('Godzilla')[0].closest('.bg-gray-800\\/90');

    // Initially should have fade-out class
    expect(fighterInfoContainer).toHaveClass('battle-info-fade-out');

    // Wait for first round animation to complete
    await waitFor(() => {
      expect(fighterInfoContainer).toHaveClass('battle-info-fade-in');
    }, { timeout: 2000 });

    // Wait for next round animation to start
    await waitFor(() => {
      expect(fighterInfoContainer).toHaveClass('battle-info-fade-out');
    }, { timeout: 3000 });
  });

  it('maintains fade effect in replay mode', () => {
    render(
      <BattleViewer
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        scene={mockScene}
        battleLog={mockBattleLog}
      />
    );

    const fighterInfoContainer = screen.getAllByText('Godzilla')[0].closest('.bg-gray-800\\/90');
    expect(fighterInfoContainer).toHaveClass('battle-info-fade-out');
  });

  describe('Text Visibility', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
    it('should render battle text with proper contrast styling', async () => {
      const mockFighterA = {
        id: 'fighter-1',
        name: 'Fighter 1',
        imageUrl: '/fighter1.jpg',
        description: 'A powerful fighter',
        visualAnalysis: {
          age: '25',
          size: 'medium',
          build: 'muscular',
          appearance: [],
          weapons: [],
          armor: []
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 80,
          luck: 70,
          agility: 75,
          defense: 65,
          age: 25,
          size: 'medium' as const,
          build: 'muscular' as const,
        }
      };
      const mockFighterB = {
        id: 'fighter-2',
        name: 'Fighter 2',
        imageUrl: '/fighter2.jpg',
        description: 'A skilled fighter',
        visualAnalysis: {
          age: '28',
          size: 'medium',
          build: 'average',
          appearance: [],
          weapons: [],
          armor: []
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 75,
          luck: 80,
          agility: 70,
          defense: 70,
          age: 28,
          size: 'medium' as const,
          build: 'average' as const,
        }
      };
      const mockScene = {
        id: 'test-arena',
        name: 'Test Arena',
        imageUrl: '/arena.jpg',
        description: 'A mystical arena with ancient runes.',
        environmentalObjects: [],
        createdAt: new Date().toISOString()
      };
      const mockBattleLog = [
        {
          round: 1,
          attacker: 'Fighter 1',
          defender: 'Fighter 2',
          attackCommentary: 'Fighter 1 launches a powerful punch!',
          defenseCommentary: 'Fighter 2 attempts to block but takes damage!',
          attackerDamage: 0,
          defenderDamage: 15,
          randomEvent: 'Critical hit!',
          arenaObjectsUsed: null,
          healthAfter: {
            attacker: 100,
            defender: 85
          }
        }
      ];
      render(
        <BattleViewer
          fighterA={mockFighterA}
          fighterB={mockFighterB}
          scene={mockScene}
          battleLog={mockBattleLog}
        />
      );
      // Advance timers to skip round animation
      await act(async () => {
        jest.runAllTimers();
      });
      // Check that battle commentary has proper contrast styling
      const attackCommentary = screen.getByText('Fighter 1 launches a powerful punch!');
      expect(attackCommentary).toHaveClass('text-white', 'font-semibold');
    });

    it('should render health values with high contrast', () => {
      const mockFighterA = {
        id: 'fighter-1',
        name: 'Fighter 1',
        imageUrl: '/fighter1.jpg',
        description: 'A powerful fighter',
        visualAnalysis: {
          age: '25',
          size: 'medium',
          build: 'muscular',
          appearance: [],
          weapons: [],
          armor: []
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 80,
          luck: 70,
          agility: 75,
          defense: 65,
          age: 25,
          size: 'medium' as const,
          build: 'muscular' as const,
        }
      };

      const mockFighterB = {
        id: 'fighter-2',
        name: 'Fighter 2',
        imageUrl: '/fighter2.jpg',
        description: 'A skilled fighter',
        visualAnalysis: {
          age: '28',
          size: 'medium',
          build: 'average',
          appearance: [],
          weapons: [],
          armor: []
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 75,
          luck: 80,
          agility: 70,
          defense: 70,
          age: 28,
          size: 'medium' as const,
          build: 'average' as const,
        }
      };

      const mockScene = {
        id: 'test-arena',
        name: 'Test Arena',
        imageUrl: '/arena.jpg',
        description: 'A test arena',
        environmentalObjects: [],
        createdAt: new Date().toISOString()
      };

      const mockBattleLog = [
        {
          round: 1,
          attacker: 'Fighter 1',
          defender: 'Fighter 2',
          attackCommentary: 'Fighter 1 attacks!',
          defenseCommentary: 'Fighter 2 defends!',
          attackerDamage: 0,
          defenderDamage: 15,
          randomEvent: null,
          arenaObjectsUsed: null,
          healthAfter: {
            attacker: 100,
            defender: 85
          }
        }
      ];

      render(
        <BattleViewer
          fighterA={mockFighterA}
          fighterB={mockFighterB}
          scene={mockScene}
          battleLog={mockBattleLog}
        />
      );

      // Check health values have proper contrast
      const healthTexts = screen.getAllByText(/Health: 100 \/ 100/);
      expect(healthTexts[0]).toHaveClass('text-green-400', 'font-bold');
      expect(healthTexts[1]).toHaveClass('text-green-400', 'font-bold');
    });
  });
}); 