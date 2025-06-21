import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './page';

// Mock all child components
jest.mock('@/components/ImageUpload', () => ({
  __esModule: true,
  ImageUpload: ({ onImageSelect }: { onImageSelect: (file: File) => void }) => (
    <div data-testid="image-upload">
      <button onClick={() => {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        onImageSelect(file);
      }}>
        Upload Image
      </button>
    </div>
  ),
}));

jest.mock('@/components/ImagePreview', () => ({
  __esModule: true,
  ImagePreview: ({ imageUrl, isLoading }: { imageUrl: string | null; isLoading: boolean }) => (
    <div data-testid="image-preview">
      {imageUrl ? 'Image Preview' : 'No Image'}
      {isLoading && 'Loading...'}
    </div>
  ),
}));

jest.mock('@/components/DescriptionDisplay', () => ({
  __esModule: true,
  DescriptionDisplay: ({ description, isLoading, error }: { 
    description: string | null; 
    isLoading: boolean; 
    error: string | null; 
  }) => (
    <div data-testid="description-display">
      {isLoading && 'Loading Description...'}
      {error && `Error: ${error}`}
      {description && `Description: ${description}`}
    </div>
  ),
}));

jest.mock('@/components/StoryDisplay', () => ({
  __esModule: true,
  StoryDisplay: ({ story, isLoading, error }: { 
    story: string | null; 
    isLoading: boolean; 
    error: string | null; 
  }) => (
    <div data-testid="story-display">
      {isLoading && 'Loading Story...'}
      {error && `Story Error: ${error}`}
      {story && `Story: ${story}`}
    </div>
  ),
}));

