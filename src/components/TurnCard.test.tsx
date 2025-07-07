import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import TurnCard from './TurnCard';
import type { StoryDescription } from '@/lib/types';

const baseStory: StoryDescription = {
  sceneTitle: 'The Castle Gates',
  summary: 'The hero approaches the castle gates...',
  dilemmas: ['Knock or sneak?', 'Trust the guards?'],
  cues: 'Fog swirls around the entrance.',
  consequences: ['Gain entry', 'Alert the guards']
};

const baseImageDescription = {
  setting: 'Castle exterior',
  objects: ['castle', 'fog'],
  characters: ['hero'],
  mood: 'mysterious',
  hooks: ['approaching the gates']
};

const baseProps = {
  turnNumber: 2,
  imageUrl: '/imgRepository/turn2.jpg',
  imageDescription: baseImageDescription,
  story: baseStory,
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
  isDescriptionLoading: false,
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
    expect(screen.getByTestId('loading-spinner-svg')).toBeInTheDocument();
    expect(screen.getByText('Generating story...')).toBeInTheDocument();
  });

  it('shows loader when choices are loading', () => {
    render(<TurnCard {...baseProps} isChoicesLoading={true} />);
    expect(screen.getByTestId('choices-loader')).toBeInTheDocument();
  });

  it('only allows choice selection for current turn', () => {
    render(<TurnCard {...baseProps} isCurrentTurn={false} selectedChoiceId="c1" choiceOutcome={{ id: 'o1', text: 'Knock on the gate', outcome: 'The gate creaks open...', choiceId: 'c1', timestamp: '2024-01-01T00:00:00Z', turnNumber: 2 }} />);
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

  it('shows spinner while story is loading, then displays story as soon as available', () => {
    render(<TurnCard {...baseProps} isStoryLoading={true} story={null} />);
    expect(screen.getByTestId('loading-spinner-svg')).toBeInTheDocument();
    expect(screen.getByText('Generating story...')).toBeInTheDocument();
    // When loading is done and story is present, should show story, not 'Not available yet'
    render(<TurnCard {...baseProps} isStoryLoading={false} story={baseStory} />);
    expect(screen.getByText('The Castle Gates')).toBeInTheDocument();
  });

  it('shows story content when story is available', () => {
    render(<TurnCard {...baseProps} story={null} />);
    const storyTrigger = screen.getAllByText(/Story/)[0];
    fireEvent.click(storyTrigger);
    expect(screen.getByText('Not available yet')).toBeInTheDocument();
    
    render(<TurnCard {...baseProps} story={baseStory} />);
    const storyTrigger2 = screen.getAllByText(/Story/)[0];
    fireEvent.click(storyTrigger2);
    expect(screen.getByText('The Castle Gates')).toBeInTheDocument();
  });

  it.skip('choices accordion only shows spinner after story is available, and only shows choices after they are generated', () => {
    // If story is missing, choices should show 'Not available yet' even if loading
    render(<TurnCard {...baseProps} story={null} isChoicesLoading={true} choices={[]} isCurrentTurn={false} />);
    fireEvent.click(screen.getAllByText(/Choices/)[0]);
    expect(screen.getByText(/Not available yet/i)).toBeInTheDocument();
    // If story is present and choices are loading, show spinner
    render(<TurnCard {...baseProps} story={baseStory} isChoicesLoading={true} choices={[]} isCurrentTurn={false} />);
    fireEvent.click(screen.getAllByText(/Choices/)[0]);
    expect(screen.getByTestId('choices-loader')).toBeInTheDocument();
    // If story and choices are present, show choices
    render(<TurnCard {...baseProps} story={baseStory} isChoicesLoading={false} choices={[{ id: 'c1', text: 'Choice 1' }]} isCurrentTurn={false} />);
    fireEvent.click(screen.getAllByText(/Choices/)[0]);
    expect(screen.getByText((content) => content.includes('Choice 1'))).toBeInTheDocument();
  });

  it('after a choice is made, choices accordion displays all choices, highlights the selected one and its outcome', () => {
    render(<TurnCard {...baseProps} selectedChoiceId="c1" choiceOutcome={{ id: 'o1', text: 'Choice 1', outcome: 'You succeed!', choiceId: 'c1', timestamp: '2024-01-01T00:00:00Z', turnNumber: 2 }} choices={[{ id: 'c1', text: 'Choice 1' }, { id: 'c2', text: 'Choice 2' }]} />);
    // Ensure choices accordion is open
    const choicesTrigger = screen.getAllByText(/Choices/)[0];
    if (choicesTrigger.closest('button')?.getAttribute('aria-expanded') !== 'true') {
      fireEvent.click(choicesTrigger);
    }
    const choicesContent = screen.getAllByTestId('choices-content').find(el => el.getAttribute('data-state') === 'open');
    expect(choicesContent).toBeTruthy();
    expect(within(choicesContent!).getByText((content) => content.includes('Choice 1'))).toBeInTheDocument();
    expect(within(choicesContent!).getByText((content) => content.includes('Choice 2'))).toBeInTheDocument();
    expect(within(choicesContent!).getByText(/Selected/)).toBeInTheDocument();
    expect(within(choicesContent!).getByText(/You succeed!/)).toBeInTheDocument();
  });

  it('after a turn is complete, next turn accordions are empty or show Not available yet', async () => {
    const { rerender } = render(<TurnCard {...baseProps} turnNumber={2} isCurrentTurn={false} />);
    
    // Image Description - should show structured content when available
    const descTrigger = screen.getAllByText(/Image Description/)[0];
      fireEvent.click(descTrigger);
    // Wait for accordion to open and content to be visible
    await waitFor(() => {
      const descContent = screen.getAllByTestId('desc-content').find(el => !el.hasAttribute('hidden'));
    expect(descContent).toBeTruthy();
      expect(within(descContent!).getByText('Castle exterior')).toBeInTheDocument();
    });
    
    // Story - when no story, StoryDisplay shows empty card container
    // Re-render with story={null} to test the Not available yet state
    rerender(<TurnCard {...baseProps} turnNumber={2} isCurrentTurn={false} story={null} />);
    const storyTrigger = screen.getAllByText(/Story/)[0];
      fireEvent.click(storyTrigger);
    // Wait for empty card container to appear (StoryDisplay shows empty container when story is null)
    await waitFor(() => {
      const storyContent = screen.getAllByTestId('story-content').find(el => !el.hasAttribute('hidden'));
    expect(storyContent).toBeTruthy();
    expect(within(storyContent!).getByTestId('card-container')).toBeInTheDocument();
    });
    
    // Choices - when no choices, should show "Not available yet"
    const choicesTrigger = screen.getAllByText(/Choices/)[0];
      fireEvent.click(choicesTrigger);
    // Wait for "Not available yet" to appear
    await waitFor(() => {
      const choicesContent = screen.getAllByTestId('choices-content').find(el => !el.hasAttribute('hidden'));
    expect(choicesContent).toBeTruthy();
      expect(within(choicesContent!).getByText('Not available yet')).toBeInTheDocument();
    });
  });

  it('accordions are always user-expandable/collapsible for all turns and sections', () => {
    render(<TurnCard {...baseProps} isCurrentTurn={false} />);
    // All accordions should be collapsed by default
    expect(screen.getByText(/Image Description/).closest('[aria-expanded]')).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(screen.getByText(/Image Description/));
    expect(screen.getByText(/Image Description/).closest('[aria-expanded]')).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByText(/Image Description/));
    expect(screen.getByText(/Image Description/).closest('[aria-expanded]')).toHaveAttribute('aria-expanded', 'false');
  });

  it('each section shows generated content, spinner if generating, or Not available yet if missing', async () => {
    // Test with no imageDescription (null) - should show "Not available yet"
    render(<TurnCard {...baseProps} imageDescription={null} isDescriptionLoading={false} isCurrentTurn={false} />);
    fireEvent.click(screen.getAllByText(/Image Description/)[0]);
    await waitFor(() => {
      const descContent = screen.getAllByTestId('desc-content').find(el => !el.hasAttribute('hidden'));
      expect(descContent).toBeTruthy();
      expect(within(descContent!).getByText('Not available yet')).toBeInTheDocument();
    });
  });

  it.skip('renders summary if provided', () => {
    const summary = '- Health from 50 to 20, Reason: "the character found out they had won the lottery and jumped up and banged their head on the ceiling, they are lying on the ground"';
    render(<TurnCard {...baseProps} summary={summary} />);
    // Open the story accordion
    fireEvent.click(screen.getAllByText(/Story/)[0]);
    // Wait for the accordion to open and then find the content
    const storyContent = screen.getAllByTestId('story-content').find(el => 
      el.getAttribute('data-state') === 'open' || 
      !el.hasAttribute('hidden')
    );
    expect(storyContent).toBeTruthy();
    expect(within(storyContent!).getByText('Summary of Changes')).toBeInTheDocument();
    expect(within(storyContent!).getByText(/Health from 50 to 20/)).toBeInTheDocument();
  });
}); 