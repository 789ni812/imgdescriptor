'use client';

import React, { useEffect } from 'react';
import { useFightingGameStore, type PreGeneratedBattleRound } from '@/lib/stores/fightingGameStore';
import HealthBar from '@/components/fighting/HealthBar';
import { FighterImageUpload } from '@/components/fighting/FighterImageUpload';
import ChooseExistingFighter from '@/components/fighting/ChooseExistingFighter';
import ChooseExistingArena from '@/components/fighting/ChooseExistingArena';
import RebalanceFightersButton from '@/components/fighting/RebalanceFightersButton';
import FighterStatDisplay from '@/components/fighting/FighterStatDisplay';
import BattleViewer from '@/components/fighting/BattleViewer';
import WinnerAnimation from '@/components/fighting/WinnerAnimation';
import RoundStartAnimation from '@/components/fighting/RoundStartAnimation';
import { Fighter, Scene, CombatEvent } from '@/lib/stores/fightingGameStore';
import { generateBattleCommentary, generateBattleSummary } from '@/lib/lmstudio-client';
import { ROUND_TRANSITION_PAUSE_MS, BATTLE_ATTACK_DEFENSE_STEP_MS } from '@/lib/constants';

// Type alias to avoid conflicts with other BattleRound interfaces
type WinnerAnimationBattleRound = PreGeneratedBattleRound;

function mapPreGeneratedToBattleRound(
  log: PreGeneratedBattleRound[]
): WinnerAnimationBattleRound[] {
  let healthA = 0;
  let healthB = 0;
  
  return log.map((r) => {
    // Calculate health after this round
    if (r.attacker === 'Fighter A' || r.attacker === 'fighterA') {
      healthB = Math.max(0, healthB - (r.attackerDamage || 0));
      healthA = Math.max(0, healthA - (r.defenderDamage || 0));
    } else {
      healthA = Math.max(0, healthA - (r.attackerDamage || 0));
      healthB = Math.max(0, healthB - (r.defenderDamage || 0));
    }
    
    return {
      round: r.round,
      attacker: r.attacker,
      defender: r.defender,
      attackCommentary: r.attackCommentary,
      defenseCommentary: r.defenseCommentary,
      attackerDamage: r.attackerDamage,
      defenderDamage: r.defenderDamage,
      randomEvent: null, // PreGeneratedBattleRound doesn't have this field
      arenaObjectsUsed: null, // PreGeneratedBattleRound doesn't have this field
      healthAfter: {
        attacker: healthA,
        defender: healthB,
      },
    };
  });
}

function mapFighterMetadataToFighter(meta: any): Fighter {
  // Ensure we have a valid image filename
  const imageFilename = meta.image && meta.image.trim() !== '' ? meta.image : null;
  
  return {
    id: meta.id,
    name: meta.name,
    imageUrl: imageFilename ? `/imgRepository/${imageFilename}` : '',
    description: meta.description || '',
    stats: {
      health: meta.stats.health,
      maxHealth: meta.stats.maxHealth,
      strength: meta.stats.strength,
      luck: meta.stats.luck,
      agility: meta.stats.agility,
      defense: meta.stats.defense,
      age: meta.stats.age,
      size: meta.stats.size,
      build: meta.stats.build,
      magic: meta.stats.magic,
      ranged: meta.stats.ranged,
      intelligence: meta.stats.intelligence,
      uniqueAbilities: meta.stats.uniqueAbilities,
    },
    visualAnalysis: meta.visualAnalysis || {
      age: '',
      size: '',
      build: '',
      appearance: [],
      weapons: [],
      armor: []
    },
    combatHistory: meta.combatHistory || [],
    winLossRecord: meta.winLossRecord || { wins: 0, losses: 0, draws: 0 },
    createdAt: meta.createdAt || new Date().toISOString()
  };
}

