import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer Component', () => {
  it('should render the copyright notice with the current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    const footerElement = screen.getByRole('contentinfo'); // footers have a default role of contentinfo
    
    expect(footerElement).toHaveTextContent(`© ${currentYear}`);
  });

  it('should not include a link to the GitHub repository', () => {
    render(<Footer />);
    const linkElement = screen.queryByRole('link', { name: /view source on github/i });
    expect(linkElement).not.toBeInTheDocument();
  });

  it('should have proper styling for a site footer', () => {
    render(<Footer />);
    const footerElement = screen.getByTestId('footer');
    
    // Check for container and layout classes
    expect(footerElement).toHaveClass('w-full', 'bg-card', 'shadow-md-top');

    // Check for inner container with padding
    const innerContainer = footerElement.querySelector('div');
    expect(innerContainer).toHaveClass('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');

    // Check for flex layout to align items
    const flexContainer = innerContainer?.querySelector('div');
    expect(flexContainer).toHaveClass('flex', 'items-center', 'justify-center', 'h-16');
  });

  it('should have a solid white top border', () => {
    render(<Footer />);
    const footerElement = screen.getByTestId('footer');
    // Check for Tailwind border classes
    expect(footerElement.className).toMatch(/border-t(-[0-9]+)?/);
    expect(footerElement.className).toMatch(/border-border/);
  });
}); 