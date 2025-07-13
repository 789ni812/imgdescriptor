import { renderHook, act } from '@testing-library/react';
import { useFightingGameStore } from './fightingGameStore';
import { resolveBattle } from '../utils';

describe('FightingGameStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useFightingGameStore());
    act(() => {
      result.current.resetGame();
    });
  });

  describe('Basic State Management', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useFightingGameStore());
      
      expect(result.current.gamePhase).toBe('setup');
      expect(result.current.fighters).toEqual({ fighterA: null, fighterB: null });
      expect(result.current.scene).toBeNull();
      expect(result.current.combatLog).toEqual([]);
      expect(result.current.currentRound).toBe(0);
      expect(result.current.maxRounds).toBe(6);
      expect(result.current.fighterAHealth).toBeNull();
      expect(result.current.fighterBHealth).toBeNull();
      expect(result.current.roundStep).toBe('attack');
      expect(result.current.isLLMGenerating).toBe(false);
      expect(result.current.winner).toBeNull();
      expect(result.current.showRoundAnim).toBe(false);
    });

    it('should set game phase', () => {
      const { result } = renderHook(() => useFightingGameStore());
      
      act(() => {
        result.current.setGamePhase('combat');
      });
      
      expect(result.current.gamePhase).toBe('combat');
    });

    it('should add fighters', () => {
      const { result } = renderHook(() => useFightingGameStore());
      const fighter = {
        id: 'test-fighter',
        name: 'Test Fighter',
        imageUrl: '/test.jpg',
        description: 'A test fighter',
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 10,
          luck: 10,
          agility: 10,
          defense: 10,
          age: 25,
          size: 'medium' as const,
          build: 'average' as const,
        },
        visualAnalysis: {
          age: 'adult',
          size: 'medium',
          build: 'average',
          appearance: ['test'],
          weapons: [],
          armor: [],
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
      };
      
      act(() => {
        result.current.addFighter(fighter);
      });
      
      expect(result.current.fighters.fighterA).toEqual(fighter);
      expect(result.current.fighters.fighterB).toBeNull();
    });

    it('should set scene', () => {
      const { result } = renderHook(() => useFightingGameStore());
      const scene = {
        id: 'test-scene',
        name: 'Test Scene',
        imageUrl: '/scene.jpg',
        description: 'A test scene',
        environmentalObjects: ['bridge'],
        createdAt: new Date().toISOString(),
      };
      
      act(() => {
        result.current.setScene(scene);
      });
      
      expect(result.current.scene).toEqual(scene);
    });
  });

  describe('Battle State Management', () => {
    it('should set fighter health', () => {
      const { result } = renderHook(() => useFightingGameStore());
      const fighterA = {
        id: 'fighter-a',
        name: 'Fighter A',
        imageUrl: '/fighter-a.jpg',
        description: 'Fighter A',
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 10,
          luck: 10,
          agility: 10,
          defense: 10,
          age: 25,
          size: 'medium' as const,
          build: 'average' as const,
        },
        visualAnalysis: {
          age: 'adult',
          size: 'medium',
          build: 'average',
          appearance: ['test'],
          weapons: [],
          armor: [],
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
      };
      
      const fighterB = {
        id: 'fighter-b',
        name: 'Fighter B',
        imageUrl: '/fighter-b.jpg',
        description: 'Fighter B',
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 10,
          luck: 10,
          agility: 10,
          defense: 10,
          age: 25,
          size: 'medium' as const,
          build: 'average' as const,
        },
        visualAnalysis: {
          age: 'adult',
          size: 'medium',
          build: 'average',
          appearance: ['test'],
          weapons: [],
          armor: [],
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
      };
      
      act(() => {
        result.current.addFighter(fighterA);
        result.current.addFighter(fighterB);
        result.current.setFighterHealth('fighter-a', 80);
      });
      
      expect(result.current.fighterAHealth).toBe(80);
    });

    it('should set round step', () => {
      const { result } = renderHook(() => useFightingGameStore());
      
      act(() => {
        result.current.setRoundStep('defense');
      });
      
      expect(result.current.roundStep).toBe('defense');
    });

    it('should set LLM generating state', () => {
      const { result } = renderHook(() => useFightingGameStore());
      
      act(() => {
        result.current.setIsLLMGenerating(true);
      });
      
      expect(result.current.isLLMGenerating).toBe(true);
    });

    it('should set winner', () => {
      const { result } = renderHook(() => useFightingGameStore());
      
      act(() => {
        result.current.setWinner('Fighter A');
      });
      
      expect(result.current.winner).toBe('Fighter A');
    });

    it('should set show round animation', () => {
      const { result } = renderHook(() => useFightingGameStore());
      
      act(() => {
        result.current.setShowRoundAnim(true);
      });
      
      expect(result.current.showRoundAnim).toBe(true);
    });
  });

  describe('Synchronized Battle Updates', () => {
    it('should update health and commentary together', () => {
      const { result } = renderHook(() => useFightingGameStore());
      
      // Add two fighters
      const fighterA = {
        id: 'fighter-a',
        name: 'Fighter A',
        imageUrl: '/fighter-a.jpg',
        description: 'Fighter A',
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 10,
          luck: 10,
          agility: 10,
          defense: 10,
          age: 25,
          size: 'medium' as const,
          build: 'average' as const,
        },
        visualAnalysis: {
          age: 'adult',
          size: 'medium',
          build: 'average',
          appearance: ['test'],
          weapons: [],
          armor: [],
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
      };
      
      const fighterB = {
        id: 'fighter-b',
        name: 'Fighter B',
        imageUrl: '/fighter-b.jpg',
        description: 'Fighter B',
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 10,
          luck: 10,
          agility: 10,
          defense: 10,
          age: 25,
          size: 'medium' as const,
          build: 'average' as const,
        },
        visualAnalysis: {
          age: 'adult',
          size: 'medium',
          build: 'average',
          appearance: ['test'],
          weapons: [],
          armor: [],
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
      };
      
      act(() => {
        result.current.addFighter(fighterA);
        result.current.addFighter(fighterB);
        result.current.setFighterHealth('fighter-a', 100);
        result.current.setFighterHealth('fighter-b', 100);
      });
      
      // Update health and commentary together
      act(() => {
        result.current.updateHealthAndCommentary({
          attackerId: 'fighter-a',
          defenderId: 'fighter-b',
          attackerDamage: 20,
          defenderDamage: 10,
          attackCommentary: 'Fighter A strikes Fighter B for 20 damage!',
          defenseCommentary: 'Fighter B counters for 10 damage!',
          round: 1,
        });
      });
      
      // Check that health and commentary were updated together
      expect(result.current.fighterAHealth).toBe(90); // 100 - 10
      expect(result.current.fighterBHealth).toBe(80); // 100 - 20
      expect(result.current.combatLog).toHaveLength(1);
      expect(result.current.combatLog[0].attacker.commentary).toBe('Fighter A strikes Fighter B for 20 damage!');
      expect(result.current.combatLog[0].defender.commentary).toBe('Fighter B counters for 10 damage!');
      expect(result.current.combatLog[0].damage.attackerDamage).toBe(20);
      expect(result.current.combatLog[0].damage.defenderDamage).toBe(10);
      expect(result.current.currentRound).toBe(1);
    });

    it('should determine winner when health reaches zero', () => {
      const { result } = renderHook(() => useFightingGameStore());
      
      // Add two fighters
      const fighterA = {
        id: 'fighter-a',
        name: 'Fighter A',
        imageUrl: '/fighter-a.jpg',
        description: 'Fighter A',
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 10,
          luck: 10,
          agility: 10,
          defense: 10,
          age: 25,
          size: 'medium' as const,
          build: 'average' as const,
        },
        visualAnalysis: {
          age: 'adult',
          size: 'medium',
          build: 'average',
          appearance: ['test'],
          weapons: [],
          armor: [],
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
      };
      
      const fighterB = {
        id: 'fighter-b',
        name: 'Fighter B',
        imageUrl: '/fighter-b.jpg',
        description: 'Fighter B',
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 10,
          luck: 10,
          agility: 10,
          defense: 10,
          age: 25,
          size: 'medium' as const,
          build: 'average' as const,
        },
        visualAnalysis: {
          age: 'adult',
          size: 'medium',
          build: 'average',
          appearance: ['test'],
          weapons: [],
          armor: [],
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
      };
      
      act(() => {
        result.current.addFighter(fighterA);
        result.current.addFighter(fighterB);
        result.current.setFighterHealth('fighter-a', 100);
        result.current.setFighterHealth('fighter-b', 100);
      });
      
      // Fighter A defeats Fighter B
      act(() => {
        result.current.updateHealthAndCommentary({
          attackerId: 'fighter-a',
          defenderId: 'fighter-b',
          attackerDamage: 100, // Kills Fighter B
          defenderDamage: 0,
          attackCommentary: 'Fighter A defeats Fighter B!',
          defenseCommentary: 'Fighter B is defeated!',
          round: 1,
        });
      });
      
      expect(result.current.fighterBHealth).toBe(0);
      expect(result.current.winner).toBe('Fighter A');
    });
  });

  describe('Utility Functions', () => {
    it('should get fighter by ID', () => {
      const { result } = renderHook(() => useFightingGameStore());
      const fighter = {
        id: 'test-fighter',
        name: 'Test Fighter',
        imageUrl: '/test.jpg',
        description: 'A test fighter',
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 10,
          luck: 10,
          agility: 10,
          defense: 10,
          age: 25,
          size: 'medium' as const,
          build: 'average' as const,
        },
        visualAnalysis: {
          age: 'adult',
          size: 'medium',
          build: 'average',
          appearance: ['test'],
          weapons: [],
          armor: [],
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
      };
      
      act(() => {
        result.current.addFighter(fighter);
      });
      
      const foundFighter = result.current.getFighterById('test-fighter');
      expect(foundFighter).toEqual(fighter);
    });

    it('should get current fighters', () => {
      const { result } = renderHook(() => useFightingGameStore());
      const fighterA = {
        id: 'fighter-a',
        name: 'Fighter A',
        imageUrl: '/fighter-a.jpg',
        description: 'Fighter A',
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 10,
          luck: 10,
          agility: 10,
          defense: 10,
          age: 25,
          size: 'medium' as const,
          build: 'average' as const,
        },
        visualAnalysis: {
          age: 'adult',
          size: 'medium',
          build: 'average',
          appearance: ['test'],
          weapons: [],
          armor: [],
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
      };
      
      const fighterB = {
        id: 'fighter-b',
        name: 'Fighter B',
        imageUrl: '/fighter-b.jpg',
        description: 'Fighter B',
        stats: {
          health: 100,
          maxHealth: 100,
          strength: 10,
          luck: 10,
          agility: 10,
          defense: 10,
          age: 25,
          size: 'medium' as const,
          build: 'average' as const,
        },
        visualAnalysis: {
          age: 'adult',
          size: 'medium',
          build: 'average',
          appearance: ['test'],
          weapons: [],
          armor: [],
        },
        combatHistory: [],
        winLossRecord: { wins: 0, losses: 0, draws: 0 },
        createdAt: new Date().toISOString(),
      };
      
      act(() => {
        result.current.setFighter('fighterA', fighterA);
        result.current.setFighter('fighterB', fighterB);
      });
      
      const { fighterA: currentFighterA, fighterB: currentFighterB } = result.current.getCurrentFighters();
      expect(currentFighterA).toEqual(fighterA);
      expect(currentFighterB).toEqual(fighterB);
    });
  });
}); 

