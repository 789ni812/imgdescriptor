import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImagePreview } from './ImagePreview';
import { ImagePreviewProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';

// Mock the LoadingSpinner to simplify testing
jest.mock('./ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

const renderComponent = (props: Partial<ImagePreviewProps> = {}) => {
  const defaultProps: ImagePreviewProps = {
    imageUrl: null,
    isLoading: false,
    alt: 'Image preview',
  };
  return render(<ImagePreview {...defaultProps} {...props} />);
};

describe('ImagePreview', () => {
  it('should render a placeholder when imageUrl is null', () => {
    renderComponent({ imageUrl: null });
    expect(screen.getByText(/image preview will appear here/i)).toBeInTheDocument();
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
    expect(screen.queryByText(/image preview will appear here/i)).not.toBeInTheDocument();
  });
}); 