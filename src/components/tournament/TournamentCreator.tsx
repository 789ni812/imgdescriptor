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
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2">Loading fighters...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" data-testid="tournament-creator">
      <h2 className="text-2xl font-bold mb-4" data-testid="tournament-creator-title">Create Tournament</h2>
      
      {error && <ErrorMessage message={error} data-testid="tournament-creator-error" />}
      
      <div className="mb-4" data-testid="fighter-selection">
        <h3 className="text-lg font-semibold mb-2" data-testid="fighter-selection-title">
          Select Fighters ({selectedFighterIds.length}/8)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose 2-8 fighters for your tournament. Single elimination bracket will be generated automatically.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="fighter-grid">
          {availableFighters.map((fighter) => (
            <div
              key={fighter.id}
              className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                selectedFighterIds.includes(fighter.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleFighterToggle(fighter.id)}
              data-testid={`fighter-card-${fighter.id}`}
            >
              <div className="flex items-center space-x-2">
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
                  className="w-8 h-8 rounded object-cover"
                  data-testid={`fighter-image-${fighter.id}`}
                />
                <span className="font-medium text-sm" data-testid={`fighter-name-${fighter.id}`}>{fighter.name}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500" data-testid={`fighter-stats-${fighter.id}`}>
                HP: {fighter.stats.health} | STR: {fighter.stats.strength}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center" data-testid="tournament-creator-actions">
        <div className="text-sm text-gray-600" data-testid="tournament-info">
          {selectedFighterIds.length >= 2 && (
            <span>
              Tournament will have {Math.ceil(Math.log2(selectedFighterIds.length))} rounds
            </span>
          )}
        </div>
        
        <Button
          onClick={handleCreateTournament}
          disabled={selectedFighterIds.length < 2 || isLoading}
          className="px-6"
          data-testid="create-tournament-submit-btn"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">Creating...</span>
            </>
          ) : (
            'Create Tournament'
          )}
        </Button>
      </div>
    </Card>
  );
}; 