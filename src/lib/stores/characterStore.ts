import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character, CharacterStats, createCharacter, ImageHistoryEntry, Choice, ChoiceOutcome, StoryEntry, ChoicesHistoryEntry } from '../types/character';
import { v4 as uuidv4 } from 'uuid';

// Extended Character interface for the store with additional fields
export interface ExtendedCharacter extends Character {
  id: string;
  name: string;
  experienceToNext: number;
  createdAt: Date;
  updatedAt: Date;
  imageHistory: ImageHistoryEntry[];
  finalStory?: string;
  currentStory?: string | null;
  currentDescription?: string | null;
  currentTurn: number;
  choicesHistory?: ChoicesHistoryEntry[];
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
  addStory: (story: StoryEntry) => void;
  updateStory: (id: string, story: Partial<StoryEntry>) => void;
  removeStory: (id: string) => void;
  getStory: (id: string) => StoryEntry | undefined;
  getRecentStories: (limit?: number) => StoryEntry[];
  initializeCharacterFromDescription: (description: string) => void;
  incrementTurn: () => void;
  addImageToHistory: (image: ImageHistoryEntry) => void;
  updateImageDescription: (id: string, description: string) => void;
  updateImageStory: (id: string, story: string) => void;
  updateCurrentStory: (story: string | null) => void;
  updateCurrentDescription: (description: string | null) => void;
  makeChoice: (choiceId: string) => void;
  addChoice: (choice: Choice) => void;
  clearCurrentChoices: () => void;
  getChoicesForTurn: (turn: number) => Choice[];
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
    currentStory: null,
    currentDescription: null,
    currentTurn: 1,
    choicesHistory: [],
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

      addStory: (story: StoryEntry) => {
        set((state) => ({
          character: {
            ...state.character,
            storyHistory: [
              ...state.character.storyHistory,
              story,
            ],
            updatedAt: new Date(),
          },
        }));
      },

      updateStory: (id: string, story: Partial<StoryEntry>) => {
        set((state) => {
          const { character } = state;
          const storyIndex = character.storyHistory.findIndex(s => s.id === id);
          
          if (storyIndex === -1) return state;
          
          const updatedStoryHistory = [...character.storyHistory];
          updatedStoryHistory[storyIndex] = {
            ...updatedStoryHistory[storyIndex],
            ...story,
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
        return character.storyHistory.find(s => s.id === id);
      },

      getRecentStories: (limit?: number) => {
        const { character } = get();
        const sortedStories = [...character.storyHistory]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return limit ? sortedStories.slice(0, limit) : sortedStories;
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
          if (state.character.currentTurn >= 3) {
            return state;
          }
          const nextTurn = state.character.currentTurn + 1;
          return {
            character: {
              ...state.character,
              currentTurn: nextTurn,
              updatedAt: new Date(),
            },
          };
        });
      },

      addImageToHistory: (image: ImageHistoryEntry) => {
        set((state) => ({
          character: {
            ...state.character,
            imageHistory: [...state.character.imageHistory, { ...image, turn: state.character.currentTurn }],
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

      updateCurrentStory: (story: string | null) => {
        set((state) => ({
          character: {
            ...state.character,
            currentStory: story,
            updatedAt: new Date(),
          },
        }));
      },

      updateCurrentDescription: (description: string | null) => {
        set((state) => ({
          character: {
            ...state.character,
            currentDescription: description,
            updatedAt: new Date(),
          },
        }));
      },

      makeChoice: (choiceId: string) => {
        set((state) => {
          const { character } = state;
          const choice = character.currentChoices.find(c => c.id === choiceId);
          
          if (!choice) {
            return state; // No change if choice not found
          }

          // Generate outcome based on choice
          const outcome: ChoiceOutcome = {
            id: uuidv4(),
            choiceId: choice.id,
            text: choice.text,
            outcome: `You chose to ${choice.text.toLowerCase()}. This decision shapes your journey.`,
            statChanges: choice.statRequirements ? 
              Object.entries(choice.statRequirements).reduce((acc, [stat, required]) => {
                const currentStat = character.stats[stat as keyof CharacterStats];
                if (currentStat >= required) {
                  acc[stat as keyof CharacterStats] = Math.floor(Math.random() * 3) + 1; // +1 to +3
                } else {
                  acc[stat as keyof CharacterStats] = -1; // Penalty for not meeting requirement
                }
                return acc;
              }, {} as Partial<CharacterStats>) : 
              { intelligence: Math.floor(Math.random() * 2) + 1 }, // Default small boost
            timestamp: new Date().toISOString(),
            turnNumber: character.currentTurn,
          };

          // Apply stat changes
          const newStats = { ...character.stats };
          if (outcome.statChanges) {
            Object.entries(outcome.statChanges).forEach(([stat, change]) => {
              newStats[stat as keyof CharacterStats] = clamp(
                newStats[stat as keyof CharacterStats] + change,
                1,
                20
              );
            });
          }

          // Remove the chosen choice from current choices
          const remainingChoices = character.currentChoices.filter(c => c.id !== choiceId);

          return {
            character: {
              ...character,
              stats: newStats,
              choiceHistory: [...character.choiceHistory, outcome],
              currentChoices: remainingChoices,
              updatedAt: new Date(),
            },
          };
        });
      },

      addChoice: (choice: Choice) => {
        set((state) => {
          const { character } = state;
          const currentTurn = character.currentTurn;
          // Add to currentChoices as before
          const newCurrentChoices = [...(character.currentChoices || []), choice];
          // Add to choicesHistory for this turn
          const newChoicesHistory = character.choicesHistory ? [...character.choicesHistory] : [];
          const idx = newChoicesHistory.findIndex(entry => entry.turn === currentTurn);
          if (idx !== -1) {
            // Update existing entry
            newChoicesHistory[idx] = {
              turn: currentTurn,
              choices: [...newChoicesHistory[idx].choices, choice],
            };
          } else {
            // Add new entry
            newChoicesHistory.push({ turn: currentTurn, choices: [choice] });
          }
          return {
            character: {
              ...character,
              currentChoices: newCurrentChoices,
              choicesHistory: newChoicesHistory,
              updatedAt: new Date(),
            },
          };
        });
      },

      clearCurrentChoices: () => {
        set((state) => ({
          character: {
            ...state.character,
            currentChoices: [],
            // Optionally clear choicesHistory for current turn if needed
            updatedAt: new Date(),
          },
        }));
      },

      getChoicesForTurn: (turn: number) => {
        const { character } = get();
        return (
          character.choicesHistory?.find(entry => entry.turn === turn)?.choices || []
        );
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