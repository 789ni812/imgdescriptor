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
    // Instead of checking for plain text, check for the markdown renderer
    expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
    expect(screen.getByText(mockData.story)).toBeVisible();

    // Click the description header to expand it
    fireEvent.click(screen.getByText('Image Description'));
    // The description should now be visible as HTML
    expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
    // The story should now be collapsed/hidden
    expect(screen.queryByText(mockData.story)).toBeNull();
  });

  it('renders markdown in description as HTML', () => {
    const markdownDescription = '# Heading\n**bold**\n- list item 1\n- list item 2';
    render(
      <GalleryCard {...mockData} description={markdownDescription} />
    );
    // Expand the description accordion
    fireEvent.click(screen.getByText('Image Description'));
    // Heading should render as an h1
    expect(screen.getByRole('heading', { level: 1, name: 'Heading' })).toBeInTheDocument();
    // Bold should render as <strong>
    const bold = screen.getByText('bold');
    expect(bold.tagName.toLowerCase()).toBe('strong');
    // List items should render as <li> inside a <ul>
    const list = screen.getByRole('list');
    const items = screen.getAllByRole('listitem');
    expect(items.map(li => li.textContent)).toEqual(['list item 1', 'list item 2']);
    expect(list).toContainElement(items[0]);
    expect(list).toContainElement(items[1]);
  });
}); 