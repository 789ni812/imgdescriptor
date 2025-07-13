import { POST } from './route';
import { generateFighterStats } from '@/lib/lmstudio-client';

// Mock the LM Studio client
jest.mock('@/lib/lmstudio-client', () => ({
  generateFighterStats: jest.fn(),
}));

// Mock fs promises
jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  readFile: jest.fn(),
}));

// Mock Next.js components
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    json: jest.fn().mockResolvedValue(JSON.parse(init.body))
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data) => ({
      status: 200,
      json: jest.fn().mockResolvedValue(data)
    }))
  }
}));

// Import the mocked NextRequest
const { NextRequest } = require('next/server');

describe('/api/fighting-game/generate-fighter', () => {
  const mockRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/fighting-game/generate-fighter', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate fighter with LLM stats when no existing stats found', async () => {
    const mockLLMStats = {
      success: true,
      stats: {
        strength: 35,
        agility: 65,
        health: 120,
        defense: 25,
        luck: 15,
        age: 28,
        size: 'medium',
        build: 'muscular'
      }
    };

    (generateFighterStats as jest.Mock).mockResolvedValue(mockLLMStats);

    const request = mockRequest({
      imageDescription: 'A muscular martial artist in a fighting stance',
      fighterId: 'test-fighter',
      fighterLabel: 'Bruce Lee',
      imageUrl: '/test-image.jpg'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fighter).toBeDefined();
    expect(data.fighter.name).toBe('Bruce Lee');
    expect(data.fighter.stats.strength).toBe(35);
    expect(data.fighter.stats.agility).toBe(65);
    expect(data.fighter.stats.health).toBe(120);
    expect(data.fighter.stats.defense).toBe(25);
    expect(data.fighter.stats.luck).toBe(15);
    expect(data.fighter.stats.age).toBe(28);
    expect(data.fighter.stats.size).toBe('medium');
    expect(data.fighter.stats.build).toBe('muscular');
    expect(data.fighter.stats.maxHealth).toBe(120);

    expect(generateFighterStats).toHaveBeenCalledWith(
      'a muscular martial artist in a fighting stance',
      'Bruce Lee'
    );
  });

  it('should fall back to score sheet when LLM generation fails', async () => {
    (generateFighterStats as jest.Mock).mockResolvedValue({
      success: false,
      error: 'LLM generation failed'
    });

    const request = mockRequest({
      imageDescription: 'A giant monster destroying a city',
      fighterId: 'test-fighter',
      fighterLabel: 'Godzilla',
      imageUrl: '/test-image.jpg'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fighter).toBeDefined();
    expect(data.fighter.name).toBe('Godzilla');
    expect(data.fighter.stats.strength).toBeGreaterThanOrEqual(150);
    expect(data.fighter.stats.strength).toBeLessThanOrEqual(200);
    expect(data.fighter.stats.health).toBeGreaterThanOrEqual(800);
    expect(data.fighter.stats.health).toBeLessThanOrEqual(1000);
    expect(data.fighter.stats.agility).toBeLessThanOrEqual(20);
    expect(data.fighter.stats.size).toBe('large');
    expect(data.fighter.stats.build).toBe('heavy');
  });

  it('should use existing fighter stats when found', async () => {
    const { readdir, readFile } = require('fs/promises');
    readdir.mockResolvedValue(['bruce-lee.json']);
    readFile.mockResolvedValue(JSON.stringify({
      name: 'Bruce Lee',
      stats: {
        strength: 40,
        agility: 70,
        health: 100,
        defense: 30,
        luck: 20,
        age: 32,
        size: 'medium',
        build: 'muscular'
      }
    }));

    const request = mockRequest({
      imageDescription: 'A martial artist',
      fighterId: 'test-fighter',
      fighterLabel: 'Bruce Lee',
      imageUrl: '/test-image.jpg'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fighter.stats.strength).toBe(40);
    expect(data.fighter.stats.agility).toBe(70);
    expect(data.fighter.stats.health).toBe(100);
    expect(data.fighter.stats.defense).toBe(30);
    expect(data.fighter.stats.luck).toBe(20);
    expect(data.fighter.stats.age).toBe(32);
    expect(data.fighter.stats.size).toBe('medium');
    expect(data.fighter.stats.build).toBe('muscular');

    // Should not call LLM when existing stats are found
    expect(generateFighterStats).not.toHaveBeenCalled();
  });

  it('should handle image description as object', async () => {
    const mockLLMStats = {
      success: true,
      stats: {
        strength: 25,
        agility: 80,
        health: 80,
        defense: 20,
        luck: 12,
        age: 5,
        size: 'small',
        build: 'thin'
      }
    };

    (generateFighterStats as jest.Mock).mockResolvedValue(mockLLMStats);

    const request = mockRequest({
      imageDescription: {
        setting: 'A forest clearing',
        objects: ['acorn', 'leaf'],
        characters: ['squirrel'],
        mood: 'peaceful',
        hooks: ['rustling in the bushes']
      },
      fighterId: 'test-fighter',
      fighterLabel: 'Squirrel',
      imageUrl: '/test-image.jpg'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fighter).toBeDefined();
    expect(data.fighter.name).toBe('Squirrel');
    expect(data.fighter.stats.strength).toBe(25);
    expect(data.fighter.stats.agility).toBe(80);
    expect(data.fighter.stats.size).toBe('small');
    expect(data.fighter.stats.build).toBe('thin');

    // Should convert object description to string for LLM
    expect(generateFighterStats).toHaveBeenCalledWith(
      'a forest clearing acorn leaf squirrel peaceful rustling in the bushes',
      'Squirrel'
    );
  });

  it('should validate stat ranges are within new higher limits', async () => {
    const mockLLMStats = {
      success: true,
      stats: {
        strength: 180, // High strength (Godzilla level)
        agility: 10,   // Low agility (appropriate for strong creature)
        health: 950,   // High health (Godzilla level)
        defense: 85,   // High defense
        luck: 8,       // Low luck
        age: 50000000, // Very old
        size: 'large',
        build: 'heavy'
      }
    };

    (generateFighterStats as jest.Mock).mockResolvedValue(mockLLMStats);

    const request = mockRequest({
      imageDescription: 'A massive kaiju monster',
      fighterId: 'test-fighter',
      fighterLabel: 'Godzilla',
      imageUrl: '/test-image.jpg'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fighter.stats.strength).toBe(180);
    expect(data.fighter.stats.agility).toBe(10);
    expect(data.fighter.stats.health).toBe(950);
    expect(data.fighter.stats.defense).toBe(85);
    expect(data.fighter.stats.luck).toBe(8);
    expect(data.fighter.stats.age).toBe(50000000);
    expect(data.fighter.stats.size).toBe('large');
    expect(data.fighter.stats.build).toBe('heavy');
  });
}); 