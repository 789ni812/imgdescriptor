"use client";

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './page';
import { createCharacter } from '@/lib/types/character';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// Mock the character store
const mockUseCharacterStore = jest.fn();
jest.mock('@/lib/stores/characterStore', () => ({
  useCharacterStore: () => mockUseCharacterStore(),
}));

// Mock the hooks
const mockUseStoryGeneration = jest.fn();
jest.mock('@/hooks/useStoryGeneration', () => ({
  useStoryGeneration: () => mockUseStoryGeneration(),
}));

jest.mock('@/hooks/useImageAnalysis', () => ({
  useImageAnalysis: () => ({
    description: null,
    isDescriptionLoading: false,
    error: null,
    analyzeImage: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ description: 'A beautiful landscape with mountains.' }),
    });
    
    // Default mock implementations
    mockUseCharacterStore.mockReturnValue({
      character: {
        imageHistory: [],
        currentTurn: 0,
        storyHistory: [],
        stats: { intelligence: 15, creativity: 12, perception: 18, wisdom: 14 },
      },
      addImageToHistory: jest.fn(),
      initializeCharacterFromDescription: jest.fn(),
      addExperience: jest.fn(),
      incrementTurn: jest.fn(),
      resetCharacter: jest.fn(),
      updateImageDescription: jest.fn(),
      updateImageStory: jest.fn(),
    });

    mockUseStoryGeneration.mockReturnValue({
      story: null,
      isStoryLoading: false,
      storyError: null,
      generateStory: jest.fn(),
    });
  });

  it('should render a main content container with correct layout classes', () => {
    render(<Home />);
    const container = screen.getByTestId('main-content-container');
    expect(container).toHaveClass('max-w-7xl', 'mx-auto', 'p-4', 'sm:p-6', 'lg:p-8');
  });

  it('should implement a flex wrap card layout', () => {
    render(<Home />);
    // Find the card container by looking for the div with flex classes
    const mainContainer = screen.getByTestId('main-content-container');
    const cardContainer = Array.from(mainContainer.querySelectorAll('div')).find(div =>
      div.className.includes('flex') &&
      div.className.includes('flex-wrap') &&
      div.className.includes('gap-6') &&
      div.className.includes('justify-start')
    );
    expect(cardContainer).toHaveClass('flex', 'flex-wrap', 'gap-6', 'justify-start');
  });

  it('renders only the ImageUpload component on initial load', () => {
    render(<Home />);
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('description-display')).not.toBeInTheDocument();
    expect(screen.queryByTestId('story-display')).not.toBeInTheDocument();
  });

  it('should render the gallery section below the main cards', () => {
    render(<Home />);
    // The gallery section should be present even before any images are uploaded
    const mainContainer = screen.getByTestId('main-content-container');
    const gallerySection = Array.from(mainContainer.querySelectorAll('div')).find(div =>
      div.className.includes('mt-8') && div.className.includes('space-y-6')
    );
    expect(gallerySection).toBeInTheDocument();
    // Should be empty initially since no images are uploaded
    expect(gallerySection?.children.length).toBe(0);
  });
});

