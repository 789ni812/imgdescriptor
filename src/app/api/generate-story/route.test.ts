/**
 * @jest-environment node
 */
// Polyfill TextEncoder/TextDecoder for undici and web APIs
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

import { POST } from './route';
import { generateStory } from '@/lib/lmstudio-client';

// Mock the LM Studio client
jest.mock('@/lib/lmstudio-client', () => ({
  generateStory: jest.fn(),
}));

const mockGenerateStory = generateStory as jest.MockedFunction<typeof generateStory>;

describe('/api/generate-story', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when description is missing', async () => {
    const request = new Request('http://localhost:3000/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Description is required.');
  });

  it('should return 400 when description is empty string', async () => {
    const request = new Request('http://localhost:3000/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: '' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Description is required.');
  });

  it('should return 400 when description is null', async () => {
    const request = new Request('http://localhost:3000/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: null }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Description is required.');
  });

  it('should return 500 when generateStory fails', async () => {
    mockGenerateStory.mockResolvedValue({
      success: false,
      error: 'LM Studio connection failed',
    });

    const request = new Request('http://localhost:3000/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'A beautiful landscape' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('LM Studio connection failed');
    expect(mockGenerateStory).toHaveBeenCalledWith('A beautiful landscape');
  });

  it('should return 200 with story when generation succeeds', async () => {
    const mockStory = 'Once upon a time, there was a beautiful landscape...';
    mockGenerateStory.mockResolvedValue({
      success: true,
      story: mockStory,
    });

    const request = new Request('http://localhost:3000/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'A beautiful landscape' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.story).toBe(mockStory);
    expect(mockGenerateStory).toHaveBeenCalledWith('A beautiful landscape');
  });

  it('should handle JSON parsing errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const request = new Request('http://localhost:3000/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Server error:');
    consoleSpy.mockRestore();
  });

  it('should handle unexpected errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGenerateStory.mockRejectedValue(new Error('Unexpected error'));

    const request = new Request('http://localhost:3000/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'A beautiful landscape' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Server error: Unexpected error');
    consoleSpy.mockRestore();
  });

  it('should handle non-Error exceptions', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGenerateStory.mockRejectedValue('String error');

    const request = new Request('http://localhost:3000/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'A beautiful landscape' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Server error: An unknown error occurred.');
    consoleSpy.mockRestore();
  });

  it('should handle long descriptions', async () => {
    const longDescription = 'A'.repeat(1000);
    const mockStory = 'Generated story for long description';
    mockGenerateStory.mockResolvedValue({
      success: true,
      story: mockStory,
    });

    const request = new Request('http://localhost:3000/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: longDescription }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.story).toBe(mockStory);
    expect(mockGenerateStory).toHaveBeenCalledWith(longDescription);
  });
}); 