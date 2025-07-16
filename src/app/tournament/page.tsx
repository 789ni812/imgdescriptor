'use client';

import React, { useState } from 'react';
import { Tournament } from '@/lib/types/tournament';
import { TournamentCreator } from '@/components/tournament/TournamentCreator';
import { TournamentList } from '@/components/tournament/TournamentList';
import { TournamentBracket } from '@/components/tournament/TournamentBracket';
import { TournamentControls } from '@/components/tournament/TournamentControls';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';

type ViewMode = 'list' | 'create' | 'tournament';

export default function TournamentPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const handleTournamentCreated = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setViewMode('tournament');
  };

  const handleTournamentSelect = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setViewMode('tournament');
  };

  const handleTournamentUpdated = (tournament: Tournament) => {
    setSelectedTournament(tournament);
  };

  const handleBackToList = () => {
    setSelectedTournament(null);
    setViewMode('list');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-white drop-shadow-lg">🏆 Tournament System</h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Create and manage automated single-elimination tournaments with up to 8 fighters.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8" data-testid="tournament-navigation">
          <div className="flex space-x-3">
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'default' : 'secondary'}
              className={`px-6 py-3 font-semibold transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
              }`}
              data-testid="tournament-list-btn"
            >
              📋 Tournament List
            </Button>
            <Button
              onClick={() => setViewMode('create')}
              variant={viewMode === 'create' ? 'default' : 'secondary'}
              className={`px-6 py-3 font-semibold transition-all duration-200 ${
                viewMode === 'create' 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
              }`}
              data-testid="create-tournament-btn"
            >
              ➕ Create Tournament
            </Button>
            {selectedTournament && (
              <Button
                onClick={() => setViewMode('tournament')}
                variant={viewMode === 'tournament' ? 'default' : 'secondary'}
                className={`px-6 py-3 font-semibold transition-all duration-200 ${
                  viewMode === 'tournament' 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
                }`}
                data-testid="current-tournament-btn"
              >
                ⚔️ Current Tournament
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' && (
          <div data-testid="tournament-list-view">
            <TournamentList onTournamentSelect={handleTournamentSelect} />
          </div>
        )}

        {viewMode === 'create' && (
          <div className="space-y-6" data-testid="tournament-create-view">
            <TournamentCreator onTournamentCreated={handleTournamentCreated} />
          </div>
        )}

        {viewMode === 'tournament' && selectedTournament && (
          <div className="space-y-8" data-testid="tournament-detail-view">
            {/* Tournament Header */}
            <Card className="bg-gray-800/90 border-2 border-gray-700 shadow-xl rounded-2xl p-8" data-testid="tournament-header">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg" data-testid="tournament-name">
                    🏆 {selectedTournament.name}
                  </h2>
                  <p className="text-gray-300 text-lg" data-testid="tournament-info">
                    {selectedTournament.fighters.length} fighters • {selectedTournament.totalRounds} rounds
                  </p>
                </div>
                <Button 
                  onClick={handleBackToList} 
                  variant="secondary" 
                  className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 px-6 py-3 font-semibold transition-all duration-200"
                  data-testid="back-to-list-btn"
                >
                  ← Back to List
                </Button>
              </div>
            </Card>

            {/* Tournament Controls */}
            <div data-testid="tournament-controls">
              <TournamentControls
                tournament={selectedTournament}
                onTournamentUpdated={handleTournamentUpdated}
              />
            </div>

            {/* Tournament Bracket */}
            <div data-testid="tournament-bracket">
              <TournamentBracket tournament={selectedTournament} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 