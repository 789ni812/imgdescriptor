import React from 'react';
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
}) => {
  // Accordions expanded by default only for current turn
  const defaultOpen = isCurrentTurn ? ['desc', 'story', 'choices'] : [];

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
      <Accordion type="multiple" defaultValue={defaultOpen}>
        {/* Image Description */}
        <AccordionItem value="desc">
          <AccordionTrigger aria-expanded={isCurrentTurn ? 'true' : 'false'}>
            Image Description
          </AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm max-w-none">{imageDescription}</div>
          </AccordionContent>
        </AccordionItem>
        {/* Story */}
        <AccordionItem value="story">
          <AccordionTrigger aria-expanded={isCurrentTurn ? 'true' : 'false'}>
            Story
          </AccordionTrigger>
          <AccordionContent>
            {isStoryLoading ? (
              <div data-testid="story-loader" className="flex items-center gap-2 py-4">
                <LoadingSpinner /> <span>Generating story...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">{story}</div>
            )}
          </AccordionContent>
        </AccordionItem>
        {/* Choices */}
        <AccordionItem value="choices">
          <AccordionTrigger aria-expanded={isCurrentTurn ? 'true' : 'false'}>
            Choices
          </AccordionTrigger>
          <AccordionContent>
            {isChoicesLoading ? (
              <div data-testid="choices-loader" className="flex items-center gap-2 py-4">
                <LoadingSpinner /> <span>Generating choices...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {isCurrentTurn && !selectedChoiceId ? (
                  choices.map((choice) => (
                    <div key={choice.id} className="border rounded p-2 flex flex-col gap-1">
                      <div className="font-semibold">{choice.text}</div>
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
                      <button
                        className="mt-1 px-2 py-1 bg-primary text-primary-foreground rounded text-xs self-end"
                        onClick={() => onSelectChoice && onSelectChoice(choice.id)}
                        role="button"
                        aria-label={`Choose ${choice.text}`}
                      >
                        Choose
                      </button>
                    </div>
                  ))
                ) : (!isCurrentTurn && choiceOutcome) ? (
                  <div className="border rounded p-2">
                    <div className="font-semibold">{choiceOutcome.text}</div>
                    <div className="text-sm text-muted-foreground">{choiceOutcome.outcome}</div>
                  </div>
                ) : null}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default TurnCard; 