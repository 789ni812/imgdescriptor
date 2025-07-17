import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TournamentOverview from './TournamentOverview';

// Mock fetch
global.fetch = jest.fn();

const mockArena = {
  id: 'arena-1',
  name: 'Castle Bridge',
  imageUrl: '/test-arena.jpg',
  description: 'A legendary bridge spanning a deep chasm, where warriors have fought for centuries.',
  environmentalObjects: ['stone walls', 'wooden bridge', 'torches'],
  createdAt: '2025-01-01T00:00:00.000Z'
};

const mockFighters = [
  {
    id: 'fighter-1',
    name: 'Superman',
    imageUrl: '/test-superman.jpg',
    description: 'A powerful superhero with incredible strength',
    stats: {
      strength: 100,
      agility: 80,
      health: 150,
      defense: 90,
      intelligence: 85,
      uniqueAbilities: ['Heat Vision', 'Super Strength'],
      luck: 75,
      age: 30,
      size: 'large'
    },
    visualAnalysis: {
      age: 'adult',
      size: 'large',
      build: 'muscular',
      appearance: ['blue suit', 'red cape'],
      weapons: [],
      armor: ['super suit']
    },
    fighterSlogans: {
      'fighter-1': {
        slogans: ['The Man of Steel', 'Truth, Justice, and Victory!', 'Unstoppable Force'],
        description: 'A legendary hero with the power to move mountains and the heart to protect all.'
      },
      'fighter-2': {
        slogans: ['The Brute', 'Unstoppable Force', 'Iron Fist'],
        description: 'A formidable warrior with unmatched physical power.'
      }
    }
  },
  {
    id: 'fighter-2',
    name: 'Big Daddy',
    imageUrl: '/test-bigdaddy.jpg',
    description: 'A formidable fighter with brute force',
    stats: {
      strength: 95,
      agility: 60,
      health: 140,
      defense: 85,
      intelligence: 70,
      uniqueAbilities: ['Brute Force', 'Iron Fist'],
      luck: 65,
      age: 35,
      size: 'large'
    },
    visualAnalysis: {
      age: 'adult',
      size: 'large',
      build: 'muscular',
      appearance: ['beard', 'tattoos'],
      weapons: [],
      armor: ['leather jacket']
    },
    fighterSlogans: {
      'fighter-2': {
        slogans: ['The Brute', 'Unstoppable Force', 'Iron Fist'],
        description: 'A formidable warrior with unmatched physical power.'
      }
    }
  }
] as any[];

