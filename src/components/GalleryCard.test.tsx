import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

import { GalleryCard } from './GalleryCard';

const mockData = {
  id: '1',
  url: '/test-image.jpg',
  description: 'A test image description',
  story: 'A test image story',
  turn: 1,
};

describe('GalleryCard', () => {
  it('renders image and accordion with description and story, with story open by default', () => {
    render(<GalleryCard {...mockData} />);

    // Image is always visible
    expect(screen.getByAltText('gallery image')).toBeInTheDocument();
    expect(screen.getByAltText('gallery image')).toHaveAttribute('src', mockData.url);

    // Accordion headers
    expect(screen.getByText('Image Description')).toBeInTheDocument();
    expect(screen.getByText('Image Story')).toBeInTheDocument();

    // By default, only the story is visible
    expect(screen.queryByText(mockData.description)).toBeNull();
    expect(screen.getByText(mockData.story)).toBeVisible();

    // Click the description header to expand it
    fireEvent.click(screen.getByText('Image Description'));
    expect(screen.getByText(mockData.description)).toBeVisible();
    // The story should now be collapsed/hidden
    expect(screen.queryByText(mockData.story)).toBeNull();
  });
}); 