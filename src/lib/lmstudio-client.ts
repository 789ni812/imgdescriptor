export const analyzeImage = async (
  imageBase64: string,
  userPrompt: string,
): Promise<{ success: boolean; description?: string; error?: string }> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5-minute timeout

  try {
    const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'google/gemma-3-12b', // The model to use for the completion
        messages: [
          {
            role: 'system',
            content: `You are a highly skilled visual analyst AI. Given the image input, describe it in clear, detailed UK English. Focus on the following:
- Objects or people present
- Physical setting or location
- Actions or events taking place
- Style, mood, or any distinctive features
Avoid assumptions. Only describe what is visibly present. Keep your description concise but comprehensive.`,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('LM Studio API response error:', response.status, errorBody);
      return {
        success: false,
        error: `Failed to get a response from the model. Status: ${response.status}. ${errorBody}`,
      };
    }

    const result = await response.json();
    const description = result.choices[0]?.message?.content;

    if (!description) {
      return {
        success: false,
        error: 'The model did not return a description.',
      };
    }

    return {
      success: true,
      description,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('LM Studio analysis error:', error);

    let errorMessage = 'An unknown error occurred.';
    let isAbortError = false;

    if (error instanceof Error) {
      errorMessage = error.message;
      isAbortError = error.name === 'AbortError';
    }

    if (errorMessage.includes('fetch failed') || isAbortError) {
      return {
        success: false,
        error:
          'Could not connect to LM Studio. Please ensure the server is running, the correct model is loaded, and it is not being unloaded due to system memory pressure.',
      };
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}; 