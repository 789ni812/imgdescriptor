"use client";

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import Home from './page';
import { DEFAULT_STORY_GENERATION_PROMPT } from '@/lib/constants';

// Mock the components
jest.mock('@/components/ImageUpload', () => ({
  ImageUpload: jest.fn(({ onImageSelect }) => (
    <div data-testid="image-upload">
      <button onClick={() => onImageSelect(new File(['test'], 'test.jpg', { type: 'image/jpeg' }), 'Custom prompt')}>
        Upload with Custom Prompt
      </button>
      <button onClick={() => onImageSelect(new File(['test'], 'test.jpg', { type: 'image/jpeg' }), 'Describe this image in detail.')}>
        Upload with Default Prompt
      </button>
    </div>
  )),
}));
jest.mock('@/components/ImagePreview', () => ({
  ImagePreview: jest.fn(({ imageUrl }) => <img data-testid="image-preview" src={imageUrl} alt="preview" />),
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

// --- Correct FileReader Mock ---
const mockFileReaderInstance = {
  readAsDataURL: jest.fn(),
  onload: jest.fn(),
  result: 'data:image/png;base64,test-base64-string',
};

const mockFileReader = jest.fn(() => mockFileReaderInstance);
global.FileReader = mockFileReader as jest.Mock as any;

jest.mock('@/lib/lmstudio-client');

describe('Home Page', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NODE_ENV: 'development',
    };
    (fetch as jest.Mock).mockClear();
    mockFileReader.mockClear();
    (mockFileReaderInstance.readAsDataURL as jest.Mock).mockClear();
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/test-guid');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // --- Layout Tests ---
  it('should render a main content container with correct layout classes', () => {
    render(<Home />);
    const mainContainer = screen.getByTestId('main-content-container');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('max-w-7xl', 'mx-auto', 'p-4', 'sm:p-6', 'lg:p-8');
  });

  it('should implement a flex wrap layout for cards', () => {
    render(<Home />);
    const mainGrid = screen.getByTestId('main-content-container').querySelector('div');
    expect(mainGrid).toHaveClass('flex', 'flex-wrap', 'gap-6', 'justify-start');
  });

  it('renders only the ImageUpload component on initial load', () => {
    render(<Home />);
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('description-display')).not.toBeInTheDocument();
    expect(screen.queryByTestId('story-display')).not.toBeInTheDocument();
  });

  // --- Custom Prompt Integration Tests ---
  it('should handle custom prompt input and pass it to image analysis', async () => {
    const customPrompt = 'Custom prompt'; // This matches the mock
    (fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, description: 'Architectural analysis result.' }),
          }), 100)
      )
    );

    render(<Home />);

    // Just click the upload with custom prompt button
    const uploadButton = screen.getByRole('button', { name: /upload with custom prompt/i });
    
    await act(async () => {
      fireEvent.click(uploadButton);
    });

    // Simulate the FileReader finishing
    await act(async () => {
        mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
    });
    
    // Wait for the fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId('description-display')).toBeInTheDocument();
    });

    // Verify the custom prompt was used in the API call
    expect(fetch).toHaveBeenCalledWith('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'test-base64-string',
        prompt: customPrompt,
      }),
    });
  });

  it('should use default prompt when no custom prompt is provided', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, description: 'Default analysis result.' }),
          }), 100)
      )
    );

    render(<Home />);

    // Trigger image upload with default prompt
    const uploadButton = screen.getByRole('button', { name: /upload with default prompt/i });
    
    await act(async () => {
      fireEvent.click(uploadButton);
    });

    // Simulate the FileReader finishing
    await act(async () => {
        mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
    });
    
    // Wait for the fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId('description-display')).toBeInTheDocument();
    });

    // Verify the default prompt was used in the API call
    expect(fetch).toHaveBeenCalledWith('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'test-base64-string',
        prompt: 'Describe this image in detail.',
      }),
    });
  });

  // --- Core Functional Test ---
  it('should show preview and loading spinner immediately, then display description', async () => {
    // Mock the fetch for image analysis to resolve after a delay
    (fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, description: 'A test description.' }),
          }), 100)
      )
    );

    render(<Home />);

    // Initial state: Only ImageUpload is visible
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument();

    // Trigger image upload with default prompt
    const uploadButton = screen.getByRole('button', { name: /upload with default prompt/i });
    
    // Use `act` to handle state updates from the upload
    await act(async () => {
      fireEvent.click(uploadButton);
    });

    // Immediately after click, the preview and spinner should appear
    expect(screen.getByTestId('image-preview')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('description-display')).not.toBeInTheDocument();
    
    // Simulate the FileReader finishing
    await act(async () => {
        mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
    });
    
    // Wait for the fetch to complete and the description to appear
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByTestId('description-display')).toBeInTheDocument();
      expect(screen.getByText('A test description.')).toBeInTheDocument();
    });
  });

  it('should support dual prompt system for story generation with default and custom prompts', async () => {
    // Mock the fetch for image analysis to return a description
    (fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, description: 'A test description.' }),
      })
    );
    // Mock the fetch for story generation
    (fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, story: 'A custom story based on the description.' }),
          }), 100)
      )
    );

    render(<Home />);

    // First, trigger image upload with default prompt to get a description
    const uploadButton = screen.getByRole('button', { name: /upload with default prompt/i });
    
    await act(async () => {
      fireEvent.click(uploadButton);
    });

    // Simulate the FileReader finishing
    await act(async () => {
        mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
    });
    
    // Wait for the description to appear
    await waitFor(() => {
      expect(screen.getByTestId('description-display')).toBeInTheDocument();
    });

    // Now test that story generation uses the default prompt when no custom prompt is provided
    const generateStoryButton = screen.getByRole('button', { name: /default prompt/i });
    
    await act(async () => {
      fireEvent.click(generateStoryButton);
    });

    // Wait for the story to appear
    await waitFor(() => {
      expect(screen.getByTestId('story-display')).toBeInTheDocument();
    });

    // Verify the story generation API was called with the description (no custom prompt)
    expect(fetch).toHaveBeenCalledWith('/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'A test description.',
        prompt: DEFAULT_STORY_GENERATION_PROMPT,
      }),
    });
  });
}); 