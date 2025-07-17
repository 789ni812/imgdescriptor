'use client';

import React, { useState, useEffect } from 'react';
import { FighterMetadata } from '@/lib/utils/fighterUtils';
import Image from 'next/image';

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
            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors bg-white shadow-sm"
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
                <Image 
                  src={`/vs/fighters/${fighter.image}`}
                  alt={fighter.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 mx-auto mb-2 rounded object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 mx-auto mb-2 rounded bg-gray-300 flex items-center justify-center text-gray-600 text-xs border-2 border-gray-200">
                  No Image
                </div>
              )}
              <h3 className="font-semibold text-lg mb-3 text-gray-800">{fighter.name}</h3>
              
              {/* Basic Stats */}
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Stats</h4>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                  <div>Health: {fighter.stats.health}</div>
                  <div>Strength: {fighter.stats.strength}</div>
                  <div>Agility: {fighter.stats.agility}</div>
                  <div>Defense: {fighter.stats.defense}</div>
                  <div>Luck: {fighter.stats.luck}</div>
                </div>
              </div>

              {/* Special Stats (if any) */}
              {(fighter.stats.magic !== undefined || fighter.stats.ranged !== undefined || fighter.stats.intelligence !== undefined) && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Special Stats</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    {fighter.stats.magic !== undefined && <div>Magic: {fighter.stats.magic}</div>}
                    {fighter.stats.ranged !== undefined && <div>Ranged: {fighter.stats.ranged}</div>}
                    {fighter.stats.intelligence !== undefined && <div>Intelligence: {fighter.stats.intelligence}</div>}
                  </div>
                </div>
              )}

              {/* Unique Abilities (if any) */}
              {fighter.stats.uniqueAbilities && fighter.stats.uniqueAbilities.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Abilities</h4>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {fighter.stats.uniqueAbilities.map((ability, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium"
                      >
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Physical Characteristics */}
              {(fighter.stats.size || fighter.stats.build || fighter.stats.age) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Characteristics</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    {fighter.stats.size && <div>Size: {fighter.stats.size}</div>}
                    {fighter.stats.build && <div>Build: {fighter.stats.build}</div>}
                    {fighter.stats.age && <div>Age: {fighter.stats.age}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChooseExistingFighter; 