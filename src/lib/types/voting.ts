import { FighterStats } from './fighter';

/**
 * Voting System Types
 * 
 * This file contains all the types and interfaces needed for the fighter voting system,
 * including sessions, rounds, results, and status management.
 */

/**
 * Status types for voting sessions
 */
export type VoteSessionStatus = 'active' | 'completed' | 'cancelled';

/**
 * Status types for voting rounds
 */
export type VoteRoundStatus = 'pending' | 'active' | 'completed';

/**
 * Fighter representation in voting context
 */
export interface FighterVote {
  fighterId: string;
  name: string;
  imageUrl: string;
  description: string;
  stats: FighterStats;
}

/**
 * Individual vote result
 */
export interface VoteResult {
  id: string;
  roundId: string;
  sessionId: string;
  fighterId: string;
  voterId: string;
  timestamp: Date;
  ipAddress: string;
}

/**
 * A single voting round within a session
 */
export interface VoteRound {
  id: string;
  sessionId: string;
  roundNumber: number;
  status: VoteRoundStatus;
  startTime: Date;
  endTime: Date;
  fighters: FighterVote[];
  votes: VoteResult[];
  totalVotes: number;
  winner: FighterVote | null;
}

/**
 * Complete voting session
 */
export interface VoteSession {
  id: string;
  title: string;
  description: string;
  status: VoteSessionStatus;
  startTime: Date;
  endTime: Date;
  rounds: VoteRound[];
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Vote statistics for a fighter in a round
 */
export interface FighterVoteStats {
  fighterId: string;
  name: string;
  imageUrl: string;
  voteCount: number;
  percentage: number;
}

/**
 * Round results with vote statistics
 */
export interface VoteRoundResults {
  roundId: string;
  sessionId: string;
  roundNumber: number;
  status: VoteRoundStatus;
  startTime: Date;
  endTime: Date;
  fighters: FighterVoteStats[];
  totalVotes: number;
  winner: FighterVote | null;
}

/**
 * Session results with round summaries
 */
export interface VoteSessionResults {
  sessionId: string;
  title: string;
  status: VoteSessionStatus;
  totalVotes: number;
  rounds: VoteRoundResults[];
  finalWinner: FighterVote | null;
} 