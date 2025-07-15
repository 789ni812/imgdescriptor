import React from 'react';

interface Fighter {
  id: string;
  name: string;
  imageUrl: string;
  stats: {
    health: number;
    maxHealth: number;
    strength: number;
    luck: number;
    agility: number;
    defense: number;
    age: number;
    size: 'small' | 'medium' | 'large';
    build: 'thin' | 'average' | 'muscular' | 'heavy';
  };
  visualAnalysis?: unknown;
  description?: string;
}

interface BattleRound {
  round: number;
  attacker: string;
  defender: string;
  attackCommentary: string;
  defenseCommentary: string;
  attackerDamage: number;
  defenderDamage: number;
  randomEvent: string | null;
  arenaObjectsUsed: string | null;
  healthAfter: {
    attacker: number;
    defender: number;
  };
}

interface WinnerAnimationProps {
  winner: string | null;
  onDone?: () => void;
  onClose?: () => void;
  fighterAHealth?: number;
  fighterBHealth?: number;
  fighterA?: Fighter;
  fighterB?: Fighter;
  battleLog?: BattleRound[];
}

const WinnerAnimation: React.FC<WinnerAnimationProps> = ({ 
  winner, 
  onDone, 
  onClose, 
  fighterAHealth, 
  fighterBHealth,
  fighterA,
  fighterB,
  battleLog = []
}) => {
  let displayText = '';
  let showKO = false;
  if (winner === 'Draw') {
    displayText = "It's a DRAW!";
  } else if (winner) {
    displayText = `${winner} wins the battle!`;
    // KO logic: show KO if either fighter's health is 0 or less and not a draw
    if ((fighterAHealth !== undefined && fighterAHealth <= 0) || (fighterBHealth !== undefined && fighterBHealth <= 0)) {
      showKO = true;
    }
  } else {
    displayText = "It's a DRAW !!!";
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto bg-black/60">
      <div className="flex flex-col items-center justify-center bg-black/90 rounded-2xl px-16 py-14 shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="text-green-400 text-6xl font-extrabold mb-10 text-center">
          {displayText}
        </div>
        {showKO && winner !== 'Draw' && (
          <div className="text-red-500 text-5xl font-extrabold mb-8 text-center">KO!</div>
        )}
        
        {/* Fighter Stats Section */}
        {fighterA && fighterB && (
          <div className="w-full mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Fighter Stats</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Fighter A Stats */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center mb-3">
                  {fighterA.imageUrl ? (
                    <img src={fighterA.imageUrl} alt={fighterA.name} className="w-16 h-16 object-cover rounded-lg mr-3" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-600 rounded-lg mr-3 flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-bold text-white">{fighterA.name}</h4>
                    {fighterAHealth !== undefined && (
                      <p className="text-sm text-gray-300">Final Health: {fighterAHealth} / {fighterA.stats.maxHealth}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-300">Strength: <span className="text-white font-semibold">{fighterA.stats.strength}</span></div>
                  <div className="text-gray-300">Agility: <span className="text-white font-semibold">{fighterA.stats.agility}</span></div>
                  <div className="text-gray-300">Defense: <span className="text-white font-semibold">{fighterA.stats.defense}</span></div>
                  <div className="text-gray-300">Luck: <span className="text-white font-semibold">{fighterA.stats.luck}</span></div>
                  <div className="text-gray-300">Age: <span className="text-white font-semibold">{fighterA.stats.age}</span></div>
                  <div className="text-gray-300">Size: <span className="text-white font-semibold capitalize">{fighterA.stats.size}</span></div>
                </div>
              </div>

              {/* Fighter B Stats */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center mb-3">
                  {fighterB.imageUrl ? (
                    <img src={fighterB.imageUrl} alt={fighterB.name} className="w-16 h-16 object-cover rounded-lg mr-3" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-600 rounded-lg mr-3 flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-bold text-white">{fighterB.name}</h4>
                    {fighterBHealth !== undefined && (
                      <p className="text-sm text-gray-300">Final Health: {fighterBHealth} / {fighterB.stats.maxHealth}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-300">Strength: <span className="text-white font-semibold">{fighterB.stats.strength}</span></div>
                  <div className="text-gray-300">Agility: <span className="text-white font-semibold">{fighterB.stats.agility}</span></div>
                  <div className="text-gray-300">Defense: <span className="text-white font-semibold">{fighterB.stats.defense}</span></div>
                  <div className="text-gray-300">Luck: <span className="text-white font-semibold">{fighterB.stats.luck}</span></div>
                  <div className="text-gray-300">Age: <span className="text-white font-semibold">{fighterB.stats.age}</span></div>
                  <div className="text-gray-300">Size: <span className="text-white font-semibold capitalize">{fighterB.stats.size}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Battle Overview Section */}
        {battleLog.length > 0 && fighterA && fighterB && (
          <div className="w-full mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Battle Overview</h3>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 max-h-48 overflow-y-auto">
              {battleLog.map((round) => {
                // Find fighter objects for attacker and defender
                const attackerFighter = round.attacker === fighterA.name ? fighterA : fighterB;
                const defenderFighter = round.defender === fighterA.name ? fighterA : fighterB;
                return (
                  <div key={round.round} className="mb-3 pb-3 border-b border-gray-600 last:border-b-0">
                    <h4 className="text-lg font-semibold text-yellow-400 mb-2">Round {round.round}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        {attackerFighter.imageUrl ? (
                          <img src={attackerFighter.imageUrl} alt={attackerFighter.name} className="w-6 h-6 object-cover rounded-full border border-gray-400" />
                        ) : (
                          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-xs">?</div>
                        )}
                        <span className="text-blue-400 font-medium mr-1">{round.attacker}:</span>
                        <span className="text-gray-300">{round.attackCommentary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {defenderFighter.imageUrl ? (
                          <img src={defenderFighter.imageUrl} alt={defenderFighter.name} className="w-6 h-6 object-cover rounded-full border border-gray-400" />
                        ) : (
                          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-xs">?</div>
                        )}
                        <span className="text-red-400 font-medium mr-1">{round.defender}:</span>
                        <span className="text-gray-300">{round.defenseCommentary}</span>
                      </div>
                      {/* Only show Special Event if it is a non-empty, non-undefined, non-null string */}
                      {round.randomEvent && typeof round.randomEvent === 'string' && round.randomEvent.trim() !== '' && round.randomEvent !== 'undefined' && (
                        <div className="text-purple-400 text-xs italic">Special Event: {round.randomEvent}</div>
                      )}
                      {round.arenaObjectsUsed && typeof round.arenaObjectsUsed === 'string' && round.arenaObjectsUsed.trim() !== '' && round.arenaObjectsUsed !== 'undefined' && (
                        <div className="text-green-400 text-xs italic">Arena Used: {round.arenaObjectsUsed}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-row gap-4 mt-2">
          <button
            className="px-10 py-4 rounded-lg font-bold text-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg"
            onClick={onDone}
            autoFocus
          >
            Restart
          </button>
          {onClose && (
            <button
              className="px-8 py-4 rounded-lg font-bold text-2xl bg-gray-700/40 hover:bg-gray-700/60 text-gray-300 border border-gray-500 shadow-sm"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinnerAnimation; 