import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { Tournament } from '@/lib/types/tournament';
import { advanceFighterToNextRound, isTournamentComplete, getNextPendingMatch } from '@/lib/utils/tournamentUtils';
import { resolveBattle } from '@/lib/utils';
import { generateBattleCommentary, generateFighterSlogans } from '@/lib/lmstudio-client';

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

    // Check if this is a bye (missing opponent)
    if (!nextMatch.fighterB) {
      // Handle bye - fighter advances automatically
      nextMatch.winner = nextMatch.fighterA || undefined;
      nextMatch.status = 'completed';
      if (nextMatch.fighterA) {
        tournament.brackets = advanceFighterToNextRound(tournament.brackets, nextMatch.fighterA, nextMatch);
      }
      if (isTournamentComplete(tournament)) {
        tournament.status = 'completed';
        tournament.winner = nextMatch.fighterA || undefined;
      } else {
        tournament.status = 'in_progress';
        tournament.currentRound = nextMatch.round;
      }
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

    // --- PERSISTENT LLM CONTENT LOGIC ---
    let battleLog = nextMatch.battleLog || null;
    let fighterSlogans = nextMatch.fighterSlogans || null;
    let usedCached = false;

    if (battleLog && fighterSlogans) {
      console.log('Reusing cached battle log and fighter slogans for this match.');
      usedCached = true;
    } else {
      console.log('Generating new battle log and fighter slogans for this match.');
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
      battleLog = [];
      for (const round of resolved.rounds) {
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
          // randomEvent: round.randomEvent, // Removed to fix linter error
          healthAfter: round.healthAfter,
        });
      }
      // Generate fighter slogans for both fighters
      fighterSlogans = {};
      try {
        const fighterASlogans = await generateFighterSlogans(
          nextMatch.fighterA.name,
          {
            strength: nextMatch.fighterA.stats.strength,
            agility: nextMatch.fighterA.stats.agility,
            health: nextMatch.fighterA.stats.health,
            defense: nextMatch.fighterA.stats.defense,
            intelligence: nextMatch.fighterA.stats.intelligence ?? 0,
            uniqueAbilities: nextMatch.fighterA.stats.uniqueAbilities ?? []
          },
          nextMatch.fighterA.visualAnalysis,
          nextMatch.fighterA.description || `A formidable ${nextMatch.fighterA.stats.size} fighter with ${nextMatch.fighterA.stats.strength} strength and ${nextMatch.fighterA.stats.agility} agility, ready to prove their worth in battle.`
        );
        if (fighterASlogans.success && fighterASlogans.slogans && fighterASlogans.description) {
          fighterSlogans[nextMatch.fighterA.id] = {
            slogans: fighterASlogans.slogans,
            description: fighterASlogans.description
          };
        } else {
          fighterSlogans[nextMatch.fighterA.id] = {
            slogans: [
              `The ${nextMatch.fighterA.name}`,
              `Ready for battle!`,
              `Champion material!`
            ],
            description: nextMatch.fighterA.description || `A formidable fighter ready to prove their worth.`
          };
        }
        const fighterBSlogans = await generateFighterSlogans(
          nextMatch.fighterB.name,
          {
            strength: nextMatch.fighterB.stats.strength,
            agility: nextMatch.fighterB.stats.agility,
            health: nextMatch.fighterB.stats.health,
            defense: nextMatch.fighterB.stats.defense,
            intelligence: nextMatch.fighterB.stats.intelligence ?? 0,
            uniqueAbilities: nextMatch.fighterB.stats.uniqueAbilities ?? []
          },
          nextMatch.fighterB.visualAnalysis,
          nextMatch.fighterB.description || `A formidable ${nextMatch.fighterB.stats.size} fighter with ${nextMatch.fighterB.stats.strength} strength and ${nextMatch.fighterB.stats.agility} agility, ready to prove their worth in battle.`
        );
        if (fighterBSlogans.success && fighterBSlogans.slogans && fighterBSlogans.description) {
          fighterSlogans[nextMatch.fighterB.id] = {
            slogans: fighterBSlogans.slogans,
            description: fighterBSlogans.description
          };
        } else {
          fighterSlogans[nextMatch.fighterB.id] = {
            slogans: [
              `The ${nextMatch.fighterB.name}`,
              `Ready for battle!`,
              `Champion material!`
            ],
            description: nextMatch.fighterB.description || `A formidable fighter ready to prove their worth.`
          };
        }
      } catch (error) {
        console.error('Failed to generate fighter slogans:', error);
        fighterSlogans[nextMatch.fighterA.id] = {
          slogans: [
            `The ${nextMatch.fighterA.name}`,
            `Ready for battle!`,
            `Champion material!`
          ],
          description: nextMatch.fighterA.description || `A formidable fighter ready to prove their worth.`
        };
        fighterSlogans[nextMatch.fighterB.id] = {
          slogans: [
            `The ${nextMatch.fighterB.name}`,
            `Ready for battle!`,
            `Champion material!`
          ],
          description: nextMatch.fighterB.description || `A formidable fighter ready to prove their worth.`
        };
      }
      // Save to match for future reuse
      nextMatch.battleLog = battleLog;
      nextMatch.fighterSlogans = fighterSlogans;
    }

    // Determine winner
    const winner = (battleLog && battleLog.length > 0 && battleLog[battleLog.length - 1].attacker === nextMatch.fighterA.name)
      ? nextMatch.fighterA
      : nextMatch.fighterB;
    nextMatch.winner = winner;
    nextMatch.status = 'completed';

    // Save updated tournament
    await writeFile(tournamentPath, JSON.stringify(tournament, null, 2));

    return NextResponse.json({
      success: true,
      match: nextMatch,
      tournament,
      message: `Battle completed: ${winner.name} wins!${usedCached ? ' (from cache)' : ''}`
    });
  } catch (error) {
    console.error('Error executing tournament match:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 