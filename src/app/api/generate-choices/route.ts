import { NextRequest, NextResponse } from 'next/server';
import { STORY_GENERATION_SYSTEM_PROMPT } from '@/lib/constants';
import type { Character, Choice } from '@/lib/types/character';
import JSON5 from 'json5';

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

    // Log the prompt and request body for debugging
    console.log('[LLM CHOICE PROMPT]', choicePrompt);

    const lmRequestBody = {
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
      temperature: 0.7, // Reduced for more consistent output
      max_tokens: 1000,
      stream: false
    };

    console.log('[LLM REQUEST BODY]', JSON.stringify(lmRequestBody, null, 2));

    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lmRequestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[LLM ERROR RESPONSE]', response.status, errorBody);
      throw new Error(`LM Studio API error: ${response.status}`);
    }

    const data = await response.json();
    const choicesText = data.choices[0]?.message?.content;

    if (!choicesText) {
      console.error('[LLM NO CONTENT] No content in response');
      throw new Error('No content in LLM response');
    }

    console.log('[LLM FIXED CHOICE RESPONSE]', choicesText);

    // Preprocess the choices text to fix common issues
    const preprocessedChoicesText = preprocessChoicesContent(choicesText);

    // Enhanced choice parsing with multiple fallback strategies
    let choicesData;
    let parseMethod = 'initial';

    try {
      // Method 1: Direct JSON parse
      choicesData = JSON.parse(preprocessedChoicesText);
      parseMethod = 'direct';
    } catch (e1) {
      console.warn('[CHOICE ARRAY JSON PARSE FAIL]', preprocessedChoicesText, e1);
      
      try {
        // Method 2: JSON5 parse
        choicesData = JSON5.parse(preprocessedChoicesText);
        parseMethod = 'json5';
      } catch (e2) {
        console.warn('[CHOICE ARRAY JSON5 PARSE FAIL]', preprocessedChoicesText, e2);
        
        try {
          // Method 3: Extract array with regex
          const arrayMatch = preprocessedChoicesText.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            const arrayText = arrayMatch[0];
            choicesData = JSON.parse(arrayText);
            parseMethod = 'regex_extract';
          } else {
            throw new Error('No array found');
          }
        } catch (e3) {
          console.warn('[CHOICE ARRAY REGEX PARSE FAIL]', e3);
          
          try {
            // Method 4: Manual extraction
            choicesData = extractChoicesManually(preprocessedChoicesText);
            parseMethod = 'manual_extraction';
          } catch (e4) {
            console.error('[CHOICE ARRAY MANUAL PARSE FAIL]', e4);
            
            // Final fallback: Return default choices
            console.warn('Using fallback choices due to parsing failure');
            return NextResponse.json({
              success: true,
              choices: createFallbackChoices()
            });
          }
        }
      }
    }

    // Validate and process choices
    if (!Array.isArray(choicesData)) {
      console.warn('[CHOICE VALIDATION FAIL] Not an array, using fallback');
      return NextResponse.json({
        success: true,
        choices: createFallbackChoices()
      });
    }

    // Process and validate each choice
    const processedChoices = choicesData
      .filter(choice => choice && typeof choice === 'object')
      .map((choice, index) => {
        // Normalize stat requirements
        const statRequirements = choice.statRequirements || {};
        const normalizedStats: Record<string, number> = {};
        
        Object.entries(statRequirements).forEach(([key, value]) => {
          const normalizedKey = key.toLowerCase();
          if (['intelligence', 'int', 'i'].includes(normalizedKey)) {
            normalizedStats.intelligence = Number(value) || 0;
          } else if (['creativity', 'cre', 'c'].includes(normalizedKey)) {
            normalizedStats.creativity = Number(value) || 0;
          } else if (['perception', 'per', 'p'].includes(normalizedKey)) {
            normalizedStats.perception = Number(value) || 0;
          } else if (['wisdom', 'wis', 'w'].includes(normalizedKey)) {
            normalizedStats.wisdom = Number(value) || 0;
          }
        });

        return {
          id: `choice-${Date.now()}-${index}`,
          type: choice.type || 'dialogue',
          text: cleanChoiceText(choice.text || `Choice ${index + 1}`),
          description: cleanChoiceText(choice.description || 'Continue your journey'),
          statRequirements: normalizedStats,
          consequences: Array.isArray(choice.consequences) ? choice.consequences.map(cleanChoiceText) : ['Your choice has consequences']
        } as Choice;
      })
      .filter(choice => choice.text && choice.text.length > 0);

    // Ensure we have at least 2 choices
    if (processedChoices.length < 2) {
      console.warn('[CHOICE COUNT WARNING] LLM returned', processedChoices.length, 'choices, adding fallback choices');
      const fallbackChoices = createFallbackChoices();
      processedChoices.push(...fallbackChoices.slice(processedChoices.length));
    }

    console.log(`[CHOICES GENERATED] Parse method: ${parseMethod}, Count: ${processedChoices.length}`);
    console.log('[LLM CHOICES USED]', processedChoices);

    return NextResponse.json({
      success: true,
      choices: processedChoices
    });

  } catch (error) {
    console.error('[CHOICE GENERATION ERROR]', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to extract choices manually
function extractChoicesManually(rawContent: string): Choice[] {
  const choices: Choice[] = [];
  const choiceRegex = /\{[^}]*"type"[^}]*\}/g;
  const matches = rawContent.match(choiceRegex);
  
  if (matches) {
    matches.forEach((match) => {
      try {
        const choice = JSON5.parse(match);
        if (choice && choice.text) {
          choices.push(choice);
        }
      } catch (e) {
        console.warn(`[CHOICE OBJECT PARSE FAIL] ${match}`, e);
      }
    });
  }
  
  return choices;
}

