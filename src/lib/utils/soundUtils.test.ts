import { type SoundConfig } from './soundUtils';

// Patch the Audio mock so every new Audio(url) returns the same instance for a given URL
const audioMockCache: Record<string, any> = {};
const getAudioInstance = (url: string) => audioMockCache[url];

beforeAll(() => {
  global.Audio = jest.fn().mockImplementation((src: string) => {
    if (!audioMockCache[src]) {
      let _volume = 0;
      let _preload = '';
      let _currentTime = 0;
      const playMock = jest.fn().mockResolvedValue(undefined);
      audioMockCache[src] = {
        play: playMock,
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        set preload(val: string) { _preload = val; },
        get preload() { return _preload; },
        set volume(val: number) { _volume = val; },
        get volume() { return _volume; },
        set currentTime(val: number) { _currentTime = val; },
        get currentTime() { return _currentTime; },
        set src(val: string) {},
        get src() { return src; },
      };
    }
    return audioMockCache[src];
  });
});

afterEach(() => {
  for (const key in audioMockCache) delete audioMockCache[key];
  jest.clearAllMocks();
});

describe('soundUtils', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    for (const key in audioMockCache) delete audioMockCache[key];
  });

  describe('playGenerationSound', () => {
    it('should not play sound when disabled', async () => {
      jest.doMock('@/lib/stores/soundStore', () => ({
        useSoundStore: { getState: () => ({ volume: 0.5, muted: false }) }
      }));
      const { playGenerationSound } = await import('./soundUtils');
      const config: SoundConfig = { enabled: false, volume: 0.5, soundType: 'notification' };
      await playGenerationSound(config);
      expect(Audio).not.toHaveBeenCalled();
    });

    it('should play sound with default config', async () => {
      jest.doMock('@/lib/stores/soundStore', () => ({
        useSoundStore: { getState: () => ({ volume: 0.5, muted: false }) }
      }));
      const { playGenerationSound } = await import('./soundUtils');
      await playGenerationSound();
      expect(Audio).toHaveBeenCalledWith('/mixkit-confirmation-tone-2867.wav');
      const audioInstance = getAudioInstance('/mixkit-confirmation-tone-2867.wav');
      expect(audioInstance.preload).toBe('auto');
      expect(audioInstance.volume).toBe(0.25); // 0.5 (store) * 0.5 (config) = 0.25
      expect(audioInstance.currentTime).toBe(0);
      expect(audioInstance.play).toHaveBeenCalled();
    });

    it('should play sound with custom config', async () => {
      jest.doMock('@/lib/stores/soundStore', () => ({
        useSoundStore: { getState: () => ({ volume: 0.5, muted: false }) }
      }));
      const { playGenerationSound } = await import('./soundUtils');
      const config: SoundConfig = { enabled: true, volume: 0.8, soundType: 'success' };
      await playGenerationSound(config);
      expect(Audio).toHaveBeenCalledWith('/mixkit-tile-game-reveal-960.wav');
      const audioInstance = getAudioInstance('/mixkit-tile-game-reveal-960.wav');
      expect(audioInstance.volume).toBe(0.4); // 0.5 (store) * 0.8 (config) = 0.4
    });

    it('should clamp volume to valid range', async () => {
      jest.doMock('@/lib/stores/soundStore', () => ({
        useSoundStore: { getState: () => ({ volume: 0.5, muted: false }) }
      }));
      const { playGenerationSound } = await import('./soundUtils');
      const config: SoundConfig = { enabled: true, volume: 1.5, soundType: 'magic' };
      await playGenerationSound(config);
      const audioInstance1 = getAudioInstance('/mixkit-tile-game-reveal-960.wav');
      expect(audioInstance1.volume).toBe(0.75); // 0.5 (store) * 1.5 (clamped to 1.0) = 0.5

      const config2: SoundConfig = { enabled: true, volume: -0.5, soundType: 'chime' };
      await playGenerationSound(config2);
      const audioInstance2 = getAudioInstance('/mixkit-confirmation-tone-2867.wav');
      expect(audioInstance2.volume).toBe(0.0); // 0.5 (store) * -0.5 (clamped to 0.0) = 0.0
    });

    it('should handle play errors gracefully', async () => {
      jest.doMock('@/lib/stores/soundStore', () => ({
        useSoundStore: { getState: () => ({ volume: 0.5, muted: false }) }
      }));
      const { playGenerationSound } = await import('./soundUtils');
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      // First call to create the audio instance
      await playGenerationSound();
      const audioInstance = getAudioInstance('/mixkit-confirmation-tone-2867.wav');
      audioInstance.play.mockRejectedValueOnce(new Error('Audio play failed'));
      // Second call to trigger the error
      await playGenerationSound();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to play generation sound:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle general errors gracefully', async () => {
      jest.doMock('@/lib/stores/soundStore', () => ({
        useSoundStore: { getState: () => ({ volume: 0.5, muted: false }) }
      }));
      const { playGenerationSound } = await import('./soundUtils');
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      // Simulate error in Audio constructor
      const origAudio = global.Audio;
      global.Audio = jest.fn(() => { throw new Error('Audio creation failed'); });
      await playGenerationSound();
      expect(consoleSpy).toHaveBeenCalledWith('Error playing generation sound:', expect.any(Error));
      global.Audio = origAudio;
      consoleSpy.mockRestore();
    });

    it('should reuse cached audio objects', async () => {
      jest.doMock('@/lib/stores/soundStore', () => ({
        useSoundStore: { getState: () => ({ volume: 0.5, muted: false }) }
      }));
      const { playGenerationSound } = await import('./soundUtils');
      await playGenerationSound();
      await playGenerationSound();
      expect(Audio).toHaveBeenCalledTimes(1);
      const audioInstance = getAudioInstance('/mixkit-confirmation-tone-2867.wav');
      expect(audioInstance.play).toHaveBeenCalledTimes(2);
    });
  });

  describe('preloadSounds', () => {
    it('should preload all sound types', async () => {
      const { preloadSounds } = await import('./soundUtils');
      preloadSounds();
      expect(Audio).toHaveBeenCalledWith('/mixkit-confirmation-tone-2867.wav');
      expect(Audio).toHaveBeenCalledWith('/mixkit-tile-game-reveal-960.wav');
      expect(Audio).toHaveBeenCalledTimes(5);
    });
  });

  describe('cleanupSounds', () => {
    it('should clear audio cache', async () => {
      const { playGenerationSound, cleanupSounds } = await import('./soundUtils');
      await playGenerationSound();
      expect(Audio).toHaveBeenCalledTimes(1);
      cleanupSounds();
      await playGenerationSound();
      expect(Audio).toHaveBeenCalledTimes(2);
    });
  });

  describe('testSound', () => {
    it('should play sound with provided config', async () => {
      jest.doMock('@/lib/stores/soundStore', () => ({
        useSoundStore: { getState: () => ({ volume: 0.5, muted: false }) }
      }));
      const { testSound } = await import('./soundUtils');
      const config: SoundConfig = { enabled: true, volume: 0.3, soundType: 'ding' };
      await testSound(config);
      await new Promise(r => setTimeout(r, 0));
      expect(Audio).toHaveBeenCalledWith('/mixkit-confirmation-tone-2867.wav');
      const audioInstance = getAudioInstance('/mixkit-confirmation-tone-2867.wav');
      expect(audioInstance.volume).toBe(0.15); // 0.5 (store) * 0.3 (config) = 0.15
      expect(audioInstance.play).toHaveBeenCalled();
    });

    it('should use default config when none provided', async () => {
      jest.doMock('@/lib/stores/soundStore', () => ({
        useSoundStore: { getState: () => ({ volume: 0.5, muted: false }) }
      }));
      const { testSound } = await import('./soundUtils');
      await testSound();
      await new Promise(r => setTimeout(r, 0));
      expect(Audio).toHaveBeenCalledWith('/mixkit-confirmation-tone-2867.wav');
      const audioInstance = getAudioInstance('/mixkit-confirmation-tone-2867.wav');
      expect(audioInstance.volume).toBe(0.25); // 0.5 (store) * 0.5 (config) = 0.25
    });
  });
}); 