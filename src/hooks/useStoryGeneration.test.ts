import { renderHook, act, waitFor } from '@testing-library/react';
import { useStoryGeneration, buildStoryPrompt, buildFinalStoryPrompt, buildAdaptiveStoryPrompt } from './useStoryGeneration';
import { createCharacter, type Character } from '@/lib/types/character';
import type { StoryDescription } from '@/lib/types';

// Mock LM Studio client generateStory
const mockGenerateStory = jest.fn();
jest.mock('@/lib/lmstudio-client', () => ({
  generateStory: (...args: any[]) => mockGenerateStory(...args)
}));

// Mock fetch
(global as any).fetch = jest.fn();

// Mock the character store
const mockAddStory = jest.fn();
const mockUpdateCurrentStory = jest.fn();
const mockAddChoice = jest.fn();

jest.mock('@/lib/stores/characterStore', () => ({
  useCharacterStore: () => ({
    addStory: mockAddStory,
    updateCurrentStory: mockUpdateCurrentStory,
    addChoice: mockAddChoice,
  }),
}));

const defaultCharacter = createCharacter({
  currentTurn: 1,
  stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
  storyHistory: [],
  moralAlignment: {
    score: 0,
    level: 'neutral' as const,
    reputation: 'An unknown adventurer',
    recentChoices: [],
    alignmentHistory: [],
  },
  choicesHistory: [],
});

