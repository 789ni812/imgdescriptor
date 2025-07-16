import type { AnalysisResult, StoryResult } from './types';
import { 
  DEFAULT_IMAGE_DESCRIPTION_PROMPT, 
  DEFAULT_STORY_GENERATION_PROMPT,
  IMAGE_ANALYSIS_SYSTEM_PROMPT,
  STORY_GENERATION_SYSTEM_PROMPT
} from './constants';
import type { GameTemplate } from '@/lib/types/template';
import { jsonrepair } from 'jsonrepair';

const ANALYSIS_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const STORY_TIMEOUT_MS = 10 * 60 * 1000;    // 10 minutes

const DESCRIBER_MODEL = 'google/gemma-3-4b';  // Image analysis model
const WRITER_MODEL = 'gemma-the-writer-n-restless-quill-10b-uncensored@q2_k';  // Uncensored model for story generation

export const analyzeImage = async (
  imageBase64: string,
  prompt: string
): Promise<AnalysisResult> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS);

  try {
    const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DESCRIBER_MODEL,
        messages: [
          {
            role: 'system',
            content: IMAGE_ANALYSIS_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt || DEFAULT_IMAGE_DESCRIPTION_PROMPT },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`LM Studio API response error: ${response.status} ${errorBody}`);
      return { success: false, error: `API Error: ${response.status} - ${errorBody}` };
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content;
    if (!rawContent) {
      return { success: false, error: 'The model did not return a description.' };
    }
    // Try to parse the JSON object
    try {
      // Remove markdown/code block wrappers if present
      const cleaned = rawContent.replace(/```json|```/gi, '').trim();
      const parsed = JSON.parse(cleaned);
      // Validate required fields
      if (
        typeof parsed.setting === 'string' &&
        Array.isArray(parsed.objects) &&
        Array.isArray(parsed.characters) &&
        typeof parsed.mood === 'string' &&
        Array.isArray(parsed.hooks)
      ) {
        return { success: true, description: parsed };
      } else {
        throw new Error('Missing required fields in image description JSON.');
      }
    } catch (e) {
      console.error('Failed to parse image description JSON:', rawContent, e);
      return { success: false, error: 'Failed to parse image description JSON.' };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
};

export const generateStory = async (
  description: string,
  prompt?: string,
  debugConfig?: GameTemplate['debugConfig']
): Promise<StoryResult> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), STORY_TIMEOUT_MS);

  const userPrompt = prompt ? prompt : `${DEFAULT_STORY_GENERATION_PROMPT}\n\n${description}`;

  // Use debugConfig for AI tuning if provided
  const aiTuning: GameTemplate['debugConfig']['aiResponseTuning'] = debugConfig?.aiResponseTuning ?? {
    temperature: 0.6, // Reduced for more consistent output
    maxTokens: 1500, // Reduced to prevent rambling
    topP: 0.85, // Reduced for more focused output
    frequencyPenalty: 0.2, // Increased to reduce repetition
    presencePenalty: 0.15, // Increased to encourage variety
  };
  const temperature = aiTuning.temperature;
  const max_tokens = aiTuning.maxTokens;
  const top_p = aiTuning.topP;
  const frequency_penalty = aiTuning.frequencyPenalty;
  const presence_penalty = aiTuning.presencePenalty;

  try {
    const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: WRITER_MODEL,
        messages: [
           {
            role: 'system',
            content: STORY_GENERATION_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature,
        max_tokens,
        top_p,
        frequency_penalty,
        presence_penalty,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`LM Studio story API response error: ${response.status} ${errorBody}`);
      return { success: false, error: `API Error: ${response.status} - ${errorBody}` };
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content;
    if (!rawContent) {
      return { success: false, error: 'The model did not return a story.' };
    }

    console.log('[STORY DEBUG] Raw content from LM Studio:', rawContent.substring(0, 500) + '...');

    // Preprocess the raw content to fix common issues
    const preprocessedContent = preprocessJsonContent(rawContent);
    
    console.log('[STORY DEBUG] Preprocessed content:', preprocessedContent.substring(0, 500) + '...');

    // Enhanced JSON parsing with multiple fallback strategies
    let parsed;
    let parseMethod = 'initial';

    try {
      // Method 1: Direct JSON parse
      console.log('[STORY DEBUG] Attempting direct JSON parse...');
      parsed = JSON.parse(preprocessedContent);
      parseMethod = 'direct';
      console.log('[STORY DEBUG] Direct parse successful!');
    } catch (e1) {
      console.warn('[STORY JSON PARSE FAIL] Direct parse failed:', e1);
      console.log('[STORY DEBUG] Direct parse error details:', e1 instanceof Error ? e1.message : String(e1));
      
      try {
        // Method 2: Extract JSON object with regex
        const jsonMatch = preprocessedContent.match(/{[\s\S]*}/);
        if (jsonMatch) {
          const jsonString = jsonMatch[0];
          parsed = JSON.parse(jsonString);
          parseMethod = 'regex_extract';
        } else {
          throw new Error('No JSON object found');
        }
      } catch (e2) {
        console.warn('[STORY JSON PARSE FAIL] Regex extract failed:', e2);
        
        try {
          // Method 3: JSON repair
          const jsonMatch = preprocessedContent.match(/{[\s\S]*}/);
          if (jsonMatch) {
            const jsonString = jsonMatch[0];
            const repaired = jsonrepair(jsonString);
            parsed = JSON.parse(repaired);
            parseMethod = 'jsonrepair';
          } else {
            throw new Error('No JSON object found for repair');
          }
        } catch (e3) {
          console.error('[STORY JSON PARSE FAIL] All parsing methods failed:', e3);
          
          // Method 4: Manual field extraction as last resort
          try {
            parsed = extractStoryFields(preprocessedContent);
            parseMethod = 'manual_extraction';
          } catch (e4) {
            console.error('[STORY JSON PARSE FAIL] Manual extraction failed:', e4);
            
            // Final fallback: Return a minimal valid story
            console.warn('Using fallback story due to parsing failure');
            return { 
              success: true, 
              story: createFallbackStory(description),
              warning: `Story generation encountered parsing issues. Parse method: ${parseMethod}. Raw output: ${rawContent.substring(0, 200)}...`
            };
          }
        }
      }
    }

    // Validate the parsed story structure
    if (!parsed || typeof parsed !== 'object') {
      console.warn('[STORY VALIDATION FAIL] Parsed result is not an object');
      return { 
        success: true, 
        story: createFallbackStory(description),
        warning: 'Story validation failed, using fallback'
      };
    }

    // Ensure all required fields exist and clean the content
    const validatedStory = {
      sceneTitle: cleanStoryText(parsed.sceneTitle || 'Adventure Scene'),
      summary: cleanStoryText(parsed.summary || 'Your adventure continues...'),
      dilemmas: Array.isArray(parsed.dilemmas) ? parsed.dilemmas.map(cleanStoryText) : ['Continue your journey'],
      cues: cleanStoryText(parsed.cues || 'The path ahead is uncertain.'),
      consequences: Array.isArray(parsed.consequences) ? parsed.consequences.map(cleanStoryText) : ['Your choices shape your destiny']
    };

    console.log(`[STORY GENERATED] Parse method: ${parseMethod}`);
    return { success: true, story: validatedStory };

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio story generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
};

export const generateFighterStats = async (
  imageDescription: string,
  fighterLabel: string
): Promise<{ success: boolean; stats?: FighterStats; error?: string }> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS);

  try {
    const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DESCRIBER_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert fighting game designer and character analyst specializing in creating balanced, engaging fighter statistics.

CRITICAL REQUIREMENTS:
- Analyze the fighter's visual characteristics, equipment, and apparent abilities
- Generate stats that reflect the fighter's appearance and potential combat style
- Ensure logical relationships between stats (e.g., large muscular fighters should have higher strength)
- Create unique abilities that match the fighter's theme and characteristics
- Balance stats for competitive gameplay while maintaining character authenticity

STAT GUIDELINES:
- strength: 1-200 (physical power, influenced by size, build, and equipment)
- agility: 1-100 (speed, reflexes, and maneuverability)
- health: 20-1000 (endurance and vitality, consider size and apparent toughness)
- defense: 1-100 (damage resistance and blocking ability)
- luck: 1-50 (random chance factors, critical hits, evasive maneuvers)
- age: 1-1000000 (character age, affects experience and wisdom)
- size: "small" | "medium" | "large" (physical stature)
- build: "thin" | "average" | "muscular" | "heavy" (body composition)
- magic: 0-100 (supernatural powers, only if character clearly has magical abilities)
- ranged: 0-100 (projectile attacks, weapons, or ranged abilities)
- intelligence: 1-100 (tactical thinking, strategy, and problem-solving)
- uniqueAbilities: string[] (2-4 special moves or abilities that define the fighter's style)

ABILITY CREATION RULES:
- Each ability should be specific and thematic to the fighter
- Avoid generic abilities like "strong punch" or "dodge"
- Consider the fighter's equipment, appearance, and apparent skills
- Make abilities sound exciting and unique
- Examples: "Lightsaber Mastery", "Force Choke", "Predator Cloak", "Kangaroo Boxing"

Return ONLY a valid JSON object with the exact field names specified above. All numbers must be integers.`,
          },
          {
            role: 'user',
            content: `Generate stats for: ${fighterLabel}\nImage description: ${imageDescription}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`LM Studio fighter stats API response error: ${response.status} ${errorBody}`);
      return { success: false, error: `API Error: ${response.status} - ${errorBody}` };
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content;
    if (!rawContent) {
      return { success: false, error: 'The model did not return fighter stats.' };
    }

    // Try to parse the JSON object
    try {
      // Remove markdown/code block wrappers if present
      const cleaned = rawContent.replace(/```json|```/gi, '').trim();
      const parsed = JSON.parse(cleaned) as FighterStats;
      
      // Validate required fields
      if (
        typeof parsed.strength === 'number' &&
        typeof parsed.agility === 'number' &&
        typeof parsed.health === 'number' &&
        typeof parsed.defense === 'number' &&
        typeof parsed.luck === 'number' &&
        typeof parsed.age === 'number' &&
        typeof parsed.size === 'string' &&
        typeof parsed.build === 'string'
      ) {
        // Ensure optional fields have default values if not provided
        if (typeof parsed.magic !== 'number') parsed.magic = 0;
        if (typeof parsed.ranged !== 'number') parsed.ranged = 0;
        if (typeof parsed.intelligence !== 'number') parsed.intelligence = 20;
        if (!Array.isArray(parsed.uniqueAbilities)) parsed.uniqueAbilities = [];
        
        return { success: true, stats: parsed };
      } else {
        throw new Error('Missing required fields in fighter stats JSON.');
      }
    } catch (e) {
      console.error('Failed to parse fighter stats JSON:', rawContent, e);
      return { success: false, error: 'Failed to parse fighter stats JSON.' };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio fighter stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
};

interface FighterStats {
  strength: number;
  agility: number;
  health: number;
  defense: number;
  luck: number;
  age: number;
  size: 'small' | 'medium' | 'large';
  build: 'thin' | 'average' | 'muscular' | 'heavy';
  magic?: number;
  ranged?: number;
  intelligence?: number;
  uniqueAbilities?: string[];
}

export const generateBattleCommentary = async (
  fighterA: string,
  fighterB: string,
  round: number,
  isAttack: boolean,
  _damage: number // Prefix with underscore to indicate intentionally unused
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const action = isAttack ? 'attack' : 'defense';
    const prompt = `Generate an exciting, dynamic battle commentary for this fighting game round.

FIGHTERS:
- Fighter A: ${fighterA} (attacking)
- Fighter B: ${fighterB} (defending)
- Round: ${round}
- Action: ${action}${_damage ? ` - Damage dealt: ${_damage}` : ''}

COMMENTARY REQUIREMENTS:
- Create vivid, action-packed commentary that captures the moment
- Describe the specific action and its impact on the battle
- Use varied, exciting language that builds tension
- Keep it concise: 1-2 sentences, maximum 30 words total
- Use natural sentence casing (capitalize only proper nouns and dramatic emphasis)
- Make the commentary feel authentic and engaging
- Avoid repetitive or generic phrases
- Focus on the current action and its significance

STYLE GUIDELINES:
- Use dynamic verbs and descriptive language
- Include specific details about the fighters when relevant
- Create narrative flow that enhances the battle experience
- Balance action description with emotional impact
- Make each round feel unique and memorable

Return ONLY the commentary text - no formatting, no JSON, no additional text.`;

    const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: WRITER_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert fighting game commentator with a dynamic, exciting style that captures the intensity and drama of combat.

COMMENTARY STYLE:
- Use vivid, action-packed language that brings the fight to life
- Vary your commentary style to avoid repetition
- Include specific details about the fighters and their actions
- Create tension and excitement through your word choice
- Use natural sentence casing (no all-caps except for dramatic emphasis)
- Make each round feel unique and memorable

COMMENTARY TECHNIQUES:
- Describe the impact and effectiveness of attacks
- Highlight the fighters' unique characteristics and abilities
- Create narrative flow that builds excitement
- Use varied vocabulary to avoid repetitive phrases
- Include tactical insights when appropriate
- Balance action description with emotional impact

QUALITY REQUIREMENTS:
- Keep commentary concise (1-2 sentences, max 30 words)
- Ensure clarity and readability
- Avoid awkward or nonsensical phrases
- Make the commentary feel authentic and engaging
- Focus on the current action and its impact

Return ONLY the commentary text - no formatting, no JSON, no additional text.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
        top_p: 0.85,
        frequency_penalty: 0.3,
        presence_penalty: 0.2,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`LM Studio battle commentary API response error: ${response.status} ${errorBody}`);
      // Fallback to template-based commentary
      return generateFallbackCommentary(fighterA, fighterB, round, isAttack);
    }

    let commentary = response && (await response.json()).choices[0]?.message?.content?.trim();
    if (!commentary) {
      return generateFallbackCommentary(fighterA, fighterB, round, isAttack);
    }

    commentary = postProcessCommentary(commentary);
    return commentary;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio battle commentary error:', error);
    return generateFallbackCommentary(fighterA, fighterB, round, isAttack);
  }
};

