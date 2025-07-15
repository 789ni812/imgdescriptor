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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tournament System</h1>
        <p className="text-gray-600">
          Create and manage automated single-elimination tournaments with up to 8 fighters.
        </p>
      </div>

      {/* Navigation */}
      <div className="mb-6" data-testid="tournament-navigation">
        <div className="flex space-x-2">
          <Button
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'default' : 'secondary'}
            data-testid="tournament-list-btn"
          >
            Tournament List
          </Button>
          <Button
            onClick={() => setViewMode('create')}
            variant={viewMode === 'create' ? 'default' : 'secondary'}
            data-testid="create-tournament-btn"
          >
            Create Tournament
          </Button>
          {selectedTournament && (
            <Button
              onClick={() => setViewMode('tournament')}
              variant={viewMode === 'tournament' ? 'default' : 'secondary'}
              data-testid="current-tournament-btn"
            >
              Current Tournament
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
        <div className="space-y-6" data-testid="tournament-detail-view">
          {/* Tournament Header */}
          <Card className="p-6" data-testid="tournament-header">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold" data-testid="tournament-name">{selectedTournament.name}</h2>
                <p className="text-gray-600" data-testid="tournament-info">
                  {selectedTournament.fighters.length} fighters • {selectedTournament.totalRounds} rounds
                </p>
              </div>
              <Button onClick={handleBackToList} variant="secondary" data-testid="back-to-list-btn">
                Back to List
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
  );
} 