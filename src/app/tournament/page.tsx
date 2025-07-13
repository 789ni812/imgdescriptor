"use client";

import React, { useEffect, useState } from 'react';
import BattleViewer from '@/components/fighting/BattleViewer';
import Leaderboard from '@/components/fighting/Leaderboard';
import Image from 'next/image';
import { Listbox } from '@headlessui/react';

const TournamentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'replay'>('leaderboard');
  const [battles, setBattles] = useState<string[]>([]);
  const [battleMeta, setBattleMeta] = useState<Record<string, { fighterA: { name: string; imageUrl: string }; fighterB: { name: string; imageUrl: string } }>>({});
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
      .then(async data => {
        setBattles(data.battles || []);
        // Fetch metadata for each battle
        const meta: Record<string, { fighterA: { name: string; imageUrl: string }; fighterB: { name: string; imageUrl: string } }> = {};
        await Promise.all((data.battles || []).map(async (b: string) => {
          try {
            const res = await fetch(`/tournaments/${b}`);
            if (!res.ok) return;
            const d = await res.json();
            if (d && d.metadata && d.metadata.fighterA && d.metadata.fighterB) {
              meta[b] = {
                fighterA: { name: d.metadata.fighterA.name, imageUrl: d.metadata.fighterA.imageUrl },
                fighterB: { name: d.metadata.fighterB.name, imageUrl: d.metadata.fighterB.imageUrl },
              };
            }
          } catch {}
        }));
        setBattleMeta(meta);
      })
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
      <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
        {/* Left Side: Hub, Dropdown, Tabs, Leaderboard */}
        <div className="md:w-1/2 w-full flex flex-col">
          <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Tournament Hub</h1>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Select a past battle:</label>
            <div className="relative">
              <Listbox value={selected} onChange={value => { setSelected(value); handleSelect({ target: { value } } as any); }}>
                <div className="relative">
                  <Listbox.Button className="w-full p-3 border border-gray-300 rounded-lg mb-2 bg-white text-black font-semibold flex items-center justify-between">
                    <span className="flex items-center">
                      {selected && battleMeta[selected] ? (
                        <>
                          {battleMeta[selected].fighterA.imageUrl && (
                            <img src={battleMeta[selected].fighterA.imageUrl} alt={battleMeta[selected].fighterA.name} className="w-6 h-6 rounded-full mr-2" />
                          )}
                          <span className="mr-2">{battleMeta[selected].fighterA.name}</span>
                          <span className="mx-1 text-gray-400">vs</span>
                          <span className="mr-2">{battleMeta[selected].fighterB.name}</span>
                          {battleMeta[selected].fighterB.imageUrl && (
                            <img src={battleMeta[selected].fighterB.imageUrl} alt={battleMeta[selected].fighterB.name} className="w-6 h-6 rounded-full ml-2" />
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">-- Choose a battle --</span>
                      )}
                    </span>
                    <span className="text-gray-500 ml-2">▼</span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                    <Listbox.Option key="empty" value="">
                      {({ active }) => (
                        <span className={`block px-4 py-2 cursor-pointer ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-700'}`}>-- Choose a battle --</span>
                      )}
                    </Listbox.Option>
                    {battles.map(b => (
                      <Listbox.Option key={b} value={b}>
                        {({ selected: isSelected, active }) => (
                          <div className={`flex items-center px-4 py-2 cursor-pointer ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-700'} ${isSelected ? 'font-bold' : ''}`}>
                            {battleMeta[b]?.fighterA?.imageUrl && (
                              <img src={battleMeta[b].fighterA.imageUrl} alt={battleMeta[b].fighterA.name} className="w-6 h-6 rounded-full mr-2" />
                            )}
                            <span>{battleMeta[b]?.fighterA?.name || ''}</span>
                            <span className="mx-1 text-gray-400">vs</span>
                            <span>{battleMeta[b]?.fighterB?.name || ''}</span>
                            {battleMeta[b]?.fighterB?.imageUrl && (
                              <img src={battleMeta[b].fighterB.imageUrl} alt={battleMeta[b].fighterB.name} className="w-6 h-6 rounded-full ml-2" />
                            )}
                            <span className="ml-2 text-xs text-gray-400">{formatBattleName(b)}</span>
                          </div>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
            {error && (
              <div className="text-red-500 mb-2 p-2 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}
          </div>
          <div className="flex justify-center mb-6">
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
          <div className="flex-1">
            {activeTab === 'leaderboard' && <Leaderboard />}
            {activeTab === 'replay' && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Battle Replay</h2>
                <p className="text-gray-500 mb-4">Select a battle to view its replay on the right.</p>
              </div>
            )}
          </div>
        </div>
        {/* Right Side: Battle Replay or Placeholder */}
        <div className="md:w-1/2 w-full flex items-start justify-center min-h-[400px]">
          {battleData && battleData.metadata && battleData.battleLog ? (
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
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
                onClose={() => {
                  setSelected('');
                  setBattleData(null);
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full opacity-50 select-none">
              <span className="text-2xl font-semibold mb-4 text-gray-400">Choose a battle</span>
              <div className="relative w-full max-w-md">
                <Listbox value={selected} onChange={value => { setSelected(value); handleSelect({ target: { value } } as any); }}>
                  <div className="relative">
                    <Listbox.Button className="w-full p-3 border border-gray-300 rounded-lg mb-2 bg-white text-black font-semibold flex items-center justify-between">
                      <span className="flex items-center">
                        {selected && battleMeta[selected] ? (
                          <>
                            {battleMeta[selected].fighterA.imageUrl && (
                              <img src={battleMeta[selected].fighterA.imageUrl} alt={battleMeta[selected].fighterA.name} className="w-6 h-6 rounded-full mr-2" />
                            )}
                            <span className="mr-2">{battleMeta[selected].fighterA.name}</span>
                            <span className="mx-1 text-gray-400">vs</span>
                            <span className="mr-2">{battleMeta[selected].fighterB.name}</span>
                            {battleMeta[selected].fighterB.imageUrl && (
                              <img src={battleMeta[selected].fighterB.imageUrl} alt={battleMeta[selected].fighterB.name} className="w-6 h-6 rounded-full ml-2" />
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">-- Choose a battle --</span>
                        )}
                      </span>
                      <span className="text-gray-500 ml-2">▼</span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                      <Listbox.Option key="empty" value="">
                        {({ active }) => (
                          <span className={`block px-4 py-2 cursor-pointer ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-700'}`}>-- Choose a battle --</span>
                        )}
                      </Listbox.Option>
                      {battles.map(b => (
                        <Listbox.Option key={b} value={b}>
                          {({ selected: isSelected, active }) => (
                            <div className={`flex items-center px-4 py-2 cursor-pointer ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-700'} ${isSelected ? 'font-bold' : ''}`}>
                              {battleMeta[b]?.fighterA?.imageUrl && (
                                <img src={battleMeta[b].fighterA.imageUrl} alt={battleMeta[b].fighterA.name} className="w-6 h-6 rounded-full mr-2" />
                              )}
                              <span>{battleMeta[b]?.fighterA?.name || ''}</span>
                              <span className="mx-1 text-gray-400">vs</span>
                              <span>{battleMeta[b]?.fighterB?.name || ''}</span>
                              {battleMeta[b]?.fighterB?.imageUrl && (
                                <img src={battleMeta[b].fighterB.imageUrl} alt={battleMeta[b].fighterB.name} className="w-6 h-6 rounded-full ml-2" />
                              )}
                              <span className="ml-2 text-xs text-gray-400">{formatBattleName(b)}</span>
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentPage; 