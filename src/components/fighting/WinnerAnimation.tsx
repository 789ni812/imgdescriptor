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

  // Helper function to determine fighter status
  const getFighterStatus = (fighter: Fighter | null | undefined, isWinner: boolean) => {
    if (!fighter || !fighter.stats) {
      return isWinner ? 'Victorious' : 'Defeated';
    }
    
    const healthPercentage = (fighter.stats.health / fighter.stats.maxHealth) * 100;
    
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Fighter A */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <img
                  src={fighterA?.imageUrl || ''}
                  alt={fighterA?.name || 'Fighter A'}
                  className="w-16 h-16 object-cover rounded-lg mr-4 border-2 border-gray-600"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">{fighterA?.name || 'Fighter A'}</h3>
                  <p className="text-sm text-gray-300 font-medium">
                    {getFighterStatus(fighterA, winner === fighterA?.name)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-700 rounded p-2">
                  <div className="text-gray-400 text-xs">Health</div>
                  <div className="text-white font-medium">{fighterA?.stats?.health || 0}/{fighterA?.stats?.maxHealth || 0}</div>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <div className="text-gray-400 text-xs">Strength</div>
                  <div className="text-white font-medium">{fighterA?.stats?.strength || 0}</div>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <div className="text-gray-400 text-xs">Agility</div>
                  <div className="text-white font-medium">{fighterA?.stats?.agility || 0}</div>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <div className="text-gray-400 text-xs">Defense</div>
                  <div className="text-white font-medium">{fighterA?.stats?.defense || 0}</div>
                </div>
                {fighterA?.stats?.magic !== undefined && (
                  <div className="bg-gray-700 rounded p-2">
                    <div className="text-gray-400 text-xs">Magic</div>
                    <div className="text-white font-medium">{fighterA.stats.magic}</div>
                  </div>
                )}
                {fighterA?.stats?.ranged !== undefined && (
                  <div className="bg-gray-700 rounded p-2">
                    <div className="text-gray-400 text-xs">Ranged</div>
                    <div className="text-white font-medium">{fighterA.stats.ranged}</div>
                  </div>
                )}
                {fighterA?.stats?.intelligence !== undefined && (
                  <div className="bg-gray-700 rounded p-2">
                    <div className="text-gray-400 text-xs">Intelligence</div>
                    <div className="text-white font-medium">{fighterA.stats.intelligence}</div>
                  </div>
                )}
              </div>
              {fighterA?.stats?.uniqueAbilities && fighterA.stats.uniqueAbilities.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-400 mb-2 font-medium">Abilities:</div>
                  <div className="flex flex-wrap gap-1">
                    {fighterA.stats.uniqueAbilities.map((ability, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-600 text-white text-xs rounded font-medium">
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fighter B */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <img
                  src={fighterB?.imageUrl || ''}
                  alt={fighterB?.name || 'Fighter B'}
                  className="w-16 h-16 object-cover rounded-lg mr-4 border-2 border-gray-600"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">{fighterB?.name || 'Fighter B'}</h3>
                  <p className="text-sm text-gray-300 font-medium">
                    {getFighterStatus(fighterB, winner === fighterB?.name)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-700 rounded p-2">
                  <div className="text-gray-400 text-xs">Health</div>
                  <div className="text-white font-medium">{fighterB?.stats?.health || 0}/{fighterB?.stats?.maxHealth || 0}</div>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <div className="text-gray-400 text-xs">Strength</div>
                  <div className="text-white font-medium">{fighterB?.stats?.strength || 0}</div>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <div className="text-gray-400 text-xs">Agility</div>
                  <div className="text-white font-medium">{fighterB?.stats?.agility || 0}</div>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <div className="text-gray-400 text-xs">Defense</div>
                  <div className="text-white font-medium">{fighterB?.stats?.defense || 0}</div>
                </div>
                {fighterB?.stats?.magic !== undefined && (
                  <div className="bg-gray-700 rounded p-2">
                    <div className="text-gray-400 text-xs">Magic</div>
                    <div className="text-white font-medium">{fighterB.stats.magic}</div>
                  </div>
                )}
                {fighterB?.stats?.ranged !== undefined && (
                  <div className="bg-gray-700 rounded p-2">
                    <div className="text-gray-400 text-xs">Ranged</div>
                    <div className="text-white font-medium">{fighterB.stats.ranged}</div>
                  </div>
                )}
                {fighterB?.stats?.intelligence !== undefined && (
                  <div className="bg-gray-700 rounded p-2">
                    <div className="text-gray-400 text-xs">Intelligence</div>
                    <div className="text-white font-medium">{fighterB.stats.intelligence}</div>
                  </div>
                )}
              </div>
              {fighterB?.stats?.uniqueAbilities && fighterB.stats.uniqueAbilities.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-400 mb-2 font-medium">Abilities:</div>
                  <div className="flex flex-wrap gap-1">
                    {fighterB.stats.uniqueAbilities.map((ability, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-600 text-white text-xs rounded font-medium">
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Battle Overview Section */}
        <div className="flex-1 overflow-y-auto px-8 pb-4">
          <h3 className="text-xl font-bold text-white mb-4">Battle Overview</h3>
          
          {/* Arena Info */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h4 className="text-lg font-semibold text-white mb-2">Arena: {scene?.name || 'Unknown Arena'}</h4>
            <p className="text-gray-300 text-sm mb-2">{scene?.description || 'No description available.'}</p>
            {scene?.environmentalObjects && scene.environmentalObjects.length > 0 && (
              <div className="text-sm text-gray-400">
                <span className="font-medium">Environmental Objects:</span> {scene.environmentalObjects.join(', ')}
              </div>
            )}
          </div>

          {/* Battle Summary */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h4 className="text-lg font-semibold text-white mb-2">Battle Summary</h4>
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
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Round Details</h4>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {battleLog && battleLog.length > 0 ? (
                battleLog.map((round, index) => {
                  const attackerHealthChange = round.attackerDamage;
                  const defenderHealthChange = round.defenderDamage;
                  
                  // Determine which fighter is attacker and defender
                  const isAttackerA = round.attacker === fighterA?.name;
                  const attackerFighter = isAttackerA ? fighterA : fighterB;
                  const defenderFighter = isAttackerA ? fighterB : fighterA;
                  
                  return (
                    <div key={index} className="border-l-2 border-gray-600 pl-4">
                      <div className="text-sm font-medium text-white mb-2">
                        Round {round.round}
                      </div>
                      <div className="text-xs text-gray-300 space-y-2">
                        {/* Attack */}
                        <div className="flex items-start space-x-2">
                          <img
                            src={attackerFighter?.imageUrl || ''}
                            alt={attackerFighter?.name || 'Attacker'}
                            className="w-6 h-6 object-cover rounded flex-shrink-0 mt-0.5"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-blue-300">{round.attacker}</span> attacks: {round.attackCommentary}
                          </div>
                        </div>
                        
                        {/* Defense */}
                        <div className="flex items-start space-x-2">
                          <img
                            src={defenderFighter?.imageUrl || ''}
                            alt={defenderFighter?.name || 'Defender'}
                            className="w-6 h-6 object-cover rounded flex-shrink-0 mt-0.5"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-red-300">{round.defender}</span> defends: {round.defenseCommentary}
                          </div>
                        </div>
                        
                        {/* Damage Summary with Icons */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700">
                          <div className="flex items-center space-x-2">
                            <img
                              src={attackerFighter?.imageUrl || ''}
                              alt={attackerFighter?.name || 'Attacker'}
                              className="w-5 h-5 object-cover rounded"
                            />
                            <span className="text-gray-400 text-xs">
                              {round.attacker} (-{attackerHealthChange})
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-xs">
                              {round.defender} (-{defenderHealthChange})
                            </span>
                            <img
                              src={defenderFighter?.imageUrl || ''}
                              alt={defenderFighter?.name || 'Defender'}
                              className="w-5 h-5 object-cover rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-400 text-sm italic">
                  No round details available for this battle.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Footer Section - Action Buttons */}
        <div className="flex-shrink-0 p-8 border-t border-gray-700">
          <div className="flex justify-center space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerAnimation; 