import React from 'react';
import ReactMarkdown from 'react-markdown';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import type { StoryDisplayProps } from '@/lib/types';

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, isLoading, error }) => {
  // Render nothing if there's no activity
  if (!isLoading && !error && !story) {
    return null;
  }

  // Always prioritize loading state
  if (isLoading) {
    return (
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4 text-white">Generating Story...</h2>
        <div className="p-4 bg-gray-700 rounded-lg min-h-[150px] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Then show error state
  if (error) {
    return (
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4 text-white">Story Generation Failed</h2>
        <div className="p-4 bg-gray-700 rounded-lg min-h-[150px] flex items-center justify-center">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  // Finally, show the story
  if (story) {
    return (
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4 text-white">Generated Story</h2>
        <div className="p-4 bg-gray-700 rounded-lg min-h-[150px]">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{story}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }
  
  return null; // Should not be reached, but good for safety
}; 