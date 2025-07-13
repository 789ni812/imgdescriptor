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