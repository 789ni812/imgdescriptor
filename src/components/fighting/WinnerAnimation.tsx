import React, { useState, useEffect } from 'react';
import { Fighter, Scene } from '@/lib/stores/fightingGameStore';
import { BattleRound } from '@/lib/types/battle';
import TruncatedDescription from '../ui/TruncatedDescription';

interface WinnerAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  winner: string | null;
  fighterA: Fighter;
  fighterB: Fighter;
  scene: Scene;
  battleLog?: BattleRound[];
  battleSummary: string;
}

const WinnerAnimation: React.FC<WinnerAnimationProps> = ({
  isOpen,
  onClose,
  winner,
  fighterA,
  fighterB,
  scene,
  battleLog = [],
  battleSummary
}) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (winner === 'Draw') {
      setDisplayText("It's a DRAW!");
    } else if (winner) {
      setDisplayText(`${winner} wins the battle!`);
    } else {
      setDisplayText("It's a DRAW !!!");
    }
  }, [winner]);

  // Calculate final health values based on battle damage
  const calculateFinalHealth = (fighter: Fighter) => {
    if (!battleLog || battleLog.length === 0) {
      return fighter.stats?.health || 0;
    }

    let totalDamage = 0;
    battleLog.forEach(round => {
      // Check if this fighter was the attacker or defender in this round
      if (round.attacker === fighter.name) {
        // Fighter was attacker, so they took defenderDamage
        totalDamage += round.defenderDamage || 0;
      } else if (round.defender === fighter.name) {
        // Fighter was defender, so they took attackerDamage
        totalDamage += round.attackerDamage || 0;
      }
    });

    const finalHealth = Math.max(0, (fighter.stats?.maxHealth || 0) - totalDamage);
    return finalHealth;
  };

  // Helper function to determine fighter status
  const getFighterStatus = (fighter: Fighter | null | undefined, isWinner: boolean) => {
    if (!fighter || !fighter.stats) {
      return isWinner ? 'Victorious' : 'Defeated';
    }
    
    const finalHealth = calculateFinalHealth(fighter);
    const healthPercentage = (finalHealth / fighter.stats.maxHealth) * 100;
    
    if (isWinner) {
      if (healthPercentage > 80) return 'Victorious';
      if (healthPercentage > 50) return 'Barely Standing';
      return 'Battered but Victorious';
    } else {
      if (healthPercentage > 50) return 'Defeated but Alive';
      if (healthPercentage > 20) return 'Severely Wounded';
      return 'Knocked Out';
    }
  };

  const showKO = winner !== 'Draw' && winner !== null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto bg-black/60">
      <div className="flex flex-col bg-black/90 rounded-2xl shadow-2xl max-w-6xl max-h-[90vh] w-full mx-4">
        {/* Fixed Header Section - Winner Announcement and Fighter Stats */}
        <div className="flex-shrink-0 p-8">
          {/* Winner Announcement */}
          <div className="text-center mb-8">
            <div className="text-green-400 text-7xl font-extrabold mb-2 drop-shadow-lg">
              {displayText}
            </div>
            {showKO && winner !== 'Draw' && (
              <div className="text-red-500 text-6xl font-extrabold mb-4 drop-shadow-lg animate-pulse">KO!</div>
            )}
            {winner === 'Draw' && (
              <div className="text-yellow-400 text-4xl font-bold mb-4">It&apos;s a tie!</div>
            )}
          </div>
          
          {/* Fighter Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            {/* Fighter A */}
            <div className={`bg-gray-800 rounded-xl p-6 border-2 transition-all duration-300 ${
              winner === fighterA?.name 
                ? 'border-green-500 shadow-lg shadow-green-500/20' 
                : winner === fighterB?.name 
                ? 'border-red-500 shadow-lg shadow-red-500/20'
                : 'border-gray-700'
            }`}>
              <div className="flex items-center mb-4">
                <div className="relative">
                  <img
                    src={fighterA?.imageUrl || ''}
                    alt={fighterA?.name || 'Fighter A'}
                    className="w-20 h-20 object-cover rounded-xl mr-4 border-2 border-gray-600"
                  />
                  {winner === fighterA?.name && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      👑
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{fighterA?.name || 'Fighter A'}</h3>
                  <p className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${
                    winner === fighterA?.name 
                      ? 'bg-green-600 text-white' 
                      : winner === fighterB?.name 
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {getFighterStatus(fighterA, winner === fighterA?.name)}
                  </p>
                </div>
              </div>
              
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-sm">
                {/* Core Combat Stats */}
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs font-medium">Health</div>
                  <div className="text-white font-bold text-lg">
                    {calculateFinalHealth(fighterA)}/{fighterA?.stats?.maxHealth || 0}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs font-medium">Strength</div>
                  <div className="text-white font-bold">{fighterA?.stats?.strength || 0}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs font-medium">Agility</div>
                  <div className="text-white font-bold">{fighterA?.stats?.agility || 0}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs font-medium">Defense</div>
                  <div className="text-white font-bold">{fighterA?.stats?.defense || 0}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs font-medium">Luck</div>
                  <div className="text-white font-bold">{fighterA?.stats?.luck || 0}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs font-medium">Age</div>
                  <div className="text-white font-bold">{fighterA?.stats?.age || 0}</div>
                </div>
                
                {/* Special Stats - Always show if they exist */}
                <div className="bg-purple-700/50 rounded-lg p-3">
                  <div className="text-purple-300 text-xs font-medium">Magic</div>
                  <div className="text-white font-bold">{fighterA?.stats?.magic || 0}</div>
                </div>
                <div className="bg-blue-700/50 rounded-lg p-3">
                  <div className="text-blue-300 text-xs font-medium">Ranged</div>
                  <div className="text-white font-bold">{fighterA?.stats?.ranged || 0}</div>
                </div>
                <div className="bg-indigo-700/50 rounded-lg p-3">
                  <div className="text-indigo-300 text-xs font-medium">Intelligence</div>
                  <div className="text-white font-bold">{fighterA?.stats?.intelligence || 0}</div>
                </div>
                
                {/* Physical Stats - Always show */}
                <div className="bg-orange-700/50 rounded-lg p-3">
                  <div className="text-orange-300 text-xs font-medium">Size</div>
                  <div className="text-white font-bold">{fighterA?.stats?.size || 'N/A'}</div>
                </div>
                <div className="bg-yellow-700/50 rounded-lg p-3">
                  <div className="text-yellow-300 text-xs font-medium">Build</div>
                  <div className="text-white font-bold">{fighterA?.stats?.build || 'N/A'}</div>
                </div>
              </div>
              
              {/* Unique Abilities */}
              {fighterA?.stats?.uniqueAbilities && fighterA.stats.uniqueAbilities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-xs text-gray-400 mb-3 font-medium">Special Abilities:</div>
                  <div className="flex flex-wrap gap-2">
                    {fighterA.stats.uniqueAbilities.map((ability, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fighter B */}
            <div className={`bg-gray-800 rounded-xl p-6 border-2 transition-all duration-300 ${
              winner === fighterB?.name 
                ? 'border-green-500 shadow-lg shadow-green-500/20' 
                : winner === fighterA?.name 
                ? 'border-red-500 shadow-lg shadow-red-500/20'
                : 'border-gray-700'
            }`}>
              <div className="flex items-center mb-4">
                <div className="relative">
                  <img
                    src={fighterB?.imageUrl || ''}
                    alt={fighterB?.name || 'Fighter B'}
                    className="w-20 h-20 object-cover rounded-xl mr-4 border-2 border-gray-600"
                  />
                  {winner === fighterB?.name && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      👑
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{fighterB?.name || 'Fighter B'}</h3>
                  <p className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${
                    winner === fighterB?.name 
                      ? 'bg-green-600 text-white' 
                      : winner === fighterA?.name 
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {getFighterStatus(fighterB, winner === fighterB?.name)}
                  </p>
                </div>
              </div>
              
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-sm">
                {/* Core Combat Stats */}
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs font-medium">Health</div>
                  <div className="text-white font-bold text-lg">
                    {calculateFinalHealth(fighterB)}/{fighterB?.stats?.maxHealth || 0}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs font-medium">Strength</div>
                  <div className="text-white font-bold">{fighterB?.stats?.strength || 0}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs font-medium">Agility</div>
                  <div className="text-white font-bold">{fighterB?.stats?.agility || 0}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs font-medium">Defense</div>
                  <div className="text-white font-bold">{fighterB?.stats?.defense || 0}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs font-medium">Luck</div>
                  <div className="text-white font-bold">{fighterB?.stats?.luck || 0}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-gray-400 text-xs font-medium">Age</div>
                  <div className="text-white font-bold">{fighterB?.stats?.age || 0}</div>
                </div>
                
                {/* Special Stats - Always show if they exist */}
                <div className="bg-purple-700/50 rounded-lg p-3">
                  <div className="text-purple-300 text-xs font-medium">Magic</div>
                  <div className="text-white font-bold">{fighterB?.stats?.magic || 0}</div>
                </div>
                <div className="bg-blue-700/50 rounded-lg p-3">
                  <div className="text-blue-300 text-xs font-medium">Ranged</div>
                  <div className="text-white font-bold">{fighterB?.stats?.ranged || 0}</div>
                </div>
                <div className="bg-indigo-700/50 rounded-lg p-3">
                  <div className="text-indigo-300 text-xs font-medium">Intelligence</div>
                  <div className="text-white font-bold">{fighterB?.stats?.intelligence || 0}</div>
                </div>
                
                {/* Physical Stats - Always show */}
                <div className="bg-orange-700/50 rounded-lg p-3">
                  <div className="text-orange-300 text-xs font-medium">Size</div>
                  <div className="text-white font-bold">{fighterB?.stats?.size || 'N/A'}</div>
                </div>
                <div className="bg-yellow-700/50 rounded-lg p-3">
                  <div className="text-yellow-300 text-xs font-medium">Build</div>
                  <div className="text-white font-bold">{fighterB?.stats?.build || 'N/A'}</div>
                </div>
              </div>
              
              {/* Unique Abilities */}
              {fighterB?.stats?.uniqueAbilities && fighterB.stats.uniqueAbilities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-xs text-gray-400 mb-3 font-medium">Special Abilities:</div>
                  <div className="flex flex-wrap gap-2">
                    {fighterB.stats.uniqueAbilities.map((ability, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unified Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto px-8 pb-4">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">⚔️</span>
            Battle Overview
          </h3>
          
          {/* Arena Info */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
            <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
              <span className="mr-2">🏟️</span>
              Arena: {scene?.name || 'Unknown Arena'}
            </h4>
            <p className="text-gray-300 text-sm mb-3 leading-relaxed">{scene?.description || 'No description available.'}</p>
            {scene?.environmentalObjects && scene.environmentalObjects.length > 0 && (
              <div className="text-sm text-gray-400">
                <span className="font-medium">Environmental Objects:</span> {scene.environmentalObjects.join(', ')}
              </div>
            )}
          </div>

          {/* Battle Summary */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
            <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
              <span className="mr-2">📋</span>
              Battle Summary
            </h4>
            <div className="text-gray-300 text-sm leading-relaxed">
              <TruncatedDescription 
                description={battleSummary} 
                maxLength={500}
                className="leading-relaxed"
                showTooltip={true}
              />
            </div>
          </div>

          {/* Round-by-Round Log */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🥊</span>
              Round Details
            </h4>
            <div className="space-y-6">
              {battleLog && battleLog.length > 0 ? (
                battleLog.map((round, index) => {
                  const attackerHealthChange = round.attackerDamage;
                  const defenderHealthChange = round.defenderDamage;
                  
                  // Determine which fighter is attacker and defender
                  const isAttackerA = round.attacker === fighterA?.name;
                  const attackerFighter = isAttackerA ? fighterA : fighterB;
                  const defenderFighter = isAttackerA ? fighterB : fighterA;
                  
                  return (
                    <div key={index} className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="text-lg font-bold text-white mb-3 flex items-center">
                        <span className="mr-2">Round {round.round}</span>
                        <div className="flex-1 h-px bg-gray-600 ml-3"></div>
                      </div>
                      <div className="text-sm text-gray-300 space-y-3">
                        {/* Attack */}
                        <div className="flex items-start space-x-3 bg-gray-800 rounded-lg p-3">
                          <img
                            src={attackerFighter?.imageUrl || ''}
                            alt={attackerFighter?.name || 'Attacker'}
                            className="w-8 h-8 object-cover rounded-lg flex-shrink-0 border border-gray-600"
                          />
                          <div className="flex-1">
                            <span className="font-bold text-blue-300">{round.attacker}</span>
                            <span className="text-gray-400 ml-2">attacks:</span>
                            <div className="text-gray-200 mt-1 leading-relaxed">{round.attackCommentary}</div>
                          </div>
                        </div>
                        
                        {/* Defense */}
                        <div className="flex items-start space-x-3 bg-gray-800 rounded-lg p-3">
                          <img
                            src={defenderFighter?.imageUrl || ''}
                            alt={defenderFighter?.name || 'Defender'}
                            className="w-8 h-8 object-cover rounded-lg flex-shrink-0 border border-gray-600"
                          />
                          <div className="flex-1">
                            <span className="font-bold text-red-300">{round.defender}</span>
                            <span className="text-gray-400 ml-2">defends:</span>
                            <div className="text-gray-200 mt-1 leading-relaxed">{round.defenseCommentary}</div>
                          </div>
                        </div>
                        
                        {/* Damage Summary with Enhanced Visual Impact */}
                        <div className="bg-gradient-to-r from-red-900/50 to-blue-900/50 rounded-lg p-4 border border-gray-600">
                          <div className="text-center text-xs text-gray-400 mb-3 font-medium">DAMAGE TAKEN</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img
                                src={attackerFighter?.imageUrl || ''}
                                alt={attackerFighter?.name || 'Attacker'}
                                className="w-10 h-10 object-cover rounded-lg border-2 border-gray-500"
                              />
                              <div className="text-center">
                                <div className="text-white font-bold">{round.attacker}</div>
                                <div className="text-red-400 font-bold text-lg">-{attackerHealthChange}</div>
                              </div>
                            </div>
                            <div className="text-gray-500 text-2xl">⚔️</div>
                            <div className="flex items-center space-x-3">
                              <div className="text-center">
                                <div className="text-white font-bold">{round.defender}</div>
                                <div className="text-red-400 font-bold text-lg">-{defenderHealthChange}</div>
                              </div>
                              <img
                                src={defenderFighter?.imageUrl || ''}
                                alt={defenderFighter?.name || 'Defender'}
                                className="w-10 h-10 object-cover rounded-lg border-2 border-gray-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-400 text-center py-8">
                  <div className="text-4xl mb-3">🥊</div>
                  <div className="text-sm italic">No round details available for this battle.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Footer Section - Action Buttons */}
        <div className="flex-shrink-0 p-8 border-t border-gray-700 bg-gray-900/50">
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => {
                // Reset the game and close the modal
                onClose();
                // You might want to add a callback to restart the game
              }}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span className="mr-2">🔄</span>
              Restart Battle
            </button>
            <button
              onClick={onClose}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span className="mr-2">✖️</span>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerAnimation; 