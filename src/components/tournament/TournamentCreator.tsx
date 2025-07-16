'use client';

import React, { useState, useEffect } from 'react';
import { Fighter } from '@/lib/stores/fightingGameStore';
import { Tournament } from '@/lib/types/tournament';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface TournamentCreatorProps {
  onTournamentCreated: (tournament: Tournament) => void;
}

export const TournamentCreator: React.FC<TournamentCreatorProps> = ({ onTournamentCreated }) => {
  const [availableFighters, setAvailableFighters] = useState<Fighter[]>([]);
  const [selectedFighterIds, setSelectedFighterIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingFighters, setIsLoadingFighters] = useState(true);

  // Load available fighters
  useEffect(() => {
    const loadFighters = async () => {
      try {
        const response = await fetch('/api/fighting-game/list-fighters');
        const data = await response.json();
        
        if (data.success) {
          setAvailableFighters(data.fighters);
        } else {
          setError('Failed to load fighters');
        }
          } catch {
      setError('Failed to load fighters');
      } finally {
        setIsLoadingFighters(false);
      }
    };

    loadFighters();
  }, []);

  const handleFighterToggle = (fighterId: string) => {
    setSelectedFighterIds(prev => {
      if (prev.includes(fighterId)) {
        return prev.filter(id => id !== fighterId);
      } else {
        // Limit to 8 fighters
        if (prev.length >= 8) {
          setError('Maximum 8 fighters allowed per tournament');
          return prev;
        }
        return [...prev, fighterId];
      }
    });
    setError(null);
  };

  const handleCreateTournament = async () => {
    if (selectedFighterIds.length < 2) {
      setError('Select at least 2 fighters to create a tournament');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tournaments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fighterIds: selectedFighterIds,
        }),
      });

      const data = await response.json();

      if (data.success && data.tournament) {
        onTournamentCreated(data.tournament);
        setSelectedFighterIds([]);
      } else {
        setError(data.error || 'Failed to create tournament');
      }
    } catch {
      setError('Failed to create tournament');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingFighters) {
    return (
      <Card className="bg-gray-800/90 border-2 border-gray-700 shadow-xl rounded-2xl p-8">
        <div className="flex items-center justify-center text-white">
          <LoadingSpinner />
          <span className="ml-3 text-lg">Loading fighters...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/90 border-2 border-gray-700 shadow-xl rounded-2xl p-8" data-testid="tournament-creator">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center" data-testid="tournament-creator-title">
        <span className="mr-3">➕</span>
        Create Tournament
      </h2>
      
      {error && <ErrorMessage message={error} data-testid="tournament-creator-error" />}
      
      <div className="mb-6" data-testid="fighter-selection">
        <h3 className="text-xl font-bold mb-3 text-white" data-testid="fighter-selection-title">
          Select Fighters ({selectedFighterIds.length}/8)
        </h3>
        <p className="text-gray-300 mb-6 leading-relaxed">
          Choose 2-8 fighters for your tournament. Single elimination bracket will be generated automatically.
        </p>
        
        {/* Tournament size guidance */}
        {selectedFighterIds.length >= 2 && (
          <div className="mb-6 p-4 bg-blue-900/30 border-2 border-blue-600 rounded-xl">
            <div className="text-sm font-bold text-blue-300 mb-2">🏆 Tournament Structure:</div>
            <div className="text-xs text-blue-200">
              {selectedFighterIds.length === 2 && "2 fighters = 1 match (Final)"}
              {selectedFighterIds.length === 4 && "4 fighters = 3 matches (2 Semi-Finals + 1 Final)"}
              {selectedFighterIds.length === 8 && "8 fighters = 7 matches (4 Quarter-Finals + 2 Semi-Finals + 1 Final)"}
              {selectedFighterIds.length === 3 && "3 fighters = 3 matches (1 Semi-Final + 1 Final + 1 Bye)"}
              {selectedFighterIds.length === 5 && "5 fighters = 7 matches (3 Quarter-Finals + 2 Semi-Finals + 1 Final + 1 Bye)"}
              {selectedFighterIds.length === 6 && "6 fighters = 7 matches (3 Quarter-Finals + 2 Semi-Finals + 1 Final + 1 Bye)"}
              {selectedFighterIds.length === 7 && "7 fighters = 7 matches (4 Quarter-Finals + 2 Semi-Finals + 1 Final + 1 Bye)"}
            </div>
            {![2, 4, 8].includes(selectedFighterIds.length) && (
              <div className="text-xs text-orange-300 mt-2">
                ⚠️ Non-power-of-2: Some fighters will get byes (automatic advancement)
              </div>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="fighter-grid">
          {availableFighters.map((fighter) => (
            <div
              key={fighter.id}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                selectedFighterIds.includes(fighter.id)
                  ? 'border-green-500 bg-green-900/30 shadow-lg shadow-green-500/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
              }`}
              onClick={() => handleFighterToggle(fighter.id)}
              data-testid={`fighter-card-${fighter.id}`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedFighterIds.includes(fighter.id)}
                  onChange={() => handleFighterToggle(fighter.id)}
                  className="w-4 h-4"
                  data-testid={`fighter-checkbox-${fighter.id}`}
                />
                <img
                  src={fighter.imageUrl}
                  alt={fighter.name}
                  className="w-10 h-10 rounded-lg object-cover border-2 border-gray-600"
                  data-testid={`fighter-image-${fighter.id}`}
                />
                <span className="font-bold text-sm text-white" data-testid={`fighter-name-${fighter.id}`}>{fighter.name}</span>
              </div>
              <div className="mt-3 text-xs text-gray-400 bg-gray-800 rounded-lg p-2" data-testid={`fighter-stats-${fighter.id}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-red-400">❤️ HP:</span> {fighter.stats.health}
                  </div>
                  <div>
                    <span className="text-blue-400">💪 STR:</span> {fighter.stats.strength}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center" data-testid="tournament-creator-actions">
        <div className="text-sm text-gray-300 bg-gray-700 px-3 py-2 rounded-lg" data-testid="tournament-info">
          {selectedFighterIds.length >= 2 && (
            <span>
              Tournament will have {Math.ceil(Math.log2(selectedFighterIds.length))} rounds
            </span>
          )}
        </div>
        
        <Button
          onClick={handleCreateTournament}
          disabled={selectedFighterIds.length < 2 || isLoading}
          className="bg-green-600 hover:bg-green-700 text-white border-2 border-green-500 px-6 py-3 font-semibold transition-all duration-200 shadow-lg"
          data-testid="create-tournament-submit-btn"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">Creating...</span>
            </>
          ) : (
            '🏆 Create Tournament'
          )}
        </Button>
      </div>
    </Card>
  );
}; 