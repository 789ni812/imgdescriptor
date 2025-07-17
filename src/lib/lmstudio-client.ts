import type { AnalysisResult, StoryResult } from './types';
import { 
  DEFAULT_IMAGE_DESCRIPTION_PROMPT, 
  DEFAULT_STORY_GENERATION_PROMPT,
  IMAGE_ANALYSIS_SYSTEM_PROMPT,
  STORY_GENERATION_SYSTEM_PROMPT
} from './constants';
import type { GameTemplate } from '@/lib/types/template';
import { jsonrepair } from 'jsonrepair';
import { 
  OPTIMIZED_FIGHTER_GENERATION_SYSTEM_PROMPT, 
  OPTIMIZED_FIGHTER_GENERATION_USER_PROMPT, 
  OPTIMIZED_BATTLE_COMMENTARY_SYSTEM_PROMPT, 
  OPTIMIZED_BATTLE_COMMENTARY_USER_PROMPT, 
  OPTIMIZED_TOURNAMENT_OVERVIEW_SYSTEM_PROMPT, 
  OPTIMIZED_TOURNAMENT_OVERVIEW_USER_PROMPT, 
   
  OPTIMIZED_FIGHTER_DESCRIPTION_SYSTEM_PROMPT, 
  OPTIMIZED_FIGHTER_DESCRIPTION_USER_PROMPT,
  OPTIMIZED_FIGHTER_SLOGAN_SYSTEM_PROMPT,
  OPTIMIZED_FIGHTER_SLOGAN_USER_PROMPT,
  OPTIMIZED_TOURNAMENT_COMMENTARY_SYSTEM_PROMPT,
  OPTIMIZED_TOURNAMENT_COMMENTARY_USER_PROMPT,
  OPTIMIZED_ENHANCED_ARENA_SYSTEM_PROMPT,
  OPTIMIZED_ENHANCED_ARENA_USER_PROMPT,
  OPTIMIZED_ENHANCED_BATTLE_SUMMARY_SYSTEM_PROMPT,
  OPTIMIZED_ENHANCED_BATTLE_SUMMARY_USER_PROMPT,
} from './prompts/optimized-prompts';

const ANALYSIS_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const STORY_TIMEOUT_MS = 10 * 60 * 1000;    // 10 minutes

const DESCRIBER_MODEL = 'google/gemma-3-4b';  // Image analysis model
// Model configuration
const WRITER_MODEL = 'google/gemma-3-4b';  // Updated to use the model that's actually running

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
      
      // Normalize the response to handle cases where LLM returns arrays instead of strings
      const normalized = {
        setting: Array.isArray(parsed.setting) ? parsed.setting.join(', ') : parsed.setting,
        objects: Array.isArray(parsed.objects) ? parsed.objects : [],
        characters: Array.isArray(parsed.characters) ? parsed.characters : [],
        mood: Array.isArray(parsed.mood) ? parsed.mood.join(', ') : parsed.mood,
        hooks: Array.isArray(parsed.hooks) ? parsed.hooks : []
      };
      
      // Validate required fields
      if (
        typeof normalized.setting === 'string' &&
        Array.isArray(normalized.objects) &&
        Array.isArray(normalized.characters) &&
        typeof normalized.mood === 'string' &&
        Array.isArray(normalized.hooks)
      ) {
        return { success: true, description: normalized };
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

// Global vocabulary tracker for battle diversity
const usedVocabulary: Set<string> = new Set();

export function resetVocabularyTracker(): void {
  usedVocabulary.clear();
}

export function addUsedVocabulary(words: string[]): void {
  words.forEach(word => usedVocabulary.add(word.toLowerCase()));
}

export function getExcludedVocabulary(): string {
  if (usedVocabulary.size === 0) return '';
  return `EXCLUDED WORDS (DO NOT USE): ${Array.from(usedVocabulary).join(', ')}`;
}

function extractActionWords(text: string): string[] {
  const actionVerbs = [
    'explodes', 'unleashes', 'erupts', 'smashes', 'rips', 'crushes', 'bashes', 'hammers', 
    'pummels', 'shreds', 'rends', 'slices', 'blasts', 'pounces', 'lunges', 'sweeps', 
    'hurls', 'catapults', 'surges', 'lashes', 'strikes', 'slams', 'collides', 'impacts', 
    'crashes', 'barrages', 'batters', 'pounds', 'ravages', 'devastates', 'demolishes', 
    'wrecks', 'shatters', 'obliterates', 'launches', 'bursts', 'propels', 'flings',
    'throws', 'dodges', 'blocks', 'defends', 'counters', 'evades', 'parries'
  ];
  
  const descriptiveAdjectives = [
    'brutal', 'devastating', 'powerful', 'colossal', 'massive', 'swift', 'nimble',
    'granite', 'seismic', 'chaotic', 'controlled', 'calculated', 'precise', 'unsettling',
    'spectral', 'diminutive', 'veteran', 'whirlwind', 'cascade', 'torrent'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  const foundWords: string[] = [];
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (actionVerbs.includes(cleanWord) || descriptiveAdjectives.includes(cleanWord)) {
      foundWords.push(cleanWord);
    }
  });
  
  return foundWords;
}

