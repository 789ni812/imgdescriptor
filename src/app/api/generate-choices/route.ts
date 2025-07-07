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
      temperature: 0.8,
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
      throw new Error('No content received from LM Studio');
    }

    // Parse the choices from the LLM response
    const choices = parseChoicesFromResponse(choicesText);

    // Validate choice count - ensure we have exactly 2-3 choices
    const validatedChoices = validateChoiceCount(choices);

    return NextResponse.json({
      success: true,
      choices: validatedChoices
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

  return `Given the following story and character info, generate 2 or 3 short, creative choices for the player.

INSTRUCTIONS:
1. Output exactly 2 or 3 choices, no more, no less.
2. Each choice must be a JSON object in a JSON array.
3. Output ONLY the JSON array. Do NOT output any text, markdown, code blocks, or explanations—ONLY the JSON array.
4. If you are unsure, output 3 choices. Never output 1 or 4+ choices.
5. If you cannot generate valid choices, output an empty array [] (do NOT output fallback or generic options).
6. WARNING: Any extra text, markdown, or explanation will be ignored and may result in no choices being used.

Each choice should have:
- a type (combat, explore, dialogue, item, skill)
- a short text (max 80 chars)
- a description (max 200 chars)
- stat requirements (1-20)
- 2-3 consequences (max 80 chars each)

Example output:
[
  { "type": "...", "text": "...", "description": "...", "statRequirements": {"intelligence": 10}, "consequences": ["...", "..."] },
  { "type": "...", "text": "...", "description": "...", "statRequirements": {"wisdom": 8}, "consequences": ["...", "..."] }
]

Story:
${storySection}Stats: ${statsString}
Health: ${character.health}
${inventoryString ? inventoryString + '\n' : ''}${traitsString ? 'Traits: ' + traitsString + '\n' : ''}Turn: ${turn}`;
}

function aggressiveJsonFix(input: string): string {
  let fixed = input;
  // Add quotes around unquoted string values (after colon, not already quoted, not number/array/object)
  // e.g. "description": Anya could choose ... => "description": "Anya could choose ..."
  fixed = fixed.replace(/(:\s*)([A-Za-z_][^",\[\{\]\}\n]*)/g, (match, p1, p2) => {
    // If value is true/false/null/number, don't quote
    if (/^(true|false|null|\d+(\.\d+)?)/.test(p2.trim())) return match;
    // If value is already quoted, don't quote
    if (/^".*"$/.test(p2.trim())) return match;
    return `${p1}"${p2.trim()}"`;
  });
  // Remove trailing commas before closing brackets/braces
  fixed = fixed.replace(/,\s*([}\]])/g, '$1');
  // Attempt to close unclosed arrays/objects (very basic: add ] or } if missing at end)
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) {
    fixed += ']'.repeat(openBrackets - closeBrackets);
  }
  const openBraces = (fixed.match(/\{/g) || []).length;
  const closeBraces = (fixed.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    fixed += '}'.repeat(openBraces - closeBraces);
  }
  return fixed;
}

