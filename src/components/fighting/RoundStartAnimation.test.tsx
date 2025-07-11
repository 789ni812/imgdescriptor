import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoundStartAnimation from './RoundStartAnimation';
import { act } from 'react-dom/test-utils';

jest.useFakeTimers();

describe('RoundStartAnimation', () => {
  it('renders the round number and disappears after 1 second', () => {
    render(<RoundStartAnimation round={3} />);
    expect(screen.getByText('Round 3')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.queryByText('Round 3')).not.toBeInTheDocument();
  });

  it('calls onStart when animation begins', () => {
    const onStart = jest.fn();
    const onDone = jest.fn();
    
    render(<RoundStartAnimation round={2} onStart={onStart} onDone={onDone} />);
    
    // onStart should be called immediately when component mounts
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onDone).not.toHaveBeenCalled();
    
    // onDone should be called after 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('calls onDone after animation completes', () => {
    const onDone = jest.fn();
    
    render(<RoundStartAnimation round={1} onDone={onDone} />);
    
    expect(onDone).not.toHaveBeenCalled();
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(onDone).toHaveBeenCalledTimes(1);
  });
}); 