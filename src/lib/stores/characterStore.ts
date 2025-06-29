import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character, CharacterStats, createCharacter, ImageHistoryEntry } from '../types/character';

// Extended Character interface for the store with additional fields
export interface ExtendedCharacter extends Character {
  id: string;
  name: string;
  experienceToNext: number;
  createdAt: Date;
  updatedAt: Date;
  imageHistory: ImageHistoryEntry[];
  finalStory?: string;
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
  initializeCharacterFromDescription: (description: string) => void;
  incrementTurn: () => void;
  addImageToHistory: (image: ImageHistoryEntry) => void;
  updateImageDescription: (id: string, description: string) => void;
  updateImageStory: (id: string, story: string) => void;
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
    imageHistory: [],
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
                turnNumber: state.character.currentTurn + 1,
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

      initializeCharacterFromDescription: (description: string) => {
        set((state) => {
          const { character } = state;
          
          // Don't reinitialize if character already has story history
          if (character.storyHistory.length > 0) {
            return state;
          }
          
          // Generate character name based on description
          const generateName = (desc: string): string => {
            const adjectives = ['Brave', 'Wise', 'Mysterious', 'Curious', 'Bold', 'Clever', 'Swift'];
            const nouns = ['Explorer', 'Seeker', 'Wanderer', 'Discoverer', 'Observer', 'Traveler', 'Scout', 'Hunter'];
            const lowerDesc = desc.toLowerCase();
            // Look for key words in description to influence name
            if (lowerDesc.includes('dragon') || lowerDesc.includes('fire') || lowerDesc.includes('magic')) {
              return 'Mystical Seeker';
            } else if (lowerDesc.includes('forest') || lowerDesc.includes('nature') || lowerDesc.includes('peaceful')) {
              return 'Nature Wanderer';
            } else if (lowerDesc.includes('castle') || lowerDesc.includes('knight') || lowerDesc.includes('medieval')) {
              return 'Brave Knight';
            } else if (lowerDesc.includes('dungeon') || lowerDesc.includes('dark') || lowerDesc.includes('trap')) {
              return 'Shadow Scout';
            } else if (lowerDesc.includes('ocean') || lowerDesc.includes('sea') || lowerDesc.includes('water')) {
              return 'Ocean Explorer';
            } else if (lowerDesc.includes('mountain') || lowerDesc.includes('peak') || lowerDesc.includes('high')) {
              return 'Mountain Climber';
            } else if (lowerDesc.includes('city') || lowerDesc.includes('urban') || lowerDesc.includes('modern')) {
              return 'Urban Discoverer';
            } else {
              // Use a hash of the description to seed the random selection for reproducibility
              let hash = 0;
              for (let i = 0; i < lowerDesc.length; i++) {
                hash = ((hash << 5) - hash) + lowerDesc.charCodeAt(i);
                hash |= 0;
              }
              // Add timestamp to ensure uniqueness even for empty descriptions
              const timestamp = Date.now();
              const combinedHash = hash + timestamp;
              const adj = adjectives[Math.abs(combinedHash) % adjectives.length];
              const noun = nouns[Math.abs(combinedHash * 31) % nouns.length];
              let name = `${adj} ${noun}`;
              if (name.trim().toLowerCase() === 'adventurer') {
                name = `${adj} ${noun} ${Math.floor(Math.random() * 1000)}`;
              }
              return name;
            }
          };
          
          // Generate stats based on description content
          const generateStats = (desc: string): CharacterStats => {
            const words = desc.toLowerCase();
            let intelligence = 10;
            let creativity = 10;
            let perception = 10;
            let wisdom = 10;
            let matched = false;
            // Adjust stats based on description content
            if (words.includes('magic') || words.includes('spell') || words.includes('wizard')) {
              intelligence += 3;
              creativity += 2;
              matched = true;
            }
            if (words.includes('art') || words.includes('creative') || words.includes('beautiful')) {
              creativity += 3;
              perception += 2;
              matched = true;
            }
            if (words.includes('danger') || words.includes('trap') || words.includes('hidden')) {
              perception += 3;
              wisdom += 2;
              matched = true;
            }
            if (words.includes('ancient') || words.includes('wisdom') || words.includes('knowledge')) {
              wisdom += 3;
              intelligence += 2;
              matched = true;
            }
            if (words.includes('nature') || words.includes('forest') || words.includes('wildlife')) {
              perception += 2;
              wisdom += 1;
              matched = true;
            }
            if (words.includes('technology') || words.includes('modern') || words.includes('future')) {
              intelligence += 2;
              creativity += 1;
              matched = true;
            }
            if (words.includes('peaceful') || words.includes('calm') || words.includes('serene')) {
              wisdom += 2;
              perception += 1;
              matched = true;
            }
            if (words.includes('chaos') || words.includes('battle') || words.includes('war')) {
              perception += 2;
              intelligence += 1;
              matched = true;
            }
            // If no keywords matched, use a hash of the description to generate stats
            if (!matched) {
              let hash = 0;
              for (let i = 0; i < words.length; i++) {
                hash = ((hash << 5) - hash) + words.charCodeAt(i);
                hash |= 0;
              }
              // Add timestamp to ensure uniqueness even for empty descriptions
              const timestamp = Date.now();
              const combinedHash = hash + timestamp;
              intelligence = clamp(Math.abs(combinedHash) % 20 + 1, 1, 20);
              creativity = clamp(Math.abs(combinedHash * 31) % 20 + 1, 1, 20);
              perception = clamp(Math.abs(combinedHash * 17) % 20 + 1, 1, 20);
              wisdom = clamp(Math.abs(combinedHash * 13) % 20 + 1, 1, 20);
            }
            // Ensure stats stay within valid range (1-20)
            return {
              intelligence: clamp(intelligence, 1, 20),
              creativity: clamp(creativity, 1, 20),
              perception: clamp(perception, 1, 20),
              wisdom: clamp(wisdom, 1, 20),
            };
          };
          
          const newName = generateName(description);
          const newStats = generateStats(description);
          
          return {
            character: {
              ...character,
              name: newName,
              stats: newStats,
              level: 1,
              experience: 0,
              experienceToNext: calculateExperienceToNext(1),
              currentTurn: 1,
              updatedAt: new Date(),
            },
          };
        });
      },

      incrementTurn: () => {
        set((state) => {
          console.log('incrementTurn called, prev turn:', state.character.currentTurn);
          return {
            character: {
              ...state.character,
              currentTurn: state.character.currentTurn + 1,
              updatedAt: new Date(),
            },
          };
        });
      },

      addImageToHistory: (image: ImageHistoryEntry) => {
        set((state) => ({
          character: {
            ...state.character,
            imageHistory: [...state.character.imageHistory, image],
            updatedAt: new Date(),
          },
        }));
      },

      updateImageDescription: (id, description) => {
        set((state) => ({
          character: {
            ...state.character,
            imageHistory: state.character.imageHistory.map(img =>
              img.id === id ? { ...img, description } : img
            ),
            updatedAt: new Date(),
          },
        }));
      },

      updateImageStory: (id, story) => {
        set((state) => ({
          character: {
            ...state.character,
            imageHistory: state.character.imageHistory.map(img =>
              img.id === id ? { ...img, story } : img
            ),
            updatedAt: new Date(),
          },
        }));
      },
    }),
    {
      name: 'character-store',
      partialize: (state) => ({
        ...state,
        character: {
          ...state.character,
          imageHistory: [], // Exclude imageHistory from persistence
        },
      }),
    }
  )
); 