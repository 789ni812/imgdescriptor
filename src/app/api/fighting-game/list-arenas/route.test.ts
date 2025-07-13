import { getArenasList } from '@/lib/utils/arenaUtils';
import { readdir, readFile } from 'fs/promises';

// Mock fs/promises
jest.mock('fs/promises');
const mockReaddir = readdir as jest.MockedFunction<typeof readdir>;
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

// Mock path
jest.mock('path');

describe('getArenasList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return list of arenas with metadata', async () => {
    mockReaddir.mockResolvedValue([
      'castle.json',
      'dojo.json',
      'arena.json'
    ] as any);
    mockReadFile
      .mockResolvedValueOnce(Buffer.from(JSON.stringify({
        id: 'castle-1',
        name: 'Castle',
        image: 'castle.jpg',
        description: 'A grand medieval castle.',
        environmentalObjects: ['throne', 'torch'],
        createdAt: '2025-01-27T00:00:00Z'
      })))
      .mockResolvedValueOnce(Buffer.from(JSON.stringify({
        id: 'dojo-1',
        name: 'Dojo',
        image: 'dojo.jpg',
        description: 'A serene martial arts dojo.',
        environmentalObjects: ['mat', 'banner'],
        createdAt: '2025-01-27T00:00:00Z'
      })))
      .mockResolvedValueOnce(Buffer.from(JSON.stringify({
        id: 'arena-1',
        name: 'Arena',
        image: 'arena.jpg',
        description: 'A classic gladiator arena.',
        environmentalObjects: ['sand', 'gate'],
        createdAt: '2025-01-27T00:00:00Z'
      })));

    const result = await getArenasList('/mock/path/public/vs/arena');

    expect(result.success).toBe(true);
    expect(result.arenas).toHaveLength(3);
    expect(result.arenas[0]).toEqual({
      id: 'castle-1',
      name: 'Castle',
      image: 'castle.jpg',
      description: 'A grand medieval castle.',
      environmentalObjects: ['throne', 'torch'],
      createdAt: '2025-01-27T00:00:00Z'
    });
  });

  it('should handle empty arenas directory', async () => {
    mockReaddir.mockResolvedValue([] as any);
    const result = await getArenasList('/mock/path/public/vs/arena');

    expect(result.success).toBe(true);
    expect(result.arenas).toEqual([]);
  });

  it('should handle invalid JSON files gracefully', async () => {
    mockReaddir.mockResolvedValue(['invalid.json'] as any);
    mockReadFile.mockRejectedValue(new Error('Invalid JSON'));

    const result = await getArenasList('/mock/path/public/vs/arena');

    expect(result.success).toBe(true);
    expect(result.arenas).toEqual([]);
  });

  it('should handle directory read errors', async () => {
    mockReaddir.mockRejectedValue(new Error('Directory not found'));

    const result = await getArenasList('/mock/path/public/vs/arena');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to read arenas directory');
  });

  it('should filter out non-JSON files', async () => {
    mockReaddir.mockResolvedValue([
      'arena1.json',
      'arena2.jpg',
      'arena3.json',
      'README.md'
    ] as any);
    mockReadFile
      .mockResolvedValueOnce(Buffer.from(JSON.stringify({
        id: 'arena1',
        name: 'Arena 1',
        image: 'arena1.jpg',
        description: 'Arena 1 desc',
        environmentalObjects: [],
        createdAt: '2025-01-27T00:00:00Z'
      })))
      .mockResolvedValueOnce(Buffer.from(JSON.stringify({
        id: 'arena3',
        name: 'Arena 3',
        image: 'arena3.jpg',
        description: 'Arena 3 desc',
        environmentalObjects: [],
        createdAt: '2025-01-27T00:00:00Z'
      })));

    const result = await getArenasList('/mock/path/public/vs/arena');

    expect(result.success).toBe(true);
    expect(result.arenas).toHaveLength(2);
    expect(result.arenas[0].name).toBe('Arena 1');
    expect(result.arenas[1].name).toBe('Arena 3');
  });
}); 