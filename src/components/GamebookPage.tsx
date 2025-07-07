import React from 'react';
import Image from 'next/image';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';

import type { StoryDescription, ImageDescription } from '@/lib/types';
import type { Choice } from '@/lib/types/character';

interface GamebookPageProps {
  turnNumber: number;
  imageUrl: string;
  imageDescription: ImageDescription | null;
  story: StoryDescription | null;
  isStoryLoading: boolean;
  choices: Choice[];
  isChoicesLoading: boolean;
  onSelectChoice?: (choiceId: string) => void;
  isDescriptionLoading: boolean;
  isCurrentTurn: boolean;
}

export const GamebookPage: React.FC<GamebookPageProps> = ({
  turnNumber,
  imageUrl,
  imageDescription,
  story,
  isStoryLoading,
  choices,
  isChoicesLoading,
  onSelectChoice,
  isDescriptionLoading,
  isCurrentTurn,
}) => {
  // Only render if this is the current turn or has content
  if (!isCurrentTurn && !story && !imageDescription) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-lg shadow-lg border border-amber-200 dark:border-amber-800 p-8 mb-8">
      {/* Turn Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif text-amber-800 dark:text-amber-200">
          Chapter {turnNumber}
        </h2>
        {isCurrentTurn && (
          <div className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Your adventure continues...
          </div>
        )}
      </div>

      {/* Image and Description Section */}
      {imageUrl && (
        <div className="mb-8 text-center">
          <div className="relative w-full max-w-2xl mx-auto mb-4">
            <Image
              src={imageUrl}
              alt="Adventure scene"
              width={800}
              height={600}
              className="rounded-lg shadow-md border-2 border-amber-300 dark:border-amber-700"
              priority={isCurrentTurn}
            />
          </div>
          
          {/* Image Description */}
          {imageDescription && (
            <div className="text-left max-w-2xl mx-auto">
              <div className="bg-white dark:bg-amber-900/50 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                <h3 className="font-serif text-lg text-amber-800 dark:text-amber-200 mb-2">
                  Scene Description
                </h3>
                <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                  {imageDescription.setting}
                </p>
                {imageDescription.mood && (
                  <p className="text-amber-600 dark:text-amber-400 italic mt-2">
                    {imageDescription.mood}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Story Section */}
      <div className="mb-8">
        {isStoryLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-amber-600 dark:text-amber-400 mt-4 font-serif">
              The Dungeon Master is crafting your story...
            </p>
          </div>
        ) : story ? (
          <div className="bg-white dark:bg-amber-900/50 rounded-lg p-6 border border-amber-200 dark:border-amber-700">
            {/* Scene Title */}
            {story.sceneTitle && (
              <h3 className="font-serif text-xl text-amber-800 dark:text-amber-200 mb-4 text-center">
                {story.sceneTitle}
              </h3>
            )}
            
            {/* Main Story Text */}
            <div className="prose prose-amber max-w-none">
              <div className="text-amber-700 dark:text-amber-300 leading-relaxed text-lg font-serif">
                {story.summary}
              </div>
            </div>

            {/* Visual Cues */}
            {story.cues && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border-l-4 border-amber-400">
                <p className="text-amber-600 dark:text-amber-400 italic font-serif">
                  <strong>Look for:</strong> {story.cues}
                </p>
              </div>
            )}

            {/* Key Dilemmas */}
            {story.dilemmas && story.dilemmas.length > 0 && (
              <div className="mt-6">
                <h4 className="font-serif text-lg text-amber-800 dark:text-amber-200 mb-3">
                  Key Decisions
                </h4>
                <ul className="space-y-2">
                  {story.dilemmas.map((dilemma, index) => (
                    <li key={index} className="text-amber-700 dark:text-amber-300 font-serif">
                      • {dilemma}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : isDescriptionLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-amber-600 dark:text-amber-400 mt-4 font-serif">
              Analyzing the scene...
            </p>
          </div>
        ) : null}
      </div>

      {/* Choices Section */}
      {story && (
        <div className="mt-8">
          {isChoicesLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="text-amber-600 dark:text-amber-400 mt-4 font-serif">
                Preparing your choices...
              </p>
            </div>
          ) : choices && choices.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-serif text-xl text-amber-800 dark:text-amber-200 text-center mb-6">
                What will you do?
              </h3>
              <div className="grid gap-4 max-w-2xl mx-auto">
                {choices.map((choice, index) => (
                  <Button
                    key={choice.id}
                    onClick={() => onSelectChoice?.(choice.id)}
                    className="w-full p-6 text-left bg-white dark:bg-amber-900/50 border-2 border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/70 transition-all duration-200"
                    variant="ghost"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center text-amber-800 dark:text-amber-200 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-serif text-lg text-amber-800 dark:text-amber-200 mb-2">
                          {choice.text}
                        </div>
                        {choice.description && (
                          <div className="text-amber-600 dark:text-amber-400 text-sm">
                            {choice.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}; 