import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { DescriptionDisplayProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export function DescriptionDisplay({
  description,
  isLoading,
  error,
}: DescriptionDisplayProps) {
  return (
    <div
      data-testid="card-container"
      className="bg-white shadow-lg rounded-xl w-full h-full min-h-[180px] flex items-center justify-center p-6"
    >
      {isLoading ? (
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-500 mt-2">Analyzing image...</p>
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <p className="text-gray-800 text-lg leading-relaxed">
          {description || 'Description will appear here...'}
        </p>
      )}
    </div>
  );
} 