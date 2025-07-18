'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FighterVoteStats } from '@/lib/types/voting';

interface SessionData {
  sessionId: string;
  totalVotes: number;
  totalRounds: number;
  startTime: string;
  endTime: string;
  duration: number;
  history?: Array<{
    round: number;
    winner: string;
    votes: number;
  }>;
}

interface VotingResultsProps {
  results: FighterVoteStats[];
  sessionData: SessionData;
}

export default function VotingResults({ results, sessionData }: VotingResultsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const calculateAverageVotesPerRound = () => {
    return (sessionData.totalVotes / sessionData.totalRounds).toFixed(1);
  };

  const getMostPopularFighter = () => {
    return results.length > 0 ? results[0].name : 'None';
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);

      const exportText = `Voting Results - Session ${sessionData.sessionId}

Total Votes: ${sessionData.totalVotes}
Rounds Completed: ${sessionData.totalRounds}
Duration: ${formatDuration(sessionData.duration)}

Results:
${results.map((result, index) => 
  `${index + 1}. ${result.name}: ${result.voteCount} votes (${result.percentage.toFixed(1)}%)`
).join('\n')}

Generated on ${new Date().toLocaleString()}`;

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(exportText);
        setExportMessage('Results copied to clipboard!');
        setTimeout(() => setExportMessage(null), 3000);
      } else {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = exportText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setExportMessage('Results copied to clipboard!');
        setTimeout(() => setExportMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to export results');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      setError(null);

      if (navigator.share) {
        await navigator.share({
          title: 'Fighter Voting Results',
          text: `${results[0]?.name || 'Unknown'} won with ${results[0]?.percentage.toFixed(1) || 0}% of votes!`,
          url: `${window.location.origin}/voting/session/${sessionData.sessionId}`
        });
      } else {
        setError('Sharing not supported in this browser');
      }
    } catch (err) {
      setError('Failed to share results');
    } finally {
      setIsSharing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would fetch updated results
      console.log('Refreshing voting results...');
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleRefresh();
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No voting results available</div>
        <div className="text-gray-400">Start a voting session to see results</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Voting Results</h1>
        <div className="text-gray-600 space-y-1">
          <p>Session: {sessionData.sessionId}</p>
          <p>{sessionData.totalVotes} total votes • {sessionData.totalRounds} rounds completed</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
        >
          {isExporting ? 'Exporting...' : 'Export Results'}
        </button>
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
        >
          {isSharing ? 'Sharing...' : 'Share Results'}
        </button>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Success/Error Messages */}
      {exportMessage && (
        <div className="text-center text-green-600 bg-green-50 p-3 rounded">
          {exportMessage}
        </div>
      )}

      {error && (
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result, index) => (
          <div
            key={result.fighterId}
            className={`border rounded-lg p-6 ${
              index === 0 
                ? 'bg-yellow-50 border-yellow-200' 
                : index === 1 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-white border-gray-200'
            }`}
          >
            {/* Rank */}
            <div className="text-center mb-4">
              <span className="text-3xl">{getRankIcon(index + 1)}</span>
            </div>

            {/* Fighter Image */}
            <div className="text-center mb-4">
              {result.imageUrl && (
                <div className="relative w-32 h-32 mx-auto mb-3">
                  <Image
                    src={result.imageUrl}
                    alt={result.name}
                    fill={true}
                    className="object-cover rounded-full"
                  />
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-800">{result.name}</h3>
            </div>

            {/* Vote Count */}
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-blue-600">{result.voteCount} votes</div>
              <div className="text-lg text-gray-600">{result.percentage.toFixed(1)}%</div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${result.percentage}%` }}
                  role="progressbar"
                  aria-valuenow={result.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Voting Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {calculateAverageVotesPerRound()}
            </div>
            <div className="text-gray-600">Average votes per round</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {getMostPopularFighter()}
            </div>
            <div className="text-gray-600">Most popular fighter</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatDuration(sessionData.duration)}
            </div>
            <div className="text-gray-600">Session duration</div>
          </div>
        </div>
      </div>

      {/* Session History */}
      {sessionData.history && sessionData.history.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Session History</h2>
          <div className="space-y-2">
            {sessionData.history.map((round, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-medium">Round {round.round}</span>
                <span className="text-gray-600">
                  {round.winner} ({round.votes} votes)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 