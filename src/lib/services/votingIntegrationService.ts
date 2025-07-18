import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { VoteSessionResults, FighterVoteStats } from '../types/voting';

export interface FighterVotingData {
  totalVotes: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  popularityScore: number;
  votingHistory: Array<{
    sessionId: string;
    roundNumber: number;
    voteCount: number;
    totalVotesInRound: number;
    percentage: number;
    won: boolean;
    date: string;
  }>;
  recentVotingTrend: 'rising' | 'falling' | 'stable';
  crowdFavorite: boolean;
}

export interface EnhancedFighterData {
  id: string;
  name: string;
  image: string;
  stats: {
    health: number;
    maxHealth?: number;
    strength: number;
    agility: number;
    defense: number;
    luck: number;
    age?: number;
    size?: string;
    build?: string;
    magic?: number;
    ranged?: number;
    intelligence?: number;
    uniqueAbilities?: string[];
  };
  matchHistory?: Array<{
    opponentId: string;
    result: 'win' | 'loss' | 'draw';
    date: string;
  }>;
  votingData?: FighterVotingData;
}

export class VotingIntegrationService {
  private fightersDir: string;
  private votingDataFile: string;

  constructor() {
    this.fightersDir = join(process.cwd(), 'public', 'vs', 'fighters');
    this.votingDataFile = join(process.cwd(), 'data', 'voting-sessions.json');
  }

  /**
   * Update fighter files with voting data from completed sessions
   */
  async integrateVotingData(votingResults: VoteSessionResults): Promise<void> {
    try {
      // Get all fighter files
      const fighterFiles = await readdir(this.fightersDir);
      const jsonFiles = fighterFiles.filter(file => file.endsWith('.json'));

      // Process each fighter file
      for (const file of jsonFiles) {
        const filePath = join(this.fightersDir, file);
        const fighterData = JSON.parse(await readFile(filePath, 'utf-8')) as EnhancedFighterData;
        
        // Calculate voting statistics for this fighter
        const votingData = this.calculateFighterVotingStats(fighterData.id, votingResults);
        
        if (votingData) {
          // Update fighter data with voting information
          fighterData.votingData = votingData;
          
          // Write updated fighter data back to file
          await writeFile(filePath, JSON.stringify(fighterData, null, 2));
          console.log(`Updated voting data for fighter: ${fighterData.name}`);
        }
      }
    } catch (error) {
      console.error('Error integrating voting data:', error);
      throw error;
    }
  }

  /**
   * Calculate voting statistics for a specific fighter
   */
  private calculateFighterVotingStats(fighterId: string, votingResults: VoteSessionResults): FighterVotingData | null {
    const fighterVotingHistory: FighterVotingData['votingHistory'] = [];
    let totalVotes = 0;
    let totalWins = 0;
    let totalLosses = 0;

    // Process each round in the voting session
    for (const round of votingResults.rounds) {
      const fighterInRound = round.fighters.find(f => f.fighterId === fighterId);
      
      if (fighterInRound) {
        const voteCount = fighterInRound.voteCount;
        const totalVotesInRound = round.totalVotes;
        const percentage = fighterInRound.percentage;
        
        totalVotes += voteCount;
        
        // Determine if fighter won this round
        const won = round.winner?.fighterId === fighterId;
        if (won) {
          totalWins++;
        } else {
          totalLosses++;
        }

        fighterVotingHistory.push({
          sessionId: votingResults.sessionId,
          roundNumber: round.roundNumber,
          voteCount,
          totalVotesInRound,
          percentage,
          won,
          date: round.startTime.toISOString()
        });
      }
    }

    if (totalVotes === 0) {
      return null; // Fighter wasn't in this voting session
    }

    const winRate = totalWins / (totalWins + totalLosses);
    const popularityScore = this.calculatePopularityScore(totalVotes, winRate, fighterVotingHistory);
    const recentVotingTrend = this.calculateVotingTrend(fighterVotingHistory);
    const crowdFavorite = popularityScore > 0.7; // High popularity threshold

    return {
      totalVotes,
      totalWins,
      totalLosses,
      winRate,
      popularityScore,
      votingHistory: fighterVotingHistory,
      recentVotingTrend,
      crowdFavorite
    };
  }

