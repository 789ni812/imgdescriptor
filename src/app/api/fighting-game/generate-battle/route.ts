import { NextRequest, NextResponse } from 'next/server';
import { generateBattleCommentary } from '@/lib/lmstudio-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fighterA, fighterB, scene, maxRounds } = body;

    // Generate a battle log with maxRounds rounds using LLM commentary
    const battleLog = [];
    for (let i = 1; i <= maxRounds; i++) {
      const attacker = i % 2 === 1 ? fighterA.name : fighterB.name;
      const defender = i % 2 === 1 ? fighterB.name : fighterA.name;
      const attackerDamage = Math.floor(Math.random() * 15) + 1;
      const defenderDamage = Math.floor(Math.random() * 10);

      // Generate LLM commentary for attack and defense
      const [attackCommentary, defenseCommentary] = await Promise.all([
        generateBattleCommentary(fighterA.name, fighterB.name, i, true, attackerDamage),
        generateBattleCommentary(fighterA.name, fighterB.name, i, false, defenderDamage)
      ]);

      battleLog.push({
        round: i,
        attacker,
        defender,
        attackCommentary,
        defenseCommentary,
        attackerDamage,
        defenderDamage,
      });
    }

    return NextResponse.json({ success: true, battleLog });
  } catch (error) {
    console.error('Battle generation error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 