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
    roundStep: 'attack' as 'attack',
  };

  it('renders the top panel with scene, both fighters, and round indicator', () => {
    render(<BattleStoryboard {...mockProps} />);
    expect(screen.getByText('Death Star Hangar')).toBeInTheDocument();
    expect(screen.getByAltText('Darth Vader')).toBeInTheDocument();
    expect(screen.getByAltText('Luke Skywalker')).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });

  it('renders the left box for the attacker with image, name, and action', () => {
    render(<BattleStoryboard {...mockProps} />);
    const attacker = screen.getByTestId('attacker-box');
    expect(attacker).toHaveTextContent('Darth Vader');
    expect(attacker).toHaveTextContent('Swings his lightsaber with force!');
    expect(screen.getByAltText('Darth Vader')).toBeInTheDocument();
  });

  it('renders the right box for the defender with image, name, and action', () => {
    render(<BattleStoryboard {...mockProps} />);
    const defender = screen.getByTestId('defender-box');
    expect(defender).toHaveTextContent('Luke Skywalker');
    expect(defender).toHaveTextContent('Blocks with his saber and counters.');
    expect(screen.getByAltText('Luke Skywalker')).toBeInTheDocument();
  });

  it('renders the bottom panel with previous rounds', () => {
    render(<BattleStoryboard {...mockProps} />);
    expect(screen.getByText('Round 1: Luke attacked, Vader defended.')).toBeInTheDocument();
  });
}); 