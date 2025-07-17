import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FighterSlideshow from './FighterSlideshow';

// Mock fetch
global.fetch = jest.fn();

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
    }
  }
];

describe('FighterSlideshow', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    render(
      <FighterSlideshow 
        fighters={mockFighters} 
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Generating Fighter Introductions')).toBeInTheDocument();
    expect(screen.getByText('Creating epic slogans and descriptions...')).toBeInTheDocument();
  });

  it('generates slogans for all fighters on mount', async () => {
    const mockResponse = {
      success: true,
      slogans: ['The Man of Steel', 'Truth, Justice, and Victory!', 'Unstoppable Force'],
      description: 'A legendary hero with the power to move mountains and the heart to protect all.'
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <FighterSlideshow 
        fighters={mockFighters} 
        onComplete={mockOnComplete}
      />
    );

    // Should call API for each fighter
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // Check first fighter's slogans are displayed
    await waitFor(() => {
      expect(screen.getByText('The Man of Steel')).toBeInTheDocument();
      expect(screen.getByText('Truth, Justice, and Victory!')).toBeInTheDocument();
      expect(screen.getByText('Unstoppable Force')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully with fallback slogans', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <FighterSlideshow 
        fighters={mockFighters} 
        onComplete={mockOnComplete}
      />
    );

    // Should show fallback slogans after error
    await waitFor(() => {
      expect(screen.getByText('The Superman')).toBeInTheDocument();
      expect(screen.getByText('Ready for battle!')).toBeInTheDocument();
      expect(screen.getByText('Champion material!')).toBeInTheDocument();
    });
  });

  it('allows navigation between fighters', async () => {
    const mockResponse = {
      success: true,
      slogans: ['The Man of Steel', 'Truth, Justice, and Victory!', 'Unstoppable Force'],
      description: 'A legendary hero with the power to move mountains and the heart to protect all.'
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <FighterSlideshow 
        fighters={mockFighters} 
        onComplete={mockOnComplete}
      />
    );

    // Wait for slogans to load
    await waitFor(() => {
      expect(screen.getByText('The Man of Steel')).toBeInTheDocument();
    });

    // Click next to go to second fighter
    fireEvent.click(screen.getByText('Next Fighter'));

    // Should show second fighter
    await waitFor(() => {
      expect(screen.getByText('Big Daddy')).toBeInTheDocument();
    });
  });

  it('calls onComplete when slideshow is finished', async () => {
    const mockResponse = {
      success: true,
      slogans: ['The Man of Steel', 'Truth, Justice, and Victory!', 'Unstoppable Force'],
      description: 'A legendary hero with the power to move mountains and the heart to protect all.'
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <FighterSlideshow 
        fighters={mockFighters} 
        onComplete={mockOnComplete}
      />
    );

    // Wait for slogans to load
    await waitFor(() => {
      expect(screen.getByText('The Man of Steel')).toBeInTheDocument();
    });

    // Click next to go to second fighter
    fireEvent.click(screen.getByText('Next Fighter'));

    // Wait for second fighter to load
    await waitFor(() => {
      expect(screen.getByText('Big Daddy')).toBeInTheDocument();
    });

    // Click "Start Battle!" to complete slideshow
    fireEvent.click(screen.getByText('Start Battle!'));

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('allows skipping the slideshow', async () => {
    const mockResponse = {
      success: true,
      slogans: ['The Man of Steel', 'Truth, Justice, and Victory!', 'Unstoppable Force'],
      description: 'A legendary hero with the power to move mountains and the heart to protect all.'
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <FighterSlideshow 
        fighters={mockFighters} 
        onComplete={mockOnComplete}
      />
    );

    // Wait for slogans to load
    await waitFor(() => {
      expect(screen.getByText('The Man of Steel')).toBeInTheDocument();
    });

    // Click skip
    fireEvent.click(screen.getByText('Skip Intro'));

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('uses pre-generated slogans when provided and skips API calls', async () => {
    const preGeneratedSlogans = {
      'fighter-1': {
        slogans: ['Pre-generated Superman Slogan', 'Ready for Action!', 'The Hero We Need'],
        description: 'A pre-generated description for Superman'
      },
      'fighter-2': {
        slogans: ['Pre-generated Big Daddy Slogan', 'Brute Force!', 'Unstoppable!'],
        description: 'A pre-generated description for Big Daddy'
      }
    };

    render(
      <FighterSlideshow 
        fighters={mockFighters} 
        onComplete={mockOnComplete}
        preGeneratedSlogans={preGeneratedSlogans}
      />
    );

    // Should not show loading state
    expect(screen.queryByText('Generating Fighter Introductions')).not.toBeInTheDocument();
    expect(screen.queryByText('Creating epic slogans and descriptions...')).not.toBeInTheDocument();

    // Should immediately show pre-generated slogans
    expect(screen.getByText('Pre-generated Superman Slogan')).toBeInTheDocument();
    expect(screen.getByText('Ready for Action!')).toBeInTheDocument();
    expect(screen.getByText('The Hero We Need')).toBeInTheDocument();
    expect(screen.getByText('A pre-generated description for Superman')).toBeInTheDocument();

    // Should not make any API calls
    expect(global.fetch).not.toHaveBeenCalled();

    // Click next to go to second fighter
    fireEvent.click(screen.getByText('Next Fighter'));

    // Should show second fighter's pre-generated slogans
    await waitFor(() => {
      expect(screen.getByText('Pre-generated Big Daddy Slogan')).toBeInTheDocument();
      expect(screen.getByText('Brute Force!')).toBeInTheDocument();
      expect(screen.getByText('Unstoppable!')).toBeInTheDocument();
      expect(screen.getByText('A pre-generated description for Big Daddy')).toBeInTheDocument();
    });
  });
}); 