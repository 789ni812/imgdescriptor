'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { generateFighterSlogans } from '@/lib/lmstudio-client';

interface Fighter {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  stats: {
    strength: number;
    agility: number;
    health: number;
    defense: number;
    intelligence: number;
    uniqueAbilities: string[];
    luck: number;
    age: number; // Changed from string to number
    size: string;
    maxHealth?: number;
    magic?: number;
    ranged?: number;
  };
  visualAnalysis: {
    age: string;
    size: string;
    build: string;
    appearance: string[];
    weapons: string[];
    armor: string[];
  };
}

interface FighterSlideshowProps {
  fighters: Fighter[];
  onComplete: () => void;
  tournamentName?: string;
  arenaName?: string;
}

interface FighterSlogans {
  slogans: string[];
  description: string;
}

export default function FighterSlideshow({ 
  fighters, 
  onComplete, 
  tournamentName = 'Tournament',
  arenaName = 'Arena'
}: FighterSlideshowProps) {
  const [currentFighterIndex, setCurrentFighterIndex] = useState(0);
  const [fighterSlogans, setFighterSlogans] = useState<Record<string, FighterSlogans>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentFighter = fighters[currentFighterIndex];
  const isLastFighter = currentFighterIndex === fighters.length - 1;

  // Generate slogans for all fighters on mount
  useEffect(() => {
    const generateAllSlogans = async () => {
      setIsGenerating(true);
      const slogansMap: Record<string, FighterSlogans> = {};

      for (const fighter of fighters) {
        try {
          const result = await generateFighterSlogans(
            fighter.name,
            fighter.stats,
            fighter.visualAnalysis,
            fighter.description
          );

          if (result.success && result.slogans && result.description) {
            slogansMap[fighter.id] = {
              slogans: result.slogans,
              description: result.description
            };
          } else {
            // Fallback slogans
            slogansMap[fighter.id] = {
              slogans: [
                `The ${fighter.name}`,
                `Ready for battle!`,
                `Champion material!`
              ],
              description: fighter.description || `A formidable fighter ready to prove their worth.`
            };
          }
        } catch (error) {
          console.error(`Failed to generate slogans for ${fighter.name}:`, error);
          // Fallback slogans
          slogansMap[fighter.id] = {
            slogans: [
              `The ${fighter.name}`,
              `Ready for battle!`,
              `Champion material!`
            ],
            description: fighter.description || `A formidable fighter ready to prove their worth.`
          };
        }
      }

      setFighterSlogans(slogansMap);
      setIsGenerating(false);
    };

    generateAllSlogans();
  }, [fighters]);

  const handleNext = () => {
    if (isLastFighter) {
      onComplete();
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentFighterIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentSlogans = fighterSlogans[currentFighter?.id] || {
    slogans: ['Loading...', 'Preparing...', 'Almost ready...'],
    description: 'Loading fighter details...'
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Generating Fighter Introductions</h2>
          <p className="text-lg">Creating epic slogans and descriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="fighter-slideshow" className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center z-50">
      <div className={`max-w-4xl w-full mx-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {/* Tournament Header - Smaller and at top */}
        <div className="text-center mb-4">
          <h1 className="text-lg md:text-xl font-semibold text-gray-300 mb-1">
            {tournamentName}
          </h1>
          <p className="text-sm text-gray-400">Arena: {arenaName}</p>
          <div className="flex justify-center items-center mt-2 space-x-2">
            {fighters.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentFighterIndex ? 'bg-yellow-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Fighter Display */}
        <div className="bg-black bg-opacity-50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Fighter Image */}
            <div className="relative">
              <div className="relative w-full h-96 rounded-xl overflow-hidden border-4 border-yellow-400 shadow-2xl">
                <Image
                  src={currentFighter.imageUrl}
                  alt={currentFighter.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              
              {/* Comprehensive Fighter Stats Grid */}
              <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-yellow-400 font-bold">STR</div>
                  <div className="text-white">{currentFighter.stats.strength}</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-yellow-400 font-bold">AGI</div>
                  <div className="text-white">{currentFighter.stats.agility}</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-yellow-400 font-bold">HP</div>
                  <div className="text-white">{currentFighter.stats.health}</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-yellow-400 font-bold">DEF</div>
                  <div className="text-white">{currentFighter.stats.defense}</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-yellow-400 font-bold">LUCK</div>
                  <div className="text-white">{currentFighter.stats.luck}</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-yellow-400 font-bold">INT</div>
                  <div className="text-white">{currentFighter.stats.intelligence}</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-yellow-400 font-bold">AGE</div>
                  <div className="text-white">{currentFighter.stats.age}</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-yellow-400 font-bold">SIZE</div>
                  <div className="text-white capitalize">{currentFighter.stats.size}</div>
                </div>
              </div>
            </div>

            {/* Fighter Info */}
            <div className="space-y-6">
              {/* Fighter Name - Much Larger */}
              <div>
                <h2 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                  {currentFighter.name}
                </h2>
                <div className="h-2 w-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded"></div>
              </div>

              {/* Slogans */}
              <div className="space-y-3">
                {currentSlogans.slogans.map((slogan, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 border-l-4 border-yellow-400"
                  >
                    <p className="text-lg font-semibold text-white">{slogan}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                <p className="text-gray-300 leading-relaxed">
                  {currentSlogans.description}
                </p>
              </div>

              {/* Abilities */}
              {currentFighter.stats.uniqueAbilities && currentFighter.stats.uniqueAbilities.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">Special Abilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentFighter.stats.uniqueAbilities.map((ability, index) => (
                      <span
                        key={index}
                        className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200"
          >
            Skip Intro
          </button>
          <div className="text-center text-white">
            <p className="text-lg">
              Fighter {currentFighterIndex + 1} of {fighters.length}
            </p>
          </div>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black rounded-lg font-bold transition-all duration-200 transform hover:scale-105"
          >
            {isLastFighter ? 'Start Battle!' : 'Next Fighter'}
          </button>
        </div>
      </div>
    </div>
  );
} 