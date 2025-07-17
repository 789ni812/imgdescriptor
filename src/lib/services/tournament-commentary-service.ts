import { 
  Tournament, 
  TournamentMatch, 
  TournamentCommentary, 
  TournamentHistoricalData,
  FighterTournamentStats,
  TournamentMoment
} from '../types/tournament';
import { Fighter } from '../stores/fightingGameStore';
import { PreGeneratedBattleRound } from '../stores/fightingGameStore';

export class TournamentCommentaryService {
  private static instance: TournamentCommentaryService;

  private constructor() {}

  public static getInstance(): TournamentCommentaryService {
    if (!TournamentCommentaryService.instance) {
      TournamentCommentaryService.instance = new TournamentCommentaryService();
    }
    return TournamentCommentaryService.instance;
  }

  /**
   * Generate commentary via API
   */
  private async generateCommentaryViaAPI(
    type: string,
    tournamentName: string,
    arenaName: string,
    matchNumber: number,
    totalMatches: number,
    fighterAName?: string,
    fighterBName?: string,
    winnerName?: string,
    historicalContext?: {
      completedMatches: number;
      remainingFighters: string[];
      notableMoments: string[];
    },
    fighterStats?: {
      fighterA?: {
        name: string;
        stats: {
          strength: number;
          agility: number;
          health: number;
          defense: number;
          intelligence: number;
          uniqueAbilities: string[];
        };
        tournamentRecord?: {
          matchesPlayed: number;
          wins: number;
          losses: number;
          totalDamageDealt: number;
          totalDamageTaken: number;
          averageDamagePerRound: number;
          quickestVictory?: number;
          longestBattle?: number;
          mostDamagingAttack?: number;
          fightingStyle: string;
          tournamentJourney: string;
        };
      };
      fighterB?: {
        name: string;
        stats: {
          strength: number;
          agility: number;
          health: number;
          defense: number;
          intelligence: number;
          uniqueAbilities: string[];
        };
        tournamentRecord?: {
          matchesPlayed: number;
          wins: number;
          losses: number;
          totalDamageDealt: number;
          totalDamageTaken: number;
          averageDamagePerRound: number;
          quickestVictory?: number;
          longestBattle?: number;
          mostDamagingAttack?: number;
          fightingStyle: string;
          tournamentJourney: string;
        };
      };
    }
  ): Promise<string> {
    const response = await fetch('/api/fighting-game/generate-tournament-commentary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commentaryType: type,
        tournamentName,
        arenaName,
        currentMatch: matchNumber,
        totalMatches,
        fighterA: fighterAName,
        fighterB: fighterBName,
        winner: winnerName,
        tournamentContext: historicalContext,
        fighterStats
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate commentary: ${response.statusText}`);
    }

    const data = await response.json();
    return data.commentary;
  }

  /**
   * Generate and store commentary for a specific match
   */
  public async generateMatchCommentary(
    tournament: Tournament,
    match: TournamentMatch,
    historicalData: TournamentHistoricalData
  ): Promise<TournamentCommentary> {
    const context = this.buildCommentaryContext(tournament, match, historicalData);
    
    // Use match arena if available, otherwise use tournament arena, then fall back to default
    const arenaName = match.arena?.name || tournament.arenaName || 'Tournament Arena';
    
    // Build fighter stats for commentary
    const fighterStats = this.buildFighterStatsForCommentary(match, historicalData);
    
    const commentary = await this.generateCommentaryViaAPI(
      'introduction',
      tournament.name,
      arenaName,
      match.matchNumber,
      this.getTotalMatches(tournament),
      match.fighterA?.name,
      match.fighterB?.name,
      undefined, // No winner yet
      {
        completedMatches: historicalData.completedMatches,
        remainingFighters: this.getRemainingFighters(tournament, historicalData),
        notableMoments: historicalData.notableMoments.map(m => m.description)
      },
      fighterStats
    );

    const tournamentCommentary: TournamentCommentary = {
      id: `commentary-${match.id}`,
      type: 'introduction',
      matchId: match.id,
      round: match.round,
      matchNumber: match.matchNumber,
      commentary,
      generatedAt: new Date(),
      context
    };

    return tournamentCommentary;
  }

  /**
   * Generate tournament opening commentary
   */
  public async generateTournamentOpening(
    tournament: Tournament
  ): Promise<TournamentCommentary> {
    const commentary = await this.generateCommentaryViaAPI(
      'opening',
      tournament.name,
      tournament.arenaName || 'Tournament Arena',
      1,
      this.getTotalMatches(tournament),
      undefined,
      undefined,
      undefined,
      {
        completedMatches: 0,
        remainingFighters: tournament.fighters.map(f => f.name),
        notableMoments: []
      }
    );

    const tournamentCommentary: TournamentCommentary = {
      id: `commentary-opening-${tournament.id}`,
      type: 'opening',
      round: 1,
      commentary,
      generatedAt: new Date(),
      context: {
        completedMatches: 0,
        remainingFighters: tournament.fighters.map(f => f.name),
        notableMoments: [],
        tournamentProgress: 0,
        currentStakes: 'Tournament beginning'
      }
    };

    return tournamentCommentary;
  }

  /**
   * Generate transition commentary between rounds
   */
  public async generateTransitionCommentary(
    tournament: Tournament,
    fromRound: number,
    toRound: number,
    historicalData: TournamentHistoricalData
  ): Promise<TournamentCommentary> {
    const commentary = await this.generateCommentaryViaAPI(
      'transition',
      tournament.name,
      tournament.arenaName || 'Tournament Arena',
      this.getMatchesInRound(tournament, toRound).length,
      this.getTotalMatches(tournament),
      undefined,
      undefined,
      undefined,
      {
        completedMatches: historicalData.completedMatches,
        remainingFighters: this.getRemainingFighters(tournament, historicalData),
        notableMoments: historicalData.notableMoments.map(m => m.description)
      }
    );

    const tournamentCommentary: TournamentCommentary = {
      id: `commentary-transition-${tournament.id}-${toRound}`,
      type: 'transition',
      round: toRound,
      commentary,
      generatedAt: new Date(),
      context: {
        completedMatches: historicalData.completedMatches,
        remainingFighters: this.getRemainingFighters(tournament, historicalData),
        notableMoments: historicalData.notableMoments.map(m => m.description),
        tournamentProgress: (historicalData.completedMatches / historicalData.totalMatches) * 100,
        currentStakes: `Round ${toRound} beginning`
      }
    };

    return tournamentCommentary;
  }

  /**
   * Generate championship commentary for final matches
   */
  public async generateChampionshipCommentary(
    tournament: Tournament,
    match: TournamentMatch,
    historicalData: TournamentHistoricalData
  ): Promise<TournamentCommentary> {
    // Use match arena if available, otherwise use tournament arena, then fall back to default
    const arenaName = match.arena?.name || tournament.arenaName || 'Tournament Arena';
    
    const commentary = await this.generateCommentaryViaAPI(
      'championship',
      tournament.name,
      arenaName,
      match.matchNumber,
      this.getTotalMatches(tournament),
      match.fighterA?.name,
      match.fighterB?.name,
      undefined,
      {
        completedMatches: historicalData.completedMatches,
        remainingFighters: this.getRemainingFighters(tournament, historicalData),
        notableMoments: historicalData.notableMoments.map(m => m.description)
      }
    );

    const tournamentCommentary: TournamentCommentary = {
      id: `commentary-championship-${match.id}`,
      type: 'championship',
      matchId: match.id,
      round: match.round,
      matchNumber: match.matchNumber,
      commentary,
      generatedAt: new Date(),
      context: {
        completedMatches: historicalData.completedMatches,
        remainingFighters: this.getRemainingFighters(tournament, historicalData),
        notableMoments: historicalData.notableMoments.map(m => m.description),
        tournamentProgress: (historicalData.completedMatches / historicalData.totalMatches) * 100,
        currentStakes: 'Championship match'
      }
    };

    return tournamentCommentary;
  }

  /**
   * Generate tournament conclusion commentary
   */
  public async generateTournamentConclusion(
    tournament: Tournament,
    winner: Fighter,
    historicalData: TournamentHistoricalData
  ): Promise<TournamentCommentary> {
    const commentary = await this.generateCommentaryViaAPI(
      'conclusion',
      tournament.name,
      tournament.arenaName || 'Tournament Arena',
      this.getTotalMatches(tournament),
      this.getTotalMatches(tournament),
      undefined,
      undefined,
      winner.name,
      {
        completedMatches: historicalData.completedMatches,
        remainingFighters: [winner.name],
        notableMoments: historicalData.notableMoments.map(m => m.description)
      }
    );

    const tournamentCommentary: TournamentCommentary = {
      id: `commentary-conclusion-${tournament.id}`,
      type: 'conclusion',
      round: tournament.totalRounds,
      commentary,
      generatedAt: new Date(),
      context: {
        completedMatches: historicalData.completedMatches,
        remainingFighters: [winner.name],
        notableMoments: historicalData.notableMoments.map(m => m.description),
        tournamentProgress: 100,
        currentStakes: 'Tournament champion crowned'
      }
    };

    return tournamentCommentary;
  }

  /**
   * Update historical data after a match completion
   */
  public updateHistoricalData(
    tournament: Tournament,
    match: TournamentMatch,
    historicalData: TournamentHistoricalData,
    battleLog: PreGeneratedBattleRound[]
  ): TournamentHistoricalData {
    const updatedData = { ...historicalData };
    
    // Update completed matches
    updatedData.completedMatches += 1;
    
    // Update fighter stats
    if (match.fighterA && match.fighterB && match.winner) {
      this.updateFighterStats(updatedData, match, battleLog);
    }
    
    // Add notable moments
    const notableMoment = this.createNotableMoment(match, battleLog);
    if (notableMoment) {
      updatedData.notableMoments.push(notableMoment);
    }
    
    // Update tournament highlights
    this.updateTournamentHighlights(updatedData, match, battleLog);
    
    return updatedData;
  }

  /**
   * Initialize historical data for a new tournament
   */
  public initializeHistoricalData(tournament: Tournament): TournamentHistoricalData {
    return {
      tournamentId: tournament.id,
      startDate: new Date(),
      totalMatches: this.getTotalMatches(tournament),
      completedMatches: 0,
      fighterStats: tournament.fighters.map(fighter => ({
        fighterId: fighter.id,
        fighterName: fighter.name,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        averageDamagePerRound: 0,
        crowdReactions: [],
        memorableQuotes: [],
        fightingStyle: this.analyzeFightingStyle(fighter),
        tournamentJourney: 'Tournament beginning'
      })),
      notableMoments: [],
      crowdFavorites: [],
      upsets: [],
      dominantPerformances: [],
      tournamentHighlights: [],
      arenaEvents: []
    };
  }

  // Helper methods
  private buildCommentaryContext(
    tournament: Tournament,
    match: TournamentMatch,
    historicalData: TournamentHistoricalData
  ) {
    return {
      completedMatches: historicalData.completedMatches,
      remainingFighters: this.getRemainingFighters(tournament, historicalData),
      notableMoments: historicalData.notableMoments.map(m => m.description),
      tournamentProgress: (historicalData.completedMatches / historicalData.totalMatches) * 100,
      currentStakes: this.getCurrentStakes(match, tournament)
    };
  }

  private getTotalMatches(tournament: Tournament): number {
    return tournament.brackets.reduce((total, bracket) => total + bracket.matches.length, 0);
  }

  private getMatchesInRound(tournament: Tournament, round: number): TournamentMatch[] {
    const bracket = tournament.brackets.find(b => b.round === round);
    return bracket?.matches || [];
  }

  private getRemainingFighters(tournament: Tournament, historicalData: TournamentHistoricalData): string[] {
    const eliminatedFighters = historicalData.fighterStats
      .filter(stat => stat.eliminated)
      .map(stat => stat.fighterName);
    
    return tournament.fighters
      .filter(fighter => !eliminatedFighters.includes(fighter.name))
      .map(fighter => fighter.name);
  }

  private getCurrentStakes(match: TournamentMatch, tournament: Tournament): string {
    if (match.round === tournament.totalRounds) {
      return 'Championship match';
    } else if (match.round === tournament.totalRounds - 1) {
      return 'Semi-finals';
    } else if (match.round === 1) {
      return 'Opening round';
    } else {
      return `Round ${match.round}`;
    }
  }

  private updateFighterStats(
    historicalData: TournamentHistoricalData,
    match: TournamentMatch,
    battleLog: PreGeneratedBattleRound[]
  ) {
    if (!match.fighterA || !match.fighterB || !match.winner) return;

    const winner = match.winner;
    const loser = match.winner.id === match.fighterA.id ? match.fighterB : match.fighterA;
    
    // Calculate damage statistics
    const winnerDamage = battleLog
      .filter(round => round.attacker === winner.name)
      .reduce((sum, round) => sum + (round.attackerDamage || 0), 0);
    const loserDamage = battleLog
      .filter(round => round.attacker === loser.name)
      .reduce((sum, round) => sum + (round.attackerDamage || 0), 0);

    // Update winner stats
    const winnerStats = historicalData.fighterStats.find(s => s.fighterId === winner.id);
    if (winnerStats) {
      winnerStats.matchesPlayed += 1;
      winnerStats.wins += 1;
      winnerStats.totalDamageDealt += winnerDamage;
      winnerStats.totalDamageTaken += loserDamage;
      winnerStats.averageDamagePerRound = winnerStats.totalDamageDealt / winnerStats.matchesPlayed;
      winnerStats.tournamentJourney = this.updateTournamentJourney(winnerStats, 'win', match.round);
    }

    // Update loser stats
    const loserStats = historicalData.fighterStats.find(s => s.fighterId === loser.id);
    if (loserStats) {
      loserStats.matchesPlayed += 1;
      loserStats.losses += 1;
      loserStats.totalDamageDealt += loserDamage;
      loserStats.totalDamageTaken += winnerDamage;
      loserStats.averageDamagePerRound = loserStats.totalDamageDealt / loserStats.matchesPlayed;
      loserStats.tournamentJourney = this.updateTournamentJourney(loserStats, 'loss', match.round);
      loserStats.eliminated = true; // Mark as eliminated
    }
  }

  private createNotableMoment(match: TournamentMatch, battleLog: PreGeneratedBattleRound[]): TournamentMoment | null {
    if (!match.fighterA || !match.fighterB) return null;

    const totalDamage = battleLog.reduce((sum, round) => sum + (round.attackerDamage || 0), 0);
    const rounds = battleLog.length;
    
    let type: TournamentMoment['type'] = 'skill';
    let description = '';
    let impact: TournamentMoment['impact'] = 'medium';

    // Determine moment type and impact
    if (rounds <= 3 && totalDamage > 200) {
      type = 'dominance';
      description = `${match.winner?.name} dominated with a quick victory in ${rounds} rounds`;
      impact = 'high';
    } else if (rounds >= 10) {
      type = 'drama';
      description = `${match.fighterA.name} vs ${match.fighterB.name} went the distance in an epic ${rounds}-round battle`;
      impact = 'high';
    } else if (totalDamage > 300) {
      type = 'skill';
      description = `${match.winner?.name} showcased incredible power with ${totalDamage} total damage`;
      impact = 'medium';
    }

    if (!description) return null;

    return {
      id: `moment-${match.id}-${Date.now()}`,
      type,
      description,
      matchId: match.id,
      round: match.round,
      fighters: [match.fighterA.name, match.fighterB.name],
      impact,
      timestamp: new Date()
    };
  }

  private updateTournamentHighlights(
    historicalData: TournamentHistoricalData,
    match: TournamentMatch,
    battleLog: PreGeneratedBattleRound[]
  ) {
    const totalDamage = battleLog.reduce((sum, round) => sum + (round.attackerDamage || 0), 0);
    const rounds = battleLog.length;

    if (rounds <= 3 && totalDamage > 200) {
      historicalData.dominantPerformances.push(
        `${match.winner?.name} dominated in ${rounds} rounds with ${totalDamage} damage`
      );
    }

    if (rounds >= 10) {
      historicalData.tournamentHighlights.push(
        `${match.fighterA?.name} vs ${match.fighterB?.name} - Epic ${rounds}-round battle`
      );
    }
  }

  private analyzeFightingStyle(fighter: Fighter): string {
    const { strength, agility, health, defense, intelligence } = fighter.stats;
    
    if (strength > 150 && health > 800) return 'Powerhouse Bruiser';
    if (agility > 80 && (intelligence || 0) > 70) return 'Tactical Speedster';
    if (defense > 80 && health > 700) return 'Defensive Tank';
    if ((intelligence || 0) > 80 && agility > 70) return 'Strategic Mastermind';
    if (strength > 120 && agility > 70) return 'Balanced Warrior';
    
    return 'Adaptive Fighter';
  }

  private updateTournamentJourney(
    stats: FighterTournamentStats,
    result: 'win' | 'loss',
    round: number
  ): string {
    if (result === 'win') {
      return `Advanced to round ${round + 1} with ${stats.wins} victories`;
    } else {
      return `Eliminated in round ${round} after ${stats.matchesPlayed} matches`;
    }
  }

  /**
   * Build fighter stats for commentary generation
   */
  private buildFighterStatsForCommentary(
    match: TournamentMatch,
    historicalData: TournamentHistoricalData
  ) {
    const fighterStats: {
      fighterA?: {
        name: string;
        stats: {
          strength: number;
          agility: number;
          health: number;
          defense: number;
          intelligence: number;
          uniqueAbilities: string[];
        };
        tournamentRecord?: {
          matchesPlayed: number;
          wins: number;
          losses: number;
          totalDamageDealt: number;
          totalDamageTaken: number;
          averageDamagePerRound: number;
          quickestVictory?: number;
          longestBattle?: number;
          mostDamagingAttack?: number;
          fightingStyle: string;
          tournamentJourney: string;
        };
      };
      fighterB?: {
        name: string;
        stats: {
          strength: number;
          agility: number;
          health: number;
          defense: number;
          intelligence: number;
          uniqueAbilities: string[];
        };
        tournamentRecord?: {
          matchesPlayed: number;
          wins: number;
          losses: number;
          totalDamageDealt: number;
          totalDamageTaken: number;
          averageDamagePerRound: number;
          quickestVictory?: number;
          longestBattle?: number;
          mostDamagingAttack?: number;
          fightingStyle: string;
          tournamentJourney: string;
        };
      };
    } = {};

    // Build fighter A stats
    if (match.fighterA) {
      const fighterAStats = historicalData.fighterStats.find(s => s.fighterId === match.fighterA!.id);
      fighterStats.fighterA = {
        name: match.fighterA.name,
        stats: {
          strength: match.fighterA.stats.strength,
          agility: match.fighterA.stats.agility,
          health: match.fighterA.stats.health,
          defense: match.fighterA.stats.defense,
          intelligence: match.fighterA.stats.intelligence || 0,
          uniqueAbilities: match.fighterA.stats.uniqueAbilities || []
        },
        tournamentRecord: fighterAStats ? {
          matchesPlayed: fighterAStats.matchesPlayed,
          wins: fighterAStats.wins,
          losses: fighterAStats.losses,
          totalDamageDealt: fighterAStats.totalDamageDealt,
          totalDamageTaken: fighterAStats.totalDamageTaken,
          averageDamagePerRound: fighterAStats.averageDamagePerRound,
          quickestVictory: fighterAStats.quickestVictory,
          longestBattle: fighterAStats.longestBattle,
          mostDamagingAttack: fighterAStats.mostDamagingAttack,
          fightingStyle: fighterAStats.fightingStyle,
          tournamentJourney: fighterAStats.tournamentJourney
        } : undefined
      };
    }

    // Build fighter B stats
    if (match.fighterB) {
      const fighterBStats = historicalData.fighterStats.find(s => s.fighterId === match.fighterB!.id);
      fighterStats.fighterB = {
        name: match.fighterB.name,
        stats: {
          strength: match.fighterB.stats.strength,
          agility: match.fighterB.stats.agility,
          health: match.fighterB.stats.health,
          defense: match.fighterB.stats.defense,
          intelligence: match.fighterB.stats.intelligence || 0,
          uniqueAbilities: match.fighterB.stats.uniqueAbilities || []
        },
        tournamentRecord: fighterBStats ? {
          matchesPlayed: fighterBStats.matchesPlayed,
          wins: fighterBStats.wins,
          losses: fighterBStats.losses,
          totalDamageDealt: fighterBStats.totalDamageDealt,
          totalDamageTaken: fighterBStats.totalDamageTaken,
          averageDamagePerRound: fighterBStats.averageDamagePerRound,
          quickestVictory: fighterBStats.quickestVictory,
          longestBattle: fighterBStats.longestBattle,
          mostDamagingAttack: fighterBStats.mostDamagingAttack,
          fightingStyle: fighterBStats.fightingStyle,
          tournamentJourney: fighterBStats.tournamentJourney
        } : undefined
      };
    }

    return fighterStats;
  }
} 