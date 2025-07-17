'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import Leaderboard from '@/components/fighting/Leaderboard';
import BattleViewer from '@/components/fighting/BattleViewer';
import Image from 'next/image';

interface BattleReplay {
  id: string;
  fighterA: {
    id: string;
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
    id: string;
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
  scene: {
    name: string;
    imageUrl: string;
    description?: string;
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
  winner: string;
  date: string;
}

type ViewMode = 'leaderboard' | 'battle-replay';

export default function LeaderboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('leaderboard');
  const [selectedBattle, setSelectedBattle] = useState<BattleReplay | null>(null);
  const [availableBattles, setAvailableBattles] = useState<BattleReplay[]>([]);
  const [isLoadingBattles, setIsLoadingBattles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBattleReplays = async () => {
    setIsLoadingBattles(true);
    setError(null);

    try {
      const response = await fetch('/api/battle-replays/list');
      const data = await response.json();
      
      if (data.success) {
        setAvailableBattles(data.battleReplays);
      } else {
        setError(data.error || 'Failed to load battle replays');
      }
    } catch {
      setError('Failed to load battle replays');
    } finally {
      setIsLoadingBattles(false);
    }
  };

  const handleBattleSelect = (battle: BattleReplay) => {
    setSelectedBattle(battle);
    setViewMode('battle-replay');
  };

  const handleBackToLeaderboard = () => {
    setSelectedBattle(null);
    setViewMode('leaderboard');
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 text-gray-800">Battle Leaderboard</h1>
        <p className="text-lg text-gray-600">
          View fighter statistics and replay epic battles from the arena.
        </p>
      </div>

      {/* Navigation */}
      <div className="mb-8" data-testid="leaderboard-navigation">
        <div className="flex space-x-4">
          <Button
            onClick={() => setViewMode('leaderboard')}
            variant={viewMode === 'leaderboard' ? 'default' : 'secondary'}
            data-testid="leaderboard-btn"
            className="px-6 py-3 text-base"
          >
            Leaderboard
          </Button>
          <Button
            onClick={() => {
              setViewMode('battle-replay');
              loadBattleReplays();
            }}
            variant={viewMode === 'battle-replay' ? 'default' : 'secondary'}
            data-testid="battle-replays-btn"
            className="px-6 py-3 text-base"
          >
            Battle Replays
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'leaderboard' && (
        <div className="space-y-6" data-testid="leaderboard-view">
          <Leaderboard />
        </div>
      )}

      {viewMode === 'battle-replay' && (
        <div className="space-y-6" data-testid="battle-replay-view">
          {selectedBattle ? (
            <div data-testid="battle-viewer-container">
              {/* Battle Viewer */}
              <div className="mb-4">
                <Button onClick={handleBackToLeaderboard} variant="secondary" data-testid="back-to-battle-selection-btn">
                  ← Back to Battle Selection
                </Button>
              </div>
              
              <BattleViewer
                fighterA={{
                  ...selectedBattle.fighterA,
                  description: '',
                  visualAnalysis: {
                    age: 'unknown',
                    size: 'medium',
                    build: 'average',
                    appearance: [],
                    weapons: [],
                    armor: []
                  },
                  combatHistory: [],
                  winLossRecord: { wins: 0, losses: 0, draws: 0 },
                  createdAt: new Date().toISOString()
                }}
                fighterB={{
                  ...selectedBattle.fighterB,
                  description: '',
                  visualAnalysis: {
                    age: 'unknown',
                    size: 'medium',
                    build: 'average',
                    appearance: [],
                    weapons: [],
                    armor: []
                  },
                  combatHistory: [],
                  winLossRecord: { wins: 0, losses: 0, draws: 0 },
                  createdAt: new Date().toISOString()
                }}
                scene={{
                  ...selectedBattle.scene,
                  id: selectedBattle.id,
                  description: selectedBattle.scene.description || '',
                  environmentalObjects: [],
                  createdAt: new Date().toISOString()
                }}
                battleLog={selectedBattle.battleLog}
                mode="replay"
                onClose={handleBackToLeaderboard}
              />
            </div>
          ) : (
            <Card className="p-8" data-testid="battle-replays-list">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800" data-testid="battle-replays-title">Battle Replays</h2>
                <Button onClick={loadBattleReplays} variant="secondary" size="sm" data-testid="refresh-battles-btn" className="px-4 py-2">
                  Refresh
                </Button>
              </div>

              {error && <ErrorMessage message={error} data-testid="battle-replays-error" />}

              {isLoadingBattles ? (
                <div className="flex items-center justify-center py-8" data-testid="loading-battles">
                  <LoadingSpinner />
                  <span className="ml-2">Loading battle replays...</span>
                </div>
              ) : availableBattles.length === 0 ? (
                <div className="text-center py-8 text-gray-500" data-testid="no-battles-message">
                  <div className="text-lg font-medium mb-2">No battle replays available</div>
                  <div className="text-sm">
                    Battle replays will appear here after fights are completed.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="battle-replays-grid">
                  {availableBattles.map((battle) => (
                    <div
                      key={battle.id}
                      className="border rounded-lg p-6 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm hover:shadow-md"
                      onClick={() => handleBattleSelect(battle)}
                      data-testid={`battle-replay-${battle.id}`}
                    >
                      <div className="flex items-center justify-center space-x-4 mb-4">
                        {battle.fighterA.imageUrl ? (
                          <Image
                            src={battle.fighterA.imageUrl}
                            alt={battle.fighterA.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 border-2 border-gray-200">
                            ?
                          </div>
                        )}
                        <span className="text-lg font-bold text-gray-600">VS</span>
                        {battle.fighterB.imageUrl ? (
                          <Image
                            src={battle.fighterB.imageUrl}
                            alt={battle.fighterB.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 border-2 border-gray-200">
                            ?
                          </div>
                        )}
                      </div>
                      
                      <div className="text-base font-semibold text-center mb-3">
                        {battle.fighterA.name} vs {battle.fighterB.name}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2 text-center">
                        Winner: <span className="font-bold text-green-600">{battle.winner}</span>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-4 text-center">
                        {new Date(battle.date).toLocaleDateString()} • {battle.battleLog.length} rounds
                      </div>
                      
                      <div className="text-sm text-blue-600 text-center font-medium hover:text-blue-800 transition-colors">
                        Click to replay
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
} 