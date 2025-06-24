import { renderHook, act, waitFor } from '@testing-library/react';
import { useStoryGeneration, buildStoryPrompt } from './useStoryGeneration';

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
}));

const asMock = (fn: any) => fn as unknown as jest.Mock;

const defaultCharacter = {
  currentTurn: 1,
  stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
  storyHistory: [],
};

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
    const character = {
      currentTurn: turn,
      stats,
      storyHistory: [
        { turnNumber: 1, text: previousStory },
      ],
    };
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
});
