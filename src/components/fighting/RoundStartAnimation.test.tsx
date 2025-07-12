import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoundStartAnimation from './RoundStartAnimation';
import { act } from 'react-dom/test-utils';
import { ROUND_ANIMATION_DURATION_MS } from '@/lib/constants';

jest.useFakeTimers();

describe('RoundStartAnimation', () => {
  it('renders the round number and disappears after 1 second', () => {
    render(<RoundStartAnimation round={3} />);
    expect(screen.getByText('Round 3')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(ROUND_ANIMATION_DURATION_MS);
    });
    expect(screen.queryByText('Round 3')).not.toBeInTheDocument();
  });

  it('calls onDone after animation completes', () => {
    const onDone = jest.fn();
    
    render(<RoundStartAnimation round={1} onDone={onDone} />);
    
    expect(onDone).not.toHaveBeenCalled();
    
    act(() => {
      jest.advanceTimersByTime(ROUND_ANIMATION_DURATION_MS);
    });
    
    expect(onDone).toHaveBeenCalledTimes(1);
  });
}); 