import React from 'react';
import { render, screen } from '@testing-library/react';
import { DescriptionDisplay } from './DescriptionDisplay';
import { DescriptionDisplayProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';

// Mock child components to isolate the DescriptionDisplay component
jest.mock('./ui/LoadingSpinner', () => ({
  __esModule: true,
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

jest.mock('./ui/ErrorMessage', () => ({
  __esModule: true,
  ErrorMessage: ({ message }: { message: string }) => <div data-testid="error-message">{message}</div>,
}));

// Mock react-markdown
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="markdown-display">{children}</div>,
}));

const renderComponent = (props: Partial<DescriptionDisplayProps> = {}) => {
  const defaultProps: DescriptionDisplayProps = {
    description: null,
    isLoading: false,
    error: null,
  };
  return render(<DescriptionDisplay {...defaultProps} {...props} />);
};

describe('DescriptionDisplay', () => {
  it('should render a placeholder when no data is provided', () => {
    renderComponent();
    expect(screen.getByText(/your image analysis will appear here/i)).toBeInTheDocument();
  });

  it('should render the description when provided', () => {
    const testDescription = 'This is a **detailed** description.';
    renderComponent({ description: testDescription });
    const markdownDisplay = screen.getByTestId('markdown-display');
    expect(markdownDisplay).toBeInTheDocument();
    expect(markdownDisplay).toHaveTextContent(testDescription);
  });

  it('should render an error message when an error is provided', () => {
    const testError = 'Failed to analyze image.';
    renderComponent({ error: testError });
    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent(testError);
  });

  it('should display the loading spinner when isLoading is true', () => {
    renderComponent({ isLoading: true });
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should prioritize loading state over description or error', () => {
    renderComponent({
      isLoading: true,
      description: 'A description',
      error: 'An error',
    });
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown-display')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('should prioritize error state over description', () => {
    renderComponent({
      isLoading: false,
      description: 'A description',
      error: 'An error',
    });
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown-display')).not.toBeInTheDocument();
  });

  // --- New Card UI Tests ---
  it('should render inside a card-style container', () => {
    renderComponent();
    const card = screen.getByTestId('card-container');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white', 'shadow-lg', 'rounded-xl');
  });

  it('should center the loading spinner in the card', () => {
    renderComponent({ isLoading: true });
    const card = screen.getByTestId('card-container');
    expect(card).toBeInTheDocument();
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner.parentElement).toBe(card);
  });

  it('should center the error message in the card', () => {
    renderComponent({ error: 'Error!' });
    const card = screen.getByTestId('card-container');
    expect(card).toBeInTheDocument();
    const error = screen.getByTestId('error-message');
    expect(error.parentElement).toBe(card);
  });

  it('should not have inverted text colors on a light background', () => {
    renderComponent({ description: 'Test' });
    const container = screen.getByTestId('card-container');
    const proseElement = container.querySelector('.prose');
    expect(proseElement).not.toHaveClass('prose-invert');
  });
}); 