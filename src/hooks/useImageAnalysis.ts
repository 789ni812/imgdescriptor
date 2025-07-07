import { useState, useCallback, useMemo } from 'react';
import { MOCK_IMAGE_DESCRIPTION, MOCK_IMAGE_DESCRIPTION_TEXT, TURN_BASED_MOCK_DATA } from '@/lib/config';
import { useCharacterStore } from '@/lib/stores/characterStore';
import { playGenerationSound } from '@/lib/utils/soundUtils';

// Types for dependency injection
interface ConfigDependencies {
  MOCK_IMAGE_DESCRIPTION: boolean;
  MOCK_IMAGE_DESCRIPTION_TEXT: string;
  TURN_BASED_MOCK_DATA: {
    imageDescriptions: Record<number, string>;
  };
}

interface StoreDependencies {
  character: {
    currentTurn: number;
  };
}

// Debug logging utility
const DEBUG = process.env.NODE_ENV === 'development';
const debugLog = (component: string, action: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[${component}] ${action}`, data || '');
  }
};

export function useImageAnalysis(
  configOverride?: ConfigDependencies,
  storeOverride?: StoreDependencies
) {
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [isDescriptionLoading, setIsDescriptionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Always call the hook unconditionally
  const storeFromHook = useCharacterStore();
  // Use injected dependencies or fall back to real modules
  const config = useMemo(() => configOverride || { MOCK_IMAGE_DESCRIPTION, MOCK_IMAGE_DESCRIPTION_TEXT, TURN_BASED_MOCK_DATA }, [configOverride]);
  const store = storeOverride || storeFromHook;
  const { character } = store;

  // Update both local state and global store
  const setDescriptionGlobal = useCallback((desc: string | undefined) => {
    setDescription(desc);
    if (storeFromHook.updateCurrentDescription) {
      storeFromHook.updateCurrentDescription(desc);
    }
  }, [storeFromHook]);

  const analyzeImage = useCallback(async (file: File, prompt?: string) => {
    debugLog('useImageAnalysis', 'Starting image analysis', { 
      fileName: file.name, 
      size: file.size, 
      prompt,
      mockMode: config.MOCK_IMAGE_DESCRIPTION 
    });
    
    setIsDescriptionLoading(true);
    setError(null);
    setDescriptionGlobal(undefined);

    // Mock mode: instantly return mock description
    if (config.MOCK_IMAGE_DESCRIPTION) {
      debugLog('useImageAnalysis', 'Using mock mode');
      setTimeout(() => {
        // Try to get turn-based mock data first
        const turnBasedDescription = config.TURN_BASED_MOCK_DATA.imageDescriptions[character.currentTurn as keyof typeof config.TURN_BASED_MOCK_DATA.imageDescriptions];
        debugLog('useImageAnalysis', 'Mock data lookup', { 
          currentTurn: character.currentTurn, 
          turnBasedDescription: !!turnBasedDescription 
        });
        
        // Use turn-based data if available, otherwise fall back to default
        const mockDescription = turnBasedDescription || config.MOCK_IMAGE_DESCRIPTION_TEXT;
        debugLog('useImageAnalysis', 'Mock description set', { 
          descriptionLength: mockDescription.length 
        });
        
        setDescriptionGlobal(mockDescription);
        setIsDescriptionLoading(false);
      }, 300); // Simulate a short delay
      return;
    }

    const defaultPrompt = 'Describe this image in detail.';
    const finalPrompt = prompt || defaultPrompt;
    debugLog('useImageAnalysis', 'Using real API mode', { finalPrompt });

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      try {
        debugLog('useImageAnalysis', 'File read successfully, sending API request');
        const base64Image = (reader.result as string).split(',')[1];
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Image,
            prompt: finalPrompt,
          }),
        });

        debugLog('useImageAnalysis', 'API response received', { 
          status: response.status, 
          ok: response.ok 
        });

        const data = await response.json();

        if (response.ok && data.success) {
          debugLog('useImageAnalysis', 'Analysis successful', { 
            descriptionLength: data.description?.length || 0 
          });
          setDescriptionGlobal(data.description);
          setError(null);
          playGenerationSound().catch(error => {
            console.warn('Failed to play image analysis sound:', error);
          });
        } else {
          debugLog('useImageAnalysis', 'API returned error', { error: data.error });
          setDescriptionGlobal(undefined);
          setError(data.error || 'Failed to analyze image');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        debugLog('useImageAnalysis', 'Analysis failed', { error: errorMessage });
        setDescriptionGlobal(undefined);
        setError('An unexpected error occurred during image analysis.');
      } finally {
        setIsDescriptionLoading(false);
      }
    };

    reader.onerror = () => {
      debugLog('useImageAnalysis', 'File read failed');
      setDescriptionGlobal(undefined);
      setError('Failed to read the image file.');
      setIsDescriptionLoading(false);
    };
  }, [config, character.currentTurn, setDescriptionGlobal]);

  return { description, isDescriptionLoading, error, analyzeImage };
} 