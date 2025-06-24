"use client";

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './page';
import { DEFAULT_STORY_GENERATION_PROMPT } from '@/lib/constants';
import { useCharacterStore } from '@/lib/stores/characterStore';

// Mock the components
jest.mock('@/components/ImageUpload', () => ({
  ImageUpload: jest.fn(({ onImageSelect, disabled }) => (
    <div data-testid="image-upload">
      <button 
        onClick={() => onImageSelect(new File(['test'], 'test.jpg', { type: 'image/jpeg' }), 'Custom prompt')}
        disabled={disabled}
      >
        Upload with Custom Prompt
      </button>
      <button 
        onClick={() => onImageSelect(new File(['test'], 'test.jpg', { type: 'image/jpeg' }), 'Describe this image in detail.')}
        disabled={disabled}
      >
        Upload with Default Prompt
      </button>
    </div>
  )),
}));
jest.mock('@/components/ImagePreview', () => ({
  ImagePreview: jest.fn(({ imageUrl, onRemove }) => (
    <div>
      <img data-testid="image-preview" src={imageUrl} alt="preview" />
      <button onClick={onRemove} aria-label="Remove">Remove</button>
    </div>
  )),
}));
jest.mock('@/components/DescriptionDisplay', () => ({
  DescriptionDisplay: jest.fn((props) => <div data-testid="description-display">{props.description}</div>),
}));
jest.mock('@/components/StoryDisplay', () => ({
  StoryDisplay: jest.fn((props) => <div data-testid="story-display">{props.story}</div>),
}));
jest.mock('@/components/ui/Button', () => ({
  Button: jest.fn(({ children, onClick, disabled }) => <button onClick={onClick} disabled={disabled}>{children}</button>),
}));
jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: jest.fn(() => <div data-testid="loading-spinner" />),
}));
jest.mock('@/components/CustomPromptInput', () => ({
  CustomPromptInput: ({ onPromptChange, value }: { onPromptChange: (prompt: string) => void; value?: string }) => (
    <div data-testid="custom-prompt-input">
      <textarea
        data-testid="prompt-textarea"
        value={value || ''}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Custom prompt input"
      />
    </div>
  ),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock the config module to disable mock mode during tests
jest.mock('@/lib/config', () => ({
  MOCK_IMAGE_DESCRIPTION: false,
  MOCK_STORY: false,
  MOCK_IMAGE_DESCRIPTION_TEXT: 'Mock description',
  MOCK_STORY_TEXT: 'Mock story',
}));

// --- Correct FileReader Mock ---
const mockFileReaderInstance = {
  readAsDataURL: jest.fn(),
  onload: jest.fn(),
  result: 'data:image/png;base64,test-base64-string',
};

const mockFileReader = jest.fn(() => mockFileReaderInstance);
global.FileReader = mockFileReader as jest.Mock as any;

jest.mock('@/lib/lmstudio-client');

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

  it('should always render the image gallery below the main cards', () => {
    render(<Home />);
    // The gallery should be present even before any images are uploaded
    const galleryRegion = screen.getByRole('region', { name: /image gallery/i });
    expect(galleryRegion).toBeInTheDocument();
    // Should show empty state initially
    expect(galleryRegion).toHaveTextContent(/no images uploaded yet/i);
  });
}); 