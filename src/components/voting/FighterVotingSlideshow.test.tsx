import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import FighterVotingSlideshow from './FighterVotingSlideshow';
import { FighterVote } from '@/lib/types/voting';

// Mock the voting API calls
jest.mock('@/lib/stores/votingStore', () => ({
  createVotingStore: jest.fn(() => ({
    initSession: jest.fn(),
    getSession: jest.fn(),
    vote: jest.fn(),
    getCurrentRound: jest.fn(),
    getResults: jest.fn()
  }))
}));

describe('FighterVotingSlideshow', () => {
  const mockFighters: FighterVote[] = [
    {
      fighterId: 'fighter-1',
      name: 'Godzilla',
      imageUrl: '/fighters/godzilla.jpg',
      description: 'A giant prehistoric monster',
      stats: { health: 800, strength: 150, agility: 60, defense: 80, luck: 25 }
    },
    {
      fighterId: 'fighter-2',
      name: 'King Kong',
      imageUrl: '/fighters/kingkong.jpg',
      description: 'A giant ape from Skull Island',
      stats: { health: 750, strength: 140, agility: 70, defense: 75, luck: 30 }
    }
  ];

  const mockProps = {
    sessionId: 'session-123',
    fighters: mockFighters,
    onVote: jest.fn(),
    onComplete: jest.fn(),
    roundDuration: 30, // 30 seconds
    isActive: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render voting slideshow with fighter pairs', () => {
    render(<FighterVotingSlideshow {...mockProps} />);
    
    expect(screen.getByText('Godzilla')).toBeInTheDocument();
    expect(screen.getByText('King Kong')).toBeInTheDocument();
    expect(screen.getByText('A giant prehistoric monster')).toBeInTheDocument();
    expect(screen.getByText('A giant ape from Skull Island')).toBeInTheDocument();
  });

  it('should display countdown timer starting at 30 seconds', () => {
    render(<FighterVotingSlideshow {...mockProps} />);
    
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText(/seconds/i)).toBeInTheDocument();
  });

  it('should countdown timer every second', async () => {
    render(<FighterVotingSlideshow {...mockProps} />);
    
    expect(screen.getByText('30')).toBeInTheDocument();
    
    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(screen.getByText('29')).toBeInTheDocument();
    });
    
    // Advance timer by 5 more seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    await waitFor(() => {
      expect(screen.getByText('24')).toBeInTheDocument();
    });
  });

  it('should have voting buttons for each fighter', () => {
    render(<FighterVotingSlideshow {...mockProps} />);
    
    expect(screen.getByRole('button', { name: /vote for godzilla/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /vote for king kong/i })).toBeInTheDocument();
  });

  it('should call onVote when a fighter is voted for', async () => {
    render(<FighterVotingSlideshow {...mockProps} />);
    
    const voteButton = screen.getByRole('button', { name: /vote for godzilla/i });
    fireEvent.click(voteButton);
    
    expect(mockProps.onVote).toHaveBeenCalledWith('fighter-1');
  });

  it('should disable voting buttons after a vote is cast', async () => {
    render(<FighterVotingSlideshow {...mockProps} />);
    
    const voteButton = screen.getByRole('button', { name: /vote for godzilla/i });
    fireEvent.click(voteButton);
    
    await waitFor(() => {
      expect(voteButton).toBeDisabled();
    });
    
    // After voting, both buttons should be disabled and show "Vote Cast"
    const allButtons = screen.getAllByRole('button');
    allButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('should auto-advance when timer reaches zero', async () => {
    render(<FighterVotingSlideshow {...mockProps} />);
    
    // Advance timer to 0 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });
    
    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalled();
    });
  });

  it.skip('should show progress indicator for voting session', () => {
    render(<FighterVotingSlideshow {...mockProps} />);
    
    expect(screen.getByText(/round/i)).toBeInTheDocument();
    expect(screen.getByText('Round 1')).toBeInTheDocument();
  });

  it('should display fighter images', () => {
    render(<FighterVotingSlideshow {...mockProps} />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', '/fighters/godzilla.jpg');
    expect(images[1]).toHaveAttribute('src', '/fighters/kingkong.jpg');
  });

  it('should show fighter stats', () => {
    render(<FighterVotingSlideshow {...mockProps} />);
    
    expect(screen.getByText(/health: 800/i)).toBeInTheDocument();
    expect(screen.getByText(/strength: 150/i)).toBeInTheDocument();
    expect(screen.getByText(/health: 750/i)).toBeInTheDocument();
    expect(screen.getByText(/strength: 140/i)).toBeInTheDocument();
  });

  it('should handle inactive state', () => {
    render(<FighterVotingSlideshow {...mockProps} isActive={false} />);
    
    expect(screen.getByText(/voting session ended/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /vote for godzilla/i })).not.toBeInTheDocument();
  });

  it('should show loading state when processing vote', async () => {
    // Mock a slow vote function that doesn't resolve immediately
    let resolveVote: (value: void) => void;
    const slowVote = jest.fn().mockImplementation(() => new Promise<void>(resolve => {
      resolveVote = resolve;
    }));
    const slowProps = { ...mockProps, onVote: slowVote };
    
    render(<FighterVotingSlideshow {...slowProps} />);
    
    const voteButton = screen.getByRole('button', { name: /vote for godzilla/i });
    fireEvent.click(voteButton);
    
    // Should show loading state immediately
    const processingButtons = screen.getAllByText('Processing Vote...');
    expect(processingButtons).toHaveLength(2); // Both buttons should show processing
    
    // Resolve the vote
    resolveVote!();
    
    // Wait for the vote to complete
    await waitFor(() => {
      const voteCastButtons = screen.getAllByText('Vote Cast');
      expect(voteCastButtons).toHaveLength(2); // Both buttons should show "Vote Cast"
    });
  });

  it('should handle error state when vote fails', async () => {
    mockProps.onVote.mockRejectedValueOnce(new Error('Vote failed'));
    
    render(<FighterVotingSlideshow {...mockProps} />);
    
    const voteButton = screen.getByRole('button', { name: /vote for godzilla/i });
    fireEvent.click(voteButton);
    
    await waitFor(() => {
      expect(screen.getByText(/error: vote failed/i)).toBeInTheDocument();
    });
  });
}); 