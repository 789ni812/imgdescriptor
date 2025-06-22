import { renderHook, act } from '@testing-library/react';
import { useStoryGeneration } from './useStoryGeneration';

// Mock fetch
global.fetch = jest.fn();

describe('useStoryGeneration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
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

    const { result } = renderHook(() => useStoryGeneration());

    await act(async () => {
      await result.current.generateStory('A beautiful landscape.');
    });

    expect(result.current.isStoryLoading).toBe(false);
    expect(result.current.story).toBe(mockStory);
    expect(result.current.storyError).toBeNull();
  });

  it('should not attempt to generate a story without a description', async () => {
    const { result } = renderHook(() => useStoryGeneration());
    
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

    const { result } = renderHook(() => useStoryGeneration());
    
    await act(async () => {
        await result.current.generateStory('A valid description');
    });

    expect(result.current.isStoryLoading).toBe(false);
    expect(result.current.story).toBeNull();
    expect(result.current.storyError).toBe('API Error');
  });
});
