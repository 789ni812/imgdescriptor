import React from 'react';
import { render, screen } from '@testing-library/react';
import CharacterStats from './CharacterStats';
import { useCharacterStore } from '@/lib/stores/characterStore';

// Mock the character store
jest.mock('@/lib/stores/characterStore', () => ({
  useCharacterStore: jest.fn(),
}));

const mockUseCharacterStore = useCharacterStore as jest.MockedFunction<typeof useCharacterStore>;

describe('CharacterStats', () => {
  const mockCharacter = {
    id: 'test-id',
    name: 'Test Character',
    stats: {
      intelligence: 15,
      creativity: 12,
      perception: 18,
      wisdom: 14,
    },
    experience: 250,
    level: 3,
    experienceToNext: 500,
    storyHistory: [],
    currentTurn: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockUseCharacterStore.mockReturnValue({
      character: mockCharacter,
      resetCharacter: jest.fn(),
      updateCharacter: jest.fn(),
      updateCharacterName: jest.fn(),
      addExperience: jest.fn(),
      updateStat: jest.fn(),
      updateStats: jest.fn(),
      getTotalStats: jest.fn(() => 59),
      getAverageStats: jest.fn(() => 14.75),
      addStory: jest.fn(),
      updateStory: jest.fn(),
      removeStory: jest.fn(),
      getStory: jest.fn(),
      getRecentStories: jest.fn(),
      initializeCharacterFromDescription: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render character name', () => {
    render(<CharacterStats />);
    expect(screen.getByText('Test Character')).toBeInTheDocument();
  });

  it('should render all character stats', () => {
    render(<CharacterStats />);
    
    expect(screen.getByText('INT')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    
    expect(screen.getByText('CRE')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    
    expect(screen.getByText('PER')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    
    expect(screen.getByText('WIS')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('should render level and experience', () => {
    render(<CharacterStats />);
    
    expect(screen.getByText('Lv.3')).toBeInTheDocument();
    expect(screen.getByText('250 XP')).toBeInTheDocument();
  });

  it('should render total and average stats', () => {
    render(<CharacterStats />);
    
    expect(screen.getByText('Total: 59')).toBeInTheDocument();
    expect(screen.getByText('Avg: 14.8')).toBeInTheDocument();
  });

  it('should render current turn', () => {
    render(<CharacterStats />);
    
    // Check for both parts of the turn display
    expect(screen.getByText('Turn:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should handle missing character data gracefully', () => {
    mockUseCharacterStore.mockReturnValue({
      character: {
        ...mockCharacter,
        name: '',
        stats: {
          intelligence: 0,
          creativity: 0,
          perception: 0,
          wisdom: 0,
        },
        experience: 0,
        level: 0,
        experienceToNext: 0,
        currentTurn: 1,
      },
      resetCharacter: jest.fn(),
      updateCharacter: jest.fn(),
      updateCharacterName: jest.fn(),
      addExperience: jest.fn(),
      updateStat: jest.fn(),
      updateStats: jest.fn(),
      getTotalStats: jest.fn(() => 0),
      getAverageStats: jest.fn(() => 0),
      addStory: jest.fn(),
      updateStory: jest.fn(),
      removeStory: jest.fn(),
      getStory: jest.fn(),
      getRecentStories: jest.fn(),
      initializeCharacterFromDescription: jest.fn(),
    });

    render(<CharacterStats />);
    
    expect(screen.getByText('Lv.0')).toBeInTheDocument();
    expect(screen.getByText('0 XP')).toBeInTheDocument();
    expect(screen.getByText('Total: 0')).toBeInTheDocument();
    expect(screen.getByText('Avg: 0.0')).toBeInTheDocument();
    expect(screen.getByText('Turn:')).toBeInTheDocument();
    
    // Check that the turn value is 1 by looking for it in the turn section
    const turnSection = screen.getByText('Turn:').closest('div');
    expect(turnSection).toHaveTextContent('1');
  });

  it('should apply custom className when provided', () => {
    const customClass = 'custom-stats-class';
    render(<CharacterStats className={customClass} />);
    
    const container = screen.getByTestId('character-stats');
    expect(container).toHaveClass(customClass);
  });

  it('should format average stats to one decimal place', () => {
    mockUseCharacterStore.mockReturnValue({
      character: mockCharacter,
      resetCharacter: jest.fn(),
      updateCharacter: jest.fn(),
      updateCharacterName: jest.fn(),
      addExperience: jest.fn(),
      updateStat: jest.fn(),
      updateStats: jest.fn(),
      getTotalStats: jest.fn(() => 59),
      getAverageStats: jest.fn(() => 14.75),
      addStory: jest.fn(),
      updateStory: jest.fn(),
      removeStory: jest.fn(),
      getStory: jest.fn(),
      getRecentStories: jest.fn(),
      initializeCharacterFromDescription: jest.fn(),
    });

    render(<CharacterStats />);
    
    expect(screen.getByText('Avg: 14.8')).toBeInTheDocument();
  });

  it('should display character stats in a compact format', () => {
    render(<CharacterStats />);
    
    const container = screen.getByTestId('character-stats');
    expect(container).toBeInTheDocument();
    
    // Check that all stat elements are present
    const statElements = screen.getAllByText(/INT|CRE|PER|WIS/);
    expect(statElements).toHaveLength(4);
  });
}); 