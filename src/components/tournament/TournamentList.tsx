'use client';

import React, { useState, useEffect } from 'react';
import { Tournament } from '@/lib/types/tournament';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Badge } from '@/components/ui/badge';

interface TournamentListProps {
  onTournamentSelect: (tournament: Tournament) => void;
}

export const TournamentList: React.FC<TournamentListProps> = ({ onTournamentSelect }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tournaments/list');
      const data = await response.json();

      if (data.success) {
        // Ensure tournaments array exists and has valid data
        const validTournaments = (data.tournaments || []).filter((tournament: unknown) => 
          tournament && typeof tournament === 'object' && tournament !== null && 'id' in tournament
        ) as Tournament[];
        setTournaments(validTournaments);
      } else {
        setError(data.error || 'Failed to load tournaments');
      }
    } catch {
      setError('Failed to load tournaments');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'setup':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'setup':
        return 'Ready to Start';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2">Loading tournaments...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Tournaments</h2>
        <Button onClick={loadTournaments} variant="secondary" size="sm">
          Refresh
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {tournaments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg font-medium mb-2">No tournaments found</div>
          <div className="text-sm">Create your first tournament to get started!</div>
        </div>
      ) : (
        <div className="space-y-4">
          {tournaments.map((tournament) => {
            // Skip invalid tournaments
            if (!tournament || !tournament.id) {
              return null;
            }
            
            const totalMatches = tournament.brackets?.reduce((sum, bracket) => sum + bracket.matches.length, 0) || 0;
            const completedMatches = tournament.brackets?.reduce((sum, bracket) => 
              sum + bracket.matches.filter(match => match.status === 'completed').length, 0
            ) || 0;

            return (
              <div
                key={tournament.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onTournamentSelect(tournament)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{tournament.name}</h3>
                  <Badge className={getStatusColor(tournament.status)}>
                    {getStatusText(tournament.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <div className="font-medium">Fighters</div>
                    <div>{tournament.fighters?.length || 0}</div>
                  </div>
                  <div>
                    <div className="font-medium">Rounds</div>
                    <div>{tournament.totalRounds || 0}</div>
                  </div>
                  <div>
                    <div className="font-medium">Progress</div>
                    <div>{completedMatches} / {totalMatches} matches</div>
                  </div>
                  <div>
                    <div className="font-medium">Created</div>
                    <div>{tournament.createdAt ? formatDate(tournament.createdAt) : 'Unknown'}</div>
                  </div>
                </div>

                {tournament.status === 'completed' && tournament.winner && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
                    <div className="text-sm font-medium text-yellow-800">
                      🏆 Champion: {tournament.winner.name}
                    </div>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  Click to view tournament details
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}; 