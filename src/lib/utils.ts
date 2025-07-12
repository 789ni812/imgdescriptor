import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { Fighter, Scene } from './stores/fightingGameStore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses an RPG image description string into structured sections.
 * Returns an object with keys: setting, objects, characters, mood, hooks, and other.
 */
type SectionKey = 'setting' | 'objects' | 'characters' | 'mood' | 'hooks' | 'other';
export function parseImageDescriptionSections(description: string) {
  // Simple regex-based section splitter for common RPG analysis headings
  const sections: Record<SectionKey, string> = {
    setting: '',
    objects: '',
    characters: '',
    mood: '',
    hooks: '',
    other: ''
  };
  if (!description) return sections;
  // Normalize line endings
  const text = description.replace(/\r\n|\r/g, '\n');
  // Split by numbered or named headings
  const regex = /(?:^|\n)(\d+\.\s*Setting:|Setting:|\d+\.\s*Objects:|Objects:|\d+\.\s*People\/Characters:|People\/Characters:|\d+\.\s*Mood & Atmosphere:|Mood & Atmosphere:|\d+\.\s*Narrative Hooks.*:|Narrative Hooks.*:)/gi;
  const parts = text.split(regex).map(s => s.trim()).filter(Boolean);
  let current: SectionKey = 'other';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].toLowerCase();
    if (part.includes('setting')) current = 'setting';
    else if (part.includes('object')) current = 'objects';
    else if (part.includes('people/characters')) current = 'characters';
    else if (part.includes('mood')) current = 'mood';
    else if (part.includes('hook')) current = 'hooks';
    else {
      sections[current] += (sections[current] ? '\n' : '') + parts[i];
    }
  }
  return sections;
}

/**
 * Parses an RPG story string into structured sections.
 * Returns an object with keys: sceneTitle, summary, dilemmas, cues, consequences, other.
 */
