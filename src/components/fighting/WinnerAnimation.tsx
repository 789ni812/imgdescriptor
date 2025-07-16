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
    magic?: number;
    ranged?: number;
    intelligence?: number;
    age: number;
    size: 'small' | 'medium' | 'large';
    build: 'thin' | 'average' | 'muscular' | 'heavy';
  };
  uniqueAbilities?: string[];
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
      <div className="flex flex-col bg-black/90 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4">
        {/* Fixed Header Section - Winner Announcement and Fighter Stats */}
        <div className="flex-shrink-0 p-8">
          {/* Winner Announcement */}
          <div className="text-green-400 text-6xl font-extrabold mb-6 text-center">
            {displayText}
          </div>
          {showKO && winner !== 'Draw' && (
            <div className="text-red-500 text-5xl font-extrabold mb-6 text-center">KO!</div>
          )}
          
          {/* Fighter Stats Section */}
          {fighterA && fighterB && (
            <div className="w-full">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Fighter Stats</h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Fighter A Stats */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 shadow-lg">
                  <div className="flex items-center mb-3">
                    {fighterA.imageUrl ? (
                      <img src={fighterA.imageUrl} alt={fighterA.name} className="w-16 h-16 object-cover rounded-lg mr-3 border-2 border-gray-500" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-600 rounded-lg mr-3 flex items-center justify-center text-gray-400 text-sm border-2 border-gray-500">
                        No Image
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{fighterA.name}</h4>
                      {fighterAHealth !== undefined && (
                        <p className="text-sm text-gray-300">Final Health: {fighterAHealth} / {fighterA.stats.maxHealth}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed mb-2">
                    Health: {fighterA.stats.health} | Strength: {fighterA.stats.strength} | Agility: {fighterA.stats.agility} | Defense: {fighterA.stats.defense} | Luck: {fighterA.stats.luck}
                  </div>
                  {(fighterA.stats.magic !== undefined || fighterA.stats.ranged !== undefined || fighterA.stats.intelligence !== undefined) && (
                    <div className="text-xs text-gray-400 leading-relaxed mb-2">
                      {(fighterA.stats.magic !== undefined ? `Magic: ${fighterA.stats.magic}` : '') + 
                       (fighterA.stats.ranged !== undefined ? (fighterA.stats.magic !== undefined ? ' | ' : '') + `Ranged: ${fighterA.stats.ranged}` : '') + 
                       (fighterA.stats.intelligence !== undefined ? ((fighterA.stats.magic !== undefined || fighterA.stats.ranged !== undefined) ? ' | ' : '') + `Intelligence: ${fighterA.stats.intelligence}` : '')}
                    </div>
                  )}
                  {fighterA.uniqueAbilities && fighterA.uniqueAbilities.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-purple-400">Abilities: {fighterA.uniqueAbilities.join(', ')}</div>
                    </div>
                  )}
                </div>

                {/* Fighter B Stats */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 shadow-lg">
                  <div className="flex items-center mb-3">
                    {fighterB.imageUrl ? (
                      <img src={fighterB.imageUrl} alt={fighterB.name} className="w-16 h-16 object-cover rounded-lg mr-3 border-2 border-gray-500" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-600 rounded-lg mr-3 flex items-center justify-center text-gray-400 text-sm border-2 border-gray-500">
                        No Image
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{fighterB.name}</h4>
                      {fighterBHealth !== undefined && (
                        <p className="text-sm text-gray-300">Final Health: {fighterBHealth} / {fighterB.stats.maxHealth}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed mb-2">
                    Health: {fighterB.stats.health} | Strength: {fighterB.stats.strength} | Agility: {fighterB.stats.agility} | Defense: {fighterB.stats.defense} | Luck: {fighterB.stats.luck}
                  </div>
                  {(fighterB.stats.magic !== undefined || fighterB.stats.ranged !== undefined || fighterB.stats.intelligence !== undefined) && (
                    <div className="text-xs text-gray-400 leading-relaxed mb-2">
                      {(fighterB.stats.magic !== undefined ? `Magic: ${fighterB.stats.magic}` : '') + 
                       (fighterB.stats.ranged !== undefined ? (fighterB.stats.magic !== undefined ? ' | ' : '') + `Ranged: ${fighterB.stats.ranged}` : '') + 
                       (fighterB.stats.intelligence !== undefined ? ((fighterB.stats.magic !== undefined || fighterB.stats.ranged !== undefined) ? ' | ' : '') + `Intelligence: ${fighterB.stats.intelligence}` : '')}
                    </div>
                  )}
                  {fighterB.uniqueAbilities && fighterB.uniqueAbilities.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-purple-400">Abilities: {fighterB.uniqueAbilities.join(', ')}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Battle Overview Section */}
        {battleLog.length > 0 && (
          <div className="flex-1 overflow-y-auto border-t border-gray-700">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Battle Overview</h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 shadow-lg">
                {battleLog.map((round) => {
                  // Find fighter objects for attacker and defender
                  const attackerFighter = round.attacker === fighterA?.name ? fighterA : fighterB;
                  const defenderFighter = round.defender === fighterA?.name ? fighterA : fighterB;
                  
                  // Calculate health changes for this round
                  let attackerHealthChange = 0;
                  let defenderHealthChange = 0;
                  
                  // Use the actual damage values from the battle log
                  // In battle mechanics, only the defender takes damage from the attacker
                  attackerHealthChange = 0; // Attacker health never changes (no counter-damage)
                  
                  // Check for healing powerup
                  const hasHealing = round.randomEvent && 
                    (round.randomEvent.toLowerCase().includes('heal') || 
                     round.randomEvent.toLowerCase().includes('recover') ||
                     round.randomEvent.toLowerCase().includes('restore') ||
                     round.randomEvent.toLowerCase().includes('potion'));
                  
                  if (hasHealing && round.attackerDamage < 0) {
                    // With healing powerup, show positive healing
                    defenderHealthChange = +Math.abs(round.attackerDamage);
                  } else if (!hasHealing && round.attackerDamage < 0) {
                    // No healing allowed without powerup
                    defenderHealthChange = 0;
                  } else {
                    // Normal damage
                    defenderHealthChange = -Math.abs(round.attackerDamage);
                  }
                  
                  return (
                    <div key={round.round} className="mb-4 pb-4 border-b border-gray-600 last:border-b-0 last:mb-0">
                      <h4 className="text-lg font-semibold text-yellow-400 mb-3">Round {round.round}</h4>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                          {attackerFighter?.imageUrl ? (
                            <img src={attackerFighter.imageUrl} alt={attackerFighter.name} className="w-8 h-8 object-cover rounded-full border border-gray-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-xs flex-shrink-0 mt-0.5">?</div>
                          )}
                          <div className="flex-1">
                            <span className="text-blue-400 font-medium mr-2">{round.attacker}:</span>
                            <span className="text-gray-300 leading-relaxed">{round.attackCommentary}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                          {defenderFighter?.imageUrl ? (
                            <img src={defenderFighter.imageUrl} alt={defenderFighter.name} className="w-8 h-8 object-cover rounded-full border border-gray-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-xs flex-shrink-0 mt-0.5">?</div>
                          )}
                          <div className="flex-1">
                            <span className="text-red-400 font-medium mr-2">{round.defender}:</span>
                            <span className="text-gray-300 leading-relaxed">{round.defenseCommentary}</span>
                          </div>
                        </div>
                        {/* Only show Special Event if it is a non-empty, non-undefined, non-null string */}
                        {round.randomEvent && typeof round.randomEvent === 'string' && round.randomEvent.trim() !== '' && round.randomEvent !== 'undefined' && (
                          <div className="text-purple-400 text-xs italic p-2 bg-purple-900/20 rounded border border-purple-500/30">Special Event: {round.randomEvent}</div>
                        )}
                        {/* Only show Arena Used if it is a non-empty, non-undefined, non-null string */}
                        {round.arenaObjectsUsed && typeof round.arenaObjectsUsed === 'string' && round.arenaObjectsUsed.trim() !== '' && round.arenaObjectsUsed !== 'undefined' && (
                          <div className="text-green-400 text-xs italic p-2 bg-green-900/20 rounded border border-green-500/30">Arena Used: {round.arenaObjectsUsed}</div>
                        )}
                        
                        {/* Stat Changes Display */}
                        <div className="flex justify-center items-center gap-6 mt-4 pt-3 border-t border-gray-700">
                          {attackerFighter && (
                            <div className="flex items-center gap-2">
                              {attackerFighter.imageUrl ? (
                                <img src={attackerFighter.imageUrl} alt={attackerFighter.name} className="w-5 h-5 object-cover rounded-full border border-gray-400" />
                              ) : (
                                <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-xs">?</div>
                              )}
                              <span className={`text-sm font-medium ${attackerHealthChange < 0 ? 'text-red-400' : attackerHealthChange > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                                {attackerHealthChange < 0 ? `-${Math.abs(attackerHealthChange)}` : attackerHealthChange > 0 ? `+${attackerHealthChange}` : '0'}
                              </span>
                            </div>
                          )}
                          {defenderFighter && (
                            <div className="flex items-center gap-2">
                              {defenderFighter.imageUrl ? (
                                <img src={defenderFighter.imageUrl} alt={defenderFighter.name} className="w-5 h-5 object-cover rounded-full border border-gray-400" />
                              ) : (
                                <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-xs">?</div>
                              )}
                              <span className={`text-sm font-medium ${defenderHealthChange < 0 ? 'text-red-400' : defenderHealthChange > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                                {defenderHealthChange < 0 ? `-${Math.abs(defenderHealthChange)}` : defenderHealthChange > 0 ? `+${defenderHealthChange}` : '0'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Fixed Footer Section - Action Buttons */}
        <div className="flex-shrink-0 p-6 border-t border-gray-700">
          <div className="flex flex-row gap-4 justify-center">
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
    </div>
  );
};

export default WinnerAnimation; 