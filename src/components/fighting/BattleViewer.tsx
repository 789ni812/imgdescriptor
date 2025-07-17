import React, { useState, useEffect } from 'react';
import { Fighter, Scene } from '@/lib/stores/fightingGameStore';
import { BattleRound } from '@/lib/types/battle';
import BattleStoryboard from './BattleStoryboard';
import RoundStartAnimation from './RoundStartAnimation';
import HealthBar from './HealthBar';
import Image from 'next/image';

interface BattleViewerProps {
  fighterA: Fighter;
  fighterB: Fighter;
  scene: Scene;
  battleLog: BattleRound[];
  onBattleEnd?: (winner: string) => void;
  onBattleReplayComplete?: () => void; // New callback for when replay finishes
}

const BATTLE_ATTACK_DEFENSE_STEP_MS = 1200;
const ROUND_TRANSITION_PAUSE_MS = 1800;

const BattleViewer: React.FC<BattleViewerProps> = ({
  fighterA,
  fighterB,
  scene,
  battleLog,
  onBattleEnd,
  onBattleReplayComplete,
}) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [roundStep, setRoundStep] = useState<'attack' | 'defense'>('attack');
  const [showRoundAnim, setShowRoundAnim] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [battleReplayComplete, setBattleReplayComplete] = useState(false);
  const [health, setHealth] = useState({
    [fighterA.id]: fighterA.stats.health,
    [fighterB.id]: fighterB.stats.health,
  });

  useEffect(() => {
    if (winner) return; // Stop all updates if winner is set
    setHealth({
      [fighterA.id]: fighterA.stats.health,
      [fighterB.id]: fighterB.stats.health,
    });
    setCurrentRoundIdx(0);
    setWinner(null);
    setShowRoundAnim(true);
    setRoundStep('attack');
  }, [fighterA, fighterB, battleLog]);

  useEffect(() => {
    if (winner) return; // Stop all updates if winner is set
    if (!battleLog.length) return;
    if (currentRoundIdx >= battleLog.length) {
      // Battle is over - let the parent component handle winner determination
      // The winner should already be set from the API response
      console.log('BattleViewer: Battle ended, winner should be set by parent');
      if (onBattleEnd && winner) onBattleEnd(winner);
      
      // Signal that the battle replay is complete
      if (onBattleReplayComplete) {
        console.log('BattleViewer: Signaling battle replay complete');
        onBattleReplayComplete();
      }
      
      // Mark replay as complete to hide this component
      setBattleReplayComplete(true);
      return;
    }
    if (!showRoundAnim) {
      // Animate round
      const round = battleLog[currentRoundIdx];
      // Update health
      setHealth(prev => {
        const newHealth = { ...prev };
        if (fighterA.name === round.attacker) {
          newHealth[fighterB.id] = round.healthAfter.defender;
        } else {
          newHealth[fighterA.id] = round.healthAfter.defender;
        }
        return newHealth;
      });
      setRoundStep('attack');
      setTimeout(() => {
        if (!winner) setRoundStep('defense');
      }, BATTLE_ATTACK_DEFENSE_STEP_MS);
      setTimeout(() => {
        if (!winner) {
          setCurrentRoundIdx(idx => idx + 1);
          setShowRoundAnim(true);
        }
      }, ROUND_TRANSITION_PAUSE_MS);
    }
  }, [currentRoundIdx, showRoundAnim, battleLog, winner, fighterA.name, fighterA.id, fighterB.id, onBattleEnd, onBattleReplayComplete]);

  // Show round animation at the start of each round
  useEffect(() => {
    console.log('BattleViewer: Round animation effect triggered', {
      winner,
      battleLogLength: battleLog.length,
      showRoundAnim,
      currentRoundIdx
    });

    if (winner) return; // Stop all updates if winner is set
    if (!battleLog.length) return;
    if (showRoundAnim && currentRoundIdx < battleLog.length) {
      console.log('BattleViewer: Starting round animation timer');
      const timer = setTimeout(() => {
        console.log('BattleViewer: Round animation timer completed, setting showRoundAnim to false');
        setShowRoundAnim(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showRoundAnim, currentRoundIdx, battleLog.length, winner]);



  if (!battleLog.length) return <div>No battle log available.</div>;

  // Hide the component when battle replay is complete
  if (battleReplayComplete) return null;

  const round = battleLog[Math.min(currentRoundIdx, battleLog.length - 1)];
  const attacker = fighterA.name === round.attacker ? fighterA : fighterB;
  const defender = fighterA.name === round.defender ? fighterA : fighterB;

  // Debug output for E2E testing
  console.log('BattleViewer Debug:', {
    currentRoundIdx,
    battleLogLength: battleLog.length,
    showRoundAnim,
    roundStep,
    winner,
    round: round?.round
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Arena Description Panel - Wider than other panels */}
      <div className="w-full flex justify-center">
        <div className={`w-full lg:w-[70%] bg-gray-800/90 border-2 border-gray-700 shadow-xl rounded-2xl p-6 transition-opacity duration-300 mb-2 mx-auto ${
          showRoundAnim ? 'opacity-30 battle-info-fade-out' : 'opacity-100 battle-info-fade-in'
        }`}>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">⚔️ Battle Arena</h2>
          <div className="flex items-center justify-center gap-8">
            {/* Fighter A */}
            <div className="flex-1 flex flex-col items-center max-w-xs">
              {fighterA.imageUrl ? (
                <Image src={fighterA.imageUrl} alt={fighterA.name} width={120} height={120} className="w-30 h-30 object-cover rounded-full border-4 border-red-700 shadow-lg" />
              ) : (
                <div className="w-30 h-30 bg-gray-300 rounded-full border-4 border-red-700 shadow-lg flex items-center justify-center text-gray-600 text-xs text-center">
                  No Image
                </div>
              )}
              <div className="mt-4 text-xl font-bold text-white text-center">{fighterA.name}</div>
              <HealthBar current={health[fighterA.id] ?? 0} max={fighterA.stats.maxHealth} color="red" />
              <div className="text-sm mt-2 text-green-400 font-bold">Health: {health[fighterA.id]} / {fighterA.stats.maxHealth}</div>
            </div>
            {/* VS */}
            <div className="text-4xl font-extrabold text-yellow-400 mx-8">VS</div>
            {/* Fighter B */}
            <div className="flex-1 flex flex-col items-center max-w-xs">
              {fighterB.imageUrl ? (
                <Image src={fighterB.imageUrl} alt={fighterB.name} width={120} height={120} className="w-30 h-30 object-cover rounded-full border-4 border-blue-700 shadow-lg" />
              ) : (
                <div className="w-30 h-30 bg-gray-300 rounded-full border-4 border-blue-700 shadow-lg flex items-center justify-center text-gray-600 text-xs text-center">
                  No Image
                </div>
              )}
              <div className="mt-4 text-xl font-bold text-white text-center">{fighterB.name}</div>
              <HealthBar current={health[fighterB.id] ?? 0} max={fighterB.stats.maxHealth} color="blue" />
              <div className="text-sm mt-2 text-green-400 font-bold">Health: {health[fighterB.id]} / {fighterB.stats.maxHealth}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Fighter Commentary - Side by Side, max-w-3xl centered */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl">
          <h3 className="text-xl font-bold text-white mb-4">🎯 Current Action</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attacker Panel */}
            <div className={`bg-gray-900 border border-gray-600 rounded-xl p-6 flex flex-col items-center justify-start text-white transform -skew-x-3 overflow-y-auto overflow-x-hidden transition-opacity duration-500 shadow-md min-h-64 ${roundStep === 'defense' ? 'opacity-40' : 'opacity-100'}`} data-testid="attacker-box">
              <div className="transform skew-x-3 w-full">
                {attacker.imageUrl ? (
                  <Image src={attacker.imageUrl} alt={attacker.name} width={80} height={80} className="w-20 h-20 object-cover rounded-full mx-auto mb-4 border-2 border-blue-500" />
                ) : (
                  <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-300 text-xs text-center border-2 border-blue-500">
                    No Image
                  </div>
                )}
                <div className="font-bold text-lg mb-4 text-blue-400 text-center">{attacker.name}</div>
                {roundStep === 'attack' && (
                  <div className="text-sm text-center break-words w-full text-white font-semibold flex-1 overflow-y-auto overflow-x-hidden leading-relaxed whitespace-pre-line" style={{ wordBreak: 'break-word' }}>
                    {round.attackCommentary}
                  </div>
                )}
              </div>
            </div>

            {/* Defender Panel */}
            <div className={`bg-gray-900 border border-gray-600 rounded-xl p-6 flex flex-col items-center justify-start text-white transform skew-x-3 overflow-y-auto overflow-x-hidden transition-opacity duration-500 shadow-md min-h-64 ${roundStep === 'attack' ? 'opacity-40' : 'opacity-100'}`} data-testid="defender-box">
              <div className="transform -skew-x-3 w-full">
                {defender.imageUrl ? (
                  <Image src={defender.imageUrl} alt={defender.name} width={80} height={80} className="w-20 h-20 object-cover rounded-full mx-auto mb-4 border-2 border-red-500" />
                ) : (
                  <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-300 text-xs text-center border-2 border-red-500">
                    No Image
                  </div>
                )}
                <div className="font-bold text-lg mb-4 text-red-400 text-center">{defender.name}</div>
                {roundStep === 'defense' && (
                  <div className="text-sm text-center break-words w-full text-white font-semibold flex-1 overflow-y-auto overflow-x-hidden leading-relaxed whitespace-pre-line" style={{ wordBreak: 'break-word' }}>
                    {round.defenseCommentary}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle History - Full Width, max-w-4xl centered */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl">
          <h3 className="text-xl font-bold text-white mb-4">📜 Battle History</h3>
          <div className="bg-gray-900 border border-gray-600 rounded-xl p-6 flex flex-col overflow-y-auto text-white min-h-[300px] max-h-96 shadow-md">
            {battleLog.slice(0, currentRoundIdx).map((r) => {
              const attackerFighter = r.attacker === fighterA.name ? fighterA : fighterB;
              const defenderFighter = r.defender === fighterA.name ? fighterA : fighterB;
              return (
                <div key={r.round} className="mb-6 p-4 bg-gray-800 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-400 font-bold text-sm">Round {r.round}</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Attacker commentary */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Image src={attackerFighter.imageUrl} alt={attackerFighter.name} width={32} height={32} className="w-8 h-8 object-cover rounded-full border border-gray-400" />
                        <span className="font-bold text-blue-400">{attackerFighter.name}</span>
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{r.attackCommentary}</p>
                    </div>
                    {/* Defender commentary */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Image src={defenderFighter.imageUrl} alt={defenderFighter.name} width={32} height={32} className="w-8 h-8 object-cover rounded-full border border-gray-400" />
                        <span className="font-bold text-red-400">{defenderFighter.name}</span>
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{r.defenseCommentary}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {battleLog.slice(0, currentRoundIdx).length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>Battle history will appear here as the fight progresses...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleViewer; 