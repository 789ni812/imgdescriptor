import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChooseExistingArena from './ChooseExistingArena';

const mockArenas = [
  {
    id: 'castle-1',
    name: 'Castle',
    image: 'castle.jpg',
    description: 'A grand medieval castle.',
    environmentalObjects: ['throne', 'torch'],
    createdAt: '2025-01-27T00:00:00Z'
  },
  {
    id: 'dojo-1',
    name: 'Dojo',
    image: 'dojo.jpg',
    description: 'A serene martial arts dojo.',
    environmentalObjects: ['mat', 'banner'],
    createdAt: '2025-01-27T00:00:00Z'
  }
];

describe('ChooseExistingArena', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders loading spinner while fetching', async () => {
    global.fetch = jest.fn(() => new Promise(() => {})) as any;
    render(<ChooseExistingArena onSelect={jest.fn()} />);
    expect(screen.getByTestId('arena-loading')).toBeInTheDocument();
  });

  it('renders grid of arenas with name, image, and description', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, arenas: mockArenas })
    });
    render(<ChooseExistingArena onSelect={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('Castle')).toBeInTheDocument());
    expect(screen.getByText('Dojo')).toBeInTheDocument();
    expect(screen.getAllByTestId('arena-card')).toHaveLength(2);
    expect(screen.getByAltText('Castle')).toBeInTheDocument();
    expect(screen.getByText(/A grand medieval castle/)).toBeInTheDocument();
    expect(screen.getByText(/A serene martial arts dojo/)).toBeInTheDocument();
  });

  it('constructs correct image paths with /vs/arena/ prefix', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, arenas: mockArenas })
    });
    render(<ChooseExistingArena onSelect={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('Castle')).toBeInTheDocument());
    const castleImg = screen.getByAltText('Castle') as HTMLImageElement;
    const dojoImg = screen.getByAltText('Dojo') as HTMLImageElement;
    expect(castleImg.src).toContain('/vs/arena/castle.jpg');
    expect(dojoImg.src).toContain('/vs/arena/dojo.jpg');
  });

  it('calls onSelect with the correct arena when clicked', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, arenas: mockArenas })
    });
    const onSelect = jest.fn();
    render(<ChooseExistingArena onSelect={onSelect} />);
    await waitFor(() => expect(screen.getByText('Castle')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Dojo'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Dojo' }));
  });

  it('handles API error gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, error: 'Failed to fetch' })
    });
    render(<ChooseExistingArena onSelect={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId('arena-error')).toBeInTheDocument());
    expect(screen.getByText(/Failed/)).toBeInTheDocument();
  });

  it('is keyboard accessible', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, arenas: mockArenas })
    });
    const onSelect = jest.fn();
    render(<ChooseExistingArena onSelect={onSelect} />);
    await waitFor(() => expect(screen.getByText('Castle')).toBeInTheDocument());
    const cards = screen.getAllByTestId('arena-card');
    cards[0].focus();
    expect(cards[0]).toHaveFocus();
    fireEvent.keyDown(cards[0], { key: 'Enter', code: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Castle' }));
  });
}); 