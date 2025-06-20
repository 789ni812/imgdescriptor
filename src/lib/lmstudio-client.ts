import { LMStudioClient } from '@lmstudio/sdk';

// LM Studio client singleton
let client: LMStudioClient | null = null;

export const getLMStudioClient = (): LMStudioClient => {
  if (!client) {
    client = new LMStudioClient();
  }
  return client;
};

export const analyzeImage = async (
  imageBase64: string,
  prompt: string
): Promise<{ success: boolean; description?: string; error?: string }> => {
  try {
    const client = getLMStudioClient();
    
    // Get the model (google/gemma-3-12b as specified in requirements)
    const model = await client.llm.model("google/gemma-3-12b");
    
    // Create the full prompt with image
    const fullPrompt = `${prompt}\n\nImage: [${imageBase64}]`;
    
    // Get response from the model
    const result = await model.respond(fullPrompt);
    
    return {
      success: true,
      description: result.content
    };
  } catch (error) {
    console.error('LM Studio analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Utility function to check if LM Studio is available
export const checkLMStudioConnection = async (): Promise<boolean> => {
  try {
    const client = getLMStudioClient();
    // Try to get model info to test connection
    await client.llm.model("google/gemma-3-12b");
    return true;
  } catch (error) {
    console.error('LM Studio connection failed:', error);
    return false;
  }
}; 