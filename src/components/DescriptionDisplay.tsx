import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { DescriptionDisplayProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export const DescriptionDisplay: React.FC<DescriptionDisplayProps> = ({
  description,
  isLoading,
  error,
}) => {
  return (
    <div
      data-testid="card-container"
      className="bg-white shadow-lg rounded-xl w-full h-full min-h-[180px] flex items-center justify-center p-6"
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : description ? (
        <div className="prose prose-invert max-w-none w-full">
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1m5-5l-1-1" />
          </svg>
          <p className="text-lg">Your image analysis will appear here.</p>
          <p className="text-sm">Upload an image to get started.</p>
        </div>
      )}
    </div>
  );
}; 