import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="text-center">
      <p className="text-destructive font-semibold">Error</p>
      <p className="text-destructive mt-1">{message}</p>
    </div>
  );
}; 