// Helper function to create fallback choices
function createFallbackChoices(): Choice[] {
  return [
    {
      id: `choice-${Date.now()}-0`,
      type: 'dialogue',
      text: 'Continue forward',
      description: 'Proceed with your journey',
      statRequirements: {},
      consequences: ['Your adventure continues']
    },
    {
      id: `choice-${Date.now()}-1`,
      type: 'explore',
      text: 'Investigate further',
      description: 'Look for more details in your surroundings',
      statRequirements: { perception: 8 },
      consequences: ['You may discover something important']
    },
    {
      id: `choice-${Date.now()}-2`,
      type: 'skill',
      text: 'Use your abilities',
      description: 'Apply your skills to the situation',
      statRequirements: { intelligence: 10 },
      consequences: ['Your expertise helps you proceed']
    }
  ];
}

function buildChoiceGenerationPrompt({ story, character, turn }: {
  story: import('@/lib/types').StoryDescription;
  character: Character;
  turn: number;
}): string {
  // Destructure the story object
  const { sceneTitle, summary, dilemmas, cues, consequences } = story;
  const stats = character.stats;
  const statsString = `INT ${stats.intelligence}, CRE ${stats.creativity}, PER ${stats.perception}, WIS ${stats.wisdom}`;
  const inventoryString = character.inventory && character.inventory.length > 0
    ? `Inventory: ${character.inventory.map(item => item.name).join(', ')}`
    : '';
  const traitsString = character.traits && character.traits.length > 0
    ? character.traits.join(', ')
    : '';

  let storySection = '';
  if (sceneTitle) storySection += `Scene: ${sceneTitle}\n`;
  if (summary) storySection += `Summary: ${summary}\n`;
  if (dilemmas && dilemmas.length > 0) storySection += `Key Dilemmas:\n- ${dilemmas.join('\n- ')}\n`;
  if (cues) storySection += `Visual Cues: ${cues}\n`;
  if (consequences && consequences.length > 0) storySection += `Ongoing Consequences:\n- ${consequences.join('\n- ')}\n`;

  return `Generate 2-3 clear, actionable choices for the player based on the story context.

CRITICAL REQUIREMENTS:
- Output ONLY a valid JSON array with 2-3 choice objects
- Use clear, simple language - avoid complex jargon or nonsensical phrases
- Each choice must be concrete and actionable
- Focus on meaningful decisions that advance the story
- Keep text concise and impactful

CHOICE STRUCTURE:
Each choice object must have:
- "type": One of "dialogue", "explore", "combat", "skill", "item"
- "text": Short action text (max 60 characters)
- "description": Clear explanation (max 150 characters)
- "statRequirements": Object with stat names as keys, numbers as values
- "consequences": Array of 2-3 short outcome descriptions (max 60 chars each)

STAT REQUIREMENTS:
- Use lowercase stat names: "intelligence", "creativity", "perception", "wisdom"
- Values should be 1-20, appropriate to the character's level
- Only include stats that are actually relevant to the choice

EXAMPLE FORMAT:
[
  {
    "type": "dialogue",
    "text": "Confront the guard",
    "description": "Use your charisma to question the guard about recent events",
    "statRequirements": {"intelligence": 12},
    "consequences": ["Gain information", "Risk alerting others"]
  }
]

STORY CONTEXT:
${storySection}
Character Stats: ${statsString}
Health: ${character.health}
${inventoryString ? inventoryString + '\n' : ''}${traitsString ? 'Traits: ' + traitsString + '\n' : ''}Turn: ${turn}

Generate choices that feel natural to the story and provide meaningful player agency.`;
}

