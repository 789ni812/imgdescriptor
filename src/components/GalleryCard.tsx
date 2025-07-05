import React from 'react';
import Image from 'next/image';
// If shadcn Accordion is not present, this will fail and remind us to add it
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import MarkdownRenderer from './ui/MarkdownRenderer';
import { Card, CardContent } from './ui/card';

export interface GalleryCardProps {
  id: string;
  url: string;
  description: string;
  story: string;
  turn: number;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({ url, description, story }) => {
  // Debug: log the description string to inspect markdown
  console.log('GalleryCard description:', description);
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-center mb-2">
          <Image
            src={url}
            alt="gallery image"
            width={128}
            height={128}
            className="object-contain max-h-32 max-w-full"
          />
        </div>
        <Accordion type="single" defaultValue="story" collapsible>
          <AccordionItem value="description">
            <AccordionTrigger>Image Description</AccordionTrigger>
            <AccordionContent>
              <MarkdownRenderer content={description || '*No description available.*'} className="prose max-w-none" />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="story">
            <AccordionTrigger>Image Story</AccordionTrigger>
            <AccordionContent>
              <MarkdownRenderer content={story || '*No story available.*'} className="prose max-w-none" />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}; 