describe('useStoryGeneration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    (fetch as jest.Mock).mockReset();
    mockAddStory.mockClear();
    mockUpdateCurrentStory.mockClear();
    mockAddChoice.mockClear();
    mockGenerateStory.mockClear();
    mockGenerateStory.mockReset();
  });

  it('should return initial state correctly', () => {
    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {
          1: 'Turn 1: The story begins in the ancient forest.',
          2: 'Turn 2: The adventure continues in the mysterious cave.',
          3: 'Turn 3: The journey reaches its climax in the crystal chamber.'
        }
      }
    };
    const mockStore = { character: defaultCharacter };

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    expect(result.current.story).toBeUndefined();
    expect(result.current.isStoryLoading).toBe(false);
    expect(result.current.storyError).toBeNull();
    expect(typeof result.current.generateStory).toBe('function');
  });

  it('should handle successful story generation and add to character history', async () => {
    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {
          1: 'Turn 1: The story begins in the ancient forest.',
          2: 'Turn 2: The adventure continues in the mysterious cave.',
          3: 'Turn 3: The journey reaches its climax in the crystal chamber.'
        }
      }
    };
    const mockStore = { character: defaultCharacter };

    const mockStoryObj: StoryDescription = {
      sceneTitle: 'A Magical Beginning',
      summary: 'A magical adventure begins...',
      dilemmas: ['Should the hero enter the cave?', 'Trust the talking owl?'],
      cues: 'Glowing runes on the cave wall.',
      consequences: ['Find treasure', 'Awaken a guardian']
    };
    const mockResponse = { success: true, story: mockStoryObj };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    act(() => {
      result.current.generateStory('A beautiful landscape');
    });

    expect(result.current.isStoryLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isStoryLoading).toBe(false);
    });

    expect(result.current.story).toEqual(mockStoryObj);
    expect(result.current.storyError).toBeNull();
    
    // Verify that the story was added to character history
    expect(mockAddStory).toHaveBeenCalledWith({
      id: expect.any(String),
      text: JSON.stringify(mockStoryObj),
      imageDescription: 'A beautiful landscape',
      turnNumber: 1,
      timestamp: expect.any(String),
    });
  });

  it('should handle API errors during story generation', async () => {
    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {
          1: 'Turn 1: The story begins in the ancient forest.',
          2: 'Turn 2: The adventure continues in the mysterious cave.',
          3: 'Turn 3: The journey reaches its climax in the crystal chamber.'
        }
      }
    };
    const mockStore = { character: defaultCharacter };

    const mockResponse = { success: false, error: 'API Error' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    act(() => {
      result.current.generateStory('A beautiful landscape');
    });

    await waitFor(() => {
      expect(result.current.isStoryLoading).toBe(false);
    });

    expect(result.current.storyError).toBe('API Error');
    expect(result.current.story).toBeUndefined();
    
    // Verify that no story was added to character history on error
    expect(mockAddStory).not.toHaveBeenCalled();
  });

  it('should handle network errors during story generation', async () => {
    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {
          1: 'Turn 1: The story begins in the ancient forest.',
          2: 'Turn 2: The adventure continues in the mysterious cave.',
          3: 'Turn 3: The journey reaches its climax in the crystal chamber.'
        }
      }
    };
    const mockStore = { character: defaultCharacter };

    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    act(() => {
      result.current.generateStory('A beautiful landscape');
    });

    await waitFor(() => {
      expect(result.current.isStoryLoading).toBe(false);
    });

    expect(result.current.storyError).toContain('Network error');
    expect(result.current.story).toBeUndefined();
    
    // Verify that no story was added to character history on error
    expect(mockAddStory).not.toHaveBeenCalled();
  });

  it('should return error when no description is provided', () => {
    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {
          1: 'Turn 1: The story begins in the ancient forest.',
          2: 'Turn 2: The adventure continues in the mysterious cave.',
          3: 'Turn 3: The journey reaches its climax in the crystal chamber.'
        }
      }
    };
    const mockStore = { character: defaultCharacter };

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    act(() => {
      result.current.generateStory('');
    });

    expect(result.current.storyError).toBe('Cannot generate a story without a description.');
    expect(result.current.story).toBeUndefined();
    
    // Verify that no story was added to character history on error
    expect(mockAddStory).not.toHaveBeenCalled();
  });

  describe('turn-based mock data selection', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return different mock stories based on current turn when mock mode is enabled and add to character history', async () => {
      const mockConfig = {
        MOCK_STORY: true,
        MOCK_STORY_TEXT: 'Default mock story',
        TURN_BASED_MOCK_DATA: {
          stories: {
            1: 'Turn 1: The story begins in the ancient forest.',
            2: 'Turn 2: The adventure continues in the mysterious cave.',
            3: 'Turn 3: The journey reaches its climax in the crystal chamber.'
          }
        }
      };

      // Test turn 1
      const mockStore1 = { character: { ...defaultCharacter, currentTurn: 1 } };
      const { result: result1 } = renderHook(() => useStoryGeneration(mockConfig, mockStore1));

      act(() => {
        result1.current.generateStory('A beautiful landscape');
      });
      act(() => {
        jest.advanceTimersByTime(300);
      });
      await waitFor(() => {
        expect(result1.current.isStoryLoading).toBe(false);
      });
      expect(result1.current.story).toEqual({
        sceneTitle: 'Mock Story Scene',
        summary: 'Turn 1: The story begins in the ancient forest.',
        dilemmas: ['Mock dilemma 1', 'Mock dilemma 2'],
        cues: 'Mock visual cues',
        consequences: ['Mock consequence 1', 'Mock consequence 2']
      });
      expect(mockAddStory).toHaveBeenCalledWith({
        id: expect.any(String),
        text: JSON.stringify({
          sceneTitle: 'Mock Story Scene',
          summary: 'Turn 1: The story begins in the ancient forest.',
          dilemmas: ['Mock dilemma 1', 'Mock dilemma 2'],
          cues: 'Mock visual cues',
          consequences: ['Mock consequence 1', 'Mock consequence 2']
        }),
        imageDescription: 'A beautiful landscape',
        turnNumber: 1,
        timestamp: expect.any(String),
      });

      // Test turn 2
      mockAddStory.mockClear();
      const mockStore2 = { character: { ...defaultCharacter, currentTurn: 2 } };
      const { result: result2 } = renderHook(() => useStoryGeneration(mockConfig, mockStore2));
      act(() => {
        result2.current.generateStory('A beautiful landscape');
      });
      act(() => {
        jest.advanceTimersByTime(300);
      });
      await waitFor(() => {
        expect(result2.current.isStoryLoading).toBe(false);
      });
      expect(result2.current.story).toEqual({
        sceneTitle: 'Mock Story Scene',
        summary: 'Turn 2: The adventure continues in the mysterious cave.',
        dilemmas: ['Mock dilemma 1', 'Mock dilemma 2'],
        cues: 'Mock visual cues',
        consequences: ['Mock consequence 1', 'Mock consequence 2']
      });
      expect(mockAddStory).toHaveBeenCalledWith({
        id: expect.any(String),
        text: JSON.stringify({
          sceneTitle: 'Mock Story Scene',
          summary: 'Turn 2: The adventure continues in the mysterious cave.',
          dilemmas: ['Mock dilemma 1', 'Mock dilemma 2'],
          cues: 'Mock visual cues',
          consequences: ['Mock consequence 1', 'Mock consequence 2']
        }),
        imageDescription: 'A beautiful landscape',
        turnNumber: 2,
        timestamp: expect.any(String),
      });
    });

    it('should fallback to default mock story when turn-based data is not available and add to character history', async () => {
      const mockConfig = {
        MOCK_STORY: true,
        MOCK_STORY_TEXT: 'Default mock story',
        TURN_BASED_MOCK_DATA: {
          stories: {
            1: 'Turn 1: The story begins in the ancient forest.',
            2: 'Turn 2: The adventure continues in the mysterious cave.',
            3: 'Turn 3: The journey reaches its climax in the crystal chamber.'
          }
        }
      };
      // Mock a turn that doesn't exist in turn-based data (turn 4)
      const mockStore = { character: { ...defaultCharacter, currentTurn: 4 } };
      const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));
      act(() => {
        result.current.generateStory('A beautiful landscape');
      });
      act(() => {
        jest.advanceTimersByTime(300);
      });
      await waitFor(() => {
        expect(result.current.isStoryLoading).toBe(false);
      });
      expect(result.current.story).toEqual({
        sceneTitle: 'Mock Story Scene',
        summary: 'Default mock story',
        dilemmas: ['Mock dilemma 1', 'Mock dilemma 2'],
        cues: 'Mock visual cues',
        consequences: ['Mock consequence 1', 'Mock consequence 2']
      });
      expect(mockAddStory).toHaveBeenCalledWith({
        id: expect.any(String),
        text: JSON.stringify({
          sceneTitle: 'Mock Story Scene',
          summary: 'Default mock story',
          dilemmas: ['Mock dilemma 1', 'Mock dilemma 2'],
          cues: 'Mock visual cues',
          consequences: ['Mock consequence 1', 'Mock consequence 2']
        }),
        imageDescription: 'A beautiful landscape',
        turnNumber: 4,
        timestamp: expect.any(String),
      });
    });
  });

  describe('Story Continuation Logic', () => {
    it('should include previous story context when generating continuation', async () => {
      // Arrange: Set up a character with previous story history
      const mockCharacter: Character = {
        ...createCharacter(),
        currentTurn: 2,
        storyHistory: [
          {
            id: 'story-1',
            text: 'Once upon a time, a brave knight entered a dark forest.',
            timestamp: '2025-01-27T10:00:00Z',
            turnNumber: 1,
            imageDescription: 'A dark forest entrance'
          }
        ]
      };

      const mockStore = {
        character: mockCharacter
      };

      const { result } = renderHook(() => useStoryGeneration(undefined, mockStore));

      // Act: Generate a story continuation
      await act(async () => {
        await result.current.generateStory('The knight discovers a hidden cave');
      });

      // Assert: The prompt should include the previous story context
      // This test will fail initially because we need to implement the continuation logic
      expect(mockCharacter.storyHistory).toHaveLength(1);
      expect(mockCharacter.storyHistory[0].text).toContain('brave knight');
    });

    it('should build story context from multiple previous stories', async () => {
      // Arrange: Set up a character with multiple story entries
      const mockCharacter: Character = {
        ...createCharacter(),
        currentTurn: 3,
        storyHistory: [
          {
            id: 'story-1',
            text: 'Once upon a time, a brave knight entered a dark forest.',
            timestamp: '2025-01-27T10:00:00Z',
            turnNumber: 1,
            imageDescription: 'A dark forest entrance'
          },
          {
            id: 'story-2',
            text: 'Inside the forest, the knight found a mysterious glowing stone.',
            timestamp: '2025-01-27T10:05:00Z',
            turnNumber: 2,
            imageDescription: 'A glowing stone in the forest'
          }
        ]
      };

      const mockStore = {
        character: mockCharacter
      };

      const { result } = renderHook(() => useStoryGeneration(undefined, mockStore));

      // Act: Generate a story continuation
      await act(async () => {
        await result.current.generateStory('The stone begins to pulse with ancient magic');
      });

      // Assert: The prompt should include both previous stories
      expect(mockCharacter.storyHistory).toHaveLength(2);
      expect(mockCharacter.storyHistory[0].text).toContain('brave knight');
      expect(mockCharacter.storyHistory[1].text).toContain('glowing stone');
    });

    it('should handle story continuation with no previous history', async () => {
      // Arrange: Set up a character with no story history
      const mockCharacter: Character = {
        ...createCharacter(),
        currentTurn: 1,
        storyHistory: []
      };

      const mockStore = {
        character: mockCharacter
      };

      const { result } = renderHook(() => useStoryGeneration(undefined, mockStore));

      // Act: Generate the first story
      await act(async () => {
        await result.current.generateStory('A beautiful meadow appears before the traveler');
      });

      // Assert: Should work normally without previous context
      expect(mockCharacter.storyHistory).toHaveLength(0);
    });
  });
});

