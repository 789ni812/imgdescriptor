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
}); 