type StorySectionKey = 'sceneTitle' | 'summary' | 'dilemmas' | 'cues' | 'consequences' | 'other';
export function parseStorySections(story: string) {
  const sections: Record<StorySectionKey, string> = {
    sceneTitle: '',
    summary: '',
    dilemmas: '',
    cues: '',
    consequences: '',
    other: ''
  };
  if (!story) return sections;
  const text = story.replace(/\r\n|\r/g, '\n');
  // Try to extract a scene title (e.g., 'Scene: The Labyrinth of Shadows')
  const sceneTitleMatch = text.match(/Scene:\s*([\w\s\-']+)/i);
  if (sceneTitleMatch) {
    sections.sceneTitle = sceneTitleMatch[1].trim();
  }
  // Extract dilemmas, cues, consequences by heading or keywords
  const regex = /(?:^|\n)(Key Dilemmas:|Dilemmas:|Visual Cues:|Cues:|Ongoing Consequences:|Consequences:)/gi;
  const parts = text.split(regex).map(s => s.trim()).filter(Boolean);
  let current: StorySectionKey = 'summary';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].toLowerCase();
    if (part.includes('dilemma')) current = 'dilemmas';
    else if (part.includes('cue')) current = 'cues';
    else if (part.includes('consequence')) current = 'consequences';
    else {
      sections[current] += (sections[current] ? '\n' : '') + parts[i];
    }
  }
  // If no headings found, treat the whole story as summary
  if (!sections.summary && text) sections.summary = text;
  return sections;
}

// Add this type for a single round log
export interface BattleRoundLog {
  round: number;
  attacker: string;
  defender: string;
  damage: number;
  statsUsed: {
    attackerStrength: number;
    attackerAgility: number;
    attackerLuck: number;
    defenderDefense: number;
    defenderAgility: number;
  };
  healthAfter: {
    attacker: number;
    defender: number;
  };
  randomEvent: string | null;
  arenaObjectsUsed: string | null;
}

/**
 * Resolves a battle between two fighters over a set number of rounds, using all stats, random events, and arena objects.
 * Applies 'underdog mode' if one fighter is much stronger (2x+ strength or health).
 * In underdog mode, the weaker fighter must dodge or is KO'd in one hit; if they dodge, they have a rare chance to land a 'weak spot' critical hit.
 * @param {Fighter} fighterA
 * @param {Fighter} fighterB
 * @param {Scene} arena
 * @param {number} rounds
 * @returns {{ winner: string, rounds: BattleRoundLog[] }}
 */
export function resolveBattle(
  fighterA: Fighter,
  fighterB: Fighter,
  arena: Scene,
  rounds: number
): { winner: string; rounds: BattleRoundLog[] } {
  // Deep copy stats so we don't mutate originals
  let aHealth = fighterA.stats.health;
  let bHealth = fighterB.stats.health;
  const log: BattleRoundLog[] = [];
  const rng = () => Math.random();

  // Helper function to pick random element
  function pick<T>(arr: T[]): T {
    return arr[Math.floor(rng() * arr.length)];
  }

  // Always use an array for environmentalObjects
  const environmentalObjects = Array.isArray((arena as { environmentalObjects?: string[] }).environmentalObjects) ? (arena as { environmentalObjects?: string[] }).environmentalObjects || [] : [];

  // Check if one fighter is much stronger (underdog mode)
  const aPower = fighterA.stats.strength * fighterA.stats.health;
  const bPower = fighterB.stats.strength * fighterB.stats.health;
  const powerRatio = Math.max(aPower, bPower) / Math.min(aPower, bPower);
  
  const isUnderdogMode = powerRatio >= 2;
  const favorite = aPower > bPower ? fighterA : fighterB;
  const underdog = aPower > bPower ? fighterB : fighterA;

  for (let round = 1; round <= rounds; round++) {
    // Determine attacker and defender for this round
    const attacker = round % 2 === 1 ? fighterA : fighterB;
    const defender = round % 2 === 1 ? fighterB : fighterA;
    const attackerHealth = attacker === fighterA ? aHealth : bHealth;
    const defenderHealth = defender === fighterA ? aHealth : bHealth;

    // Skip if either fighter is already defeated
    if (attackerHealth <= 0 || defenderHealth <= 0) {
      break;
    }

    let damage = 0;
    let randomEvent = '';
    let arenaObjectsUsed = '';

    if (isUnderdogMode && attacker === underdog) {
      // Underdog mode: underdog must dodge or is KO'd
      const dodgeChance = (attacker.stats.agility + attacker.stats.luck) / 40; // 0-1 scale
      
      if (rng() < dodgeChance) {
        // Underdog dodges successfully
        randomEvent = `${attacker.name} narrowly dodges ${favorite.name}'s attack!`;
        
        // Rare chance for weak spot critical hit
        if (rng() < 0.1) { // 10% chance
          damage = Math.floor(favorite.stats.health * 0.8); // Massive damage
          randomEvent += ` ${attacker.name} finds a weak spot and deals devastating damage!`;
        } else {
          damage = Math.floor(attacker.stats.strength * 0.5); // Reduced damage
        }
      } else {
        // Underdog fails to dodge - instant KO
        damage = defenderHealth;
        randomEvent = `${attacker.name} fails to dodge and is knocked out!`;
      }
    } else if (isUnderdogMode && attacker === favorite) {
      // Favorite attacks underdog - normal damage
      damage = Math.floor(attacker.stats.strength * (0.8 + rng() * 0.4));
      if (rng() < 0.2) { // 20% chance for environmental interaction
        const object = pick(environmentalObjects) as string;
        arenaObjectsUsed = object;
        damage = Math.floor(damage * 1.5);
        randomEvent = `${attacker.name} uses ${object} to enhance their attack!`;
      }
    } else {
      // Normal mode: balanced fight
      const baseDamage = Math.floor(attacker.stats.strength * (0.6 + rng() * 0.8));
      const defenseReduction = Math.floor(defender.stats.defense * 0.3);
      damage = Math.max(1, baseDamage - defenseReduction);
      
      // Random events
      if (rng() < 0.15) { // 15% chance for critical hit
        damage = Math.floor(damage * 1.5);
        randomEvent = `${attacker.name} lands a critical hit!`;
      } else if (rng() < 0.1) { // 10% chance for dodge
        const dodgeChance = defender.stats.agility / 20;
        if (rng() < dodgeChance) {
          damage = 0;
          randomEvent = `${defender.name} successfully dodges the attack!`;
        }
      } else if (rng() < 0.1) { // 10% chance for environmental interaction
        const object = pick(environmentalObjects) as string;
        arenaObjectsUsed = object;
        damage = Math.floor(damage * 1.3);
        randomEvent = `${attacker.name} uses ${object} in their attack!`;
      }
    }

    // Apply damage
    const newAttackerHealth = attackerHealth;
    const newDefenderHealth = Math.max(0, defenderHealth - damage);
    
    // Update health variables
    if (attacker === fighterA) {
      aHealth = newAttackerHealth;
      bHealth = newDefenderHealth;
    } else {
      bHealth = newAttackerHealth;
      aHealth = newDefenderHealth;
    }

    // Log the round
    log.push({
      round,
      attacker: attacker.name,
      defender: defender.name,
      damage,
      statsUsed: {
        attackerStrength: attacker.stats.strength,
        attackerAgility: attacker.stats.agility,
        attackerLuck: attacker.stats.luck,
        defenderDefense: defender.stats.defense,
        defenderAgility: defender.stats.agility,
      },
      healthAfter: {
        attacker: newAttackerHealth,
        defender: newDefenderHealth,
      },
      randomEvent: randomEvent || null,
      arenaObjectsUsed: arenaObjectsUsed || null,
    });

    // Check for knockout
    if (newDefenderHealth <= 0) {
      break;
    }
  }

  // Determine winner
  let winner = '';
  if (aHealth <= 0 && bHealth <= 0) {
    winner = 'Draw';
  } else if (aHealth <= 0) {
    winner = fighterB.name;
  } else if (bHealth <= 0) {
    winner = fighterA.name;
  } else {
    // If no knockout, winner is the one with more health
    winner = aHealth > bHealth ? fighterA.name : fighterB.name;
  }

  return { winner, rounds: log };
}
