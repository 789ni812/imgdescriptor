import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export interface ArenaMetadata {
  id: string;
  name: string;
  image: string;
  description?: string;
  environmentalObjects?: string[];
  createdAt?: string;
}

export interface ArenaListResult {
  success: boolean;
  arenas: ArenaMetadata[];
  error?: string;
}

export async function getArenasList(arenasDir?: string): Promise<ArenaListResult> {
  try {
    // Use provided directory or default to public/vs/arena
    const directory = arenasDir || join(process.cwd(), 'public', 'vs', 'arena');
    // Read directory contents
    const files = await readdir(directory);
    // Filter for JSON files only
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    const arenas: ArenaMetadata[] = [];
    // Read each JSON file and parse arena metadata
    for (const file of jsonFiles) {
      try {
        const filePath = join(directory, file);
        const fileContent = await readFile(filePath, 'utf-8');
        const arenaData = JSON.parse(fileContent) as ArenaMetadata;
        // Validate required fields
        if (arenaData.id && arenaData.name && arenaData.image) {
          arenas.push(arenaData);
        }
      } catch (error) {
        // Skip invalid JSON files
        console.warn(`Failed to parse arena file ${file}:`, error);
        continue;
      }
    }
    return {
      success: true,
      arenas: arenas
    };
  } catch (error) {
    console.error('Failed to read arenas directory:', error);
    return {
      success: false,
      arenas: [],
      error: 'Failed to read arenas directory'
    };
  }
}

/**
 * Get a random arena from the available arenas
 * Falls back to a default arena if no arenas are available
 */
export async function getRandomArena(arenasDir?: string): Promise<ArenaMetadata> {
  try {
    const result = await getArenasList(arenasDir);
    
    if (result.success && result.arenas.length > 0) {
      // Select a random arena
      const randomIndex = Math.floor(Math.random() * result.arenas.length);
      const selectedArena = result.arenas[randomIndex];
      
      // Return the arena with the full image path
      return {
        ...selectedArena,
        image: `/vs/arena/${selectedArena.image}`
      };
    }
  } catch (error) {
    console.error('Failed to get random arena:', error);
  }
  
  // Fallback to default arena if no arenas are available
  return {
    id: 'default-tournament-arena',
    name: 'Tournament Arena',
    image: '/vs/arena/battle-arena-1-1752763667035-og3my7.jpg', // Use the first arena as default
    description: 'A dynamic battleground featuring marble throne, broken column, sand-covered ground. This arena provides strategic opportunities for combatants to use the surroundings to their advantage.',
    environmentalObjects: [
      'marble throne',
      'broken column',
      'sand-covered ground'
    ],
    createdAt: new Date().toISOString()
  };
} 