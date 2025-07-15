'use client';

import React, { useState, useEffect } from 'react';
import { FighterMetadata } from '@/lib/utils/fighterUtils';

interface ChooseExistingFighterProps {
  onSelect: (fighter: FighterMetadata) => void;
}

const ChooseExistingFighter: React.FC<ChooseExistingFighterProps> = ({ onSelect }) => {
  const [fighters, setFighters] = useState<FighterMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFighters = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/fighting-game/list-fighters-metadata');
        const data = await response.json();
        
        if (data.success) {
          setFighters(data.fighters);
        } else {
          setError(data.error || 'Failed to load fighters');
        }
      } catch {
        setError('Failed to load fighters');
      } finally {
        setLoading(false);
      }
    };

    fetchFighters();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8" data-testid="fighter-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 text-center" data-testid="fighter-error">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Choose a Fighter</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fighters.map((fighter) => (
          <div
            key={fighter.id}
            data-testid="fighter-card"
            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onSelect(fighter)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(fighter);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Select ${fighter.name}`}
          >
            <div className="text-center">
              {fighter.image ? (
                <img 
                  src={`/vs/fighters/${fighter.image}`}
                  alt={fighter.name}
                  className="w-16 h-16 mx-auto mb-2 rounded object-cover"
                />
              ) : (
                <div className="w-16 h-16 mx-auto mb-2 rounded bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                  No Image
                </div>
              )}
              <h3 className="font-semibold text-lg">{fighter.name}</h3>
              <div className="mt-2 text-sm text-gray-600">
                <div>Health: {fighter.stats.health}</div>
                <div>Strength: {fighter.stats.strength}</div>
                <div>Agility: {fighter.stats.agility}</div>
                <div>Defense: {fighter.stats.defense}</div>
                <div>Luck: {fighter.stats.luck}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChooseExistingFighter; 