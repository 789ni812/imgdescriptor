import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImageGallery } from './ImageGallery';

// Mock Next.js Image for test
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} data-testid="gallery-image" />,
}));

describe('ImageGallery', () => {
  it('renders a grid of images from an array of URLs', () => {
    const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg'];
    render(<ImageGallery imageUrls={images} />);
    const renderedImages = screen.getAllByTestId('gallery-image');
    expect(renderedImages).toHaveLength(3);
    images.forEach((url, idx) => {
      expect(renderedImages[idx]).toHaveAttribute('src', url);
    });
  });

  it('shows a placeholder message if no images are present', () => {
    render(<ImageGallery imageUrls={[]} />);
    expect(screen.getByText(/no images uploaded yet/i)).toBeInTheDocument();
  });

  it('does not render more than 3 images', () => {
    const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg', '/img4.jpg'];
    render(<ImageGallery imageUrls={images} />);
    const renderedImages = screen.getAllByTestId('gallery-image');
    expect(renderedImages).toHaveLength(3);
  });

  it('uses alt text for accessibility', () => {
    const images = ['/img1.jpg'];
    render(<ImageGallery imageUrls={images} />);
    const img = screen.getByTestId('gallery-image');
    expect(img).toHaveAttribute('alt', expect.stringContaining('Uploaded image'));
  });
}); 