import React from 'react';
import { render, screen } from '@testing-library/react';
import { StoryDisplay } from './StoryDisplay';
import { StoryDisplayProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';

// Mock the LoadingSpinner to simplify testing
jest.mock('./ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock react-markdown
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="markdown-display">{children}</div>,
}));


type RenderProps = Partial<StoryDisplayProps>;

const renderComponent = (props: RenderProps = {}) => {
  const defaultProps: StoryDisplayProps = {
    story: null,
    isLoading: false,
    error: null,
  };
  return render(<StoryDisplay {...defaultProps} {...props} />);
};

describe('StoryDisplay', () => {
  it('should render nothing when no data is provided', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('should render the story when provided', () => {
    const testStory = 'This is a test story.';
    renderComponent({ story: testStory });
    expect(screen.getByTestId('markdown-display')).toHaveTextContent(testStory);
  });

  it('should display a loading spinner when isLoading is true', () => {
    renderComponent({ isLoading: true });
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Generating story...')).toBeInTheDocument();
  });

  it('should display an error message when an error is provided', () => {
    renderComponent({ error: 'Test Error' });
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });
}); 