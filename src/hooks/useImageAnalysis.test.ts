import { renderHook, act } from '@testing-library/react';
import { useImageAnalysis } from './useImageAnalysis';

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


describe('useImageAnalysis', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockFileReader.mockClear();
    (mockFileReaderInstance.readAsDataURL as jest.Mock).mockClear();
    mockFileReaderInstance.onload = jest.fn();
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useImageAnalysis());
    expect(result.current.description).toBeNull();
    expect(result.current.isDescriptionLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful image analysis', async () => {
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
    
    expect(result.current.isDescriptionLoading).toBe(false);
    expect(result.current.description).toBe(mockDescription);
    expect(result.current.error).toBeNull();
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

    expect(result.current.isDescriptionLoading).toBe(false);
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

    expect(result.current.isDescriptionLoading).toBe(false);
    expect(result.current.description).toBeNull();
    expect(result.current.error).toContain('An unexpected error occurred: Network failure');
  });
});
