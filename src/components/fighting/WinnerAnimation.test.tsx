import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
        onClose={mockOnClose}
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
        onClose={mockOnClose}
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
        onClose={mockOnClose}
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
        onClose={mockOnClose}
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
        onClose={mockOnClose}
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
        onClose={mockOnClose}
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
        onClose={mockOnClose}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
      />
    );

    fireEvent.click(screen.getByText('Restart'));
    expect(mockOnDone).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onDone={mockOnDone}
        onClose={mockOnClose}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
      />
    );

    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not show close button when onClose is not provided', () => {
    render(
      <WinnerAnimation
        winner="Godzilla"
        onDone={mockOnDone}
        fighterA={mockFighterA}
        fighterB={mockFighterB}
        battleLog={mockBattleLog}
      />
    );

    expect(screen.queryByText('Close')).not.toBeInTheDocument();
  });

  it('handles missing fighter images gracefully', () => {
    const fighterWithoutImage = { ...mockFighterA, imageUrl: '' };
    
    render(
      <WinnerAnimation
        winner="Godzilla"
        onDone={mockOnDone}
        onClose={mockOnClose}
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
        onClose={mockOnClose}
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
}); 