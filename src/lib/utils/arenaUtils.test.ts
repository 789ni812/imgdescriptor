import { getRandomArena } from './arenaUtils';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  readFile: jest.fn(),
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn(),
}));

describe('arenaUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getRandomArena should return default arena when no arenas exist', async () => {
    (readdir as jest.Mock).mockResolvedValue([]);
    (join as jest.Mock).mockReturnValue('/test/path');

    const result = await getRandomArena();
    
    expect(result).toEqual({
      id: 'default-tournament-arena',
      name: 'Tournament Arena',
      image: '/vs/arena/battle-arena-1-1752763667035-og3my7.jpg',
      description: 'A dynamic battleground featuring marble throne, broken column, sand-covered ground. This arena provides strategic opportunities for combatants to use the surroundings to their advantage.',
      environmentalObjects: [
        'marble throne',
        'broken column',
        'sand-covered ground'
      ],
      createdAt: expect.any(String)
    });
  });

  test('getRandomArena should return a random arena when arenas exist', async () => {
    (readdir as jest.Mock).mockResolvedValue(['arena1.json', 'arena2.json']);
    (join as jest.Mock).mockReturnValue('/test/path');
    (readFile as jest.Mock).mockResolvedValue(JSON.stringify({
      id: 'test-arena-1',
      name: 'Test Arena',
      description: 'A test arena',
      image: 'test-arena.jpg'
    }));

    const result = await getRandomArena();
    
    expect(result).toEqual({
      id: 'test-arena-1',
      name: 'Test Arena',
      description: 'A test arena',
      image: '/vs/arena/test-arena.jpg'
    });
  });
}); 