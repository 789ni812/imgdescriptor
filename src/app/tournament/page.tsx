"use client";

import React, { useEffect, useState } from 'react';
import BattleViewer from '@/components/fighting/BattleViewer';
import Leaderboard from '@/components/fighting/Leaderboard';

const TournamentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'replay'>('leaderboard');
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

  const formatBattleName = (filename: string) => {
    return filename
      .replace('.json', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/(\d{8})-(\d{6})/, (match, date, time) => {
        const year = date.substring(0, 4);
        const month = date.substring(4, 6);
        const day = date.substring(6, 8);
        const hour = time.substring(0, 2);
        const minute = time.substring(2, 4);
        return ` (${month}/${day}/${year} ${hour}:${minute})`;
      });
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Tournament Hub</h1>

      {/* Battle Dropdown Always Visible */}
      <div className="max-w-3xl mx-auto mb-8">
        <label className="block mb-2 text-sm font-medium text-gray-700">Select a past battle:</label>
        <select 
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selected} 
          onChange={handleSelect}
        >
          <option value="">-- Choose a battle --</option>
          {battles.map(b => (
            <option key={b} value={b}>{formatBattleName(b)}</option>
          ))}
        </select>
        {error && (
          <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        {battleData && battleData.metadata && battleData.battleLog && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <BattleViewer
              fighterA={{ 
                ...battleData.metadata.fighterA, 
                id: 'fighterA', 
                imageUrl: battleData.metadata.fighterA.imageUrl || '' 
              }}
              fighterB={{ 
                ...battleData.metadata.fighterB, 
                id: 'fighterB', 
                imageUrl: battleData.metadata.fighterB.imageUrl || '' 
              }}
              scene={{
                name: battleData.metadata.arena.name,
                imageUrl: battleData.metadata.arena.imageUrl || '',
                description: battleData.metadata.arena.description || '',
              }}
              battleLog={battleData.battleLog}
              mode="replay"
            />
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('replay')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'replay'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📺 Battle Replay
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'leaderboard' && (
        <Leaderboard />
      )}
      {activeTab === 'replay' && (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Battle Replay</h2>
          <p className="text-gray-500 mb-4">Select a battle above to view its replay.</p>
        </div>
      )}
    </div>
  );
};

export default TournamentPage; 