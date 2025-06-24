import { renderHook, act, waitFor } from '@testing-library/react';
import { useImageAnalysis } from './useImageAnalysis';

// Mock fetch
(global as any).fetch = jest.fn();

// Mock FileReader
const mockFileReaderInstance = {
  readAsDataURL: jest.fn(),
  onload: jest.fn() as ((e: ProgressEvent<FileReader>) => void) | null,
  result: 'data:image/png;base64,test-base64-string',
};
const mockFileReader = jest.fn(() => mockFileReaderInstance);
(global as any).FileReader = mockFileReader;

describe('useImageAnalysis', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockFileReader.mockClear();
    (mockFileReaderInstance.readAsDataURL as jest.Mock).mockClear();
    mockFileReaderInstance.onload = jest.fn();
  });

  it('should return initial state correctly', () => {
    const mockConfig = {
      MOCK_IMAGE_DESCRIPTION: false,
      MOCK_IMAGE_DESCRIPTION_TEXT: 'Mock description',
      TURN_BASED_MOCK_DATA: {
        imageDescriptions: {
          1: 'Turn 1: A beautiful forest with ancient trees.',
          2: 'Turn 2: A hidden cave entrance with mysterious symbols.',
          3: 'Turn 3: A crystal chamber filled with magical energy.'
        }
      }
    };
    const mockStore = { character: { currentTurn: 1 } };

    const { result } = renderHook(() => useImageAnalysis(mockConfig, mockStore));

    expect(result.current.description).toBeNull();
    expect(result.current.isDescriptionLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.analyzeImage).toBe('function');
  });

  it('should handle successful image analysis with default prompt', async () => {
    const mockConfig = {
      MOCK_IMAGE_DESCRIPTION: false,
      MOCK_IMAGE_DESCRIPTION_TEXT: 'Mock description',
      TURN_BASED_MOCK_DATA: {
        imageDescriptions: {
          1: 'Turn 1: A beautiful forest with ancient trees.',
          2: 'Turn 2: A hidden cave entrance with mysterious symbols.',
          3: 'Turn 3: A crystal chamber filled with magical energy.'
        }
      }
    };
    const mockStore = { character: { currentTurn: 1 } };

    const mockResponse = { success: true, description: 'A beautiful landscape' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useImageAnalysis(mockConfig, mockStore));
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.analyzeImage(file);
    });

    expect(result.current.isDescriptionLoading).toBe(true);

    // Trigger the FileReader onload event
    act(() => {
      if (mockFileReaderInstance.onload) {
        mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
      }
    });

    await waitFor(() => {
      expect(result.current.isDescriptionLoading).toBe(false);
    });

    expect(result.current.description).toBe('A beautiful landscape');
    expect(result.current.error).toBeNull();
  });

  it('should handle successful image analysis with custom prompt', async () => {
    const mockConfig = {
      MOCK_IMAGE_DESCRIPTION: false,
      MOCK_IMAGE_DESCRIPTION_TEXT: 'Mock description',
      TURN_BASED_MOCK_DATA: {
        imageDescriptions: {
          1: 'Turn 1: A beautiful forest with ancient trees.',
          2: 'Turn 2: A hidden cave entrance with mysterious symbols.',
          3: 'Turn 3: A crystal chamber filled with magical energy.'
        }
      }
    };
    const mockStore = { character: { currentTurn: 1 } };

    const mockResponse = { success: true, description: 'A custom description' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useImageAnalysis(mockConfig, mockStore));
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.analyzeImage(file, 'Describe this image in a fantasy style');
    });

    // Trigger the FileReader onload event
    act(() => {
      if (mockFileReaderInstance.onload) {
        mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
      }
    });

    await waitFor(() => {
      expect(result.current.isDescriptionLoading).toBe(false);
    });

    expect(result.current.description).toBe('A custom description');
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors during image analysis', async () => {
    const mockConfig = {
      MOCK_IMAGE_DESCRIPTION: false,
      MOCK_IMAGE_DESCRIPTION_TEXT: 'Mock description',
      TURN_BASED_MOCK_DATA: {
        imageDescriptions: {
          1: 'Turn 1: A beautiful forest with ancient trees.',
          2: 'Turn 2: A hidden cave entrance with mysterious symbols.',
          3: 'Turn 3: A crystal chamber filled with magical energy.'
        }
      }
    };
    const mockStore = { character: { currentTurn: 1 } };

    const mockResponse = { success: false, error: 'API Error' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useImageAnalysis(mockConfig, mockStore));
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.analyzeImage(file);
    });

    // Trigger the FileReader onload event
    act(() => {
      if (mockFileReaderInstance.onload) {
        mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
      }
    });

    await waitFor(() => {
      expect(result.current.isDescriptionLoading).toBe(false);
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.description).toBeNull();
  });

  it('should handle network errors during image analysis', async () => {
    const mockConfig = {
      MOCK_IMAGE_DESCRIPTION: false,
      MOCK_IMAGE_DESCRIPTION_TEXT: 'Mock description',
      TURN_BASED_MOCK_DATA: {
        imageDescriptions: {
          1: 'Turn 1: A beautiful forest with ancient trees.',
          2: 'Turn 2: A hidden cave entrance with mysterious symbols.',
          3: 'Turn 3: A crystal chamber filled with magical energy.'
        }
      }
    };
    const mockStore = { character: { currentTurn: 1 } };

    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useImageAnalysis(mockConfig, mockStore));
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.analyzeImage(file);
    });

    // Trigger the FileReader onload event
    act(() => {
      if (mockFileReaderInstance.onload) {
        mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
      }
    });

    await waitFor(() => {
      expect(result.current.isDescriptionLoading).toBe(false);
    });

    expect(result.current.error).toContain('Network error');
    expect(result.current.description).toBeNull();
  });

  it('should use default prompt when no custom prompt is provided', async () => {
    const mockConfig = {
      MOCK_IMAGE_DESCRIPTION: false,
      MOCK_IMAGE_DESCRIPTION_TEXT: 'Mock description',
      TURN_BASED_MOCK_DATA: {
        imageDescriptions: {
          1: 'Turn 1: A beautiful forest with ancient trees.',
          2: 'Turn 2: A hidden cave entrance with mysterious symbols.',
          3: 'Turn 3: A crystal chamber filled with magical energy.'
        }
      }
    };
    const mockStore = { character: { currentTurn: 1 } };

    const mockResponse = { success: true, description: 'Default description' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useImageAnalysis(mockConfig, mockStore));
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.analyzeImage(file);
    });

    // Trigger the FileReader onload event
    act(() => {
      if (mockFileReaderInstance.onload) {
        mockFileReaderInstance.onload({} as ProgressEvent<FileReader>);
      }
    });

    await waitFor(() => {
      expect(result.current.isDescriptionLoading).toBe(false);
    });

    expect(result.current.description).toBe('Default description');
  });

  describe('turn-based mock data selection', () => {
    it('should return different mock descriptions based on current turn when mock mode is enabled', async () => {
      const mockConfig = {
        MOCK_IMAGE_DESCRIPTION: true,
        MOCK_IMAGE_DESCRIPTION_TEXT: 'Default mock description',
        TURN_BASED_MOCK_DATA: {
          imageDescriptions: {
            1: 'Turn 1: A beautiful forest with ancient trees.',
            2: 'Turn 2: A hidden cave entrance with mysterious symbols.',
            3: 'Turn 3: A crystal chamber filled with magical energy.'
          }
        }
      };

      // Test turn 1
      const mockStore1 = { character: { currentTurn: 1 } };
      const { result: result1 } = renderHook(() => useImageAnalysis(mockConfig, mockStore1));
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      act(() => {
        result1.current.analyzeImage(file);
      });

      await waitFor(() => {
        expect(result1.current.isDescriptionLoading).toBe(false);
      });

      expect(result1.current.description).toBe('Turn 1: A beautiful forest with ancient trees.');

      // Test turn 2
      const mockStore2 = { character: { currentTurn: 2 } };
      const { result: result2 } = renderHook(() => useImageAnalysis(mockConfig, mockStore2));

      act(() => {
        result2.current.analyzeImage(file);
      });

      await waitFor(() => {
        expect(result2.current.isDescriptionLoading).toBe(false);
      });

      expect(result2.current.description).toBe('Turn 2: A hidden cave entrance with mysterious symbols.');
    });

    it('should fallback to default mock description when turn-based data is not available', async () => {
      const mockConfig = {
        MOCK_IMAGE_DESCRIPTION: true,
        MOCK_IMAGE_DESCRIPTION_TEXT: 'Default mock description',
        TURN_BASED_MOCK_DATA: {
          imageDescriptions: {
            1: 'Turn 1: A beautiful forest with ancient trees.',
            2: 'Turn 2: A hidden cave entrance with mysterious symbols.',
            3: 'Turn 3: A crystal chamber filled with magical energy.'
          }
        }
      };
      // Mock a turn that doesn't exist in turn-based data (turn 4)
      const mockStore = { character: { currentTurn: 4 } };

      const { result } = renderHook(() => useImageAnalysis(mockConfig, mockStore));
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      act(() => {
        result.current.analyzeImage(file);
      });

      await waitFor(() => {
        expect(result.current.isDescriptionLoading).toBe(false);
      });

      expect(result.current.description).toBe('Default mock description');
    });
  });
});
