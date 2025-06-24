import { renderHook, act, waitFor } from '@testing-library/react';
import { useStoryGeneration, buildStoryPrompt } from './useStoryGeneration';
import { createCharacter } from '@/lib/types/character';
import * as config from '@/lib/config';

// Mock fetch
global.fetch = jest.fn();

// Mock useCharacterStore
jest.mock('@/lib/stores/characterStore', () => ({
  useCharacterStore: jest.fn(),
}));
import { useCharacterStore } from '@/lib/stores/characterStore';

// Mock config
jest.mock('@/lib/config', () => ({
  MOCK_STORY: false,
  MOCK_STORY_TEXT: '',
  TURN_BASED_MOCK_DATA: {
    imageDescriptions: {
      1: 'Turn 1: A beautiful forest with ancient trees.',
      2: 'Turn 2: A hidden cave entrance with mysterious symbols.',
      3: 'Turn 3: A crystal chamber filled with magical energy.'
    },
    stories: {
      1: 'Turn 1: The story begins in the ancient forest.',
      2: 'Turn 2: The adventure continues in the mysterious cave.',
      3: 'Turn 3: The journey reaches its climax in the crystal chamber.'
    }
  }
}));

const asMock = (fn: any) => fn as unknown as jest.Mock;

const defaultCharacter = createCharacter({
  currentTurn: 1,
  stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
  storyHistory: [],
});

describe('useStoryGeneration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    asMock(useCharacterStore).mockReturnValue({ character: { ...defaultCharacter } });
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useStoryGeneration());
    expect(result.current.story).toBeNull();
    expect(result.current.isStoryLoading).toBe(false);
    expect(result.current.storyError).toBeNull();
  });

  it('should handle successful story generation', async () => {
    const mockStory = 'Once upon a time...';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, story: mockStory }),
    });
    const mockCharacter = { ...defaultCharacter };
    const { result } = renderHook(() => useStoryGeneration(mockCharacter));
    await act(async () => {
      await result.current.generateStory('A beautiful landscape.');
    });
    await waitFor(() => {
      expect(result.current.isStoryLoading).toBe(false);
      expect(result.current.story).toBe(mockStory);
      expect(result.current.storyError).toBeNull();
    });
  });

  it('should not attempt to generate a story without a description', async () => {
    const mockCharacter = { ...defaultCharacter };
    const { result } = renderHook(() => useStoryGeneration(mockCharacter));
    await act(async () => {
      await result.current.generateStory('');
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.storyError).toBe('Cannot generate a story without a description.');
  });
  
  it('should handle API errors during story generation', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ success: false, error: 'API Error' }),
    });
    const mockCharacter = { ...defaultCharacter };
    const { result } = renderHook(() => useStoryGeneration(mockCharacter));
    await act(async () => {
        await result.current.generateStory('A valid description');
    });
    await waitFor(() => {
      expect(result.current.isStoryLoading).toBe(false);
      expect(result.current.story).toBeNull();
      expect(result.current.storyError).toBe('API Error');
    });
  });

  it('should include turn, character stats, and previous story in the story generation prompt (unit)', () => {
    // Arrange: mock character state
    const description = 'A mysterious cave entrance.';
    const turn = 2;
    const stats = { intelligence: 12, creativity: 14, perception: 10, wisdom: 15 };
    const previousStory = 'In the first turn, the hero found a map.';
    const character = createCharacter({
      currentTurn: turn,
      stats,
      storyHistory: [
        { id: '1', turnNumber: 1, text: previousStory, timestamp: '2023-01-01T00:00:00Z', imageDescription: 'A map' },
      ],
    });
    const expectedPromptParts = [
      `Turn: ${turn}`,
      `Stats: INT 12, CRE 14, PER 10, WIS 15`,
      `Previous story: ${previousStory}`,
      description
    ];
    // Act: build the prompt
    const prompt = buildStoryPrompt({ character, description });
    // Assert: the prompt should include all context
    expectedPromptParts.forEach(part => {
      expect(prompt).toContain(part);
    });
  });

  describe('turn-based mock data selection', () => {
    it('should return different mock stories based on current turn when mock mode is enabled', async () => {
      // Arrange: Enable mock mode and set up turn-based mock data
      (config as any).MOCK_STORY = true;
      
      // Mock turn 1
      const mockCharacter1 = createCharacter({ currentTurn: 1 });
      asMock(useCharacterStore).mockReturnValue({ character: mockCharacter1 });
      
      const { result: result1 } = renderHook(() => useStoryGeneration(mockCharacter1));

      // Act: Generate story for turn 1
      await act(async () => {
        await result1.current.generateStory('A beautiful landscape.');
      });
      
      await waitFor(() => {
        expect(result1.current.isStoryLoading).toBe(false);
      });

      const turn1Story = result1.current.story;

      // Mock turn 2
      const mockCharacter2 = createCharacter({ currentTurn: 2 });
      asMock(useCharacterStore).mockReturnValue({ character: mockCharacter2 });
      
      const { result: result2 } = renderHook(() => useStoryGeneration(mockCharacter2));

      // Act: Generate story for turn 2
      await act(async () => {
        await result2.current.generateStory('A mysterious cave.');
      });
      
      await waitFor(() => {
        expect(result2.current.isStoryLoading).toBe(false);
      });

      const turn2Story = result2.current.story;

      // Assert: Different stories should be returned for different turns
      expect(turn1Story).not.toBe(turn2Story);
      expect(turn1Story).toContain('Turn 1');
      expect(turn2Story).toContain('Turn 2');
    });

    it('should fallback to default mock story when turn-based data is not available', async () => {
      // Arrange: Enable mock mode but don't provide turn-based data
      (config as any).MOCK_STORY = true;
      (config as any).MOCK_STORY_TEXT = 'Default mock story';
      
      // Mock a turn that doesn't exist in turn-based data (turn 4)
      const mockCharacter = createCharacter({ currentTurn: 4 });
      asMock(useCharacterStore).mockReturnValue({ character: mockCharacter });
      
      const { result } = renderHook(() => useStoryGeneration(mockCharacter));

      // Act: Generate story
      await act(async () => {
        await result.current.generateStory('A beautiful landscape.');
      });
      
      await waitFor(() => {
        expect(result.current.isStoryLoading).toBe(false);
      });

      // Assert: Should use default mock story
      expect(result.current.story).toBe('Default mock story');
    });
  });
});
