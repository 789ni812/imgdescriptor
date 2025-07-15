'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import Leaderboard from '@/components/fighting/Leaderboard';
import BattleViewer from '@/components/fighting/BattleViewer';

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Battle Leaderboard</h1>
        <p className="text-gray-600">
          View fighter statistics and replay epic battles from the arena.
        </p>
      </div>

      {/* Navigation */}
      <div className="mb-6" data-testid="leaderboard-navigation">
        <div className="flex space-x-2">
          <Button
            onClick={() => setViewMode('leaderboard')}
            variant={viewMode === 'leaderboard' ? 'default' : 'secondary'}
            data-testid="leaderboard-btn"
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
                fighterA={selectedBattle.fighterA}
                fighterB={selectedBattle.fighterB}
                scene={selectedBattle.scene}
                battleLog={selectedBattle.battleLog}
                mode="replay"
                onClose={handleBackToLeaderboard}
              />
            </div>
          ) : (
            <Card className="p-6" data-testid="battle-replays-list">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" data-testid="battle-replays-title">Battle Replays</h2>
                <Button onClick={loadBattleReplays} variant="secondary" size="sm" data-testid="refresh-battles-btn">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="battle-replays-grid">
                  {availableBattles.map((battle) => (
                    <div
                      key={battle.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleBattleSelect(battle)}
                      data-testid={`battle-replay-${battle.id}`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        {battle.fighterA.imageUrl ? (
                          <img
                            src={battle.fighterA.imageUrl}
                            alt={battle.fighterA.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                            ?
                          </div>
                        )}
                        <span className="text-sm font-medium">vs</span>
                        {battle.fighterB.imageUrl ? (
                          <img
                            src={battle.fighterB.imageUrl}
                            alt={battle.fighterB.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                            ?
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm font-medium">
                        {battle.fighterA.name} vs {battle.fighterB.name}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        Winner: <span className="font-semibold">{battle.winner}</span>
                      </div>
                      
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(battle.date).toLocaleDateString()} • {battle.battleLog.length} rounds
                      </div>
                      
                      <div className="text-xs text-blue-600 mt-2">
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