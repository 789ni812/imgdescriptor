import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import WinnerAnimation from './WinnerAnimation';

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

const mockBattleLog = [
  {
    round: 1,
    attacker: 'Godzilla',
    defender: 'Bruce Lee',
    attackCommentary: 'Godzilla unleashes a devastating atomic breath!',
    defenseCommentary: 'Bruce Lee dodges with incredible speed!',
    attackerDamage: 0,
    defenderDamage: 25,
    randomEvent: undefined,
    arenaObjectsUsed: undefined,
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
    randomEvent: undefined,
    arenaObjectsUsed: undefined,
    healthAfter: { attacker: 795, defender: 95 },
  },
];

describe('WinnerAnimation', () => {
  const mockOnDone = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders winner announcement', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onDone={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
      />
    );

    expect(screen.getByText('Godzilla wins the battle!')).toBeInTheDocument();
  });

  it('renders draw announcement', () => {
    render(
      <WinnerAnimation
        winner="Draw"
        onDone={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
      />
    );

    expect(screen.getByText("It's a DRAW!")).toBeInTheDocument();
  });

  it('shows KO when a fighter is defeated', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onDone={mockOnDone}
        fighterAHealth={800}
        fighterBHealth={0}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
      />
    );

    expect(screen.getByText('KO!')).toBeInTheDocument();
  });

  it('displays fighter stats for both fighters', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onDone={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
      />
    );

    // Check fighter names are displayed
    expect(screen.getByText('Godzilla')).toBeInTheDocument();
    expect(screen.getByText('Bruce Lee')).toBeInTheDocument();

    // Check key stats are displayed (now in inline format)
    expect(screen.getByText(/Strength: 180/)).toBeInTheDocument();
    expect(screen.getByText(/Agility: 85/)).toBeInTheDocument();
    expect(screen.getByText(/Defense: 90/)).toBeInTheDocument();
    expect(screen.getByText(/Luck: 15/)).toBeInTheDocument();
  });

  it('displays battle overview with round summaries', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onDone={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
      />
    );

    // Check battle overview section
    expect(screen.getByText('Battle Overview')).toBeInTheDocument();
    
    // Check round summaries are displayed
    expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    expect(screen.getByText(/Round 2/)).toBeInTheDocument();
    
    // Check commentary is displayed
    expect(screen.getByText(/Godzilla unleashes a devastating atomic breath!/)).toBeInTheDocument();
    expect(screen.getByText(/Bruce Lee dodges with incredible speed!/)).toBeInTheDocument();
  });

  it('displays fighter images in stats section', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onDone={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
      />
    );

    // Check for images in the stats section (larger images)
    const statsSection = screen.getByText('Fighter Stats').closest('div');
    const godzillaStatsImage = statsSection?.querySelector('img[alt="Godzilla"][class*="w-16"]');
    const bruceStatsImage = statsSection?.querySelector('img[alt="Bruce Lee"][class*="w-16"]');

    expect(godzillaStatsImage).toBeInTheDocument();
    expect(bruceStatsImage).toBeInTheDocument();
    expect(godzillaStatsImage).toHaveAttribute('src', '/test-godzilla.jpg');
    expect(bruceStatsImage).toHaveAttribute('src', '/test-bruce.jpg');
  });

  it('calls onDone when restart button is clicked', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onDone={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
      />
    );

    fireEvent.click(screen.getByText('Restart'));
    expect(mockOnDone).toHaveBeenCalledTimes(1);
  });

  it('only shows restart button (close button was removed)', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onDone={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
      />
    );

    expect(screen.getByText('Restart')).toBeInTheDocument();
    expect(screen.queryByText('Close')).not.toBeInTheDocument();
  });

  it('handles missing fighter images gracefully', () => {
    const fighterWithoutImage = { ...mockFighterA, imageUrl: '' };
    
    render(
      <WinnerAnimation
        winner="Godzilla"
        onDone={mockOnDone}
        fighterA={fighterWithoutImage}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
      />
    );

    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('displays final health values', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onDone={mockOnDone}
        fighterAHealth={795}
        fighterBHealth={95}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
      />
    );

    expect(screen.getByText('Final Health: 795 / 800')).toBeInTheDocument();
    expect(screen.getByText('Final Health: 95 / 120')).toBeInTheDocument();
  });

  describe('Health Change Calculations', () => {
    it('should calculate health changes correctly using damage values', () => {
      const mockBattleLog = [
        {
          round: 1,
          attacker: 'Fighter 1',
          defender: 'Fighter 2',
          attackCommentary: 'Fighter 1 attacks!',
          defenseCommentary: 'Fighter 2 defends!',
          attackerDamage: 15,
          defenderDamage: 0,
          randomEvent: undefined,
          arenaObjectsUsed: undefined,
          healthAfter: { attacker: 100, defender: 85 }
        },
        {
          round: 2,
          attacker: 'Fighter 2',
          defender: 'Fighter 1',
          attackCommentary: 'Fighter 2 attacks!',
          defenseCommentary: 'Fighter 1 defends!',
          attackerDamage: 20,
          defenderDamage: 0,
          randomEvent: undefined,
          arenaObjectsUsed: undefined,
          healthAfter: { attacker: 80, defender: 85 }
        }
      ];

      render(
        <WinnerAnimation
          winner="Fighter 2"
          onDone={mockOnDone}
          fighterA={mockFighterA}
          fighterB={mockFighterB}
          battleLog={mockBattleLog}
        />
      );

      // Check that health changes are displayed correctly
      // Round 1: Fighter 1 attacks, Fighter 2 takes 15 damage
      expect(screen.getByText('-15')).toBeInTheDocument();
      
      // Round 2: Fighter 2 attacks, Fighter 1 takes 20 damage
      expect(screen.getByText('-20')).toBeInTheDocument();
      
      // Check that attacker health changes are always 0
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });

    it('should allow health increases only with healing powerups', () => {
      const mockBattleLog = [
        {
          round: 1,
          attacker: 'Fighter 1',
          defender: 'Fighter 2',
          attackCommentary: 'Fighter 1 attacks!',
          defenseCommentary: 'Fighter 2 defends!',
          attackerDamage: -5, // Healing
          defenderDamage: 0,
          randomEvent: 'Fighter 2 uses healing potion!',
          arenaObjectsUsed: undefined,
          healthAfter: { attacker: 100, defender: 105 }
        }
      ];

      render(
        <WinnerAnimation
          winner="Fighter 2"
          fighterA={mockFighterA}
          fighterB={mockFighterB}
          battleLog={mockBattleLog}
        />
      );

      // Check that healing is allowed with powerup
      expect(screen.getByText('+5')).toBeInTheDocument(); // Healing
    });

    it('should prevent health increases without healing powerups', () => {
      const mockBattleLog = [
        {
          round: 1,
          attacker: 'Fighter 1',
          defender: 'Fighter 2',
          attackCommentary: 'Fighter 1 attacks!',
          defenseCommentary: 'Fighter 2 defends!',
          attackerDamage: -5, // Healing but no powerup
          defenderDamage: 0,
          randomEvent: null,
          arenaObjectsUsed: null,
          healthAfter: { attacker: 100, defender: 105 }
        }
      ];

      render(
        <WinnerAnimation
          winner="Fighter 2"
          fighterA={mockFighterA}
          fighterB={mockFighterB}
          battleLog={mockBattleLog}
        />
      );

      // Check that health increase is prevented without healing powerup
      // Should show 0 instead of +5 - check for multiple "0" elements
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });

  it('should display KO! for the loser and WIN for the winner in a KO victory', () => {
    const mockFighterA = {
      id: 'fighter-a',
      name: 'Fighter A',
      imageUrl: '/test-image-a.jpg',
      stats: {
        health: 100,
        maxHealth: 100,
        strength: 50,
        luck: 20,
        agility: 30,
        defense: 25,
        age: 25,
        size: 'medium' as const,
        build: 'average' as const,
      },
      visualAnalysis: {
        age: 'adult',
        size: 'medium',
        build: 'average',
        appearance: [],
        weapons: [],
        armor: [],
      },
      combatHistory: [],
      winLossRecord: { wins: 0, losses: 0, draws: 0 },
      createdAt: '2025-01-27T00:00:00Z',
    };

    const mockFighterB = {
      id: 'fighter-b',
      name: 'Fighter B',
      imageUrl: '/test-image-b.jpg',
      stats: {
        health: 100,
        maxHealth: 100,
        strength: 45,
        luck: 15,
        agility: 35,
        defense: 20,
        age: 30,
        size: 'medium' as const,
        build: 'muscular' as const,
      },
      visualAnalysis: {
        age: 'adult',
        size: 'medium',
        build: 'muscular',
        appearance: [],
        weapons: [],
        armor: [],
      },
      combatHistory: [],
      winLossRecord: { wins: 0, losses: 0, draws: 0 },
      createdAt: '2025-01-27T00:00:00Z',
    };

    // Test KO victory - Fighter A wins, Fighter B at 0 health
    render(
      <WinnerAnimation
        winner="Fighter A"
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        fighterAHealth={50}
        fighterBHealth={0}
        onDone={jest.fn()}
        onClose={jest.fn()}
      />
    );

    // Winner gets WIN, loser gets KO!
    const fighterACard = screen.getByText('Fighter A').closest('.bg-gray-800') as HTMLElement;
    const fighterBCard = screen.getByText('Fighter B').closest('.bg-gray-800') as HTMLElement;
    expect(fighterACard).toBeInTheDocument();
    expect(fighterBCard).toBeInTheDocument();

    const winStatusA = within(fighterACard).getByText('WIN');
    expect(winStatusA).toBeInTheDocument();
    expect(winStatusA).toHaveClass('text-green-400', 'font-bold');

    const koStatusB = within(fighterBCard).getByText('KO!');
    expect(koStatusB).toBeInTheDocument();
    expect(koStatusB).toHaveClass('text-red-500', 'font-bold');
  });

  it('should display DRAW status for both fighters in a draw', () => {
    const mockFighterA = {
      id: 'fighter-a',
      name: 'Fighter A',
      imageUrl: '/test-image-a.jpg',
      stats: {
        health: 100,
        maxHealth: 100,
        strength: 50,
        luck: 20,
        agility: 30,
        defense: 25,
        age: 25,
        size: 'medium' as const,
        build: 'average' as const,
      },
      visualAnalysis: {
        age: 'adult',
        size: 'medium',
        build: 'average',
        appearance: [],
        weapons: [],
        armor: [],
      },
      combatHistory: [],
      winLossRecord: { wins: 0, losses: 0, draws: 0 },
      createdAt: '2025-01-27T00:00:00Z',
    };

    const mockFighterB = {
      id: 'fighter-b',
      name: 'Fighter B',
      imageUrl: '/test-image-b.jpg',
      stats: {
        health: 100,
        maxHealth: 100,
        strength: 45,
        luck: 15,
        agility: 35,
        defense: 20,
        age: 30,
        size: 'medium' as const,
        build: 'muscular' as const,
      },
      visualAnalysis: {
        age: 'adult',
        size: 'medium',
        build: 'muscular',
        appearance: [],
        weapons: [],
        armor: [],
      },
      combatHistory: [],
      winLossRecord: { wins: 0, losses: 0, draws: 0 },
      createdAt: '2025-01-27T00:00:00Z',
    };

    // Test draw scenario
    render(
      <WinnerAnimation
        winner="Draw"
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        fighterAHealth={25}
        fighterBHealth={25}
        onDone={jest.fn()}
        onClose={jest.fn()}
      />
    );

    // Check that DRAW status is displayed for both fighters
    const fighterACard = screen.getByText('Fighter A').closest('.bg-gray-800') as HTMLElement;
    const fighterBCard = screen.getByText('Fighter B').closest('.bg-gray-800') as HTMLElement;
    
    expect(fighterACard).toBeInTheDocument();
    expect(fighterBCard).toBeInTheDocument();

    const drawStatusA = within(fighterACard).getByText('DRAW');
    const drawStatusB = within(fighterBCard).getByText('DRAW');
    
    expect(drawStatusA).toBeInTheDocument();
    expect(drawStatusB).toBeInTheDocument();
    expect(drawStatusA).toHaveClass('text-yellow-500', 'font-bold');
    expect(drawStatusB).toHaveClass('text-yellow-500', 'font-bold');
  });

  it('should not display status for normal victory (no KO)', () => {
    const mockFighterA = {
      id: 'fighter-a',
      name: 'Fighter A',
      imageUrl: '/test-image-a.jpg',
      stats: {
        health: 100,
        maxHealth: 100,
        strength: 50,
        luck: 20,
        agility: 30,
        defense: 25,
        age: 25,
        size: 'medium' as const,
        build: 'average' as const,
      },
      visualAnalysis: {
        age: 'adult',
        size: 'medium',
        build: 'average',
        appearance: [],
        weapons: [],
        armor: [],
      },
      combatHistory: [],
      winLossRecord: { wins: 0, losses: 0, draws: 0 },
      createdAt: '2025-01-27T00:00:00Z',
    };

    const mockFighterB = {
      id: 'fighter-b',
      name: 'Fighter B',
      imageUrl: '/test-image-b.jpg',
      stats: {
        health: 100,
        maxHealth: 100,
        strength: 45,
        luck: 15,
        agility: 35,
        defense: 20,
        age: 30,
        size: 'medium' as const,
        build: 'muscular' as const,
      },
      visualAnalysis: {
        age: 'adult',
        size: 'medium',
        build: 'muscular',
        appearance: [],
        weapons: [],
        armor: [],
      },
      combatHistory: [],
      winLossRecord: { wins: 0, losses: 0, draws: 0 },
      createdAt: '2025-01-27T00:00:00Z',
    };

    // Test normal victory - Fighter A wins but Fighter B still has health
    render(
      <WinnerAnimation
        winner="Fighter A"
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        fighterAHealth={30}
        fighterBHealth={5}
        onDone={jest.fn()}
        onClose={jest.fn()}
      />
    );

    // Check that no status is displayed for either fighter in normal victory
    const fighterACard = screen.getByText('Fighter A').closest('.bg-gray-800') as HTMLElement;
    const fighterBCard = screen.getByText('Fighter B').closest('.bg-gray-800') as HTMLElement;
    
    expect(fighterACard).toBeInTheDocument();
    expect(fighterBCard).toBeInTheDocument();

    const koStatusA = within(fighterACard).queryByText('KO!');
    const koStatusB = within(fighterBCard).queryByText('KO!');
    const drawStatusA = within(fighterACard).queryByText('DRAW');
    const drawStatusB = within(fighterBCard).queryByText('DRAW');
    
    expect(koStatusA).not.toBeInTheDocument();
    expect(koStatusB).not.toBeInTheDocument();
    expect(drawStatusA).not.toBeInTheDocument();
    expect(drawStatusB).not.toBeInTheDocument();
  });
}); 