function ensureDamageMention(commentary: string, damage: number): string {
  if (damage > 0 && !new RegExp(`\\b${damage}\\b`).test(commentary)) {
    // If the damage number is not present, append a phrase
    return commentary.trim().replace(/([.!?])?$/, ` (This attack deals ${damage} damage!)$1`);
  }
  return commentary;
}

export const generateBattleCommentary = async (
  fighterA: string | { name: string; stats?: { strength: number; agility: number; size: string; build: string; uniqueAbilities?: string[] } },
  fighterB: string | { name: string; stats?: { strength: number; agility: number; size: string; build: string; uniqueAbilities?: string[] } },
  round: number,
  isAttack: boolean,
  _damage: number, // Prefix with underscore to indicate intentionally unused
  previousRoundHighlights?: string,
  tournamentContext?: string
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  // Extract fighter names and characteristics
  const fighterAName = typeof fighterA === 'string' ? fighterA : fighterA.name;
  const fighterBName = typeof fighterB === 'string' ? fighterB : fighterB.name;
  
  // Build fighter characteristics for more specific commentary
  const fighterACharacteristics = typeof fighterA === 'object' && fighterA.stats ? 
    `${fighterA.stats.size} ${fighterA.stats.build} fighter with ${fighterA.stats.strength} strength, ${fighterA.stats.agility} agility${fighterA.stats.uniqueAbilities?.length ? `, abilities: ${fighterA.stats.uniqueAbilities.join(', ')}` : ''}` : 
    fighterAName;
  
  const fighterBCharacteristics = typeof fighterB === 'object' && fighterB.stats ? 
    `${fighterB.stats.size} ${fighterB.stats.build} fighter with ${fighterB.stats.strength} strength, ${fighterB.stats.agility} agility${fighterB.stats.uniqueAbilities?.length ? `, abilities: ${fighterB.stats.uniqueAbilities.join(', ')}` : ''}` : 
    fighterBName;

  // Get excluded vocabulary for this round
  const excludedVocabulary = getExcludedVocabulary();

  // Log the commentary request
  console.log(`[BATTLE COMMENTARY] Generating ${isAttack ? 'attack' : 'defense'} commentary for Round ${round}: ${fighterAName} vs ${fighterBName}`);
  if (excludedVocabulary) {
    console.log(`[BATTLE COMMENTARY] Excluding vocabulary: ${excludedVocabulary}`);
  }

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
            content: OPTIMIZED_BATTLE_COMMENTARY_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: OPTIMIZED_BATTLE_COMMENTARY_USER_PROMPT(fighterACharacteristics, fighterBCharacteristics, round, isAttack, _damage, previousRoundHighlights, tournamentContext) + 
              (excludedVocabulary ? `\n\n${excludedVocabulary}` : ''),
          },
        ],
        temperature: 0.5, // Reduced for more coherent output
        max_tokens: 80, // Balanced for quality and speed
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
      const fallback = generateFallbackCommentary(fighterAName, fighterBName, round, isAttack);
      console.log(`[BATTLE COMMENTARY] Using fallback: "${fallback}"`);
      return fallback;
    }

    const data = await response.json();
    const rawCommentary = data.choices[0]?.message?.content?.trim();
    
    if (!rawCommentary) {
      const fallback = generateFallbackCommentary(fighterAName, fighterBName, round, isAttack);
      console.log(`[BATTLE COMMENTARY] No commentary returned, using fallback: "${fallback}"`);
      return fallback;
    }

    console.log(`[BATTLE COMMENTARY] Raw LLM response: "${rawCommentary}"`);
    
    let processedCommentary = postProcessCommentary(rawCommentary);
    processedCommentary = ensureDamageMention(processedCommentary, _damage);
    
    // Extract and track used vocabulary
    const usedWords = extractActionWords(processedCommentary);
    addUsedVocabulary(usedWords);
    console.log(`[BATTLE COMMENTARY] Tracked vocabulary: ${usedWords.join(', ')}`);
    
    console.log(`[BATTLE COMMENTARY] Processed commentary: "${processedCommentary}"`);
    
    return processedCommentary;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio battle commentary error:', error);
    const fallback = generateFallbackCommentary(fighterAName, fighterBName, round, isAttack);
    console.log(`[BATTLE COMMENTARY] Error occurred, using fallback: "${fallback}"`);
    return fallback;
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
  // Remove excessive ALL CAPS and convert to sentence case
  const words = text.split(' ');
  const upperCount = words.filter(w => w === w.toUpperCase() && w.length > 2).length;
  if (upperCount > words.length / 4) {
    text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  // Also convert individual ALL CAPS words that aren't proper nouns
  const properNouns = new Set(['vader', 'kong', 'lee', 'osbourne', 'callahan', 'godzilla', 'bruce', 'donkey', 'darth', 'ozzy', 'harry', 'cal']);
  text = text.replace(/\b[A-Z]{3,}\b/g, (match) => {
    const lowerMatch = match.toLowerCase();
    if (properNouns.has(lowerMatch)) {
      return match; // Keep proper nouns as-is
    }
    return lowerMatch; // Convert other ALL CAPS to lowercase
  });

  // Replace common nonsense words with better alternatives
  const nonsenseReplacements: { [key: string]: string } = {
    // DeepSeek-specific nonsense words
    'viscible': 'visible',
    'vicariousning': 'vicious',
    'combatmatic': 'combat',
    'clueless': 'fierce',
    'caftured': 'captured',
    'nanopan': 'nanosecond',
    'feroclty': 'ferocity',
    'desepresented': 'represented',
    'killnlng': 'killing',
    'blwory': 'blow',
    'faticalsly': 'fatally',
    'collideof': 'collision of',
    'clawuxxxx': 'claw',
    'obfuridad': 'obscurity',
    'concounter': 'counter',
    'littlers': 'fighters',
    'blsters': 'blasts',
    'dissuaging': 'deflecting',
    'killfighter': 'fighter',
    'meteor': 'force',
    'snarling': 'attack',
    'blissful': 'precise',
    'transfixed': 'tense',
    'viscible detector': 'stealth detector',
    'insideout': 'inside out',
    'neutral zone': 'battlefield',
    'passive instant': 'moment',
    'legislative action': 'action',
    'infuriates': 'strikes',
    'bludgening': 'bludgeoning',
    'infliction': 'damage',
    'resilience': 'defense',
    'onslaught': 'attack',
    'unfla wared': 'unfazed',
    'liquid darkness': 'fluid movement',
    'killnlng smile': 'deadly smile',
    'nunchak': 'nunchaku',
    'shatters': 'shatters',
    'groggily': 'staggering',
    'clearl': 'clearly',
    'emblazoned': 'fierce',
    'claw-laced': 'clawed',
    'protective': 'defensive',
    'fiery dragon': 'dragon',
    'blunts': 'strikes',
    'snatching': 'grasping',
    'crucially': 'decisively',
    'fragmented': 'broken',
    'razor-sharp': 'sharp',
    'iron neck': 'neck',
    'fist dragon': 'Bruce Lee',
    'wedge': 'strike',
    'blind fury': 'fury',
    'infamously': 'skillfully',
    'nu flow': 'flow',
    'transformation': 'technique',
    'visceral plate': 'armor',
    'carcass': 'body',
    'unmitigated': 'powerful',
    'thirty-seven': '37',
    'hud': 'display',
    'flurry': 'attack',
    'shift the odds': 'change the battle',
    'slamn': 'slam',
    'art filing': 'artful',
    'tactical': 'strategic',
    'armor': 'defense',
    'obliterating': 'destroying',
    'opening': 'opportunity',
    'continu出版年': 'continuation',
    'phantom': 'ghost',
    // New nonsense words from latest output
    'juxxxx': 'technique',
    'imuxxxx': 'mighty',
    'dtotal': 'total',
    'sheevu': 'force',
    'reiko-mikasa': 'fighter',
    'despte': 'despite',
    'statistician': 'fighter',
    'retro speculatively': 'carefully',
    'estimating': 'planning',
    'combat knife': 'blade',
    'displaced energy': 'raw power',
    'raw aggression': 'fierce attack',
    'force field': 'defense',
    // Legacy nonsense words
    'proto': 'power',
    'vermogen': 'energy',
    'sinwivelines': 'swings',
    'bloretical': 'theoretical',
    'rasengan': 'energy',
    'shuhkis': 'techniques',
    'apartheoid': 'apartheid',
    'soggiores': 'suffers',
    'galaftre': 'agility',
    'inf': 'infinite',
    'initium': 'beginning',
    'anings': 'Bruce Lee\'s',
    'de': 'the',
    'publishing': 'pulsing',
    'blor': 'blood',
    'thetical': 'theoretical',
    'wham': 'impact',
    'regen': 'regeneration',
    'wilt': 'will',
    'override': 'overwhelm',
    'blw': 'blow',
    'barek': 'barrage',
    'bisogn': 'bison',
    'actingslam': 'acting slam',
    'battlemi': 'battle',
    'stomper': 'stomping',
    'flattensfive-six': 'flattens five or six',
    'gaunts': 'gauntlets',
    'ding kong': 'Donkey Kong',
    'chompfuelled': 'chomp-fueled',
    'bludg': 'bludgeon',
    'fiercness': 'fierceness',
    'fumblers': 'fumbles',
    'combiner': 'combination',
    'embeddeds': 'embedded',
    'carvies': 'carves',
    'vainer': 'Vader',
    'bludgering': 'bludgeoning',
    'betweenstory': 'defense',
    'gehoats': 'goes through',
    'fergoscreen': 'furious',
    'whails': 'whirls',
    'callaughan': 'Callahan',
    'osdbourne': 'Osbourne',
    'matters': 'Osbourne',
    'chime': 'strike',
    'fla owing': 'flowing',
    'less seconds': 'fewer seconds',
    'def measures': 'defense',
    'shell shocker': 'Callahan',
    'prince of darkness': 'Ozzy',
    'spectral rider': 'spectral form',
    'trident': 'defense',
    'neckbreaker': 'neck-breaking move',
    'haymaker': 'powerful punch',
    'contra butterfly': 'counter move',
    'shotclaw': 'shot and claw',
    'ironhead': 'iron head',
    'fortress like': 'fortress-like',
    'shot chancellor belt': 'chancellor belt strike',
    'none the less': 'nonetheless',
    'narrow escape': 'close call',
    'battling odyssey': 'epic battle',
    'fertile bite': 'powerful strike',
    'grips weakening': 'grip weakening',
    'defensive liner': 'defensive line',
    'shudders through': 'shakes through',
    'combos remain active': 'combinations continue',
    'battered his neck': 'damaged his neck',
    'brutal reset': 'brutal counter',
    'forces of deflection': 'defensive forces',
    'rebounding ferocity': 'bouncing back',
    'deepens the tension': 'increases the tension',
    'crucible of combat': 'intense battle'
  };
  Object.entries(nonsenseReplacements).forEach(([nonsense, replacement]) => {
    const regex = new RegExp(`\\b${nonsense}\\b`, 'gi');
    text = text.replace(regex, replacement);
  });

  // Remove prompt leakage (instructions that shouldn't be in output) - less aggressive
  const promptLeakagePatterns = [
    /less is more:/i,
    /assume a viewer/i,
    /did not see the preceding rounds/i,
    /instantly understand this specific moment/i,
    /legislative action:/i,
    /this has to be intensifying/i,
    /comment on how pred/i,
    /comment on how/i,
    /the battle continues as/i,
    /reiko-mikasa and k/i,
    /sheevu's potent force field over/i,
    /this is the exact moment to say/i,
    /the output should be a concise/i,
    /this is an example output/i,
    /\*\*output\*\*/i,
    /the fight specific context is provided/i,
    /the on-screen context is a single/i,
    /the provided context is that this specific/i,
    /the raw aggression of/i,
    /the enraged/i,
    /the fierce attack of/i,
    /the output must be:/i,
    /the output must be/i,
    /output must be:/i,
    /output must be/i
  ];
  
  // Only remove exact matches, not partial matches
  promptLeakagePatterns.forEach(pattern => {
    text = text.replace(pattern, '');
  });
  
  // Clean up any double spaces that might result from removals
  text = text.replace(/\s+/g, ' ').trim();

  // Clean up extra spaces and punctuation
  text = text.replace(/\s+/g, ' ').trim();

  // Split into sentences
  const sentencesRaw = text.match(/[^.!?]+[.!?]/g);
  let sentences: string[] = Array.isArray(sentencesRaw) ? sentencesRaw : [text];

  // Remove sentences containing invented/nonsense words (less aggressive)
  const nonsenseKeys = Object.keys(nonsenseReplacements);
  sentences = sentences.filter(sentence => {
    // Only filter out sentences that contain multiple nonsense words
    const nonsenseCount = nonsenseKeys.filter(nonsense => 
      sentence.toLowerCase().includes(nonsense)
    ).length;
    return nonsenseCount < 2; // Allow sentences with 0-1 nonsense words
  });

  // Keep only the first two sentences
  if (sentences.length > 2) {
    sentences = sentences.slice(0, 2);
  }

  // If there are less than two, keep as is
  // Join sentences and ensure it ends with a period
  let result = sentences.join(' ').trim();
  if (!result.endsWith('.')) {
    result += '.';
  }
  
  // If result is empty or just punctuation, return a fallback
  if (!result || result === '.' || result.length < 10) {
    return 'The battle continues with intense action.';
  }
  
  return result;
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
            content: OPTIMIZED_TOURNAMENT_OVERVIEW_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: OPTIMIZED_TOURNAMENT_OVERVIEW_USER_PROMPT(tournamentName, arenaName, currentRound, totalRounds),
          },
        ],
        temperature: 0.7,
        max_tokens: 80, // Reduced from 150
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
// NEW: Fighter Slogan Generation
// ============================================================================

