import { useState } from 'react';
import { MOCK_IMAGE_DESCRIPTION, MOCK_IMAGE_DESCRIPTION_TEXT, TURN_BASED_MOCK_DATA } from '@/lib/config';
import { useCharacterStore } from '@/lib/stores/characterStore';

export function useImageAnalysis() {
  const [description, setDescription] = useState<string | null>(null);
  const [isDescriptionLoading, setIsDescriptionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { character } = useCharacterStore();

  const analyzeImage = (file: File, prompt?: string) => {
    setIsDescriptionLoading(true);
    setError(null);
    setDescription(null);

    // Mock mode: instantly return mock description
    if (MOCK_IMAGE_DESCRIPTION) {
      setTimeout(() => {
        // Try to get turn-based mock data first
        const turnBasedDescription = TURN_BASED_MOCK_DATA.imageDescriptions[character.currentTurn as keyof typeof TURN_BASED_MOCK_DATA.imageDescriptions];
        // Debug log
        console.log('[DEBUG] useImageAnalysis: currentTurn =', character.currentTurn, 'turnBasedDescription =', turnBasedDescription);
        // Use turn-based data if available, otherwise fall back to default
        const mockDescription = turnBasedDescription || MOCK_IMAGE_DESCRIPTION_TEXT;
        setDescription(mockDescription);
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
          setDescription(data.description);
        } else {
          setError(data.error || 'An unknown error occurred.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`An unexpected error occurred: ${errorMessage}`);
      } finally {
        setIsDescriptionLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read the image file.');
      setIsDescriptionLoading(false);
    };
  };

  return { description, isDescriptionLoading, error, analyzeImage };
} 