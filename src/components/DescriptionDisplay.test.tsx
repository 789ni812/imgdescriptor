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

  it('renders markdown as HTML elements (heading, bold, list)', () => {
    const markdownDescription = '# Heading\n**bold**\n- list item 1\n- list item 2';
    renderComponent({ description: markdownDescription });
    // Heading should render as an h1
    expect(screen.getByRole('heading', { level: 1, name: 'Heading' })).toBeInTheDocument();
    // Bold should render as <strong>
    const bold = screen.getByText('bold');
    expect(bold.tagName.toLowerCase()).toBe('strong');
    // List items should render as <li> inside a <ul>
    const list = screen.getByRole('list');
    const items = screen.getAllByRole('listitem');
    expect(items.map(li => li.textContent)).toEqual(['list item 1', 'list item 2']);
    expect(list).toContainElement(items[0]);
    expect(list).toContainElement(items[1]);
  });
}); 