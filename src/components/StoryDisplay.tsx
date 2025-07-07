import React from 'react';
import type { StoryDescription } from '@/lib/types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import MarkdownRenderer from './ui/MarkdownRenderer';
import { Card, CardContent } from '@/components/ui/card';

export function StoryDisplay({ story, isLoading, error, summary }: { story: StoryDescription | null, isLoading: boolean, error: string | null, summary?: string | null }) {
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
          <div className="space-y-4">
            {story.sceneTitle && (
              <div className="text-muted-foreground text-sm mb-1">Scene: <span className="font-semibold text-card-foreground">{story.sceneTitle}</span></div>
            )}
            {story.summary && (
              <div>
                <h3 className="font-semibold text-base mb-1">Summary</h3>
                <p className="text-card-foreground whitespace-pre-line">{story.summary}</p>
              </div>
            )}
            {story.dilemmas && story.dilemmas.length > 0 && (
              <div>
                <h3 className="font-semibold text-base mb-1">Key Dilemmas</h3>
                <ul className="list-disc ml-6 text-card-foreground whitespace-pre-line">
                  {story.dilemmas.map((d, i) => d && <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
            {story.cues && (
              <div>
                <h3 className="font-semibold text-base mb-1">Visual Cues</h3>
                <p className="italic text-muted-foreground whitespace-pre-line">{story.cues}</p>
              </div>
            )}
            {story.consequences && story.consequences.length > 0 && (
              <div>
                <h3 className="font-semibold text-base mb-1">Ongoing Consequences</h3>
                <ul className="list-disc ml-6 text-card-foreground whitespace-pre-line">
                  {story.consequences.map((c, i) => c && <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
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