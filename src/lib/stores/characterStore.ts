import { create } from 'zustand';

export interface Item {
  id: string;
  name: string;
  // Add more fields as needed
}

export interface StoryEntry {
  id: string;
  text: string;
  // Add more fields as needed
}

export interface Character {
  health: number;
  heartrate: number;
  age: number;
  persona: string;
  traits: string[];
  experience: number;
  level: number;
  inventory: Item[];
  storyHistory: StoryEntry[];
  currentTurn: number;
}

export interface CharacterState {
  character: Character;
}

export const characterStore = create<CharacterState>(() => ({
  character: {
    health: 100,
    heartrate: 70,
    age: 18,
    persona: 'Adventurer',
    traits: [],
    experience: 0,
    level: 1,
    inventory: [],
    storyHistory: [],
    currentTurn: 1,
  },
})); 