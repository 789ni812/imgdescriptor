import React from 'react';
import type { DescriptionDisplayProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage'; // We will create this next

export const DescriptionDisplay: React.FC<DescriptionDisplayProps> = ({
  description,
  isLoading,
  error,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return <ErrorMessage message={error} />;
    }

    if (description) {
      return <p className="text-gray-700 whitespace-pre-wrap">{description}</p>;
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Your image description will appear here...</p>
      </div>
    );
  };

  return (
    <div className="w-full h-64 bg-gray-100 rounded-lg p-4 flex items-center justify-center overflow-y-auto">
      <div className="text-center">{renderContent()}</div>
    </div>
  );
}; 