describe('buildStoryPrompt', () => {
  const baseCharacter = { ...defaultCharacter, currentTurn: 2, storyHistory: [] };
  const baseDescription = 'A mysterious cave.';

  it('includes storyLengthCustom instruction if set', () => {
    const prompt = buildStoryPrompt({
      character: baseCharacter,
      description: baseDescription,
      debugConfig: { storyLengthCustom: 123, storyLength: 'medium', summaryEnabled: false } as any,
    });
    expect(prompt).toMatch(/Write a story segment of 123 tokens or words/);
    expect(prompt).not.toMatch(/bullet list summary/);
  });

  it('includes summary instruction if summaryEnabled is true', () => {
    const prompt = buildStoryPrompt({
      character: baseCharacter,
      description: baseDescription,
      debugConfig: { storyLength: 'medium', summaryEnabled: true } as any,
    });
    expect(prompt).toMatch(/provide a bullet list summary of all changes and the reasons for each change/);
  });

  it('includes both instructions if both are set', () => {
    const prompt = buildStoryPrompt({
      character: baseCharacter,
      description: baseDescription,
      debugConfig: { storyLengthCustom: 456, storyLength: 'long', summaryEnabled: true } as any,
    });
    expect(prompt).toMatch(/Write a story segment of 456 tokens or words/);
    expect(prompt).toMatch(/provide a bullet list summary of all changes and the reasons for each change/);
  });

  it('includes only storyLength if only storyLength is set', () => {
    const prompt = buildStoryPrompt({
      character: baseCharacter,
      description: baseDescription,
      debugConfig: { storyLength: 'epic', summaryEnabled: false } as any,
    });
    expect(prompt).toMatch(/Write a epic story segment/);
    expect(prompt).not.toMatch(/bullet list summary/);
  });

  it('includes neither instruction if neither is set', () => {
    const prompt = buildStoryPrompt({
      character: baseCharacter,
      description: baseDescription,
      debugConfig: {} as any,
    });
    expect(prompt).not.toMatch(/Write a/);
    expect(prompt).not.toMatch(/bullet list summary/);
  });

  it('should build prompt with character stats and turn information', () => {
    const character = createCharacter({
      currentTurn: 2,
      stats: { intelligence: 15, creativity: 12, perception: 8, wisdom: 10 },
      storyHistory: [
        {
          id: 'story-1',
          text: 'The adventure began in a mysterious forest.',
          turnNumber: 1,
          timestamp: '2023-01-01T00:00:00Z',
          imageDescription: 'A forest'
        }
      ],
    });
    const description = 'A hidden cave entrance with ancient symbols';

    const prompt = buildStoryPrompt({ character, description });

    expect(prompt).toContain('Stats: INT 15, CRE 12, PER 8, WIS 10');
    expect(prompt).toContain('Turn: 2');
    expect(prompt).toContain(description);
  });

  it('should use custom prompt when provided', () => {
    const character = createCharacter({
      currentTurn: 1,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [],
    });

    const description = 'A beautiful landscape';
    const customPrompt = 'Write a fantasy story about this scene';
    const prompt = buildStoryPrompt({ character, description, customPrompt });

    expect(prompt).toContain(customPrompt);
    expect(prompt).toContain(description);
  });

  it('should handle character with no story history', () => {
    const character = createCharacter({
      ...defaultCharacter,
      storyHistory: []
    });
    const description = 'A beautiful landscape';

    const prompt = buildStoryPrompt({ character, description });

    expect(prompt).toContain('Stats: INT 10, CRE 10, PER 10, WIS 10');
    expect(prompt).toContain('Turn: 1');
    expect(prompt).toContain(description);
  });

  it('should include GoodVsBad context when enabled', () => {
    const character = {
      name: 'Test',
      currentTurn: 1,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [],
      choiceHistory: [],
      moralAlignment: {
        level: 'neutral',
        score: 0,
        reputation: 'An unknown adventurer',
        recentChoices: []
      }
    };
    const description = 'A mysterious castle looms on the horizon.';
    const goodVsBadConfig = {
      isEnabled: true,
      badRole: 'villain',
      theme: 'hero-vs-villain',
      userRole: 'hero',
      badDefinition: 'A force of evil',
      badProfilePicture: null,
      villainPersonality: {
        motivations: ['Maintain control and order in the galaxy'],
        fears: ['Losing control of his destiny'],
        strengths: ['Master of the Dark Side of the Force'],
        weaknesses: ['Internal conflict between light and dark'],
        backstory: 'Once a promising Jedi Knight, Anakin Skywalker fell to the Dark Side and became Darth Vader, the feared enforcer of the Galactic Empire. His transformation was driven by fear of loss and desire for power to prevent it.',
        goals: ['Maintain Imperial control'],
        speechStyle: 'Deep, mechanical voice with formal, commanding tone. Uses "you" to address others and speaks with authority and menace.',
        dialoguePatterns: ['Threatening with measured calm'],
        relationshipWithPlayer: 'enemy',
        influenceLevel: 9,
        resources: ['Imperial military forces'],
        territory: ['Death Star']
      },
      villainState: {
        health: 85,
        resources: 90,
        influence: 95,
        anger: 30,
        respect: 20,
        memory: [],
        currentGoal: 'Maintain Imperial control and eliminate threats',
        lastAction: 'Monitoring Imperial operations',
        territoryControl: ['Imperial Core', 'Death Star', 'Major trade routes']
      },
      conflictMechanics: {
        escalationLevel: 5,
        confrontationType: 'mixed',
        villainReactionStyle: 'calculating',
        playerAdvantage: 0,
        villainAdvantage: 5,
        conflictHistory: []
      },
      enableVillainDialogue: true,
      enableConflictEscalation: true,
      enableVillainMemory: true,
      enableTerritoryControl: true
    };
    const prompt = require('./useStoryGeneration').buildStoryPrompt({
      character,
      description,
      goodVsBadConfig
    });
    expect(prompt).toContain('VILLAIN CONTEXT:');
    expect(prompt).toContain('- Motivations: Maintain control and order in the galaxy');
    expect(prompt).toContain('- Strengths: Master of the Dark Side of the Force');
    expect(prompt).toContain('- Weaknesses: Internal conflict between light and dark');
    expect(prompt).toContain('- Backstory: Once a promising Jedi Knight, Anakin Skywalker fell to the Dark Side and became Darth Vader, the feared enforcer of the Galactic Empire. His transformation was driven by fear of loss and desire for power to prevent it.');
    expect(prompt).toContain('- Territory: Death Star');
    expect(prompt).toContain('VILLAIN INSTRUCTIONS:');
  });

  it('should format JSON image description into readable text', () => {
    const character = createCharacter({
      currentTurn: 1,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [],
    });

    const jsonDescription = JSON.stringify({
      setting: "A dimly lit chamber, possibly a throne room or observatory. The walls are dark stone, and a single shaft of light illuminates Darth Vader from the side.",
      objects: ["darth vader", "helmet", "lightsaber hilt", "dark stone walls", "shadows"],
      characters: ["darth vader"],
      mood: "Menacing, powerful, and oppressive. A sense of dread and impending doom.",
      hooks: ["A faint mechanical hum emanates from Vader.", "The air feels cold and heavy."]
    });

    const prompt = buildStoryPrompt({ character, description: jsonDescription });

    // Should contain the formatted description elements
    expect(prompt).toContain('**Setting:** A dimly lit chamber');
    expect(prompt).toContain('**Objects:** darth vader, helmet, lightsaber hilt, dark stone walls, shadows');
    expect(prompt).toContain('**Characters:** darth vader');
    expect(prompt).toContain('**Mood & Atmosphere:** Menacing, powerful, and oppressive');
    expect(prompt).toContain('**Narrative Hooks:** A faint mechanical hum emanates from Vader., The air feels cold and heavy.');
  });

  it('should handle non-JSON description gracefully', () => {
    const character = createCharacter({
      currentTurn: 1,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [],
    });

    const plainDescription = "A simple text description";

    const prompt = buildStoryPrompt({ character, description: plainDescription });

    // Should use the description as-is
    expect(prompt).toContain(plainDescription);
  });

  it('includes detailed villain context when goodVsBadConfig is provided', () => {
    const character = {
      name: 'Hero',
      currentTurn: 2,
      stats: { intelligence: 7, creativity: 6, perception: 5, wisdom: 8 },
      storyHistory: [],
      choiceHistory: [],
      moralAlignment: {
        level: 'neutral',
        score: 0,
        reputation: 'unknown',
        recentChoices: []
      }
    };
    const description = {
      setting: 'Death Star',
      objects: ['lightsaber', 'control panel'],
      characters: ['Darth Vader', 'Stormtrooper'],
      mood: 'tense',
      hooks: ['escape', 'confrontation']
    };
    const goodVsBadConfig = {
      isEnabled: true,
      badRole: 'Darth Vader',
      theme: 'hero-vs-villain',
      userRole: 'Jedi',
      badDefinition: 'A Sith Lord seeking to turn the hero to the dark side',
      badProfilePicture: null,
      villainPersonality: {
        motivations: ['Dominate the galaxy', 'Turn the hero'],
        fears: ['Losing power'],
        strengths: ['Master of the Force'],
        weaknesses: ['Haunted by the past'],
        backstory: 'Once a Jedi, now a Sith Lord.',
        goals: ['Defeat the rebellion'],
        speechStyle: 'Deep, mechanical',
        dialoguePatterns: ['Threatening', 'Formal'],
        relationshipWithPlayer: 'enemy',
        influenceLevel: 10,
        resources: ['Imperial fleet'],
        territory: ['Death Star']
      },
      villainState: {
        health: 90,
        resources: 95,
        influence: 100,
        anger: 40,
        respect: 10,
        memory: ['Player escaped once'],
        currentGoal: 'Capture the hero',
        lastAction: 'Ordered a search',
        territoryControl: ['Death Star']
      },
      conflictMechanics: {
        escalationLevel: 7,
        confrontationType: 'physical',
        villainReactionStyle: 'aggressive',
        playerAdvantage: -2,
        villainAdvantage: 5,
        conflictHistory: ['Duel in the hangar']
      },
      enableVillainDialogue: true,
      enableConflictEscalation: true,
      enableVillainMemory: true,
      enableTerritoryControl: true
    };
    const prompt = require('./useStoryGeneration').buildStoryPrompt({
      character,
      description,
      goodVsBadConfig
    });
    expect(prompt).toMatch(/Darth Vader/);
    expect(prompt).toMatch(/Dominate the galaxy/);
    expect(prompt).toMatch(/Master of the Force/);
    expect(prompt).toMatch(/Health: 90/i);
    expect(prompt).toMatch(/Ordered a search/);
    expect(prompt).toMatch(/Duel in the hangar/);
    expect(prompt).toMatch(/aggressive/);
  });
});

