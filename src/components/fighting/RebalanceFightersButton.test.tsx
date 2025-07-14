import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RebalanceFightersButton from './RebalanceFightersButton';

// Mock fetch
global.fetch = jest.fn();

describe('RebalanceFightersButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the rebalance button with correct text', () => {
    render(<RebalanceFightersButton />);
    
    expect(screen.getByRole('button', { name: /rebalance fighters/i })).toBeInTheDocument();
    expect(screen.getByText(/rebalance fighters/i)).toBeInTheDocument();
  });

  it('should show loading state when button is clicked', async () => {
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Balanced 2 fighters' })
      }), 100))
    );

    render(<RebalanceFightersButton />);
    
    const button = screen.getByRole('button', { name: /rebalance fighters/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/rebalancing fighters/i)).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  it('should call the balance-fighters API when clicked', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        message: 'Balanced 2 fighters',
        results: [
          { name: 'Darth Vader', type: 'Sith Lord', oldStats: {}, newStats: {} },
          { name: 'Bruce Lee', type: 'Peak Human', oldStats: {}, newStats: {} }
        ]
      })
    });

    render(<RebalanceFightersButton />);
    
    const button = screen.getByRole('button', { name: /rebalance fighters/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/fighting-game/balance-fighters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });
  });

  it('should show success message when rebalancing succeeds', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        message: 'Balanced 2 fighters',
        results: [
          { name: 'Darth Vader', type: 'Sith Lord' },
          { name: 'Bruce Lee', type: 'Peak Human' }
        ]
      })
    });

    render(<RebalanceFightersButton />);
    
    const button = screen.getByRole('button', { name: /rebalance fighters/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/successfully rebalanced 2 fighters/i)).toBeInTheDocument();
    });

    // Button should be re-enabled
    expect(button).not.toBeDisabled();
  });

  it('should show error message when API call fails', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ 
        success: false, 
        error: 'Internal server error' 
      })
    });

    render(<RebalanceFightersButton />);
    
    const button = screen.getByRole('button', { name: /rebalance fighters/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/error: internal server error/i)).toBeInTheDocument();
    });

    // Button should be re-enabled
    expect(button).not.toBeDisabled();
  });

  it('should show error message when network request fails', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<RebalanceFightersButton />);
    
    const button = screen.getByRole('button', { name: /rebalance fighters/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/error: network error/i)).toBeInTheDocument();
    });

    // Button should be re-enabled
    expect(button).not.toBeDisabled();
  });

  it('should clear success message after a delay', async () => {
    jest.useFakeTimers();
    
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        message: 'Balanced 2 fighters',
        results: []
      })
    });

    render(<RebalanceFightersButton />);
    
    const button = screen.getByRole('button', { name: /rebalance fighters/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/successfully rebalanced 0 fighters/i)).toBeInTheDocument();
    });

    // Fast-forward time to clear the message
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByText(/successfully rebalanced 0 fighters/i)).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should clear error message after a delay', async () => {
    jest.useFakeTimers();
    
    (fetch as jest.Mock).mockRejectedValue(new Error('Test error'));

    render(<RebalanceFightersButton />);
    
    const button = screen.getByRole('button', { name: /rebalance fighters/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/error: test error/i)).toBeInTheDocument();
    });

    // Fast-forward time to clear the message
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByText(/error: test error/i)).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should display fighter results when available', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        message: 'Balanced 2 fighters',
        results: [
          { name: 'Darth Vader', type: 'Sith Lord', oldStats: { health: 100 }, newStats: { health: 150 } },
          { name: 'Bruce Lee', type: 'Peak Human', oldStats: { health: 80 }, newStats: { health: 120 } }
        ]
      })
    });

    render(<RebalanceFightersButton />);
    
    const button = screen.getByRole('button', { name: /rebalance fighters/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/darth vader/i)).toBeInTheDocument();
      expect(screen.getByText(/bruce lee/i)).toBeInTheDocument();
      expect(screen.getByText(/sith lord/i)).toBeInTheDocument();
      expect(screen.getByText(/peak human/i)).toBeInTheDocument();
    });
  });
}); 