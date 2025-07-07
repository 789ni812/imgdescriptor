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
    temperature: 0.85,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
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
    // Try to parse the JSON object
    try {
      // Extract the first {...} block (the JSON object)
      const jsonMatch = rawContent.match(/{[\s\S]*}/);
      if (!jsonMatch) throw new Error('No JSON object found in LLM output');
      const jsonString = jsonMatch[0];
      let parsed;
      try {
        parsed = JSON.parse(jsonString);
      } catch {
        // Try to repair the JSON if initial parse fails
        try {
          const repaired = jsonrepair(jsonString);
          parsed = JSON.parse(repaired);
          console.warn('Story JSON was repaired and parsed successfully.');
        } catch (repairError) {
          console.error('Failed to repair and parse story JSON:', jsonString, repairError);
          // --- BEGIN REGEX FALLBACK EXTRACTION ---
          function extractFieldArray(raw: string, field: string): string[] {
            const match = raw.match(new RegExp(`"${field}"\\s*:\\s*\\[(.*?)\\]`, 's'));
            if (match) {
              // Try to split by quotes and commas
              return match[1]
                .split(/"\s*,\s*"/)
                .map((s: string) => s.replace(/(^\s*"|"\s*$)/g, '').trim())
                .filter(Boolean);
            }
            return [];
          }
          function extractFieldString(raw: string, field: string): string {
            const match = raw.match(new RegExp(`"${field}"\\s*:\\s*"(.*?)"`, 's'));
            return match ? match[1] : '';
          }
          const fallbackStory = {
            sceneTitle: extractFieldString(rawContent, 'sceneTitle'),
            summary: extractFieldString(rawContent, 'summary'),
            dilemmas: extractFieldArray(rawContent, 'dilemmas'),
            cues: extractFieldString(rawContent, 'cues'),
            consequences: extractFieldArray(rawContent, 'consequences'),
          };
          if (
            !fallbackStory.sceneTitle &&
            !fallbackStory.summary &&
            fallbackStory.dilemmas.length === 0 &&
            !fallbackStory.cues &&
            fallbackStory.consequences.length === 0
          ) {
            return { success: false, error: 'Failed to parse story JSON.' };
          }
          console.warn('Used regex fallback extraction for story JSON:', fallbackStory);
          return { success: true, story: fallbackStory };
          // --- END REGEX FALLBACK EXTRACTION ---
        }
      }
      // Fallbacks for missing or wrong-type fields
      const story = {
        sceneTitle: typeof parsed.sceneTitle === 'string' ? parsed.sceneTitle : '',
        summary: typeof parsed.summary === 'string' ? parsed.summary : '',
        dilemmas: Array.isArray(parsed.dilemmas)
          ? parsed.dilemmas
          : typeof parsed.dilemmas === 'string'
            ? [parsed.dilemmas]
            : [],
        cues: typeof parsed.cues === 'string' ? parsed.cues : '',
        consequences: Array.isArray(parsed.consequences)
          ? parsed.consequences
          : typeof parsed.consequences === 'string'
            ? [parsed.consequences]
            : [],
      };
      // If all fields are empty, treat as error
      if (
        !story.sceneTitle &&
        !story.summary &&
        story.dilemmas.length === 0 &&
        !story.cues &&
        story.consequences.length === 0
      ) {
        throw new Error('All story fields are empty after parsing.');
      }
      return { success: true, story };
    } catch (e) {
      console.error('Failed to robustly parse/repair story JSON:', rawContent, e);
      
      // LAST RESORT: Return a minimal valid story object to prevent UI crashes
      console.warn('Using last-resort fallback story due to parsing failure');
      const lastResortStory = {
        sceneTitle: 'Adventure Conclusion',
        summary: 'Your journey has reached its conclusion. Though the details may be unclear, your choices have shaped your destiny.',
        dilemmas: ['Reflect on your journey', 'Consider the consequences of your actions'],
        cues: 'The path ahead is uncertain, but your story continues.',
        consequences: ['Your adventure has left its mark on the world', 'Future encounters will remember your choices']
      };
      
      return { 
        success: true, 
        story: lastResortStory,
        warning: `Story generation encountered issues. Raw LLM output: ${rawContent.substring(0, 500)}${rawContent.length > 500 ? '...' : ''}`
      };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio story generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}; 