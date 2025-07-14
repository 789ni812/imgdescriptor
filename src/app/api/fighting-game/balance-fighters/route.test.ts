// Polyfill global Request and Response for Jest (Node <18)
if (typeof global.Request === 'undefined') {
  global.Request = require('node-fetch').Request;
}
if (typeof global.Response === 'undefined') {
  global.Response = require('node-fetch').Response;
}
// Mock Next.js environment before importing the route
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    method: string;
    url: string;
    cookies: Record<string, unknown>;
    nextUrl: { searchParams: Map<string, string> };
    page: Record<string, unknown>;
    ua: Record<string, unknown>;
    
    constructor(url: string, init?: { method?: string }) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.cookies = {};
      this.nextUrl = { searchParams: new Map() };
      this.page = {};
      this.ua = {};
    }
  },
  NextResponse: {
    json: (data: unknown, options?: { status?: number }) => ({
      json: async () => data,
      status: options?.status || 200
    })
  }
}));

import { POST } from './route';
import { readdir, readFile, writeFile } from 'fs/promises';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));

const mockReaddir = readdir as jest.MockedFunction<typeof readdir>;
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;
const mockWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;

describe('/api/fighting-game/balance-fighters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should balance fighters and classify them correctly', async () => {
    // Mock fighter files
    const mockFighterFiles = [
      'Darth-1-1752482862387-wpz9lb.json',
      'Stephen-Siegal-1752483028216-92m45n.json'
    ];

    const mockDarthVaderData = {
      id: "Darth-1-1752482862387-wpz9lb",
      name: "Darth Vader",
      image: "Darth-1-1752482862387-wpz9lb.jpg",
      stats: {
        health: 96,
        maxHealth: 96,
        strength: 36,
        luck: 24,
        agility: 65,
        defense: 19,
        age: 18,
        size: "medium",
        build: "average"
      },
      matchHistory: []
    };

    const mockStephenData = {
      id: "Stephen-Siegal-1752483028216-92m45n",
      name: "Victor Martel",
      image: "Stephen-Siegal-1752483028216-92m45n.jpg",
      stats: {
        health: 120,
        maxHealth: 120,
        strength: 45,
        luck: 18,
        agility: 60,
        defense: 30,
        age: 35,
        size: "medium",
        build: "muscular"
      },
      matchHistory: []
    };

    // Setup mocks
    mockReaddir.mockResolvedValue(mockFighterFiles as any);
    mockReadFile
      .mockResolvedValueOnce(JSON.stringify(mockDarthVaderData))
      .mockResolvedValueOnce(JSON.stringify(mockStephenData));
    mockWriteFile.mockResolvedValue(undefined);

    // Create request
    const request = new (jest.requireActual('next/server').NextRequest)(
      'http://localhost:3000/api/fighting-game/balance-fighters',
      { method: 'POST' }
    ) as any;

    // Call the API
    const response = await POST(request);
    const result = await response.json();

    // Verify response
    expect(result.success).toBe(true);
    expect(result.message).toContain('Balanced 2 fighters');
    expect(result.results).toHaveLength(2);

    // Verify Darth Vader was classified as Sith Lord
    const darthResult = result.results.find((r: any) => r.name === 'Darth Vader');
    expect(darthResult.type).toBe('Sith Lord');
    expect(darthResult.newStats.health).toBeGreaterThanOrEqual(150);
    expect(darthResult.newStats.health).toBeLessThanOrEqual(200);
    expect(darthResult.newStats.strength).toBeGreaterThanOrEqual(50);
    expect(darthResult.newStats.strength).toBeLessThanOrEqual(70);
    expect(darthResult.newStats.magic).toBeGreaterThanOrEqual(70);
    expect(darthResult.newStats.magic).toBeLessThanOrEqual(90);
    expect(darthResult.newStats.uniqueAbilities).toContain('Force Lightning');
    expect(darthResult.newStats.uniqueAbilities).toContain('Lightsaber Mastery');

    // Verify Stephen was classified as Peak Human
    const stephenResult = result.results.find((r: any) => r.name === 'Victor Martel');
    expect(stephenResult.type).toBe('Peak Human');
    expect(stephenResult.newStats.health).toBeGreaterThanOrEqual(100);
    expect(stephenResult.newStats.health).toBeLessThanOrEqual(150);
    expect(stephenResult.newStats.strength).toBeGreaterThanOrEqual(35);
    expect(stephenResult.newStats.strength).toBeLessThanOrEqual(50);
    expect(stephenResult.newStats.uniqueAbilities).toContain('Martial Arts');

    // Verify files were written
    expect(mockWriteFile).toHaveBeenCalledTimes(2);
  });

  it('should handle errors gracefully', async () => {
    // Mock error
    mockReaddir.mockRejectedValue(new Error('Directory not found'));

    const request = new (jest.requireActual('next/server').NextRequest)(
      'http://localhost:3000/api/fighting-game/balance-fighters',
      { method: 'POST' }
    ) as any;

    const response = await POST(request);
    const result = await response.json();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Directory not found');
    expect(response.status).toBe(500);
  });

  it('should skip non-JSON files', async () => {
    const mockFighterFiles = [
      'Darth-1-1752482862387-wpz9lb.json',
      'some-image.jpg', // Non-JSON file
      'Stephen-Siegal-1752483028216-92m45n.json'
    ];

    const mockDarthVaderData = {
      id: "Darth-1-1752482862387-wpz9lb",
      name: "Darth Vader",
      image: "Darth-1-1752482862387-wpz9lb.jpg",
      stats: {
        health: 96,
        maxHealth: 96,
        strength: 36,
        luck: 24,
        agility: 65,
        defense: 19,
        age: 18,
        size: "medium",
        build: "average"
      },
      matchHistory: []
    };

    const mockStephenData = {
      id: "Stephen-Siegal-1752483028216-92m45n",
      name: "Victor Martel",
      image: "Stephen-Siegal-1752483028216-92m45n.jpg",
      stats: {
        health: 120,
        maxHealth: 120,
        strength: 45,
        luck: 18,
        agility: 60,
        defense: 30,
        age: 35,
        size: "medium",
        build: "muscular"
      },
      matchHistory: []
    };

    mockReaddir.mockResolvedValue(mockFighterFiles as any);
    mockReadFile
      .mockResolvedValueOnce(JSON.stringify(mockDarthVaderData))
      .mockResolvedValueOnce(JSON.stringify(mockStephenData));
    mockWriteFile.mockResolvedValue(undefined);

    const request = new (jest.requireActual('next/server').NextRequest)(
      'http://localhost:3000/api/fighting-game/balance-fighters',
      { method: 'POST' }
    ) as any;

    const response = await POST(request);
    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.message).toBe('Balanced 2 fighters'); // Only JSON files processed
    expect(result.results).toHaveLength(2);
  });
}); 