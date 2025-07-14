import React from 'react';
import { render, screen } from '@testing-library/react';
import BattleStoryboard from './BattleStoryboard';

describe('BattleStoryboard', () => {
  const mockProps = {
    scene: {
      name: 'Death Star Hangar',
      imageUrl: '/public/vs/starWars1/scene-castle-1.jpg',
    },
    round: 2,
    attacker: {
      name: 'Darth Vader',
      imageUrl: '/public/vs/starWars1/Darth-1.jpg',
      commentary: 'Swings his lightsaber with force!'
    },
    defender: {
      name: 'Luke Skywalker',
      imageUrl: '/public/vs/starWars1/luke-1.jpg',
      commentary: 'Blocks with his saber and counters.'
    },
    previousRounds: [
      { round: 1, summary: 'Luke attacked, Vader defended.' },
    ],
    roundStep: 'attack' as const,
  };

  const mockPreviousRounds = [
    {
      round: 1,
      attacker: {
        name: 'Luke Skywalker',
        imageUrl: '/public/vs/starWars1/luke-1.jpg',
        commentary: 'Luke strikes first!'
      },
      defender: {
        name: 'Darth Vader',
        imageUrl: '/public/vs/starWars1/Darth-1.jpg',
        commentary: 'Vader parries the blow.'
      }
    }
  ];

  it('renders the top panel with scene, both fighters, and round indicator', () => {
    render(<BattleStoryboard {...mockProps} previousRounds={mockPreviousRounds} />);
    expect(screen.getByText('Death Star Hangar')).toBeInTheDocument();
    expect(screen.getAllByAltText('Darth Vader').length).toBeGreaterThan(0);
    expect(screen.getAllByAltText('Luke Skywalker').length).toBeGreaterThan(0);
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });

  it('renders the left box for the attacker with image, name, and action', () => {
    render(<BattleStoryboard {...mockProps} previousRounds={mockPreviousRounds} />);
    const attacker = screen.getByTestId('attacker-box');
    expect(attacker).toHaveTextContent('Darth Vader');
    expect(attacker).toHaveTextContent('Swings his lightsaber with force!');
    expect(screen.getAllByAltText('Darth Vader').length).toBeGreaterThan(0);
  });

  it('renders the right box for the defender with image, name, and action', () => {
    const defenderProps = { ...mockProps, roundStep: 'defense' as const };
    render(<BattleStoryboard {...defenderProps} previousRounds={mockPreviousRounds} />);
    const defender = screen.getByTestId('defender-box');
    expect(defender).toHaveTextContent('Luke Skywalker');
    expect(defender).toHaveTextContent('Blocks with his saber and counters.');
    expect(screen.getAllByAltText('Luke Skywalker').length).toBeGreaterThan(0);
  });

  it('renders the bottom panel with previous rounds', () => {
    render(<BattleStoryboard {...mockProps} previousRounds={mockPreviousRounds} />);
    // Now checks for commentary and avatars
    expect(screen.getByText('Luke strikes first!')).toBeInTheDocument();
    expect(screen.getByText('Vader parries the blow.')).toBeInTheDocument();
    expect(screen.getAllByAltText('Luke Skywalker').length).toBeGreaterThan(0);
    expect(screen.getAllByAltText('Darth Vader').length).toBeGreaterThan(0);
  });
}); 