function generateFallbackCommentary(
  fighterA: string,
  fighterB: string,
  round: number,
  isAttack: boolean
): string {
  const attacker = isAttack ? fighterA : fighterB;
  const defender = isAttack ? fighterB : fighterA;
  
  if (isAttack) {
    const attackPhrases = [
      `${attacker} launches a devastating strike at ${defender}!`,
      `${attacker} unleashes a powerful attack on ${defender}!`,
      `${attacker} delivers a crushing blow to ${defender}!`,
      `${attacker} strikes with incredible force at ${defender}!`,
      `${attacker} attacks ${defender} with fierce determination!`
    ];
    return attackPhrases[Math.floor(Math.random() * attackPhrases.length)];
  } else {
    const defensePhrases = [
      `${defender} braces for impact and defends bravely!`,
      `${defender} raises their guard against the incoming attack!`,
      `${defender} blocks the strike with expert timing!`,
      `${defender} dodges and counters with precision!`,
      `${defender} defends with incredible skill!`
    ];
    return defensePhrases[Math.floor(Math.random() * defensePhrases.length)];
  }
}

function postProcessCommentary(text: string): string {
  // Remove all-caps unless it's a proper noun or acronym (simple heuristic)
  // Convert to sentence case if mostly uppercase
  const words = text.split(' ');
  const upperCount = words.filter(w => w === w.toUpperCase() && w.length > 2).length;
  if (upperCount > words.length / 2) {
    // Convert to sentence case
    text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  // Truncate to 30 words max
  const truncated = text.split(' ').slice(0, 30).join(' ');
  // Ensure it ends with a period
  return truncated.replace(/([.!?])?$/, '.');
}

// Helper function to preprocess JSON content
function preprocessJsonContent(content: string): string {
  return content
    // Remove any markdown formatting
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    // Fix common control character issues
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remove any trailing commas before closing braces/brackets
    .replace(/,(\s*[}\]])/g, '$1')
    // Fix common LLM artifacts
    .replace(/CreateTagHelperIVE/g, 'PERCEPTIVE')
    .replace(/OBLIVVIOUS/g, 'OBLIVIOUS')
    .replace(/DETEPTIVITY/g, 'DETECTIVITY')
    .replace(/UNuxxxxIVE/g, 'UNUSUAL')
    .replace(/EPANCY/g, 'DISCREPANCY')
    .trim();
}

