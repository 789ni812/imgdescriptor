import React from 'react';
import type { StoryDisplayProps } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import MarkdownRenderer from './ui/MarkdownRenderer';
import { Card, CardContent } from '@/components/ui/card';

export function StoryDisplay({ story, isLoading, error, summary }: StoryDisplayProps) {
  // Always render the card container for consistent layout
  return (
    <Card
      data-testid="card-container"
      className="w-full h-full min-h-[180px] flex items-center justify-center"
    >
      <CardContent className="p-6 w-full">
        {error ? (
          <div className="text-destructive text-center">
            <p>{error}</p>
          </div>
        ) : isLoading ? (
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-muted-foreground mt-2">Generating story...</p>
          </div>
        ) : story ? (
          <div className="w-full">
            <MarkdownRenderer content={story} className="prose max-w-none" />
            {summary && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-card-foreground">Summary of Changes</h3>
                <MarkdownRenderer content={summary} className="prose max-w-none" />
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
} 