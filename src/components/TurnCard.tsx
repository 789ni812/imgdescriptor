import React, { useState } from 'react';
import type { Choice, ChoiceOutcome, CharacterStats } from '@/lib/types/character';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { Badge } from './ui/badge';
import { LoadingSpinner } from './ui/LoadingSpinner';
import Image from 'next/image';
import MarkdownRenderer from './ui/MarkdownRenderer';
import { StoryDisplay } from './StoryDisplay';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/card';

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
  summary?: string | null;
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
  summary,
}) => {
  // Accordions expanded by default only for current turn
  const defaultOpen = isCurrentTurn ? ['desc', 'story', 'choices'] : [];
  const [openSections, setOpenSections] = useState<string[]>(defaultOpen);

  return (
    <Card
      role="region"
      aria-label={`Turn ${turnNumber}`}
      className="mb-6"
      data-testid={`turn-card-${turnNumber}`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-lg text-card-foreground">Turn {turnNumber}</h2>
          <div className="flex gap-2">
            {Object.entries(characterStats).map(([stat, value]) => {
              const change = statChanges[stat as keyof CharacterStats];
              const variant = change && change !== 0
                ? change > 0 ? 'default' as const : 'destructive' as const
                : 'secondary' as const;
              return (
                <Badge
                  key={stat}
                  data-testid="stat-badge"
                  variant={variant}
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
            <Image
              src={imageUrl}
              alt={`Turn ${turnNumber} image`}
              width={300}
              height={200}
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
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <LoadingSpinner />
                  <span>Generating description...</span>
                </div>
              ) : imageDescription ? (
                <MarkdownRenderer content={imageDescription} />
              ) : (
                <div className="text-muted-foreground italic">Not available yet</div>
              )}
            </AccordionContent>
          </AccordionItem>
          {/* Story */}
          <AccordionItem value="story">
            <AccordionTrigger aria-expanded={openSections.includes('story') ? 'true' : 'false'}>
              Story
            </AccordionTrigger>
            <AccordionContent data-testid="story-content">
              <StoryDisplay story={story} isLoading={isStoryLoading} error={null} summary={summary} />
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
                <div className="text-muted-foreground italic">Not available yet</div>
              ) : isChoicesLoading ? (
                <div data-testid="choices-loader" className="flex items-center gap-2 py-4">
                  <LoadingSpinner /> <span>Generating choices...</span>
                </div>
              ) : choices && choices.length > 0 ? (
                <div className="space-y-3">
                  {choices.map((choice) => {
                    const isSelected = selectedChoiceId === choice.id;
                    return (
                      <Card key={choice.id} className={`${isSelected ? 'border-primary bg-primary/10' : ''}`}>
                        <CardContent className="p-3">
                          <div className="flex flex-col gap-2">
                            <div className="font-semibold flex items-center text-card-foreground">
                              {choice.text}
                              {isSelected && <Badge className="ml-2" variant="default">Selected</Badge>}
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
                              <Button
                                className="mt-1 self-end"
                                size="sm"
                                onClick={() => onSelectChoice && onSelectChoice(choice.id)}
                                aria-label={`Choose ${choice.text}`}
                              >
                                Choose
                              </Button>
                            )}
                            {/* Show outcome if this was the selected choice and outcome exists */}
                            {isSelected && choiceOutcome && (
                              <div className="mt-2 text-green-700 text-sm font-semibold">
                                Outcome: {choiceOutcome.outcome}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground italic">Not available yet</div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TurnCard; 