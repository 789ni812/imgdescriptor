'use client';

import React from 'react';
import { Tournament, TournamentMatch } from '@/lib/types/tournament';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

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
        return 'bg-green-600 text-white border-green-500 shadow-lg';
      case 'in_progress':
        return 'bg-yellow-600 text-white border-yellow-500 shadow-lg';
      case 'pending':
        return 'bg-gray-600 text-gray-200 border-gray-500';
      default:
        return 'bg-gray-600 text-gray-200 border-gray-500';
    }
  };

  const renderMatch = (match: TournamentMatch) => {
    // Skip matches with null or undefined fighters
    if (!match.fighterA || !match.fighterB) {
      return (
        <div key={match.id} className="bg-gray-800 border-2 border-gray-700 rounded-xl p-4 mb-3 shadow-lg">
          <div className="text-sm text-gray-400">Match {match.round}-{match.matchNumber} - Waiting for fighters</div>
        </div>
      );
    }
    
    const isBye = match.fighterA.id === match.fighterB.id;
    
    return (
      <div
        key={match.id}
        className={`border-2 rounded-xl p-4 mb-3 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
          match.status === 'completed' 
            ? 'bg-gray-800 border-green-500 shadow-lg shadow-green-500/20' 
            : match.status === 'in_progress'
            ? 'bg-gray-800 border-yellow-500 shadow-lg shadow-yellow-500/20'
            : 'bg-gray-800 border-gray-700 hover:border-gray-600'
        }`}
        onClick={() => onMatchClick?.(match)}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-white">
            Match {match.round}-{match.matchNumber}
          </span>
          <Badge className={getMatchStatusColor(match.status)}>
            {match.status === 'completed' ? '✅ Completed' : 
             match.status === 'in_progress' ? '⚡ In Progress' : '⏳ Pending'}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 bg-gray-700 rounded-lg p-3">
            <Image
              src={match.fighterA.imageUrl}
              alt={match.fighterA.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg object-cover border-2 border-gray-600"
            />
            <span className={`text-sm font-semibold ${
              match.winner?.id === match.fighterA.id 
                ? 'text-green-400 font-bold' 
                : 'text-white'
            }`}>
              {match.fighterA.name}
            </span>
            {match.winner?.id === match.fighterA.id && (
              <span className="text-green-400 text-lg font-bold">👑</span>
            )}
          </div>
          
          <div className="flex items-center space-x-3 bg-gray-700 rounded-lg p-3">
            <Image
              src={match.fighterB.imageUrl}
              alt={match.fighterB.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg object-cover border-2 border-gray-600"
            />
            <span className={`text-sm font-semibold ${
              match.winner?.id === match.fighterB.id 
                ? 'text-green-400 font-bold' 
                : 'text-white'
            }`}>
              {match.fighterB.name}
            </span>
            {match.winner?.id === match.fighterB.id && (
              <span className="text-green-400 text-lg font-bold">👑</span>
            )}
          </div>
        </div>
        
        {isBye && (
          <div className="mt-3 text-xs text-gray-400 bg-gray-700 p-2 rounded-lg border border-gray-600">
            🚶 Bye - {match.fighterA.name} advances automatically
          </div>
        )}
        
        {match.status === 'completed' && match.battleLog && (
          <div className="mt-3 text-xs text-blue-300 bg-blue-900/30 p-2 rounded-lg border border-blue-700">
            ⚔️ {match.battleLog?.length || 0} rounds • Winner: {match.winner?.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-gray-800/90 border-2 border-gray-700 shadow-xl rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="mr-3">🏆</span>
          Tournament Bracket
        </h2>
        <div className="text-sm text-gray-300 bg-gray-700 px-3 py-1 rounded-lg">
          {tournament.fighters?.length || 0} fighters • {tournament.totalRounds || 0} rounds
        </div>
      </div>
      
      {!tournament.brackets || tournament.brackets.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-xl font-medium mb-3">Tournament bracket not yet generated</div>
          <div className="text-sm">The bracket will be created when you start the tournament.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tournament.brackets.map((bracket) => (
            <div key={bracket.round} className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  {bracket.round === tournament.brackets.length ? '🥇 Finals' : 
                   bracket.round === tournament.brackets.length - 1 ? '🥈 Semi-Finals' :
                   `🥉 Round ${bracket.round}`}
                </h3>
                <div className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-lg inline-block">
                  {bracket.matches.filter(m => m.status === 'completed').length} / {bracket.matches.length} completed
                </div>
              </div>
              
              <div className="space-y-3">
                {bracket.matches.map(renderMatch)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {tournament.status === 'completed' && tournament.winner && (
        <div className="mt-8 p-6 bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border-2 border-yellow-500 rounded-2xl text-center shadow-xl">
          <h3 className="text-2xl font-bold text-yellow-400 mb-4 drop-shadow-lg">🏆 Tournament Champion 🏆</h3>
          <div className="flex items-center justify-center space-x-4">
            <Image
              src={tournament.winner.imageUrl}
              alt={tournament.winner.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-xl object-cover border-2 border-yellow-500 shadow-lg"
            />
            <span className="text-2xl font-bold text-yellow-400 drop-shadow-lg">
              {tournament.winner.name}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}; 