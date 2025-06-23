import React from 'react';
import type { StoryDisplayProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import MarkdownRenderer from './ui/MarkdownRenderer';

export function StoryDisplay({ story, isLoading, error }: StoryDisplayProps) {
  // Always render the card container for consistent layout
  return (
    <div
      data-testid="card-container"
      className="bg-white shadow-lg rounded-xl w-full h-full min-h-[180px] flex items-center justify-center p-6"
    >
      {error ? (
        <div className="text-red-600 text-center">
          <p>{error}</p>
        </div>
      ) : isLoading ? (
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-500 mt-2">Generating story...</p>
        </div>
      ) : story ? (
        <div className="w-full">
          <MarkdownRenderer content={story} className="prose max-w-none" />
        </div>
      ) : null}
    </div>
  );
} 