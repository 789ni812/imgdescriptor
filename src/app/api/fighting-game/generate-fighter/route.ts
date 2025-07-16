import { NextRequest, NextResponse } from 'next/server';
import { Fighter } from '@/lib/stores/fightingGameStore';
import { getCreatureType, generateStatsFromScoreSheet } from '@/lib/types/creatureScoreSheet';
import { generateFighterStats } from '@/lib/lmstudio-client';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

// Helper function to find existing fighter stats from JSON files
async function findExistingFighterStats(fighterName: string) {
  try {
    const fightersDir = join(process.cwd(), 'public', 'vs', 'fighters');
    const files = await readdir(fightersDir);
    
    // Search for JSON files with matching fighter name (case-insensitive)
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = join(fightersDir, file);
        const content = await readFile(filePath, 'utf-8');
        const fighterData = JSON.parse(content);
        
        // Check if the fighter name matches (case-insensitive)
        if (fighterData.name && fighterData.name.toLowerCase() === fighterName.toLowerCase()) {
          console.log(`Found existing stats for ${fighterName} in ${file}`);
          return fighterData.stats;
        }
      }
    }
  } catch (error) {
    console.error('Error searching for existing fighter stats:', error);
  }
  
  return null;
}

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
  
  // First, check if we have existing stats for this fighter
  const existingStats = await findExistingFighterStats(fighterLabel);
  
  let strength, health, luck, agility, defense, age, size, build, magic, ranged, intelligence, uniqueAbilities;

  if (existingStats) {
    // Use existing balanced stats
    strength = existingStats.strength;
    agility = existingStats.agility;
    health = existingStats.health;
    defense = existingStats.defense;
    luck = existingStats.luck;
    age = existingStats.age;
    size = existingStats.size;
    build = existingStats.build;
    magic = existingStats.magic || 0;
    ranged = existingStats.ranged || 0;
    intelligence = existingStats.intelligence || 20;
    uniqueAbilities = existingStats.uniqueAbilities || [];
  } else {
    // Try to use LLM for intelligent stat generation first
    try {
      console.log('Attempting LLM-based fighter stat generation...');
      const llmResult = await generateFighterStats(descString, fighterLabel);
      
      if (llmResult.success && llmResult.stats) {
        console.log('LLM generated stats successfully:', llmResult.stats);
        strength = llmResult.stats.strength;
        agility = llmResult.stats.agility;
        health = llmResult.stats.health;
        defense = llmResult.stats.defense;
        luck = llmResult.stats.luck;
        age = llmResult.stats.age;
        size = llmResult.stats.size;
        build = llmResult.stats.build;
        magic = llmResult.stats.magic || 0;
        ranged = llmResult.stats.ranged || 0;
        intelligence = llmResult.stats.intelligence || 20;
        uniqueAbilities = llmResult.stats.uniqueAbilities || [];
      } else {
        console.log('LLM stat generation failed, falling back to score sheet:', llmResult.error);
        throw new Error('LLM generation failed');
      }
    } catch {
      console.log('LLM stat generation failed, using fallback methods...');
      
      // Try to identify creature type using score sheet
      const creatureType = getCreatureType(descString, label);
      
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
        
        // Set special stats based on creature type
        magic = creatureType.name === 'kaiju' ? randomStat(0, 50) : 0;
        ranged = creatureType.name === 'kaiju' ? randomStat(50, 100) : randomStat(0, 10);
        intelligence = creatureType.name === 'human' ? randomStat(20, 40) :
                      creatureType.name === 'kaiju' ? randomStat(8, 25) :
                      randomStat(2, 15);
        
        // Generate abilities based on creature type
        uniqueAbilities = generateAbilitiesForType(creatureType.name, descString, label);
      } else {
        // Fallback to existing logic for unrecognized creatures
        // Small animal archetype
        if (/mouse|rat|hamster|squirrel|gerbil|shrew/.test(descString) || /mouse|rat|hamster|squirrel|gerbil|shrew/.test(label)) {
          strength = randomStat(1, 5);
          health = randomStat(20, 50);
          luck = randomStat(25, 40);
          agility = randomStat(60, 90);
          defense = randomStat(5, 15);
          age = randomStat(1, 5);
          size = 'small';
          build = 'thin';
          magic = 0;
          ranged = 0;
          intelligence = randomStat(2, 5);
          uniqueAbilities = ['Quick Escape'];
        }
        // Giant monster archetype
        else if (/godzilla|t-rex|dinosaur|giant|monster|kaiju/.test(descString) || /godzilla|t-rex|dinosaur|giant|monster|kaiju/.test(label)) {
          // Dramatically increased strength, dramatically reduced agility
          strength = randomStat(150, 200);
          health = randomStat(800, 1000);
          luck = randomStat(5, 15);
          agility = randomStat(5, 20);
          defense = randomStat(70, 100);
          age = randomStat(1000, 200000000);
          size = 'large';
          build = 'heavy';
          magic = randomStat(0, 50);
          ranged = randomStat(50, 100);
          intelligence = randomStat(8, 25);
          uniqueAbilities = ['Atomic Breath', 'Tail Whip', 'Monster Strength'];
        }
        // Default balanced stats
        else {
          strength = randomStat(15, 50);
          health = randomStat(80, 150);
          luck = randomStat(10, 25);
          agility = randomStat(30, 70);
          defense = randomStat(15, 40);
          age = randomStat(18, 80);
          size = 'medium';
          build = 'average';
          magic = 0;
          ranged = randomStat(0, 10);
          intelligence = randomStat(20, 40);
          uniqueAbilities = generateAbilitiesForType('regular_human', descString, label);
        }
      }
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
      magic,
      ranged,
      intelligence,
      uniqueAbilities,
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

// Helper function to generate abilities based on creature type and description
function generateAbilitiesForType(creatureType: string, descString: string, label: string): string[] {
  const abilities: string[] = [];
  
  switch (creatureType) {
    case 'kaiju':
      abilities.push('Atomic Breath', 'Tail Whip', 'Monster Strength');
      break;
    case 'human':
      if (/martial|karate|kung|judo|aikido|boxing|wrestling/.test(descString) || /martial|karate|kung|judo|aikido|boxing|wrestling/.test(label)) {
        abilities.push('Martial Arts', 'Combat Training', 'Disciplined Strike');
      } else {
        abilities.push('Basic Combat', 'Human Endurance', 'Adaptive Fighting');
      }
      break;
    case 'rodent':
      abilities.push('Quick Escape', 'Agile Movement', 'Stealth Attack');
      break;
    case 'large_animal':
      if (/bear|tiger|lion/.test(descString) || /bear|tiger|lion/.test(label)) {
        abilities.push('Claw Attack', 'Feral Strength', 'Predator Instinct');
      } else {
        abilities.push('Natural Weapons', 'Animal Strength', 'Wild Combat');
      }
      break;
    default:
      // Generate abilities based on description keywords
      if (/sword|blade|weapon/.test(descString) || /sword|blade|weapon/.test(label)) {
        abilities.push('Weapon Mastery', 'Precise Strike', 'Combat Experience');
      } else if (/armor|shield|protection/.test(descString) || /armor|shield|protection/.test(label)) {
        abilities.push('Defensive Stance', 'Armor Mastery', 'Shield Block');
      } else if (/magic|spell|wizard|mage/.test(descString) || /magic|spell|wizard|mage/.test(label)) {
        abilities.push('Magic Casting', 'Spell Mastery', 'Arcane Knowledge');
      } else {
        abilities.push('Basic Combat', 'Fighter Instinct', 'Battle Experience');
      }
  }
  
  return abilities;
} 