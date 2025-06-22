import React from 'react';

interface DevDebugWrapperProps {
  children: React.ReactNode;
  filename: string;
}

export const DevDebugWrapper: React.FC<DevDebugWrapperProps> = ({ children, filename }) => {
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  return (
    <div className="relative bg-white border border-gray-200  m-8 p-12">
      <div className="text-gray-200 text-xs m-8 p-12 relative">DevDebugWrapper</div>
      {children}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">
        {filename}
      </div>
    </div>
  );
}; 