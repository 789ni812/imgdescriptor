import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FighterImageUpload } from './FighterImageUpload';

// Mock fetch
global.fetch = jest.fn();

describe('FighterImageUpload', () => {
  const mockOnUploadComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default fighter category', () => {
    render(<FighterImageUpload onUploadComplete={mockOnUploadComplete} />);
    expect(screen.getByText('Upload Image')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<FighterImageUpload onUploadComplete={mockOnUploadComplete} label="Custom Label" />);
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('sends fighter category when uploading fighter image', async () => {
    const mockUploadResponse = { ok: true, json: async () => ({ url: '/vs/fighters/test.jpg' }) };
    const mockAnalysisResponse = { ok: true, json: async () => ({ description: 'A fierce warrior' }) };
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockUploadResponse)
      .mockResolvedValueOnce(mockAnalysisResponse);

    render(<FighterImageUpload onUploadComplete={mockOnUploadComplete} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/upload-image', expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      }));
    });

    const formData = (global.fetch as jest.Mock).mock.calls[0][1].body;
    expect(formData.get('category')).toBe('fighter');
  });

  it('sends arena category when uploading arena image', async () => {
    const mockUploadResponse = { ok: true, json: async () => ({ url: '/vs/arena/test.jpg' }) };
    const mockAnalysisResponse = { ok: true, json: async () => ({ description: 'A grand arena' }) };
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockUploadResponse)
      .mockResolvedValueOnce(mockAnalysisResponse);

    render(<FighterImageUpload onUploadComplete={mockOnUploadComplete} category="arena" />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/upload-image', expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      }));
    });

    const formData = (global.fetch as jest.Mock).mock.calls[0][1].body;
    expect(formData.get('category')).toBe('arena');
  });

  it('calls onUploadComplete with correct data for fighter', async () => {
    const mockUploadResponse = { ok: true, json: async () => ({ url: '/vs/fighters/test.jpg' }) };
    const mockAnalysisResponse = { ok: true, json: async () => ({ description: 'A fierce warrior' }) };
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockUploadResponse)
      .mockResolvedValueOnce(mockAnalysisResponse);

    render(<FighterImageUpload onUploadComplete={mockOnUploadComplete} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith({
        url: '/vs/fighters/test.jpg',
        analysis: { description: 'A fierce warrior' },
        file
      });
    });
  });

  it('calls onUploadComplete with correct data for arena', async () => {
    const mockUploadResponse = { ok: true, json: async () => ({ url: '/vs/arena/test.jpg' }) };
    const mockAnalysisResponse = { ok: true, json: async () => ({ description: 'A grand arena' }) };
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockUploadResponse)
      .mockResolvedValueOnce(mockAnalysisResponse);

    render(<FighterImageUpload onUploadComplete={mockOnUploadComplete} category="arena" />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith({
        url: '/vs/arena/test.jpg',
        analysis: { description: 'A grand arena' },
        file
      });
    });
  });
}); 