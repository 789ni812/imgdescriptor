import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GamebookPage } from './GamebookPage';
import type { StoryDescription, ImageDescription } from '@/lib/types';
import type { Choice } from '@/lib/types/character';

// Mock the LoadingSpinner component
jest.mock('./ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} data-testid="next-image" />
  ),
}));

const mockStory: StoryDescription = {
  sceneTitle: 'The Mysterious Forest',
  summary: 'You find yourself at the edge of a dark forest. Ancient trees loom overhead, their branches creating a canopy that blocks most of the sunlight.',
  dilemmas: ['Should you enter the forest?', 'Should you look for another path?'],
  cues: 'Look for any signs of civilization or paths leading through the trees.',
  consequences: ['The forest path leads to an ancient temple.', 'You discover a hidden village.']
};

const mockImageDescription: ImageDescription = {
  setting: 'A dense forest with tall trees and thick undergrowth.',
  objects: ['Ancient trees', 'Moss-covered rocks', 'Twisting vines'],
  characters: [],
  mood: 'Mysterious and foreboding, yet somehow inviting.',
  hooks: ['A faint path winds through the trees', 'Strange sounds echo from within']
};

const mockChoices: Choice[] = [
  {
    id: 'choice-1',
    text: 'Enter the forest',
    description: 'Venture into the mysterious woods',
    type: 'action'
  },
  {
    id: 'choice-2',
    text: 'Search for another path',
    description: 'Look for a safer route around the forest',
    type: 'action'
  }
];

const mockStats = {
  intelligence: 10,
  creativity: 10,
  perception: 10,
  wisdom: 10,
};

const defaultProps = {
  turnNumber: 1,
  imageUrl: '/test-image.jpg',
  imageDescription: null,
  story: null,
  isStoryLoading: false,
  choices: [],
  isChoicesLoading: false,
  onSelectChoice: jest.fn(),
  isDescriptionLoading: false,
  isCurrentTurn: true,
  stats: mockStats,
};

describe('GamebookPage', () => {
  it('should render turn header correctly', () => {
    render(<GamebookPage {...defaultProps} />);
    expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    expect(screen.getByText('Your adventure continues...')).toBeInTheDocument();
  });

  it('should render image when provided', () => {
    render(<GamebookPage {...defaultProps} imageUrl="/test-image.jpg" />);
    const image = screen.getByTestId('next-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('should render image description when provided', () => {
    render(<GamebookPage {...defaultProps} imageDescription={mockImageDescription} />);
    expect(screen.getByText('Scene Description')).toBeInTheDocument();
    expect(screen.getByText(mockImageDescription.setting)).toBeInTheDocument();
    expect(screen.getByText(mockImageDescription.mood)).toBeInTheDocument();
  });

  it('should render story when provided', () => {
    render(<GamebookPage {...defaultProps} story={mockStory} />);
    expect(screen.getByText(mockStory.sceneTitle)).toBeInTheDocument();
    expect(screen.getByText(mockStory.summary)).toBeInTheDocument();
    expect(screen.getByText('Look for:')).toBeInTheDocument();
    expect(screen.getByText(mockStory.cues)).toBeInTheDocument();
    expect(screen.getByText('Key Decisions')).toBeInTheDocument();
    mockStory.dilemmas.forEach(dilemma => {
      expect(screen.getByText(`• ${dilemma}`)).toBeInTheDocument();
    });
  });

  it('should render loading state for story', () => {
    render(<GamebookPage {...defaultProps} isStoryLoading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('The Dungeon Master is crafting your story...')).toBeInTheDocument();
  });

  it('should render loading state for description', () => {
    render(<GamebookPage {...defaultProps} isDescriptionLoading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Analyzing the scene...')).toBeInTheDocument();
  });

  it('should render choices when story is available', () => {
    render(<GamebookPage {...defaultProps} story={mockStory} choices={mockChoices} />);
    expect(screen.getByText('What will you do?')).toBeInTheDocument();
    expect(screen.getByText('Enter the forest')).toBeInTheDocument();
    expect(screen.getByText('Search for another path')).toBeInTheDocument();
    expect(screen.getByText('Venture into the mysterious woods')).toBeInTheDocument();
    expect(screen.getByText('Look for a safer route around the forest')).toBeInTheDocument();
  });

  it('should render loading state for choices', () => {
    render(<GamebookPage {...defaultProps} story={mockStory} isChoicesLoading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Preparing your choices...')).toBeInTheDocument();
  });

  it('should call onSelectChoice when choice is clicked', () => {
    const mockOnSelectChoice = jest.fn();
    render(
      <GamebookPage 
        {...defaultProps} 
        story={mockStory} 
        choices={mockChoices} 
        onSelectChoice={mockOnSelectChoice}
      />
    );
    
    fireEvent.click(screen.getByText('Enter the forest'));
    expect(mockOnSelectChoice).toHaveBeenCalledWith('choice-1');
  });

  it('should not render choices section when no story is available', () => {
    render(<GamebookPage {...defaultProps} choices={mockChoices} />);
    expect(screen.queryByText('What will you do?')).not.toBeInTheDocument();
    expect(screen.queryByText('Enter the forest')).not.toBeInTheDocument();
  });

  it('should not render when not current turn and no content', () => {
    const { container } = render(
      <GamebookPage 
        {...defaultProps} 
        isCurrentTurn={false}
        story={null}
        imageDescription={null}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when not current turn but has content', () => {
    render(
      <GamebookPage 
        {...defaultProps} 
        isCurrentTurn={false}
        story={mockStory}
      />
    );
    expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    expect(screen.queryByText('Your adventure continues...')).not.toBeInTheDocument();
  });

  it('should render choice numbers correctly', () => {
    render(<GamebookPage {...defaultProps} story={mockStory} choices={mockChoices} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
}); 