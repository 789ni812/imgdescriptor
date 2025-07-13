import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface FighterStats {
  name: string;
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  averageDamageDealt: number;
  averageDamageTaken: number;
  averageRoundsSurvived: number;
  totalRounds: number;
  currentStats: {
    [key: string]: number | string;
  };
  opponents: string[];
  arenas: string[];
  lastBattle: string;
  imageUrl?: string;
}

interface BattleData {
  metadata: {
    timestamp: string;
    fighterA: {
      name: string;
      imageUrl: string;
      stats: {
        health: number;
        strength: number;
        [key: string]: number;
      };
    };
    fighterB: {
      name: string;
      imageUrl: string;
      stats: {
        health: number;
        strength: number;
        [key: string]: number;
      };
    };
    arena: {
      name: string;
    };
    winner: string;
    totalRounds: number;
  };
  battleLog: Array<{
    attacker: string;
    defender: string;
    attackerDamage: number;
    defenderDamage: number;
    healthAfter: {
      attacker: number;
      defender: number;
    };
  }>;
}

export async function GET() {
  try {
    const tournamentsDir = join(process.cwd(), 'public', 'tournaments');
    const files = await readdir(tournamentsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const fighterStats: Map<string, FighterStats> = new Map();
    
    // Process each tournament file
    for (const filename of jsonFiles) {
      try {
        const filePath = join(tournamentsDir, filename);
        const fileContent = await readFile(filePath, 'utf-8');
        const battleData: BattleData = JSON.parse(fileContent);
        
        // Extract fighter stats
        const fighterAInitialStats = battleData.metadata.fighterA.stats;
        const fighterBInitialStats = battleData.metadata.fighterB.stats;
        
        const { metadata, battleLog } = battleData;
        const { fighterA, fighterB, winner, totalRounds, timestamp } = metadata;
        
        // Initialize fighters if not exists
        if (!fighterStats.has(fighterA.name)) {
          fighterStats.set(fighterA.name, {
            name: fighterA.name,
            totalBattles: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            averageDamageDealt: 0,
            averageDamageTaken: 0,
            averageRoundsSurvived: 0,
            totalRounds: 0,
            currentStats: fighterAInitialStats,
            opponents: [],
            arenas: [],
            lastBattle: timestamp,
            imageUrl: fighterA.imageUrl
          });
        }
        
        if (!fighterStats.has(fighterB.name)) {
          fighterStats.set(fighterB.name, {
            name: fighterB.name,
            totalBattles: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            averageDamageDealt: 0,
            averageDamageTaken: 0,
            averageRoundsSurvived: 0,
            totalRounds: 0,
            currentStats: fighterBInitialStats,
            opponents: [],
            arenas: [],
            lastBattle: timestamp,
            imageUrl: fighterB.imageUrl
          });
        }
        
        // Update fighter stats
        const fighterAStats = fighterStats.get(fighterA.name)!;
        const fighterBStats = fighterStats.get(fighterB.name)!;
        
        // Increment battle counts
        fighterAStats.totalBattles++;
        fighterBStats.totalBattles++;
        
        // Update win/loss records
        if (winner === fighterA.name) {
          fighterAStats.wins++;
          fighterBStats.losses++;
        } else {
          fighterBStats.wins++;
          fighterAStats.losses++;
        }
        
        // Add opponents and arenas
        if (!fighterAStats.opponents.includes(fighterB.name)) {
          fighterAStats.opponents.push(fighterB.name);
        }
        if (!fighterBStats.opponents.includes(fighterA.name)) {
          fighterBStats.opponents.push(fighterA.name);
        }
        
        if (!fighterAStats.arenas.includes(metadata.arena.name)) {
          fighterAStats.arenas.push(metadata.arena.name);
        }
        if (!fighterBStats.arenas.includes(metadata.arena.name)) {
          fighterBStats.arenas.push(metadata.arena.name);
        }
        
        // Update last battle timestamp
        if (new Date(timestamp) > new Date(fighterAStats.lastBattle)) {
          fighterAStats.lastBattle = timestamp;
        }
        if (new Date(timestamp) > new Date(fighterBStats.lastBattle)) {
          fighterBStats.lastBattle = timestamp;
        }
        
        // Calculate damage and rounds from battle log
        let fighterADamageDealt = 0;
        let fighterADamageTaken = 0;
        let fighterBDamageDealt = 0;
        let fighterBDamageTaken = 0;
        
        battleLog.forEach(round => {
          if (round.attacker === fighterA.name) {
            fighterADamageDealt += round.attackerDamage;
            fighterBDamageTaken += round.defenderDamage;
          } else {
            fighterBDamageDealt += round.attackerDamage;
            fighterADamageTaken += round.defenderDamage;
          }
        });
        
        fighterAStats.totalDamageDealt += fighterADamageDealt;
        fighterAStats.totalDamageTaken += fighterADamageTaken;
        fighterAStats.totalRounds += totalRounds;
        
        fighterBStats.totalDamageDealt += fighterBDamageDealt;
        fighterBStats.totalDamageTaken += fighterBDamageTaken;
        fighterBStats.totalRounds += totalRounds;
        
      } catch (error) {
        console.error(`Error processing ${filename}:`, error);
      }
    }
    
    // Calculate averages and finalize stats
    const leaderboard = Array.from(fighterStats.values()).map(fighter => {
      fighter.winRate = fighter.totalBattles > 0 ? (fighter.wins / fighter.totalBattles) * 100 : 0;
      fighter.averageDamageDealt = fighter.totalBattles > 0 ? fighter.totalDamageDealt / fighter.totalBattles : 0;
      fighter.averageDamageTaken = fighter.totalBattles > 0 ? fighter.totalDamageTaken / fighter.totalBattles : 0;
      fighter.averageRoundsSurvived = fighter.totalBattles > 0 ? fighter.totalRounds / fighter.totalBattles : 0;
      
      return fighter;
    });
    
    // Sort by win rate, then by total wins, then by average damage dealt
    leaderboard.sort((a, b) => {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.averageDamageDealt - a.averageDamageDealt;
    });
    
    return NextResponse.json({ 
      leaderboard,
      totalBattles: jsonFiles.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({ 
      leaderboard: [], 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 