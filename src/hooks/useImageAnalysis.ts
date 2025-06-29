import { useState } from 'react';
import { MOCK_IMAGE_DESCRIPTION, MOCK_IMAGE_DESCRIPTION_TEXT, TURN_BASED_MOCK_DATA } from '@/lib/config';
import { useCharacterStore } from '@/lib/stores/characterStore';

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

export function useImageAnalysis(
  configOverride?: ConfigDependencies,
  storeOverride?: StoreDependencies
) {
  const [description, setDescription] = useState<string | null>(null);
  const [isDescriptionLoading, setIsDescriptionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Always call the hook unconditionally
  const storeFromHook = useCharacterStore();
  // Use injected dependencies or fall back to real modules
  const config = configOverride || { MOCK_IMAGE_DESCRIPTION, MOCK_IMAGE_DESCRIPTION_TEXT, TURN_BASED_MOCK_DATA };
  const store = storeOverride || storeFromHook;
  const { character } = store;

  // Update both local state and global store
  const setDescriptionGlobal = (desc: string | null) => {
    setDescription(desc);
    if (storeFromHook.updateCurrentDescription) {
      storeFromHook.updateCurrentDescription(desc);
    }
  };

  const analyzeImage = (file: File, prompt?: string) => {
    setIsDescriptionLoading(true);
    setError(null);
    setDescriptionGlobal(null);

    // Mock mode: instantly return mock description
    if (config.MOCK_IMAGE_DESCRIPTION) {
      setTimeout(() => {
        // Try to get turn-based mock data first
        const turnBasedDescription = config.TURN_BASED_MOCK_DATA.imageDescriptions[character.currentTurn as keyof typeof config.TURN_BASED_MOCK_DATA.imageDescriptions];
        // Debug log
        console.log('[DEBUG] useImageAnalysis: currentTurn =', character.currentTurn, 'turnBasedDescription =', turnBasedDescription);
        // Use turn-based data if available, otherwise fall back to default
        const mockDescription = turnBasedDescription || config.MOCK_IMAGE_DESCRIPTION_TEXT;
        setDescriptionGlobal(mockDescription);
        setIsDescriptionLoading(false);
      }, 300); // Simulate a short delay
      return;
    }

    const defaultPrompt = 'Describe this image in detail.';
    const finalPrompt = prompt || defaultPrompt;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      try {
        const base64Image = (reader.result as string).split(',')[1];
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Image,
            prompt: finalPrompt,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setDescriptionGlobal(data.description);
          setError(null);
        } else {
          setDescriptionGlobal(null);
          setError(data.error || 'Failed to analyze image');
        }
      } catch {
        setDescriptionGlobal(null);
        setError('An unexpected error occurred during image analysis.');
      } finally {
        setIsDescriptionLoading(false);
      }
    };

    reader.onerror = () => {
      setDescriptionGlobal(null);
      setError('Failed to read the image file.');
      setIsDescriptionLoading(false);
    };
  };

  return { description, isDescriptionLoading, error, analyzeImage };
} 