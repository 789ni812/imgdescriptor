import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HealthBar from './HealthBar';
import { act } from 'react-dom/test-utils';

jest.useFakeTimers();

describe('HealthBar', () => {
  it('renders with correct initial health and animates on change', () => {
    const { rerender } = render(<HealthBar current={100} max={200} color="red" />);
    const bar = screen.getByTestId('health-bar-inner');
    expect(bar).toHaveStyle('width: 50%');

    // Change health
    rerender(<HealthBar current={150} max={200} color="red" />);
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(bar).toHaveStyle('width: 75%');
  });

  it('shows correct text for health', () => {
    render(<HealthBar current={80} max={100} color="blue" />);
    expect(screen.getByText('Health: 80 / 100')).toBeInTheDocument();
  });
}); 