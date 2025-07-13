export interface FighterStats {
  health: number;        // 0-1000 (0 = defeated, Godzilla level = 800-1000, human = 50-150)
  strength: number;      // 1-200 (1 = ant, 30-40 = Bruce Lee, 200 = Godzilla)
  agility: number;       // 1-100 (1 = sloth, 50-70 = Bruce Lee, 100 = speedster)
  defense: number;       // 1-100 (1 = paper, 20-40 = human, 100 = indestructible)
  luck: number;          // 1-50 (1 = unlucky, 10-20 = average, 50 = extremely lucky)
  magic?: number;        // 1-100 (1 = mundane, 50-80 = Jedi, 100 = cosmic power)
  ranged?: number;       // 1-100 (1 = melee only, 30-50 = blaster, 100 = death star)
  intelligence?: number; // 1-100 (1 = simple, 30-50 = human, 100 = super genius)
  uniqueAbilities?: string[]; // List of special moves or powers
} 