describe('Final Story Generation Button', () => {
  it('should show final story generation button on Turn 3 after story is generated', () => {
    // Arrange: Set up character on Turn 3 with story
    const mockCharacter = {
      ...createCharacter(),
      currentTurn: 3,
      storyHistory: [
        {
          id: 'story-1',
          text: 'Turn 1 story content',
          timestamp: '2025-01-27T10:00:00Z',
          turnNumber: 1,
          imageDescription: 'Turn 1 description'
        },
        {
          id: 'story-2',
          text: 'Turn 2 story content',
          timestamp: '2025-01-27T10:05:00Z',
          turnNumber: 2,
          imageDescription: 'Turn 2 description'
        }
      ]
    };

    // Mock the store to return our test character
    mockUseCharacterStore.mockReturnValue({
      character: mockCharacter,
      initializeCharacterFromDescription: jest.fn(),
      addExperience: jest.fn(),
      incrementTurn: jest.fn(),
      resetCharacter: jest.fn(),
      addImageToHistory: jest.fn(),
      updateImageDescription: jest.fn(),
      updateImageStory: jest.fn(),
    });

    // Mock story generation to return a story
    mockUseStoryGeneration.mockReturnValue({
      story: 'Turn 3 story content',
      isStoryLoading: false,
      storyError: null,
      generateStory: jest.fn(),
    });

    // Act: Render the page
    render(<Home />);

    // Assert: Final story generation button should be visible
    const finalStoryButton = screen.getByRole('button', { name: /generate final story/i });
    expect(finalStoryButton).toBeInTheDocument();
  });

  it('should not show final story generation button before Turn 3', () => {
    // Arrange: Set up character on Turn 2
    const mockCharacter = {
      ...createCharacter(),
      currentTurn: 2,
      storyHistory: [
        {
          id: 'story-1',
          text: 'Turn 1 story content',
          timestamp: '2025-01-27T10:00:00Z',
          turnNumber: 1,
          imageDescription: 'Turn 1 description'
        }
      ]
    };

    mockUseCharacterStore.mockReturnValue({
      character: mockCharacter,
      initializeCharacterFromDescription: jest.fn(),
      addExperience: jest.fn(),
      incrementTurn: jest.fn(),
      resetCharacter: jest.fn(),
      addImageToHistory: jest.fn(),
      updateImageDescription: jest.fn(),
      updateImageStory: jest.fn(),
    });

    mockUseStoryGeneration.mockReturnValue({
      story: 'Turn 2 story content',
      isStoryLoading: false,
      storyError: null,
      generateStory: jest.fn(),
    });

    // Act: Render the page
    render(<Home />);

    // Assert: Final story generation button should NOT be visible
    const finalStoryButton = screen.queryByRole('button', { name: /generate final story/i });
    expect(finalStoryButton).not.toBeInTheDocument();
  });

  it('should not show final story generation button on Turn 3 if no story is generated', () => {
    // Arrange: Set up character on Turn 3 but no story yet
    const mockCharacter = {
      ...createCharacter(),
      currentTurn: 3,
      storyHistory: [
        {
          id: 'story-1',
          text: 'Turn 1 story content',
          timestamp: '2025-01-27T10:00:00Z',
          turnNumber: 1,
          imageDescription: 'Turn 1 description'
        },
        {
          id: 'story-2',
          text: 'Turn 2 story content',
          timestamp: '2025-01-27T10:05:00Z',
          turnNumber: 2,
          imageDescription: 'Turn 2 description'
        }
      ]
    };

    mockUseCharacterStore.mockReturnValue({
      character: mockCharacter,
      initializeCharacterFromDescription: jest.fn(),
      addExperience: jest.fn(),
      incrementTurn: jest.fn(),
      resetCharacter: jest.fn(),
      addImageToHistory: jest.fn(),
      updateImageDescription: jest.fn(),
      updateImageStory: jest.fn(),
    });

    mockUseStoryGeneration.mockReturnValue({
      story: null,
      isStoryLoading: false,
      storyError: null,
      generateStory: jest.fn(),
    });

    // Act: Render the page
    render(<Home />);

    // Assert: Final story generation button should NOT be visible
    const finalStoryButton = screen.queryByRole('button', { name: /generate final story/i });
    expect(finalStoryButton).not.toBeInTheDocument();
  });
});

describe('Final Story Generation Flow', () => {
  it('should show a loading indicator and then display the final story after clicking the button', async () => {
    // Arrange: Set up character on Turn 3 with story
    const mockCharacter = {
      ...createCharacter(),
      currentTurn: 3,
      storyHistory: [
        { id: 'story-1', text: 'Turn 1 story', timestamp: '2025-01-27T10:00:00Z', turnNumber: 1, imageDescription: 'Desc 1' },
        { id: 'story-2', text: 'Turn 2 story', timestamp: '2025-01-27T10:05:00Z', turnNumber: 2, imageDescription: 'Desc 2' },
        { id: 'story-3', text: 'Turn 3 story', timestamp: '2025-01-27T10:10:00Z', turnNumber: 3, imageDescription: 'Desc 3' }
      ]
    };
    mockUseCharacterStore.mockReturnValue({
      character: mockCharacter,
      initializeCharacterFromDescription: jest.fn(),
      addExperience: jest.fn(),
      incrementTurn: jest.fn(),
      resetCharacter: jest.fn(),
      addImageToHistory: jest.fn(),
      updateImageDescription: jest.fn(),
      updateImageStory: jest.fn(),
    });
    mockUseStoryGeneration.mockReturnValue({
      story: 'Turn 3 story',
      isStoryLoading: false,
      storyError: null,
      generateStory: jest.fn(),
    });

    render(<Home />);

    // Act: Click the button
    const button = screen.getByRole('button', { name: /generate final story/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);

    // Assert: Loading indicator appears
    expect(await screen.findByText(/generating your final story/i)).toBeInTheDocument();

    // Simulate the mock final story appearing
    expect(await screen.findByRole('heading', { name: /final story/i })).toBeInTheDocument();
    expect(screen.getByText(/this is your final adventure/i)).toBeInTheDocument();
  });
}); 