export const generateFighterSlogans = async (
  fighterName: string,
  fighterStats: {
    strength: number;
    agility: number;
    health: number;
    defense: number;
    intelligence: number;
    uniqueAbilities: string[];
  },
  visualAnalysis: {
    age: string;
    size: string;
    build: string;
    appearance: string[];
    weapons: string[];
    armor: string[];
  },
  imageDescription: string
): Promise<{ success: boolean; slogans?: string[]; description?: string; error?: string }> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

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
            content: OPTIMIZED_FIGHTER_SLOGAN_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: OPTIMIZED_FIGHTER_SLOGAN_USER_PROMPT(fighterName, fighterStats, visualAnalysis, imageDescription),
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
      console.error(`LM Studio fighter slogans API response error: ${response.status} ${errorBody}`);
      return { success: false, error: `API Error: ${response.status} - ${errorBody}` };
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content?.trim();
    
    if (!rawContent) {
      return { success: false, error: 'The model did not return fighter slogans.' };
    }

    try {
      const parsed = JSON.parse(rawContent);
      return {
        success: true,
        slogans: parsed.slogans || [],
        description: parsed.description || '',
      };
    } catch (parseError) {
      console.error('Failed to parse fighter slogans JSON:', parseError);
      return { success: false, error: 'Invalid JSON response from model.' };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio fighter slogans error:', error);
    return { success: false, error: 'Failed to generate fighter slogans.' };
  }
};

