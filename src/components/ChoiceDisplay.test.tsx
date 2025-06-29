import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChoiceDisplay } from './ChoiceDisplay';
import type { Choice, ChoiceOutcome } from '@/lib/types/character';

// Mock the character store
const mockMakeChoice = jest.fn();
jest.mock('@/lib/stores/characterStore', () => ({
  useCharacterStore: () => ({
    makeChoice: mockMakeChoice,
    currentChoices: [],
    choiceHistory: [],
  }),
}));

describe('ChoiceDisplay', () => {
  const mockChoices: Choice[] = [
    {
      id: 'choice-1',
      text: 'Explore the cave',
      description: 'Venture into the dark cave to discover its secrets',
      statRequirements: { intelligence: 8 },
      consequences: ['May find treasure', 'Risk of danger'],
    },
    {
      id: 'choice-2',
      text: 'Return to camp',
      description: 'Head back to the safety of your camp',
      consequences: ['Safe option', 'Miss potential rewards'],
    },
  ];

  const mockChoiceOutcome: ChoiceOutcome = {
    id: 'outcome-1',
    choiceId: 'choice-1',
    text: 'Explore the cave',
    outcome: 'You found ancient treasure and gained wisdom!',
    statChanges: { intelligence: 2, wisdom: 1 },
    timestamp: '2025-01-27T10:00:00Z',
    turnNumber: 1,
  };

  beforeEach(() => {
    mockMakeChoice.mockClear();
  });

  it('should render choices when available', () => {
    // Arrange
    render(<ChoiceDisplay choices={mockChoices} />);

    // Assert
    expect(screen.getByText('Explore the cave')).toBeInTheDocument();
    expect(screen.getByText('Return to camp')).toBeInTheDocument();
    expect(screen.getByText('Venture into the dark cave to discover its secrets')).toBeInTheDocument();
  });

  it('should handle choice selection', async () => {
    // Arrange
    render(<ChoiceDisplay choices={mockChoices} />);

    // Act
    const choiceButtons = screen.getAllByText('Choose');
    fireEvent.click(choiceButtons[0]);

    // Assert
    await waitFor(() => {
      expect(mockMakeChoice).toHaveBeenCalledWith('choice-1');
    });
  });

  it('should display choice outcomes with stat changes', () => {
    // Arrange
    render(<ChoiceDisplay choices={[]} outcomes={[mockChoiceOutcome]} />);

    // Assert
    expect(screen.getByText('You found ancient treasure and gained wisdom!')).toBeInTheDocument();
    expect(screen.getByText(/intelligence.*\+.*2/i)).toBeInTheDocument();
    expect(screen.getByText(/wisdom.*\+.*1/i)).toBeInTheDocument();
  });

  it('should show stat requirements for choices', () => {
    // Arrange
    render(<ChoiceDisplay choices={mockChoices} />);

    // Assert
    expect(screen.getByText(/requires.*intelligence.*8/i)).toBeInTheDocument();
  });

  it('should show consequences for choices', () => {
    // Arrange
    render(<ChoiceDisplay choices={mockChoices} />);

    // Assert
    expect(screen.getByText(/may find treasure/i)).toBeInTheDocument();
    expect(screen.getByText(/risk of danger/i)).toBeInTheDocument();
  });

  it('should render empty state when no choices available', () => {
    // Arrange
    render(<ChoiceDisplay choices={[]} />);

    // Assert
    expect(screen.getByText('No choices available')).toBeInTheDocument();
  });
}); 