'use client';

import React, { useState, useEffect } from 'react';
import { Tournament, TournamentMatch, TournamentHistoricalData } from '@/lib/types/tournament';
import { TournamentCreator } from '@/components/tournament/TournamentCreator';
import { TournamentList } from '@/components/tournament/TournamentList';
import { TournamentBracket } from '@/components/tournament/TournamentBracket';
import { TournamentControls } from '@/components/tournament/TournamentControls';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import BattleViewer from '@/components/fighting/BattleViewer';
import WinnerAnimation from '@/components/fighting/WinnerAnimation';
import { BattleRound } from '@/lib/types/battle';
import { PreGeneratedBattleRound } from '@/lib/stores/fightingGameStore';
import FighterSlideshow from '@/components/fighting/FighterSlideshow';
import TournamentCommentary from '@/components/tournament/TournamentCommentary';
import { TournamentCommentaryService } from '@/lib/services/tournament-commentary-service';

type ViewMode = 'list' | 'create' | 'tournament' | 'battle-replay';

// Helper function to convert PreGeneratedBattleRound to BattleRound
const mapPreGeneratedToBattleRound = (log: PreGeneratedBattleRound[]): BattleRound[] => {
  return log.map(round => ({
    ...round,
    randomEvent: null, // PreGeneratedBattleRound doesn't have this field
    arenaObjectsUsed: null, // PreGeneratedBattleRound doesn't have this field
    healthAfter: round.healthAfter || {
      attacker: 0,
      defender: 0
    }
  }));
};

