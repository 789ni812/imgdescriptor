import React from 'react';

export const Button = ({ children, onClick, disabled }: { children: React.ReactNode, onClick?: () => void, disabled?: boolean }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}; 