// Helper function to clean story text
function cleanStoryText(text: string): string {
  if (typeof text !== 'string') return 'Your adventure continues...';
  
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
    .trim();
}

// Helper function to extract story fields manually
function extractStoryFields(rawContent: string) {
  const extractField = (field: string): string => {
    const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`, 'i');
    const match = rawContent.match(regex);
    return match ? match[1] : '';
  };

  const extractArray = (field: string): string[] => {
    const regex = new RegExp(`"${field}"\\s*:\\s*\\[(.*?)\\]`, 'is');
    const match = rawContent.match(regex);
    if (match) {
      return match[1]
        .split(/"\s*,\s*"/)
        .map(s => s.replace(/(^\s*"|"\s*$)/g, '').trim())
        .filter(Boolean);
    }
    return [];
  };

  return {
    sceneTitle: extractField('sceneTitle') || 'Adventure Scene',
    summary: extractField('summary') || 'Your adventure continues...',
    dilemmas: extractArray('dilemmas').length > 0 ? extractArray('dilemmas') : ['Continue your journey'],
    cues: extractField('cues') || 'The path ahead is uncertain.',
    consequences: extractArray('consequences').length > 0 ? extractArray('consequences') : ['Your choices shape your destiny']
  };
}

// Helper function to create a fallback story
function createFallbackStory(description: string) {
  return {
    sceneTitle: 'Adventure Scene',
    summary: `Your journey continues in this mysterious location. ${description.substring(0, 100)}...`,
    dilemmas: ['Explore further', 'Proceed with caution', 'Seek another path'],
    cues: 'The environment holds secrets waiting to be discovered.',
    consequences: ['Your choices will determine your fate', 'The adventure continues']
  };
} 

// ============================================================================
// NEW: Tournament Overview Generation
// ============================================================================

export const generateTournamentOverview = async (
  tournamentName: string,
  arenaName: string,
  arenaDescription: string,
  currentRound: number,
  totalRounds: number
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const prompt = `Generate an exciting tournament overview for this fighting match.

TOURNAMENT CONTEXT:
- Tournament: ${tournamentName}
- Arena: ${arenaName}
- Arena Description: ${arenaDescription}
- Current Round: ${currentRound} of ${totalRounds}
- Tournament Progress: ${Math.round((currentRound / totalRounds) * 100)}% complete

OVERVIEW REQUIREMENTS:
- Create a brief, exciting overview (2-3 sentences)
- Highlight the tournament's significance and current stage
- Describe the arena's tactical implications and atmosphere
- Include any notable context about this specific battle
- Make it feel like a major sporting event
- Use dynamic, engaging language

STYLE GUIDELINES:
- Use sports commentator style language
- Create excitement and anticipation
- Include specific details about the arena and tournament
- Make the battle feel important and consequential
- Balance information with entertainment value

Return ONLY the overview text - no formatting, no JSON, no additional text.`;

    const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: WRITER_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert sports commentator specializing in fighting tournaments. Generate exciting, informative tournament overviews that capture the drama and significance of each match.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
        top_p: 0.85,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`LM Studio tournament overview API response error: ${response.status} ${errorBody}`);
      return `The ${tournamentName} tournament continues in the ${arenaName} arena. This is round ${currentRound} of ${totalRounds}.`;
    }

    const data = await response.json();
    const overview = data.choices[0]?.message?.content?.trim();
    
    return overview || `The ${tournamentName} tournament continues in the ${arenaName} arena. This is round ${currentRound} of ${totalRounds}.`;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio tournament overview error:', error);
    return `The ${tournamentName} tournament continues in the ${arenaName} arena. This is round ${currentRound} of ${totalRounds}.`;
  }
};

// ============================================================================
// NEW: Battle Summary Generation
// ============================================================================

export const generateBattleSummary = async (
  fighterA: string,
  fighterB: string,
  winner: string,
  battleLog: Array<{
    attackCommentary?: string;
    defenseCommentary?: string;
    round?: number;
    attacker?: string;
    defender?: string;
    attackerDamage?: number;
    defenderDamage?: number;
    randomEvent?: string;
    arenaObjectsUsed?: string[];
    healthAfter?: { [key: string]: number };
  }>,
  totalRounds: number
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    // Extract key battle highlights
    const keyEvents = battleLog
      .filter(round => round.attackCommentary || round.defenseCommentary)
      .slice(-3) // Last 3 rounds for context
      .map(round => `${round.attackCommentary} ${round.defenseCommentary}`)
      .join(' ');

    const prompt = `Generate an exciting battle summary for this completed fight.

BATTLE CONTEXT:
- Fighter A: ${fighterA}
- Fighter B: ${fighterB}
- Winner: ${winner}
- Total Rounds: ${totalRounds}
- Key Battle Events: ${keyEvents}

SUMMARY REQUIREMENTS:
- Create a compelling 2-3 sentence summary of the entire battle
- Highlight the most dramatic moments and turning points
- Describe the overall flow and intensity of the fight
- Include the final outcome and its significance
- Make it feel like a sports highlight reel

STYLE GUIDELINES:
- Use dynamic, action-packed language
- Create narrative tension and excitement
- Include specific details about key moments
- Balance action description with emotional impact
- Make the summary feel like professional sports commentary

Return ONLY the summary text - no formatting, no JSON, no additional text.`;

    const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: WRITER_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert sports commentator specializing in post-fight analysis. Generate exciting, comprehensive battle summaries that capture the drama and significance of each match.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
        top_p: 0.85,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`LM Studio battle summary API response error: ${response.status} ${errorBody}`);
      return `${fighterA} and ${fighterB} engaged in an intense ${totalRounds}-round battle. ${winner} emerged victorious after a hard-fought contest.`;
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content?.trim();
    
    return summary || `${fighterA} and ${fighterB} engaged in an intense ${totalRounds}-round battle. ${winner} emerged victorious after a hard-fought contest.`;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio battle summary error:', error);
    return `${fighterA} and ${fighterB} engaged in an intense ${totalRounds}-round battle. ${winner} emerged victorious after a hard-fought contest.`;
  }
}; 