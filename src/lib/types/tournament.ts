import { Fighter } from '../stores/fightingGameStore';
import { PreGeneratedBattleRound } from '../stores/fightingGameStore';
import { ArenaMetadata } from '../utils/arenaUtils';

export interface Tournament {
  id: string;
  name: string;
  createdAt: Date;
  status: 'setup' | 'in_progress' | 'completed';
  fighters: Fighter[];
  brackets: TournamentBracket[];
  currentRound: number;
  winner?: Fighter;
  totalRounds: number;
  // New fields for enhanced tournament experience
  commentary?: TournamentCommentary[];
  historicalData?: TournamentHistoricalData;
  arenaName?: string;
  arenaDescription?: string;
}

export interface TournamentBracket {
  round: number;
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  id: string;
  fighterA: Fighter | null;
  fighterB: Fighter | null;
  winner?: Fighter;
  battleLog?: PreGeneratedBattleRound[];
  status: 'pending' | 'in_progress' | 'completed';
  round: number;
  matchNumber: number;
  // New fields for enhanced match experience
  preMatchCommentary?: string;
  postMatchCommentary?: string;
  battleSummary?: string;
  notableMoments?: string[];
  crowdReactions?: string[];
  arena?: ArenaMetadata; // Assigned arena for this match
}

// New interface for tournament commentary
export interface TournamentCommentary {
  id: string;
  type: 'opening' | 'introduction' | 'transition' | 'progress' | 'championship' | 'conclusion';
  matchId?: string;
  round: number;
  matchNumber?: number;
  commentary: string;
  generatedAt: Date;
  context: {
    completedMatches: number;
    remainingFighters: string[];
    notableMoments: string[];
    tournamentProgress: number;
    currentStakes: string;
  };
}

// New interface for tournament historical data
export interface TournamentHistoricalData {
  tournamentId: string;
  startDate: Date;
  endDate?: Date;
  totalMatches: number;
  completedMatches: number;
  fighterStats: FighterTournamentStats[];
  notableMoments: TournamentMoment[];
  crowdFavorites: string[];
  upsets: string[];
  dominantPerformances: string[];
  tournamentHighlights: string[];
  arenaEvents: ArenaEvent[];
}

export interface FighterTournamentStats {
  fighterId: string;
  fighterName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  averageDamagePerRound: number;
  quickestVictory?: number; // rounds
  longestBattle?: number; // rounds
  mostDamagingAttack?: number;
  crowdReactions: string[];
  memorableQuotes: string[];
  fightingStyle: string;
  tournamentJourney: string;
  eliminated?: boolean; // Add missing property
}

export interface TournamentMoment {
  id: string;
  type: 'upset' | 'dominance' | 'drama' | 'skill' | 'crowd' | 'arena';
  description: string;
  matchId?: string;
  round: number;
  fighters: string[];
  impact: 'low' | 'medium' | 'high' | 'legendary';
  timestamp: Date;
}

export interface ArenaEvent {
  id: string;
  type: 'hazard' | 'advantage' | 'spectacle' | 'interference';
  description: string;
  matchId?: string;
  round: number;
  impact: string;
  timestamp: Date;
}

export interface TournamentProgress {
  currentRound: number;
  totalRounds: number;
  completedMatches: number;
  totalMatches: number;
  currentMatch?: TournamentMatch;
  nextMatch?: TournamentMatch;
}

export interface TournamentStandings {
  fighter: Fighter;
  wins: number;
  losses: number;
  roundsAdvanced: number;
  eliminated: boolean;
}

// Tournament creation request
export interface CreateTournamentRequest {
  fighterIds: string[];
  arenaId?: string;
}

// Tournament response
export interface TournamentResponse {
  success: boolean;
  tournament?: Tournament;
  error?: string;
}

// Tournament list response
export interface TournamentListResponse {
  success: boolean;
  tournaments: Tournament[];
  error?: string;
} 