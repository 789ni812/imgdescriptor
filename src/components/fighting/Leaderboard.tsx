"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface FighterStats {
  name: string;
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  averageDamageDealt: number;
  averageDamageTaken: number;
  averageRoundsSurvived: number;
  totalRounds: number;
  currentStats: {
    strength: number;
    agility: number;
    luck: number;
    defense: number;
    health: number;
    maxHealth: number;
    size: string;
    build: string;
    age: number;
  };
  opponents: string[];
  arenas: string[];
  lastBattle: string;
  imageUrl?: string;
}

interface LeaderboardData {
  leaderboard: FighterStats[];
  totalBattles: number;
  lastUpdated: string;
}

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'winRate' | 'wins' | 'damageDealt' | 'damageTaken' | 'rounds'>('winRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tournaments/leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const leaderboardData = await response.json();
      setData(leaderboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortedLeaderboard = () => {
    if (!data?.leaderboard) return [];
    
    return [...data.leaderboard].sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      switch (sortBy) {
        case 'winRate':
          aValue = a.winRate;
          bValue = b.winRate;
          break;
        case 'wins':
          aValue = a.wins;
          bValue = b.wins;
          break;
        case 'damageDealt':
          aValue = a.averageDamageDealt;
          bValue = b.averageDamageDealt;
          break;
        case 'damageTaken':
          aValue = a.averageDamageTaken;
          bValue = b.averageDamageTaken;
          break;
        case 'rounds':
          aValue = a.averageRoundsSurvived;
          bValue = b.averageRoundsSurvived;
          break;
        default:
          aValue = a.winRate;
          bValue = b.winRate;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading leaderboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data?.leaderboard?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No battle data available. Start some fights to see the leaderboard!
      </div>
    );
  }

  const sortedLeaderboard = getSortedLeaderboard();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tournament Leaderboard</h2>
          <p className="text-gray-600">
            {data.totalBattles} total battles • Last updated: {formatDate(data.lastUpdated)}
          </p>
        </div>
        <button 
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Rank
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Fighter
                </th>
                <th 
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('winRate')}
                >
                  Win Rate {sortBy === 'winRate' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('wins')}
                >
                  Record {sortBy === 'wins' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('damageDealt')}
                >
                  Avg Damage Dealt {sortBy === 'damageDealt' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('damageTaken')}
                >
                  Avg Damage Taken {sortBy === 'damageTaken' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('rounds')}
                >
                  Avg Rounds {sortBy === 'rounds' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Battle
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedLeaderboard.map((fighter, index) => (
                <tr key={fighter.name} className="hover:bg-gray-50">
                  <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="text-lg">{getRankIcon(index + 1)}</span>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {fighter.imageUrl && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <Image
                            src={fighter.imageUrl}
                            alt={fighter.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{fighter.name}</div>
                        <div className="text-sm text-gray-500">
                          {fighter.opponents.length} opponents • {fighter.arenas.length} arenas
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="font-medium">{fighter.winRate.toFixed(1)}%</span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${fighter.winRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-900">
                    <span className="font-medium text-green-600">{fighter.wins}W</span>
                    <span className="text-gray-400 mx-1">-</span>
                    <span className="font-medium text-red-600">{fighter.losses}L</span>
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-900">
                    <span className="font-medium">{fighter.averageDamageDealt.toFixed(1)}</span>
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-900">
                    <span className="font-medium">{fighter.averageDamageTaken.toFixed(1)}</span>
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-900">
                    <span className="font-medium">{fighter.averageRoundsSurvived.toFixed(1)}</span>
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="flex space-x-2">
                        <span className="text-xs bg-red-100 text-red-800 px-1 rounded">STR: {fighter.currentStats.strength}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">AGI: {fighter.currentStats.agility}</span>
                      </div>
                      <div className="flex space-x-2">
                        <span className="text-xs bg-green-100 text-green-800 px-1 rounded">LUK: {fighter.currentStats.luck}</span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">DEF: {fighter.currentStats.defense}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-500">
                    {formatDate(fighter.lastBattle)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{data.totalBattles}</div>
          <div className="text-sm text-blue-800">Total Battles</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{data.leaderboard.length}</div>
          <div className="text-sm text-green-800">Active Fighters</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {Math.max(...data.leaderboard.map(f => f.wins))}
          </div>
          <div className="text-sm text-yellow-800">Most Wins</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {Math.max(...data.leaderboard.map(f => f.averageDamageDealt)).toFixed(1)}
          </div>
          <div className="text-sm text-purple-800">Highest Avg Damage</div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 