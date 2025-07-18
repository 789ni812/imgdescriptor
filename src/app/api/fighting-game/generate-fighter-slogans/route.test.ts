import { POST } from './route';

// Mock the lmstudio-client module
jest.mock('@/lib/lmstudio-client', () => ({
  generateFighterSlogans: jest.fn()
}));

// Import the mocked function
import { generateFighterSlogans } from '@/lib/lmstudio-client';

// Type assertion for the mocked function
const mockedGenerateFighterSlogans = generateFighterSlogans as jest.MockedFunction<typeof generateFighterSlogans>;

// Mock NextRequest and NextResponse
const mockRequest = (body: any) => ({
  json: jest.fn().mockResolvedValue(body)
});

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
};

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      status: options?.status || 200,
      json: jest.fn().mockResolvedValue(data)
    }))
  }
}));

describe('/api/fighting-game/generate-fighter-slogans', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate slogans successfully with LLM', async () => {
    const mockSlogans = ['The Unstoppable Force', 'Champion of Champions', 'Legend in the Making'];
    const mockDescription = 'A legendary warrior with unmatched skill';
    
    mockedGenerateFighterSlogans.mockResolvedValue({
      success: true,
      slogans: mockSlogans,
      description: mockDescription
    });

    const requestBody = {
      fighterName: 'Test Fighter',
      fighterStats: {
        strength: 150,
        agility: 75,
        health: 800,
        defense: 60,
        intelligence: 70,
        uniqueAbilities: ['Heavy Strike', 'Ground Slam']
      },
      visualAnalysis: {
        age: '35',
        size: 'large',
        build: 'muscular',
        appearance: ['tall', 'imposing'],
        weapons: ['sword'],
        armor: ['plate']
      },
      imageDescription: 'A mighty warrior in battle armor'
    };

    const request = mockRequest(requestBody);
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.slogans).toEqual(mockSlogans);
    expect(data.description).toBe(mockDescription);
    expect(mockedGenerateFighterSlogans).toHaveBeenCalledWith(
      'Test Fighter',
      requestBody.fighterStats,
      requestBody.visualAnalysis,
      'A mighty warrior in battle armor'
    );
  });

  it('should return fallback slogans when LLM generation fails', async () => {
    mockedGenerateFighterSlogans.mockResolvedValue({
      success: false,
      error: 'LLM API error'
    });

    const requestBody = {
      fighterName: 'Test Fighter',
      fighterStats: {
        strength: 150,
        agility: 75,
        health: 800,
        defense: 60,
        intelligence: 70,
        uniqueAbilities: ['Heavy Strike', 'Ground Slam']
      },
      visualAnalysis: {
        age: '35',
        size: 'large',
        build: 'muscular',
        appearance: ['tall', 'imposing'],
        weapons: ['sword'],
        armor: ['plate']
      },
      imageDescription: 'A mighty warrior in battle armor'
    };

    const request = mockRequest(requestBody);
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.slogans).toEqual([
      'The Test Fighter',
      'Ready for battle!',
      'Champion material!'
    ]);
    expect(data.description).toBe('A mighty warrior in battle armor');
  });

  it('should return 400 error when required fields are missing', async () => {
    const requestBody = {
      fighterName: 'Test Fighter',
      // Missing fighterStats, visualAnalysis, imageDescription
    };

    const request = mockRequest(requestBody);
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required fields');
    expect(mockedGenerateFighterSlogans).not.toHaveBeenCalled();
  });

  it('should handle undefined fighterStats gracefully', async () => {
    const requestBody = {
      fighterName: 'Test Fighter',
      fighterStats: undefined,
      visualAnalysis: {
        age: '35',
        size: 'large',
        build: 'muscular',
        appearance: ['tall', 'imposing'],
        weapons: ['sword'],
        armor: ['plate']
      },
      imageDescription: 'A mighty warrior in battle armor'
    };

    const request = mockRequest(requestBody);
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required fields');
  });
}); 