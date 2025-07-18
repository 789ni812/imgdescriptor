'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FighterVote } from '@/lib/types/voting';
import { Button } from '@/components/ui/Button';

interface FighterVotingSlideshowProps {
  sessionId: string;
  fighters: FighterVote[];
  onVote: (fighterId: string) => Promise<void>;
  onComplete: () => void;
  roundDuration?: number; // in seconds, default 30
  isActive?: boolean;
}

export default function FighterVotingSlideshow({
  sessionId,
  fighters,
  onVote,
  onComplete,
  roundDuration = 30,
  isActive = true
}: FighterVotingSlideshowProps) {
  const [timeRemaining, setTimeRemaining] = useState(roundDuration);
  const [hasVoted, setHasVoted] = useState(false);
  const [isProcessingVote, setIsProcessingVote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompleted = useRef(false);

  // Countdown timer
  useEffect(() => {
    if (!isActive || hasVoted || hasCompleted.current) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          hasCompleted.current = true;
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, hasVoted, onComplete]);

  // Handle vote submission
  const handleVote = async (fighterId: string) => {
    if (hasVoted || isProcessingVote) return;

    setIsProcessingVote(true);
    setError(null);

    try {
      await onVote(fighterId);
      setHasVoted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vote failed');
    } finally {
      setIsProcessingVote(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (!isActive) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Voting Session Ended</h2>
          <p className="text-lg text-gray-300">Thank you for participating!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative w-full h-full">
        {/* Header with timer and progress */}
        <div className="absolute top-8 left-8 right-8 z-20 flex justify-between items-center">
          <div className="text-white">
            <h1 className="text-2xl font-bold">Vote for Your Favorite Fighter</h1>
            <p className="text-gray-300">Round 1</p>
          </div>
          
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-2">
              {timeRemaining}
            </div>
            <div className="text-lg text-gray-300">seconds</div>
          </div>

          <div className="text-white text-right">
            <p className="text-lg">Session: {sessionId}</p>
            <p className="text-gray-300">Choose wisely!</p>
          </div>
        </div>

        {/* Fighter Display */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="grid grid-cols-2 gap-8 max-w-6xl w-full px-8">
            {fighters.map((fighter, index) => (
              <div
                key={fighter.fighterId}
                className="relative bg-gray-800 rounded-2xl overflow-hidden border-4 border-gray-700 hover:border-blue-500 transition-all duration-300"
              >
                {/* Fighter Image */}
                <div className="relative h-96">
                  {fighter.imageUrl ? (
                    <Image
                      src={fighter.imageUrl}
                      alt={fighter.name}
                      fill={true}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      <span className="text-gray-400 text-lg">No Image</span>
                    </div>
                  )}
                  
                  {/* Fighter Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {fighter.name}
                    </h2>
                    <p className="text-gray-300 mb-4">
                      {fighter.description}
                    </p>
                    
                    {/* Fighter Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                      <div>Health: {fighter.stats.health}</div>
                      <div>Strength: {fighter.stats.strength}</div>
                      <div>Agility: {fighter.stats.agility}</div>
                      <div>Defense: {fighter.stats.defense}</div>
                      {fighter.stats.luck && <div>Luck: {fighter.stats.luck}</div>}
                    </div>
                  </div>
                </div>

                {/* Vote Button */}
                <div className="p-6">
                  <Button
                    onClick={() => handleVote(fighter.fighterId)}
                    disabled={hasVoted || isProcessingVote}
                    className={`w-full py-4 text-xl font-bold transition-all duration-300 ${
                      hasVoted
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : isProcessingVote
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                    }`}
                  >
                    {isProcessingVote ? (
                      'Processing Vote...'
                    ) : hasVoted ? (
                      'Vote Cast'
                    ) : (
                      `Vote for ${fighter.name}`
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg">
              <p className="text-lg font-bold">Error: {error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-8 left-8 text-white text-sm bg-black bg-opacity-70 rounded-lg p-3 z-20">
          <p>Click on a fighter to cast your vote</p>
          <p>Timer will auto-advance when time expires</p>
        </div>

        {/* Vote Status */}
        {hasVoted && (
          <div className="absolute bottom-8 right-8 z-20">
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg">
              <p className="font-bold">✓ Vote Cast Successfully!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 