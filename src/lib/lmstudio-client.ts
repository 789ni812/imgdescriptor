import type { AnalysisResult, StoryResult } from './types';

const ANALYSIS_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const STORY_TIMEOUT_MS = 3 * 60 * 1000;    // 3 minutes

const DESCRIBER_MODEL = 'google/gemma-3-12b';
const WRITER_MODEL = 'gemma-the-writer';

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
            content: 'You are a highly skilled visual analyst AI. Given the image input, describe it in clear, detailed UK English. Focus on the following:\n- Objects or people present\n- Physical setting or location\n- Actions or events taking place\n- Style, mood, or any distinctive features\nAvoid assumptions. Only describe what is visibly present. Keep your description concise but comprehensive.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
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
    const description = data.choices[0]?.message?.content;

    if (!description) {
      return { success: false, error: 'The model did not return a description.' };
    }

    return { success: true, description };

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
};

export const generateStory = async (
  description: string,
): Promise<StoryResult> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), STORY_TIMEOUT_MS);

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
            content: "You are a creative storyteller. Based on the description of an image, write a short, engaging story (2-3 paragraphs). The story should be imaginative and suitable for a general audience. Use UK English spelling and grammar.",
          },
          {
            role: 'user',
            content: `Here is a description of an image, please write a short story based on it:\n\n${description}`,
          },
        ],
        temperature: 0.85,
        max_tokens: 2048,
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
    const story = data.choices[0]?.message?.content;

    if (!story) {
      return { success: false, error: 'The model did not return a story.' };
    }

    return { success: true, story };

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio story generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}; 