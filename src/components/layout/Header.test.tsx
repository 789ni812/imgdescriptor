import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

// Mock Next.js Link component for testing
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock the next/image component
jest.mock('next/image', () => {
  const MockImage = ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />;
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('Header Component', () => {
  it('renders the title correctly with a link to the homepage', () => {
    render(<Header />);
    const linkElement = screen.getByRole('link', { name: /ai image describer/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/');

    const titleElement = screen.getByRole('heading', { name: /ai image describer/i });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass('text-2xl', 'font-bold', 'text-primary', 'font-sans');
  });

  it('should have proper styling for a site header', () => {
    render(<Header />);
    const headerElement = screen.getByTestId('header');
    
    // Check for container and layout classes
    expect(headerElement).toHaveClass('w-full', 'bg-background', 'shadow-md', 'border-b', 'border-border');

    // Check for inner container with padding
    const innerContainer = headerElement.querySelector('div');
    expect(innerContainer).toHaveClass('container', 'mx-auto', 'px-4');

    // Check for flex layout to align items
    const flexContainer = innerContainer?.querySelector('div');
    expect(flexContainer).toHaveClass('flex', 'items-center', 'justify-between', 'h-16');
  });

  it('renders with SaaS theme: white bg, blue text, Inter font, stat icons, and shadow', () => {
    render(<Header />);
    const headerElement = screen.getByTestId('header');
    expect(headerElement).toHaveClass('bg-background', 'shadow-md');
    const titleElement = screen.getByRole('heading', { name: /ai image describer/i });
    expect(titleElement).toHaveClass('text-primary', 'font-bold', 'font-sans');
    // Stat icons (e.g., heart, dice) should be present
    expect(screen.getByTestId('stat-icon-health')).toBeInTheDocument();
    expect(screen.getByTestId('stat-icon-turn')).toBeInTheDocument();
  });
}); 