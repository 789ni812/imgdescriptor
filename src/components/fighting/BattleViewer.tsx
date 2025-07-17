import React, { useState, useEffect } from 'react';
import { Fighter, Scene } from '@/lib/stores/fightingGameStore';
import { BattleRound, BattleViewerMode } from '@/lib/types/battle';
import WinnerAnimation from './WinnerAnimation';
import BattleStoryboard from './BattleStoryboard';
import RoundStartAnimation from './RoundStartAnimation';
import HealthBar from './HealthBar';
import Image from 'next/image';

interface BattleViewerProps {
  fighterA: Fighter;
  fighterB: Fighter;
  scene: Scene;
  battleLog: BattleRound[];
  mode: BattleViewerMode;
  onBattleEnd?: (winner: string) => void;
  onBattleReplayComplete?: () => void; // New callback for when replay finishes
  onClose?: () => void;
}

const BATTLE_ATTACK_DEFENSE_STEP_MS = 1200;
const ROUND_TRANSITION_PAUSE_MS = 1800;

const BattleViewer: React.FC<BattleViewerProps> = ({
  fighterA,
  fighterB,
  scene,
  battleLog,
  // mode parameter removed as it's not used
  onBattleEnd,
  onBattleReplayComplete,
  onClose,
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
    <div className="w-full max-w-3xl mx-auto">
      <div className={`flex items-center justify-center gap-8 mb-8 transition-opacity duration-300 ${
        showRoundAnim ? 'opacity-30 battle-info-fade-out' : 'opacity-100 battle-info-fade-in'
      }`}>
        {/* Fighter A */}
        <div className="flex-1 flex flex-col items-center">
          {fighterA.imageUrl ? (
            <Image src={fighterA.imageUrl} alt={fighterA.name} width={96} height={96} className="w-24 h-24 object-cover rounded-lg border-4 border-red-700 shadow-lg" />
          ) : (
            <div className="w-24 h-24 bg-gray-300 rounded-lg border-4 border-red-700 shadow-lg flex items-center justify-center text-gray-600 text-xs text-center">
              No Image
            </div>
          )}
          <div className="mt-2 text-lg font-bold text-white">{fighterA.name}</div>
          <HealthBar current={health[fighterA.id] ?? 0} max={fighterA.stats.maxHealth} color="red" />
          <div className="text-xs mt-1 text-green-400 font-bold">Health: {health[fighterA.id]} / {fighterA.stats.maxHealth}</div>
        </div>
        <div className="text-3xl font-extrabold text-yellow-400 mx-6">vs</div>
        {/* Fighter B */}
        <div className="flex-1 flex flex-col items-center">
          {fighterB.imageUrl ? (
            <Image src={fighterB.imageUrl} alt={fighterB.name} width={96} height={96} className="w-24 h-24 object-cover rounded-lg border-4 border-blue-700 shadow-lg" />
          ) : (
            <div className="w-24 h-24 bg-gray-300 rounded-lg border-4 border-blue-700 shadow-lg flex items-center justify-center text-gray-600 text-xs text-center">
              No Image
            </div>
          )}
          <div className="mt-2 text-lg font-bold text-white">{fighterB.name}</div>
          <HealthBar current={health[fighterB.id] ?? 0} max={fighterB.stats.maxHealth} color="blue" />
          <div className="text-xs mt-1 text-green-400 font-bold">Health: {health[fighterB.id]} / {fighterB.stats.maxHealth}</div>
        </div>
      </div>
      {showRoundAnim && <RoundStartAnimation round={round.round} />}
      {!showRoundAnim && <BattleStoryboard
        scene={scene}
        round={round.round}
        attacker={{
          name: attacker.name,
          imageUrl: attacker.imageUrl,
          commentary: round.attackCommentary,
        }}
        defender={{
          name: defender.name,
          imageUrl: defender.imageUrl,
          commentary: round.defenseCommentary,
        }}
        previousRounds={battleLog.slice(0, currentRoundIdx).map(r => {
          const attackerFighter = r.attacker === fighterA.name ? fighterA : fighterB;
          const defenderFighter = r.defender === fighterA.name ? fighterA : fighterB;
          return {
            round: r.round,
            attacker: {
              name: attackerFighter.name,
              imageUrl: attackerFighter.imageUrl,
              commentary: r.attackCommentary,
            },
            defender: {
              name: defenderFighter.name,
              imageUrl: defenderFighter.imageUrl,
              commentary: r.defenseCommentary,
            },
          };
        })}
        roundStep={roundStep}
      />}
    </div>
  );
};

export default BattleViewer; 