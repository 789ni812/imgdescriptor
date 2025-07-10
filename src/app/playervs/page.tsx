'use client';

import React, { useEffect } from 'react';
import { useFightingGameStore, type CombatLogEntry, type Fighter, type Scene } from '@/lib/stores/fightingGameStore';
import HealthBar from '@/components/fighting/HealthBar';
import RoundStartAnimation from '@/components/fighting/RoundStartAnimation';
import WinnerAnimation from '@/components/fighting/WinnerAnimation';
import BattleStoryboard from '@/components/fighting/BattleStoryboard';
import { FighterImageUpload } from '@/components/fighting/FighterImageUpload';

// Helper: demo fighters and scene
const demoFighterA: Fighter = {
  id: 'darth-1',
  name: 'Darth Vader',
  imageUrl: '/vs/starWars1/Darth-1.jpg',
  description: 'A tall, armored figure with a black helmet and cape. Wields a red lightsaber. Strong, intimidating, and experienced.',
  stats: {
    health: 180,
    maxHealth: 180,
    strength: 19,
    luck: 12,
    agility: 10,
    defense: 18,
    age: 45,
    size: 'large',
    build: 'muscular',
  },
  visualAnalysis: {
    age: 'adult',
    size: 'large',
    build: 'muscular',
    appearance: ['armored', 'helmeted', 'intimidating'],
    weapons: ['red lightsaber'],
    armor: ['black armor'],
  },
  combatHistory: [],
  winLossRecord: { wins: 0, losses: 0, draws: 0 },
  createdAt: new Date().toISOString(),
};
const demoFighterB: Fighter = {
  id: 'luke-1',
  name: 'Luke Skywalker',
  imageUrl: '/vs/starWars1/luke-1.jpg',
  description: 'A young man in white robes wielding a blue lightsaber. Agile, determined, and hopeful.',
  stats: {
    health: 130,
    maxHealth: 130,
    strength: 14,
    luck: 16,
    agility: 18,
    defense: 10,
    age: 22,
    size: 'medium',
    build: 'average',
  },
  visualAnalysis: {
    age: 'young',
    size: 'medium',
    build: 'average',
    appearance: ['determined', 'hopeful'],
    weapons: ['blue lightsaber'],
    armor: [],
  },
  combatHistory: [],
  winLossRecord: { wins: 0, losses: 0, draws: 0 },
  createdAt: new Date().toISOString(),
};
const demoScene: Scene = {
  id: 'scene-castle-1',
  name: 'Castle Bridge',
  imageUrl: '/vs/starWars1/scene-castle-1.jpg',
  description: 'A stone castle with a moat and a wooden bridge. The perfect place for an epic duel.',
  environmentalObjects: ['bridge', 'moat', 'castle walls'],
  createdAt: new Date().toISOString(),
};

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
    isLLMGenerating,
    setIsLLMGenerating,
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
  } = useFightingGameStore();

  // Local state only for fighter/arena upload previews
  const [dmIntro, setDmIntro] = React.useState<string>('');

  // Helper: get fighterA/fighterB from store
  const fighterA = fighters.fighterA;
  const fighterB = fighters.fighterB;

  // Helper: can start fight
  const canStartFight = fighterA && fighterB && scene;

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


  // Begin combat handler
  const handleBeginCombat = () => {
    setGamePhase('combat');
    if (fighterA && fighterB) {
      setFighterHealth(fighterA.id, fighterA.stats.health);
      setFighterHealth(fighterB.id, fighterB.stats.health);
    }
    setCurrentRound(1); // Start at round 1
    setShowRoundAnim(true);
  };

  // Run round logic after animation
  const runRoundLogic = async () => {
    setShowRoundAnim(false); // Ensure animation can retrigger for next round
    if (!fighterA || !fighterB || !fighterAHealth || !fighterBHealth || winner || currentRound > maxRounds) return;
    setIsLLMGenerating(true);
    setTimeout(async () => {
      const attacker = currentRound % 2 === 1 ? fighterA : fighterB;
      const defender = currentRound % 2 === 1 ? fighterB : fighterA;

      const attackerStats = attacker.stats;
      const defenderStats = defender.stats;
      const aRoll = Math.floor(Math.random() * 20) + 1 + attackerStats.strength;
      const dRoll = Math.floor(Math.random() * 20) + 1 + defenderStats.strength;
      let aDamage = Math.max(0, aRoll - defenderStats.defense);
      let dDamage = Math.max(0, dRoll - attackerStats.defense);
      if (Math.random() < defenderStats.luck / 40) aDamage = 0;
      if (Math.random() < attackerStats.luck / 40) dDamage = 0;
      // Build LLM prompt
      const prompt = `You are a witty, energetic fight commentator for a manga-style battle game.\n\nFighter A: ${fighterA.name}\n- Appearance: ${fighterA.description}\nFighter B: ${fighterB.name}\n- Appearance: ${fighterB.description}\nScene: ${scene?.name} (${scene?.description})\n\nRound ${currentRound}:\n- Attacker: ${attacker.name}\n- Defender: ${defender.name}\n- Attack Result: ${aDamage > 0 ? `${attacker.name} strikes ${defender.name} for ${aDamage} damage!` : `${defender.name} dodges ${attacker.name}'s attack!`}\n- Defense Result: ${dDamage > 0 ? `${defender.name} counters and hits ${attacker.name} for ${dDamage} damage!` : `${attacker.name} dodges ${defender.name}'s attack!`}\n\nInstructions:\nWrite two short, vivid lines of commentary for this round:\n1. The attack (${attacker.name}'s move)\n2. The defense/counter (${defender.name}'s move)\nMake it entertaining and dramatic, as if for a manga or anime. Reference the fighters’ appearance, weapons, and the scene for flavor. Use energetic, punchy language. Each line should be 1–2 sentences, and clearly indicate who is acting.`;
      // Call LLM API
      let attackCommentary = '';
      let defenseCommentary = '';
      try {
        const res = await fetch('/api/generate-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        if (data.success && data.story) {
          // Expecting two lines, split by newline or number
          const lines = data.story.trim().split(/\n|\d+\./).map((l: string) => l.trim()).filter(Boolean);
          attackCommentary = lines[0] || '';
          defenseCommentary = lines[1] || '';
        } else {
          attackCommentary = aDamage > 0
            ? `${attacker.name} strikes ${defender.name} for ${aDamage} damage!`
            : `${defender.name} dodges ${attacker.name}'s attack!`;
          defenseCommentary = dDamage > 0
            ? `${defender.name} counters and hits ${attacker.name} for ${dDamage} damage!`
            : `${attacker.name} dodges ${defender.name}'s attack!`;
        }
      } catch {
        attackCommentary = aDamage > 0
          ? `${attacker.name} strikes ${defender.name} for ${aDamage} damage!`
          : `${defender.name} dodges ${attacker.name}'s attack!`;
        defenseCommentary = dDamage > 0
          ? `${defender.name} counters and hits ${attacker.name} for ${dDamage} damage!`
          : `${attacker.name} dodges ${defender.name}'s attack!`;
      }
      setIsLLMGenerating(false);
      // Synchronized update: health, commentary, round, winner
      updateHealthAndCommentary({
        attackerId: attacker.id,
        defenderId: defender.id,
        attackerDamage: aDamage,
        defenderDamage: dDamage,
        attackCommentary,
        defenseCommentary,
        round: currentRound,
      });
      // Animation/round step logic
      setRoundStep('attack');
      setTimeout(() => setRoundStep('defense'), 1500);
      setTimeout(() => {
        if (!winner && currentRound + 1 <= maxRounds) {
          setCurrentRound(currentRound + 1); // Increment round before next animation
          setShowRoundAnim(true);
        }
      }, 2000);
    }, 2000);
  };

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
  }, []); // Empty dependency array to run only on mount

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
      const timer = setTimeout(() => setRoundStep('defense'), 1500);
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
              <FighterImageUpload onUploadComplete={handleFighterAUpload} label="Upload image for Fighter A" />
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
              <FighterImageUpload onUploadComplete={handleFighterBUpload} label="Upload image for Fighter B" />
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
                  <FighterImageUpload onUploadComplete={handleFighterAUpload} label="Upload image for Fighter A" />
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
                  <FighterImageUpload onUploadComplete={handleFighterBUpload} label="Upload image for Fighter B" />
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
                <FighterImageUpload onUploadComplete={handleArenaUpload} label="Upload image of the fighting scene" />
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
                  canStartFight
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!canStartFight}
                onClick={() => {
                  if (canStartFight) {
                    handleBeginCombat();
                  }
                }}
              >
                Start Fight
              </button>
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

        {/* Combat Phase */}
        {gamePhase === 'combat' && fighterA && fighterB && scene && (
          <div className="space-y-8">
            {isLLMGenerating && <div className="text-center text-lg font-bold text-yellow-400">Generating commentary...</div>}
            {(() => {
              const lastRound = combatLog[combatLog.length - 1];
              // Fallback for first render
              if (!lastRound) return null;
              // Use roundStep to control which commentary is shown and which panel is faded
              return (
                <BattleStoryboard
                  scene={{ name: typeof scene?.name === 'string' ? scene.name : '', imageUrl: typeof scene?.imageUrl === 'string' ? scene.imageUrl : '' }}
                  round={currentRound}
                  attacker={{
                    name: lastRound.attacker.name,
                    imageUrl: lastRound.attacker.imageUrl,
                    commentary: lastRound.attacker.commentary,
                  }}
                  defender={{
                    name: lastRound.defender.name,
                    imageUrl: lastRound.defender.imageUrl,
                    commentary: lastRound.defender.commentary,
                  }}
                  roundStep={roundStep}
                  previousRounds={combatLog.slice(0, -1).map((entry: CombatLogEntry) => ({
                    round: entry.round,
                    summary: `${entry.attacker.commentary} ${entry.defender.commentary}`,
                  }))}
                />
              );
            })()}
            {!winner && showRoundAnim && <RoundStartAnimation round={currentRound} onDone={runRoundLogic} />}
            {winner && showRoundAnim && (
              <WinnerAnimation winner={winner} onDone={() => { resetGame(); setGamePhase('setup'); }} />
            )}
          </div>
        )}
      </div>
      <button onClick={handleResetToDemo} className="fixed top-4 right-4 z-50 px-4 py-2 bg-blue-700 text-white rounded shadow">Reset to Demo</button>
    </div>
  );
}