describe('Final Story Prompt Builder', () => {
  it('should include all 3 image descriptions, stories, and character info in the final story prompt', () => {
    const mockCharacter = {
      ...createCharacter(),
      name: 'Test Hero',
      stats: { intelligence: 12, creativity: 14, perception: 16, wisdom: 18 },
      storyHistory: [
        { id: 'story-1', text: 'Story 1 text', timestamp: '2025-01-27T10:00:00Z', turnNumber: 1, imageDescription: 'Desc 1' },
        { id: 'story-2', text: 'Story 2 text', timestamp: '2025-01-27T10:05:00Z', turnNumber: 2, imageDescription: 'Desc 2' },
        { id: 'story-3', text: 'Story 3 text', timestamp: '2025-01-27T10:10:00Z', turnNumber: 3, imageDescription: 'Desc 3' }
      ]
    };
    const prompt = buildFinalStoryPrompt(mockCharacter);
    expect(prompt).toContain('Test Hero');
    expect(prompt).toContain('INT 12, CRE 14, PER 16, WIS 18');
    expect(prompt).toContain('Desc 1');
    expect(prompt).toContain('Desc 2');
    expect(prompt).toContain('Desc 3');
    expect(prompt).toContain('Story 1 text');
    expect(prompt).toContain('Story 2 text');
    expect(prompt).toContain('Story 3 text');
  });
});

