"use client";

import Link from 'next/link';
import CharacterStats from './CharacterStats';
import { useCharacterStore } from '@/lib/stores/characterStore';

export function Header() {
  const { character } = useCharacterStore();
  const hasCharacter = character.currentTurn > 0;

  return (
    <header data-testid="header" className="w-full bg-gray-800 shadow-md border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white hover:text-primary-light transition-colors">
              <h1 className="text-2xl font-bold text-blue-400">
                AI Image Describer
              </h1>
            </Link>
          </div>
          {/* Character Stats - desktop only */}
          {hasCharacter && (
            <div className="hidden md:flex items-center ml-8">
              <CharacterStats className="text-gray-300" />
            </div>
          )}
          <div className="text-sm text-gray-400 ml-4">
            {hasCharacter ? (
              <span>Turn {character.currentTurn}/3</span>
            ) : (
              <span>Upload an image and let our AI describe it for you.</span>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Character Stats - only below header bar */}
      {hasCharacter && (
        <div className="md:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
          <CharacterStats className="text-gray-300" />
        </div>
      )}
    </header>
  );
} 