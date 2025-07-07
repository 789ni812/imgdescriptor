import { 
  playGenerationSound, 
  preloadSounds, 
  cleanupSounds, 
  testSound,
  DEFAULT_SOUND_CONFIG,
  type SoundConfig 
} from './soundUtils';

// Mock Audio constructor
const mockAudio = {
  preload: '',
  volume: 0,
  currentTime: 0,
  play: jest.fn().mockResolvedValue(undefined),
};

global.Audio = jest.fn(() => mockAudio as unknown as HTMLAudioElement) as jest.MockedClass<typeof Audio>;

describe('soundUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanupSounds();
    // Mock the sound store to have default values
    jest.doMock('@/lib/stores/soundStore', () => ({
      useSoundStore: {
        getState: () => ({ volume: 0.5, muted: false })
      }
    }));
  });

  afterEach(() => {
    cleanupSounds();
  });

  describe('playGenerationSound', () => {
    it('should not play sound when disabled', () => {
      const config: SoundConfig = { ...DEFAULT_SOUND_CONFIG, enabled: false };
      playGenerationSound(config);
      expect(Audio).not.toHaveBeenCalled();
    });

    it('should play sound with default config', () => {
      playGenerationSound();
      expect(Audio).toHaveBeenCalledWith('/mixkit-confirmation-tone-2867.wav');
      expect(mockAudio.preload).toBe('auto');
      expect(mockAudio.volume).toBe(0.25); // 0.5 (store) * 0.5 (config) = 0.25
      expect(mockAudio.currentTime).toBe(0);
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should play sound with custom config', () => {
      const config: SoundConfig = {
        enabled: true,
        volume: 0.8,
        soundType: 'success'
      };
      playGenerationSound(config);
      expect(Audio).toHaveBeenCalledWith('/mixkit-tile-game-reveal-960.wav');
      expect(mockAudio.volume).toBe(0.4); // 0.5 (store) * 0.8 (config) = 0.4
    });

    it('should clamp volume to valid range', () => {
      const config: SoundConfig = {
        enabled: true,
        volume: 1.5, // Above max
        soundType: 'magic'
      };
      playGenerationSound(config);
      expect(mockAudio.volume).toBe(0.75); // 0.5 (store) * 1.5 (clamped to 1.0) = 0.5

      const config2: SoundConfig = {
        enabled: true,
        volume: -0.5, // Below min
        soundType: 'chime'
      };
      playGenerationSound(config2);
      expect(mockAudio.volume).toBe(0.0); // 0.5 (store) * -0.5 (clamped to 0.0) = 0.0
    });

    it('should handle play errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockPlay = jest.fn().mockRejectedValueOnce(new Error('Audio play failed'));
      const mockAudioWithError = {
        ...mockAudio,
        play: mockPlay
      };
      (global.Audio as jest.Mock).mockReturnValueOnce(mockAudioWithError);
      
      playGenerationSound();
      // Wait for the promise to settle
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to play generation sound:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle general errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      (global.Audio as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Audio creation failed');
      });
      
      playGenerationSound();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error playing generation sound:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should reuse cached audio objects', () => {
      playGenerationSound();
      playGenerationSound();
      
      // Should only create one Audio instance
      expect(Audio).toHaveBeenCalledTimes(1);
      expect(mockAudio.play).toHaveBeenCalledTimes(2);
    });
  });

  describe('preloadSounds', () => {
    it('should preload all sound types', () => {
      preloadSounds();
      
      expect(Audio).toHaveBeenCalledWith('/mixkit-confirmation-tone-2867.wav');
      expect(Audio).toHaveBeenCalledWith('/mixkit-tile-game-reveal-960.wav');
      expect(Audio).toHaveBeenCalledWith('/mixkit-tile-game-reveal-960.wav');
      expect(Audio).toHaveBeenCalledWith('/mixkit-confirmation-tone-2867.wav');
      expect(Audio).toHaveBeenCalledWith('/mixkit-confirmation-tone-2867.wav');
      expect(Audio).toHaveBeenCalledTimes(5);
    });
  });

  describe('cleanupSounds', () => {
    it('should clear audio cache', () => {
      // First, create some cached audio
      playGenerationSound();
      expect(Audio).toHaveBeenCalledTimes(1);
      
      // Clear cache
      cleanupSounds();
      
      // Play again - should create new audio instance
      playGenerationSound();
      expect(Audio).toHaveBeenCalledTimes(2);
    });
  });

  describe('testSound', () => {
    it('should play sound with provided config', () => {
      const config: SoundConfig = {
        enabled: true,
        volume: 0.3,
        soundType: 'ding'
      };
      
      testSound(config);
      
      expect(Audio).toHaveBeenCalledWith('/mixkit-confirmation-tone-2867.wav');
      expect(mockAudio.volume).toBe(0.15); // 0.5 (store) * 0.3 (config) = 0.15
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should use default config when none provided', () => {
      testSound();
      
      expect(Audio).toHaveBeenCalledWith('/mixkit-confirmation-tone-2867.wav');
      expect(mockAudio.volume).toBe(0.25); // 0.5 (store) * 0.5 (config) = 0.25
    });
  });
}); 