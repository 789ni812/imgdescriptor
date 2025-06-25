"use client";

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './page';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// Mock the character store
jest.mock('@/lib/stores/characterStore', () => ({
  useCharacterStore: () => ({
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
  }),
}));

// Mock the hooks
jest.mock('@/hooks/useImageAnalysis', () => ({
  useImageAnalysis: () => ({
    description: null,
    isDescriptionLoading: false,
    error: null,
    analyzeImage: jest.fn(),
  }),
}));

jest.mock('@/hooks/useStoryGeneration', () => ({
  useStoryGeneration: () => ({
    story: null,
    isStoryLoading: false,
    error: null,
    generateStory: jest.fn(),
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