describe('Battle Resolution Logic', () => {
  it('should resolve a 6-round battle using all stats, random events, and arena objects, and log each round in JSON', () => {
    // Example fighters and arena
    const godzilla = {
      id: 'godzilla-1',
      name: 'Godzilla',
      imageUrl: '/vs/godzillaVSbrucelee/godzilla.jpg',
      description: 'A massive prehistoric monster',
      stats: {
        health: 500,
        maxHealth: 500,
        strength: 25,
        luck: 8,
        agility: 6,
        defense: 22,
        age: 200000000,
        size: 'large' as const,
        build: 'heavy' as const,
      },
      visualAnalysis: {
        age: 'ancient',
        size: 'massive',
        build: 'monstrous',
        appearance: ['scaly'],
        weapons: ['atomic breath'],
        armor: ['thick scales'],
      },
      combatHistory: [],
      winLossRecord: { wins: 0, losses: 0, draws: 0 },
      createdAt: new Date().toISOString(),
    };
    const bruceLee = {
      id: 'bruce-lee-1',
      name: 'Bruce Lee',
      imageUrl: '/vs/godzillaVSbrucelee/bruce-lee.jpg',
      description: 'A legendary martial artist',
      stats: {
        health: 120,
        maxHealth: 120,
        strength: 12,
        luck: 18,
        agility: 20,
        defense: 8,
        age: 32,
        size: 'medium' as const,
        build: 'muscular' as const,
      },
      visualAnalysis: {
        age: 'adult',
        size: 'medium',
        build: 'athletic',
        appearance: ['focused'],
        weapons: ['martial arts'],
        armor: [],
      },
      combatHistory: [],
      winLossRecord: { wins: 0, losses: 0, draws: 0 },
      createdAt: new Date().toISOString(),
    };
    const arena = {
      id: 'tokyo-city-1',
      name: 'Tokyo City Streets',
      imageUrl: '/vs/godzillaVSbrucelee/tokyo-arena.jpg',
      description: 'A bustling Tokyo cityscape',
      environmentalObjects: ['skyscrapers', 'cars', 'street signs', 'neon lights', 'buildings', 'pavement'],
      createdAt: new Date().toISOString(),
    };

    // This function does not exist yet, so this test should fail
    // It should return a battle log with 6 rounds, each round containing all required info
    // and the winner should usually be Godzilla, but Bruce Lee should have a chance to win via luck/random event
    // The log should include any arena object usage and random events
    //
    // Example call (to be implemented):
    // const battleLog = resolveBattle(godzilla, bruceLee, arena, 6);
    //
    // For now, just expect the function to be defined and return the correct structure
    // (This will fail until implemented)
    expect(typeof resolveBattle).toBe('function');
    const battleLog = resolveBattle(godzilla, bruceLee, arena, 6);
    expect(Array.isArray(battleLog.rounds)).toBe(true);
    expect(battleLog.rounds.length).toBeGreaterThanOrEqual(1);
    expect(battleLog.rounds.length).toBeLessThanOrEqual(6);
    expect(typeof battleLog.winner).toBe('string');
    // Each round should have attacker, defender, stats used, damage, randomEvent, arenaObjectUsed, and healthAfter
    battleLog.rounds.forEach((round: any) => {
      expect(typeof round.attacker).toBe('string');
      expect(typeof round.defender).toBe('string');
      expect(typeof round.damage).toBe('number');
      expect(typeof round.statsUsed).toBe('object');
      expect(typeof round.healthAfter).toBe('object');
      expect(typeof round.randomEvent).toBe('string');
      expect(Array.isArray(round.arenaObjectsUsed)).toBe(true);
    });
    // Godzilla should win most of the time, but Bruce Lee should sometimes win (run test multiple times to check randomness)
  });
}); 