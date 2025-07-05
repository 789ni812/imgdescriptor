import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import MarkdownRenderer from './ui/MarkdownRenderer';
import { DescriptionDisplayProps } from '@/lib/types';

export const DescriptionDisplay: React.FC<DescriptionDisplayProps> = ({ description, error }) => {
  if (error) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive" data-testid="error-message">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Image Description</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? (
          <MarkdownRenderer content={description} className="text-card-foreground leading-relaxed" />
        ) : (
          <p className="text-muted-foreground">Description will appear here...</p>
        )}
      </CardContent>
    </Card>
  );
}; 