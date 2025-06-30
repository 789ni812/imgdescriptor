import React, { useState } from 'react';
import type { Choice, ChoiceOutcome, CharacterStats } from '@/lib/types/character';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { Badge } from './ui/badge';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface TurnCardProps {
  turnNumber: number;
  imageUrl: string;
  imageDescription: string;
  story: string;
  isStoryLoading: boolean;
  choices: Choice[];
  isChoicesLoading: boolean;
  selectedChoiceId?: string;
  choiceOutcome?: ChoiceOutcome;
  characterStats: CharacterStats;
  statChanges?: Partial<CharacterStats>;
  isCurrentTurn: boolean;
  onSelectChoice?: (choiceId: string) => void;
  isDescriptionLoading: boolean;
}

const statLabels: Record<keyof CharacterStats, string> = {
  intelligence: 'Intelligence',
  creativity: 'Creativity',
  perception: 'Perception',
  wisdom: 'Wisdom',
};

const TurnCard: React.FC<TurnCardProps> = ({
  turnNumber,
  imageUrl,
  imageDescription,
  story,
  isStoryLoading,
  choices,
  isChoicesLoading,
  selectedChoiceId,
  choiceOutcome,
  characterStats,
  statChanges = {},
  isCurrentTurn,
  onSelectChoice,
  isDescriptionLoading,
}) => {
  // Accordions expanded by default only for current turn
  const defaultOpen = isCurrentTurn ? ['desc', 'story', 'choices'] : [];
  const [openSections, setOpenSections] = useState<string[]>(defaultOpen);

  return (
    <section
      role="region"
      aria-label={`Turn ${turnNumber}`}
      className="rounded-lg border bg-card text-card-foreground shadow-md mb-6 p-4"
      data-testid={`turn-card-${turnNumber}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-lg">Turn {turnNumber}</h2>
        <div className="flex gap-2">
          {Object.entries(characterStats).map(([stat, value]) => {
            const change = statChanges[stat as keyof CharacterStats];
            return (
              <Badge
                key={stat}
                data-testid="stat-badge"
                className={
                  change && change !== 0
                    ? change > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    : 'bg-muted text-muted-foreground'
                }
              >
                {statLabels[stat as keyof CharacterStats]} {value}
                {change && change !== 0 ? (
                  <span className="ml-1">{change > 0 ? `+${change}` : change}</span>
                ) : null}
              </Badge>
            );
          })}
        </div>
      </div>
      {/* Image */}
      {imageUrl && (
        <div className="mb-2">
          <img
            src={imageUrl}
            alt={`Turn ${turnNumber} image`}
            className="rounded w-full max-w-xs mx-auto"
          />
        </div>
      )}
      {/* Accordions */}
      <Accordion type="multiple" value={openSections} onValueChange={setOpenSections}>
        {/* Image Description */}
        <AccordionItem value="desc">
          <AccordionTrigger aria-expanded={openSections.includes('desc') ? 'true' : 'false'}>
            Image Description
          </AccordionTrigger>
          <AccordionContent data-testid="desc-content">
            {isDescriptionLoading ? (
              <div className="flex items-center gap-2 text-gray-300 py-4">
                <LoadingSpinner />
                <span>Generating description...</span>
              </div>
            ) : imageDescription ? (
              <div className="prose prose-sm max-w-none">{imageDescription}</div>
            ) : (
              <div className="text-gray-400 italic">Not available yet</div>
            )}
          </AccordionContent>
        </AccordionItem>
        {/* Story */}
        <AccordionItem value="story">
          <AccordionTrigger aria-expanded={openSections.includes('story') ? 'true' : 'false'}>
            Story
          </AccordionTrigger>
          <AccordionContent data-testid="story-content">
            {isStoryLoading ? (
              <div data-testid="story-loader" className="flex items-center gap-2 py-4">
                <LoadingSpinner /> <span>Generating story...</span>
              </div>
            ) : story ? (
              <div className="prose prose-sm max-w-none">{story}</div>
            ) : (
              <div className="text-gray-400 italic">Not available yet</div>
            )}
          </AccordionContent>
        </AccordionItem>
        {/* Choices */}
        <AccordionItem value="choices">
          <AccordionTrigger aria-expanded={openSections.includes('choices') ? 'true' : 'false'}>
            Choices
          </AccordionTrigger>
          <AccordionContent data-testid="choices-content">
            {/* Only show loader or choices if story is present; otherwise, show Not available yet */}
            {!story ? (
              <div className="text-gray-400 italic">Not available yet</div>
            ) : isChoicesLoading ? (
              <div data-testid="choices-loader" className="flex items-center gap-2 py-4">
                <LoadingSpinner /> <span>Generating choices...</span>
              </div>
            ) : choices && choices.length > 0 ? (
              <div className="space-y-3">
                {choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  return (
                    <div key={choice.id} className={`border rounded p-2 flex flex-col gap-1 ${isSelected ? 'border-primary bg-primary/10' : ''}`}>
                      <div className="font-semibold flex items-center">
                        {choice.text}
                        {isSelected && <span className="ml-2 px-2 py-0.5 rounded bg-primary text-white text-xs">Selected</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">{choice.description}</div>
                      {choice.statRequirements && (
                        <div className="flex gap-1 flex-wrap">
                          {Object.entries(choice.statRequirements).map(([stat, val]) => (
                            <Badge key={stat} variant="outline" data-testid="stat-req-badge">
                              {statLabels[stat as keyof CharacterStats]}: {val}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {choice.consequences && (
                        <ul className="text-xs text-muted-foreground list-disc ml-4">
                          {choice.consequences.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      )}
                      {isCurrentTurn && !selectedChoiceId && (
                        <button
                          className="mt-1 px-2 py-1 bg-primary text-primary-foreground rounded text-xs self-end"
                          onClick={() => onSelectChoice && onSelectChoice(choice.id)}
                          role="button"
                          aria-label={`Choose ${choice.text}`}
                        >
                          Choose
                        </button>
                      )}
                      {/* Show outcome if this was the selected choice and outcome exists */}
                      {isSelected && choiceOutcome && (
                        <div className="mt-2 text-green-700 text-sm font-semibold">
                          Outcome: {choiceOutcome.outcome}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-400 italic">Not available yet</div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default TurnCard; 