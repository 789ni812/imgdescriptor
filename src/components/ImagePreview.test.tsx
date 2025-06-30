import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImagePreview } from './ImagePreview';

// Mock the Card components to check for their presence
jest.mock('./ui/card', () => ({
  Card: ({ children, ...props }: { children: React.ReactNode }) => <div {...props} data-testid="card">{children}</div>,
  CardContent: ({ children, ...props }: { children: React.ReactNode }) => <div {...props} data-testid="card-content">{children}</div>,
}));

describe('ImagePreview Component', () => {
  const validImageUrl = '/test-image.jpg';
  const defaultProps = {
    imageUrl: validImageUrl,
    onRemove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays the image within a Card component', () => {
    render(<ImagePreview {...defaultProps} />);
    
    // Check that the main container is a Card
    expect(screen.getByTestId('card')).toBeInTheDocument();
    
    // Check that the image is within CardContent
    const cardContent = screen.getByTestId('card-content');
    const image = screen.getByRole('img');
    expect(cardContent).toContainElement(image);

    // Check for width and height attributes
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
    const removeButton = screen.getByRole('button', { name: /upload image/i });
    fireEvent.click(removeButton);
    expect(defaultProps.onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not render the remove button if onRemove is not provided', () => {
    render(<ImagePreview imageUrl={validImageUrl} />);
    expect(screen.queryByRole('button', { name: /remove image/i })).not.toBeInTheDocument();
  });
}); 