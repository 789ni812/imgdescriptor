import React from 'react';
import { Button } from './ui/Button';

interface InterfaceToggleProps {
  currentInterface: 'original' | 'gamebook';
  onToggle: (interfaceType: 'original' | 'gamebook') => void;
}

export const InterfaceToggle: React.FC<InterfaceToggleProps> = ({
  currentInterface,
  onToggle,
}) => {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white dark:bg-amber-900/50 rounded-lg shadow-lg border-2 border-amber-300 dark:border-amber-700 p-2">
        <div className="flex space-x-1">
          <Button
            onClick={() => onToggle('original')}
            className={`px-3 py-2 text-sm transition-all duration-200 ${
              currentInterface === 'original'
                ? 'bg-amber-600 text-white'
                : 'bg-transparent text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
            }`}
            variant="ghost"
            size="sm"
          >
            Original
          </Button>
          <Button
            onClick={() => onToggle('gamebook')}
            className={`px-3 py-2 text-sm transition-all duration-200 ${
              currentInterface === 'gamebook'
                ? 'bg-amber-600 text-white'
                : 'bg-transparent text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
            }`}
            variant="ghost"
            size="sm"
          >
            Gamebook
          </Button>
        </div>
      </div>
    </div>
  );
}; 