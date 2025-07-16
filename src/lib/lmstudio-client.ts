import type { AnalysisResult, StoryResult } from './types';
import { 
  DEFAULT_IMAGE_DESCRIPTION_PROMPT, 
  DEFAULT_STORY_GENERATION_PROMPT,
  IMAGE_ANALYSIS_SYSTEM_PROMPT,
  STORY_GENERATION_SYSTEM_PROMPT
} from './constants';
import type { GameTemplate } from '@/lib/types/template';
import { jsonrepair } from 'jsonrepair';
import { OPTIMIZED_FIGHTER_GENERATION_SYSTEM_PROMPT, OPTIMIZED_FIGHTER_GENERATION_USER_PROMPT } from './prompts/optimized-prompts';

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
  fighterLabel: string,
  arenaContext?: {
    name: string;
    description: string;
    type?: string;
    hazards?: string[];
    advantages?: string[];
  }
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
            content: OPTIMIZED_FIGHTER_GENERATION_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: OPTIMIZED_FIGHTER_GENERATION_USER_PROMPT(fighterLabel, imageDescription, arenaContext),
          },
        ],
        temperature: 0.7,
        max_tokens: 300, // Reduced from 500
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
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

// ============================================================================
// ENHANCED FIGHTER DESCRIPTION GENERATION
// ============================================================================

export const generateFighterDescription = async (
  fighter: {
    name: string;
    stats: {
      health: number;
      strength: number;
      agility: number;
      defense: number;
      luck: number;
      magic?: number;
      ranged?: number;
      intelligence?: number;
      uniqueAbilities?: string[];
      size: string;
      build: string;
      age: number;
    };
    visualAnalysis?: {
      age: string;
      size: string;
      build: string;
      appearance: string[];
      weapons: string[];
      armor: string[];
    };
    combatHistory?: Array<{
      round: number;
      attacker: string;
      defender: string;
      damage: number;
      narrative: string;
      timestamp: string;
    }>;
    winLossRecord?: { wins: number; losses: number; draws: number };
    createdAt?: string;
  }
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    // Calculate some derived stats for the description
    const totalFights = (fighter.winLossRecord?.wins || 0) + (fighter.winLossRecord?.losses || 0) + (fighter.winLossRecord?.draws || 0);
    const winRate = totalFights > 0 ? Math.round(((fighter.winLossRecord?.wins || 0) / totalFights) * 100) : 0;
    const isVeteran = totalFights > 10;
    const isRookie = totalFights <= 3;
    const hasStreak = (fighter.winLossRecord?.wins || 0) >= 3 || (fighter.winLossRecord?.losses || 0) >= 3;
    
    // Get recent performance (last 3 fights)
    const recentFights = fighter.combatHistory?.slice(-3) || [];
    const recentWins = recentFights.filter(fight => 
      fight.attacker === fighter.name && fight.damage > 0
    ).length;
    const isHotStreak = recentWins >= 2;
    const isSlumping = recentWins === 0 && recentFights.length >= 2;

    const prompt = `Generate a compelling, character-specific description for a fighting game fighter.

FIGHTER DATA:
- Name: ${fighter.name}
- Stats: Health ${fighter.stats.health}, Strength ${fighter.stats.strength}, Agility ${fighter.stats.agility}, Defense ${fighter.stats.defense}, Luck ${fighter.stats.luck}
- Special Stats: Magic ${fighter.stats.magic || 0}, Ranged ${fighter.stats.ranged || 0}, Intelligence ${fighter.stats.intelligence || 0}
- Unique Abilities: ${fighter.stats.uniqueAbilities?.join(', ') || 'None'}
- Physical: ${fighter.stats.size} ${fighter.stats.build}, Age ${fighter.stats.age}
- Equipment: ${fighter.visualAnalysis?.weapons?.join(', ') || 'None'}, ${fighter.visualAnalysis?.armor?.join(', ') || 'No armor'}
- Appearance: ${fighter.visualAnalysis?.appearance?.join(', ') || 'Standard'}

COMBAT HISTORY:
- Total Fights: ${totalFights}
- Record: ${fighter.winLossRecord?.wins || 0}W-${fighter.winLossRecord?.losses || 0}L-${fighter.winLossRecord?.draws || 0}D
- Win Rate: ${winRate}%
- Status: ${isVeteran ? 'Veteran' : isRookie ? 'Rookie' : 'Experienced'} fighter
- Recent Form: ${isHotStreak ? 'Hot streak' : isSlumping ? 'Slumping' : 'Mixed results'}
- Notable: ${hasStreak ? 'Has a winning/losing streak' : 'No significant streaks'}

DESCRIPTION REQUIREMENTS:
- Create a compelling 2-3 sentence description that captures the fighter's personality and fighting style
- Reference their stats, abilities, and combat history when relevant
- Make it sound exciting and battle-ready
- Include specific details about their approach to combat
- Mention any notable achievements or characteristics
- Use action-oriented, dynamic language
- Keep it concise but impactful (max 200 characters)

STYLE GUIDELINES:
- Focus on what makes this fighter unique and formidable
- Emphasize their strengths and fighting philosophy
- Create a sense of their reputation and experience
- Make it sound like a fighting game character bio
- Use varied, exciting vocabulary
- Balance technical details with personality

Return ONLY the description text - no formatting, no JSON, no additional text.`;

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
            content: `You are an expert fighting game writer specializing in creating compelling character descriptions that capture the essence and fighting style of each fighter.

DESCRIPTION STYLE:
- Create vivid, action-packed descriptions that bring fighters to life
- Emphasize unique characteristics and fighting approaches
- Reference stats and abilities in a natural, engaging way
- Build excitement and anticipation for upcoming battles
- Use dynamic, varied language that avoids repetition
- Make each fighter feel distinct and memorable

QUALITY REQUIREMENTS:
- Keep descriptions concise (2-3 sentences, max 200 characters)
- Focus on combat-relevant characteristics
- Include personality and fighting philosophy
- Reference achievements and experience when available
- Create a sense of the fighter's reputation
- Use action-oriented, exciting language

Make each description feel like it belongs in a professional fighting game.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 256,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`LM Studio fighter description API response error: ${response.status} ${errorBody}`);
      return `A formidable ${fighter.stats.size} ${fighter.stats.build} fighter with ${fighter.stats.strength} strength and ${fighter.stats.agility} agility.`;
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content;
    if (!rawContent) {
      return `A formidable ${fighter.stats.size} ${fighter.stats.build} fighter with ${fighter.stats.strength} strength and ${fighter.stats.agility} agility.`;
    }

    return rawContent.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio fighter description error:', error);
    return `A formidable ${fighter.stats.size} ${fighter.stats.build} fighter with ${fighter.stats.strength} strength and ${fighter.stats.agility} agility.`;
  }
}; 