// ============================================================================
// NEW: Enhanced Tournament Commentary
// ============================================================================

export const generateTournamentCommentary = async (
  commentaryType: 'opening' | 'introduction' | 'transition' | 'progress' | 'championship' | 'conclusion',
  tournamentName: string,
  arenaName: string,
  currentMatch: number,
  totalMatches: number,
  fighterA?: string,
  fighterB?: string,
  winner?: string,
  tournamentContext?: {
    completedMatches: number;
    remainingFighters: string[];
    notableMoments: string[];
  }
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

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
            content: OPTIMIZED_TOURNAMENT_COMMENTARY_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: OPTIMIZED_TOURNAMENT_COMMENTARY_USER_PROMPT(
              commentaryType,
              tournamentName,
              arenaName,
              currentMatch,
              totalMatches,
              fighterA,
              fighterB,
              winner,
              tournamentContext
            ),
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
      console.error(`LM Studio tournament commentary API response error: ${response.status} ${errorBody}`);
      return `The ${tournamentName} tournament continues with exciting action in the ${arenaName} arena.`;
    }

    const data = await response.json();
    const commentary = data.choices[0]?.message?.content?.trim();
    
    return commentary || `The ${tournamentName} tournament continues with exciting action in the ${arenaName} arena.`;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio tournament commentary error:', error);
    return `The ${tournamentName} tournament continues with exciting action in the ${arenaName} arena.`;
  }
};

