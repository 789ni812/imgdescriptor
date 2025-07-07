import React, { useState } from 'react';
import { Button } from './ui/Button';
import { TemplateManager } from './TemplateManager';

interface BookMenuProps {
  onReset: () => void;
  currentTurn: number;
  hasContent: boolean;
}

export const BookMenu: React.FC<BookMenuProps> = ({
  onReset,
  currentTurn,
  hasContent,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onReset();
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 w-12 h-12 bg-amber-800/80 hover:bg-amber-700/80 backdrop-blur-sm rounded-full border-2 border-amber-600/50 hover:border-amber-500/70 transition-all duration-200 flex items-center justify-center"
        aria-label="Open game menu"
      >
        <svg className="w-6 h-6 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-lg shadow-2xl border-2 border-amber-300 dark:border-amber-700 max-w-md w-full p-6 text-amber-900 dark:text-amber-100">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-serif text-amber-800 dark:text-amber-200 mb-2">
                Adventure Menu
              </h2>
              <p className="text-amber-600 dark:text-amber-400 text-sm">
                Manage your journey
              </p>
            </div>

            {/* Menu Options */}
            <div className="space-y-4">
              {/* Save/Load Section */}
              <div className="bg-white dark:bg-amber-900/50 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                <h3 className="font-serif text-lg text-amber-800 dark:text-amber-200 mb-3">
                  Save & Load
                </h3>
                <div className="space-y-2">
                  <TemplateManager />
                </div>
              </div>

              {/* Game Controls */}
              <div className="bg-white dark:bg-amber-900/50 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                <h3 className="font-serif text-lg text-amber-800 dark:text-amber-200 mb-3">
                  Game Controls
                </h3>
                <div className="space-y-2">
                  {currentTurn > 1 && hasContent && (
                    <Button
                      onClick={handleReset}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      variant="destructive"
                    >
                      Start New Adventure
                    </Button>
                  )}
                  
                  <div className="text-center text-sm text-amber-600 dark:text-amber-400">
                    Turn {currentTurn} of 3
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setIsOpen(false)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                Close Menu
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 