'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFightingGameStore, Fighter } from '@/lib/stores/fightingGameStore';
import FighterUpload from '@/components/fighting/FighterUpload';
import HealthBar from '@/components/fighting/HealthBar';
import RoundStartAnimation from '@/components/fighting/RoundStartAnimation';
import WinnerAnimation from '@/components/fighting/WinnerAnimation';
import BattleStoryboard from '@/components/fighting/BattleStoryboard';

export default function PlayerVsPage() {
  const { gamePhase: storePhase, resetGame } = useFightingGameStore();
  const [fighterA, setFighterA] = React.useState<Fighter | null>(null);
  const [fighterB, setFighterB] = React.useState<Fighter | null>(null);
  const [devScene, setDevScene] = React.useState<any>(null);
  const [phase, setPhase] = useState<'setup' | 'introduction' | 'combat' | 'victory'>('setup');
  const [dmIntro, setDmIntro] = useState<string>('');
  // Change combatLog to store objects instead of strings
  const [combatLog, setCombatLog] = useState<any[]>([]);
  const [round, setRound] = useState(1);
  const [fighterAHealth, setFighterAHealth] = useState<number | null>(null);
  const [fighterBHealth, setFighterBHealth] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const maxRounds = 6;
  const isCombatOver = winner !== null || round > maxRounds;
  // Add state to control round animation and auto-advance
  const [showRoundAnim, setShowRoundAnim] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  // Add state for step reveal: 'attack' or 'defense'
  const [roundStep, setRoundStep] = useState<'attack' | 'defense'>('attack');

  // Start combat: show first round animation and enable auto-advance
  const handleBeginCombat = () => {
    setPhase('combat');
    setShowRoundAnim(true);
    setAutoAdvance(true);
  };

  const flavorMoves = [
    "attacks with a flying scissor kick",
    "unleashes a spinning backfist",
    "throws a handful of sand in the opponent's eyes",
    "uses the force to hurl debris across the arena",
    "performs a dramatic somersault",
    "taunts the crowd with a victory pose",
    "dodges with a slick backflip",
    "grabs a chair and swings wildly",
    "channels inner energy for a power punch",
    "attempts a surprise leg sweep"
  ];
  const flavorRetaliations = [
    "retaliates by charging with the dustbin over their head",
    "counters with a swift uppercut",
    "lands a sneaky jab to the ribs",
    "grabs a nearby object and throws it",
    "rushes forward with a battle cry",
    "spins and delivers a roundhouse kick",
    "leaps onto the ropes and launches an aerial attack",
    "uses a secret technique learned from the masters"
  ];
  const roundEndings = [
    "stumbles back as the bell sounds for the end of this round.",
    "raises a fist as the crowd roars.",
    "takes a deep breath, preparing for the next round.",
    "wipes sweat from the brow, eyes locked on the opponent.",
    "nods respectfully as the round concludes."
  ];

  function randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Run round logic after animation
  const runRoundLogic = () => {
    if (!fighterA || !fighterB || !fighterAHealth || !fighterBHealth || isCombatOver) return;
    setTimeout(() => {
      const isAFirst = round % 2 === 1;
      const attacker = isAFirst ? fighterA : fighterB;
      const defender = isAFirst ? fighterB : fighterA;
      const attackerHealth = isAFirst ? fighterAHealth : fighterBHealth;
      const defenderHealth = isAFirst ? fighterBHealth : fighterAHealth;
      const attackerStats = attacker.stats;
      const defenderStats = defender.stats;
      const aRoll = Math.floor(Math.random() * 20) + 1 + attackerStats.strength;
      const dRoll = Math.floor(Math.random() * 20) + 1 + defenderStats.strength;
      let aDamage = Math.max(0, aRoll - defenderStats.defense);
      let dDamage = Math.max(0, dRoll - attackerStats.defense);
      if (Math.random() < defenderStats.luck / 40) aDamage = 0;
      if (Math.random() < attackerStats.luck / 40) dDamage = 0;
      const newAttackerHealth = Math.max(0, attackerHealth - dDamage);
      const newDefenderHealth = Math.max(0, defenderHealth - aDamage);
      if (isAFirst) {
        setFighterAHealth(newAttackerHealth);
        setFighterBHealth(newDefenderHealth);
      } else {
        setFighterAHealth(newDefenderHealth);
        setFighterBHealth(newAttackerHealth);
      }
      // Split commentary
      let attackCommentary = aDamage > 0
        ? `${attacker.name} strikes ${defender.name} for ${aDamage} damage!`
        : `${defender.name} dodges ${attacker.name}'s attack!`;
      let defenseCommentary = dDamage > 0
        ? `${defender.name} counters and hits ${attacker.name} for ${dDamage} damage!`
        : `${attacker.name} dodges ${defender.name}'s attack!`;
      // Add flavor and round ending
      const flavor = `${attacker.name} ${randomFrom(flavorMoves)}. ${defender.name} ${randomFrom(flavorRetaliations)}.`;
      const ending = `${randomFrom([attacker.name, defender.name])} ${randomFrom(roundEndings)}`;
      setCombatLog((log) => [
        ...log,
        {
          round,
          attacker: {
            name: attacker.name,
            imageUrl: attacker.imageUrl,
            commentary: attackCommentary,
          },
          defender: {
            name: defender.name,
            imageUrl: defender.imageUrl,
            commentary: defenseCommentary,
          },
          flavor,
          ending,
        },
      ]);
      if (newAttackerHealth <= 0 && newDefenderHealth <= 0) {
        setWinner('Draw');
      } else if (newAttackerHealth <= 0) {
        setWinner(defender.name);
      } else if (newDefenderHealth <= 0) {
        setWinner(attacker.name);
      }
      setRound((r) => r + 1);
      if (!isCombatOver) {
        setShowRoundAnim(false);
        setTimeout(() => {
          setShowRoundAnim(true);
        }, 2000);
      } else {
        setAutoAdvance(false);
      }
    }, 2000);
  };

  // Auto-populate demo fighters and scene on mount
  useEffect(() => {
    setFighterA({
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
    });
    setFighterB({
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
    });
    setDevScene({
      id: 'scene-castle-1',
      name: 'Castle Bridge',
      imageUrl: '/vs/starWars1/scene-castle-1.jpg',
      description: 'A stone castle with a moat and a wooden bridge. The perfect place for an epic duel.',
      environmentalObjects: ['bridge', 'moat', 'castle walls'],
      createdAt: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    if (fighterA) setFighterAHealth(fighterA.stats.health);
    if (fighterB) setFighterBHealth(fighterB.stats.health);
  }, [fighterA, fighterB]);

  const canStartFight = fighterA && fighterB && devScene;

  // Generate DM intro when phase changes to introduction
  React.useEffect(() => {
    if (phase === 'introduction' && fighterA && fighterB && devScene) {
      setDmIntro(
        `Welcome to the Castle Bridge! Tonight's epic duel features ${fighterA.name}, a ${fighterA.description.toLowerCase()} versus ${fighterB.name}, a ${fighterB.description.toLowerCase()}. The crowd is on the edge of their seats as these two legends face off in front of the ancient castle. Who will emerge victorious? Let the battle begin!`
      );
    }
  }, [phase, fighterA, fighterB, devScene]);

  // When a new round is added to combatLog, start with 'attack' step, then auto-advance to 'defense'
  useEffect(() => {
    if (phase === 'combat' && combatLog.length > 0) {
      setRoundStep('attack');
      const timer = setTimeout(() => setRoundStep('defense'), 1500);
      return () => clearTimeout(timer);
    }
  }, [combatLog.length, phase]);

  // Combat round logic
  // const handleNextRound = () => {
  //   if (!fighterA || !fighterB || !fighterAHealth || !fighterBHealth || isCombatOver) return;
  //   setShowRoundAnim(true);
  //   // setPendingNextRound(true); // This line is removed
  // };

  // Reset combat state on new game
  useEffect(() => {
    if (phase === 'setup') {
      setCombatLog([]);
      setRound(1);
      setWinner(null);
      setFighterAHealth(fighterA ? fighterA.stats.health : null);
      setFighterBHealth(fighterB ? fighterB.stats.health : null);
    }
  }, [phase, fighterA, fighterB]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-8 gap-8">
          {/* Fighter A */}
          {fighterA && (
            <div className="flex flex-col items-center">
              <img src={fighterA.imageUrl} alt={fighterA.name} className="w-24 h-24 object-cover rounded-lg border-4 border-red-700 shadow-lg" />
              <div className="mt-2 text-lg font-bold">{fighterA.name}</div>
              <HealthBar current={fighterAHealth ?? 0} max={fighterA?.stats.maxHealth ?? 1} color="red" />
              <div className="text-xs mt-1">Health: {fighterAHealth} / {fighterA?.stats.maxHealth}</div>
            </div>
          )}
          {/* VS */}
          <div className="text-3xl font-extrabold text-yellow-400 mx-6">vs</div>
          {/* Fighter B */}
          {fighterB && (
            <div className="flex flex-col items-center">
              <img src={fighterB.imageUrl} alt={fighterB.name} className="w-24 h-24 object-cover rounded-lg border-4 border-blue-700 shadow-lg" />
              <div className="mt-2 text-lg font-bold">{fighterB.name}</div>
              <HealthBar current={fighterBHealth ?? 0} max={fighterB?.stats.maxHealth ?? 1} color="blue" />
              <div className="text-xs mt-1">Health: {fighterBHealth} / {fighterB?.stats.maxHealth}</div>
            </div>
          )}
        </div>

        {/* Setup Phase */}
        {phase === 'setup' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Upload Your Fighters</h2>
              <p className="text-gray-300">Upload images of two fighters and a battle arena</p>
            </div>

            {/* Fighter Upload Sections */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <FighterUpload
                  fighterId="fighter-a"
                  fighterLabel="Fighter A"
                  onFighterCreated={setFighterA}
                />
              </div>

              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <FighterUpload
                  fighterId="fighter-b"
                  fighterLabel="Fighter B"
                  onFighterCreated={setFighterB}
                />
              </div>
            </div>

            {/* Scene Upload Section */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-4 text-center">Battle Arena</h3>
              <div className="text-center text-gray-300">
                <p>Upload image of the fighting scene</p>
                {/* TODO: Add scene upload component */}
              </div>
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
        {phase === 'introduction' && fighterA && fighterB && devScene && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex flex-col items-center">
                <img src={fighterA.imageUrl} alt={fighterA.name} className="w-40 h-40 object-cover rounded-lg border-4 border-red-700 shadow-lg" />
                <h3 className="mt-2 text-lg font-bold">{fighterA.name}</h3>
              </div>
              <div className="flex flex-col items-center">
                <img src={devScene.imageUrl} alt={devScene.name} className="w-64 h-40 object-cover rounded-lg border-4 border-yellow-700 shadow-lg" />
                <h3 className="mt-2 text-lg font-bold">{devScene.name}</h3>
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
                onClick={() => setPhase('combat')}
              >
                Begin Combat
              </button>
            </div>
          </div>
        )}

        {/* Combat Phase */}
        {phase === 'combat' && fighterA && fighterB && devScene && (
          <div className="space-y-8">
            {(() => {
              const isAFirst = round % 2 === 1;
              const lastRound = combatLog[combatLog.length - 1];
              // Fallback for first render
              if (!lastRound) return null;
              // Use roundStep to control which commentary is shown and which panel is faded
              return (
                <BattleStoryboard
                  scene={{ name: devScene.name, imageUrl: devScene.imageUrl }}
                  round={round}
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
                  previousRounds={combatLog.slice(0, -1).map((entry) => ({
                    round: entry.round,
                    summary: `${entry.attacker.commentary} ${entry.defender.commentary}`,
                  }))}
                />
              );
            })()}
            {!isCombatOver && showRoundAnim && <RoundStartAnimation round={round} onDone={runRoundLogic} />}
            {isCombatOver && showRoundAnim && (
              <WinnerAnimation winner={winner} onDone={() => { resetGame(); setPhase('setup'); }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}