import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer Component', () => {
  it('should render the copyright notice with the current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    const footerElement = screen.getByRole('contentinfo'); // footers have a default role of contentinfo
    
    expect(footerElement).toHaveTextContent(`© ${currentYear} AI Image Describer. All rights reserved.`);
  });

  it('should include a link to the GitHub repository', () => {
    render(<Footer />);
    const linkElement = screen.getByRole('link', { name: /view source on github/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://github.com/789ni812/imgdescriptor');
  });
}); 