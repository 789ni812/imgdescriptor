'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCharacterStore } from '@/lib/stores/characterStore';
import type { Choice, ChoiceOutcome } from '@/lib/types/character';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ChoiceDisplayProps {
  choices?: Choice[];
  outcomes?: ChoiceOutcome[];
  className?: string;
  isLoading?: boolean;
}

export function ChoiceDisplay({ choices = [], outcomes = [], className = '', isLoading = false }: ChoiceDisplayProps) {
  const { makeChoice } = useCharacterStore();

  const handleChoiceSelect = (choiceId: string) => {
    makeChoice(choiceId);
  };

  const renderStatChange = (stat: string, value: number) => {
    const sign = value > 0 ? '+' : '';
    const color = value > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    return (
      <Badge key={stat} className={`${color} mr-2`}>
        {stat} {sign}{value}
      </Badge>
    );
  };

  const renderStatRequirement = (stat: string, value: number) => {
    return (
      <Badge key={stat} variant="outline" className="mr-2">
        Requires {stat}: {value}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Make a Choice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2">Generating choices...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (choices.length === 0 && outcomes.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Choices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No choices available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Choices */}
      {choices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Make a Choice</CardTitle>
            <CardDescription>Your decision will affect your character&apos;s journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {choices.map((choice) => (
              <div key={choice.id || `${choice.text}-${choice.type || ''}-${choice.statRequirements ? Object.values(choice.statRequirements).join('-') : ''}-${Date.now()}`}
                className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{choice.text}</h4>
                    {choice.description && (
                      <p className="text-sm text-muted-foreground mt-1">{choice.description}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleChoiceSelect(choice.id)}
                    className="ml-4"
                    size="sm"
                  >
                    Choose
                  </Button>
                </div>
                
                {/* Stat Requirements */}
                {choice.statRequirements && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(choice.statRequirements).map(([stat, value]) =>
                      renderStatRequirement(stat, value)
                    )}
                  </div>
                )}
                
                {/* Consequences */}
                {choice.consequences && choice.consequences.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Consequences:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {choice.consequences.map((consequence, index) => (
                        <li key={index}>• {consequence}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Choice Outcomes */}
      {outcomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Choices</CardTitle>
            <CardDescription>Outcomes of your decisions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outcomes.map((outcome) => (
              <div key={outcome.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{outcome.text}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{outcome.outcome}</p>
                  </div>
                  <div className="text-xs text-muted-foreground ml-4">
                    Turn {outcome.turnNumber}
                  </div>
                </div>
                
                {/* Stat Changes */}
                {outcome.statChanges && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(outcome.statChanges).map(([stat, value]) =>
                      renderStatChange(stat, value)
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 