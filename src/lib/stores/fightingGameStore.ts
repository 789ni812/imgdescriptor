import { create } from 'zustand';

export type GamePhase = 'setup' | 'introduction' | 'combat' | 'victory';

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

interface FightingGameState {
  gamePhase: GamePhase;
  fighters: Fighter[];
  scene: Scene | null;
  combatLog: CombatEvent[];
  currentRound: number;
  maxRounds: number;
  
  // Actions
  setGamePhase: (phase: GamePhase) => void;
  addFighter: (fighter: Fighter) => void;
  setScene: (scene: Scene) => void;
  addCombatEvent: (event: CombatEvent) => void;
  resetGame: () => void;
  nextRound: () => void;
}

export const useFightingGameStore = create<FightingGameState>((set) => ({
  gamePhase: 'setup',
  fighters: [],
  scene: null,
  combatLog: [],
  currentRound: 0,
  maxRounds: 3,

  setGamePhase: (phase) => set({ gamePhase: phase }),
  
  addFighter: (fighter) => set((state) => ({
    fighters: [...state.fighters, fighter]
  })),
  
  setScene: (scene) => set({ scene }),
  
  addCombatEvent: (event) => set((state) => ({
    combatLog: [...state.combatLog, event]
  })),
  
  resetGame: () => set({
    gamePhase: 'setup',
    fighters: [],
    scene: null,
    combatLog: [],
    currentRound: 0,
  }),
  
  nextRound: () => set((state) => ({
    currentRound: state.currentRound + 1
  })),
})); 