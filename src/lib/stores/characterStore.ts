import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character, CharacterStats, createCharacter } from '../types/character';

// Extended Character interface for the store with additional fields
export interface ExtendedCharacter extends Character {
  id: string;
  name: string;
  experienceToNext: number;
  createdAt: Date;
  updatedAt: Date;
}

// Story interface for the store
export interface Story {
  id: string;
  title: string;
  description: string;
  story: string;
  imageUrl: string;
  createdAt: Date;
}

// Character store state interface
export interface CharacterState {
  character: ExtendedCharacter;
  // Actions
  resetCharacter: () => void;
  updateCharacter: (updates: Partial<ExtendedCharacter>) => void;
  updateCharacterName: (name: string) => void;
  addExperience: (amount: number) => void;
  updateStat: (stat: keyof CharacterStats, value: number) => void;
  updateStats: (stats: Partial<CharacterStats>) => void;
  getTotalStats: () => number;
  getAverageStats: () => number;
  addStory: (story: Story) => void;
  updateStory: (id: string, story: Partial<Story>) => void;
  removeStory: (id: string) => void;
  getStory: (id: string) => Story | undefined;
  getRecentStories: (limit?: number) => Story[];
}

// Calculate experience needed for next level
const calculateExperienceToNext = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Clamp value between min and max
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Create default character with extended fields
const createDefaultCharacter = (): ExtendedCharacter => {
  const baseCharacter = createCharacter();
  return {
    ...baseCharacter,
    id: '1',
    name: 'Adventurer',
    experienceToNext: calculateExperienceToNext(1),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      character: createDefaultCharacter(),

      resetCharacter: () => {
        set({ character: createDefaultCharacter() });
      },

      updateCharacter: (updates: Partial<ExtendedCharacter>) => {
        set((state) => ({
          character: {
            ...state.character,
            ...updates,
            updatedAt: new Date(),
          },
        }));
      },

      updateCharacterName: (name: string) => {
        set((state) => ({
          character: {
            ...state.character,
            name,
            updatedAt: new Date(),
          },
        }));
      },

      addExperience: (amount: number) => {
        set((state) => {
          const { character } = state;
          let newExperience = character.experience + amount;
          let newLevel = character.level;
          let newExperienceToNext = character.experienceToNext;

          // Handle level ups
          while (newExperience >= newExperienceToNext) {
            newExperience -= newExperienceToNext;
            newLevel += 1;
            newExperienceToNext = calculateExperienceToNext(newLevel);
          }

          return {
            character: {
              ...character,
              experience: newExperience,
              level: newLevel,
              experienceToNext: newExperienceToNext,
              updatedAt: new Date(),
            },
          };
        });
      },

      updateStat: (stat: keyof CharacterStats, value: number) => {
        set((state) => {
          const { character } = state;
          const currentStats = character.stats;
          
          // Clamp the value to valid range (1-20)
          const clampedValue = clamp(value, 1, 20);
          
          return {
            character: {
              ...character,
              stats: {
                ...currentStats,
                [stat]: clampedValue,
              },
              updatedAt: new Date(),
            },
          };
        });
      },

      updateStats: (stats: Partial<CharacterStats>) => {
        set((state) => {
          const { character } = state;
          const currentStats = character.stats;
          
          // Clamp all stat values
          const clampedStats = Object.entries(stats).reduce((acc, [key, value]) => {
            acc[key as keyof CharacterStats] = clamp(value, 1, 20);
            return acc;
          }, {} as CharacterStats);
          
          return {
            character: {
              ...character,
              stats: {
                ...currentStats,
                ...clampedStats,
              },
              updatedAt: new Date(),
            },
          };
        });
      },

      getTotalStats: () => {
        const { character } = get();
        const stats = character.stats;
        return stats.intelligence + stats.creativity + stats.perception + stats.wisdom;
      },

      getAverageStats: () => {
        const { character } = get();
        const stats = character.stats;
        return (stats.intelligence + stats.creativity + stats.perception + stats.wisdom) / 4;
      },

      addStory: (story: Story) => {
        set((state) => ({
          character: {
            ...state.character,
            storyHistory: [
              ...state.character.storyHistory,
              {
                id: story.id,
                text: story.story,
                timestamp: story.createdAt.toISOString(),
                turnNumber: state.character.currentTurn,
                imageDescription: story.description,
              },
            ],
            updatedAt: new Date(),
          },
        }));
      },

      updateStory: (id: string, story: Partial<Story>) => {
        set((state) => {
          const { character } = state;
          const storyIndex = character.storyHistory.findIndex(s => s.id === id);
          
          if (storyIndex === -1) return state;
          
          const updatedStoryHistory = [...character.storyHistory];
          updatedStoryHistory[storyIndex] = {
            ...updatedStoryHistory[storyIndex],
            text: story.story || updatedStoryHistory[storyIndex].text,
            imageDescription: story.description || updatedStoryHistory[storyIndex].imageDescription,
          };
          
          return {
            character: {
              ...character,
              storyHistory: updatedStoryHistory,
              updatedAt: new Date(),
            },
          };
        });
      },

      removeStory: (id: string) => {
        set((state) => ({
          character: {
            ...state.character,
            storyHistory: state.character.storyHistory.filter(s => s.id !== id),
            updatedAt: new Date(),
          },
        }));
      },

      getStory: (id: string) => {
        const { character } = get();
        const storyEntry = character.storyHistory.find(s => s.id === id);
        
        if (!storyEntry) return undefined;
        
        return {
          id: storyEntry.id,
          title: `Story ${storyEntry.turnNumber}`,
          description: storyEntry.imageDescription,
          story: storyEntry.text,
          imageUrl: '', // We don't store image URLs in the current schema
          createdAt: new Date(storyEntry.timestamp),
        };
      },

      getRecentStories: (limit?: number) => {
        const { character } = get();
        const sortedStories = [...character.storyHistory]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        const limitedStories = limit ? sortedStories.slice(0, limit) : sortedStories;
        
        return limitedStories.map(storyEntry => ({
          id: storyEntry.id,
          title: `Story ${storyEntry.turnNumber}`,
          description: storyEntry.imageDescription,
          story: storyEntry.text,
          imageUrl: '', // We don't store image URLs in the current schema
          createdAt: new Date(storyEntry.timestamp),
        }));
      },
    }),
    {
      name: 'character-store',
    }
  )
); 