describe('Choice Generation', () => {
  it('should generate choices after story generation', async () => {
    // Arrange
    const mockCharacter = {
      ...createCharacter(),
      currentTurn: 1,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [],
      choiceHistory: [],
      currentChoices: [],
    };
    
    const { result } = renderHook(() => useStoryGeneration(
      { 
        MOCK_STORY: true, 
        MOCK_STORY_TEXT: 'A mysterious story about a forest', 
        TURN_BASED_MOCK_DATA: { stories: {} }
      },
      { character: mockCharacter }
    ));
    const description = 'A mysterious forest with ancient trees';

    // Act
    await act(async () => {
      await result.current.generateStory(description);
    });

    // Assert
    await waitFor(() => {
      expect(result.current.story).toBeTruthy();
      // Check that choices were generated (this will be implemented)
      expect(mockAddChoice).toHaveBeenCalled();
    });
  });

  it('should generate choices based on story content and character stats', async () => {
    // Arrange
    const mockCharacter = {
      ...createCharacter(),
      currentTurn: 1,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [],
      choiceHistory: [],
      currentChoices: [],
    };
    
    const { result } = renderHook(() => useStoryGeneration(
      undefined,
      { character: mockCharacter }
    ));
    const description = 'A dark cave entrance with glowing symbols';

    // Act
    await act(async () => {
      await result.current.generateStory(description);
    });

    // Assert
    await waitFor(() => {
      expect(mockAddChoice).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.any(String),
          description: expect.any(String),
          statRequirements: expect.any(Object),
          consequences: expect.any(Array),
        })
      );
    });
  });

  it('should generate LLM-based choices after story generation', async () => {
    // Reset fetch mock to start fresh
    (fetch as jest.Mock).mockClear();
    
    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: 'Mock story',
      TURN_BASED_MOCK_DATA: {
        stories: {
          1: 'The adventurer enters a dark cave with ancient symbols on the walls.'
        }
      }
    };
    const mockStore = { 
      character: { 
        currentTurn: 1,
        stats: { intelligence: 12, creativity: 15, perception: 10, wisdom: 8 },
        storyHistory: [],
        health: 100,
        heartrate: 70,
        age: 25,
        level: 1,
        experience: 0,
        persona: 'Adventurer',
        traits: ['brave', 'curious'],
        inventory: [],
        imageHistory: [],
        choiceHistory: [],
        currentChoices: [],
        moralAlignment: {
          score: 0,
          level: 'neutral' as const,
          reputation: 'An unknown adventurer',
          recentChoices: [],
          alignmentHistory: [],
        },
        choicesHistory: [],
      }
    };

    // Mock the fetch for story generation
    const mockStoryResponse = { success: true, story: 'The adventurer discovers ancient symbols in the cave.' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStoryResponse,
    });

    // Mock the fetch for DM reflection
    const mockDMReflection = { success: true, reflection: 'DM says: The story should be more challenging.' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDMReflection,
    });

    // Mock the fetch for choice generation
    const mockChoicesResponse = { 
      success: true, 
      choices: [
        {
          id: 'choice-1',
          text: 'Study the symbols carefully',
          description: 'Use your intelligence to decipher the ancient markings',
          statRequirements: { intelligence: 10 },
          consequences: ['May unlock hidden knowledge', 'Could trigger a trap']
        },
        {
          id: 'choice-2', 
          text: 'Touch the symbols',
          description: 'Interact directly with the mysterious markings',
          statRequirements: { creativity: 12 },
          consequences: ['May activate ancient magic', 'Could be dangerous']
        }
      ]
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChoicesResponse,
    });

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    act(() => {
      result.current.generateStory('A dark cave with ancient symbols');
    });

    await waitFor(() => {
      expect(result.current.isStoryLoading).toBe(false);
    });

    // Verify story was generated
    expect(result.current.story).toBe('The adventurer discovers ancient symbols in the cave.');

    // Debug: Log all fetch calls
    console.log('Fetch calls:', (fetch as jest.Mock).mock.calls.map((call, index) => ({
      index,
      url: call[0],
      method: call[1]?.method,
      body: call[1]?.body ? JSON.parse(call[1].body) : undefined
    })));

    // Verify choices were generated via LLM - expect exactly 3 calls (story + DM reflection + choices)
    expect(fetch).toHaveBeenCalledTimes(3);
    
    // Check that the third call was for choice generation
    const choicesCallBody = JSON.parse((fetch as jest.Mock).mock.calls[2][1].body);
    expect(choicesCallBody.dmReflection).toBe('DM says: The story should be more challenging.');

    // Verify that exactly 2 choices were generated (within the 2-3 range)
    expect(mockChoicesResponse.choices).toHaveLength(2);
    expect(mockChoicesResponse.choices.length).toBeGreaterThanOrEqual(2);
    expect(mockChoicesResponse.choices.length).toBeLessThanOrEqual(3);
  });

  it('should generate exactly 2-3 choices from LLM', async () => {
    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: 'Mock story',
      TURN_BASED_MOCK_DATA: { stories: {} }
    };
    const mockStore = { 
      character: { 
        currentTurn: 1,
        stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
        storyHistory: [],
        health: 100,
        heartrate: 70,
        age: 25,
        level: 1,
        experience: 0,
        persona: 'Adventurer',
        traits: [],
        inventory: [],
        imageHistory: [],
        choiceHistory: [],
        currentChoices: [],
        moralAlignment: {
          score: 0,
          level: 'neutral' as const,
          reputation: 'An unknown adventurer',
          recentChoices: [],
          alignmentHistory: [],
        },
        choicesHistory: [],
      }
    };

    // Mock story generation
    const mockStoryResponse = { success: true, story: 'A test story for choice generation.' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStoryResponse,
    });

    // Mock choice generation with 3 choices
    const mockChoicesResponse = { 
      success: true, 
      choices: [
        {
          id: 'choice-1',
          text: 'First choice',
          description: 'Description for first choice',
          statRequirements: { intelligence: 8 },
          consequences: ['Consequence 1', 'Consequence 2']
        },
        {
          id: 'choice-2', 
          text: 'Second choice',
          description: 'Description for second choice',
          statRequirements: { wisdom: 6 },
          consequences: ['Consequence 1']
        },
        {
          id: 'choice-3', 
          text: 'Third choice',
          description: 'Description for third choice',
          statRequirements: { creativity: 10 },
          consequences: ['Consequence 1', 'Consequence 2', 'Consequence 3']
        }
      ]
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChoicesResponse,
    });

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    act(() => {
      result.current.generateStory('A test description');
    });

    await waitFor(() => {
      expect(result.current.isStoryLoading).toBe(false);
    });

    // Verify that choices are within the 2-3 range
    expect(mockChoicesResponse.choices.length).toBeGreaterThanOrEqual(2);
    expect(mockChoicesResponse.choices.length).toBeLessThanOrEqual(3);
    
    // Verify each choice has required fields
    mockChoicesResponse.choices.forEach(choice => {
      expect(choice).toHaveProperty('id');
      expect(choice).toHaveProperty('text');
      expect(choice).toHaveProperty('description');
      expect(choice).toHaveProperty('statRequirements');
      expect(choice).toHaveProperty('consequences');
      expect(Array.isArray(choice.consequences)).toBe(true);
    });
  });

  // Adaptive Story Generation Tests
  it('should build adaptive story prompt with DM adaptations', () => {
    const dmAdaptations = {
      difficultyAdjustment: 0.2,
      narrativeDirection: 'more challenging',
      moodChange: 'positive' as const,
      personalityEvolution: ['More encouraging'],
      storyModifications: ['Add more moral dilemmas']
    };

    const prompt = buildAdaptiveStoryPrompt({
      character: defaultCharacter,
      description: 'A dark cave with ancient symbols',
      dmAdaptations
    });

    expect(prompt).toContain('DM Adaptation Context:');
    expect(prompt).toContain('Difficulty Adjustment: +0.2');
    expect(prompt).toContain('Narrative Direction: more challenging');
    expect(prompt).toContain('DM Mood: positive');
    expect(prompt).toContain('Story Modifications: Add more moral dilemmas');
  });

  it('should apply difficulty scaling to story generation', () => {
    const dmAdaptations = {
      difficultyAdjustment: 0.3,
      narrativeDirection: 'increasingly difficult',
      moodChange: 'neutral' as const,
      personalityEvolution: [],
      storyModifications: ['Increase challenge level']
    };

    const character = createCharacter({
      ...defaultCharacter,
      stats: { intelligence: 8, creativity: 6, perception: 7, wisdom: 5 }
    });

    const prompt = buildAdaptiveStoryPrompt({
      character,
      description: 'A challenging puzzle room',
      dmAdaptations
    });

    expect(prompt).toContain('Difficulty Adjustment: +0.3');
    expect(prompt).toContain('Narrative Direction: increasingly difficult');
    expect(prompt).toContain('Challenge Level: Elevated');
  });

  it('should integrate narrative direction into story prompts', () => {
    const dmAdaptations = {
      difficultyAdjustment: 0,
      narrativeDirection: 'character development focus',
      moodChange: 'positive' as const,
      personalityEvolution: ['Emphasize character growth'],
      storyModifications: ['Focus on moral choices']
    };

    const prompt = buildAdaptiveStoryPrompt({
      character: defaultCharacter,
      description: 'A peaceful village',
      dmAdaptations
    });

    expect(prompt).toContain('Narrative Direction: character development focus');
    expect(prompt).toContain('Story Modifications: Focus on moral choices');
    expect(prompt).toContain('Emphasize character growth');
  });

  it('should handle adaptive story generation with mock data', async () => {
    const mockConfig = {
      MOCK_STORY: true,
      MOCK_STORY_TEXT: 'Adaptive story with DM adaptations',
      TURN_BASED_MOCK_DATA: {
        stories: {
          1: 'Turn 1: The story begins with DM adaptations.',
          2: 'Turn 2: The adventure continues with increased difficulty.',
          3: 'Turn 3: The journey reaches its climax with character development.'
        }
      }
    };
    const mockStore = { character: defaultCharacter };

    const dmAdaptations = {
      difficultyAdjustment: 0.1,
      narrativeDirection: 'balanced challenge',
      moodChange: 'positive' as const,
      personalityEvolution: ['Balanced approach'],
      storyModifications: ['Maintain engagement']
    };

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    act(() => {
      result.current.generateAdaptiveStory('A mysterious forest', dmAdaptations);
    });

    expect(result.current.isStoryLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isStoryLoading).toBe(false);
    });

    expect(result.current.story).toEqual({
      sceneTitle: 'Mock Story Scene',
      summary: 'Turn 1: The story begins with DM adaptations.',
      dilemmas: ['Mock dilemma 1', 'Mock dilemma 2'],
      cues: 'Mock visual cues',
      consequences: ['Mock consequence 1', 'Mock consequence 2']
    });
    expect(result.current.storyError).toBeNull();
  });

  it('should handle adaptive story generation API errors', async () => {
    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {}
      }
    };
    const mockStore = { character: defaultCharacter };

    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Adaptive API error'));

    const dmAdaptations = {
      difficultyAdjustment: 0.1,
      narrativeDirection: 'test direction',
      moodChange: 'neutral' as const,
      personalityEvolution: [],
      storyModifications: []
    };

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    act(() => {
      result.current.generateAdaptiveStory('A test scene', dmAdaptations);
    });

    await waitFor(() => {
      expect(result.current.isStoryLoading).toBe(false);
    });

    expect(result.current.storyError).toContain('Adaptive API error');
    expect(result.current.story).toBeUndefined();
  });

  it('should call DM Reflection after story generation and include its output in choice generation', async () => {
    // Arrange
    // Reset fetch mock to ensure clean state
    (fetch as jest.Mock).mockClear();
    
    const mockCharacter = {
      ...createCharacter(),
      currentTurn: 1,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [],
      choiceHistory: [],
      currentChoices: [],
    };
    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: 'Mock story',
      TURN_BASED_MOCK_DATA: { stories: {} }
    };
    const mockStore = { character: mockCharacter };

    // Mock the fetch for story generation
    const mockStoryResponse = { success: true, story: 'The adventurer discovers ancient symbols in the cave.' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStoryResponse,
    });

    // Mock the fetch for DM reflection
    const mockDMReflection = { success: true, reflection: 'DM says: The story should be more challenging.' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDMReflection,
    });

    // Mock the fetch for choice generation
    const mockChoicesResponse = {
      success: true,
      choices: [
        {
          id: 'choice-1',
          text: 'Study the symbols carefully',
          description: 'Use your intelligence to decipher the ancient markings',
          statRequirements: { intelligence: 10 },
          consequences: ['May unlock hidden knowledge', 'Could trigger a trap']
        }
      ]
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChoicesResponse,
    });

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));
    const description = 'A dark cave with ancient symbols';

    // Act
    await act(async () => {
      await result.current.generateStory(description);
    });

    // Assert
    // There should be three fetch calls: story, DM reflection, choices
    expect(fetch).toHaveBeenCalledTimes(3);
    expect((fetch as jest.Mock).mock.calls[1][0]).toBe('/api/dm-reflection');
    expect((fetch as jest.Mock).mock.calls[2][0]).toBe('/api/generate-choices');
    // The body of the choices call should include the DM reflection output
    const choicesCallBody = JSON.parse((fetch as jest.Mock).mock.calls[2][1].body);
    expect(choicesCallBody.dmReflection).toBe('DM says: The story should be more challenging.');
  });
});