function mapArenaMetadataToScene(meta: { id: string; name: string; image: string; description?: string; environmentalObjects?: string[]; createdAt?: string }): Scene {
  return {
    id: meta.id,
    name: meta.name,
    imageUrl: meta.image ? `/vs/arena/${meta.image}` : '',
    description: meta.description || '',
    environmentalObjects: meta.environmentalObjects || [],
    createdAt: meta.createdAt || new Date().toISOString(),
  };
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
  const [fighterASelectMode, setFighterASelectMode] = React.useState<'upload' | 'choose'>('upload');
  const [fighterBSelectMode, setFighterBSelectMode] = React.useState<'upload' | 'choose'>('upload');
  const [arenaSelectMode, setArenaSelectMode] = React.useState<'upload' | 'choose'>('upload');

  // New: Pre-generated battle playback state
  const [isPreBattleLoading, setIsPreBattleLoading] = React.useState(false);
  const [battleError, setBattleError] = React.useState<string | null>(null);

  const [battleSummary, setBattleSummary] = React.useState<string | null>(null);


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
    
    // Prepare arena context if available
    const arenaContext = scene ? {
      name: scene.name,
      description: scene.description || '',
      environmentalObjects: scene.environmentalObjects || []
    } : undefined;
    
    const genRes = await fetch('/api/fighting-game/generate-fighter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageDescription: analysis.description || '',
        fighterId: 'fighterA',
        fighterLabel: fighterName,
        imageUrl: url,
        arenaContext,
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
      const fighter = { ...data.fighter, imageUrl: url, id: `fighterA-${Date.now()}` };
      
      // Save fighter metadata JSON
      const imageFilename = url.split('/').pop();
      await fetch('/api/save-fighter-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageFilename,
          name: fighter.name,
          stats: fighter.stats,
        }),
      });
      
      setFighter('fighterA', fighter);
    }
  };
  const handleFighterBUpload = async ({ url, analysis }: { url: string; analysis: Record<string, unknown> }) => {
    const fighterName = extractFighterName(analysis, 'Fighter B');
    
    // Prepare arena context if available
    const arenaContext = scene ? {
      name: scene.name,
      description: scene.description || '',
      environmentalObjects: scene.environmentalObjects || []
    } : undefined;
    
    const genRes = await fetch('/api/fighting-game/generate-fighter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageDescription: analysis.description || '',
        fighterId: 'fighterB',
        fighterLabel: fighterName,
        imageUrl: url,
        arenaContext,
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
      const fighter = { ...data.fighter, imageUrl: url, id: `fighterB-${Date.now()}` };
      
      // Save fighter metadata JSON
      const imageFilename = url.split('/').pop();
      await fetch('/api/save-fighter-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageFilename,
          name: fighter.name,
          stats: fighter.stats,
        }),
      });
      
      setFighter('fighterB', fighter);
    }
  };
  const handleArenaUpload = async ({ url, analysis }: { url: string; analysis: Record<string, unknown> }) => {
    // Generate arena name and description
    const arenaName = extractArenaName(analysis, 'Arena');
    let description = '';
    if (analysis && typeof analysis.description === 'string') {
      description = analysis.description;
    } else if (analysis && typeof analysis.description === 'object' && analysis.description !== null && 'description' in analysis.description && typeof (analysis.description as Record<string, unknown>).description === 'string') {
      description = (analysis.description as Record<string, unknown>).description as string;
    }
    // Save arena metadata JSON
    const imageFilename = url.split('/').pop();
    await fetch('/api/save-arena-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageFilename,
        name: arenaName,
        description,
        environmentalObjects: [], // You can enhance this if you extract objects from analysis
      }),
    });

    // Optionally, you can fetch/generate more arena details here
    setScene(mapArenaMetadataToScene({
      id: imageFilename?.replace(/\.jpg$|\.png$|\.jpeg$/i, '') || `arena-${Date.now()}`,
      name: arenaName,
      image: imageFilename || '',
      description: description,
      environmentalObjects: [],
      createdAt: new Date().toISOString(),
    }));
  };

  // New: Start fight with pre-generated battle log
  const handleBeginCombat = async () => {
    console.log('handleBeginCombat: Starting...');
    setIsPreBattleLoading(true);
    setBattleError(null);
    try {
      const fighterA = fighters.fighterA;
      const fighterB = fighters.fighterB;
      console.log('handleBeginCombat: Fighters and scene check...', { fighterA: fighterA?.name, fighterB: fighterB?.name, scene: scene?.name });
      if (!fighterA || !fighterB || !scene) throw new Error('Missing fighters or scene. Please upload/select two fighters and an arena.');
      
      console.log('handleBeginCombat: Making API call...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const res = await fetch('/api/fighting-game/generate-battle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fighterA, fighterB, scene, maxRounds }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        console.log('handleBeginCombat: API response received, status:', res.status);
        
        const data = await res.json();
        console.log('handleBeginCombat: JSON parsed, data:', { success: data.success, battleLogLength: data.battleLog?.length });
        
        if (!data.success || !Array.isArray(data.battleLog) || data.battleLog.length === 0) {
          throw new Error('Could not generate battle. Please check your fighters and arena, and try again.');
        }
        
        console.log('handleBeginCombat: Setting preGeneratedBattleLog...');
        setPreGeneratedBattleLog(data.battleLog as PreGeneratedBattleRound[]);
        console.log('handleBeginCombat: Setting gamePhase to combat...');
        setGamePhase('combat');
        console.log('handleBeginCombat: Setting fighter health...');
        setFighterHealth(fighterA.id, fighterA.stats.health);
        setFighterHealth(fighterB.id, fighterB.stats.health);
        console.log('handleBeginCombat: Setting current round...');
        setCurrentRound(1);
        console.log('handleBeginCombat: Setting show round anim...');
        setShowRoundAnim(true);
        console.log('handleBeginCombat: All state updates completed successfully');
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Battle generation timed out. Please try again.');
        }
        throw fetchError;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error during battle generation.';
      console.error('handleBeginCombat: Error caught:', err);
      setBattleError(msg);
      setTimeout(() => setBattleError(null), 6000);
      // Log error for E2E and debugging
      console.error('Battle generation error:', err);
    } finally {
      console.log('handleBeginCombat: Finally block - setting isPreBattleLoading to false');
      setIsPreBattleLoading(false);
    }
  };

  // New: Playback logic for pre-generated rounds
  React.useEffect(() => {
    console.log('Playervs: Playback effect triggered', {
      gamePhase,
      preGeneratedBattleLogLength: preGeneratedBattleLog?.length ?? 0,
      currentBattleIndex,
      showRoundAnim
    });

    if (gamePhase !== 'combat' || preGeneratedBattleLog.length === 0) return;
    
    // Check if battle has ended
    if (currentBattleIndex >= preGeneratedBattleLog.length) {
      // Battle is over - determine winner and show animation
      const battleWinner = determineWinner();
      console.log('Playervs: Battle ended, winner:', battleWinner);
      setWinner(battleWinner);
      setShowRoundAnim(true);
      return;
    }
    
    if (!showRoundAnim) {
      // Animate the round
      const roundData = preGeneratedBattleLog[currentBattleIndex];
      console.log('Playervs: Animating round', roundData.round);
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
        console.log('Playervs: Round animation complete, advancing to next round');
        advanceBattleIndex();
        setCurrentRound(currentRound + 1);
        setShowRoundAnim(true);
      }, ROUND_TRANSITION_PAUSE_MS);
    }
  }, [gamePhase, preGeneratedBattleLog, currentBattleIndex, showRoundAnim]);

  // Reset combat state on new game
  useEffect(() => {
    if (gamePhase === 'setup') {
      // Only reset combat state, not demo fighters
      setPreGeneratedBattleLog([]);
      setCurrentRound(1);
      setWinner(null);
      setShowRoundAnim(false);
      setRoundStep('attack');
      setBattleSummary(null);
      setBattleError(null);
      setIsPreBattleLoading(false);
    }
  }, [gamePhase, setPreGeneratedBattleLog, setCurrentRound, setWinner, setShowRoundAnim, setRoundStep]);

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

  // When winner is set, generate tournament overview and battle summary
  React.useEffect(() => {
    async function generateSummaries() {
      if (winner && fighterA && fighterB && scene && preGeneratedBattleLog.length > 0) {
        // Battle Summary
        const summary = await generateBattleSummary(
          fighterA.name,
          fighterB.name,
          winner,
          mapPreGeneratedToBattleRound(preGeneratedBattleLog),
          preGeneratedBattleLog.length
        );
        setBattleSummary(summary);
      } else {
        setBattleSummary(null);
      }
    }
    generateSummaries();
  }, [winner, fighterA, fighterB, scene, preGeneratedBattleLog]);

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
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 text-white" data-testid="playervs-page">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-8 gap-8" data-testid="fighters-header">
          {/* Fighter A */}
          <div className="flex-1 flex flex-col items-center" data-testid="fighter-a-container">
            {fighterA ? (
              <>
                <img src={fighterA.imageUrl} alt={fighterA.name} className="w-24 h-24 object-cover rounded-lg border-4 border-red-700 shadow-lg" data-testid="fighter-a-image" />
                <div className="mt-2 text-lg font-bold" data-testid="fighter-a-name">{fighterA.name}</div>
                <HealthBar current={fighterAHealth ?? 0} max={fighterA?.stats.maxHealth ?? 1} color="red" data-testid="fighter-a-health-bar" />
                <div className="text-xs mt-1" data-testid="fighter-a-health-text">Health: {fighterAHealth} / {fighterA?.stats.maxHealth}</div>
                <button onClick={() => removeFighter('fighterA')} className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs" data-testid="remove-fighter-a-btn">Remove Fighter</button>
              </>
            ) : (
              <FighterImageUpload onUploadComplete={handleFighterAUpload} label="Upload image for Fighter A" category="fighter" data-testid="fighter-a-upload" />
            )}
          </div>
          {/* VS */}
          <div className="text-3xl font-extrabold text-yellow-400 mx-6" data-testid="vs-text">vs</div>
          {/* Fighter B */}
          <div className="flex-1 flex flex-col items-center" data-testid="fighter-b-container">
            {fighterB ? (
              <>
                <img src={fighterB.imageUrl} alt={fighterB.name} className="w-24 h-24 object-cover rounded-lg border-4 border-blue-700 shadow-lg" data-testid="fighter-b-image" />
                <div className="mt-2 text-lg font-bold" data-testid="fighter-b-name">{fighterB.name}</div>
                <HealthBar current={fighterBHealth ?? 0} max={fighterB?.stats.maxHealth ?? 1} color="blue" data-testid="fighter-b-health-bar" />
                <div className="text-xs mt-1" data-testid="fighter-b-health-text">Health: {fighterBHealth} / {fighterB?.stats.maxHealth}</div>
                <button onClick={() => removeFighter('fighterB')} className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs" data-testid="remove-fighter-b-btn">Remove Fighter</button>
              </>
            ) : (
              <FighterImageUpload onUploadComplete={handleFighterBUpload} label="Upload image for Fighter B" category="fighter" data-testid="fighter-b-upload" />
            )}
          </div>
        </div>

        {/* Setup Phase */}
        {gamePhase === 'setup' && (
          <div className="space-y-8" data-testid="setup-phase">
            {/* Debug Panel - Remove this after fixing the issue */}
            <div className="bg-yellow-900/20 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30 text-yellow-200 text-sm" data-testid="debug-panel">
              <h4 className="font-semibold mb-2">Debug Info:</h4>
              <div>Game Phase: {gamePhase}</div>
              <div>PreBattle Loading: {isPreBattleLoading ? 'true' : 'false'}</div>
              <div>Battle Log Length: {preGeneratedBattleLog?.length ?? 0}</div>
              <div>Fighter A: {fighterA ? fighterA.name : 'null'}</div>
              <div>Fighter B: {fighterB ? fighterB.name : 'null'}</div>
              <div>Scene: {scene ? scene.name : 'null'}</div>
              {battleError && <div className="text-red-300">Error: {battleError}</div>}
            </div>
            {/* Rebalance Fighters Button */}
            <div className="flex justify-center" data-testid="rebalance-section">
              <RebalanceFightersButton />
            </div>
            <div className="text-center" data-testid="setup-instructions">
              <h2 className="text-2xl font-semibold mb-4" data-testid="setup-title">Set Up Your Battle</h2>
              <p className="text-gray-300" data-testid="setup-description">First choose your arena, then select your fighters</p>
            </div>

            {/* Step 1: Battle Arena Upload */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</div>
                <h3 className="text-xl font-semibold">Battle Arena</h3>
              </div>
              {!scene ? (
                <>
                  <div className="flex gap-2 mb-2">
                    <button
                      className={`px-3 py-1 rounded ${arenaSelectMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                      onClick={() => setArenaSelectMode('upload')}
                    >
                      Upload New
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${arenaSelectMode === 'choose' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                      onClick={() => setArenaSelectMode('choose')}
                    >
                      Choose Existing
                    </button>
                  </div>
                  {arenaSelectMode === 'upload' ? (
                    <FighterImageUpload onUploadComplete={handleArenaUpload} label="Upload image of the fighting scene" category="arena" />
                  ) : (
                    <ChooseExistingArena onSelect={(arena) => setScene(mapArenaMetadataToScene(arena))} />
                  )}
                </>
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

            {/* Step 2: Fighter Upload Sections */}
            <div className="grid md:grid-cols-2 gap-8 mb-8" data-testid="fighter-upload-sections">
              {/* Fighter A Card */}
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/20" data-testid="fighter-a-card">
                <div className="flex items-center mb-4">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</div>
                  <h3 className="text-lg font-semibold">Fighter A</h3>
                </div>
                {!fighterA ? (
                  <>
                    <div className="flex gap-2 mb-2" data-testid="fighter-a-select-mode">
                      <button
                        className={`px-3 py-1 rounded ${fighterASelectMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                        onClick={() => setFighterASelectMode('upload')}
                        data-testid="fighter-a-upload-btn"
                      >
                        Upload New
                      </button>
                      <button
                        className={`px-3 py-1 rounded ${fighterASelectMode === 'choose' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                        onClick={() => setFighterASelectMode('choose')}
                        data-testid="fighter-a-choose-btn"
                      >
                        Choose Existing
                      </button>
                    </div>
                    {fighterASelectMode === 'upload' ? (
                      <FighterImageUpload onUploadComplete={handleFighterAUpload} label="Upload image for Fighter A" category="fighter" data-testid="fighter-a-upload-component" />
                    ) : (
                      <ChooseExistingFighter onSelect={(fighter) => setFighter('fighterA', mapFighterMetadataToFighter(fighter))} data-testid="fighter-a-choose-component" />
                    )}
                  </>
                ) : (
                  // Existing fighter summary UI for Fighter A
                  <FighterStatDisplay fighter={fighterA} onRemove={() => removeFighter('fighterA')} />
                )}
              </div>

              {/* Fighter B Card */}
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/20" data-testid="fighter-b-card">
                <div className="flex items-center mb-4">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</div>
                  <h3 className="text-lg font-semibold">Fighter B</h3>
                </div>
                {!fighterB ? (
                  <>
                    <div className="flex gap-2 mb-2" data-testid="fighter-b-select-mode">
                      <button
                        className={`px-3 py-1 rounded ${fighterBSelectMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                        onClick={() => setFighterBSelectMode('upload')}
                        data-testid="fighter-b-upload-btn"
                      >
                        Upload New
                      </button>
                      <button
                        className={`px-3 py-1 rounded ${fighterBSelectMode === 'choose' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                        onClick={() => setFighterBSelectMode('choose')}
                        data-testid="fighter-b-choose-btn"
                      >
                        Choose Existing
                      </button>
                    </div>
                    {fighterBSelectMode === 'upload' ? (
                      <FighterImageUpload onUploadComplete={handleFighterBUpload} label="Upload image for Fighter B" category="fighter" data-testid="fighter-b-upload-component" />
                    ) : (
                      <ChooseExistingFighter onSelect={(fighter) => setFighter('fighterB', mapFighterMetadataToFighter(fighter))} data-testid="fighter-b-choose-component" />
                    )}
                  </>
                ) : (
                  // Existing fighter summary UI for Fighter B
                  <FighterStatDisplay fighter={fighterB} onRemove={() => removeFighter('fighterB')} />
                )}
              </div>
            </div>

            {/* Start Fight Button */}
            <div className="text-center">
              {battleError && (
                <div className="mb-4 p-3 bg-red-900/80 border border-red-500/40 text-red-200 rounded-lg font-semibold animate-pulse">
                  {battleError}
                </div>
              )}
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
            {/* Debug Panel - Remove this after fixing the issue */}
            <div className="bg-yellow-900/20 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30 text-yellow-200 text-sm">
              <h4 className="font-semibold mb-2">Debug Info (Intro):</h4>
              <div>Game Phase: {gamePhase}</div>
              <div>PreBattle Loading: {isPreBattleLoading ? 'true' : 'false'}</div>
              <div>Battle Log Length: {preGeneratedBattleLog.length}</div>
              <div>Fighter A: {fighterA ? fighterA.name : 'null'}</div>
              <div>Fighter B: {fighterB ? fighterB.name : 'null'}</div>
              <div>Scene: {scene ? scene.name : 'null'}</div>
              {battleError && <div className="text-red-300">Error: {battleError}</div>}
            </div>
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
          <>
            {/* Debug Panel - Remove this after fixing the issue */}
            <div className="bg-yellow-900/20 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30 text-yellow-200 text-sm mb-4">
              <h4 className="font-semibold mb-2">Debug Info (Combat):</h4>
              <div>Game Phase: {gamePhase}</div>
              <div>PreBattle Loading: {isPreBattleLoading ? 'true' : 'false'}</div>
              <div>Battle Log Length: {preGeneratedBattleLog.length}</div>
              <div>Current Battle Index: {currentBattleIndex}</div>
              <div>Show Round Anim: {showRoundAnim ? 'true' : 'false'}</div>
              <div>Winner: {winner || 'null'}</div>
              <div>Fighter A: {fighterA ? fighterA.name : 'null'}</div>
              <div>Fighter B: {fighterB ? fighterB.name : 'null'}</div>
              <div>Scene: {scene ? scene.name : 'null'}</div>
              {battleError && <div className="text-red-300">Error: {battleError}</div>}
            </div>
            <BattleViewer
              fighterA={fighterA}
              fighterB={fighterB}
              scene={scene}
              battleLog={mapPreGeneratedToBattleRound(preGeneratedBattleLog)}
              mode="live"
              onBattleEnd={setWinner}
            />
          </>
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
        {winner && fighterA && fighterB && scene && (
          <WinnerAnimation 
            isOpen={true}
            onClose={() => { resetGame(); setGamePhase('setup'); }}
            winner={winner}
            fighterA={fighterA}
            fighterB={fighterB}
            scene={scene}
            battleLog={mapPreGeneratedToBattleRound(preGeneratedBattleLog)}
            battleSummary={battleSummary || 'Battle completed.'}
          />
        )}
      </div>
    </div>
  );
}