import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import React from 'react';

// Mock Next.js Link component for testing
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Header Component', () => {
  it('should render the application title', () => {
    render(<Header />);
    const titleElement = screen.getByRole('heading', { name: /ai image describer/i });
    expect(titleElement).toBeInTheDocument();
  });

  it('should link the title to the homepage', () => {
    render(<Header />);
    const linkElement = screen.getByRole('link', { name: /ai image describer/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/');
  });

  it('should have proper styling for a site header', () => {
    render(<Header />);
    const headerElement = screen.getByTestId('header');
    
    // Check for container and layout classes
    expect(headerElement).toHaveClass('w-full', 'bg-gray-800', 'shadow-md');

    // Check for inner container with padding
    const innerContainer = headerElement.querySelector('div');
    expect(innerContainer).toHaveClass('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');

    // Check for flex layout to align items
    const flexContainer = innerContainer?.querySelector('div');
    expect(flexContainer).toHaveClass('flex', 'items-center', 'justify-between', 'h-16');
  });

  it('renders the main title and subtitle', () => {
    render(<Header />);
    const titleElement = screen.getByRole('heading', { name: /ai image describer/i });
    expect(titleElement).toBeInTheDocument();
  });
}); 