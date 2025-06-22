import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImagePreview } from './ImagePreview';

describe('ImagePreview Component', () => {
  const defaultProps = {
    imageUrl: 'test-image.jpg',
    onRemove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays the image when an imageUrl is provided', () => {
    render(<ImagePreview {...defaultProps} />);
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', defaultProps.imageUrl);
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
    render(<ImagePreview imageUrl={defaultProps.imageUrl} />);
    expect(screen.queryByRole('button', { name: /remove image/i })).not.toBeInTheDocument();
  });
}); 