  /**
   * Calculate popularity score based on votes, win rate, and voting history
   */
  private calculatePopularityScore(totalVotes: number, winRate: number, votingHistory: FighterVotingData['votingHistory']): number {
    // Base score from total votes (normalized)
    const voteScore = Math.min(totalVotes / 100, 1); // Cap at 100 votes for max score
    
    // Win rate contribution
    const winRateScore = winRate;
    
    // Consistency bonus (voting in multiple rounds)
    const consistencyBonus = Math.min(votingHistory.length / 5, 0.2); // Max 0.2 bonus for 5+ rounds
    
    // Recent performance bonus
    const recentRounds = votingHistory.slice(-3); // Last 3 rounds
    const recentAverage = recentRounds.reduce((sum, round) => sum + round.percentage, 0) / recentRounds.length;
    const recentBonus = recentAverage / 100;
    
    // Weighted combination
    const popularityScore = (voteScore * 0.4) + (winRateScore * 0.3) + consistencyBonus + (recentBonus * 0.1);
    
    return Math.min(popularityScore, 1); // Cap at 1.0
  }

  /**
   * Calculate voting trend based on recent performance
   */
  private calculateVotingTrend(votingHistory: FighterVotingData['votingHistory']): 'rising' | 'falling' | 'stable' {
    if (votingHistory.length < 2) return 'stable';
    
    const recentRounds = votingHistory.slice(-3); // Last 3 rounds
    if (recentRounds.length < 2) return 'stable';
    
    const firstHalf = recentRounds.slice(0, Math.ceil(recentRounds.length / 2));
    const secondHalf = recentRounds.slice(Math.ceil(recentRounds.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, round) => sum + round.percentage, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, round) => sum + round.percentage, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 10) return 'rising';
    if (difference < -10) return 'falling';
    return 'stable';
  }

  /**
   * Get voting statistics for a specific fighter
   */
  async getFighterVotingStats(fighterId: string): Promise<FighterVotingData | null> {
    try {
      const fighterFiles = await readdir(this.fightersDir);
      const jsonFiles = fighterFiles.filter(file => file.endsWith('.json'));
      
      for (const file of jsonFiles) {
        const filePath = join(this.fightersDir, file);
        const fighterData = JSON.parse(await readFile(filePath, 'utf-8')) as EnhancedFighterData;
        
        if (fighterData.id === fighterId && fighterData.votingData) {
          return fighterData.votingData;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting fighter voting stats:', error);
      return null;
    }
  }

  /**
   * Get all fighters with their voting data for LLM analysis
   */
  async getAllFightersWithVotingData(): Promise<EnhancedFighterData[]> {
    try {
      const fighterFiles = await readdir(this.fightersDir);
      const jsonFiles = fighterFiles.filter(file => file.endsWith('.json'));
      const fighters: EnhancedFighterData[] = [];
      
      for (const file of jsonFiles) {
        const filePath = join(this.fightersDir, file);
        const fighterData = JSON.parse(await readFile(filePath, 'utf-8')) as EnhancedFighterData;
        fighters.push(fighterData);
      }
      
      // Sort by popularity score (descending)
      return fighters.sort((a, b) => {
        const scoreA = a.votingData?.popularityScore || 0;
        const scoreB = b.votingData?.popularityScore || 0;
        return scoreB - scoreA;
      });
    } catch (error) {
      console.error('Error getting all fighters with voting data:', error);
      return [];
    }
  }

  /**
   * Get crowd favorites (fighters with high popularity)
   */
  async getCrowdFavorites(): Promise<EnhancedFighterData[]> {
    const allFighters = await this.getAllFightersWithVotingData();
    return allFighters.filter(fighter => fighter.votingData?.crowdFavorite);
  }

  /**
   * Get trending fighters (rising popularity)
   */
  async getTrendingFighters(): Promise<EnhancedFighterData[]> {
    const allFighters = await this.getAllFightersWithVotingData();
    return allFighters.filter(fighter => fighter.votingData?.recentVotingTrend === 'rising');
  }
}

export const votingIntegrationService = new VotingIntegrationService(); 