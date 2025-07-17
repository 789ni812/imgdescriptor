import { NextRequest, NextResponse } from 'next/server';
import { generateBattleCommentary } from '@/lib/lmstudio-client';
import { resolveBattle, BattleRoundLog } from '@/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  console.log('API: generate-battle called');
  try {
    const body = await req.json();
    const { fighterA, fighterB, scene, maxRounds } = body;

    // Use the new stat-based battle logic
    const resolved = resolveBattle(fighterA, fighterB, scene, maxRounds);
    const battleLog = [];
    for (const round of resolved.rounds as BattleRoundLog[]) {
      // Generate LLM commentary for attack and defense
      // Use attacker/defender names and actual damage
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
        defenderDamage: 0, // Only attacker does damage in this model
        randomEvent: round.randomEvent,
        arenaObjectsUsed: round.arenaObjectsUsed.length > 0 ? round.arenaObjectsUsed.join(', ') : null,
        healthAfter: round.healthAfter,
      });
    }

    // Create tournament data for saving
    const tournamentData = {
      metadata: {
        timestamp: new Date().toISOString(),
        fighterA: {
          name: fighterA.name,
          imageUrl: fighterA.imageUrl || '',
          stats: fighterA.stats,
          description: fighterA.description
        },
        fighterB: {
          name: fighterB.name,
          imageUrl: fighterB.imageUrl || '',
          stats: fighterB.stats,
          description: fighterB.description
        },
        arena: {
          name: scene.name,
          imageUrl: scene.imageUrl || '',
          description: scene.description
        },
        winner: resolved.winner,
        totalRounds: battleLog.length,
        maxRounds
      },
      battleLog
    };

    // Save battle log to tournaments folder
    try {
      const tournamentsDir = join(process.cwd(), 'public', 'tournaments');
      await mkdir(tournamentsDir, { recursive: true });
      
      // Create filename from fighter names (sanitized) with date and time
      const fighterAName = fighterA.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const fighterBName = fighterB.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const arenaName = scene.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const timeStr = now.toISOString().slice(11, 19).replace(/:/g, ''); // HHMMSS
      const filename = `${fighterAName}-vs-${fighterBName}-in-${arenaName}-${dateStr}-${timeStr}.json`;
      const filepath = join(tournamentsDir, filename);
      
      await writeFile(filepath, JSON.stringify(tournamentData, null, 2));
      console.log(`Tournament battle saved: ${filename}`);
    } catch (saveError) {
      console.error('Failed to save tournament battle:', saveError);
      // Don't fail the request if saving fails
    }

    console.log('API: generate-battle about to return response');
    return NextResponse.json({ success: true, battleLog, winner: resolved.winner });
  } catch (error) {
    console.error('API: generate-battle error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 