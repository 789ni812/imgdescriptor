import React from 'react';
import type { CharacterStats } from '@/lib/types/character';

interface MinimalHUDProps {
  characterStats: CharacterStats;
  currentTurn: number;
  isInCombat?: boolean;
  currentLocation?: string;
}

export const MinimalHUD: React.FC<MinimalHUDProps> = ({
  characterStats,
  currentTurn,
  isInCombat = false,
  currentLocation,
}) => {
  // Calculate overall health as a percentage (using wisdom as a proxy for health)
  const healthPercentage = Math.min(100, Math.max(0, (characterStats.wisdom / 10) * 100));
  
  // Determine health color
  const getHealthColor = (percentage: number) => {
    if (percentage > 70) return 'bg-green-400';
    if (percentage > 40) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Turn Indicator */}
      <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
        <div className="text-white text-sm font-medium">
          Turn {currentTurn}/3
        </div>
      </div>

      {/* Health Indicator */}
      <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-white/80"></div>
          <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getHealthColor(healthPercentage)} transition-all duration-300`}
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Location Indicator */}
      {currentLocation && (
        <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
          <div className="text-white text-xs opacity-80">
            {currentLocation}
          </div>
        </div>
      )}

      {/* Combat Indicator */}
      {isInCombat && (
        <div className="bg-red-500/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-red-400/50 animate-pulse">
          <div className="text-white text-xs font-medium">
            ⚔️ Combat
          </div>
        </div>
      )}
    </div>
  );
}; 