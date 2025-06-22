import React from 'react';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface DescriptionDisplayProps {
  description: string | null;
  error: string | null;
}

export function DescriptionDisplay({
  description,
  error,
}: DescriptionDisplayProps) {
  return (
    <div
      data-testid="card-container"
      className="bg-white shadow-lg rounded-xl w-full h-full min-h-[80px] flex items-center justify-center p-6"
    >
      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <p className="text-gray-800 text-lg leading-relaxed">
          {description || 'Description will appear here...'}
        </p>
      )}
    </div>
  );
} 