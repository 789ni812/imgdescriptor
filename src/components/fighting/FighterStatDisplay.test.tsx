import React from 'react';
import { render, screen } from '@testing-library/react';
import FighterStatDisplay from './FighterStatDisplay';

// Mock fighter data with all stats including unique abilities
const mockFighter = {
  id: 'test-fighter',
  name: 'Darth Vader',
  imageUrl: '/test-vader.jpg',
  stats: {
    health: 150,
    maxHealth: 150,
    strength: 45,
    agility: 35,
    defense: 40,
    luck: 25,
    magic: 80,
    ranged: 60,
    intelligence: 85,
    age: 45,
    size: 'large' as const,
    build: 'muscular' as const,
  },
  uniqueAbilities: ['Force Choke', 'Force Lightning', 'Lightsaber Mastery'],
  description: 'Dark Lord of the Sith',
};

const mockFighterNoAbilities = {
  id: 'test-fighter-2',
  name: 'Bruce Lee',
  imageUrl: '/test-bruce.jpg',
  stats: {
    health: 100,
    maxHealth: 100,
    strength: 35,
    agility: 85,
    defense: 25,
    luck: 20,
    age: 32,
    size: 'medium' as const,
    build: 'muscular' as const,
  },
  uniqueAbilities: [],
  description: 'Martial Arts Master',
};

describe('FighterStatDisplay', () => {
  it('displays all basic fighter stats', () => {
    render(<FighterStatDisplay fighter={mockFighter} />);

    // Check basic stats are displayed
    expect(screen.getByText('Health:')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Strength:')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('Agility:')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('Defense:')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('Luck:')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('displays optional stats when present', () => {
    render(<FighterStatDisplay fighter={mockFighter} />);

    // Check optional stats are displayed
    expect(screen.getByText('Magic:')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('Ranged:')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('Intelligence:')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('displays unique abilities as badges', () => {
    render(<FighterStatDisplay fighter={mockFighter} />);

    // Check unique abilities are displayed
    expect(screen.getByText('Force Choke')).toBeInTheDocument();
    expect(screen.getByText('Force Lightning')).toBeInTheDocument();
    expect(screen.getByText('Lightsaber Mastery')).toBeInTheDocument();
  });

  it('handles fighters without unique abilities', () => {
    render(<FighterStatDisplay fighter={mockFighterNoAbilities} />);

    // Should not show abilities section when none exist
    expect(screen.queryByText('Unique Abilities')).not.toBeInTheDocument();
  });

  it('displays fighter image when provided', () => {
    render(<FighterStatDisplay fighter={mockFighter} />);

    const fighterImage = screen.getByAltText('Darth Vader');
    expect(fighterImage).toBeInTheDocument();
    expect(fighterImage).toHaveAttribute('src', '/test-vader.jpg');
  });

  it('shows placeholder when no image is provided', () => {
    const fighterWithoutImage = { ...mockFighter, imageUrl: '' };
    render(<FighterStatDisplay fighter={fighterWithoutImage} />);

    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('displays fighter name prominently', () => {
    render(<FighterStatDisplay fighter={mockFighter} />);

    expect(screen.getByText('Darth Vader')).toBeInTheDocument();
  });

  it('shows stat progress bars in detailed mode', () => {
    render(<FighterStatDisplay fighter={mockFighter} size="detailed" />);

    // Should show progress bars for key stats
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByText('Agility')).toBeInTheDocument();
  });

  it('shows compact view when size is compact', () => {
    render(<FighterStatDisplay fighter={mockFighter} size="compact" />);

    // Should show stats in a more condensed format
    expect(screen.getByText('Darth Vader')).toBeInTheDocument();
    expect(screen.getByText(/HP:\s*150/)).toBeInTheDocument();
  });

  it('applies proper CSS classes for styling', () => {
    render(<FighterStatDisplay fighter={mockFighter} />);

    // Check that the main container has proper classes
    const container = screen.getByTestId('fighter-stat-display');
    expect(container).toHaveClass('bg-gray-800', 'rounded-lg', 'p-4');
  });

  it('shows tooltips when enabled', () => {
    render(<FighterStatDisplay fighter={mockFighter} showTooltips={true} />);

    // Should have tooltip attributes on stat elements
    const healthStat = screen.getByText('Health:');
    expect(healthStat.closest('[title]')).toBeInTheDocument();
  });

  it('handles missing optional stats gracefully', () => {
    const fighterWithMinimalStats = {
      id: 'minimal-fighter',
      name: 'Simple Fighter',
      imageUrl: '',
      stats: {
        health: 50,
        maxHealth: 50,
        strength: 10,
        agility: 10,
        defense: 10,
        luck: 10,
        age: 25,
        size: 'medium' as const,
        build: 'average' as const,
      },
      uniqueAbilities: [],
      description: 'A simple fighter',
    };

    render(<FighterStatDisplay fighter={fighterWithMinimalStats} />);

    // Should display basic stats without errors
    expect(screen.getByText('Simple Fighter')).toBeInTheDocument();
    expect(screen.getByText('Health:')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Strength:')).toBeInTheDocument();
    // Check that at least one "10" value exists (there are multiple stats with value 10)
    expect(screen.getAllByText('10')).toHaveLength(4); // Health, Strength, Agility, Defense, Luck all have value 10
  });
}); 