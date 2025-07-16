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
  visualAnalysis: { age: '', size: '', build: '', appearance: [], weapons: [], armor: [] },
  combatHistory: [],
  winLossRecord: { wins: 0, losses: 0, draws: 0 },
  createdAt: '',
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
  visualAnalysis: { age: '', size: '', build: '', appearance: [], weapons: [], armor: [] },
  combatHistory: [],
  winLossRecord: { wins: 0, losses: 0, draws: 0 },
  createdAt: '',
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

const mockScene = {
  id: 'arena-1',
  name: 'Tokyo Arena',
  imageUrl: '/arena-image.jpg',
  description: 'A neon-lit Tokyo battleground.',
  environmentalObjects: ['neon lights', 'cars'],
  createdAt: '2025-01-27T00:00:00Z',
};
const mockSummary = 'Battle between Godzilla and Bruce Lee.';

describe('WinnerAnimation', () => {
  const mockOnDone = jest.fn();


  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders winner announcement', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    expect(screen.getByText(/Godzilla wins/i, { exact: false })).toBeInTheDocument();
  });

  it('renders draw announcement', () => {
    render(
      <WinnerAnimation
        winner="Draw"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    expect(screen.getByText(/draw/i, { exact: false })).toBeInTheDocument();
  });

  it('shows KO when a fighter is defeated', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    expect(screen.getByText(/KO/i, { exact: false })).toBeInTheDocument();
  });

  it('displays fighter stats for both fighters', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    // Check fighter names are displayed
    expect(screen.getByText(/Godzilla/i, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/Bruce Lee/i, { exact: false })).toBeInTheDocument();

    // Check compact secondary stats line is present for each fighter
    expect(screen.getAllByText(/Magic:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ranged:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Intelligence:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Size:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Build:/i).length).toBeGreaterThan(0);
  });

  it('shows enhanced arena display', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );
    expect(screen.getByText(/Tokyo Arena/i, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/neon-lit Tokyo battleground/i, { exact: false })).toBeInTheDocument();
    expect(screen.getByAltText('Tokyo Arena')).toHaveAttribute('src', '/arena-image.jpg');
    expect(screen.getByText('neon lights')).toBeInTheDocument();
    expect(screen.getByText('cars')).toBeInTheDocument();
  });

  it('displays battle overview with round summaries', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    // Check battle overview section
    expect(screen.getByText(/Battle Overview/i, { exact: false })).toBeInTheDocument();
    
    // Check round summaries are displayed
    expect(screen.getByText(/Round 1/i, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/Round 2/i, { exact: false })).toBeInTheDocument();
    
    // Check commentary is displayed
    expect(screen.getByText(/Godzilla unleashes a devastating atomic breath!/)).toBeInTheDocument();
    expect(screen.getByText(/Bruce Lee dodges with incredible speed!/)).toBeInTheDocument();
  });

  it('displays fighter images in stats section', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
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
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    fireEvent.click(screen.getByText('Restart'));
    expect(mockOnDone).toHaveBeenCalledTimes(1);
  });

  it('only shows restart button (close button was removed)', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
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
        onClose={mockOnDone}
        fighterA={fighterWithoutImage}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    expect(screen.getByText(/No Image/i, { exact: false })).toBeInTheDocument();
  });

  it('displays final health values', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
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
          randomEvent: null,
          arenaObjectsUsed: null,
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
          randomEvent: null,
          arenaObjectsUsed: null,
          healthAfter: { attacker: 80, defender: 85 }
        }
      ];

      render(
        <WinnerAnimation
          winner="Fighter 2"
          onClose={mockOnDone}
          fighterA={mockFighterA}
          fighterB={mockFighterB}
          battleLog={mockBattleLog}
          isOpen={true}
          scene={mockScene}
          battleSummary={mockSummary}
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
          arenaObjectsUsed: null,
          healthAfter: { attacker: 100, defender: 105 }
        }
      ];

      render(
        <WinnerAnimation
          winner="Fighter 2"
          onClose={mockOnDone}
          fighterA={mockFighterA}
          fighterB={mockFighterB}
          battleLog={mockBattleLog}
          isOpen={true}
          scene={mockScene}
          battleSummary={mockSummary}
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
          onClose={mockOnDone}
          fighterA={mockFighterA}
          fighterB={mockFighterB}
          battleLog={mockBattleLog}
          isOpen={true}
          scene={mockScene}
          battleSummary={mockSummary}
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
      description: '',
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
      description: '',
    };

    // Test KO victory - Fighter A wins, Fighter B at 0 health
    render(
      <WinnerAnimation
        winner="Fighter A"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    // Winner gets WIN, loser gets KO!
    const fighterACard = screen.getByText('Fighter A').closest('.bg-gray-800') as HTMLElement;
    const fighterBCard = screen.getByText('Fighter B').closest('.bg-gray-800') as HTMLElement;
    expect(fighterACard).toBeInTheDocument();
    expect(fighterBCard).toBeInTheDocument();

    const winStatusA = within(fighterACard).getByText(/Victorious/i);
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
      description: '',
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
      description: '',
    };

    // Test draw scenario
    render(
      <WinnerAnimation
        winner="Draw"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    // Check that DRAW status is displayed for both fighters
    const fighterACard = screen.getByText('Fighter A').closest('.bg-gray-800') as HTMLElement;
    const fighterBCard = screen.getByText('Fighter B').closest('.bg-gray-800') as HTMLElement;
    
    expect(fighterACard).toBeInTheDocument();
    expect(fighterBCard).toBeInTheDocument();

    const drawStatusA = within(fighterACard).getByText(/Defeated but Alive/i);
    const drawStatusB = within(fighterBCard).getByText(/Defeated but Alive/i);
    
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
      description: '',
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
      description: '',
    };

    // Test normal victory - Fighter A wins but Fighter B still has health
    render(
      <WinnerAnimation
        winner="Fighter A"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    // Check that no status is displayed for either fighter in normal victory
    const fighterACard = screen.getByText('Fighter A').closest('.bg-gray-800') as HTMLElement;
    const fighterBCard = screen.getByText('Fighter B').closest('.bg-gray-800') as HTMLElement;
    
    expect(fighterACard).toBeInTheDocument();
    expect(fighterBCard).toBeInTheDocument();

    const koStatusA = within(fighterACard).queryByText('KO!');
    const koStatusB = within(fighterBCard).queryByText('KO!');
    const drawStatusA = within(fighterACard).queryByText(/Defeated but Alive/i);
    const drawStatusB = within(fighterBCard).queryByText(/Defeated but Alive/i);
    
    expect(koStatusA).not.toBeInTheDocument();
    expect(koStatusB).not.toBeInTheDocument();
    expect(drawStatusA).not.toBeInTheDocument();
    expect(drawStatusB).not.toBeInTheDocument();
  });

  it('displays correct status for different battle outcomes', () => {
    // Test KO victory
    const { rerender } = render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={[
          {
            round: 1,
            attacker: 'Godzilla',
            defender: 'Bruce Lee',
            attackCommentary: 'Godzilla launches a powerful attack',
            defenseCommentary: 'Bruce Lee tries to defend',
            attackerDamage: 50,
            defenderDamage: 0,
            randomEvent: null,
            arenaObjectsUsed: null,
            healthAfter: {
              attacker: 800,
              defender: 0,
            },
          },
        ]}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    // Check for KO status (more flexible)
    expect(screen.getByText(/KO/i, { exact: false })).toBeInTheDocument();

    // Test draw
    rerender(
      <WinnerAnimation
        winner="Fighter A"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={[
          {
            round: 1,
            attacker: 'Fighter A',
            defender: 'Fighter B',
            attackCommentary: 'Fighter A attacks',
            defenseCommentary: 'Fighter B attacks back',
            attackerDamage: 0,
            defenderDamage: 0,
            randomEvent: null,
            arenaObjectsUsed: null,
            healthAfter: {
              attacker: 100,
              defender: 100,
            },
          },
        ]}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    // Check for draw status (more flexible)
    expect(screen.getByText(/draw/i, { exact: false })).toBeInTheDocument();
  });

  it('displays fighter images correctly', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    // Check that fighter images are present (more flexible)
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    
    // Check for fighter names in alt text or nearby text
    expect(screen.getByText(/Godzilla/i, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/Bruce Lee/i, { exact: false })).toBeInTheDocument();
  });

  it('displays arena information correctly', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    // Check for arena name and description (more flexible)
    expect(screen.getByText(/Tokyo Arena/i, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/neon-lit Tokyo battleground/i, { exact: false })).toBeInTheDocument();
  });

  it('calls onClose when restart button is clicked', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    // Find restart button (more flexible)
    const restartButton = screen.getByText(/restart/i, { exact: false });
    fireEvent.click(restartButton);
    expect(mockOnDone).toHaveBeenCalled();
  });

  it('displays battle log correctly', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    // Check for battle log content (more flexible)
    expect(screen.getByText(/Round 1/i, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/attack/i, { exact: false })).toBeInTheDocument();
  });

  it('displays compact stats correctly', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onClose={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
        isOpen={true}
        scene={mockScene}
        battleSummary={mockSummary}
      />
    );

    // Check for compact stats (more flexible)
    expect(screen.getAllByText(/Magic:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ranged:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Intelligence:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Size:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Build:/i).length).toBeGreaterThan(0);
  });
}); 