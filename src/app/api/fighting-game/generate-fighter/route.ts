import { NextRequest, NextResponse } from 'next/server';
import { Fighter } from '@/lib/stores/fightingGameStore';
import { getCreatureType, generateStatsFromScoreSheet } from '@/lib/types/creatureScoreSheet';

export async function POST(req: NextRequest) {
  const { imageDescription, fighterId, fighterLabel, imageUrl } = await req.json();

  // Generate mock stats based on description keywords
  function randomStat(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Improved logic using score sheet system
  const label = (fighterLabel || '').toLowerCase();
  
  // Handle imageDescription which can be a string or ImageDescription object
  let descString = '';
  if (typeof imageDescription === 'string') {
    descString = imageDescription.toLowerCase();
  } else if (imageDescription && typeof imageDescription === 'object') {
    // Convert ImageDescription object to string
    const desc = imageDescription as { setting?: string; objects?: string[]; characters?: string[]; mood?: string; hooks?: string[] };
    const parts = [
      desc.setting || '',
      desc.objects?.join(' ') || '',
      desc.characters?.join(' ') || '',
      desc.mood || '',
      desc.hooks?.join(' ') || ''
    ].filter(Boolean);
    descString = parts.join(' ').toLowerCase();
  }
  
  // Try to identify creature type using score sheet
  const creatureType = getCreatureType(descString, label);
  
  let strength, health, luck, agility, defense, age, size, build;

  if (creatureType) {
    // Use score sheet for realistic stats
    const stats = generateStatsFromScoreSheet(creatureType);
    strength = stats.strength;
    agility = stats.agility;
    health = stats.health;
    defense = stats.defense;
    luck = stats.luck;
    
    // Map size from score sheet
    size = creatureType.size === 'tiny' ? 'small' : 
           creatureType.size === 'small' ? 'small' :
           creatureType.size === 'medium' ? 'medium' :
           creatureType.size === 'large' ? 'large' : 'large';
    
    // Determine build based on creature type
    build = creatureType.name === 'kaiju' ? 'heavy' :
            creatureType.name === 'rodent' || creatureType.name === 'insect' ? 'thin' :
            creatureType.name === 'human' ? 'muscular' :
            creatureType.name === 'large_animal' ? 'heavy' : 'average';
    
    // Age based on creature type
    age = creatureType.name === 'kaiju' ? randomStat(1000, 200000000) :
          creatureType.name === 'human' ? randomStat(18, 80) :
          randomStat(1, 50);
  } else {
    // Fallback to existing logic for unrecognized creatures
    // Small animal archetype
    if (/mouse|rat|hamster|squirrel|gerbil|shrew/.test(descString) || /mouse|rat|hamster|squirrel|gerbil|shrew/.test(label)) {
      strength = randomStat(1, 3);
      health = randomStat(10, 30);
      luck = randomStat(10, 18);
      agility = randomStat(18, 20);
      defense = randomStat(2, 5);
      age = randomStat(1, 5);
      size = 'small';
      build = 'thin';
    }
    // Giant monster archetype
    else if (/godzilla|t-rex|dinosaur|giant|monster|kaiju/.test(descString) || /godzilla|t-rex|dinosaur|giant|monster|kaiju/.test(label)) {
      // Dramatically increased strength, dramatically reduced agility
      strength = randomStat(40, 60);
      health = randomStat(300, 600);
      luck = randomStat(6, 12);
      agility = randomStat(1, 2);
      defense = randomStat(16, 25);
      age = randomStat(1000, 200000000);
      size = 'large';
      build = 'heavy';
    }
    // Default balanced stats
    else {
      strength = randomStat(8, 15);
      health = randomStat(80, 150);
      luck = randomStat(8, 16);
      agility = randomStat(10, 18);
      defense = randomStat(6, 12);
      age = randomStat(18, 80);
      size = 'medium';
      build = 'average';
    }
  }

  const fighter: Fighter = {
    id: fighterId + '-' + Date.now(),
    name: fighterLabel, // Use only the provided label, no random number
    imageUrl: imageUrl || '/public/imgRepository/download (1)-1751890389185-ke76fu.jpg', // use provided imageUrl or fallback
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