// Helper function to preprocess choices content
function preprocessChoicesContent(content: string): string {
  return content
    // Remove any markdown formatting
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    // Fix common control character issues
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Fix unescaped quotes in strings
    .replace(/"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\\"$2\\"$3"')
    // Remove any trailing commas before closing braces/brackets
    .replace(/,(\s*[}\]])/g, '$1')
    // Fix common LLM artifacts in choices
    .replace(/LEVEL_PERCEPTION/g, 'perception')
    .replace(/PERCEPTION:/g, 'perception:')
    .replace(/crew_skill_COMMS/g, 'communication')
    .replace(/CreateTagHelperIVE/g, 'perceptive')
    .replace(/OBLIVVIOUS/g, 'oblivious')
    .replace(/DETEPTIVITY/g, 'detectivity')
    .replace(/UNuxxxxIVE/g, 'unusual')
    .replace(/EPANCY/g, 'discrepancy')
    .trim();
}

// Helper function to clean choice text
function cleanChoiceText(text: string): string {
  if (typeof text !== 'string') return 'Continue your journey';
  
  return text
    // Remove nonsensical phrases
    .replace(/SILENT OBLIVVIOUS BREAKDOWN-RESCALE/g, 'mysterious disturbance')
    .replace(/OPTIMAL PER CreateTagHelperIVE ANGLE/g, 'optimal perspective')
    .replace(/LETHARGIC ALARM/g, 'warning signs')
    .replace(/OLD-EPOCH CONSTELLATION REMNANTS/g, 'ancient artifacts')
    .replace(/DETE DETECTION/g, 'detection')
    .replace(/ABATTOIR-LIKE ILL-ATTIVENESS/g, 'hostile environment')
    .replace(/SHEENLESS AND SAVE/g, 'dark and dangerous')
    .replace(/INFESTED expanse/g, 'corrupted area')
    .replace(/FORGED OF SILENT OBLIVVIOUS DESTRU/g, 'forged from dark materials')
    .replace(/CONTINUOUS AND UNuxxxxIVE OCCURRENCE/g, 'continuous and unusual occurrence')
    .replace(/DECEPTIVENESS INTENT/g, 'deceptive intent')
    .replace(/LOG DISAPPEARENCE/g, 'log disappearance')
    .replace(/ORDER BELIVENESS/g, 'Order\'s believability')
    .replace(/EMBLEM DETEPTIVITY/g, 'emblem detection')
    .replace(/CARNAVEL SHIP/g, 'carnival ship')
    .replace(/BREAKDOWN-RESCALE EPANCY/g, 'breakdown discrepancy')
    // Clean up excessive capitalization
    .replace(/\b([A-Z]{3,})\b/g, (match) => match.toLowerCase())
    // Fix spacing issues
    .replace(/\s+/g, ' ')
    // Limit choice length
    .substring(0, 200)
    .trim();
} 