describe('TournamentOverview', () => {
  const mockOnComplete = jest.fn();
  const tournamentName = 'Epic Championship';
  const tournamentDate = new Date('2025-01-15T20:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading state initially', () => {
    render(
      <TournamentOverview
        tournamentName={tournamentName}
        tournamentDate={tournamentDate}
        arena={mockArena}
        fighters={mockFighters}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Generating Tournament Overview')).toBeInTheDocument();
    expect(screen.getByText('Creating epic tournament introduction...')).toBeInTheDocument();
  });

  it('generates overview and displays tournament information', async () => {
    const mockResponse = {
      success: true,
      data: {
        overview: 'Welcome to the Epic Championship! This epic tournament features 2 warriors battling for glory in the legendary Castle Bridge.',
        arenaDescription: 'A legendary bridge spanning a deep chasm, where warriors have fought for centuries.',
        tournamentHighlights: [
          '2 fighters competing for the championship',
          'Epic battles in the Castle Bridge',
          'Only one will emerge victorious'
        ]
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TournamentOverview
        tournamentName={tournamentName}
        tournamentDate={tournamentDate}
        arena={mockArena}
        fighters={mockFighters}
        onComplete={mockOnComplete}
      />
    );

    // Wait for overview to load
    await waitFor(() => {
      expect(screen.getByText('🏆 Epic Championship')).toBeInTheDocument();
    });

    // Check tournament info
    expect(screen.getByText('Wednesday, January 15, 2025')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the Epic Championship! This epic tournament features 2 warriors battling for glory in the legendary Castle Bridge.')).toBeInTheDocument();

    // Check arena info
    expect(screen.getByText('🏟️ Arena')).toBeInTheDocument();
    expect(screen.getByText('Castle Bridge')).toBeInTheDocument();

    // Check fighter grid
    expect(screen.getByText('⚔️ Tournament Fighters')).toBeInTheDocument();
    expect(screen.getByText('2 Fighters')).toBeInTheDocument();
    expect(screen.getByText('Superman')).toBeInTheDocument();
    expect(screen.getByText('Big Daddy')).toBeInTheDocument();

    // Check slideshow preview
    expect(screen.getByText('🎬 Fighter Slideshow')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Get ready for an epic fighter introduction slideshow!'))).toBeInTheDocument();
  });

  it('handles API errors gracefully with fallback content', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <TournamentOverview
        tournamentName={tournamentName}
        tournamentDate={tournamentDate}
        arena={mockArena}
        fighters={mockFighters}
        onComplete={mockOnComplete}
      />
    );

    // Should show fallback content after error
    await waitFor(() => {
      expect(screen.getByText('Welcome to the Epic Championship! This epic tournament features 2 warriors battling for glory in the legendary Castle Bridge.')).toBeInTheDocument();
    });
  });

  it('starts slideshow after 3 seconds', async () => {
    const mockResponse = {
      success: true,
      data: {
        overview: 'Welcome to the Epic Championship!',
        arenaDescription: 'A legendary bridge.',
        tournamentHighlights: ['2 fighters competing']
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TournamentOverview
        tournamentName={tournamentName}
        tournamentDate={tournamentDate}
        arena={mockArena}
        fighters={mockFighters}
        onComplete={mockOnComplete}
      />
    );

    // Wait for overview to load
    await waitFor(() => {
      expect(screen.getByText('🏆 Epic Championship')).toBeInTheDocument();
    });

    // Fast-forward 3 seconds to trigger slideshow
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Should show slideshow
    await waitFor(() => {
      expect(screen.getByText('Superman')).toBeInTheDocument();
      // Match any of the possible slogans for Superman
      const slogans = ['The Man of Steel', 'Truth, Justice, and Victory!', 'Unstoppable Force'];
      const sloganFound = slogans.some(slogan => {
        return screen.queryByText((content) => content.includes(slogan));
      });
      expect(sloganFound).toBe(true);
    });
  });

  it('allows manual navigation in slideshow', async () => {
    const mockResponse = {
      success: true,
      data: {
        overview: 'Welcome to the Epic Championship!',
        arenaDescription: 'A legendary bridge.',
        tournamentHighlights: ['2 fighters competing']
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TournamentOverview
        tournamentName={tournamentName}
        tournamentDate={tournamentDate}
        arena={mockArena}
        fighters={mockFighters}
        onComplete={mockOnComplete}
      />
    );

    // Wait for overview to load and slideshow to start
    await waitFor(() => {
      expect(screen.getByText('🏆 Epic Championship')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.getByText('Superman')).toBeInTheDocument();
    });

    // Click next button
    fireEvent.click(screen.getByText('Next →'));

    // Should show second fighter
    await waitFor(() => {
      expect(screen.getByText('Big Daddy')).toBeInTheDocument();
    });

    // Click previous button
    fireEvent.click(screen.getByText('← Previous'));

    // Should show first fighter again
    await waitFor(() => {
      expect(screen.getByText('Superman')).toBeInTheDocument();
    });
  });

  it('allows pausing and resuming slideshow', async () => {
    const mockResponse = {
      success: true,
      data: {
        overview: 'Welcome to the Epic Championship!',
        arenaDescription: 'A legendary bridge.',
        tournamentHighlights: ['2 fighters competing']
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TournamentOverview
        tournamentName={tournamentName}
        tournamentDate={tournamentDate}
        arena={mockArena}
        fighters={mockFighters}
        onComplete={mockOnComplete}
      />
    );

    // Wait for overview to load and slideshow to start
    await waitFor(() => {
      expect(screen.getByText('🏆 Epic Championship')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.getByText('Superman')).toBeInTheDocument();
    });

    // Click pause button
    fireEvent.click(screen.getByText('⏸️ Pause'));

    // Should show play button
    expect(screen.getByText('▶️ Play')).toBeInTheDocument();

    // Click play button
    fireEvent.click(screen.getByText('▶️ Play'));

    // Should show pause button again
    expect(screen.getByText('⏸️ Pause')).toBeInTheDocument();
  });

  it('handles space key for pause/resume', async () => {
    const mockResponse = {
      success: true,
      data: {
        overview: 'Welcome to the Epic Championship!',
        arenaDescription: 'A legendary bridge.',
        tournamentHighlights: ['2 fighters competing']
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TournamentOverview
        tournamentName={tournamentName}
        tournamentDate={tournamentDate}
        arena={mockArena}
        fighters={mockFighters}
        onComplete={mockOnComplete}
      />
    );

    // Wait for overview to load and slideshow to start
    await waitFor(() => {
      expect(screen.getByText('🏆 Epic Championship')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.getByText('Superman')).toBeInTheDocument();
    });

    // Press space key
    fireEvent.keyDown(window, { code: 'Space' });

    // Should show play button (paused)
    expect(screen.getByText('▶️ Play')).toBeInTheDocument();

    // Press space key again
    fireEvent.keyDown(window, { code: 'Space' });

    // Should show pause button (resumed)
    expect(screen.getByText('⏸️ Pause')).toBeInTheDocument();
  });

  it('auto-advances slideshow every 6 seconds', async () => {
    const mockResponse = {
      success: true,
      data: {
        overview: 'Welcome to the Epic Championship!',
        arenaDescription: 'A legendary bridge.',
        tournamentHighlights: ['2 fighters competing']
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TournamentOverview
        tournamentName={tournamentName}
        tournamentDate={tournamentDate}
        arena={mockArena}
        fighters={mockFighters}
        onComplete={mockOnComplete}
      />
    );

    // Wait for overview to load and slideshow to start
    await waitFor(() => {
      expect(screen.getByText('🏆 Epic Championship')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.getByText('Superman')).toBeInTheDocument();
    });

    // Fast-forward 6 seconds
    act(() => {
      jest.advanceTimersByTime(6000);
    });

    // Should show second fighter
    await waitFor(() => {
      expect(screen.getByText('Big Daddy')).toBeInTheDocument();
    });
  });

  it('calls onComplete when exiting slideshow', async () => {
    const mockResponse = {
      success: true,
      data: {
        overview: 'Welcome to the Epic Championship!',
        arenaDescription: 'A legendary bridge.',
        tournamentHighlights: ['2 fighters competing']
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TournamentOverview
        tournamentName={tournamentName}
        tournamentDate={tournamentDate}
        arena={mockArena}
        fighters={mockFighters}
        onComplete={mockOnComplete}
      />
    );

    // Wait for overview to load and slideshow to start
    await waitFor(() => {
      expect(screen.getByText('🏆 Epic Championship')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.getByText('Superman')).toBeInTheDocument();
    });

    // Click exit button
    fireEvent.click(screen.getByText('Exit Slideshow'));

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('displays fighter stats in grid', async () => {
    const mockResponse = {
      success: true,
      data: {
        overview: 'Welcome to the Epic Championship!',
        arenaDescription: 'A legendary bridge.',
        tournamentHighlights: ['2 fighters competing']
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TournamentOverview
        tournamentName={tournamentName}
        tournamentDate={tournamentDate}
        arena={mockArena}
        fighters={mockFighters}
        onComplete={mockOnComplete}
      />
    );

    // Wait for overview to load
    await waitFor(() => {
      expect(screen.getByText('🏆 Epic Championship')).toBeInTheDocument();
    });

    // Check fighter stats are displayed
    expect(screen.getByText('STR: 100 | AGI: 80')).toBeInTheDocument();
    expect(screen.getByText('STR: 95 | AGI: 60')).toBeInTheDocument();
  });
}); 