import React from 'react';
import { render, screen } from '@testing-library/react';
import { StoryDisplay } from './StoryDisplay';
import { StoryDisplayProps } from '@/lib/types';

// Mock the LoadingSpinner to simplify testing
jest.mock('./ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
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
    // After migration, CardContent is always present, so check for empty content
    const cardContent = container.querySelector('[data-slot="card-content"]') || container.querySelector('.p-6');
    expect(cardContent).toBeTruthy();
    expect(cardContent).toBeEmptyDOMElement();
  });

  it('should render the story when provided', () => {
    const testStory = 'This is a test story.';
    renderComponent({ story: testStory });
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(testStory);
  });

  it('should use MarkdownRenderer for story content', () => {
    const testStory = 'This is a **bold** story.';
    renderComponent({ story: testStory });
    const markdownRenderer = screen.getByTestId('markdown-renderer');
    expect(markdownRenderer).toBeInTheDocument();
    // Check for the rendered bold element
    const bold = screen.getByText('bold');
    expect(bold.tagName.toLowerCase()).toBe('strong');
    // Check the full text content (ignoring markdown syntax)
    expect(markdownRenderer).toHaveTextContent('This is a bold story.');
  });

  it('should pass story content to MarkdownRenderer', () => {
    const testStory = 'A story with *italic* text.';
    renderComponent({ story: testStory });
    
    const markdownRenderer = screen.getByTestId('markdown-renderer');
    expect(markdownRenderer).toHaveTextContent(testStory);
  });

  it('should not use MarkdownRenderer when error is present', () => {
    const testStory = 'This is a **bold** story.';
    const testError = 'This is a test error.';
    renderComponent({ story: testStory, error: testError });
    
    expect(screen.queryByTestId('markdown-renderer')).not.toBeInTheDocument();
    expect(screen.getByText(testError)).toBeInTheDocument();
  });

  it('should handle markdown content with headings and lists', () => {
    const markdownStory = `
# The Adventure Begins

This is a **bold** and *italic* story.

## Characters
- **Hero**: Brave warrior
- **Villain**: Evil sorcerer

> "This is a memorable quote from the story."

The story continues with [more details](https://example.com).
    `;
    
    renderComponent({ story: markdownStory });
    
    const markdownRenderer = screen.getByTestId('markdown-renderer');
    expect(markdownRenderer).toBeInTheDocument();
    expect(markdownRenderer).toHaveTextContent('The Adventure Begins');
    expect(markdownRenderer).toHaveTextContent('Characters');
    expect(markdownRenderer).toHaveTextContent('Hero');
    expect(markdownRenderer).toHaveTextContent('Villain');
  });

  it('should display a loading spinner when isLoading is true', () => {
    renderComponent({ isLoading: true });
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Generating story...')).toBeInTheDocument();
  });

  it('should not display a loading spinner when not loading', () => {
    renderComponent({ isLoading: false });
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('should display an error message when an error is provided', () => {
    renderComponent({ error: 'Test Error' });
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('should prioritize error over story and loading', () => {
    const testStory = 'This is a test story.';
    const testError = 'This is a test error.';
    renderComponent({ story: testStory, error: testError, isLoading: true });
    
    expect(screen.getByText(testError)).toBeInTheDocument();
    expect(screen.queryByTestId('markdown-renderer')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('renders markdown as HTML elements (heading, bold, list)', () => {
    const markdownStory = '# Heading\n**bold**\n- list item 1\n- list item 2';
    renderComponent({ story: markdownStory });
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