// ============================================================================
// NEW: Enhanced Arena Description
// ============================================================================

export const generateEnhancedArenaDescription = async (
  arenaName: string,
  imageDescription: string,
  arenaType?: string,
  existingFeatures?: string[]
): Promise<{ success: boolean; description?: Record<string, unknown>; error?: string }> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

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
            content: OPTIMIZED_ENHANCED_ARENA_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: OPTIMIZED_ENHANCED_ARENA_USER_PROMPT(arenaName, imageDescription, arenaType, existingFeatures),
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
        top_p: 0.85,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`LM Studio enhanced arena API response error: ${response.status} ${errorBody}`);
      return { success: false, error: `API Error: ${response.status} - ${errorBody}` };
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content?.trim();
    
    if (!rawContent) {
      return { success: false, error: 'The model did not return arena description.' };
    }

    try {
      const parsed = JSON.parse(rawContent);
      return { success: true, description: parsed };
    } catch (parseError) {
      console.error('Failed to parse enhanced arena JSON:', parseError);
      return { success: false, error: 'Invalid JSON response from model.' };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio enhanced arena error:', error);
    return { success: false, error: 'Failed to generate enhanced arena description.' };
  }
};

// ============================================================================
// ENHANCED: Battle Summary Generation (Updated)
// ============================================================================

