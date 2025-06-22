import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImagePreview } from './ImagePreview';

describe('ImagePreview Component', () => {
  const validImageUrl = '/test-image.jpg';
  const defaultProps = {
    imageUrl: validImageUrl,
    onRemove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays the image with correct dimensions when an imageUrl is provided', () => {
    render(<ImagePreview {...defaultProps} />);
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    
    // Check that the image is rendered with the specified width and height
    expect(image).toHaveAttribute('width', '256');
    expect(image).toHaveAttribute('height', '256');
  });

  it('displays a placeholder when imageUrl is null', () => {
    render(<ImagePreview imageUrl={null} />);
    expect(screen.getByTestId('placeholder-icon')).toBeInTheDocument();
    expect(screen.getByText(/upload an image to see preview/i)).toBeInTheDocument();
  });

  it('calls onRemove when the remove button is clicked', () => {
    render(<ImagePreview {...defaultProps} />);
    const removeButton = screen.getByRole('button', { name: /remove image/i });
    fireEvent.click(removeButton);
    expect(defaultProps.onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not render the remove button if onRemove is not provided', () => {
    render(<ImagePreview imageUrl={validImageUrl} />);
    expect(screen.queryByRole('button', { name: /remove image/i })).not.toBeInTheDocument();
  });
}); 