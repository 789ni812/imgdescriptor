'use client';

import React, { useEffect } from 'react';
import { useFightingGameStore, type PreGeneratedBattleRound } from '@/lib/stores/fightingGameStore';
import HealthBar from '@/components/fighting/HealthBar';
import RoundStartAnimation from '@/components/fighting/RoundStartAnimation';
import WinnerAnimation from '@/components/fighting/WinnerAnimation';
import BattleStoryboard from '@/components/fighting/BattleStoryboard';
import { FighterImageUpload } from '@/components/fighting/FighterImageUpload';
import { ROUND_TRANSITION_PAUSE_MS, BATTLE_ATTACK_DEFENSE_STEP_MS } from '@/lib/constants';
import { godzillaVSbruceleeDemo } from '../../../public/vs/godzillaVSbrucelee/demoData';
import BattleViewer from '@/components/fighting/BattleViewer';

// Helper: demo fighters and scene
const demoFighterA = godzillaVSbruceleeDemo.fighterA;
const demoFighterB = godzillaVSbruceleeDemo.fighterB;
const demoScene = godzillaVSbruceleeDemo.scene;

function mapPreGeneratedToBattleRound(
  log: PreGeneratedBattleRound[],
  fighterA: any,
  fighterB: any
) {
  let healthA = fighterA?.stats?.health ?? 0;
  let healthB = fighterB?.stats?.health ?? 0;
  return log.map((r) => {
    // Apply damage to defender
    let attacker = r.attacker === fighterA.name ? 'A' : 'B';
    let defender = attacker === 'A' ? 'B' : 'A';
    if (attacker === 'A') {
      healthB = Math.max(0, healthB - (r.attackerDamage ?? 0));
    } else {
      healthA = Math.max(0, healthA - (r.attackerDamage ?? 0));
    }
    return {
      ...r,
      randomEvent: null,
      arenaObjectsUsed: null,
      healthAfter: {
        attacker: attacker === 'A' ? healthA : healthB,
        defender: defender === 'A' ? healthA : healthB,
      },
    };
  });
}

