import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VotingResults from './VotingResults';
import { FighterVoteStats } from '@/lib/types/voting';

// Mock fetch
global.fetch = jest.fn();

describe('VotingResults', () => {
  const mockVoteResults: FighterVoteStats[] = [
    {
      fighterId: 'godzilla-1',
      name: 'Godzilla',
      imageUrl: '/fighters/godzilla.jpg',
      voteCount: 15,
      percentage: 75.5
    },
    {
      fighterId: 'kingkong-1',
      name: 'King Kong',
      imageUrl: '/fighters/kingkong.jpg',
      voteCount: 8,
      percentage: 24.5
    },
    {
      fighterId: 'brucelee-1',
      name: 'Bruce Lee',
      imageUrl: '/fighters/brucelee.jpg',
      voteCount: 5,
      percentage: 15.0
    }
  ];

  const mockSessionData = {
    sessionId: 'session-123',
    totalVotes: 28,
    totalRounds: 3,
    startTime: '2025-01-15T10:00:00Z',
    endTime: '2025-01-15T10:30:00Z',
    duration: 1800 // 30 minutes in seconds
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render voting results with fighter rankings', () => {
    render(<VotingResults results={mockVoteResults} sessionData={mockSessionData} />);
    
    // Check for session information
    expect(screen.getByText('Voting Results')).toBeInTheDocument();
    expect(screen.getByText('Session: session-123')).toBeInTheDocument();
    expect(screen.getByText('28 total votes')).toBeInTheDocument();
    expect(screen.getByText('3 rounds completed')).toBeInTheDocument();
  });

  it('should display fighters in rank order with vote counts', () => {
    render(<VotingResults results={mockVoteResults} sessionData={mockSessionData} />);
    
    // Check for rank indicators
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('🥈')).toBeInTheDocument();
    expect(screen.getByText('🥉')).toBeInTheDocument();
    
    // Check for fighter names and vote counts
    expect(screen.getByText('Godzilla')).toBeInTheDocument();
    expect(screen.getByText('15 votes')).toBeInTheDocument();
    expect(screen.getByText('75.5%')).toBeInTheDocument();
    
    expect(screen.getByText('King Kong')).toBeInTheDocument();
    expect(screen.getByText('8 votes')).toBeInTheDocument();
    expect(screen.getByText('24.5%')).toBeInTheDocument();
    
    expect(screen.getByText('Bruce Lee')).toBeInTheDocument();
    expect(screen.getByText('5 votes')).toBeInTheDocument();
    expect(screen.getByText('15.0%')).toBeInTheDocument();
  });

  it('should show visual indicators for top performers', () => {
    render(<VotingResults results={mockVoteResults} sessionData={mockSessionData} />);
    
    // Check for winner highlight
    const winnerSection = screen.getByText('Godzilla').closest('div');
    expect(winnerSection).toHaveClass('bg-yellow-50', 'border-yellow-200');
    
    // Check for runner-up styling
    const runnerUpSection = screen.getByText('King Kong').closest('div');
    expect(runnerUpSection).toHaveClass('bg-gray-50', 'border-gray-200');
  });

  it('should display progress bars for vote percentages', () => {
    render(<VotingResults results={mockVoteResults} sessionData={mockSessionData} />);
    
    // Check for progress bars
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(3);
    
    // Check that progress bars have correct values
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '75.5');
    expect(progressBars[1]).toHaveAttribute('aria-valuenow', '24.5');
    expect(progressBars[2]).toHaveAttribute('aria-valuenow', '15.0');
  });

  it('should show voting statistics and trends', () => {
    render(<VotingResults results={mockVoteResults} sessionData={mockSessionData} />);
    
    // Check for statistics
    expect(screen.getByText('Voting Statistics')).toBeInTheDocument();
    expect(screen.getByText('Average votes per round: 9.3')).toBeInTheDocument();
    expect(screen.getByText('Most popular fighter: Godzilla')).toBeInTheDocument();
    expect(screen.getByText('Session duration: 30 minutes')).toBeInTheDocument();
  });

  it('should handle export functionality', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });

    render(<VotingResults results={mockVoteResults} sessionData={mockSessionData} />);
    
    // Click export button
    const exportButton = screen.getByRole('button', { name: /export results/i });
    fireEvent.click(exportButton);
    
    // Should copy results to clipboard
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Voting Results')
      );
    });
    
    // Should show success message
    expect(screen.getByText(/results copied to clipboard/i)).toBeInTheDocument();
  });

  it('should handle share functionality', async () => {
    // Mock Web Share API
    Object.assign(navigator, {
      share: jest.fn().mockResolvedValue(undefined)
    });

    render(<VotingResults results={mockVoteResults} sessionData={mockSessionData} />);
    
    // Click share button
    const shareButton = screen.getByRole('button', { name: /share results/i });
    fireEvent.click(shareButton);
    
    // Should call Web Share API
    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalledWith({
        title: 'Fighter Voting Results',
        text: expect.stringContaining('Godzilla won with 75.5% of votes'),
        url: expect.stringContaining('session-123')
      });
    });
  });

  it('should show session history when available', () => {
    const sessionWithHistory = {
      ...mockSessionData,
      history: [
        { round: 1, winner: 'Godzilla', votes: 8 },
        { round: 2, winner: 'King Kong', votes: 6 },
        { round: 3, winner: 'Godzilla', votes: 7 }
      ]
    };

    render(<VotingResults results={mockVoteResults} sessionData={sessionWithHistory} />);
    
    // Check for session history
    expect(screen.getByText('Session History')).toBeInTheDocument();
    expect(screen.getByText('Round 1: Godzilla (8 votes)')).toBeInTheDocument();
    expect(screen.getByText('Round 2: King Kong (6 votes)')).toBeInTheDocument();
    expect(screen.getByText('Round 3: Godzilla (7 votes)')).toBeInTheDocument();
  });

  it('should handle empty results gracefully', () => {
    render(<VotingResults results={[]} sessionData={mockSessionData} />);
    
    expect(screen.getByText('No voting results available')).toBeInTheDocument();
    expect(screen.getByText('Start a voting session to see results')).toBeInTheDocument();
  });

  it('should show loading state when fetching additional data', async () => {
    render(<VotingResults results={mockVoteResults} sessionData={mockSessionData} />);
    
    // Click refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    // Should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('should handle error states gracefully', async () => {
    render(<VotingResults results={mockVoteResults} sessionData={mockSessionData} />);
    
    // Click refresh button to trigger error simulation
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    // Wait for error to appear (the component simulates an error after 1 second)
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Should show retry button
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should be responsive and mobile-friendly', () => {
    render(<VotingResults results={mockVoteResults} sessionData={mockSessionData} />);
    
    // Check for responsive classes on the results grid
    const resultsGrid = screen.getByText('Godzilla').closest('div')?.parentElement;
    expect(resultsGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    
    // Check for mobile-friendly button sizes
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm', 'md:text-base');
    });
  });

  it('should show fighter images', () => {
    render(<VotingResults results={mockVoteResults} sessionData={mockSessionData} />);
    
    // Check for fighter images
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    
    expect(images[0]).toHaveAttribute('src', '/fighters/godzilla.jpg');
    expect(images[0]).toHaveAttribute('alt', 'Godzilla');
    
    expect(images[1]).toHaveAttribute('src', '/fighters/kingkong.jpg');
    expect(images[1]).toHaveAttribute('alt', 'King Kong');
    
    expect(images[2]).toHaveAttribute('src', '/fighters/brucelee.jpg');
    expect(images[2]).toHaveAttribute('alt', 'Bruce Lee');
  });
}); 