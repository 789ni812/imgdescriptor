import { renderHook, act, waitFor } from '@testing-library/react';
import { useStoryGeneration, buildStoryPrompt } from './useStoryGeneration';
import { createCharacter } from '@/lib/types/character';

// Mock fetch
(global as any).fetch = jest.fn();

const defaultCharacter = createCharacter({
  currentTurn: 1,
  stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
  storyHistory: [],
});

describe('useStoryGeneration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
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

    expect(result.current.story).toBeNull();
    expect(result.current.isStoryLoading).toBe(false);
    expect(result.current.storyError).toBeNull();
    expect(typeof result.current.generateStory).toBe('function');
  });

  it('should handle successful story generation', async () => {
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

    const mockResponse = { success: true, story: 'A magical adventure begins...' };
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

    expect(result.current.story).toBe('A magical adventure begins...');
    expect(result.current.storyError).toBeNull();
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
    expect(result.current.story).toBeNull();
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
    expect(result.current.story).toBeNull();
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
    expect(result.current.story).toBeNull();
  });

  describe('turn-based mock data selection', () => {
    it('should return different mock stories based on current turn when mock mode is enabled', async () => {
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

      await waitFor(() => {
        expect(result1.current.isStoryLoading).toBe(false);
      });

      expect(result1.current.story).toBe('Turn 1: The story begins in the ancient forest.');

      // Test turn 2
      const mockStore2 = { character: { ...defaultCharacter, currentTurn: 2 } };
      const { result: result2 } = renderHook(() => useStoryGeneration(mockConfig, mockStore2));

      act(() => {
        result2.current.generateStory('A beautiful landscape');
      });

      await waitFor(() => {
        expect(result2.current.isStoryLoading).toBe(false);
      });

      expect(result2.current.story).toBe('Turn 2: The adventure continues in the mysterious cave.');
    });

    it('should fallback to default mock story when turn-based data is not available', async () => {
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

      await waitFor(() => {
        expect(result.current.isStoryLoading).toBe(false);
      });

      expect(result.current.story).toBe('Default mock story');
    });
  });

  describe('Story Continuation Logic', () => {
    it('should build upon existing story when continuing with new images', async () => {
      const existingStory = 'Once upon a time, there was a brave knight who discovered a magical forest.';
      const newDescription = 'The knight now stands before an ancient castle with mysterious symbols.';
      const characterState = {
        character: {
          currentTurn: 2,
          storyHistory: [
            { 
              id: '1', 
              text: existingStory, 
              turnNumber: 1, 
              timestamp: new Date().toISOString(),
              imageDescription: 'A magical forest'
            }
          ],
          stats: { intelligence: 15, creativity: 12, perception: 18, wisdom: 14 },
          imageHistory: [],
          health: 100,
          heartrate: 70,
          age: 18,
          persona: 'Adventurer',
          traits: [],
          experience: 0,
          level: 1,
          inventory: [],
        }
      };

      const configOverride = {
        MOCK_STORY: false,
        MOCK_STORY_TEXT: '',
        TURN_BASED_MOCK_DATA: { stories: {} }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          story: 'The knight approaches the castle, recognizing the symbols as ancient runes of protection.' 
        }),
      });

      const { result } = renderHook(() => useStoryGeneration(configOverride, characterState));

      await act(async () => {
        await result.current.generateStory(newDescription, 'Continue the adventure');
      });

      // Verify the API call was made with the correct structure
      expect(fetch).toHaveBeenCalledWith('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining(newDescription),
      });

      // Verify the prompt includes the continuation instruction and context
      const callBody = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.prompt).toContain('Continue the adventure');
      expect(callBody.prompt).toContain('Turn: 2');
      expect(callBody.prompt).toContain('Stats: INT 15, CRE 12, PER 18, WIS 14');
      expect(callBody.prompt).toContain('Previous story: Once upon a time, there was a brave knight who discovered a magical forest.');
    });

    it('should include previous story context in continuation prompts', async () => {
      const existingStory = 'The knight found a magical sword in the forest.';
      const newDescription = 'A dragon appears in the distance.';
      const characterState = {
        character: {
          currentTurn: 2,
          storyHistory: [
            { 
              id: '1', 
              text: existingStory, 
              turnNumber: 1, 
              timestamp: new Date().toISOString(),
              imageDescription: 'A magical forest with a sword'
            }
          ],
          stats: { intelligence: 15, creativity: 12, perception: 18, wisdom: 14 },
          imageHistory: [],
          health: 100,
          heartrate: 70,
          age: 18,
          persona: 'Adventurer',
          traits: [],
          experience: 0,
          level: 1,
          inventory: [],
        }
      };

      const configOverride = {
        MOCK_STORY: false,
        MOCK_STORY_TEXT: '',
        TURN_BASED_MOCK_DATA: { stories: {} }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ story: 'The knight draws his magical sword to face the dragon.' }),
      });

      const { result } = renderHook(() => useStoryGeneration(configOverride, characterState));

      await act(async () => {
        await result.current.generateStory(newDescription, 'Continue the story');
      });

      // Verify the prompt includes previous story context
      const callBody = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.prompt).toContain('Continue the story');
      expect(callBody.prompt).toContain('Turn: 2');
      expect(callBody.prompt).toContain('Stats: INT 15, CRE 12, PER 18, WIS 14');
    });
  });
});

describe('buildStoryPrompt', () => {
  it('should build prompt with character stats and turn information', () => {
    const character = createCharacter({
      currentTurn: 2,
      stats: { intelligence: 15, creativity: 12, perception: 8, wisdom: 10 },
      storyHistory: [
        { 
          id: '1',
          turnNumber: 1, 
          text: 'The adventure began in a mysterious forest.',
          timestamp: '2023-01-01T00:00:00Z',
          imageDescription: 'A mysterious forest'
        }
      ],
    });

    const description = 'A hidden cave entrance with ancient symbols';
    const prompt = buildStoryPrompt({ character, description });

    expect(prompt).toContain('Turn: 2');
    expect(prompt).toContain('INT 15, CRE 12, PER 8, WIS 10');
    expect(prompt).toContain('Previous story: The adventure began in a mysterious forest.');
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
      currentTurn: 1,
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      storyHistory: [],
    });

    const description = 'A beautiful landscape';
    const prompt = buildStoryPrompt({ character, description });

    expect(prompt).toContain('Turn: 1');
    expect(prompt).toContain('INT 10, CRE 10, PER 10, WIS 10');
    expect(prompt).not.toContain('Previous story:');
    expect(prompt).toContain(description);
  });
});
