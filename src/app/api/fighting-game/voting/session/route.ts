import { NextRequest, NextResponse } from 'next/server';
import { createVotingStore } from '@/lib/stores/votingStore';
import { FighterVote } from '@/lib/types/voting';

// In-memory store for demo purposes (in production, this would be a database)
let votingStore = createVotingStore();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, fighters, startTime, endTime } = body;

    // Validate required fields
    if (!title || !description || !fighters || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

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

    const session = votingStore.getSession();

    return NextResponse.json(
      { success: true, session },
      { status: 201 }
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