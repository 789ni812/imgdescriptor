import React from 'react';
import { render, screen } from '@testing-library/react';
import { StoryDisplay } from './StoryDisplay';

// Mock child components for isolation
jest.mock('./ui/LoadingSpinner', () => ({
  __esModule: true,
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading Story...</div>,
}));

jest.mock('./ui/ErrorMessage', () => ({
  __esModule: true,
  ErrorMessage: ({ message }: { message: string }) => <div data-testid="error-message">{message}</div>,
}));

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="markdown-story">{children}</div>,
}));

describe('StoryDisplay', () => {
  it('should render nothing when no props are provided', () => {
    const { container } = render(<StoryDisplay story={null} isLoading={false} error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the story using markdown when provided', () => {
    const testStory = 'A story about a **lonely tree**.';
    render(<StoryDisplay story={testStory} isLoading={false} error={null} />);
    
    const storyDisplay = screen.getByTestId('markdown-story');
    expect(storyDisplay).toBeInTheDocument();
    expect(storyDisplay).toHaveTextContent(testStory);
  });

  it('should render an error message when an error is provided', () => {
    const testError = 'Failed to generate a story.';
    render(<StoryDisplay story={null} isLoading={false} error={testError} />);

    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent(testError);
  });

  it('should display the loading spinner when isLoading is true', () => {
    render(<StoryDisplay story={null} isLoading={true} error={null} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading Story...')).toBeInTheDocument();
  });

  it('should prioritize loading state over story or error', () => {
    render(<StoryDisplay story="A story" isLoading={true} error="An error" />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown-story')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });
}); 