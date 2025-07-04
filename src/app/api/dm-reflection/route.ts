import { NextRequest, NextResponse } from 'next/server';
import { buildDMReflectionPrompt, parseDMReflectionResponse, validateReflectionContext, DMReflectionContext } from '@/lib/prompts/dmReflectionPrompts';
import { Character } from '@/lib/types/character';
import { Choice, ChoiceOutcome } from '@/lib/types/character';
import { DungeonMasterTemplate } from '@/lib/types/dungeonMaster';
import { DMAdaptation } from '@/lib/types/dmAdaptation';
// Debug logging utility
const DEBUG = process.env.NODE_ENV === 'development';
const debugLog = (component: string, action: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[${component}] ${action}`, data || '');
  }
};

// Request body interface
interface DMReflectionRequest {
  character: Character;
  currentTurn: number;
  imageDescription: string;
  generatedStory: string;
  playerChoices: Choice[];
  choiceOutcomes: ChoiceOutcome[];
  dmPersonality: DungeonMasterTemplate;
  currentMood: 'positive' | 'negative' | 'neutral';
  previousAdaptations: DMAdaptation[];
  playerPerformance: {
    alignmentChange: number;
    choiceQuality: 'good' | 'neutral' | 'poor';
    storyEngagement: number;
    difficultyRating: number;
  };
}

// Response interface
interface DMReflectionResponse {
  success: boolean;
  reflection?: string;
  adaptations?: {
    difficultyAdjustment: number;
    narrativeDirection: string;
    moodChange: 'positive' | 'negative' | 'neutral';
    personalityEvolution: string[];
    storyModifications: string[];
  };
  playerAssessment?: {
    engagement: number;
    understanding: number;
    satisfaction: number;
  };
  error?: string;
}

// Validate required fields in request body
function validateRequiredFields(body: Record<string, unknown>): { isValid: boolean; missingFields: string[] } {
  const requiredFields = [
    'character',
    'currentTurn',
    'imageDescription',
    'generatedStory',
    'playerChoices',
    'choiceOutcomes',
    'dmPersonality',
    'currentMood',
    'previousAdaptations',
    'playerPerformance'
  ];

  const missingFields = requiredFields.filter(field => {
    const value = body[field];
    // Check if field exists and has a valid value
    if (field === 'previousAdaptations') {
      return !Array.isArray(value); // Allow empty arrays
    }
    if (field === 'currentTurn') {
      return typeof value !== 'number' || value < 1;
    }
    if (field === 'playerChoices' || field === 'choiceOutcomes') {
      return !Array.isArray(value); // Allow empty arrays
    }
    if (field === 'currentMood') {
      return !['positive', 'negative', 'neutral'].includes(value as string);
    }
    if (field === 'playerPerformance') {
      return !value || typeof value !== 'object';
    }
    return !value; // For other fields, check if truthy
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

// Generate DM reflection using LLM
async function generateDMReflection(prompt: string): Promise<string> {
  const apiUrl = process.env.LM_STUDIO_API_URL || 'http://localhost:1234/v1/chat/completions';
  const apiKey = process.env.LM_STUDIO_API_KEY || 'not-needed';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'local-model',
        messages: [
          {
            role: 'system',
            content: 'You are an intelligent Dungeon Master assistant that provides thoughtful reflections on player choices and game progression.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from LLM API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling LLM API:', error);
    throw new Error('Failed to generate DM reflection');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  debugLog('dm-reflection', 'POST request received');
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Parse request body
    let body: DMReflectionRequest;
    try {
      body = await request.json();
      debugLog('dm-reflection', 'Request body parsed successfully', { 
        hasCharacter: !!body.character,
        currentTurn: body.currentTurn,
        hasStory: !!body.generatedStory
      });
    } catch {
      debugLog('dm-reflection', 'Failed to parse request body');
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400, headers }
      );
    }

    // Validate required fields
    const fieldValidation = validateRequiredFields(body as unknown as Record<string, unknown>);
    debugLog('dm-reflection', 'Field validation completed', { 
      isValid: fieldValidation.isValid,
      missingFields: fieldValidation.missingFields 
    });
    
    if (!fieldValidation.isValid) {
      debugLog('dm-reflection', 'Field validation failed', { missingFields: fieldValidation.missingFields });
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${fieldValidation.missingFields.join(', ')}` 
        },
        { status: 400, headers }
      );
    }

    // Create reflection context
    const reflectionContext: DMReflectionContext = {
      character: body.character,
      currentTurn: body.currentTurn,
      imageDescription: body.imageDescription,
      generatedStory: body.generatedStory,
      playerChoices: body.playerChoices,
      choiceOutcomes: body.choiceOutcomes,
      dmPersonality: body.dmPersonality,
      currentMood: body.currentMood,
      previousAdaptations: body.previousAdaptations,
      playerPerformance: body.playerPerformance
    };

    // Validate reflection context
    const contextValidation = validateReflectionContext(reflectionContext);
    if (!contextValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid reflection context: ${contextValidation.errors.join(', ')}` 
        },
        { status: 400, headers }
      );
    }

    // Build reflection prompt
    const prompt = buildDMReflectionPrompt(reflectionContext);
    debugLog('dm-reflection', 'Reflection prompt built', { promptLength: prompt.length });

    // Generate DM reflection using LLM
    debugLog('dm-reflection', 'Calling LLM for reflection');
    const llmResponse = await generateDMReflection(prompt);
    debugLog('dm-reflection', 'LLM response received', { responseLength: llmResponse.length });

    // Parse the response
    let parsedResponse;
    try {
      parsedResponse = parseDMReflectionResponse(llmResponse);
    } catch (error) {
      console.error('Error parsing DM reflection response:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to parse DM reflection response' },
        { status: 500, headers }
      );
    }

    // Return successful response
    const response: DMReflectionResponse = {
      success: true,
      reflection: parsedResponse.reflection,
      adaptations: parsedResponse.adaptations,
      playerAssessment: parsedResponse.playerAssessment
    };

    return NextResponse.json(response, { status: 200, headers });

  } catch (error) {
    console.error('DM Reflection API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: `Failed to generate DM reflection: ${errorMessage}` },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
} 