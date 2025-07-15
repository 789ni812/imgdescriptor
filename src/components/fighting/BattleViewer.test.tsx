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
  },
  description: 'King of the Monsters',
};

const mockFighterB = {
  id: 'fighter-b',
  name: 'Bruce Lee',
  imageUrl: '/test-bruce.jpg',
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
  },
  description: 'Martial Arts Legend',
};

const mockScene = {
  name: 'Arena',
  imageUrl: '/test-arena.jpg',
  description: 'A battle arena',
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
        mode="live"
      />
    );

    // Check that fighter information is initially visible
    expect(screen.getByText('Godzilla')).toBeInTheDocument();
    expect(screen.getByText('Bruce Lee')).toBeInTheDocument();
    expect(screen.getByText('vs')).toBeInTheDocument();

    // Check that round animation is shown initially
    expect(screen.getByTestId('round-start-animation')).toBeInTheDocument();
    expect(screen.getByText('Round 1')).toBeInTheDocument();

    // Check that fighter information has fade-out class when round animation is shown
    const fighterInfoContainer = screen.getByText('Godzilla').closest('.flex.items-center.justify-center');
    expect(fighterInfoContainer).toHaveClass('battle-info-fade-out');

    // Wait for round animation to complete
    await waitFor(() => {
      expect(screen.queryByTestId('round-start-animation')).not.toBeInTheDocument();
    }, { timeout: 2000 });

    // Check that fighter information has fade-in class when round animation is hidden
    expect(fighterInfoContainer).toHaveClass('battle-info-fade-in');
  });

  it('applies fade transitions smoothly between round animations', async () => {
    render(
      <BattleViewer
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        scene={mockScene}
        battleLog={mockBattleLog}
        mode="live"
      />
    );

    const fighterInfoContainer = screen.getByText('Godzilla').closest('.flex.items-center.justify-center');

    // Initially should have fade-out class
    expect(fighterInfoContainer).toHaveClass('battle-info-fade-out');

    // Wait for first round animation to complete
    await waitFor(() => {
      expect(screen.queryByTestId('round-start-animation')).not.toBeInTheDocument();
    }, { timeout: 2000 });

    // Should now have fade-in class
    expect(fighterInfoContainer).toHaveClass('battle-info-fade-in');

    // Wait for next round animation to start
    await waitFor(() => {
      expect(screen.getByTestId('round-start-animation')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Should have fade-out class again
    expect(fighterInfoContainer).toHaveClass('battle-info-fade-out');
  });

  it('maintains fade effect in replay mode', () => {
    render(
      <BattleViewer
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        scene={mockScene}
        battleLog={mockBattleLog}
        mode="replay"
      />
    );

    const fighterInfoContainer = screen.getByText('Godzilla').closest('.flex.items-center.justify-center');
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
        name: 'Test Arena',
        imageUrl: '/arena.jpg',
        description: 'A mystical arena with ancient runes.'
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
          mode="replay"
        />
      );
      // Advance timers to skip round animation
      await act(async () => {
        jest.runAllTimers();
      });
      // Check that arena description has proper contrast styling
      const arenaDescription = await screen.findByText(
        (content, element) =>
          element?.textContent === 'A mystical arena with ancient runes.'
      );
      expect(arenaDescription).toHaveClass('text-gray-200', 'italic');
    });

    it('should render health values with high contrast', () => {
      const mockFighterA = {
        id: 'fighter-1',
        name: 'Fighter 1',
        imageUrl: '/fighter1.jpg',
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
        name: 'Test Arena',
        imageUrl: '/arena.jpg'
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
          mode="replay"
        />
      );

      // Check health values have proper contrast
      const healthTexts = screen.getAllByText(/Health: 100 \/ 100/);
      expect(healthTexts[0]).toHaveClass('text-green-400', 'font-bold');
      expect(healthTexts[1]).toHaveClass('text-green-400', 'font-bold');
    });
  });
}); 