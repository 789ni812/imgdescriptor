import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImagePreview } from './ImagePreview';
import { ImagePreviewProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';

// Mock the LoadingSpinner to simplify testing
jest.mock('./ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

const mockOnRemove = jest.fn();

const renderComponent = (props: Partial<ImagePreviewProps> = {}) => {
  const defaultProps: ImagePreviewProps = {
    imageUrl: null,
    isLoading: false,
    alt: 'Image preview',
    onRemove: mockOnRemove,
  };
  return render(<ImagePreview {...defaultProps} {...props} />);
};

describe('ImagePreview Component - Enhanced UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- New UI Tests ---
  
  it('should render a modern card-style container', () => {
    renderComponent();
    const container = screen.getByTestId('image-preview-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('bg-white', 'shadow-lg', 'rounded-xl');
  });

  it('should display a "Remove Image" button when an image is present', () => {
    renderComponent({ imageUrl: 'http://localhost/test-image.png' });
    const removeButton = screen.getByRole('button', { name: /remove image/i });
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).toHaveClass('btn-secondary');
  });

  it('should not display a "Remove Image" button when no image is present', () => {
    renderComponent({ imageUrl: null });
    expect(screen.queryByRole('button', { name: /remove image/i })).not.toBeInTheDocument();
  });

  it('should call onRemove when the remove button is clicked', () => {
    renderComponent({ imageUrl: 'http://localhost/test-image.png' });
    const removeButton = screen.getByRole('button', { name: /remove image/i });
    
    fireEvent.click(removeButton);
    
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('should display an enhanced placeholder with an icon when no image is present', () => {
    renderComponent({ imageUrl: null });
    expect(screen.getByTestId('placeholder-icon')).toBeInTheDocument();
    expect(screen.getByText(/upload an image to see preview/i)).toBeInTheDocument();
  });

  // --- Existing Functionality Tests ---

  it('should render a placeholder when imageUrl is null', () => {
    renderComponent({ imageUrl: null });
    expect(screen.getByText(/upload an image to see preview/i)).toBeInTheDocument();
  });

  it('should render an image when imageUrl is provided', () => {
    const testImageUrl = 'http://localhost/test-image.png';
    renderComponent({ imageUrl: testImageUrl });

    const imgElement = screen.getByRole('img', { name: /image preview/i });
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', testImageUrl);
  });

  it('should display the loading spinner when isLoading is true', () => {
    renderComponent({ isLoading: true, imageUrl: null });
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should not display the image or placeholder when loading', () => {
    renderComponent({ isLoading: true, imageUrl: 'http://localhost/test-image.png' });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText(/upload an image to see preview/i)).not.toBeInTheDocument();
  });
}); 