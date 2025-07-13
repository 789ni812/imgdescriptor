import React, { useState, useEffect } from 'react';
import { ArenaMetadata } from '@/lib/utils/arenaUtils';

interface ChooseExistingArenaProps {
  onSelect: (arena: ArenaMetadata) => void;
}

const ChooseExistingArena: React.FC<ChooseExistingArenaProps> = ({ onSelect }) => {
  const [arenas, setArenas] = useState<ArenaMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArenas = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/fighting-game/list-arenas');
        const data = await response.json();
        if (data.success) {
          setArenas(data.arenas);
        } else {
          setError(data.error || 'Failed to load arenas');
        }
      } catch {
        setError('Failed to load arenas');
      } finally {
        setLoading(false);
      }
    };
    fetchArenas();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8" data-testid="arena-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 text-center" data-testid="arena-error">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Choose an Arena</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {arenas.map((arena) => (
          <div
            key={arena.id}
            data-testid="arena-card"
            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onSelect(arena)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(arena);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Select ${arena.name}`}
          >
            <div className="text-center">
              <img
                src={`/vs/arena/${arena.image}`}
                alt={arena.name}
                className="w-20 h-20 mx-auto mb-2 rounded"
              />
              <h3 className="font-semibold text-lg">{arena.name}</h3>
              <div className="mt-2 text-sm text-gray-600">
                <div>{arena.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChooseExistingArena; 