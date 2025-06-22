import React from 'react';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface DescriptionDisplayProps {
  description: string | null;
  error: string | null;
}

export function DescriptionDisplay({
  description,
  error,
}: DescriptionDisplayProps) {
  return (
    <Card className="w-full h-full min-h-[80px]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Image Description
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorMessage message={error} />
        ) : (
          <p className="text-gray-800 leading-relaxed">
            {description || 'Description will appear here...'}
          </p>
        )}
      </CardContent>
    </Card>
  );
} 