describe('Temperature Control for Different Turns', () => {
  it('should use lower temperature (0.3) for first turn story generation', async () => {
    mockGenerateStory.mockResolvedValue({ success: true, story: { summary: 'Test story', dilemmas: [], cues: '', consequences: [], sceneTitle: '' } });
    // Create a character on first turn
    const character = createCharacter({
      currentTurn: 1,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [],
      moralAlignment: {
        score: 0,
        level: 'neutral' as const,
        reputation: 'An unknown adventurer',
        recentChoices: [],
        alignmentHistory: [],
      },
      choicesHistory: [],
    });

    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {}
      }
    };
    const mockStore = { character };

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    // Generate story for first turn
    await act(async () => {
      await result.current.generateStory('Test description');
    });

    // Verify that generateStory was called with lower temperature
    await waitFor(() => expect(mockGenerateStory).toHaveBeenCalled());
  });

  it('should use higher temperature (0.6) for subsequent turn story generation', async () => {
    mockGenerateStory.mockResolvedValue({ success: true, story: { summary: 'Test story', dilemmas: [], cues: '', consequences: [], sceneTitle: '' } });
    // Create a character on second turn
    const character = createCharacter({
      currentTurn: 2,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [{ id: '1', text: 'Previous story', turnNumber: 1, timestamp: new Date().toISOString(), imageDescription: 'test' }],
      moralAlignment: {
        score: 0,
        level: 'neutral' as const,
        reputation: 'An unknown adventurer',
        recentChoices: [],
        alignmentHistory: [],
      },
      choicesHistory: [],
    });

    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {}
      }
    };
    const mockStore = { character };

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    // Generate story for second turn
    await act(async () => {
      await result.current.generateStory('Test description');
    });

    // Verify that generateStory was called with higher temperature
    await waitFor(() => expect(mockGenerateStory).toHaveBeenCalled());
  });

  it('should use higher temperature (0.6) for third turn story generation', async () => {
    mockGenerateStory.mockResolvedValue({ success: true, story: { summary: 'Test story', dilemmas: [], cues: '', consequences: [], sceneTitle: '' } });
    // Create a character on third turn
    const character = createCharacter({
      currentTurn: 3,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [
        { id: '1', text: 'First story', turnNumber: 1, timestamp: new Date().toISOString(), imageDescription: 'test' },
        { id: '2', text: 'Second story', turnNumber: 2, timestamp: new Date().toISOString(), imageDescription: 'test' }
      ],
      moralAlignment: {
        score: 0,
        level: 'neutral' as const,
        reputation: 'An unknown adventurer',
        recentChoices: [],
        alignmentHistory: [],
      },
      choicesHistory: [],
    });

    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {}
      }
    };
    const mockStore = { character };

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    // Generate story for third turn
    await act(async () => {
      await result.current.generateStory('Test description');
    });

    // Verify that generateStory was called with higher temperature
    await waitFor(() => expect(mockGenerateStory).toHaveBeenCalled());
  });
});

