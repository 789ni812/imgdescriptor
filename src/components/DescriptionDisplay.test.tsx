import React from 'react';
import { render, screen } from '@testing-library/react';
import { DescriptionDisplay } from './DescriptionDisplay';
import { DescriptionDisplayProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';

// Mock the LoadingSpinner to simplify testing
jest.mock('./ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
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
    expect(screen.getByText(/your image description will appear here.../i)).toBeInTheDocument();
  });

  it('should render the description when provided', () => {
    const testDescription = 'This is a detailed description of the uploaded image.';
    renderComponent({ description: testDescription });
    expect(screen.getByText(testDescription)).toBeInTheDocument();
  });

  it('should render an error message when an error is provided', () => {
    const testError = 'Failed to analyze image.';
    renderComponent({ error: testError });
    expect(screen.getByText(testError)).toBeInTheDocument();
    // Check for a specific error style/role if applicable
    expect(screen.getByText(testError)).toHaveClass('text-red-500');
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
    expect(screen.queryByText(/A description/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/An error/i)).not.toBeInTheDocument();
  });

  it('should prioritize error state over description', () => {
    renderComponent({
      isLoading: false,
      description: 'A description',
      error: 'An error',
    });
    expect(screen.getByText(/An error/i)).toBeInTheDocument();
    expect(screen.queryByText(/A description/i)).not.toBeInTheDocument();
  });
}); 