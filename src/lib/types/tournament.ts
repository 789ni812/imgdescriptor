import { Fighter } from '../stores/fightingGameStore';
import { PreGeneratedBattleRound } from '../stores/fightingGameStore';

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