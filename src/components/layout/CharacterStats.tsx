"use client";

import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '@/lib/stores/characterStore';

interface CharacterStatsProps {
  className?: string;
}

const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
};

const CharacterStats: React.FC<CharacterStatsProps> = ({ className = '' }) => {
  const { character, getTotalStats, getAverageStats } = useCharacterStore();
  
  const totalStats = getTotalStats();
  const averageStats = getAverageStats();

  return (
    <div 
      data-testid="character-stats" 
      className={`flex items-center gap-4 text-sm text-muted-foreground ${className}`}
    >
      {/* Character Name */}
      <div className="font-semibold text-foreground">
        {character.name || 'Adventurer'}
      </div>

      {/* Level and Experience */}
      <div className="flex items-center gap-2">
        <span className="font-medium">Lv.{character.level}</span>
        <span className="text-xs">{character.experience} XP</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">INT</span>
          <span className="font-semibold">{character.stats.intelligence}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">CRE</span>
          <span className="font-semibold">{character.stats.creativity}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">PER</span>
          <span className="font-semibold">{character.stats.perception}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">WIS</span>
          <span className="font-semibold">{character.stats.wisdom}</span>
        </div>
      </div>

      {/* Total and Average */}
      <div className="flex items-center gap-2 text-xs">
        <span>Total: {totalStats}</span>
        <span>Avg: {averageStats.toFixed(1)}</span>
      </div>

      {/* Current Turn */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium">Turn:</span>
        <span className="font-semibold">{character.currentTurn}</span>
      </div>
    </div>
  );
};

export default function CharacterStatsClientOnly(props: CharacterStatsProps) {
  return <ClientOnly><CharacterStats {...props} /></ClientOnly>;
} 