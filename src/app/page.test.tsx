"use client";

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import Home from './page';

// Simplified mocks for child components
jest.mock('@/components/ImageUpload', () => ({
  ImageUpload: jest.fn((props) => <div data-testid="image-upload"><button onClick={() => props.onImageSelect(new File([''], 'test.png'))}>Upload</button></div>),
}));
jest.mock('@/components/ImagePreview', () => ({
  ImagePreview: jest.fn((props) => <div data-testid="image-preview">{props.imageUrl && <img src={props.imageUrl} alt="preview" />}</div>),
}));
jest.mock('@/components/DescriptionDisplay', () => ({
  DescriptionDisplay: jest.fn((props) => <div data-testid="description-display">{props.description}</div>),
}));
jest.mock('@/components/StoryDisplay', () => ({
  StoryDisplay: jest.fn((props) => <div data-testid="story-display">{props.story}</div>),
}));
jest.mock('@/components/ui/Button', () => ({
  Button: jest.fn(({ children, onClick }) => <button onClick={onClick}>{children}</button>),
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
global.FileReader = mockFileReader as any;

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
    expect(mainContainer).toHaveClass('max-w-7xl', 'mx-auto', 'p-4', 'sm:p-6', 'lg:p-8', 'space-y-8');
  });

  it('should implement a two-column grid layout on medium screens', () => {
    render(<Home />);
    const mainGrid = screen.getByTestId('main-content-container').querySelector('div');
    expect(mainGrid).toHaveClass('grid', 'md:grid-cols-2', 'gap-8');
  });

  it('renders only the ImageUpload component on initial load', () => {
    render(<Home />);
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    expect(screen.getByText('ImageUpload.tsx')).toBeInTheDocument();
    expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('description-display')).not.toBeInTheDocument();
    expect(screen.queryByTestId('story-display')).not.toBeInTheDocument();
  });

  // --- Core Functional Test ---
  it('should handle the full user flow and display debug labels', async () => {
    // Mock the fetch for image analysis
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, description: 'A test description.' }),
    });

    // Mock the fetch for story generation
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, story: 'A test story.' }),
    });

    render(<Home />);

    // Initial state: Only ImageUpload is visible with its debug label
    expect(screen.getByText('ImageUpload.tsx')).toBeInTheDocument();

    // Trigger image upload
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    await act(async () => {
      fireEvent.click(uploadButton);
      mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
    });

    // After upload, check for preview and description with their labels
    await waitFor(() => {
      expect(screen.getByText('ImagePreview.tsx')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('DescriptionDisplay.tsx')).toBeInTheDocument();
      expect(screen.getByText('A test description.')).toBeInTheDocument();
    });

    // Trigger story generation
    const generateStoryButton = screen.getByRole('button', { name: /generate a story/i });
    fireEvent.click(generateStoryButton);

    // After generation, check for the story with its label
    await waitFor(() => {
      expect(screen.getByText('StoryDisplay.tsx')).toBeInTheDocument();
      expect(screen.getByText('A test story.')).toBeInTheDocument();
    });
  });
}); 