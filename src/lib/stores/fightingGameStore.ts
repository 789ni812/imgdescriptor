import { create } from 'zustand';

export type GamePhase = 'setup' | 'introduction' | 'combat' | 'victory';
export type RoundStep = 'attack' | 'defense';

export interface Fighter {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
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
  visualAnalysis: {
    age: string;
    size: string;
    build: string;
    appearance: string[];
    weapons: string[];
    armor: string[];
  };
  combatHistory: CombatEvent[];
  winLossRecord: { wins: number; losses: number; draws: number };
  createdAt: string;
}

export interface Scene {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  environmentalObjects: string[];
  createdAt: string;
}

export interface CombatEvent {
  round: number;
  attacker: string;
  defender: string;
  attackRoll: {
    type: 'attack' | 'defense' | 'luck' | 'initiative' | 'environmental';
    dice: number;
    sides: number;
    modifier: number;
    result: number;
    critical: boolean;
    special: boolean;
  };
  damage: number;
  narrative: string;
  environmentalAction?: string;
  timestamp: string;
}

export interface CombatLogEntry {
  round: number;
  attacker: {
    name: string;
    imageUrl: string;
    commentary: string;
  };
  defender: {
    name: string;
    imageUrl: string;
    commentary: string;
  };
  flavor: string;
  ending: string;
  damage: {
    attackerDamage: number;
    defenderDamage: number;
  };
  healthAfter: {
    attackerHealth: number;
    defenderHealth: number;
  };
}

interface FightingGameState {
  // Game State
  gamePhase: GamePhase;
  fighters: { fighterA: Fighter | null; fighterB: Fighter | null };
  scene: Scene | null;
  combatLog: CombatLogEntry[];
  currentRound: number;
  maxRounds: number;
  
  // Battle State
  fighterAHealth: number | null;
  fighterBHealth: number | null;
  roundStep: RoundStep;
  isLLMGenerating: boolean;
  winner: string | null;
  showRoundAnim: boolean;
  
  // Actions
  setGamePhase: (phase: GamePhase) => void;
  addFighter: (fighter: Fighter) => void;
  setScene: (scene: Scene) => void;
  resetGame: () => void;
  nextRound: () => void;
  setFighter: (slot: 'fighterA' | 'fighterB', fighter: Fighter | null) => void;
  removeFighter: (slot: 'fighterA' | 'fighterB') => void;
  
  // Battle Actions
  setFighterHealth: (fighterId: string, health: number) => void;
  setRoundStep: (step: RoundStep) => void;
  setIsLLMGenerating: (generating: boolean) => void;
  setWinner: (winner: string | null) => void;
  setShowRoundAnim: (show: boolean) => void;
  
  // Synchronized Battle Updates
  addCombatRound: (roundData: Omit<CombatLogEntry, 'round'>) => void;
  updateHealthAndCommentary: (params: {
    attackerId: string;
    defenderId: string;
    attackerDamage: number;
    defenderDamage: number;
    attackCommentary: string;
    defenseCommentary: string;
    round: number;
  }) => void;
  
  // Utility Actions
  getFighterById: (id: string) => Fighter | undefined;
  getCurrentFighters: () => { fighterA: Fighter | null; fighterB: Fighter | null };
}

