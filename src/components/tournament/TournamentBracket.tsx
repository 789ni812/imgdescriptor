'use client';

import React from 'react';
import { Tournament, TournamentMatch } from '@/lib/types/tournament';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TournamentBracketProps {
  tournament: Tournament;
  onMatchClick?: (match: TournamentMatch) => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ 
  tournament, 
  onMatchClick 
}) => {
  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderMatch = (match: TournamentMatch) => {
    // Skip matches with null or undefined fighters
    if (!match.fighterA || !match.fighterB) {
      return (
        <div key={match.id} className="border rounded-lg p-3 mb-2 bg-gray-50 border-gray-200">
          <div className="text-sm text-gray-600">Match {match.round}-{match.matchNumber} - Waiting for fighters</div>
        </div>
      );
    }
    
    const isBye = match.fighterA.id === match.fighterB.id;
    
    return (
      <div
        key={match.id}
        className={`border rounded-lg p-3 mb-2 cursor-pointer transition-colors hover:bg-gray-50 ${
          match.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
        }`}
        onClick={() => onMatchClick?.(match)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Match {match.round}-{match.matchNumber}
          </span>
          <Badge className={getMatchStatusColor(match.status)}>
            {match.status === 'completed' ? 'Completed' : 
             match.status === 'in_progress' ? 'In Progress' : 'Pending'}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <img
              src={match.fighterA.imageUrl}
              alt={match.fighterA.name}
              className="w-6 h-6 rounded object-cover"
            />
            <span className={`text-sm ${match.winner?.id === match.fighterA.id ? 'font-bold text-green-600' : ''}`}>
              {match.fighterA.name}
            </span>
            {match.winner?.id === match.fighterA.id && (
              <span className="text-xs text-green-600">✓</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <img
              src={match.fighterB.imageUrl}
              alt={match.fighterB.name}
              className="w-6 h-6 rounded object-cover"
            />
            <span className={`text-sm ${match.winner?.id === match.fighterB.id ? 'font-bold text-green-600' : ''}`}>
              {match.fighterB.name}
            </span>
            {match.winner?.id === match.fighterB.id && (
              <span className="text-xs text-green-600">✓</span>
            )}
          </div>
        </div>
        
        {isBye && (
          <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-1 rounded">
            Bye - {match.fighterA.name} advances automatically
          </div>
        )}
        
        {match.status === 'completed' && match.battleLog && (
          <div className="mt-2 text-xs text-blue-600">
            {match.battleLog?.length || 0} rounds • Winner: {match.winner?.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Tournament Bracket</h2>
        <div className="text-sm text-gray-600">
          {tournament.fighters?.length || 0} fighters • {tournament.totalRounds || 0} rounds
        </div>
      </div>
      
      {!tournament.brackets || tournament.brackets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg font-medium mb-2">Tournament bracket not yet generated</div>
          <div className="text-sm">The bracket will be created when you start the tournament.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournament.brackets.map((bracket) => (
            <div key={bracket.round} className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {bracket.round === tournament.brackets.length ? 'Finals' : 
                   bracket.round === tournament.brackets.length - 1 ? 'Semi-Finals' :
                   `Round ${bracket.round}`}
                </h3>
                <div className="text-sm text-gray-500">
                  {bracket.matches.filter(m => m.status === 'completed').length} / {bracket.matches.length} completed
                </div>
              </div>
              
              <div className="space-y-2">
                {bracket.matches.map(renderMatch)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {tournament.status === 'completed' && tournament.winner && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg text-center">
          <h3 className="text-lg font-bold text-yellow-800">🏆 Tournament Champion 🏆</h3>
          <div className="flex items-center justify-center space-x-3 mt-2">
            <img
              src={tournament.winner.imageUrl}
              alt={tournament.winner.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="text-xl font-bold text-yellow-800">
              {tournament.winner.name}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}; 