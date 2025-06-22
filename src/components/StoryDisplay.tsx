import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { StoryDisplayProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export function StoryDisplay({ story, isLoading, error }: StoryDisplayProps) {
  // Always render the card container for consistent layout
  return (
    <div
      data-testid="card-container"
      className="bg-white shadow-lg rounded-xl w-full h-full min-h-[180px] flex items-center justify-center p-6"
    >
      {isLoading ? (
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-500 mt-2">Generating story...</p>
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : story ? (
        <div className="prose max-w-none w-full">
          <ReactMarkdown>{story}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
} 