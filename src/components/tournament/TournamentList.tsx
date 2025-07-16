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
        return 'bg-green-600 text-white border-green-500 shadow-lg';
      case 'in_progress':
        return 'bg-yellow-600 text-white border-yellow-500 shadow-lg';
      case 'setup':
        return 'bg-blue-600 text-white border-blue-500 shadow-lg';
      default:
        return 'bg-gray-600 text-gray-200 border-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '🏆 Completed';
      case 'in_progress':
        return '⚡ In Progress';
      case 'setup':
        return '🟢 Ready to Start';
      default:
        return '❓ Unknown';
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
      <Card className="bg-gray-800/90 border-2 border-gray-700 shadow-xl rounded-2xl p-8">
        <div className="flex items-center justify-center text-white">
          <LoadingSpinner />
          <span className="ml-3 text-lg">Loading tournaments...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/90 border-2 border-gray-700 shadow-xl rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="mr-3">📋</span>
          Tournaments
        </h2>
        <Button 
          onClick={loadTournaments} 
          variant="secondary" 
          size="sm"
          className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 px-4 py-2 font-semibold transition-all duration-200"
        >
          🔄 Refresh
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {tournaments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-xl font-medium mb-3">No tournaments found</div>
          <div className="text-sm">Create your first tournament to get started!</div>
        </div>
      ) : (
        <div className="space-y-6">
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
                className="bg-gray-700 border-2 border-gray-600 rounded-xl p-6 hover:bg-gray-600 hover:border-gray-500 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                onClick={() => onTournamentSelect(tournament)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                  <Badge className={getStatusColor(tournament.status)}>
                    {getStatusText(tournament.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                    <div className="font-bold text-gray-300 mb-1">👥 Fighters</div>
                    <div className="text-white font-semibold">{tournament.fighters?.length || 0}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                    <div className="font-bold text-gray-300 mb-1">🥊 Rounds</div>
                    <div className="text-white font-semibold">{tournament.totalRounds || 0}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                    <div className="font-bold text-gray-300 mb-1">📊 Progress</div>
                    <div className="text-white font-semibold">{completedMatches} / {totalMatches} matches</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                    <div className="font-bold text-gray-300 mb-1">📅 Created</div>
                    <div className="text-white font-semibold">{tournament.createdAt ? formatDate(tournament.createdAt) : 'Unknown'}</div>
                  </div>
                </div>

                {tournament.status === 'completed' && tournament.winner && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border-2 border-yellow-500 rounded-xl text-center">
                    <div className="text-sm font-bold text-yellow-400">
                      🏆 Champion: {tournament.winner.name}
                    </div>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-400 text-center">
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