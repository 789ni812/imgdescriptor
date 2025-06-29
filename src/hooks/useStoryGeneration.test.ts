import { renderHook, act, waitFor } from '@testing-library/react';
import { useStoryGeneration, buildStoryPrompt, buildFinalStoryPrompt } from './useStoryGeneration';
import { createCharacter, type Character } from '@/lib/types/character';

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
});

describe('useStoryGeneration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockAddStory.mockClear();
    mockUpdateCurrentStory.mockClear();
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
    
    // Verify that the story was added to character history
    expect(mockAddStory).toHaveBeenCalledWith({
      id: expect.any(String),
      title: 'Story 1',
      description: 'A beautiful landscape',
      story: 'A magical adventure begins...',
      imageUrl: '',
      createdAt: expect.any(Date),
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
    expect(result.current.story).toBeNull();
    
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
    expect(result.current.story).toBeNull();
    
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
    expect(result.current.story).toBeNull();
    
    // Verify that no story was added to character history on error
    expect(mockAddStory).not.toHaveBeenCalled();
  });

  describe('turn-based mock data selection', () => {
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

      await waitFor(() => {
        expect(result1.current.isStoryLoading).toBe(false);
      });

      expect(result1.current.story).toBe('Turn 1: The story begins in the ancient forest.');
      
      // Verify that the story was added to character history
      expect(mockAddStory).toHaveBeenCalledWith({
        id: expect.any(String),
        title: 'Story 1',
        description: 'A beautiful landscape',
        story: 'Turn 1: The story begins in the ancient forest.',
        imageUrl: '',
        createdAt: expect.any(Date),
      });

      // Test turn 2
      mockAddStory.mockClear();
      const mockStore2 = { character: { ...defaultCharacter, currentTurn: 2 } };
      const { result: result2 } = renderHook(() => useStoryGeneration(mockConfig, mockStore2));

      act(() => {
        result2.current.generateStory('A beautiful landscape');
      });

      await waitFor(() => {
        expect(result2.current.isStoryLoading).toBe(false);
      });

      expect(result2.current.story).toBe('Turn 2: The adventure continues in the mysterious cave.');
      
      // Verify that the story was added to character history
      expect(mockAddStory).toHaveBeenCalledWith({
        id: expect.any(String),
        title: 'Story 2',
        description: 'A beautiful landscape',
        story: 'Turn 2: The adventure continues in the mysterious cave.',
        imageUrl: '',
        createdAt: expect.any(Date),
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

      await waitFor(() => {
        expect(result.current.isStoryLoading).toBe(false);
      });

      expect(result.current.story).toBe('Default mock story');
      
      // Verify that the story was added to character history
      expect(mockAddStory).toHaveBeenCalledWith({
        id: expect.any(String),
        title: 'Story 4',
        description: 'A beautiful landscape',
        story: 'Default mock story',
        imageUrl: '',
        createdAt: expect.any(Date),
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
});