jest.mock('@/components/ui/Button', () => ({
  __esModule: true,
  Button: ({ children, onClick, disabled }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean; 
  }) => (
    <button data-testid="generate-story-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock FileReader
const mockFileReader = {
  readAsDataURL: jest.fn(),
  result: 'data:image/jpeg;base64,dGVzdA==', // base64 encoded "test"
  onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
  onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
  error: null,
  onabort: null,
  onloadend: null,
  onloadstart: null,
  readyState: 0,
  DONE: 2,
  EMPTY: 0,
  LOADING: 1,
  abort: jest.fn(),
  readAsArrayBuffer: jest.fn(),
  readAsBinaryString: jest.fn(),
  readAsText: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
} as unknown as FileReader;

global.FileReader = jest.fn(() => mockFileReader) as any;

// Helper for fetch mock
function mockFetchResponse(data: any, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  } as Response);
}

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockFileReader.onload = null;
    mockFileReader.onerror = null;
  });

  it('should render the main page with title and description', () => {
    render(<Home />);
    
    expect(screen.getByText('AI Image Describer')).toBeInTheDocument();
    expect(screen.getByText('Upload an image and let our AI describe it for you.')).toBeInTheDocument();
  });

  it('should render all main components', () => {
    render(<Home />);
    
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    expect(screen.getByTestId('image-preview')).toBeInTheDocument();
    expect(screen.getByTestId('description-display')).toBeInTheDocument();
  });

  it('should handle image upload and show preview', async () => {
    render(<Home />);
    
    const uploadButton = screen.getByText('Upload Image');
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText('Image Preview')).toBeInTheDocument();
    });
  });

  it('should show loading state during image analysis', async () => {
    mockFetch.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, description: 'Test description' })
      } as Response), 100))
    );

    render(<Home />);
    
    const uploadButton = screen.getByText('Upload Image');
    fireEvent.click(uploadButton);
    
    // Trigger FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload.call(mockFileReader, {} as ProgressEvent<FileReader>);
    }
    
    await waitFor(() => {
      expect(screen.getByText('Loading Description...')).toBeInTheDocument();
    });
  });

  it('should display description after successful analysis', async () => {
    mockFetch.mockImplementationOnce(() => mockFetchResponse({ success: true, description: 'A beautiful landscape' }));

    render(<Home />);
    
    const uploadButton = screen.getByText('Upload Image');
    fireEvent.click(uploadButton);
    
    // Trigger FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload.call(mockFileReader, {} as ProgressEvent<FileReader>);
    }
    
    await waitFor(() => {
      expect(screen.getByText('Description: A beautiful landscape')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show error when image analysis fails', async () => {
    mockFetch.mockImplementationOnce(() => mockFetchResponse({ success: false, error: 'Analysis failed' }, false));

    render(<Home />);
    
    const uploadButton = screen.getByText('Upload Image');
    fireEvent.click(uploadButton);
    
    // Trigger FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload.call(mockFileReader, {} as ProgressEvent<FileReader>);
    }
    
    await waitFor(() => {
      expect(screen.getByText('Error: Analysis failed')).toBeInTheDocument();
    });
  });

  it('should show generate story button when description is available', async () => {
    mockFetch.mockImplementationOnce(() => mockFetchResponse({ success: true, description: 'A beautiful landscape' }));

    render(<Home />);
    
    const uploadButton = screen.getByText('Upload Image');
    fireEvent.click(uploadButton);
    
    // Trigger FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload.call(mockFileReader, {} as ProgressEvent<FileReader>);
    }
    
    await waitFor(() => {
      expect(screen.getByTestId('generate-story-button')).toBeInTheDocument();
      expect(screen.getByText('Generate a Story')).toBeInTheDocument();
    });
  });

  it('should handle story generation', async () => {
    // Mock successful image analysis
    mockFetch.mockImplementationOnce(() => mockFetchResponse({ success: true, description: 'A beautiful landscape' }));
    // Mock successful story generation
    mockFetch.mockImplementationOnce(() => mockFetchResponse({ success: true, story: 'Once upon a time...' }));

    render(<Home />);
    
    const uploadButton = screen.getByText('Upload Image');
    fireEvent.click(uploadButton);
    
    // Trigger FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload.call(mockFileReader, {} as ProgressEvent<FileReader>);
    }
    
    await waitFor(() => {
      expect(screen.getByTestId('generate-story-button')).toBeInTheDocument();
    });

    const generateStoryButton = screen.getByTestId('generate-story-button');
    fireEvent.click(generateStoryButton);
    
    await waitFor(() => {
      expect(screen.getByText('Story: Once upon a time...')).toBeInTheDocument();
    });
  });

  it('should show loading state during story generation', async () => {
    // Mock successful image analysis
    mockFetch.mockImplementationOnce(() => mockFetchResponse({ success: true, description: 'A beautiful landscape' }));
    // Mock delayed story generation
    mockFetch.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, story: 'Once upon a time...' })
      } as Response), 100))
    );

    render(<Home />);
    
    const uploadButton = screen.getByText('Upload Image');
    fireEvent.click(uploadButton);
    
    // Trigger FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload.call(mockFileReader, {} as ProgressEvent<FileReader>);
    }
    
    await waitFor(() => {
      expect(screen.getByTestId('generate-story-button')).toBeInTheDocument();
    });

    const generateStoryButton = screen.getByTestId('generate-story-button');
    fireEvent.click(generateStoryButton);
    
    await waitFor(() => {
      expect(screen.getByText('Loading Story...')).toBeInTheDocument();
    });
  });

  it('should show error when story generation fails', async () => {
    // Mock successful image analysis
    mockFetch.mockImplementationOnce(() => mockFetchResponse({ success: true, description: 'A beautiful landscape' }));
    // Mock failed story generation
    mockFetch.mockImplementationOnce(() => mockFetchResponse({ success: false, error: 'Story generation failed' }, false));

    render(<Home />);
    
    const uploadButton = screen.getByText('Upload Image');
    fireEvent.click(uploadButton);
    
    // Trigger FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload.call(mockFileReader, {} as ProgressEvent<FileReader>);
    }
    
    await waitFor(() => {
      expect(screen.getByTestId('generate-story-button')).toBeInTheDocument();
    });

    const generateStoryButton = screen.getByTestId('generate-story-button');
    fireEvent.click(generateStoryButton);
    
    await waitFor(() => {
      expect(screen.getByText('Story Error: Story generation failed')).toBeInTheDocument();
    });
  });
}); 