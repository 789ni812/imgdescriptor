import { NextRequest, NextResponse } from 'next/server';
import { generateBattleCommentary } from '@/lib/lmstudio-client';
import { resolveBattle } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fighterA, fighterB, scene, maxRounds } = body;

    // Use the new stat-based battle logic
    const resolved = resolveBattle(fighterA, fighterB, scene, maxRounds);
    const battleLog = [];
    for (const round of resolved.rounds) {
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
        arenaObjectsUsed: round.arenaObjectsUsed,
        crit: round.crit,
        dodged: round.dodged,
        healthAfter: round.healthAfter,
      });
    }
    return NextResponse.json({ success: true, battleLog });
  } catch (error) {
    console.error('Battle generation error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 