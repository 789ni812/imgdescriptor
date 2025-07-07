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

const DESCRIBER_MODEL = 'google/gemma-3-4b';  // Smaller, faster model for image description
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
    temperature: 0.7, // Reduced from 0.85 for more consistent output
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0.1, // Added to reduce repetition
    presencePenalty: 0.1, // Added to encourage variety
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

    // Enhanced JSON parsing with multiple fallback strategies
    let parsed;
    let parseMethod = 'initial';

    try {
      // Method 1: Direct JSON parse
      parsed = JSON.parse(rawContent);
      parseMethod = 'direct';
    } catch (e1) {
      console.warn('[STORY JSON PARSE FAIL] Direct parse failed:', e1);
      
      try {
        // Method 2: Extract JSON object with regex
        const jsonMatch = rawContent.match(/{[\s\S]*}/);
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
          const jsonMatch = rawContent.match(/{[\s\S]*}/);
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
            parsed = extractStoryFields(rawContent);
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

    // Ensure all required fields exist
    const validatedStory = {
      sceneTitle: parsed.sceneTitle || 'Adventure Scene',
      summary: parsed.summary || 'Your adventure continues...',
      dilemmas: Array.isArray(parsed.dilemmas) ? parsed.dilemmas : ['Continue your journey'],
      cues: parsed.cues || 'The path ahead is uncertain.',
      consequences: Array.isArray(parsed.consequences) ? parsed.consequences : ['Your choices shape your destiny']
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