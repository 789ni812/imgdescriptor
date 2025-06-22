import React from 'react';
import { render, screen } from '@testing-library/react';
import { DescriptionDisplay } from './DescriptionDisplay';
import { DescriptionDisplayProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';

// Mock the LoadingSpinner to simplify testing
jest.mock('./ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

type RenderProps = Partial<DescriptionDisplayProps>;

const renderComponent = (props: RenderProps = {}) => {
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
    expect(screen.getByText('Description will appear here...')).toBeInTheDocument();
  });

  it('should render the description when provided', () => {
    const testDescription = 'This is a test description.';
    renderComponent({ description: testDescription });
    expect(screen.getByText(testDescription)).toBeInTheDocument();
  });

  it('should display a loading spinner when isLoading is true', () => {
    renderComponent({ isLoading: true });
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Analyzing image...')).toBeInTheDocument();
  });

  it('should display an error message when an error is provided', () => {
    renderComponent({ error: 'Test Error' });
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });
}); 