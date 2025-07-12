import React, { useEffect, useState } from 'react';
import HealthBar from './HealthBar';
import BattleStoryboard from './BattleStoryboard';
import RoundStartAnimation from './RoundStartAnimation';
import WinnerAnimation from './WinnerAnimation';

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

interface Scene {
  name: string;
  imageUrl: string;
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

interface BattleViewerProps {
  fighterA: Fighter;
  fighterB: Fighter;
  scene: Scene;
  battleLog: BattleRound[];
  mode: 'live' | 'replay';
  onBattleEnd?: (winner: string) => void;
}

const BATTLE_ATTACK_DEFENSE_STEP_MS = 1200;
const ROUND_TRANSITION_PAUSE_MS = 1800;

const BattleViewer: React.FC<BattleViewerProps> = ({
  fighterA,
  fighterB,
  scene,
  battleLog,
  mode,
  onBattleEnd,
}) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [roundStep, setRoundStep] = useState<'attack' | 'defense'>('attack');
  const [showRoundAnim, setShowRoundAnim] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [health, setHealth] = useState({
    [fighterA.id]: fighterA.stats.health,
    [fighterB.id]: fighterB.stats.health,
  });

  useEffect(() => {
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
    if (!battleLog.length || winner) return;
    if (currentRoundIdx >= battleLog.length) {
      // Battle is over
      const last = battleLog[battleLog.length - 1];
      let win = '';
      if (last.healthAfter.attacker > 0 && last.healthAfter.defender <= 0) win = last.attacker;
      else if (last.healthAfter.defender > 0 && last.healthAfter.attacker <= 0) win = last.defender;
      else win = 'Draw';
      setWinner(win);
      if (onBattleEnd) onBattleEnd(win);
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
      setTimeout(() => setRoundStep('defense'), BATTLE_ATTACK_DEFENSE_STEP_MS);
      setTimeout(() => {
        setCurrentRoundIdx(idx => idx + 1);
        setShowRoundAnim(true);
      }, ROUND_TRANSITION_PAUSE_MS);
    }
  }, [currentRoundIdx, showRoundAnim, battleLog, winner, fighterA.name, fighterA.id, fighterB.id, onBattleEnd]);

  // Show round animation at the start of each round
  useEffect(() => {
    if (!battleLog.length || winner) return;
    if (showRoundAnim && currentRoundIdx < battleLog.length) {
      const timer = setTimeout(() => setShowRoundAnim(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showRoundAnim, currentRoundIdx, battleLog.length, winner]);

  // Add restart handler for replay mode
  const handleRestart = () => {
    if (mode === 'replay') {
      setCurrentRoundIdx(0);
      setWinner(null);
      setShowRoundAnim(true);
      setHealth({
        [fighterA.id]: fighterA.stats.health,
        [fighterB.id]: fighterB.stats.health,
      });
      setRoundStep('attack');
    }
  };

  if (!battleLog.length) return <div>No battle log available.</div>;

  const round = battleLog[Math.min(currentRoundIdx, battleLog.length - 1)];
  const attacker = fighterA.name === round.attacker ? fighterA : fighterB;
  const defender = fighterA.name === round.defender ? fighterA : fighterB;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-center gap-8 mb-8">
        {/* Fighter A */}
        <div className="flex-1 flex flex-col items-center">
          {fighterA.imageUrl ? (
            <img src={fighterA.imageUrl} alt={fighterA.name} className="w-24 h-24 object-cover rounded-lg border-4 border-red-700 shadow-lg" />
          ) : (
            <div className="w-24 h-24 bg-gray-300 rounded-lg border-4 border-red-700 shadow-lg flex items-center justify-center text-gray-600 text-xs text-center">
              No Image
            </div>
          )}
          <div className="mt-2 text-lg font-bold">{fighterA.name}</div>
          <HealthBar current={health[fighterA.id] ?? 0} max={fighterA.stats.maxHealth} color="red" />
          <div className="text-xs mt-1">Health: {health[fighterA.id]} / {fighterA.stats.maxHealth}</div>
        </div>
        <div className="text-3xl font-extrabold text-yellow-400 mx-6">vs</div>
        {/* Fighter B */}
        <div className="flex-1 flex flex-col items-center">
          {fighterB.imageUrl ? (
            <img src={fighterB.imageUrl} alt={fighterB.name} className="w-24 h-24 object-cover rounded-lg border-4 border-blue-700 shadow-lg" />
          ) : (
            <div className="w-24 h-24 bg-gray-300 rounded-lg border-4 border-blue-700 shadow-lg flex items-center justify-center text-gray-600 text-xs text-center">
              No Image
            </div>
          )}
          <div className="mt-2 text-lg font-bold">{fighterB.name}</div>
          <HealthBar current={health[fighterB.id] ?? 0} max={fighterB.stats.maxHealth} color="blue" />
          <div className="text-xs mt-1">Health: {health[fighterB.id]} / {fighterB.stats.maxHealth}</div>
        </div>
      </div>
      {showRoundAnim && !winner && (
        <RoundStartAnimation round={round.round} />
      )}
      {!showRoundAnim && !winner && (
        <BattleStoryboard
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
          previousRounds={battleLog.slice(0, currentRoundIdx).map(r => ({
            round: r.round,
            summary: `${r.attacker} attacked, ${r.defender} defended.`
          }))}
          roundStep={roundStep}
        />
      )}
      {winner && (
        <WinnerAnimation winner={winner} onDone={mode === 'replay' ? handleRestart : (() => { if (onBattleEnd && winner) onBattleEnd(winner); })} />
      )}
    </div>
  );
};

export default BattleViewer; 