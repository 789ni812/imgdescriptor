import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImageGallery } from './ImageGallery';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} data-testid="gallery-image" />,
}));

// Mock the character store
jest.mock('@/lib/stores/characterStore', () => ({
  useCharacterStore: () => ({
    character: {
      storyHistory: []
    }
  })
}));

describe('ImageGallery', () => {
  const mockImages = [
    { id: '1', url: '/img-tree.jpg', description: 'A beautiful tree', turn: 1 },
    { id: '2', url: '/img-car.jpg', description: 'A red car', turn: 2 },
    { id: '3', url: '/img-tree.jpg', description: 'Another tree', turn: 3 }
  ];

  it('renders a grid of images from an array of URLs (legacy format)', () => {
    const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg'];
    render(<ImageGallery imageUrls={images} />);
    
    const imgElements = screen.getAllByTestId('gallery-image');
    expect(imgElements).toHaveLength(3);
    
    imgElements.forEach((img, idx) => {
      expect(img).toHaveAttribute('src', images[idx]);
      expect(img).toHaveAttribute('alt', expect.stringContaining('Uploaded image'));
    });
  });

  it('should render empty state when no images are provided', () => {
    render(<ImageGallery images={[]} />);
    
    expect(screen.getByText('No images uploaded yet')).toBeInTheDocument();
  });

  it('should render all provided images in a grid layout', () => {
    render(<ImageGallery images={mockImages} />);
    
    // Should display all images
    mockImages.forEach(image => {
      const imgElement = screen.getByAltText(image.description);
      expect(imgElement).toBeInTheDocument();
      expect(imgElement).toHaveAttribute('src', image.url);
    });
  });

  it('should display turn information for each image', () => {
    render(<ImageGallery images={mockImages} />);
    
    mockImages.forEach(image => {
      expect(screen.getByText(`Turn ${image.turn}`)).toBeInTheDocument();
    });
  });

  it('should display image descriptions', () => {
    render(<ImageGallery images={mockImages} />);
    
    mockImages.forEach(image => {
      expect(screen.getByText(image.description)).toBeInTheDocument();
    });
  });

  it('should have proper grid layout classes', () => {
    render(<ImageGallery images={mockImages} />);
    
    const galleryElement = screen.getByRole('region', { name: /image gallery/i });
    expect(galleryElement).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-4');
  });

  it('should handle click events on images', () => {
    const mockOnImageClick = jest.fn();
    render(<ImageGallery images={mockImages} onImageClick={mockOnImageClick} />);
    
    const firstImage = screen.getByAltText(mockImages[0].description);
    firstImage.click();
    
    expect(mockOnImageClick).toHaveBeenCalledWith(mockImages[0]);
  });

  it('should not show click handler when not provided', () => {
    render(<ImageGallery images={mockImages} />);
    
    const firstImage = screen.getByAltText(mockImages[0].description);
    expect(firstImage).toBeInTheDocument();
    // Should not throw error when clicked without handler
    expect(() => firstImage.click()).not.toThrow();
  });

  it('should limit display to 3 images', () => {
    const manyImages = [
      ...mockImages,
      { id: '4', url: '/img4.jpg', description: 'Fourth image', turn: 4 },
      { id: '5', url: '/img5.jpg', description: 'Fifth image', turn: 5 }
    ];
    
    render(<ImageGallery images={manyImages} />);
    
    const imgElements = screen.getAllByTestId('gallery-image');
    expect(imgElements).toHaveLength(3);
  });
}); 