export const generateEnhancedBattleSummary = async (
  fighterA: string,
  fighterB: string,
  winner: string,
  loser: string,
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
  totalRounds: number,
  arenaName?: string
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  // Log the enhanced battle summary request
  console.log(`[ENHANCED BATTLE SUMMARY] Generating summary for ${fighterA} vs ${fighterB}, winner: ${winner}, ${totalRounds} rounds`);

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
            content: OPTIMIZED_ENHANCED_BATTLE_SUMMARY_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: OPTIMIZED_ENHANCED_BATTLE_SUMMARY_USER_PROMPT(
              fighterA,
              fighterB,
              winner,
              loser,
              battleLog,
              totalRounds,
              arenaName
            ),
          },
        ],
        temperature: 0.6,
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
      console.error(`LM Studio enhanced battle summary API response error: ${response.status} ${errorBody}`);
      const fallback = `${fighterA} and ${fighterB} engaged in an epic ${totalRounds}-round battle in the ${arenaName || 'arena'}, with ${winner} emerging victorious over ${loser}.`;
      console.log(`[ENHANCED BATTLE SUMMARY] Using fallback: "${fallback}"`);
      return fallback;
    }

    const data = await response.json();
    const rawSummary = data.choices[0]?.message?.content?.trim();
    
    if (!rawSummary) {
      const fallback = `${fighterA} and ${fighterB} engaged in an epic ${totalRounds}-round battle in the ${arenaName || 'arena'}, with ${winner} emerging victorious over ${loser}.`;
      console.log(`[ENHANCED BATTLE SUMMARY] No summary returned, using fallback: "${fallback}"`);
      return fallback;
    }

    console.log(`[ENHANCED BATTLE SUMMARY] Generated: "${rawSummary}"`);
    return rawSummary;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio enhanced battle summary error:', error);
    const fallback = `${fighterA} and ${fighterB} engaged in an epic ${totalRounds}-round battle in the ${arenaName || 'arena'}, with ${winner} emerging victorious over ${loser}.`;
    console.log(`[ENHANCED BATTLE SUMMARY] Error, using fallback: "${fallback}"`);
    return fallback;
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
    // Calculate fighter statistics
    const totalFights = fighter.winLossRecord ? 
      fighter.winLossRecord.wins + fighter.winLossRecord.losses + fighter.winLossRecord.draws : 0;
    const winRate = totalFights > 0 ? 
      Math.round((fighter.winLossRecord!.wins / totalFights) * 100) : 0;
    
    // Determine fighter status
    const isVeteran = totalFights >= 10;
    const isRookie = totalFights <= 2;
    // const isHotStreak = fighter.winLossRecord && fighter.winLossRecord.wins >= 3 && 
    //   (fighter.winLossRecord.wins / Math.max(totalFights, 1)) > 0.7;
    // const isSlumping = fighter.winLossRecord && fighter.winLossRecord.losses >= 3 && 
    //   (fighter.winLossRecord.losses / Math.max(totalFights, 1)) > 0.7;
    // const hasStreak = fighter.winLossRecord && 
    //   (fighter.winLossRecord.wins >= 3 || fighter.winLossRecord.losses >= 3);
    
    const status = isVeteran ? 'Veteran' : isRookie ? 'Rookie' : 'Experienced';

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
            content: OPTIMIZED_FIGHTER_DESCRIPTION_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: OPTIMIZED_FIGHTER_DESCRIPTION_USER_PROMPT(fighter, totalFights, winRate, status),
          },
        ],
        temperature: 0.8,
        max_tokens: 150, // Reduced from 256
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

    const description = cleanStoryText(rawContent);
    
    // Ensure description is within character limit
    if (description.length > 180) {
      return description.substring(0, 177) + '...';
    }
    
    return description;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio fighter description error:', error);
    return `A formidable ${fighter.stats.size} ${fighter.stats.build} fighter with ${fighter.stats.strength} strength and ${fighter.stats.agility} agility.`;
  }
}; 