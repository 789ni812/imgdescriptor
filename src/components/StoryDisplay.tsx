import React from 'react';
import ReactMarkdown from 'react-markdown';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import type { StoryDisplayProps } from '@/lib/types';

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, isLoading, error }) => {
  // Always render the card container for consistent layout
  return (
    <div
      data-testid="card-container"
      className="bg-white shadow-lg rounded-xl w-full h-full min-h-[180px] flex items-center justify-center p-6"
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : story ? (
        <div className="prose max-w-none w-full">
          <ReactMarkdown>{story}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}; 