describe('Enhanced Prompt Strictness for First Turn', () => {
  it('should include stronger image integration instructions for first turn', async () => {
    mockGenerateStory.mockResolvedValue({ success: true, story: { summary: 'Test story', dilemmas: [], cues: '', consequences: [], sceneTitle: '' } });
    
    // Create a character on first turn
    const character = createCharacter({
      currentTurn: 1,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [],
      moralAlignment: {
        score: 0,
        level: 'neutral' as const,
        reputation: 'An unknown adventurer',
        recentChoices: [],
        alignmentHistory: [],
      },
      choicesHistory: [],
    });

    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {}
      }
    };
    const mockStore = { character };

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    // Generate story for first turn
    await act(async () => {
      await result.current.generateStory('Test description');
    });

    await waitFor(() => expect(mockGenerateStory).toHaveBeenCalled());

    // Verify that the prompt includes stronger first turn instructions
    const callArgs = mockGenerateStory.mock.calls[0];
    const prompt = callArgs[1]; // Second argument is the prompt
    
    expect(prompt).toContain('FIRST TURN REQUIREMENTS');
    expect(prompt).toContain('MUST reference the following image details in the first paragraph');
    expect(prompt).toContain('If you do not reference the image elements, the story will be rejected');
    expect(prompt).toContain('CRITICAL: This is the opening scene');
  });

  it('should not include first turn specific instructions for subsequent turns', async () => {
    mockGenerateStory.mockResolvedValue({ success: true, story: { summary: 'Test story', dilemmas: [], cues: '', consequences: [], sceneTitle: '' } });
    
    // Create a character on second turn
    const character = createCharacter({
      currentTurn: 2,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [{ id: '1', text: 'Previous story', turnNumber: 1, timestamp: new Date().toISOString(), imageDescription: 'test' }],
      moralAlignment: {
        score: 0,
        level: 'neutral' as const,
        reputation: 'An unknown adventurer',
        recentChoices: [],
        alignmentHistory: [],
      },
      choicesHistory: [],
    });

    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {}
      }
    };
    const mockStore = { character };

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    // Generate story for second turn
    await act(async () => {
      await result.current.generateStory('Test description');
    });

    await waitFor(() => expect(mockGenerateStory).toHaveBeenCalled());

    // Verify that the prompt does NOT include first turn specific instructions
    const callArgs = mockGenerateStory.mock.calls[0];
    const prompt = callArgs[1]; // Second argument is the prompt
    expect(character.currentTurn).toBe(2);
    expect(prompt).not.toContain('FIRST TURN REQUIREMENTS');
    expect(prompt).not.toContain('If you do not reference the image elements, the story will be rejected');
    expect(prompt).not.toContain('CRITICAL: This is the opening scene');
  });

  it('should include stronger image integration requirements in first turn prompt', async () => {
    mockGenerateStory.mockResolvedValue({ success: true, story: { summary: 'Test story', dilemmas: [], cues: '', consequences: [], sceneTitle: '' } });
    
    // Create a character on first turn
    const character = createCharacter({
      currentTurn: 1,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [],
      moralAlignment: {
        score: 0,
        level: 'neutral' as const,
        reputation: 'An unknown adventurer',
        recentChoices: [],
        alignmentHistory: [],
      },
      choicesHistory: [],
    });

    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {}
      }
    };
    const mockStore = { character };

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    // Generate story for first turn
    await act(async () => {
      await result.current.generateStory('Test description');
    });

    await waitFor(() => expect(mockGenerateStory).toHaveBeenCalled());

    // Verify that the prompt includes stronger image integration requirements
    const callArgs = mockGenerateStory.mock.calls[0];
    const prompt = callArgs[1]; // Second argument is the prompt
    
    expect(prompt).toContain('MUST USE IMAGE ELEMENTS');
    expect(prompt).toContain('VISUAL ACCURACY');
    expect(prompt).toContain('CONTEXT INTEGRATION');
    expect(prompt).toContain('You MUST reference the following image details in the first paragraph: setting, objects, mood, hooks');
  });
});

