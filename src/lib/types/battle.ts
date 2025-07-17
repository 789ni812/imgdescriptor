/**
 * Shared Battle Types
 * 
 * This file contains shared interfaces and types for battle-related functionality
 * across the fighting game system.
 */

/**
 * Unified BattleRound interface used by all components
 * This replaces the conflicting BattleRound interfaces in different components
 */
export interface BattleRound {
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

/**
 * Extended BattleRound interface for battle generation
 * Used by the battle generation system that includes additional fields
 */
export interface BattleRoundLog {
  round: number;
  attacker: string;
  defender: string;
  damage: number;
  statsUsed: {
    attackerStrength: number;
    attackerAgility: number;
    attackerLuck: number;
    defenderDefense: number;
    defenderAgility: number;
  };
  healthAfter: {
    attacker: number;
    defender: number;
  };
  randomEvent: string | null;
  arenaObjectsUsed: string[]; // Array for battle generation
}

/**
 * Pre-generated battle round interface
 * Used by the pre-battle generation system
 */
export interface PreGeneratedBattleRound {
  round: number;
  attacker: string;
  defender: string;
  attackCommentary: string;
  defenseCommentary: string;
  attackerDamage: number;
  defenderDamage: number;
  healthAfter?: {
    attacker: number;
    defender: number;
  };
}

/**
 * Battle result interface
 */
export interface BattleResult {
  winner: string;
  rounds: BattleRound[];
  summary: string;
  totalRounds: number;
}

/**
 * Battle viewer mode
 */
export type BattleViewerMode = 'live' | 'replay';

/**
 * Round step for battle animation
 */
export type RoundStep = 'attack' | 'defense'; 