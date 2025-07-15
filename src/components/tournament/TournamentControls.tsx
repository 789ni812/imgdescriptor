'use client';

import React, { useState } from 'react';
import { Tournament, TournamentMatch } from '@/lib/types/tournament';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface TournamentControlsProps {
  tournament: Tournament;
  onTournamentUpdated: (tournament: Tournament) => void;
}

export const TournamentControls: React.FC<TournamentControlsProps> = ({
  tournament,
  onTournamentUpdated
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMatch, setCurrentMatch] = useState<TournamentMatch | null>(null);

  const handleExecuteNextMatch = async () => {
    setIsExecuting(true);
    setError(null);

    try {
      const response = await fetch('/api/tournaments/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tournamentId: tournament.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onTournamentUpdated(data.tournament);
        setCurrentMatch(data.match);
        
        // Show success message briefly
        setTimeout(() => {
          setCurrentMatch(null);
        }, 3000);
      } else {
        setError(data.error || 'Failed to execute match');
      }
    } catch {
      setError('Failed to execute match');
    } finally {
      setIsExecuting(false);
    }
  };

  const getNextMatch = () => {
    if (!tournament.brackets) return null;
    for (const bracket of tournament.brackets) {
      const pendingMatch = bracket.matches.find(match => match.status === 'pending');
      if (pendingMatch) return pendingMatch;
    }
    return null;
  };

  const nextMatch = getNextMatch();
  const isCompleted = tournament.status === 'completed';
  const totalMatches = tournament.brackets?.reduce((sum, bracket) => sum + bracket.matches.length, 0) || 0;
  const completedMatches = tournament.brackets?.reduce((sum, bracket) => 
    sum + bracket.matches.filter(match => match.status === 'completed').length, 0
  ) || 0;

  return (
    <Card className="p-6" data-testid="tournament-controls">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" data-testid="tournament-controls-title">Tournament Controls</h2>
        <div className="text-sm text-gray-600" data-testid="matches-progress">
          {completedMatches} / {totalMatches} matches completed
        </div>
      </div>

      {error && <ErrorMessage message={error} data-testid="tournament-controls-error" />}

      {currentMatch && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg" data-testid="match-completed-notification">
          <div className="text-sm text-green-800">
            <strong>Match completed:</strong> {currentMatch.fighterA?.name ?? 'Unknown'} vs {currentMatch.fighterB?.name ?? 'Unknown'}
          </div>
          <div className="text-xs text-green-600 mt-1" data-testid="match-winner">
            Winner: {currentMatch.winner?.name}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Tournament Status</div>
            <div className="text-xs text-gray-600">
              {tournament.status === 'setup' && 'Ready to begin'}
              {tournament.status === 'in_progress' && `Round ${tournament.currentRound} in progress`}
              {tournament.status === 'completed' && 'Tournament completed'}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium">Progress</div>
            <div className="text-xs text-gray-600">
              {Math.round((completedMatches / totalMatches) * 100)}% complete
            </div>
          </div>
        </div>

        {nextMatch && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800">Next Match</div>
            <div className="text-xs text-blue-600">
              {nextMatch.fighterA?.name ?? 'Unknown'} vs {nextMatch.fighterB?.name ?? 'Unknown'}
            </div>
            {nextMatch.fighterA && nextMatch.fighterB && nextMatch.fighterA.id === nextMatch.fighterB.id && (
              <div className="text-xs text-blue-500 mt-1">
                (Bye - {nextMatch.fighterA?.name ?? 'Unknown'} advances automatically)
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-3" data-testid="tournament-controls-actions">
          <Button
            onClick={handleExecuteNextMatch}
            disabled={isCompleted || !nextMatch || isExecuting}
            className="flex-1"
            data-testid="execute-next-match-btn"
          >
            {isExecuting ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Executing...</span>
              </>
            ) : (
              'Execute Next Match'
            )}
          </Button>
        </div>

        {isCompleted && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center" data-testid="tournament-complete">
            <div className="text-sm font-medium text-yellow-800">
              🏆 Tournament Complete! 🏆
            </div>
            <div className="text-xs text-yellow-600 mt-1" data-testid="tournament-champion">
              Champion: {tournament.winner?.name}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}; 