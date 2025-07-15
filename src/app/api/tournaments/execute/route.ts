import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { Tournament } from '@/lib/types/tournament';
import { advanceFighterToNextRound, isTournamentComplete, getNextPendingMatch } from '@/lib/utils/tournamentUtils';
import { resolveBattle } from '@/lib/utils';
import { generateBattleCommentary } from '@/lib/lmstudio-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tournamentId } = body;

    if (!tournamentId) {
      return NextResponse.json({
        success: false,
        error: 'Tournament ID is required'
      }, { status: 400 });
    }

    // Load tournament
    const tournamentsDir = join(process.cwd(), 'public', 'tournaments');
    const tournamentPath = join(tournamentsDir, `${tournamentId}.json`);
    
    const content = await readFile(tournamentPath, 'utf-8');
    const tournament: Tournament = JSON.parse(content);
    tournament.createdAt = new Date(tournament.createdAt);

    if (tournament.status === 'completed') {
      return NextResponse.json({
        success: false,
        error: 'Tournament is already completed'
      }, { status: 400 });
    }

    // Find next pending match
    const nextMatch = getNextPendingMatch(tournament);
    if (!nextMatch) {
      return NextResponse.json({
        success: false,
        error: 'No pending matches found'
      }, { status: 400 });
    }

    // Check if this is a bye (same fighter)
    if (nextMatch.fighterA?.id === nextMatch.fighterB?.id) {
      // Handle bye - fighter advances automatically
      nextMatch.winner = nextMatch.fighterA || undefined;
      nextMatch.status = 'completed';
      
      // Advance fighter to next round
      if (nextMatch.fighterA) {
        tournament.brackets = advanceFighterToNextRound(tournament.brackets, nextMatch.fighterA, nextMatch);
      }
      
      // Update tournament status
      if (isTournamentComplete(tournament)) {
        tournament.status = 'completed';
        tournament.winner = nextMatch.fighterA || undefined;
      } else {
        tournament.status = 'in_progress';
        tournament.currentRound = nextMatch.round;
      }
      
      // Save updated tournament
      await writeFile(tournamentPath, JSON.stringify(tournament, null, 2));
      
      return NextResponse.json({
        success: true,
        match: nextMatch,
        tournament,
        message: 'Bye match completed'
      });
    }

    // Execute the battle
    if (!nextMatch.fighterA || !nextMatch.fighterB) {
      return NextResponse.json({
        success: false,
        error: 'Invalid match: missing fighters'
      }, { status: 400 });
    }
    
    console.log(`Executing match: ${nextMatch.fighterA.name} vs ${nextMatch.fighterB.name}`);
    
    // Use default arena for now (can be enhanced later)
    const defaultArena = {
      id: 'tournament-arena',
      name: 'Tournament Arena',
      imageUrl: '',
      description: 'A neutral arena for tournament battles',
      environmentalObjects: ['walls', 'floor', 'ceiling'],
      createdAt: new Date().toISOString()
    };

    // Resolve battle using existing logic
    const resolved = resolveBattle(nextMatch.fighterA, nextMatch.fighterB, defaultArena, 6);
    
    // Generate battle log with LLM commentary
    const battleLog = [];
    for (const round of resolved.rounds) {
      // Generate LLM commentary for attack and defense
      const [attackCommentary, defenseCommentary] = await Promise.all([
        generateBattleCommentary(round.attacker, round.defender, round.round, true, round.damage),
        generateBattleCommentary(round.attacker, round.defender, round.round, false, 0)
      ]);
      
      battleLog.push({
        round: round.round,
        attacker: round.attacker,
        defender: round.defender,
        attackCommentary,
        defenseCommentary,
        attackerDamage: round.damage,
        defenderDamage: 0,
        randomEvent: round.randomEvent,
        arenaObjectsUsed: round.arenaObjectsUsed,
        healthAfter: round.healthAfter,
      });
    }

    // Determine winner
    const winner = resolved.winner === nextMatch.fighterA.name ? nextMatch.fighterA : nextMatch.fighterB;
    
    // Update match
    nextMatch.winner = winner;
    nextMatch.battleLog = battleLog;
    nextMatch.status = 'completed';
    
    // Save battle log to tournaments folder (same format as playervs)
    try {
      const tournamentsDir = join(process.cwd(), 'public', 'tournaments');
      
      // Create filename from fighter names (sanitized) with date and time
      const fighterAName = nextMatch.fighterA.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const fighterBName = nextMatch.fighterB.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const arenaName = defaultArena.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const timeStr = now.toISOString().slice(11, 19).replace(/:/g, ''); // HHMMSS
      const filename = `${fighterAName}-vs-${fighterBName}-in-${arenaName}-${dateStr}-${timeStr}.json`;
      const filepath = join(tournamentsDir, filename);
      
      // Create tournament data for saving (same format as playervs)
      const tournamentData = {
        metadata: {
          timestamp: now.toISOString(),
          fighterA: {
            name: nextMatch.fighterA.name,
            imageUrl: nextMatch.fighterA.imageUrl || '',
            stats: nextMatch.fighterA.stats,
            description: nextMatch.fighterA.description || ''
          },
          fighterB: {
            name: nextMatch.fighterB.name,
            imageUrl: nextMatch.fighterB.imageUrl || '',
            stats: nextMatch.fighterB.stats,
            description: nextMatch.fighterB.description || ''
          },
          arena: {
            name: defaultArena.name,
            imageUrl: defaultArena.imageUrl || '',
            description: defaultArena.description
          },
          winner: winner.name,
          totalRounds: battleLog.length,
          maxRounds: 6
        },
        battleLog
      };
      
      await writeFile(filepath, JSON.stringify(tournamentData, null, 2));
      console.log(`Tournament battle saved: ${filename}`);
    } catch (saveError) {
      console.error('Failed to save tournament battle:', saveError);
      // Don't fail the request if saving fails
    }
    
    // Advance winner to next round
    tournament.brackets = advanceFighterToNextRound(tournament.brackets, winner, nextMatch);
    
    // Update tournament status
    if (isTournamentComplete(tournament)) {
      tournament.status = 'completed';
      tournament.winner = winner;
    } else {
      tournament.status = 'in_progress';
      tournament.currentRound = nextMatch.round;
    }
    
    // Save updated tournament
    await writeFile(tournamentPath, JSON.stringify(tournament, null, 2));
    
    return NextResponse.json({
      success: true,
      match: nextMatch,
      tournament,
      message: `Battle completed: ${winner.name} wins!`
    });
    
  } catch (error) {
    console.error('Error executing tournament match:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 