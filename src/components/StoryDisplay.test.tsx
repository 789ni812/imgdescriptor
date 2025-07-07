import React from 'react';
import { render, screen } from '@testing-library/react';
import { StoryDisplay } from './StoryDisplay';
import type { StoryDescription } from '@/lib/types';

// Mock the LoadingSpinner to simplify testing
jest.mock('./ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

type RenderProps = Partial<{
  story: StoryDescription | null;
  isLoading: boolean;
  error: string | null;
  summary: string | null;
}>;

const renderComponent = (props: RenderProps = {}) => {
  const defaultProps = {
    story: null,
    isLoading: false,
    error: null,
    summary: null,
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
    const testStory: StoryDescription = {
      sceneTitle: 'The Adventure Begins',
      summary: 'This is a test story summary.',
      dilemmas: ['Should I go left or right?', 'Should I trust the stranger?'],
      cues: 'Look for the ancient symbols on the wall.',
      consequences: ['The path leads to treasure.', 'The stranger betrays you.']
    };
    renderComponent({ story: testStory });
    
    expect(screen.getByText('Scene:')).toBeInTheDocument();
    expect(screen.getByText('The Adventure Begins')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('This is a test story summary.')).toBeInTheDocument();
    expect(screen.getByText('Key Dilemmas')).toBeInTheDocument();
    expect(screen.getByText('Should I go left or right?')).toBeInTheDocument();
    expect(screen.getByText('Should I trust the stranger?')).toBeInTheDocument();
    expect(screen.getByText('Visual Cues')).toBeInTheDocument();
    expect(screen.getByText('Look for the ancient symbols on the wall.')).toBeInTheDocument();
    expect(screen.getByText('Ongoing Consequences')).toBeInTheDocument();
    expect(screen.getByText('The path leads to treasure.')).toBeInTheDocument();
    expect(screen.getByText('The stranger betrays you.')).toBeInTheDocument();
  });

  it('should render story sections conditionally', () => {
    const partialStory: StoryDescription = {
      sceneTitle: 'Partial Story',
      summary: 'Only summary and title.',
      dilemmas: [],
      cues: '',
      consequences: []
    };
    renderComponent({ story: partialStory });
    
    expect(screen.getByText('Scene:')).toBeInTheDocument();
    expect(screen.getByText('Partial Story')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Only summary and title.')).toBeInTheDocument();
    
    // Should not render empty sections
    expect(screen.queryByText('Key Dilemmas')).not.toBeInTheDocument();
    expect(screen.queryByText('Visual Cues')).not.toBeInTheDocument();
    expect(screen.queryByText('Ongoing Consequences')).not.toBeInTheDocument();
  });

  it('should render summary when provided', () => {
    const testStory: StoryDescription = {
      sceneTitle: 'Test Scene',
      summary: 'Test summary.',
      dilemmas: [],
      cues: '',
      consequences: []
    };
    const summary = 'This is a summary of changes.';
    renderComponent({ story: testStory, summary });
    
    expect(screen.getByText('Summary of Changes')).toBeInTheDocument();
    expect(screen.getByText('This is a summary of changes.')).toBeInTheDocument();
  });

  it('should not render summary when not provided', () => {
    const testStory: StoryDescription = {
      sceneTitle: 'Test Scene',
      summary: 'Test summary.',
      dilemmas: [],
      cues: '',
      consequences: []
    };
    renderComponent({ story: testStory });
    
    expect(screen.queryByText('Summary of Changes')).not.toBeInTheDocument();
  });

  it('should not render story when error is present', () => {
    const testStory: StoryDescription = {
      sceneTitle: 'Test Scene',
      summary: 'Test summary.',
      dilemmas: [],
      cues: '',
      consequences: []
    };
    const testError = 'This is a test error.';
    renderComponent({ story: testStory, error: testError });
    
    expect(screen.getByText(testError)).toBeInTheDocument();
    expect(screen.queryByText('Scene: Test Scene')).not.toBeInTheDocument();
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
    const testStory: StoryDescription = {
      sceneTitle: 'Test Scene',
      summary: 'Test summary.',
      dilemmas: [],
      cues: '',
      consequences: []
    };
    const testError = 'This is a test error.';
    renderComponent({ story: testStory, error: testError, isLoading: true });
    
    expect(screen.getByText(testError)).toBeInTheDocument();
    expect(screen.queryByText('Scene: Test Scene')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('should render dilemmas as list items', () => {
    const testStory: StoryDescription = {
      sceneTitle: 'Test Scene',
      summary: 'Test summary.',
      dilemmas: ['First dilemma', 'Second dilemma'],
      cues: '',
      consequences: []
    };
    renderComponent({ story: testStory });
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
    expect(listItems[0]).toHaveTextContent('First dilemma');
    expect(listItems[1]).toHaveTextContent('Second dilemma');
  });

  it('should render consequences as list items', () => {
    const testStory: StoryDescription = {
      sceneTitle: 'Test Scene',
      summary: 'Test summary.',
      dilemmas: [],
      cues: '',
      consequences: ['First consequence', 'Second consequence']
    };
    renderComponent({ story: testStory });
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
    expect(listItems[0]).toHaveTextContent('First consequence');
    expect(listItems[1]).toHaveTextContent('Second consequence');
  });
}); 