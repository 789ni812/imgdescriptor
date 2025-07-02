import React from 'react';
import { render, screen } from '@testing-library/react';
import { DMConfigSection } from './DMConfigSection';

describe('DMConfigSection', () => {
  it('renders as a SaaS card: white bg, rounded, shadow, blue heading, modern inputs, and GoodVsBadConfig', () => {
    render(<DMConfigSection />);
    const card = screen.getByRole('region', { name: /dungeon master config/i });
    expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-md', 'border', 'border-gray-200');
    const heading = screen.getByRole('heading', { name: /dungeon master config/i });
    expect(heading).toHaveClass('text-primary', 'font-bold');
    // Only check DM config section's own inputs (not GoodVsBadConfig)
    const dmInputs = screen.getAllByRole('textbox').filter(input => {
      const ph = (input as HTMLInputElement | HTMLTextAreaElement).placeholder;
      return ph !== 'e.g., good, light, hero' && ph !== 'e.g., bad, dark, villain' && ph !== "Describe what the 'bad' force represents in your game...";
    });
    dmInputs.forEach(input => {
      expect(input).toHaveClass('bg-white', 'text-slate-800', 'border', 'border-gray-200', 'rounded-md');
    });
    // GoodVsBadConfig child present
    expect(screen.getByTestId('good-vs-bad-config')).toBeInTheDocument();
  });
}); 