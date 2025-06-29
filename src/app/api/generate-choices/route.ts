import { NextRequest, NextResponse } from 'next/server';
import { STORY_GENERATION_SYSTEM_PROMPT } from '@/lib/constants';
import type { Character, Choice } from '@/lib/types/character';

const WRITER_MODEL = 'gemma-the-writer-n-restless-quill-10b-uncensored@q2_k';  // Uncensored model for story generation

export async function POST(request: NextRequest) {
  try {
    const { story, character, turn } = await request.json();

    if (!story || !character || turn === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: story, character, or turn' },
        { status: 400 }
      );
    }

    // Build the choice generation prompt
    const choicePrompt = buildChoiceGenerationPrompt({ story, character, turn });

    // For now, we'll use the same LM Studio endpoint as story generation
    // In the future, this could be a different model or endpoint
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: WRITER_MODEL,
        messages: [
          {
            role: 'system',
            content: STORY_GENERATION_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: choicePrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`LM Studio API error: ${response.status}`);
    }

    const data = await response.json();
    const choicesText = data.choices[0]?.message?.content;

    if (!choicesText) {
      throw new Error('No content received from LM Studio');
    }

    // Parse the choices from the LLM response
    const choices = parseChoicesFromResponse(choicesText);

    return NextResponse.json({
      success: true,
      choices
    });

  } catch (error) {
    console.error('Error generating choices:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred while generating choices.'
      },
      { status: 500 }
    );
  }
}

function buildChoiceGenerationPrompt({ story, character, turn }: {
  story: string;
  character: Character;
  turn: number;
}): string {
  const stats = character.stats;
  const statsString = `INT ${stats.intelligence}, CRE ${stats.creativity}, PER ${stats.perception}, WIS ${stats.wisdom}`;
  
  return `Based on the following story and character information, generate 2-3 meaningful choices that the player can make. Each choice should be tailored to the story content and character's abilities.

**Story:**
${story}

**Character Stats:** ${statsString}
**Current Turn:** ${turn}
**Character Traits:** ${character.traits.join(', ')}

**Instructions:**
1. Generate 2-3 choices that are directly relevant to the story content
2. Each choice should have different stat requirements that make sense for the action
3. Include realistic consequences for each choice
4. Make choices that test different character abilities (intelligence, creativity, perception, wisdom)
5. Ensure choices are meaningful and will affect the story progression

**Format your response as a JSON array of choice objects:**
[
  {
    "text": "Choice text (what the player will see)",
    "description": "Detailed description of the choice",
    "statRequirements": {"intelligence": 10, "creativity": 8},
    "consequences": ["Positive outcome", "Potential risk"]
  }
]

**Requirements:**
- Use the exact JSON format above
- Include 2-3 choices
- Make stat requirements realistic (1-20 range)
- Include 2-3 consequences per choice
- Ensure choices are diverse and meaningful

Generate the choices now:`;
}

function parseChoicesFromResponse(responseText: string): Choice[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const choicesData = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(choicesData)) {
      throw new Error('Response is not an array');
    }

    // Validate and transform each choice
    return choicesData.map((choice, index) => ({
      id: `choice-${Date.now()}-${index}`,
      text: choice.text || `Choice ${index + 1}`,
      description: choice.description || '',
      statRequirements: choice.statRequirements || {},
      consequences: Array.isArray(choice.consequences) ? choice.consequences : []
    }));

  } catch (error) {
    console.error('Error parsing choices from LLM response:', error);
    console.error('Raw response:', responseText);
    
    // Fallback to default choices if parsing fails
    return [
      {
        id: `choice-fallback-1`,
        text: 'Proceed with caution',
        description: 'Take a careful, measured approach',
        statRequirements: { wisdom: 8 },
        consequences: ['Safer approach', 'May miss opportunities']
      },
      {
        id: `choice-fallback-2`,
        text: 'Act boldly',
        description: 'Take decisive action',
        statRequirements: { creativity: 10 },
        consequences: ['May find rewards', 'Could be risky']
      }
    ];
  }
} 