export default function TournamentPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);
  
  // Battle replay state
  const [showBattleResults, setShowBattleResults] = useState(false);
  const [battleReplayComplete, setBattleReplayComplete] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showCommentary, setShowCommentary] = useState(false);
  const [tournamentCommentary, setTournamentCommentary] = useState<string>('');
  const [historicalData, setHistoricalData] = useState<TournamentHistoricalData | null>(null);

  // Initialize commentary service
  const commentaryService = TournamentCommentaryService.getInstance();

  // Initialize historical data when tournament is selected
  useEffect(() => {
    if (selectedTournament && !historicalData) {
      const initialHistoricalData = commentaryService.initializeHistoricalData(selectedTournament);
      setHistoricalData(initialHistoricalData);
    }
  }, [selectedTournament, historicalData, commentaryService]);

  const handleTournamentCreated = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setViewMode('tournament');
    // Initialize historical data for new tournament
    const initialHistoricalData = commentaryService.initializeHistoricalData(tournament);
    setHistoricalData(initialHistoricalData);
  };

  const handleTournamentSelect = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setViewMode('tournament');
    // Initialize historical data for selected tournament
    const initialHistoricalData = commentaryService.initializeHistoricalData(tournament);
    setHistoricalData(initialHistoricalData);
  };

  const handleTournamentUpdated = (tournament: Tournament) => {
    setSelectedTournament(tournament);
  };

  const handleBackToList = () => {
    setSelectedTournament(null);
    setHistoricalData(null);
    setViewMode('list');
  };

  // New handler for tournament match clicks
  const handleMatchClick = async (match: TournamentMatch) => {
    if (match.status === 'completed' && match.battleLog && match.fighterA && match.fighterB && selectedTournament && historicalData) {
      setSelectedMatch(match);
      setViewMode('battle-replay');
      setShowBattleResults(false);
      setBattleReplayComplete(false);
      setShowSlideshow(true);
      setShowCommentary(false);

      // Pre-generate commentary with historical context
      try {
        const commentary = await commentaryService.generateMatchCommentary(
          selectedTournament,
          match,
          historicalData
        );
        setTournamentCommentary(commentary.commentary);
      } catch (error) {
        console.error('Failed to generate commentary:', error);
        setTournamentCommentary('The crowd is buzzing with excitement as the fighters prepare to enter the arena!');
      }
    }
  };

  // Handler after slideshow completes
  const handleSlideshowComplete = () => {
    setShowSlideshow(false);
    setShowCommentary(true);
  };

  // Handler after commentary is done
  const handleCommentaryContinue = () => {
    setShowCommentary(false);
  };

  const handleBackToTournament = () => {
    setSelectedMatch(null);
    setViewMode('tournament');
    setShowBattleResults(false);
    setBattleReplayComplete(false);
  };

  const handleBattleReplayComplete = () => {
    console.log('Tournament: Battle replay completed, showing results modal');
    setBattleReplayComplete(true);
    setShowBattleResults(true);
  };

  const handleCloseBattleResults = () => {
    setShowBattleResults(false);
    setBattleReplayComplete(false);
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
              <TournamentBracket 
                tournament={selectedTournament} 
                onMatchClick={handleMatchClick}
              />
            </div>
          </div>
        )}

        {/* Battle Replay View */}
        {viewMode === 'battle-replay' && selectedMatch && selectedTournament && (() => {
          const { fighterA, fighterB } = selectedMatch;
          if (!fighterA || !fighterB) return null;
          return (
            <div className="space-y-6" data-testid="tournament-battle-replay-view">
              {showSlideshow && (
                <FighterSlideshow
                  fighters={[
                    {
                      ...fighterA,
                      stats: {
                        ...fighterA.stats,
                        intelligence: fighterA.stats.intelligence ?? 0,
                        uniqueAbilities: fighterA.stats.uniqueAbilities ?? [],
                      },
                    },
                    {
                      ...fighterB,
                      stats: {
                        ...fighterB.stats,
                        intelligence: fighterB.stats.intelligence ?? 0,
                        uniqueAbilities: fighterB.stats.uniqueAbilities ?? [],
                      },
                    },
                  ]}
                  onComplete={handleSlideshowComplete}
                  tournamentName={selectedTournament.name}
                  arenaName={'Tournament Arena'}
                />
              )}
              {showCommentary && (
                <TournamentCommentary
                  commentary={tournamentCommentary}
                  onContinue={handleCommentaryContinue}
                  fighterA={fighterA}
                  fighterB={fighterB}
                />
              )}
              {!showSlideshow && !showCommentary && selectedMatch.battleLog && (
                <div data-testid="tournament-battle-viewer-container">
                  {/* Battle Viewer Header */}
                  <div className="mb-4">
                    <Button onClick={handleBackToTournament} variant="secondary" data-testid="back-to-tournament-btn">
                      ← Back to Tournament
                    </Button>
                  </div>

                  {/* Tournament Context */}
                  <Card className="bg-gray-800/90 border-2 border-gray-700 shadow-xl rounded-2xl p-6 mb-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        🏆 {selectedTournament.name}
                      </h2>
                      <p className="text-gray-300 text-lg mb-2">
                        Round {selectedMatch.round} • Match {selectedMatch.matchNumber}
                      </p>
                      <p className="text-gray-400">
                        {fighterA.name} vs {fighterB.name}
                      </p>
                    </div>
                  </Card>
                  
                  {/* Battle Viewer */}
                  {!battleReplayComplete && (
                    <BattleViewer
                      fighterA={{
                        ...fighterA,
                        description: fighterA.description ?? '',
                        visualAnalysis: fighterA.visualAnalysis ?? {
                          age: 'unknown', size: 'medium', build: 'average', appearance: [], weapons: [], armor: []
                        },
                        combatHistory: fighterA.combatHistory ?? [],
                        winLossRecord: fighterA.winLossRecord ?? { wins: 0, losses: 0, draws: 0 },
                        createdAt: fighterA.createdAt ?? new Date().toISOString(),
                      }}
                      fighterB={{
                        ...fighterB,
                        description: fighterB.description ?? '',
                        visualAnalysis: fighterB.visualAnalysis ?? {
                          age: 'unknown', size: 'medium', build: 'average', appearance: [], weapons: [], armor: []
                        },
                        combatHistory: fighterB.combatHistory ?? [],
                        winLossRecord: fighterB.winLossRecord ?? { wins: 0, losses: 0, draws: 0 },
                        createdAt: fighterB.createdAt ?? new Date().toISOString(),
                      }}
                      scene={{
                        id: selectedMatch.id,
                        name: 'Tournament Arena',
                        imageUrl: '',
                        description: 'A neutral arena for tournament battles',
                        environmentalObjects: [],
                        createdAt: new Date().toISOString()
                      }}
                      battleLog={mapPreGeneratedToBattleRound(selectedMatch.battleLog)}
                      onBattleReplayComplete={handleBattleReplayComplete}
                    />
                  )}

                  {/* Battle Results Modal */}
                  {showBattleResults && selectedMatch.winner && (
                    <WinnerAnimation
                      isOpen={showBattleResults}
                      onClose={handleCloseBattleResults}
                      winner={selectedMatch.winner.name}
                      fighterA={{
                        ...fighterA,
                        description: fighterA.description ?? '',
                        visualAnalysis: fighterA.visualAnalysis ?? {
                          age: 'unknown', size: 'medium', build: 'average', appearance: [], weapons: [], armor: []
                        },
                        combatHistory: fighterA.combatHistory ?? [],
                        winLossRecord: fighterA.winLossRecord ?? { wins: 0, losses: 0, draws: 0 },
                        createdAt: fighterA.createdAt ?? new Date().toISOString(),
                      }}
                      fighterB={{
                        ...fighterB,
                        description: fighterB.description ?? '',
                        visualAnalysis: fighterB.visualAnalysis ?? {
                          age: 'unknown', size: 'medium', build: 'average', appearance: [], weapons: [], armor: []
                        },
                        combatHistory: fighterB.combatHistory ?? [],
                        winLossRecord: fighterB.winLossRecord ?? { wins: 0, losses: 0, draws: 0 },
                        createdAt: fighterB.createdAt ?? new Date().toISOString(),
                      }}
                      scene={{
                        id: selectedMatch.id,
                        name: 'Tournament Arena',
                        imageUrl: '',
                        description: 'A neutral arena for tournament battles',
                        environmentalObjects: [],
                        createdAt: new Date().toISOString()
                      }}
                      battleLog={mapPreGeneratedToBattleRound(selectedMatch.battleLog)}
                      battleSummary={`Tournament Match: ${fighterA.name} vs ${fighterB.name} - Winner: ${selectedMatch.winner.name}`}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
} 