import React from 'react';
import { render, screen } from '@testing-library/react';
import { DescriptionDisplay } from './DescriptionDisplay';
import { DescriptionDisplayProps } from '@/lib/types';

// Mock the shadcn/ui Card components
jest.mock('./ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
}));

// Mock the LoadingSpinner to simplify testing
jest.mock('./ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock MarkdownRenderer to test integration
jest.mock('./ui/MarkdownRenderer', () => ({
  __esModule: true,
  default: ({ content, className }: { content: string; className?: string }) => (
    <div data-testid="markdown-renderer" className={className}>
      {content}
    </div>
  ),
}));

const renderComponent = (props: Partial<DescriptionDisplayProps>) => {
  const defaultProps: DescriptionDisplayProps = {
    description: null,
    error: null,
  };
  return render(<DescriptionDisplay {...defaultProps} {...props} />);
};

describe('DescriptionDisplay', () => {
  it('should display the description when provided', () => {
    const testDescription = 'This is a test description.';
    renderComponent({ description: testDescription });
    expect(screen.getByText(testDescription)).toBeInTheDocument();
  });

  it('should render the description inside a Card component', () => {
    const testDescription = 'A descriptive text.';
    renderComponent({ description: testDescription });
    const cardContent = screen.getByTestId('card-content');
    expect(cardContent).toBeInTheDocument();
    expect(cardContent).toHaveTextContent(testDescription);
  });

  it('should display an error message when an error is provided', () => {
    const testError = 'This is a test error.';
    renderComponent({ error: testError });
    expect(screen.getByText(testError)).toBeInTheDocument();
  });

  it('should display a fallback message when no description or error is provided', () => {
    renderComponent({});
    expect(screen.getByText('Description will appear here...')).toBeInTheDocument();
  });

  it('should prioritize error over description', () => {
    const testDescription = 'This is a test description.';
    const testError = 'This is a test error.';
    renderComponent({ description: testDescription, error: testError });
    expect(screen.getByText(testError)).toBeInTheDocument();
    expect(screen.queryByText(testDescription)).not.toBeInTheDocument();
  });

  // New tests for markdown functionality
  it('should use MarkdownRenderer for description content', () => {
    const testDescription = 'This is a **bold** description.';
    renderComponent({ description: testDescription });
    
    const markdownRenderer = screen.getByTestId('markdown-renderer');
    expect(markdownRenderer).toBeInTheDocument();
    expect(markdownRenderer).toHaveTextContent(testDescription);
  });

  it('should pass description content to MarkdownRenderer', () => {
    const testDescription = 'A description with *italic* text.';
    renderComponent({ description: testDescription });
    
    const markdownRenderer = screen.getByTestId('markdown-renderer');
    expect(markdownRenderer).toHaveTextContent(testDescription);
  });

  it('should not use MarkdownRenderer when error is present', () => {
    const testDescription = 'This is a **bold** description.';
    const testError = 'This is a test error.';
    renderComponent({ description: testDescription, error: testError });
    
    expect(screen.queryByTestId('markdown-renderer')).not.toBeInTheDocument();
    expect(screen.getByText(testError)).toBeInTheDocument();
  });

  it('should not use MarkdownRenderer for fallback message', () => {
    renderComponent({});
    
    expect(screen.queryByTestId('markdown-renderer')).not.toBeInTheDocument();
    expect(screen.getByText('Description will appear here...')).toBeInTheDocument();
  });

  it('should handle markdown content with headings and lists', () => {
    const markdownDescription = `
# Image Analysis

This image shows:
- **Bold item**
- *Italic item*
- Regular item

## Summary
The analysis is complete.
    `;
    
    renderComponent({ description: markdownDescription });
    
    const markdownRenderer = screen.getByTestId('markdown-renderer');
    expect(markdownRenderer).toBeInTheDocument();
    expect(markdownRenderer).toHaveTextContent('Image Analysis');
    expect(markdownRenderer).toHaveTextContent('Bold item');
    expect(markdownRenderer).toHaveTextContent('Italic item');
    expect(markdownRenderer).toHaveTextContent('Summary');
  });
}); 