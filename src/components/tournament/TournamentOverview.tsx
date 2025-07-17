'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

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
    age: number;
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
  fighterSlogans?: Record<string, { slogans: string[]; description: string }>;
}

interface Arena {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  environmentalObjects: string[];
  createdAt: string;
}

interface TournamentOverviewProps {
  tournamentName: string;
  tournamentDate: Date | string;
  arena: Arena;
  fighters: Fighter[];
  onComplete?: () => void;
}

interface TournamentOverviewData {
  overview: string;
  arenaDescription: string;
  tournamentHighlights: string[];
}

export default function TournamentOverview({
  tournamentName,
  tournamentDate,
  arena,
  fighters,
  onComplete
}: TournamentOverviewProps) {
  const [overviewData, setOverviewData] = useState<TournamentOverviewData | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentSlideshowIndex, setCurrentSlideshowIndex] = useState(0);
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false);
  const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasGeneratedOverview = useRef(false);

  // Generate tournament overview on mount
  useEffect(() => {
    if (hasGeneratedOverview.current) return;

    const generateOverview = async () => {
      setIsGenerating(true);
      hasGeneratedOverview.current = true;

      try {
        const response = await fetch('/api/tournaments/generate-overview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
                      body: JSON.stringify({
              tournamentName,
              tournamentDate: typeof tournamentDate === 'string' ? tournamentDate : tournamentDate.toISOString(),
              arena,
              fighters: fighters.map(f => ({
                name: f.name,
                stats: f.stats,
                description: f.description,
                visualAnalysis: f.visualAnalysis
              }))
            }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setOverviewData(result.data);
          } else {
            // Fallback overview
            setOverviewData({
              overview: `Welcome to the ${tournamentName}! This epic tournament features ${fighters.length} warriors battling for glory in the legendary ${arena.name}.`,
              arenaDescription: arena.description,
              tournamentHighlights: [
                `${fighters.length} fighters competing for the championship`,
                `Epic battles in the ${arena.name}`,
                `Only one will emerge victorious`
              ]
            });
          }
        } else {
          throw new Error('Failed to generate overview');
        }
      } catch (error) {
        console.error('Failed to generate tournament overview:', error);
        // Fallback overview
        setOverviewData({
          overview: `Welcome to the ${tournamentName}! This epic tournament features ${fighters.length} warriors battling for glory in the legendary ${arena.name}.`,
          arenaDescription: arena.description,
          tournamentHighlights: [
            `${fighters.length} fighters competing for the championship`,
            `Epic battles in the ${arena.name}`,
            `Only one will emerge victorious`
          ]
        });
      } finally {
        setIsGenerating(false);
      }
    };

    generateOverview();
  }, [tournamentName, tournamentDate, arena, fighters]);

  // Start slideshow after 3 seconds
  useEffect(() => {
    if (!isGenerating && !showSlideshow) {
      const timer = setTimeout(() => {
        console.log('Starting slideshow with fighters:', fighters.map(f => ({ name: f.name, imageUrl: f.imageUrl })));
        setShowSlideshow(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isGenerating, showSlideshow, fighters]);

  // Handle slideshow rotation
  useEffect(() => {
    if (showSlideshow && !isSlideshowPaused) {
      slideshowIntervalRef.current = setInterval(() => {
        setCurrentSlideshowIndex(prev => (prev + 1) % fighters.length);
      }, 6000);

      return () => {
        if (slideshowIntervalRef.current) {
          clearInterval(slideshowIntervalRef.current);
        }
      };
    }
  }, [showSlideshow, isSlideshowPaused, fighters.length]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (showSlideshow) {
          setIsSlideshowPaused(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSlideshow]);

  // Handle manual slideshow navigation
  const handleSlideshowNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentSlideshowIndex(prev => (prev + 1) % fighters.length);
    } else {
      setCurrentSlideshowIndex(prev => (prev - 1 + fighters.length) % fighters.length);
    }
    
    // Debug: Log current fighter info
    const nextIndex = direction === 'next' 
      ? (currentSlideshowIndex + 1) % fighters.length 
      : (currentSlideshowIndex - 1 + fighters.length) % fighters.length;
    const nextFighter = fighters[nextIndex];
    console.log('Slideshow navigation - Current fighter:', {
      name: nextFighter?.name,
      imageUrl: nextFighter?.imageUrl,
      index: nextIndex
    });
  };

  const currentFighter = fighters[currentSlideshowIndex];
  
  // Debug: Log current fighter info
  console.log('Current slideshow fighter:', {
    name: currentFighter?.name,
    imageUrl: currentFighter?.imageUrl,
    index: currentSlideshowIndex,
    totalFighters: fighters.length
  });
  
  const currentFighterSlogans = currentFighter?.fighterSlogans?.[currentFighter.id]?.slogans || [
    `The ${currentFighter?.name}`,
    `Ready for battle!`,
    `Champion material!`
  ];
  const currentSlogan = currentFighterSlogans[Math.floor(Math.random() * currentFighterSlogans.length)];

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Generating Tournament Overview</h2>
          <p className="text-lg">Creating epic tournament introduction...</p>
        </div>
      </div>
    );
  }

  if (showSlideshow) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Slideshow View */}
        <div className="relative w-full h-full">
          {/* Fighter Image */}
          <div className="absolute inset-0" style={{ zIndex: 1 }}>
            {currentFighter?.imageUrl ? (
              <img
                src={currentFighter.imageUrl}
                alt={currentFighter.name}
                className="w-full h-full object-cover"
                onLoad={(e) => {
                  console.log('Image loaded successfully:', currentFighter.imageUrl);
                  const target = e.target as HTMLImageElement;
                  console.log('Image element:', target);
                  console.log('Image dimensions:', target.naturalWidth, 'x', target.naturalHeight);
                }}
                onError={(e) => {
                  console.error('Image failed to load:', currentFighter.imageUrl);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <div class="text-white text-6xl font-bold">
                        Failed to load image for ${currentFighter.name}
                        <br />
                        <span class="text-sm">imageUrl: ${currentFighter.imageUrl}</span>
                      </div>
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-white text-6xl font-bold">
                  No Image for {currentFighter?.name}
                  <br />
                  <span className="text-sm">imageUrl: {currentFighter?.imageUrl || 'undefined'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Fighter Name - Bottom left */}
          <div className="absolute bottom-8 left-8 z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-2xl">
              {currentFighter?.name}
            </h2>
          </div>

          {/* Slogan - Large and right side */}
          <div className="absolute inset-0 flex items-center justify-end z-10 pr-8">
            <div className="text-right text-white max-w-4xl">
              <p className="text-4xl md:text-6xl lg:text-8xl font-bold leading-tight drop-shadow-2xl">
                {currentSlogan}
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-20" style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '10px', borderRadius: '8px' }}>
            <Button
              onClick={() => handleSlideshowNavigation('prev')}
              variant="outline"
              className="bg-black bg-opacity-50 text-white border-white hover:bg-white hover:text-black"
            >
              ← Previous
            </Button>
            
            <div className="text-white text-lg font-semibold mx-4">
              {currentSlideshowIndex + 1} / {fighters.length}
            </div>
            
            <Button
              onClick={() => handleSlideshowNavigation('next')}
              variant="outline"
              className="bg-black bg-opacity-50 text-white border-white hover:bg-white hover:text-black"
            >
              Next →
            </Button>
          </div>

          {/* Pause/Play Button */}
          <div className="absolute top-8 right-8 z-20">
            <Button
              onClick={() => setIsSlideshowPaused(prev => !prev)}
              variant="outline"
              className="bg-black bg-opacity-70 text-white border-white hover:bg-white hover:text-black px-4 py-2"
            >
              {isSlideshowPaused ? '▶️ Play' : '⏸️ Pause'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="absolute top-8 left-8 text-white text-sm bg-black bg-opacity-70 rounded-lg p-3 z-20">
            <p>Press <kbd className="px-2 py-1 bg-white text-black rounded">Space</kbd> to pause/resume</p>
            <p>Auto-advance every 6 seconds</p>
          </div>

          {/* Exit Button */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
            <Button
              onClick={() => {
                setShowSlideshow(false);
                onComplete?.();
              }}
              variant="outline"
              className="bg-black bg-opacity-70 text-white border-white hover:bg-white hover:text-black px-4 py-2"
            >
              Exit Slideshow
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tournament Overview */}
      <Card className="bg-gray-800/90 border-2 border-gray-700 shadow-xl rounded-2xl p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tournament Info */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              🏆 {tournamentName}
            </h1>
            <p className="text-gray-300 text-lg mb-4">
              {(typeof tournamentDate === 'string' ? new Date(tournamentDate) : tournamentDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {overviewData && (
              <div className="space-y-4">
                <p className="text-gray-200 leading-relaxed text-lg">
                  {overviewData.overview}
                </p>
                <div className="space-y-2">
                  {overviewData.tournamentHighlights.map((highlight, index) => (
                    <div key={index} className="flex items-center text-yellow-400">
                      <span className="mr-2">⚡</span>
                      <span className="text-gray-200">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Arena Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-4">🏟️ Arena</h3>
            {arena.imageUrl ? (
              <Image
                src={arena.imageUrl}
                alt={arena.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded-lg border-2 border-gray-600"
              />
            ) : (
              <div className="w-full h-48 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center">
                <span className="text-gray-400">No Arena Image</span>
              </div>
            )}
            <div>
              <h4 className="text-xl font-semibold text-white mb-2">{arena.name}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {overviewData?.arenaDescription || arena.description}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Fighter Grid */}
      <Card className="bg-gray-800/90 border-2 border-gray-700 shadow-xl rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">⚔️ Tournament Fighters</h2>
          <div className="text-gray-300 text-lg">
            {fighters.length} {fighters.length === 1 ? 'Fighter' : 'Fighters'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {fighters.map((fighter) => (
            <div
              key={fighter.id}
              className="bg-gray-700 rounded-xl p-4 text-center hover:bg-gray-600 transition-colors duration-200"
            >
              {fighter.imageUrl ? (
                <Image
                  src={fighter.imageUrl}
                  alt={fighter.name}
                  width={120}
                  height={120}
                  className="w-24 h-24 object-cover rounded-full mx-auto mb-3 border-2 border-gray-500"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-3 border-2 border-gray-500 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
              <h3 className="text-white font-semibold text-sm truncate">
                {fighter.name}
              </h3>
              <div className="text-gray-400 text-xs mt-1">
                STR: {fighter.stats.strength} | AGI: {fighter.stats.agility}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Slideshow Preview */}
      <Card className="bg-gray-800/90 border-2 border-gray-700 shadow-xl rounded-2xl p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">🎬 Fighter Slideshow</h3>
          <p className="text-gray-300 mb-6">
            Get ready for an epic fighter introduction slideshow! Each fighter will be displayed with their legendary slogans.
          </p>
          <div className="flex items-center justify-center space-x-4 text-gray-400 text-sm">
            <span>⏱️ Auto-advance every 6 seconds</span>
            <span>•</span>
            <span>⌨️ Press Space to pause/resume</span>
            <span>•</span>
            <span>🖱️ Click arrows to navigate</span>
          </div>
        </div>
      </Card>
    </div>
  );
} 