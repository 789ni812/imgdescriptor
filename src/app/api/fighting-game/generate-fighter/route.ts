import { NextRequest, NextResponse } from 'next/server';
import { Fighter } from '@/lib/stores/fightingGameStore';

export async function POST(req: NextRequest) {
  const { imageDescription, fighterId, fighterLabel } = await req.json();

  // Generate mock stats based on description keywords
  function randomStat(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Simple mock logic: if description contains 'strong', boost strength, etc.
  const desc = (imageDescription || '').toLowerCase();
  const strength = desc.includes('strong') ? randomStat(14, 20) : randomStat(8, 16);
  const health = desc.includes('large') ? randomStat(140, 200) : randomStat(90, 150);
  const luck = desc.includes('lucky') ? randomStat(14, 20) : randomStat(8, 16);
  const agility = desc.includes('young') ? randomStat(14, 20) : randomStat(8, 16);
  const defense = desc.includes('armor') ? randomStat(12, 18) : randomStat(6, 14);
  const age = desc.includes('old') ? randomStat(40, 70) : randomStat(18, 35);
  const size = desc.includes('large') ? 'large' : desc.includes('small') ? 'small' : 'medium';
  const build = desc.includes('muscular') ? 'muscular' : desc.includes('thin') ? 'thin' : 'average';

  const fighter: Fighter = {
    id: fighterId + '-' + Date.now(),
    name: fighterLabel + ' ' + Math.floor(Math.random() * 1000),
    imageUrl: '/public/imgRepository/download (1)-1751890389185-ke76fu.jpg', // placeholder
    description: imageDescription || 'A mysterious fighter',
    stats: {
      health,
      maxHealth: health,
      strength,
      luck,
      agility,
      defense,
      age,
      size: size as 'small' | 'medium' | 'large',
      build: build as 'thin' | 'average' | 'muscular' | 'heavy',
    },
    visualAnalysis: {
      age: age < 25 ? 'young' : age > 50 ? 'old' : 'adult',
      size,
      build,
      appearance: [desc.includes('scar') ? 'scarred' : 'normal'],
      weapons: desc.includes('sword') ? ['sword'] : [],
      armor: desc.includes('armor') ? ['armor'] : [],
    },
    combatHistory: [],
    winLossRecord: { wins: 0, losses: 0, draws: 0 },
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ fighter });
} 