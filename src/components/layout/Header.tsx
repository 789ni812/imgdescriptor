"use client";

import Link from 'next/link';
import CharacterStatsClientOnly from './CharacterStats';
import HeaderSoundControls from './HeaderSoundControls';
import { useCharacterStore } from '@/lib/stores/characterStore';
import { Heart, Dice5 } from 'lucide-react';

export function Header() {
  const { character } = useCharacterStore();
  const hasCharacter = character.currentTurn > 0;

  return (
    <header data-testid="header" className="w-full bg-background shadow-md border-b border-border">
      <div className="container mx-auto px-4 py-0">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
              <h1 className="text-2xl font-bold text-primary font-sans">
                AI Image Describer
              </h1>
            </Link>
          </div>
          {/* Character Stats - desktop only */}
          {hasCharacter && (
            <div className="hidden md:flex items-center ml-8 gap-6">
              {/* Health Stat */}
              <div className="flex items-center gap-1 text-primary font-semibold">
                <Heart data-testid="stat-icon-health" className="w-5 h-5 text-destructive" />
                <span>{character.health}</span>
              </div>
              {/* Turn Stat */}
              <div className="flex items-center gap-1 text-primary font-semibold">
                <Dice5 data-testid="stat-icon-turn" className="w-5 h-5 text-blue-500" />
                <span>Turn {character.currentTurn}/3</span>
              </div>
              <CharacterStatsClientOnly className="text-muted-foreground" />
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {hasCharacter ? (
                <span>Lv.{character.level}  XP {character.experience}</span>
              ) : (
                <span>Upload an image and let our AI describe it for you.</span>
              )}
            </div>
            <HeaderSoundControls />
          </div>
        </div>
      </div>
      {/* Mobile Character Stats - only below header bar */}
      {hasCharacter && (
        <div className="md:hidden container mx-auto px-4 pb-2">
          <CharacterStatsClientOnly className="text-muted-foreground" />
        </div>
      )}
    </header>
  );
} 