import { NextRequest, NextResponse } from 'next/server';
import { generateFighterStats, generateFighterDescription } from '@/lib/lmstudio-client';
import { Fighter } from '@/lib/stores/fightingGameStore';
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
  const { imageDescription, fighterId, fighterLabel, imageUrl, arenaContext } = await req.json();

  // Generate mock stats based on description keywords
  function randomStat(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Extract arena characteristics for context
  let arenaType = 'neutral';
  let arenaHazards: string[] = [];
  let arenaAdvantages: string[] = [];
  
  if (arenaContext) {
    const arenaDesc = (arenaContext.description || '').toLowerCase();
    
    // Determine arena type and characteristics
    if (arenaDesc.includes('water') || arenaDesc.includes('ocean') || arenaDesc.includes('underwater')) {
      arenaType = 'aquatic';
      arenaHazards = ['drowning', 'limited mobility'];
      arenaAdvantages = ['swimming', 'water breathing'];
    } else if (arenaDesc.includes('fire') || arenaDesc.includes('volcano') || arenaDesc.includes('lava')) {
      arenaType = 'fire';
      arenaHazards = ['burning', 'heat damage'];
      arenaAdvantages = ['fire resistance', 'heat tolerance'];
    } else if (arenaDesc.includes('ice') || arenaDesc.includes('snow') || arenaDesc.includes('frozen')) {
      arenaType = 'ice';
      arenaHazards = ['slipping', 'freezing'];
      arenaAdvantages = ['ice resistance', 'cold tolerance'];
    } else if (arenaDesc.includes('high') || arenaDesc.includes('sky') || arenaDesc.includes('flying')) {
      arenaType = 'aerial';
      arenaHazards = ['falling', 'wind resistance'];
      arenaAdvantages = ['flight', 'wind control'];
    } else if (arenaDesc.includes('underground') || arenaDesc.includes('cave') || arenaDesc.includes('tunnel')) {
      arenaType = 'underground';
      arenaHazards = ['limited visibility', 'confined space'];
      arenaAdvantages = ['dark vision', 'tunnel expertise'];
    } else if (arenaDesc.includes('urban') || arenaDesc.includes('city') || arenaDesc.includes('street')) {
      arenaType = 'urban';
      arenaHazards = ['obstacles', 'civilian risk'];
      arenaAdvantages = ['urban combat', 'environmental awareness'];
    }
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
    // Try to generate stats using LLM
    const llmResult = await generateFighterStats(descString, fighterLabel, arenaContext ? {
      name: arenaContext.name || 'Unknown Arena',
      description: arenaContext.description || '',
      type: arenaType,
      hazards: arenaHazards,
      advantages: arenaAdvantages
    } : undefined);
    
    if (llmResult.success && llmResult.stats) {
      // Use LLM-generated stats
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
      
      // Apply arena-specific adjustments
      if (arenaType !== 'neutral') {
        // Add arena-appropriate abilities if not already present
        const arenaAbilities = [];
        if (arenaType === 'aquatic' && !uniqueAbilities.some(ability => ability.toLowerCase().includes('water') || ability.toLowerCase().includes('swim'))) {
          arenaAbilities.push('Aquatic Adaptation');
        }
        if (arenaType === 'fire' && !uniqueAbilities.some(ability => ability.toLowerCase().includes('fire') || ability.toLowerCase().includes('heat'))) {
          arenaAbilities.push('Heat Resistance');
        }
        if (arenaType === 'ice' && !uniqueAbilities.some(ability => ability.toLowerCase().includes('ice') || ability.toLowerCase().includes('cold'))) {
          arenaAbilities.push('Cold Resistance');
        }
        if (arenaType === 'aerial' && !uniqueAbilities.some(ability => ability.toLowerCase().includes('flight') || ability.toLowerCase().includes('wind'))) {
          arenaAbilities.push('Wind Mastery');
        }
        if (arenaType === 'underground' && !uniqueAbilities.some(ability => ability.toLowerCase().includes('dark') || ability.toLowerCase().includes('tunnel'))) {
          arenaAbilities.push('Dark Vision');
        }
        if (arenaType === 'urban' && !uniqueAbilities.some(ability => ability.toLowerCase().includes('urban') || ability.toLowerCase().includes('environment'))) {
          arenaAbilities.push('Urban Combat');
        }
        
        // Add arena abilities (limit to 4 total)
        if (arenaAbilities.length > 0 && uniqueAbilities.length < 4) {
          uniqueAbilities.push(...arenaAbilities.slice(0, 4 - uniqueAbilities.length));
        }
      }
    } else {
      // Fallback to basic stat generation
      if (label.includes('superman') || label.includes('super')) {
        strength = 180;
        health = 950;
        luck = 35;
        agility = 65;
        defense = 40;
        age = 30;
        size = 'large';
        build = 'muscular';
        magic = 80;
        ranged = 0;
        intelligence = 85;
        uniqueAbilities = ['Heat Vision', 'Super Strength', 'Flight', 'Invulnerability'];
      } else if (label.includes('batman') || label.includes('bat')) {
        strength = 85;
        health = 750;
        luck = 45;
        agility = 90;
        defense = 60;
        age = 35;
        size = 'large';
        build = 'muscular';
        magic = 0;
        ranged = 70;
        intelligence = 95;
        uniqueAbilities = ['Detective Skills', 'Gadget Mastery', 'Stealth', 'Martial Arts'];
      } else if (label.includes('spider') || label.includes('spiderman')) {
        strength = 75;
        health = 650;
        luck = 40;
        agility = 95;
        defense = 50;
        age = 25;
        size = 'medium';
        build = 'muscular';
        magic = 0;
        ranged = 60;
        intelligence = 80;
        uniqueAbilities = ['Spider Sense', 'Web Slinging', 'Wall Crawling', 'Super Agility'];
      } else if (label.includes('hulk') || label.includes('bruce')) {
        strength = 200;
        health = 1200;
        luck = 20;
        agility = 40;
        defense = 80;
        age = 40;
        size = 'large';
        build = 'heavy';
        magic = 0;
        ranged = 0;
        intelligence = 30;
        uniqueAbilities = ['Hulk Smash', 'Rage Boost', 'Regeneration', 'Super Durability'];
      } else if (label.includes('iron') || label.includes('tony')) {
        strength = 70;
        health = 600;
        luck = 50;
        agility = 75;
        defense = 85;
        age = 45;
        size = 'medium';
        build = 'average';
        magic = 0;
        ranged = 90;
        intelligence = 100;
        uniqueAbilities = ['Repulsor Blasts', 'Flight', 'Armor Systems', 'Genius Intelligence'];
      } else {
        // Generic fighter generation based on description keywords
        const hasWeapon = descString.includes('sword') || descString.includes('gun') || descString.includes('weapon');
        const isLarge = descString.includes('large') || descString.includes('big') || descString.includes('huge');
        const isSmall = descString.includes('small') || descString.includes('tiny') || descString.includes('little');
        const isMuscular = descString.includes('muscular') || descString.includes('strong') || descString.includes('buff');
        const isFast = descString.includes('fast') || descString.includes('quick') || descString.includes('agile');
        const isMagic = descString.includes('magic') || descString.includes('wizard') || descString.includes('spell');
        const isRanged = descString.includes('bow') || descString.includes('gun') || descString.includes('shoot');

        strength = isMuscular ? randomStat(80, 120) : randomStat(40, 80);
        health = isLarge ? randomStat(800, 1000) : randomStat(400, 700);
        luck = randomStat(15, 35);
        agility = isFast ? randomStat(70, 95) : randomStat(30, 70);
        defense = randomStat(30, 60);
        age = randomStat(20, 50);
        size = isLarge ? 'large' : isSmall ? 'small' : 'medium';
        build = isMuscular ? 'muscular' : randomStat(0, 1) ? 'average' : 'thin';
        magic = isMagic ? randomStat(50, 90) : 0;
        ranged = isRanged || hasWeapon ? randomStat(60, 90) : randomStat(10, 40);
        intelligence = randomStat(30, 80);
        
        // Generate basic unique abilities based on characteristics
        uniqueAbilities = [];
        if (isMagic) uniqueAbilities.push('Magic Spells', 'Elemental Control');
        if (isRanged) uniqueAbilities.push('Precise Aim', 'Quick Draw');
        if (isFast) uniqueAbilities.push('Lightning Speed', 'Evasion Master');
        if (isMuscular) uniqueAbilities.push('Power Strike', 'Unstoppable Force');
        if (uniqueAbilities.length === 0) {
          uniqueAbilities = ['Combat Mastery', 'Tactical Thinking'];
        }
      }
    }
  }

  // Create the fighter object
  const fighter: Fighter = {
    id: fighterId + '-' + Date.now(),
    name: fighterLabel,
    imageUrl: imageUrl || '/public/imgRepository/download (1)-1751890389185-ke76fu.jpg',
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

  // Generate enhanced description using the new system
  try {
    const enhancedDescription = await generateFighterDescription(fighter);
    fighter.description = enhancedDescription;
  } catch (error) {
    console.warn('Failed to generate enhanced description, using fallback:', error);
    // Keep the original description if enhanced generation fails
  }

  return NextResponse.json({ fighter });
} 