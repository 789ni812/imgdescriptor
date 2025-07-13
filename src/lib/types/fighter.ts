export interface FighterStats {
  health: number;        // 0-200 (0 = defeated)
  strength: number;      // 1-20 (attack power)
  agility: number;       // 1-20 (dodge, initiative)
  defense: number;       // 1-20 (damage reduction)
  luck: number;          // 1-20 (critical hit/dodge chance)
  magic?: number;        // 1-20 (Force, magic, superpowers)
  ranged?: number;       // 1-20 (blasters, breath, etc.)
  intelligence?: number; // 1-20 (strategy, cunning)
  uniqueAbilities?: string[]; // List of special moves or powers
} 