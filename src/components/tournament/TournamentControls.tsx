'use client';

import React, { useState, useRef } from 'react';
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
  const [isAutomating, setIsAutomating] = useState(false);
  const automatingRef = useRef(false);
  const currentTournamentRef = useRef(tournament);
  const [error, setError] = useState<string | null>(null);
  const [currentMatch, setCurrentMatch] = useState<TournamentMatch | null>(null);

  // Update ref when tournament prop changes
  React.useEffect(() => {
    currentTournamentRef.current = tournament;
  }, [tournament]);

  const executeMatch = async (): Promise<boolean> => {
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
        currentTournamentRef.current = data.tournament;
        setCurrentMatch(data.match);
        
        // Show success message briefly
        setTimeout(() => {
          setCurrentMatch(null);
        }, 3000);
        return true;
      } else {
        // Check if this is a "no pending matches" error (tournament completed)
        if (data.error === 'No pending matches found' || data.error === 'Tournament is already completed') {
          // Tournament is complete, this is not an error
          return false; // Return false to stop automation gracefully
        } else {
          setError(data.error || 'Failed to execute match');
          return false;
        }
      }
    } catch {
      setError('Failed to execute match');
      return false;
    }
  };

  const handleExecuteNextMatch = async () => {
    setIsExecuting(true);
    setError(null);
    
    await executeMatch();
    setIsExecuting(false);
  };

  const handleAutomateMatches = async () => {
    setIsAutomating(true);
    automatingRef.current = true;
    setError(null);

    try {
      while (automatingRef.current) {
        // Get the next pending match
        const nextMatch = getNextMatch();
        
        // If no more matches, we're done
        if (!nextMatch) {
          break;
        }

        // Execute the match
        const success = await executeMatch();
        
        // If execution failed or returned false (indicating completion), stop automation
        if (!success) {
          break;
        }

        // Additional check: if tournament is now completed, stop automation
        // This handles the case where the tournament status was updated by executeMatch
        if (currentTournamentRef.current.status === 'completed') {
          break;
        }

        // Small delay between matches to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch {
      setError('Automation failed');
    } finally {
      setIsAutomating(false);
      automatingRef.current = false;
    }
  };

  const handleCancelAutomation = () => {
    setIsAutomating(false);
    automatingRef.current = false;
  };

  const getNextMatch = () => {
    if (!tournament.brackets) return null;
    for (const bracket of tournament.brackets) {
      const pendingMatch = bracket.matches.find(
        match => match.status === 'pending' && match.fighterA && match.fighterB
      );
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

  // Find the next pending match (even if invalid) for error display
  const getNextPendingMatchEvenIfInvalid = () => {
    if (!tournament.brackets) return null;
    for (const bracket of tournament.brackets) {
      const pendingMatch = bracket.matches.find(match => match.status === 'pending');
      if (pendingMatch) return pendingMatch;
    }
    return null;
  };
  const nextPendingMatchEvenIfInvalid = getNextPendingMatchEvenIfInvalid();

  return (
    <Card className="p-6" data-testid="tournament-controls">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" data-testid="tournament-controls-title">Tournament Controls</h2>
        <div className="text-sm text-gray-600" data-testid="matches-progress">
          {completedMatches} / {totalMatches} matches completed
        </div>
      </div>

      {error && <ErrorMessage message={error} data-testid="tournament-controls-error" />}

      {/* Show a user-friendly message if the next pending match is missing a fighter */}
      {!nextMatch && nextPendingMatchEvenIfInvalid && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" data-testid="tournament-missing-fighter-warning">
          Cannot execute next match: missing fighter(s). Please check your tournament setup.
        </div>
      )}

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
            disabled={isCompleted || !nextMatch || isExecuting || isAutomating}
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
          
          <Button
            onClick={handleAutomateMatches}
            disabled={isCompleted || !nextMatch || isExecuting || isAutomating}
            className="flex-1"
            data-testid="automate-match-execution-btn"
          >
            {isAutomating ? (
              <>
                <LoadingSpinner />
                <span className="ml-2" data-testid="automating-status">Automating...</span>
              </>
            ) : (
              'Automate Match Execution'
            )}
          </Button>
        </div>

        {isAutomating && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleCancelAutomation}
              variant="outline"
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="cancel-automation-btn"
            >
              Cancel Automation
            </Button>
          </div>
        )}

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