export const useFightingGameStore = create<FightingGameState>((set, get) => ({
  // Initial State
  gamePhase: 'setup',
  fighters: { fighterA: null, fighterB: null },
  scene: null,
  combatLog: [],
  currentRound: 0,
  maxRounds: 6,
  
  // Battle State
  fighterAHealth: null,
  fighterBHealth: null,
  roundStep: 'attack',
  isLLMGenerating: false,
  winner: null,
  showRoundAnim: false,

  // Basic Actions
  setGamePhase: (phase) => set({ gamePhase: phase }),
  
  addFighter: (fighter) => set((state) => ({
    fighters: { ...state.fighters, fighterA: fighter }
  })),
  
  setScene: (scene) => set({ scene }),
  

  
  resetGame: () => set({
    gamePhase: 'setup',
    fighters: { fighterA: null, fighterB: null },
    scene: null,
    combatLog: [],
    currentRound: 0,
    fighterAHealth: null,
    fighterBHealth: null,
    roundStep: 'attack',
    isLLMGenerating: false,
    winner: null,
    showRoundAnim: false,
  }),
  
  nextRound: () => set((state) => ({
    currentRound: state.currentRound + 1
  })),
  
  setFighter: (slot, fighter) => set((state) => ({
    fighters: { ...state.fighters, [slot]: fighter }
  })),
  
  removeFighter: (slot) => set((state) => ({
    fighters: { ...state.fighters, [slot]: null }
  })),
  
  // Battle Actions
  setFighterHealth: (fighterId, health) => set((state) => {
    const fighters = state.fighters;
    if (fighters.fighterA && fighters.fighterB) {
      if (fighters.fighterA.id === fighterId) {
        return { fighterAHealth: health };
      } else if (fighters.fighterB.id === fighterId) {
        return { fighterBHealth: health };
      }
    }
    return {};
  }),
  
  setRoundStep: (step) => set({ roundStep: step }),
  
  setIsLLMGenerating: (generating) => set({ isLLMGenerating: generating }),
  
  setWinner: (winner) => set({ winner }),
  
  setShowRoundAnim: (show) => set({ showRoundAnim: show }),
  
  // Synchronized Battle Updates
  addCombatRound: (roundData) => set((state) => ({
    combatLog: [...state.combatLog, { ...roundData, round: state.currentRound }]
  })),
  
  updateHealthAndCommentary: (params) => set((state) => {
    const { attackerId, defenderId, attackerDamage, defenderDamage, attackCommentary, defenseCommentary, round } = params;
    const fighters = state.fighters;
    
    if (!fighters.fighterA || !fighters.fighterB) return {};
    
    const fighterA = fighters.fighterA;
    const fighterB = fighters.fighterB;
    
    // Calculate new health values
    const currentFighterAHealth = state.fighterAHealth ?? fighterA.stats.health;
    const currentFighterBHealth = state.fighterBHealth ?? fighterB.stats.health;
    
    let newFighterAHealth = currentFighterAHealth;
    let newFighterBHealth = currentFighterBHealth;
    
    // Apply damage based on which fighter is attacking
    if (fighterA.id === attackerId) {
      newFighterBHealth = Math.max(0, currentFighterBHealth - attackerDamage);
      newFighterAHealth = Math.max(0, currentFighterAHealth - defenderDamage);
    } else {
      newFighterAHealth = Math.max(0, currentFighterAHealth - attackerDamage);
      newFighterBHealth = Math.max(0, currentFighterBHealth - defenderDamage);
    }
    
    // Determine winner
    let winner = null;
    if (newFighterAHealth <= 0 && newFighterBHealth <= 0) {
      winner = 'Draw';
    } else if (newFighterAHealth <= 0) {
      winner = fighterB.name;
    } else if (newFighterBHealth <= 0) {
      winner = fighterA.name;
    }
    
    // Create combat log entry
    const combatEntry: CombatLogEntry = {
      round,
      attacker: {
        name: fighterA.id === attackerId ? fighterA.name : fighterB.name,
        imageUrl: fighterA.id === attackerId ? fighterA.imageUrl : fighterB.imageUrl,
        commentary: attackCommentary,
      },
      defender: {
        name: fighterA.id === defenderId ? fighterA.name : fighterB.name,
        imageUrl: fighterA.id === defenderId ? fighterA.imageUrl : fighterB.imageUrl,
        commentary: defenseCommentary,
      },
      flavor: '',
      ending: '',
      damage: {
        attackerDamage,
        defenderDamage,
      },
      healthAfter: {
        attackerHealth: fighterA.id === attackerId ? newFighterAHealth : newFighterBHealth,
        defenderHealth: fighterA.id === defenderId ? newFighterAHealth : newFighterBHealth,
      },
    };
    
    return {
      fighterAHealth: newFighterAHealth,
      fighterBHealth: newFighterBHealth,
      combatLog: [...state.combatLog, combatEntry],
      winner,
      currentRound: state.currentRound + 1,
    };
  }),
  
  // Utility Actions
  getFighterById: (id) => {
    const state = get();
    if (state.fighters.fighterA && state.fighters.fighterA.id === id) return state.fighters.fighterA;
    if (state.fighters.fighterB && state.fighters.fighterB.id === id) return state.fighters.fighterB;
    return undefined;
  },
  
  getCurrentFighters: () => {
    const state = get();
    return { fighterA: state.fighters.fighterA, fighterB: state.fighters.fighterB };
  },
})); 