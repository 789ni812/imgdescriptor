import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChooseExistingFighter from './ChooseExistingFighter';

const mockFighters = [
  {
    id: 'godzilla-1',
    name: 'Godzilla',
    image: 'godzilla.jpg',
    stats: { health: 500, strength: 50, agility: 1, defense: 22, luck: 8 },
    matchHistory: []
  },
  {
    id: 'bruce-lee-1',
    name: 'Bruce Lee',
    image: 'bruce-lee.jpg',
    stats: { health: 100, strength: 15, agility: 20, defense: 8, luck: 18 },
    matchHistory: []
  }
];

describe('ChooseExistingFighter', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders loading spinner while fetching', async () => {
    global.fetch = jest.fn(() => new Promise(() => {})) as any;
    render(<ChooseExistingFighter onSelect={jest.fn()} />);
    expect(screen.getByTestId('fighter-loading')).toBeInTheDocument();
  });

  it('renders grid of fighters with name, image, and stats', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, fighters: mockFighters })
    });
    render(<ChooseExistingFighter onSelect={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('Godzilla')).toBeInTheDocument());
    expect(screen.getByText('Bruce Lee')).toBeInTheDocument();
    expect(screen.getAllByTestId('fighter-card')).toHaveLength(2);
    expect(screen.getByAltText('Godzilla')).toBeInTheDocument();
    expect(screen.getByText(/Health: 500/)).toBeInTheDocument();
    expect(screen.getByText(/Strength: 15/)).toBeInTheDocument();
  });

  it('constructs correct image paths with /vs/fighters/ prefix', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, fighters: mockFighters })
    });
    render(<ChooseExistingFighter onSelect={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('Godzilla')).toBeInTheDocument());
    
    const godzillaImg = screen.getByAltText('Godzilla') as HTMLImageElement;
    const bruceLeeImg = screen.getByAltText('Bruce Lee') as HTMLImageElement;
    
    expect(godzillaImg.src).toContain('/vs/fighters/godzilla.jpg');
    expect(bruceLeeImg.src).toContain('/vs/fighters/bruce-lee.jpg');
  });

  it('calls onSelect with the correct fighter when clicked', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, fighters: mockFighters })
    });
    const onSelect = jest.fn();
    render(<ChooseExistingFighter onSelect={onSelect} />);
    await waitFor(() => expect(screen.getByText('Godzilla')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Bruce Lee'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Bruce Lee' }));
  });

  it('handles API error gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, error: 'Failed to fetch' })
    });
    render(<ChooseExistingFighter onSelect={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId('fighter-error')).toBeInTheDocument());
    expect(screen.getByText(/Failed/)).toBeInTheDocument();
  });

  it('is keyboard accessible', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, fighters: mockFighters })
    });
    const onSelect = jest.fn();
    render(<ChooseExistingFighter onSelect={onSelect} />);
    await waitFor(() => expect(screen.getByText('Godzilla')).toBeInTheDocument());
    const cards = screen.getAllByTestId('fighter-card');
    cards[0].focus();
    expect(cards[0]).toHaveFocus();
    fireEvent.keyDown(cards[0], { key: 'Enter', code: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Godzilla' }));
  });
}); 