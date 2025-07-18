import { Tournament, TournamentBracket, TournamentMatch } from '../types/tournament';
import { Fighter } from '../stores/fightingGameStore';

/**
 * Generate a tournament name based on current date and time
 */
export function generateTournamentName(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  return `Tournament ${dateStr} ${timeStr}`;
}

/**
 * Calculate the number of rounds needed for a tournament
 */
export function calculateTotalRounds(numFighters: number): number {
  return Math.ceil(Math.log2(numFighters));
}

/**
 * Generate a single elimination bracket for the given fighters
 */
export function generateBracket(fighters: Fighter[]): TournamentBracket[] {
  const numFighters = fighters.length;
  const totalRounds = calculateTotalRounds(numFighters);
  const brackets: TournamentBracket[] = [];
  
  // Shuffle fighters for random seeding
  const shuffledFighters = [...fighters].sort(() => Math.random() - 0.5);
  
  // Generate first round matches
  const firstRoundMatches: TournamentMatch[] = [];
  const idealBracketSize = Math.pow(2, totalRounds);
  
  let fighterIndex = 0;
  let matchNumber = 1;
  
  // Create matches for first round
  for (let i = 0; i < idealBracketSize / 2; i++) {
    const fighterA = shuffledFighters[fighterIndex] || null;
    const fighterB = shuffledFighters[fighterIndex + 1] || null;
    
    if (fighterA && fighterB) {
      // Normal match
      firstRoundMatches.push({
        id: `match-1-${matchNumber}`,
        fighterA,
        fighterB,
        status: 'pending',
        round: 1,
        matchNumber
      });
      fighterIndex += 2;
    } else if (fighterA && !fighterB) {
      // Bye - fighter advances automatically
      firstRoundMatches.push({
        id: `match-1-${matchNumber}`,
        fighterA,
        fighterB: null, // No opponent for bye
        winner: fighterA,
        status: 'completed',
        round: 1,
        matchNumber
      });
      fighterIndex += 1;
    } else {
      // No more fighters, skip this match
      continue;
    }
    matchNumber++;
  }
  
  brackets.push({
    round: 1,
    matches: firstRoundMatches
  });
  
  // Generate subsequent rounds (empty for now, will be populated as tournament progresses)
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = Math.pow(2, totalRounds - round);
    const roundMatches: TournamentMatch[] = [];
    
    for (let i = 1; i <= matchesInRound; i++) {
              // Create placeholder matches that will be filled as tournament progresses
        roundMatches.push({
          id: `match-${round}-${i}`,
          fighterA: null, // Will be filled when fighters advance
          fighterB: null, // Will be filled when fighters advance
          status: 'pending',
          round,
          matchNumber: i
        });
    }
    
    brackets.push({
      round,
      matches: roundMatches
    });
  }
  
  return brackets;
}

/**
 * Advance a fighter to the next round
 */
export function advanceFighterToNextRound(
  brackets: TournamentBracket[], 
  winner: Fighter, 
  currentMatch: TournamentMatch
): TournamentBracket[] {
  const nextRound = currentMatch.round + 1;
  const nextMatchNumber = Math.ceil(currentMatch.matchNumber / 2);
  
  // Find the next match
  const nextBracket = brackets.find(b => b.round === nextRound);
  if (!nextBracket) return brackets;
  
  const nextMatch = nextBracket.matches.find(m => m.matchNumber === nextMatchNumber);
  if (!nextMatch) return brackets;
  
  // Update the next match with the winner
  const updatedBrackets = brackets.map(bracket => {
    if (bracket.round === nextRound) {
      return {
        ...bracket,
        matches: bracket.matches.map(match => {
          if (match.matchNumber === nextMatchNumber) {
            // Determine if this is the first or second fighter slot
            const isFirstSlot = currentMatch.matchNumber % 2 === 1;
                         return {
               ...match,
               fighterA: isFirstSlot ? winner : match.fighterA,
               fighterB: isFirstSlot ? match.fighterB : winner,
               status: (match.fighterA && match.fighterB) ? 'pending' as const : 'pending' as const
             };
          }
          return match;
        })
      };
    }
    return bracket;
  });
  
  return updatedBrackets;
}

/**
 * Check if tournament is complete
 */
export function isTournamentComplete(tournament: Tournament): boolean {
  const finalBracket = tournament.brackets[tournament.brackets.length - 1];
  if (!finalBracket || finalBracket.matches.length === 0) return false;
  
  const finalMatch = finalBracket.matches[0];
  return finalMatch.status === 'completed' && finalMatch.winner !== undefined;
}

/**
 * Get tournament winner
 */
export function getTournamentWinner(tournament: Tournament): Fighter | undefined {
  if (!isTournamentComplete(tournament)) return undefined;
  
  const finalBracket = tournament.brackets[tournament.brackets.length - 1];
  const finalMatch = finalBracket.matches[0];
  return finalMatch.winner;
}

/**
 * Get current round progress
 */
export function getTournamentProgress(tournament: Tournament) {
  const totalMatches = tournament.brackets.reduce((sum, bracket) => 
    sum + bracket.matches.length, 0
  );
  const completedMatches = tournament.brackets.reduce((sum, bracket) => 
    sum + bracket.matches.filter(match => match.status === 'completed').length, 0
  );
  
  return {
    currentRound: tournament.currentRound,
    totalRounds: tournament.totalRounds,
    completedMatches,
    totalMatches
  };
}

/**
 * Get next pending match
 */
export function getNextPendingMatch(tournament: Tournament): TournamentMatch | undefined {
  for (const bracket of tournament.brackets) {
    const pendingMatch = bracket.matches.find(match => 
      match.status === 'pending' && match.fighterA && match.fighterB
    );
    if (pendingMatch) return pendingMatch;
  }
  return undefined;
} 