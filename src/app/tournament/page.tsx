"use client";

import React, { useEffect, useState } from 'react';
import BattleViewer from '@/components/fighting/BattleViewer';

const TournamentPage: React.FC = () => {
  const [battles, setBattles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');
  interface BattleData {
    metadata: {
      fighterA: {
        name: string;
        imageUrl: string;
        stats: {
          health: number;
          maxHealth: number;
          strength: number;
          luck: number;
          agility: number;
          defense: number;
          age: number;
          size: 'small' | 'medium' | 'large';
          build: 'thin' | 'average' | 'muscular' | 'heavy';
        };
      };
      fighterB: {
        name: string;
        imageUrl: string;
        stats: {
          health: number;
          maxHealth: number;
          strength: number;
          luck: number;
          agility: number;
          defense: number;
          age: number;
          size: 'small' | 'medium' | 'large';
          build: 'thin' | 'average' | 'muscular' | 'heavy';
        };
      };
      arena: {
        name: string;
        imageUrl: string;
        description: string;
      };
    };
    battleLog: Array<{
      round: number;
      attacker: string;
      defender: string;
      attackCommentary: string;
      defenseCommentary: string;
      attackerDamage: number;
      defenderDamage: number;
      randomEvent: string | null;
      arenaObjectsUsed: string | null;
      healthAfter: {
        attacker: number;
        defender: number;
      };
    }>;
  }

  const [battleData, setBattleData] = useState<BattleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tournaments/list')
      .then(res => res.json())
      .then(data => setBattles(data.battles || []))
      .catch(() => setError('Failed to load battle list'));
  }, []);

  const handleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filename = e.target.value;
    setSelected(filename);
    setBattleData(null);
    setError(null);
    if (!filename) return;
    try {
      const res = await fetch(`/tournaments/${filename}`);
      if (!res.ok) throw new Error('Failed to fetch battle log');
      const data = await res.json();
      setBattleData(data);
    } catch {
      setError('Failed to load battle log');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Tournament Battle Replay</h1>
      <label className="block mb-2">Select a past battle:</label>
      <select className="w-full p-2 border rounded mb-4" value={selected} onChange={handleSelect}>
        <option value="">-- Choose a battle --</option>
        {battles.map(b => (
          <option key={b} value={b}>{b.replace('.json', '').replace(/-/g, ' ')}</option>
        ))}
      </select>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {battleData && battleData.metadata && battleData.battleLog && (
        <BattleViewer
          fighterA={{ ...battleData.metadata.fighterA, id: 'fighterA', imageUrl: battleData.metadata.fighterA.imageUrl || '' }}
          fighterB={{ ...battleData.metadata.fighterB, id: 'fighterB', imageUrl: battleData.metadata.fighterB.imageUrl || '' }}
          scene={{
            name: battleData.metadata.arena.name,
            imageUrl: battleData.metadata.arena.imageUrl || '',
            description: battleData.metadata.arena.description || '',
          }}
          battleLog={battleData.battleLog}
          mode="replay"
        />
      )}
    </div>
  );
};

export default TournamentPage; 