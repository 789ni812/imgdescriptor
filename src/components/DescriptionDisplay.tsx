import React from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface DescriptionDisplayProps {
  description: string | null;
  isLoading: boolean;
  error: string | null;
}

export function DescriptionDisplay({
  description,
  isLoading,
  error,
}: DescriptionDisplayProps) {
  return (
    <div
      data-testid="card-container"
      className="bg-white shadow-lg rounded-xl w-full h-full min-h-[80px] flex items-center justify-center p-6"
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