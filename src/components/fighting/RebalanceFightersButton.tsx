import React, { useState } from 'react';

interface BalanceResult {
  name: string;
  type: string;
  oldStats: any;
  newStats: any;
}

interface BalanceResponse {
  success: boolean;
  message: string;
  results: BalanceResult[];
  error?: string;
}

const RebalanceFightersButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [results, setResults] = useState<BalanceResult[]>([]);

  const handleRebalance = async () => {
    setIsLoading(true);
    setMessage(null);
    setResults([]);

    try {
      const response = await fetch('/api/fighting-game/balance-fighters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data: BalanceResponse = await response.json();

      if (response.ok && data.success) {
        setMessageType('success');
        setMessage(`Successfully rebalanced ${data.results.length} fighters`);
        setResults(data.results);
      } else {
        setMessageType('error');
        setMessage(`Error: ${data.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      setMessageType('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setIsLoading(false);
    }

    // Clear messages after 5 seconds
    setTimeout(() => {
      setMessage(null);
      setResults([]);
    }, 5000);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleRebalance}
        disabled={isLoading}
        className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${
          isLoading
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        }`}
      >
        {isLoading ? 'Rebalancing Fighters...' : 'Rebalance Fighters'}
      </button>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-900/20 border border-green-500/30 text-green-300'
              : 'bg-red-900/20 border border-red-500/30 text-red-300'
          }`}
        >
          <p className="font-semibold">{message}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-blue-300 mb-3">Rebalanced Fighters:</h4>
          <div className="grid gap-2">
            {results.map((result, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-white font-medium">{result.name}</span>
                <span className="text-blue-300">→ {result.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RebalanceFightersButton; 