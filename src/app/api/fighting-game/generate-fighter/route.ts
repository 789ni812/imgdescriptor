import { NextRequest, NextResponse } from 'next/server';
import { Fighter } from '@/lib/stores/fightingGameStore';

export async function POST(req: NextRequest) {
  const { imageDescription, fighterId, fighterLabel } = await req.json();

  // Generate mock stats based on description keywords
  function randomStat(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Convert imageDescription to string - handle both string and object cases
  let descString = '';
  if (typeof imageDescription === 'string') {
    descString = imageDescription;
  } else if (typeof imageDescription === 'object' && imageDescription !== null) {
    // If it's an object (from AI analysis), extract relevant fields
    const desc = imageDescription as Record<string, unknown>;
    const parts = [];
    if (typeof desc.setting === 'string') parts.push(desc.setting);
    if (typeof desc.mood === 'string') parts.push(desc.mood);
    if (Array.isArray(desc.characters)) {
      const charStrings = desc.characters
        .filter((char: unknown) => typeof char === 'string')
        .join(', ');
      if (charStrings) parts.push(charStrings);
    }
    if (Array.isArray(desc.objects)) {
      const objStrings = desc.objects
        .filter((obj: unknown) => typeof obj === 'string')
        .join(', ');
      if (objStrings) parts.push(objStrings);
    }
    descString = parts.join('. ');
  }

  // Improved logic for animal/monster archetypes
  const label = (fighterLabel || '').toLowerCase();
  let strength, health, luck, agility, defense, age, size, build;

  // Small animal archetype
  if (/mouse|rat|hamster|squirrel|gerbil|shrew/.test(descString) || /mouse|rat|hamster|squirrel|gerbil|shrew/.test(label)) {
    strength = randomStat(1, 3);
    health = randomStat(10, 30);
    luck = randomStat(10, 18);
    agility = randomStat(18, 20);
    defense = randomStat(4, 10);
    age = randomStat(1, 3);
    size = 'small';
    build = 'thin';
  // Giant monster archetype
  } else if (/godzilla|t-rex|dinosaur|giant|monster|kaiju/.test(descString) || /godzilla|t-rex|dinosaur|giant|monster|kaiju/.test(label)) {
    // Dramatically increased strength, dramatically reduced agility
    strength = randomStat(40, 60);
    health = randomStat(300, 600);
    luck = randomStat(6, 12);
    agility = randomStat(1, 2);
    defense = randomStat(16, 25);
    age = randomStat(1000, 200000000);
    size = 'large';
    build = 'heavy';
  } else {
    // Existing logic
    const desc = descString.toLowerCase();
    strength = desc.includes('strong') ? randomStat(14, 20) : randomStat(8, 16);
    health = desc.includes('large') ? randomStat(140, 200) : randomStat(90, 150);
    luck = desc.includes('lucky') ? randomStat(14, 20) : randomStat(8, 16);
    agility = desc.includes('young') ? randomStat(14, 20) : randomStat(8, 16);
    defense = desc.includes('armor') ? randomStat(12, 18) : randomStat(6, 14);
    age = desc.includes('old') ? randomStat(40, 70) : randomStat(18, 35);
    size = desc.includes('large') ? 'large' : desc.includes('small') ? 'small' : 'medium';
    build = desc.includes('muscular') ? 'muscular' : desc.includes('thin') ? 'thin' : 'average';
  }

  const fighter: Fighter = {
    id: fighterId + '-' + Date.now(),
    name: fighterLabel, // Use only the provided label, no random number
    imageUrl: '/public/imgRepository/download (1)-1751890389185-ke76fu.jpg', // placeholder
    description: descString || 'A mysterious fighter',
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
      appearance: [descString.includes('scar') ? 'scarred' : 'normal'],
      weapons: descString.includes('sword') ? ['sword'] : [],
      armor: descString.includes('armor') ? ['armor'] : [],
    },
    combatHistory: [],
    winLossRecord: { wins: 0, losses: 0, draws: 0 },
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ fighter });
} 