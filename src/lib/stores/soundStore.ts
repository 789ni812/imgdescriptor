import { create } from 'zustand';

interface SoundState {
  volume: number; // 0 to 1
  muted: boolean;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
}

export const useSoundStore = create<SoundState>((set) => ({
  volume: 0.5,
  muted: false,
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ muted: !state.muted })),
  setMuted: (muted) => set({ muted }),
})); 