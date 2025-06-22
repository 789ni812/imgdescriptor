import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImagePreview } from './ImagePreview';
import { ImagePreviewProps } from '@/lib/types';

// Mock the LoadingSpinner to simplify testing
jest.mock('./ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

const mockOnRemove = jest.fn();

type RenderProps = Partial<ImagePreviewProps>;

const renderComponent = (props: RenderProps = {}) => {
  const defaultProps: ImagePreviewProps = {
    imageUrl: null,
    isLoading: false,
    alt: 'Image preview',
    onRemove: mockOnRemove,
    error: null,
  };
  return render(<ImagePreview {...defaultProps} {...props} />);
};

describe('ImagePreview Component - Enhanced UI', () => {
  beforeEach(() => {
    mockOnRemove.mockClear();
  });

  // --- New UI Tests ---
  
  it('should render a modern card-style container', () => {
    const { getByTestId } = renderComponent();
    const container = getByTestId('image-preview-container');
    expect(container).toHaveClass('w-full', 'h-64', 'bg-white', 'shadow-lg', 'rounded-xl');
  });

  it('should call onRemove when the remove button is clicked', () => {
    renderComponent({ imageUrl: 'http://localhost/test-image.png' });
    const removeButton = screen.getByRole('button', { name: /remove image/i });
    fireEvent.click(removeButton);
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('should not display a "Remove Image" button when no image is present', () => {
    renderComponent({ imageUrl: null });
    expect(screen.queryByRole('button', { name: /remove image/i })).not.toBeInTheDocument();
  });

  it('should display an enhanced placeholder with an icon when no image is present', () => {
    renderComponent({ imageUrl: null });
    expect(screen.getByTestId('placeholder-icon')).toBeInTheDocument();
    expect(screen.getByText(/upload an image to see preview/i)).toBeInTheDocument();
  });

  it('should have destructive styles for the remove button', () => {
    renderComponent({ imageUrl: 'http://localhost/test.png' });
    const removeButton = screen.getByRole('button', { name: /remove image/i });
    expect(removeButton).toHaveClass('bg-red-600', 'hover:bg-red-700');
  });

  // --- Existing Functionality Tests ---

  it('renders the placeholder when no image is provided', () => {
    renderComponent({ imageUrl: null });
    expect(screen.getByText(/upload an image to see preview/i)).toBeInTheDocument();
  });

  it('displays the image when an imageUrl is provided', () => {
    const testImageUrl = 'http://localhost/test-image.png';
    renderComponent({ imageUrl: testImageUrl });

    const imgElement = screen.getByRole('img', { name: /image preview/i });
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', testImageUrl);
  });

  it('should display a loading spinner when isLoading is true', () => {
    const { getByTestId, queryByRole } = renderComponent({ isLoading: true });
    
    // The spinner SVG should be visible and have the right classes
    const spinnerSvg = getByTestId('loading-spinner-svg');
    expect(spinnerSvg).toBeInTheDocument();
    expect(spinnerSvg).toHaveClass('w-12', 'h-12');
    
    // The image should not be visible
    expect(queryByRole('img')).not.toBeInTheDocument();
  });

  it('displays an error message when an error is provided', () => {
    const { getByText } = renderComponent({ error: 'Test error' });
    expect(getByText('Test error')).toBeInTheDocument();
  });

  it('does not display the remove button when no image is loaded', () => {
    renderComponent({ imageUrl: null });
    expect(screen.queryByRole('button', { name: /remove image/i })).not.toBeInTheDocument();
  });
}); 