// Sound utility for LLM generation feedback
export interface SoundConfig {
  enabled: boolean;
  volume: number;
  soundType: 'notification' | 'success' | 'magic' | 'chime' | 'ding';
}

// Default sound configuration
export const DEFAULT_SOUND_CONFIG: SoundConfig = {
  enabled: true,
  volume: 0.5,
  soundType: 'notification'
};

// Sound URLs for different types
const SOUND_URLS = {
  notification: '/mixkit-confirmation-tone-2867.wav',
  success: '/mixkit-tile-game-reveal-960.wav', 
  magic: '/mixkit-tile-game-reveal-960.wav',
  chime: '/mixkit-confirmation-tone-2867.wav',
  ding: '/mixkit-confirmation-tone-2867.wav'
};

// Cache for audio objects to avoid reloading
const audioCache = new Map<string, HTMLAudioElement>();

/**
 * Play a sound when LLM generation completes
 */
export async function playGenerationSound(config: SoundConfig = DEFAULT_SOUND_CONFIG): Promise<void> {
  if (!config.enabled) return;

  try {
    const soundUrl = SOUND_URLS[config.soundType];
    
    // Get or create audio element
    let audio = audioCache.get(soundUrl);
    if (!audio) {
      audio = new Audio(soundUrl);
      audio.preload = 'auto';
      audioCache.set(soundUrl, audio);
    }

    // Try to get global sound settings
    try {
      const { useSoundStore } = await import('@/lib/stores/soundStore');
      const soundState = useSoundStore.getState();
      
      // Check if sound is muted globally
      if (soundState.muted) return;

      // Use global volume setting, fallback to config volume
      const effectiveVolume = soundState.volume * config.volume;
      audio.volume = Math.max(0, Math.min(1, effectiveVolume));
    } catch {
      // Fallback to config volume if store is not available
      audio.volume = Math.max(0, Math.min(1, config.volume));
    }

    audio.currentTime = 0; // Reset to beginning
    audio.play().catch(error => {
      console.warn('Failed to play generation sound:', error);
    });
  } catch (error) {
    console.warn('Error playing generation sound:', error);
  }
}

/**
 * Preload all sounds for better performance
 */
export function preloadSounds(): void {
  Object.values(SOUND_URLS).forEach(url => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audioCache.set(url, audio);
  });
}

/**
 * Clean up audio cache
 */
export function cleanupSounds(): void {
  audioCache.clear();
}

/**
 * Test sound playback
 */
export function testSound(config: SoundConfig = DEFAULT_SOUND_CONFIG): void {
  playGenerationSound(config).catch(error => {
    console.warn('Failed to play test sound:', error);
  });
} 