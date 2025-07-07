import React from 'react';
import { useSoundStore } from '@/lib/stores/soundStore';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const HeaderSoundControls: React.FC = () => {
  const { volume, muted, setVolume, toggleMute } = useSoundStore();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleVolumeChange}
        className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        aria-label="Volume"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute' : 'Mute'}
        className="p-1"
      >
        {muted ? (
          <VolumeX data-testid="volume-icon" data-variant="off" className="h-4 w-4" />
        ) : (
          <Volume2 data-testid="volume-icon" data-variant="up" className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default HeaderSoundControls; 