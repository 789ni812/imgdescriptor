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
}); 