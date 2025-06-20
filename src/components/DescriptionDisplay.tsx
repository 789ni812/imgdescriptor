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
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (description) {
    return (
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1m5-5l-1-1" />
      </svg>
      <p className="text-lg">Your image analysis will appear here.</p>
      <p className="text-sm">Upload an image to get started.</p>
    </div>
  );
}; 