function parseChoicesFromResponse(responseText: string): Choice[] {
  const allowedStatKeys = ['intelligence', 'creativity', 'perception', 'wisdom'];
  const statKeyMap: Record<string, string> = {
    intelligence: 'intelligence', Intelligence: 'intelligence', INT: 'intelligence', int: 'intelligence',
    creativity: 'creativity', Creativity: 'creativity', CRE: 'creativity', cre: 'creativity',
    perception: 'perception', Perception: 'perception', PER: 'perception', per: 'perception',
    wisdom: 'wisdom', Wisdom: 'wisdom', WIS: 'wisdom', wis: 'wisdom',
  };
  try {
    // Remove markdown code block markers and trim whitespace
    let cleaned = responseText.replace(/```json|```/gi, '').trim();
    // Replace common HTML entities with their intended characters
    cleaned = cleaned
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&');
    // Aggressive pre-parse fix
    const fixed = aggressiveJsonFix(cleaned);
    // Log all stages for debugging
    console.log('[LLM RAW CHOICE RESPONSE]', responseText);
    console.log('[LLM CLEANED CHOICE RESPONSE]', cleaned);
    console.log('[LLM FIXED CHOICE RESPONSE]', fixed);
    // Try to extract JSON array from the response
    const jsonMatch = fixed.match(/\[([\s\S]*?)\]/m);
    let arrayText = jsonMatch ? jsonMatch[0] : '';
    // Attempt to auto-close the array if needed
    if (arrayText && !arrayText.trim().endsWith(']')) {
      arrayText += ']';
    }
    let choicesData;
    let parsedChoices = [];
    try {
      choicesData = JSON.parse(arrayText);
    } catch (e1) {
      console.warn('[CHOICE ARRAY JSON PARSE FAIL]', arrayText, e1);
      try {
        choicesData = JSON5.parse(arrayText);
      } catch (e2) {
        console.warn('[CHOICE ARRAY JSON5 PARSE FAIL]', arrayText, e2);
        // If array parsing fails, try to extract and parse each object individually
        const objectMatches = fixed.match(/\{[\s\S]*?\}/g);
        if (objectMatches && objectMatches.length > 0) {
          choicesData = objectMatches.map((objText) => {
            // Aggressive fix for each object
            const objClean = aggressiveJsonFix(objText.replace(/,\s*([}\]])/g, '$1'));
            try {
              return JSON5.parse(objClean);
            } catch (e3) {
              console.warn('[CHOICE OBJECT PARSE FAIL]', objClean, e3);
              return null;
            }
          }).filter(Boolean);
        } else {
          throw new Error('No valid JSON objects found in response');
        }
      }
    }
    if (!Array.isArray(choicesData)) {
      throw new Error('Response is not an array');
    }
    // Validate and transform each choice
    parsedChoices = choicesData.map((choice, index) => {
      // Normalize statRequirements keys
      const normalizedStatRequirements: Record<string, number> = {};
      if (choice.statRequirements && typeof choice.statRequirements === 'object') {
        Object.entries(choice.statRequirements).forEach(([key, value]) => {
          const canonicalKey = statKeyMap[key] || key.toLowerCase();
          if (allowedStatKeys.includes(canonicalKey)) {
            if (typeof value === 'number' && !isNaN(value)) {
              normalizedStatRequirements[canonicalKey] = value;
              if (key !== canonicalKey) {
                console.log(`[STAT KEY REMAP] '${key}' -> '${canonicalKey}'`);
              }
            } else {
              console.warn(`[STAT VALUE IGNORED] '${key}': value is not a valid number:`, value);
            }
          } else {
            console.warn(`[STAT KEY IGNORED] '${key}' is not a recognized stat key.`);
          }
        });
      }
      return {
        id: `choice-${Date.now()}-${index}`,
        type: choice.type || 'other',
        text: choice.text || `Choice ${index + 1}`,
        description: choice.description || '',
        statRequirements: normalizedStatRequirements,
        consequences: Array.isArray(choice.consequences) ? choice.consequences : []
      };
    });
    console.log('[LLM CHOICES USED]', parsedChoices);
    // TODO: In debug mode, save raw LLM output to a file for easier review.
    return parsedChoices;
  } catch (error) {
    console.error('Error parsing choices from LLM response:', error);
    console.error('Raw response:', responseText);
    console.warn('[FALLBACK CHOICES USED]');
    // Fallback to default choices if parsing fails
    return [
      {
        id: `choice-fallback-1-${Date.now()}`,
        text: 'Proceed with caution',
        description: 'Take a careful, measured approach',
        statRequirements: { wisdom: 8 },
        consequences: ['Safer approach', 'May miss opportunities']
      },
      {
        id: `choice-fallback-2-${Date.now()}`,
        text: 'Act boldly',
        description: 'Take decisive action',
        statRequirements: { creativity: 10 },
        consequences: ['May find rewards', 'Could be risky']
      }
    ];
  }
}

function validateChoiceCount(choices: Choice[]): Choice[] {
  // If we have exactly 2-3 choices, return as is
  if (choices.length >= 2 && choices.length <= 3) {
    return choices;
  }

  // If we have too few choices, add fallback choices
  if (choices.length < 2) {
    console.warn(`[CHOICE COUNT WARNING] LLM returned ${choices.length} choices, adding fallback choices`);
    const fallbackChoices: Choice[] = [
      {
        id: `choice-fallback-1-${Date.now()}`,
        text: 'Proceed with caution',
        description: 'Take a careful, measured approach to the situation',
        statRequirements: { wisdom: 8 },
        consequences: ['Safer approach', 'May miss opportunities']
      },
      {
        id: `choice-fallback-2-${Date.now()}`,
        text: 'Act boldly',
        description: 'Take decisive action despite the risks',
        statRequirements: { creativity: 10 },
        consequences: ['May find rewards', 'Could be risky']
      }
    ];
    
    // Combine LLM choices with fallback choices, ensuring we have exactly 2
    const combinedChoices = [...choices, ...fallbackChoices];
    return combinedChoices.slice(0, 2);
  }

  // If we have too many choices, take the first 3
  if (choices.length > 3) {
    console.warn(`[CHOICE COUNT WARNING] LLM returned ${choices.length} choices, taking first 3`);
    return choices.slice(0, 3);
  }

  return choices;
} 