export default function PlayerVsPage() {
  // Zustand store selectors
  const {
    fighters,
    gamePhase,
    setGamePhase,
    fighterAHealth,
    fighterBHealth,
    combatLog,
    roundStep,
    setRoundStep,
    winner,
    showRoundAnim,
    setShowRoundAnim,
    updateHealthAndCommentary,
    resetGame,
    currentRound,
    maxRounds,
    setFighter,
    setScene,
    removeFighter,
    scene,
    setFighterHealth,
    setCurrentRound,
    preGeneratedBattleLog,
    currentBattleIndex,
    setPreGeneratedBattleLog,
    advanceBattleIndex,
    setWinner,
  } = useFightingGameStore();

  // Local state only for fighter/arena upload previews
  const [dmIntro, setDmIntro] = React.useState<string>('');

  // New: Pre-generated battle playback state
  const [isPreBattleLoading, setIsPreBattleLoading] = React.useState(false);
  const [preBattleError, setPreBattleError] = React.useState<string | null>(null);

  // Helper: get fighterA/fighterB from store
  const fighterA = fighters.fighterA;
  const fighterB = fighters.fighterB;

  // Helper: can start fight
  const canStartFight = fighterA && fighterB && scene;

  // Helper: determine winner based on remaining health
  const determineWinner = () => {
    if (!fighterA || !fighterB) return null;
    
    const healthA = fighterAHealth ?? fighterA.stats.health;
    const healthB = fighterBHealth ?? fighterB.stats.health;
    
    if (healthA <= 0 && healthB <= 0) {
      return 'Draw';
    } else if (healthA <= 0) {
      return fighterB.name;
    } else if (healthB <= 0) {
      return fighterA.name;
    } else {
      // Battle ended without knockout - determine winner by remaining health percentage
      const healthPercentA = (healthA / fighterA.stats.maxHealth) * 100;
      const healthPercentB = (healthB / fighterB.stats.maxHealth) * 100;
      
      if (Math.abs(healthPercentA - healthPercentB) < 5) {
        return 'Draw'; // Very close - it's a draw
      } else if (healthPercentA > healthPercentB) {
        return fighterA.name;
      } else {
        return fighterB.name;
      }
    }
  };

  function extractFighterName(analysis: Record<string, unknown>, fallback: string) {
    let name = fallback;
    if (analysis && analysis.description) {
      const desc = analysis.description as Record<string, unknown>;
      if (Array.isArray(desc.characters) && desc.characters.length > 0) {
        if (typeof desc.characters[0] === 'string') name = desc.characters[0];
        if (desc.characters[0] && typeof desc.characters[0].name === 'string') name = desc.characters[0].name;
      }
      if (typeof desc.main_character === 'string') name = desc.main_character;
      if (typeof desc.setting === 'string' && desc.setting.length < 32) name = desc.setting;
    }
    // Only take the first part before a dash or comma
    name = name.split('-')[0].split(',')[0].trim();
    return name.replace(/\s*\(.*?\)/g, '').replace(/\d+$/, '').trim();
  }

  function extractArenaName(analysis: Record<string, unknown>, fallback: string) {
    let name = fallback;
    if (analysis && analysis.description) {
      const desc = analysis.description as Record<string, unknown>;
      if (typeof desc.setting === 'string' && desc.setting.length < 32) name = desc.setting;
    }
    return name.replace(/\s*\(.*?\)/g, '').replace(/\d+$/, '').trim();
  }

  // Upload handlers now update Zustand store and replace the correct slot
  const handleFighterAUpload = async ({ url, analysis }: { url: string; analysis: Record<string, unknown> }) => {
    const fighterName = extractFighterName(analysis, 'Fighter A');
    const genRes = await fetch('/api/fighting-game/generate-fighter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageDescription: analysis.description || '',
        fighterId: 'fighterA',
        fighterLabel: fighterName,
        imageUrl: url,
      }),
    });
    if (!genRes.ok) {
      const errorText = await genRes.text();
      console.error('Failed to generate fighter:', errorText);
      // Optionally show a user-friendly error message here
      return;
    }
    const data = await genRes.json();
    if (data.fighter) {
      setFighter('fighterA', { ...data.fighter, imageUrl: url, id: `fighterA-${Date.now()}` });
    }
  };
  const handleFighterBUpload = async ({ url, analysis }: { url: string; analysis: Record<string, unknown> }) => {
    const fighterName = extractFighterName(analysis, 'Fighter B');
    const genRes = await fetch('/api/fighting-game/generate-fighter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageDescription: analysis.description || '',
        fighterId: 'fighterB',
        fighterLabel: fighterName,
        imageUrl: url,
      }),
    });
    if (!genRes.ok) {
      const errorText = await genRes.text();
      console.error('Failed to generate fighter:', errorText);
      // Optionally show a user-friendly error message here
      return;
    }
    const data = await genRes.json();
    if (data.fighter) {
      setFighter('fighterB', { ...data.fighter, imageUrl: url, id: `fighterB-${Date.now()}` });
    }
  };
  const handleArenaUpload = async ({ url, analysis }: { url: string; analysis: Record<string, unknown> }) => {
    const genRes = await fetch('/api/fighting-game/generate-fighter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageDescription: analysis.description || '',
        fighterId: 'arena',
        fighterLabel: extractArenaName(analysis, 'Arena'),
        imageUrl: url,
      }),
    });
    if (!genRes.ok) {
      const errorText = await genRes.text();
      console.error('Failed to generate arena:', errorText);
      // Optionally show a user-friendly error message here
      return;
    }
    const data = await genRes.json();
    if (data.fighter) {
      setScene({ ...data.fighter, imageUrl: url, id: `arena-${Date.now()}` });
    }
  };

  // Add a Reset to Demo button
  const handleResetToDemo = () => {
    resetGame();
    setFighter('fighterA', demoFighterA);
    setFighter('fighterB', demoFighterB);
    setScene(demoScene);
    setGamePhase('setup');
  };


  // New: Start fight with pre-generated battle log
  const handleBeginCombat = async () => {
    setIsPreBattleLoading(true);
    setPreBattleError(null);
    try {
      const fighterA = fighters.fighterA;
      const fighterB = fighters.fighterB;
      if (!fighterA || !fighterB || !scene) throw new Error('Missing fighters or scene');
      const res = await fetch('/api/fighting-game/generate-battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fighterA, fighterB, scene, maxRounds }),
      });
      const data = await res.json();
      if (!data.success || !Array.isArray(data.battleLog)) throw new Error('Failed to generate battle');
      setPreGeneratedBattleLog(data.battleLog as PreGeneratedBattleRound[]);
      setGamePhase('combat');
      setFighterHealth(fighterA.id, fighterA.stats.health);
      setFighterHealth(fighterB.id, fighterB.stats.health);
      setCurrentRound(1);
      setShowRoundAnim(true);
    } catch (err) {
      setPreBattleError((err as Error).message);
    } finally {
      setIsPreBattleLoading(false);
    }
  };

  // New: Playback logic for pre-generated rounds
  React.useEffect(() => {
    if (gamePhase !== 'combat' || preGeneratedBattleLog.length === 0) return;
    
    // Check if battle has ended
    if (currentBattleIndex >= preGeneratedBattleLog.length) {
      // Battle is over - determine winner and show animation
      const battleWinner = determineWinner();
      setWinner(battleWinner);
      setShowRoundAnim(true);
      return;
    }
    
    if (!showRoundAnim) {
      // Animate the round
      const roundData = preGeneratedBattleLog[currentBattleIndex];
      // Update health and commentary
      updateHealthAndCommentary({
        attackerId: fighters.fighterA?.name === roundData.attacker
          ? fighters.fighterA?.id ?? ''
          : fighters.fighterB?.id ?? '',
        defenderId: fighters.fighterA?.name === roundData.defender
          ? fighters.fighterA?.id ?? ''
          : fighters.fighterB?.id ?? '',
        attackerDamage: roundData.attackerDamage,
        defenderDamage: roundData.defenderDamage,
        attackCommentary: roundData.attackCommentary,
        defenseCommentary: roundData.defenseCommentary,
        round: roundData.round,
      });
      setRoundStep('attack');
      setTimeout(() => setRoundStep('defense'), BATTLE_ATTACK_DEFENSE_STEP_MS);
      setTimeout(() => {
        advanceBattleIndex();
        setCurrentRound(currentRound + 1);
        setShowRoundAnim(true);
      }, ROUND_TRANSITION_PAUSE_MS);
    }
  }, [gamePhase, preGeneratedBattleLog, currentBattleIndex, showRoundAnim]);

  // Auto-populate demo fighters and scene on mount
  useEffect(() => {
    // This useEffect is now handled by the React.useEffect below
  }, []);

  // Populate demo data on mount
  React.useEffect(() => {
    // Always populate demo data on mount if not already set
    if (!fighters.fighterA) {
      setFighter('fighterA', demoFighterA);
    }
    if (!fighters.fighterB) {
      setFighter('fighterB', demoFighterB);
    }
    if (!scene) {
      setScene(demoScene);
    }
  }, []);

  // Generate DM intro when phase changes to introduction
  React.useEffect(() => {
    if (gamePhase === 'introduction' && fighterA && fighterB && scene) {
      setDmIntro(
        `Welcome to the Castle Bridge! Tonight's epic duel features ${fighterA.name}, a ${fighterA.description.toLowerCase()} versus ${fighterB.name}, a ${fighterB.description.toLowerCase()}. The crowd is on the edge of their seats as these two legends face off in front of the ancient castle. Who will emerge victorious? Let the battle begin!`
      );
    }
  }, [gamePhase, fighterA, fighterB, scene]);

  // When a new round is added to combatLog, start with 'attack' step, then auto-advance to 'defense'
  useEffect(() => {
    if (gamePhase === 'combat' && combatLog.length > 0) {
      setRoundStep('attack');
      const timer = setTimeout(() => setRoundStep('defense'), BATTLE_ATTACK_DEFENSE_STEP_MS);
      return () => clearTimeout(timer);
    }
  }, [combatLog.length, gamePhase]);

  // Combat round logic
  // const handleNextRound = () => {
  //   if (!fighterA || !fighterB || !fighterAHealth || !fighterBHealth || isCombatOver) return;
  //   setShowRoundAnim(true);
  //   // setPendingNextRound(true); // This line is removed
  // };

  // Reset combat state on new game
  useEffect(() => {
    if (gamePhase === 'setup') {
      resetGame();
    }
  }, [gamePhase, resetGame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-8 gap-8">
          {/* Fighter A */}
          <div className="flex-1 flex flex-col items-center">
            {fighterA ? (
              <>
                <img src={fighterA.imageUrl} alt={fighterA.name} className="w-24 h-24 object-cover rounded-lg border-4 border-red-700 shadow-lg" />
                <div className="mt-2 text-lg font-bold">{fighterA.name}</div>
                <HealthBar current={fighterAHealth ?? 0} max={fighterA?.stats.maxHealth ?? 1} color="red" />
                <div className="text-xs mt-1">Health: {fighterAHealth} / {fighterA?.stats.maxHealth}</div>
                <button onClick={() => removeFighter('fighterA')} className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs">Remove Fighter</button>
              </>
            ) : (
              <FighterImageUpload onUploadComplete={handleFighterAUpload} label="Upload image for Fighter A" category="fighter" />
            )}
          </div>
          {/* VS */}
          <div className="text-3xl font-extrabold text-yellow-400 mx-6">vs</div>
          {/* Fighter B */}
          <div className="flex-1 flex flex-col items-center">
            {fighterB ? (
              <>
                <img src={fighterB.imageUrl} alt={fighterB.name} className="w-24 h-24 object-cover rounded-lg border-4 border-blue-700 shadow-lg" />
                <div className="mt-2 text-lg font-bold">{fighterB.name}</div>
                <HealthBar current={fighterBHealth ?? 0} max={fighterB?.stats.maxHealth ?? 1} color="blue" />
                <div className="text-xs mt-1">Health: {fighterBHealth} / {fighterB?.stats.maxHealth}</div>
                <button onClick={() => removeFighter('fighterB')} className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs">Remove Fighter</button>
              </>
            ) : (
              <FighterImageUpload onUploadComplete={handleFighterBUpload} label="Upload image for Fighter B" category="fighter" />
            )}
          </div>
        </div>

        {/* Setup Phase */}
        {gamePhase === 'setup' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Upload Your Fighters</h2>
              <p className="text-gray-300">Upload images of two fighters and a battle arena</p>
            </div>

            {/* Fighter Upload Sections */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                {!fighterA ? (
                  <FighterImageUpload onUploadComplete={handleFighterAUpload} label="Upload image for Fighter A" category="fighter" />
                ) : (
                  // Existing fighter summary UI for Fighter A
                  <div className="bg-green-900/20 backdrop-blur-sm rounded-lg p-4 border border-green-500/30">
                    {fighterA.imageUrl && (
                      <img src={fighterA.imageUrl} alt={fighterA.name} className="w-32 h-32 object-cover rounded border-2 border-green-400 mb-2" />
                    )}
                    <h4 className="text-lg font-semibold text-green-400 mb-3">{fighterA.name}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Health: {fighterA.stats.health}</div>
                      <div>Strength: {fighterA.stats.strength}</div>
                      <div>Luck: {fighterA.stats.luck}</div>
                      <div>Agility: {fighterA.stats.agility}</div>
                      <div>Defense: {fighterA.stats.defense}</div>
                      <div>Size: {fighterA.stats.size}</div>
                    </div>
                    <div className="mt-3 text-xs text-gray-300">
                      <p><strong>Build:</strong> {fighterA.stats.build}</p>
                      <p><strong>Age:</strong> {fighterA.visualAnalysis.age}</p>
                    </div>
                    <button
                      onClick={() => removeFighter('fighterA')}
                      className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                    >
                      Remove Fighter
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                {!fighterB ? (
                  <FighterImageUpload onUploadComplete={handleFighterBUpload} label="Upload image for Fighter B" category="fighter" />
                ) : (
                  // Existing fighter summary UI for Fighter B
                  <div className="bg-green-900/20 backdrop-blur-sm rounded-lg p-4 border border-green-500/30">
                    {fighterB.imageUrl && (
                      <img src={fighterB.imageUrl} alt={fighterB.name} className="w-32 h-32 object-cover rounded border-2 border-green-400 mb-2" />
                    )}
                    <h4 className="text-lg font-semibold text-green-400 mb-3">{fighterB.name}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Health: {fighterB.stats.health}</div>
                      <div>Strength: {fighterB.stats.strength}</div>
                      <div>Luck: {fighterB.stats.luck}</div>
                      <div>Agility: {fighterB.stats.agility}</div>
                      <div>Defense: {fighterB.stats.defense}</div>
                      <div>Size: {fighterB.stats.size}</div>
                    </div>
                    <div className="mt-3 text-xs text-gray-300">
                      <p><strong>Build:</strong> {fighterB.stats.build}</p>
                      <p><strong>Age:</strong> {fighterB.visualAnalysis.age}</p>
                    </div>
                    <button
                      onClick={() => removeFighter('fighterB')}
                      className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                    >
                      Remove Fighter
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Battle Arena Upload */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/20 mt-8">
              <h3 className="text-xl font-semibold mb-4">Battle Arena</h3>
              {!scene ? (
                <FighterImageUpload onUploadComplete={handleArenaUpload} label="Upload image of the fighting scene" category="arena" />
              ) : (
                <div className="flex flex-col items-center mb-2">
                  {typeof scene.imageUrl === 'string' && scene.imageUrl !== '' && (
                    <img src={scene.imageUrl} alt={typeof scene.name === 'string' ? scene.name : ''} className="w-32 h-32 object-cover rounded border-2 border-yellow-400 mb-2" />
                  )}
                  <div className="text-lg font-bold text-yellow-300 mb-1">{typeof scene.name === 'string' ? scene.name : ''}</div>
                  <div className="text-xs text-gray-300 mb-2">{typeof scene.description === 'string' ? scene.description : ''}</div>
                  <button
                    onClick={() => resetGame()}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                  >
                    Remove Arena
                  </button>
                </div>
              )}
            </div>

            {/* Start Fight Button */}
            <div className="text-center">
              <button
                className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
                  canStartFight && !isPreBattleLoading
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!canStartFight || isPreBattleLoading}
                onClick={() => {
                  if (canStartFight && !isPreBattleLoading) {
                    handleBeginCombat();
                  }
                }}
              >
                {isPreBattleLoading ? 'Generating Battle...' : 'Start Fight'}
              </button>
              {isPreBattleLoading && (
                <div className="mt-4 text-yellow-300 text-lg font-semibold animate-pulse">Generating Battle...</div>
              )}
            </div>
          </div>
        )}

        {/* Introduction Phase */}
        {gamePhase === 'introduction' && fighterA && fighterB && scene && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex flex-col items-center">
                <img src={fighterA.imageUrl} alt={fighterA.name} className="w-40 h-40 object-cover rounded-lg border-4 border-red-700 shadow-lg" />
                <h3 className="mt-2 text-lg font-bold">{fighterA.name}</h3>
              </div>
              <div className="flex flex-col items-center">
                <img src={typeof scene?.imageUrl === 'string' ? scene.imageUrl : ''} alt={typeof scene?.name === 'string' ? scene.name : ''} className="w-64 h-40 object-cover rounded-lg border-4 border-yellow-700 shadow-lg" />
                <h3 className="mt-2 text-lg font-bold">{typeof scene?.name === 'string' ? scene.name : ''}</h3>
              </div>
              <div className="flex flex-col items-center">
                <img src={fighterB.imageUrl} alt={fighterB.name} className="w-40 h-40 object-cover rounded-lg border-4 border-blue-700 shadow-lg" />
                <h3 className="mt-2 text-lg font-bold">{fighterB.name}</h3>
              </div>
            </div>
            <div className="bg-black/30 rounded-lg p-6 border border-white/20 text-center text-xl font-semibold shadow-xl">
              {dmIntro}
            </div>
            <div className="text-center">
              <button
                className="px-8 py-3 rounded-lg font-semibold text-lg bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setGamePhase('combat')}
              >
                Begin Combat
              </button>
            </div>
          </div>
        )}

        {/* Combat Phase: Use BattleViewer for animated battle */}
        {gamePhase === 'combat' && fighterA && fighterB && scene && preGeneratedBattleLog.length > 0 && (
          <BattleViewer
            fighterA={fighterA}
            fighterB={fighterB}
            scene={scene}
            battleLog={mapPreGeneratedToBattleRound(preGeneratedBattleLog, fighterA, fighterB)}
            mode="live"
            onBattleEnd={setWinner}
          />
        )}

        {/* When a new round is added to combatLog, start with 'attack' step, then auto-advance to 'defense' */}
        {gamePhase === 'combat' && combatLog.length > 0 && (
          <RoundStartAnimation 
            round={currentRound} 
            onDone={() => {
              setRoundStep('attack');
              setTimeout(() => setRoundStep('defense'), BATTLE_ATTACK_DEFENSE_STEP_MS);
              setTimeout(() => {
                advanceBattleIndex();
                setCurrentRound(currentRound + 1);
              }, ROUND_TRANSITION_PAUSE_MS);
            }} 
          />
        )}

        {/* Winner Animation */}
        {winner && (
          <WinnerAnimation 
            winner={winner} 
            onDone={() => { resetGame(); setGamePhase('setup'); }}
            fighterAHealth={fighterAHealth ?? undefined}
            fighterBHealth={fighterBHealth ?? undefined}
          />
        )}
      </div>
      <button onClick={handleResetToDemo} className="fixed top-4 right-4 z-50 px-4 py-2 bg-blue-700 text-white rounded shadow">Reset to Demo</button>
    </div>
  );
}