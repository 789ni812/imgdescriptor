'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFightingGameStore, Fighter } from '@/lib/stores/fightingGameStore';
import FighterUpload from '@/components/fighting/FighterUpload';
import HealthBar from '@/components/fighting/HealthBar';
import RoundStartAnimation from '@/components/fighting/RoundStartAnimation';

export default function PlayerVsPage() {
  const { gamePhase: storePhase, fighters, scene, resetGame } = useFightingGameStore();
  const [fighterA, setFighterA] = React.useState<Fighter | null>(null);
  const [fighterB, setFighterB] = React.useState<Fighter | null>(null);
  const [devScene, setDevScene] = React.useState<any>(null);
  const [phase, setPhase] = useState<'setup' | 'introduction' | 'combat' | 'victory'>('setup');
  const [dmIntro, setDmIntro] = useState<string>('');
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [fighterAHealth, setFighterAHealth] = useState<number | null>(null);
  const [fighterBHealth, setFighterBHealth] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const maxRounds = 6;
  const isCombatOver = winner !== null || round > maxRounds;
  const lastActionRef = useRef<string | null>(null);
  // Add state to control round animation and auto-advance
  const [showRoundAnim, setShowRoundAnim] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);

  // Start combat: show first round animation and enable auto-advance
  const handleBeginCombat = () => {
    setPhase('combat');
    setShowRoundAnim(true);
    setAutoAdvance(true);
  };

  // Run round logic after animation
  const runRoundLogic = () => {
    if (!fighterA || !fighterB || !fighterAHealth || !fighterBHealth || isCombatOver) return;
    // Dice rolls
    const aRoll = Math.floor(Math.random() * 20) + 1 + fighterA.stats.strength;
    const bRoll = Math.floor(Math.random() * 20) + 1 + fighterB.stats.strength;
    let aDamage = Math.max(0, aRoll - fighterB.stats.defense);
    let bDamage = Math.max(0, bRoll - fighterA.stats.defense);
    // Luck: 10% chance to dodge
    if (Math.random() < fighterB.stats.luck / 40) aDamage = 0;
    if (Math.random() < fighterA.stats.luck / 40) bDamage = 0;
    // Update health
    const newAHealth = Math.max(0, fighterAHealth - bDamage);
    const newBHealth = Math.max(0, fighterBHealth - aDamage);
    setFighterAHealth(newAHealth);
    setFighterBHealth(newBHealth);
    // DM narration
    let narration = `Round ${round}: `;
    if (aDamage > 0) {
      narration += `${fighterA.name} strikes ${fighterB.name} for ${aDamage} damage! `;
    } else {
      narration += `${fighterB.name} dodges ${fighterA.name}'s attack! `;
    }
    if (bDamage > 0) {
      narration += `${fighterB.name} counters and hits ${fighterA.name} for ${bDamage} damage!`;
    } else {
      narration += `${fighterA.name} dodges ${fighterB.name}'s attack!`;
    }
    setCombatLog((log) => [...log, narration]);
    // Check for winner
    if (newAHealth <= 0 && newBHealth <= 0) {
      setWinner('Draw');
    } else if (newAHealth <= 0) {
      setWinner(fighterB.name);
    } else if (newBHealth <= 0) {
      setWinner(fighterA.name);
    }
    setRound((r) => r + 1);
    // After round logic, if not over, auto-advance to next round
    if (!isCombatOver) {
      setShowRoundAnim(false); // Reset animation
      setTimeout(() => {
        setShowRoundAnim(true); // Trigger next round animation
      }, 100); // Short delay to ensure remount
    } else {
      setAutoAdvance(false);
    }
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

  // Combat round logic
  const handleNextRound = () => {
    if (!fighterA || !fighterB || !fighterAHealth || !fighterBHealth || isCombatOver) return;
    setShowRoundAnim(true);
    // setPendingNextRound(true); // This line is removed
  };

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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Fighter vs Fighter</h1>
          <p className="text-xl text-gray-300">Upload your fighters and let them battle!</p>
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
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex flex-col items-center">
                <img src={fighterA.imageUrl} alt={fighterA.name} className="w-40 h-40 object-cover rounded-lg border-4 border-red-700 shadow-lg" />
                <h3 className="mt-2 text-lg font-bold">{fighterA.name}</h3>
                <HealthBar current={fighterAHealth ?? 0} max={fighterA?.stats.maxHealth ?? 1} color="red" />
                <div className="text-xs mt-1">Health: {fighterAHealth} / {fighterA?.stats.maxHealth}</div>
              </div>
              <div className="flex flex-col items-center">
                <img src={devScene.imageUrl} alt={devScene.name} className="w-64 h-40 object-cover rounded-lg border-4 border-yellow-700 shadow-lg" />
                <h3 className="mt-2 text-lg font-bold">{devScene.name}</h3>
              </div>
              <div className="flex flex-col items-center">
                <img src={fighterB.imageUrl} alt={fighterB.name} className="w-40 h-40 object-cover rounded-lg border-4 border-blue-700 shadow-lg" />
                <h3 className="mt-2 text-lg font-bold">{fighterB.name}</h3>
                <HealthBar current={fighterBHealth ?? 0} max={fighterB?.stats.maxHealth ?? 1} color="blue" />
                <div className="text-xs mt-1">Health: {fighterBHealth} / {fighterB?.stats.maxHealth}</div>
              </div>
            </div>
            {showRoundAnim && <RoundStartAnimation round={round} onDone={runRoundLogic} />}
            <div className="bg-black/30 rounded-lg p-6 border border-white/20 text-center text-lg font-semibold shadow-xl min-h-[120px] flex flex-col justify-end">
              {combatLog.length === 0 ? (
                <span>The battle begins! Click Next Round to start.</span>
              ) : (
                combatLog.map((entry, idx) => <div key={idx}>{entry}</div>)
              )}
              {isCombatOver && (
                <div className="mt-4 text-2xl font-bold text-green-400">
                  {winner === 'Draw' ? "It's a draw!" : `${winner} wins the battle!`}
                </div>
              )}
            </div>
            {!isCombatOver && (
              <div className="text-center">
                <button
                  className="px-8 py-3 rounded-lg font-semibold text-lg bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleNextRound}
                >
                  Next Round
                </button>
              </div>
            )}
            {isCombatOver && (
              <div className="text-center">
                <button
                  className="px-8 py-3 rounded-lg font-semibold text-lg bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setPhase('victory')}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {/* Victory Phase */}
        {phase === 'victory' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Congratulations!</h2>
              <p className="text-xl text-gray-300">The battle is over. {winner ? `${winner} wins!` : "It's a draw!"}</p>
            </div>
            <div className="text-center">
              <button
                className="px-8 py-3 rounded-lg font-semibold text-lg bg-gray-600 hover:bg-gray-700 text-white"
                onClick={() => { resetGame(); setPhase('setup'); }}
              >
                Reset Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 