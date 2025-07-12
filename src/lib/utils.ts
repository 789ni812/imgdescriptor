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

/**
 * Resolves a battle between two fighters over a set number of rounds, using all stats, random events, and arena objects.
 * Applies 'underdog mode' if one fighter is much stronger (2x+ strength or health).
 * In underdog mode, the weaker fighter must dodge or is KO'd in one hit; if they dodge, they have a rare chance to land a 'weak spot' critical hit.
 * @param {Fighter} fighterA
 * @param {Fighter} fighterB
 * @param {Scene} arena
 * @param {number} rounds
 * @returns {{ winner: string, rounds: any[] }}
 */
export function resolveBattle(
  fighterA: Fighter,
  fighterB: Fighter,
  arena: Scene,
  rounds: number
): { winner: string; rounds: any[] } {
  // Deep copy stats so we don't mutate originals
  let aHealth = fighterA.stats.health;
  let bHealth = fighterB.stats.health;
  const log = [];
  const rng = () => Math.random();
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

  // Detect mismatch for 'underdog mode'
  const aPower = fighterA.stats.strength * fighterA.stats.health;
  const bPower = fighterB.stats.strength * fighterB.stats.health;
  let underdog: Fighter | null = null;
  let favorite: Fighter | null = null;
  let underdogHealth: number = 0;
  let favoriteHealth: number = 0;
  let underdogIsA = false;
  // 2x+ power difference triggers underdog mode
  if (aPower >= bPower * 2) {
    favorite = fighterA;
    underdog = fighterB;
    favoriteHealth = aHealth;
    underdogHealth = bHealth;
    underdogIsA = false;
  } else if (bPower >= aPower * 2) {
    favorite = fighterB;
    underdog = fighterA;
    favoriteHealth = bHealth;
    underdogHealth = aHealth;
    underdogIsA = true;
  }

  let attacker = fighterA;
  let defender = fighterB;
  let attackerHealth = aHealth;
  let defenderHealth = bHealth;

  for (let round = 1; round <= rounds; round++) {
    // Alternate attacker/defender each round
    if (round % 2 === 0) {
      attacker = fighterB;
      defender = fighterA;
      attackerHealth = bHealth;
      defenderHealth = aHealth;
    } else {
      attacker = fighterA;
      defender = fighterB;
      attackerHealth = aHealth;
      defenderHealth = bHealth;
    }

    // Check if this round is underdog mode
    let isUnderdogRound = false;
    let roundUnderdog: Fighter | null = null;
    let roundFavorite: Fighter | null = null;
    let roundUnderdogHealth = 0;
    let roundFavoriteHealth = 0;
    let underdogAttacking = false;
    if (underdog && favorite) {
      if (attacker.id === underdog.id) {
        isUnderdogRound = true;
        roundUnderdog = underdog;
        roundFavorite = favorite;
        roundUnderdogHealth = underdogIsA ? aHealth : bHealth;
        roundFavoriteHealth = underdogIsA ? bHealth : aHealth;
        underdogAttacking = true;
      } else if (defender.id === underdog.id) {
        isUnderdogRound = true;
        roundUnderdog = underdog;
        roundFavorite = favorite;
        roundUnderdogHealth = underdogIsA ? aHealth : bHealth;
        roundFavoriteHealth = underdogIsA ? bHealth : aHealth;
        underdogAttacking = false;
      }
    }

    // --- Stat-based calculations ---
    let baseDamage = 0;
    let crit = false;
    let dodged = false;
    let weakSpot = false;
    let arenaObjectsUsed: string[] = [];
    let arenaBonus = 0;
    let arenaEvent = '';
    let randomEvent = '';

    if (isUnderdogRound && roundUnderdog && roundFavorite) {
      // Underdog mode logic
      if (!underdogAttacking) {
        // Favorite attacks underdog: one hit is fatal unless dodged
        // Dodge chance: underdog's agility/luck vs favorite's strength
        const dodgeChance = Math.min(0.85, 0.3 + (roundUnderdog.stats.agility + roundUnderdog.stats.luck) / (2 * (roundFavorite.stats.strength + 1)));
        dodged = rng() < dodgeChance;
        if (!dodged) {
          baseDamage = roundUnderdogHealth; // KO
        } else {
          baseDamage = 0;
          randomEvent = `${roundUnderdog.name} miraculously dodges a fatal blow!`;
        }
      } else {
        // Underdog attacks favorite: only chance is a weak spot critical
        // Only possible if underdog dodged last round or this is first round
        const weakSpotChance = 0.15 + (roundUnderdog.stats.luck / 100); // 15% base + luck
        weakSpot = rng() < weakSpotChance;
        if (weakSpot) {
          crit = true;
          // Massive damage: 50% of favorite's max health
          baseDamage = Math.floor(roundFavorite.stats.maxHealth * 0.5 + roundUnderdog.stats.strength);
          randomEvent = `${roundUnderdog.name} finds a weak spot and lands a devastating blow!`;
        } else {
          baseDamage = Math.max(1, roundUnderdog.stats.strength - roundFavorite.stats.defense);
        }
      }
      // Arena object: 30% chance to use, adds 1-10 damage
      if (arena.environmentalObjects && arena.environmentalObjects.length && rng() < 0.3) {
        const obj = pick(arena.environmentalObjects);
        arenaObjectsUsed.push(obj);
        arenaBonus = Math.floor(rng() * 10) + 1;
        arenaEvent = `${attacker.name} uses a ${obj}!`;
        baseDamage += arenaBonus;
      }
    } else {
      // Normal mode logic
      baseDamage = Math.max(1, attacker.stats.strength - defender.stats.defense + 5);
      // Agility: chance to dodge (agility/40)
      const dodgeChance = Math.min(0.5, defender.stats.agility / 40);
      dodged = rng() < dodgeChance;
      // Luck: chance for critical hit (luck/50)
      const critChance = Math.min(0.4, attacker.stats.luck / 50);
      crit = !dodged && rng() < critChance;
      // Arena object: 30% chance to use, adds 1-10 damage
      if (arena.environmentalObjects && arena.environmentalObjects.length && rng() < 0.3) {
        const obj = pick(arena.environmentalObjects);
        arenaObjectsUsed.push(obj);
        arenaBonus = Math.floor(rng() * 10) + 1;
        arenaEvent = `${attacker.name} uses a ${obj}!`;
      }
      // Random event: 20% chance for something wild
      if (rng() < 0.2) {
        if (attacker.stats.luck > defender.stats.luck && rng() < 0.5) {
          randomEvent = `${attacker.name} gets a lucky break! Extra damage!`;
          baseDamage += 10;
        } else if (defender.stats.luck > attacker.stats.luck && rng() < 0.5) {
          randomEvent = `${defender.name} miraculously avoids harm!`;
          baseDamage = 0;
        } else {
          randomEvent = 'Nothing unusual happens.';
        }
      }
      // Apply crit
      if (crit) baseDamage = Math.floor(baseDamage * 1.7);
      // Apply dodge
      if (dodged) baseDamage = 0;
      // Add arena bonus
      baseDamage += arenaBonus;
      // Never negative
      baseDamage = Math.max(0, baseDamage);
    }

    // Update health
    let newAttackerHealth = attackerHealth;
    let newDefenderHealth = Math.max(0, defenderHealth - baseDamage);
    if (round % 2 === 0) {
      bHealth = newAttackerHealth;
      aHealth = newDefenderHealth;
    } else {
      aHealth = newAttackerHealth;
      bHealth = newDefenderHealth;
    }

    // Log round
    log.push({
      round,
      attacker: attacker.name,
      defender: defender.name,
      statsUsed: {
        strength: attacker.stats.strength,
        defense: defender.stats.defense,
        agility: defender.stats.agility,
        luck: attacker.stats.luck,
      },
      damage: baseDamage,
      crit,
      dodged,
      weakSpot,
      randomEvent: randomEvent || arenaEvent || '',
      arenaObjectsUsed,
      healthAfter: {
        [attacker.name]: newAttackerHealth,
        [defender.name]: newDefenderHealth,
      },
    });

    // End early if someone is KO'd
    if (aHealth <= 0 || bHealth <= 0) break;
  }

  // Decide winner
  let winner = '';
  if (aHealth > bHealth) winner = fighterA.name;
  else if (bHealth > aHealth) winner = fighterB.name;
  else winner = 'Draw';

  return { winner, rounds: log };
}
