import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TurnCard from './TurnCard';

const baseProps = {
  turnNumber: 2,
  imageUrl: '/imgRepository/turn2.jpg',
  imageDescription: 'A misty castle looms in the distance...',
  story: 'The hero approaches the castle gates...',
  isStoryLoading: false,
  choices: [
    { id: 'c1', text: 'Knock on the gate', description: 'Try the main entrance', statRequirements: { intelligence: 10 }, consequences: ['You might be let in', 'You might be attacked'] },
    { id: 'c2', text: 'Sneak around', description: 'Look for another way in', statRequirements: { perception: 12 }, consequences: ['You find a secret entrance', 'You are spotted by guards'] }
  ],
  isChoicesLoading: false,
  selectedChoiceId: undefined,
  choiceOutcome: undefined,
  characterStats: { intelligence: 12, creativity: 10, perception: 14, wisdom: 11 },
  statChanges: { intelligence: 1, perception: -1 },
  isCurrentTurn: true,
  onSelectChoice: jest.fn(),
};

describe('TurnCard', () => {
  it('renders turn number, image, and stat changes', () => {
    render(<TurnCard {...baseProps} />);
    expect(screen.getByText('Turn 2')).toBeInTheDocument();
    expect(screen.getByAltText(/turn 2/i)).toBeInTheDocument();
    const statBadges = screen.getAllByTestId('stat-badge');
    expect(statBadges[0]).toHaveTextContent('Intelligence 12+1');
    expect(statBadges[1]).toHaveTextContent('Creativity 10');
    expect(statBadges[2]).toHaveTextContent('Perception 14-1');
    expect(statBadges[3]).toHaveTextContent('Wisdom 11');
  });

  it('shows accordions for description, story, and choices', () => {
    render(<TurnCard {...baseProps} />);
    expect(screen.getByText(/Image Description/)).toBeInTheDocument();
    expect(screen.getByText(/Story/)).toBeInTheDocument();
    expect(screen.getByText(/Choices/)).toBeInTheDocument();
  });

  it('shows loader when story is loading', () => {
    render(<TurnCard {...baseProps} isStoryLoading={true} />);
    expect(screen.getByTestId('story-loader')).toBeInTheDocument();
  });

  it('shows loader when choices are loading', () => {
    render(<TurnCard {...baseProps} isChoicesLoading={true} />);
    expect(screen.getByTestId('choices-loader')).toBeInTheDocument();
  });

  it('only allows choice selection for current turn', () => {
    render(<TurnCard {...baseProps} isCurrentTurn={false} selectedChoiceId="c1" choiceOutcome={{ id: 'o1', text: 'Knock on the gate', outcome: 'The gate creaks open...' }} />);
    // Expand the choices accordion
    fireEvent.click(screen.getByText(/Choices/));
    expect(screen.queryByRole('button', { name: /choose/i })).not.toBeInTheDocument();
    expect(screen.getByText(/The gate creaks open/)).toBeInTheDocument();
  });

  it('accordions are collapsed by default for previous turns', () => {
    render(<TurnCard {...baseProps} isCurrentTurn={false} />);
    // Accordions should not be expanded
    expect(screen.getByText(/Image Description/).closest('[aria-expanded]')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText(/Story/).closest('[aria-expanded]')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText(/Choices/).closest('[aria-expanded]')).toHaveAttribute('aria-expanded', 'false');
  });

  it('is accessible and visually distinct', () => {
    render(<TurnCard {...baseProps} />);
    expect(screen.getByRole('region', { name: /Turn 2/i })).toBeInTheDocument();
  });
}); 