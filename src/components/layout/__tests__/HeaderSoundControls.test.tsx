import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useSoundStore } from '@/lib/stores/soundStore';
import HeaderSoundControls from '../HeaderSoundControls';

// Reset Zustand store state before each test
beforeEach(() => {
  useSoundStore.setState({ volume: 0.5, muted: false });
});

describe('HeaderSoundControls', () => {
  it('renders volume slider and mute button with correct icon', () => {
    render(<HeaderSoundControls />);
    expect(screen.getByRole('slider', { name: /volume/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mute/i })).toBeInTheDocument();
    // Should show volume-up icon when not muted
    expect(screen.getByTestId('volume-icon')).toHaveAttribute('data-variant', 'up');
  });

  it('changes volume when slider is moved', () => {
    render(<HeaderSoundControls />);
    const slider = screen.getByRole('slider', { name: /volume/i });
    fireEvent.change(slider, { target: { value: 0.8 } });
    expect(useSoundStore.getState().volume).toBeCloseTo(0.8);
  });

  it('toggles mute when button is clicked and updates icon', () => {
    render(<HeaderSoundControls />);
    const button = screen.getByRole('button', { name: /mute/i });
    // Click to mute
    fireEvent.click(button);
    expect(useSoundStore.getState().muted).toBe(true);
    // Should show volume-off icon when muted
    expect(screen.getByTestId('volume-icon')).toHaveAttribute('data-variant', 'off');
    // Click again to unmute
    fireEvent.click(button);
    expect(useSoundStore.getState().muted).toBe(false);
    expect(screen.getByTestId('volume-icon')).toHaveAttribute('data-variant', 'up');
  });
}); 