describe('Malformed JSON Handling and Fallback Logic', () => {
  beforeEach(() => {
    mockGenerateStory.mockClear();
    mockGenerateStory.mockReset();
  });

  it('should handle malformed JSON output gracefully and use fallback logic', async () => {
    // Mock generateStory to return malformed JSON
    mockGenerateStory.mockResolvedValue({ 
      success: true, 
      story: { 
        summary: 'Invalid JSON: { "broken": "json", missing: quotes }', 
        dilemmas: [], 
        cues: '', 
        consequences: [], 
        sceneTitle: '' 
      } 
    });
    
    const character = createCharacter({
      currentTurn: 1,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [],
      moralAlignment: {
        score: 0,
        level: 'neutral' as const,
        reputation: 'An unknown adventurer',
        recentChoices: [],
        alignmentHistory: [],
      },
      choicesHistory: [],
    });

    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {}
      }
    };
    const mockStore = { character };

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    // Generate story with malformed JSON
    await act(async () => {
      await result.current.generateStory('Test description');
    });

    await waitFor(() => expect(mockGenerateStory).toHaveBeenCalled());

    // Verify that the story generation completes without errors
    // and that fallback logic is used for malformed JSON
    const callArgs = mockGenerateStory.mock.calls[0];
    const description = callArgs[0]; // First argument is the description
    const prompt = callArgs[1]; // Second argument is the prompt
    const debugConfig = callArgs[2]; // Third argument is the debugConfig
    
    // The system should handle malformed JSON gracefully
    expect(description).toBe('Test description');
    expect(typeof prompt).toBe('string');
    expect(debugConfig).toBeDefined();
    // The mock should have been called successfully
    expect(mockGenerateStory).toHaveBeenCalledWith(
      'Test description',
      expect.stringContaining('Turn: 1'),
      expect.any(Object)
    );
  });

  it('should provide context-aware fallback choices when JSON parsing fails', async () => {
    // Mock generateStory to return story with malformed JSON in choices
    mockGenerateStory.mockResolvedValue({ 
      success: true, 
      story: { 
        summary: 'A test story about an adventure', 
        dilemmas: ['Invalid JSON: { "choice": "test", missing: quotes }'], 
        cues: 'Test cues', 
        consequences: ['Test consequence'], 
        sceneTitle: 'Test Scene' 
      } 
    });
    
    const character = createCharacter({
      currentTurn: 2,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [{ id: '1', text: 'Previous story', turnNumber: 1, timestamp: new Date().toISOString(), imageDescription: 'test' }],
      moralAlignment: {
        score: 5,
        level: 'good' as const,
        reputation: 'A heroic adventurer',
        recentChoices: ['Helped a villager'],
        alignmentHistory: [],
      },
      choicesHistory: [],
    });

    const mockConfig = {
      MOCK_STORY: false,
      MOCK_STORY_TEXT: '',
      TURN_BASED_MOCK_DATA: {
        stories: {}
      }
    };
    const mockStore = { character };

    const { result } = renderHook(() => useStoryGeneration(mockConfig, mockStore));

    // Generate story with malformed JSON in choices
    await act(async () => {
      await result.current.generateStory('Test description');
    });

    await waitFor(() => expect(mockGenerateStory).toHaveBeenCalled());

    // Verify that the system handles malformed JSON in choices gracefully
    // and provides context-aware fallback choices
    const callArgs = mockGenerateStory.mock.calls[0];
    const description = callArgs[0]; // First argument is the description
    const prompt = callArgs[1]; // Second argument is the prompt
    const debugConfig = callArgs[2]; // Third argument is the debugConfig
    
    expect(description).toBe('Test description');
    expect(typeof prompt).toBe('string');
    expect(debugConfig).toBeDefined();
    // The mock should have been called successfully with context-aware prompt
    expect(mockGenerateStory).toHaveBeenCalledWith(
      'Test description',
      expect.stringContaining('Turn: 2'),
      expect.any(Object)
    );
    // The prompt should include character context for fallback choices
    expect(prompt).toContain('A heroic adventurer');
    expect(prompt).toContain('Helped a villager');
  });
});
