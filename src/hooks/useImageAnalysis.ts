import { useState } from 'react';

export function useImageAnalysis() {
  const [description, setDescription] = useState<string | null>(null);
  const [isDescriptionLoading, setIsDescriptionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = (file: File, prompt?: string) => {
    setIsDescriptionLoading(true);
    setError(null);
    setDescription(null);

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