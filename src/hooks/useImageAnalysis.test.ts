import { renderHook, act, waitFor } from '@testing-library/react';
import { useImageAnalysis } from './useImageAnalysis';
import * as config from '@/lib/config';

// Mock the config module to disable mock mode during tests
jest.mock('@/lib/config', () => ({
  MOCK_IMAGE_DESCRIPTION: false,
  MOCK_IMAGE_DESCRIPTION_TEXT: 'Mock description',
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

// Mock fetch
global.fetch = jest.fn();

// Mock FileReader
const mockFileReaderInstance = {
  readAsDataURL: jest.fn(),
  onload: jest.fn() as ((e: ProgressEvent<FileReader>) => void) | null,
  result: 'data:image/png;base64,test-base64-string',
};
const mockFileReader = jest.fn(() => mockFileReaderInstance);
(global as any).FileReader = mockFileReader;

// Mock character store
jest.mock('@/lib/stores/characterStore', () => ({
  useCharacterStore: jest.fn(),
}));
import { useCharacterStore } from '@/lib/stores/characterStore';

const asMock = (fn: any) => fn as unknown as jest.Mock;

describe('useImageAnalysis', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockFileReader.mockClear();
    (mockFileReaderInstance.readAsDataURL as jest.Mock).mockClear();
    mockFileReaderInstance.onload = jest.fn();
    asMock(useCharacterStore).mockReturnValue({ 
      character: { currentTurn: 1 } 
    });
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useImageAnalysis());
    expect(result.current.description).toBeNull();
    expect(result.current.isDescriptionLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful image analysis with default prompt', async () => {
    const mockDescription = 'A beautiful landscape.';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, description: mockDescription }),
    });

    const { result } = renderHook(() => useImageAnalysis());
    const testFile = new File([''], 'test.png', { type: 'image/png' });

    await act(async () => {
      result.current.analyzeImage(testFile);
      // Manually trigger onload for the mocked FileReader
      if (mockFileReaderInstance.onload) {
        mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
      }
    });
    
    await waitFor(() => {
      expect(result.current.isDescriptionLoading).toBe(false);
    });
    
    expect(result.current.description).toBe(mockDescription);
    expect(result.current.error).toBeNull();
    
    // Verify the default prompt was used
    expect(fetch).toHaveBeenCalledWith('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'test-base64-string',
        prompt: 'Describe this image in detail.',
      }),
    });
  });

  it('should handle successful image analysis with custom prompt', async () => {
    const mockDescription = 'A beautiful landscape.';
    const customPrompt = 'Analyze the colors and composition of this image';
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, description: mockDescription }),
    });

    const { result } = renderHook(() => useImageAnalysis());
    const testFile = new File([''], 'test.png', { type: 'image/png' });

    await act(async () => {
      result.current.analyzeImage(testFile, customPrompt);
      // Manually trigger onload for the mocked FileReader
      if (mockFileReaderInstance.onload) {
        mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
      }
    });
    
    await waitFor(() => {
      expect(result.current.isDescriptionLoading).toBe(false);
    });
    
    expect(result.current.description).toBe(mockDescription);
    expect(result.current.error).toBeNull();
    
    // Verify the custom prompt was used
    expect(fetch).toHaveBeenCalledWith('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'test-base64-string',
        prompt: customPrompt,
      }),
    });
  });

  it('should handle API errors during image analysis', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ success: false, error: 'API Error' }),
    });

    const { result } = renderHook(() => useImageAnalysis());
    const testFile = new File([''], 'test.png', { type: 'image/png' });

    await act(async () => {
        result.current.analyzeImage(testFile);
        if (mockFileReaderInstance.onload) {
            mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
        }
    });

    await waitFor(() => {
      expect(result.current.isDescriptionLoading).toBe(false);
    });

    expect(result.current.description).toBeNull();
    expect(result.current.error).toBe('API Error');
  });

  it('should handle network errors during image analysis', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

    const { result } = renderHook(() => useImageAnalysis());
    const testFile = new File([''], 'test.png', { type: 'image/png' });
    
    await act(async () => {
        result.current.analyzeImage(testFile);
        if (mockFileReaderInstance.onload) {
            mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
        }
    });

    await waitFor(() => {
      expect(result.current.isDescriptionLoading).toBe(false);
    });

    expect(result.current.description).toBeNull();
    expect(result.current.error).toContain('An unexpected error occurred: Network failure');
  });

  it('should use default prompt when no custom prompt is provided', async () => {
    const mockDescription = 'A beautiful landscape.';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, description: mockDescription }),
    });

    const { result } = renderHook(() => useImageAnalysis());
    const testFile = new File([''], 'test.png', { type: 'image/png' });

    await act(async () => {
      result.current.analyzeImage(testFile, undefined);
      if (mockFileReaderInstance.onload) {
        mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
      }
    });
    
    await waitFor(() => {
      expect(result.current.isDescriptionLoading).toBe(false);
    });
    
    // Verify the default prompt was used when undefined is passed
    expect(fetch).toHaveBeenCalledWith('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'test-base64-string',
        prompt: 'Describe this image in detail.',
      }),
    });
  });

  describe('turn-based mock data selection', () => {
    it('should return different mock descriptions based on current turn when mock mode is enabled', async () => {
      // Arrange: Enable mock mode and set up turn-based mock data
      (config as any).MOCK_IMAGE_DESCRIPTION = true;
      
      // Mock turn 1
      asMock(useCharacterStore).mockReturnValue({ 
        character: { currentTurn: 1 } 
      });
      
      const { result: result1 } = renderHook(() => useImageAnalysis());
      const testFile = new File([''], 'test.png', { type: 'image/png' });

      // Act: Analyze image for turn 1
      await act(async () => {
        result1.current.analyzeImage(testFile);
        if (mockFileReaderInstance.onload) {
          mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
        }
      });
      
      await waitFor(() => {
        expect(result1.current.isDescriptionLoading).toBe(false);
      });

      const turn1Description = result1.current.description;

      // Mock turn 2
      asMock(useCharacterStore).mockReturnValue({ 
        character: { currentTurn: 2 } 
      });
      
      const { result: result2 } = renderHook(() => useImageAnalysis());

      // Act: Analyze image for turn 2
      await act(async () => {
        result2.current.analyzeImage(testFile);
        if (mockFileReaderInstance.onload) {
          mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
        }
      });
      
      await waitFor(() => {
        expect(result2.current.isDescriptionLoading).toBe(false);
      });

      const turn2Description = result2.current.description;

      // Assert: Different descriptions should be returned for different turns
      expect(turn1Description).not.toBe(turn2Description);
      expect(turn1Description).toContain('Turn 1');
      expect(turn2Description).toContain('Turn 2');
    });

    it('should fallback to default mock description when turn-based data is not available', async () => {
      // Arrange: Enable mock mode but don't provide turn-based data
      (config as any).MOCK_IMAGE_DESCRIPTION = true;
      (config as any).MOCK_IMAGE_DESCRIPTION_TEXT = 'Default mock description';
      
      // Mock a turn that doesn't exist in turn-based data (turn 4)
      asMock(useCharacterStore).mockReturnValue({ 
        character: { currentTurn: 4 } 
      });
      
      const { result } = renderHook(() => useImageAnalysis());
      const testFile = new File([''], 'test.png', { type: 'image/png' });

      // Act: Analyze image
      await act(async () => {
        result.current.analyzeImage(testFile);
        if (mockFileReaderInstance.onload) {
          mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
        }
      });
      
      await waitFor(() => {
        expect(result.current.isDescriptionLoading).toBe(false);
      });

      // Assert: Should use default mock description
      expect(result.current.description).toBe('Default mock description');
    });
  });
});
