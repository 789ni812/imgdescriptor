import { NextRequest, NextResponse } from 'next/server';
import { FighterVote } from '@/lib/types/voting';
import { loadVotingStore, saveVotingStore } from '@/lib/stores/fileVotingStore';

export async function POST(request: NextRequest) {
  try {
    const votingStore = await loadVotingStore();
    const body = await request.json();
    const { fighterCount = 2, title, description, fighters, startTime, endTime } = body;

    // If we have the full session data, use it
    if (title && description && fighters && startTime && endTime) {
      // Validate fighters array
      if (!Array.isArray(fighters) || fighters.length < 2) {
        return NextResponse.json(
          { success: false, error: 'At least 2 fighters are required' },
          { status: 400 }
        );
      }

      // Generate session ID
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Initialize the voting session
      votingStore.initSession({
        id: sessionId,
        title,
        description,
        fighters: fighters as FighterVote[],
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      });
      await saveVotingStore(votingStore);

      const session = votingStore.getSession();
      
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Failed to create session' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, sessionId: session.id, fighters: session.rounds[0].fighters },
        { status: 201 }
      );
    }

    // If we only have fighterCount, create a simple session with real fighters
    if (fighterCount) {
      // Generate session ID
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Load real fighters from the fighters directory
      const { readdir, readFile } = await import('fs/promises');
      const { join } = await import('path');
      
      const fightersDir = join(process.cwd(), 'public', 'vs', 'fighters');
      const files = await readdir(fightersDir);
      const jsonFiles = files.filter(f => f.endsWith('.json') && !f.includes('test-fighter'));
      
      // Randomly select 6 fighters for multiple rounds (3 rounds of 2 fighters each)
      const selectedFiles = jsonFiles.sort(() => 0.5 - Math.random()).slice(0, 6);
      
      const realFighters: FighterVote[] = [];
      
      for (const filename of selectedFiles) {
        try {
          const filePath = join(fightersDir, filename);
          const content = await readFile(filePath, 'utf-8');
          const fighterData = JSON.parse(content);
          
          // Get the corresponding image file
          const imageFile = filename.replace('.json', '.jpg');
          const imagePath = join(fightersDir, imageFile);
          
          // Check if image exists, otherwise use webp or other extensions
          let imageUrl = `/vs/fighters/${imageFile}`;
          if (!files.includes(imageFile)) {
            const webpFile = filename.replace('.json', '.webp');
            if (files.includes(webpFile)) {
              imageUrl = `/vs/fighters/${webpFile}`;
            } else {
              // Use logo as fallback
              imageUrl = '/logo-echoForge.png';
            }
          }
          
          const fighterId = fighterData.id || filename.replace('.json', '');
          console.log(`Loading fighter from ${filename}:`, { 
            fighterId, 
            name: fighterData.name, 
            hasId: !!fighterData.id,
            fighterDataKeys: Object.keys(fighterData)
          });
          
          realFighters.push({
            fighterId,
            name: fighterData.name,
            imageUrl,
            description: fighterData.description || 'A formidable fighter',
            stats: {
              health: fighterData.stats?.health || 100,
              strength: fighterData.stats?.strength || 50,
              agility: fighterData.stats?.agility || 50,
              defense: fighterData.stats?.defense || 50,
              luck: fighterData.stats?.luck || 25
            }
          });
        } catch (error) {
          console.error(`Failed to load fighter ${filename}:`, error);
        }
      }
      
      // If we couldn't load real fighters, fall back to mock data
      const fighters = realFighters.length >= 2 ? realFighters : [
        {
          fighterId: 'jackie-chan-1',
          name: 'Jackie Chan',
          imageUrl: '/logo-echoForge.png',
          description: 'A martial arts master',
          stats: { health: 800, strength: 150, agility: 60, defense: 80, luck: 25 }
        },
        {
          fighterId: 'jack-nicholson-1',
          name: 'Jack Nicholson',
          imageUrl: '/logo-echoForge.png',
          description: 'A legendary actor',
          stats: { health: 750, strength: 140, agility: 70, defense: 75, luck: 30 }
        }
      ];

      console.log('Creating session with fighters:', fighters.map(f => ({ fighterId: f.fighterId, name: f.name })));
      
      // Initialize the voting session
      votingStore.initSession({
        id: sessionId,
        title: 'Fighter Popularity Vote',
        description: 'Vote for your favorite fighter',
        fighters: fighters,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      });
      await saveVotingStore(votingStore);

      const session = votingStore.getSession();
      
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Failed to create session' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, sessionId: session.id, fighters: session.rounds[0].fighters },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error creating voting session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const votingStore = await loadVotingStore();
    const sessionId = params.id;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // For now, we'll use the current session if it matches the ID
    // In a real implementation, you'd look up the session by ID
    const session = votingStore.getSession();
    
    if (!session || session.id !== sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, session },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving voting session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 