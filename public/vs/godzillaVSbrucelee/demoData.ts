import { Fighter, Scene } from '@/lib/stores/fightingGameStore';

// Demo fighters and scene for Godzilla vs Bruce Lee battle
export const demoGodzilla: Fighter = {
  id: 'godzilla-1',
  name: 'Godzilla',
  imageUrl: '/vs/godzillaVSbrucelee/godzilla.jpg',
  description: 'A massive prehistoric monster, towering over buildings with thick scaly skin, powerful tail, and atomic breath. Destructive force of nature.',
  stats: {
    health: 500,
    maxHealth: 500,
    strength: 50, // Dramatically increased for demo
    luck: 8,
    agility: 1, // Dramatically reduced for demo
    defense: 22,
    age: 200000000,
    size: 'large',
    build: 'heavy',
  },
  visualAnalysis: {
    age: 'ancient',
    size: 'massive',
    build: 'monstrous',
    appearance: ['scaly', 'towering', 'destructive', 'prehistoric'],
    weapons: ['atomic breath', 'tail', 'claws'],
    armor: ['thick scales'],
  },
  combatHistory: [],
  winLossRecord: { wins: 0, losses: 0, draws: 0 },
  createdAt: new Date().toISOString(),
};

export const demoBruceLee: Fighter = {
  id: 'bruce-lee-1',
  name: 'Bruce Lee',
  imageUrl: '/vs/godzillaVSbrucelee/bruce-lee.jpg',
  description: 'A legendary martial artist with incredible speed, precision, and fighting technique. Master of multiple martial arts styles.',
  stats: {
    health: 120,
    maxHealth: 120,
    strength: 12,
    luck: 18,
    agility: 20,
    defense: 8,
    age: 32,
    size: 'medium',
    build: 'muscular',
  },
  visualAnalysis: {
    age: 'adult',
    size: 'medium',
    build: 'athletic',
    appearance: ['focused', 'determined', 'agile'],
    weapons: ['martial arts', 'nunchucks', 'speed'],
    armor: [],
  },
  combatHistory: [],
  winLossRecord: { wins: 0, losses: 0, draws: 0 },
  createdAt: new Date().toISOString(),
};

export const demoArena: Scene = {
  id: 'tokyo-city-1',
  name: 'Tokyo City Streets',
  imageUrl: '/vs/godzillaVSbrucelee/tokyo-arena.jpg',
  description: 'A bustling Tokyo cityscape with skyscrapers, neon lights, and urban infrastructure. Cars, buildings, and city elements provide tactical opportunities.',
  environmentalObjects: ['skyscrapers', 'cars', 'street signs', 'neon lights', 'buildings', 'pavement'],
  createdAt: new Date().toISOString(),
};

// Export all demo data as a single object for easy import
export const godzillaVSbruceleeDemo = {
  fighterA: demoGodzilla,
  fighterB: demoBruceLee,
  scene: demoArena,
}; 