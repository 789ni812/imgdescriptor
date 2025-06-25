import React from 'react';
import Image from 'next/image';
// If shadcn Accordion is not present, this will fail and remind us to add it
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';

export interface GalleryCardProps {
  id: string;
  url: string;
  description: string;
  story: string;
  turn: number;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({ url, description, story }) => {
  return (
    <div className="rounded border border-gray-700 bg-gray-800 p-4">
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
            <div>{description || <em>No description available.</em>}</div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="story">
          <AccordionTrigger>Image Story</AccordionTrigger>
          <AccordionContent>
            <div>{story || <em>No story available.</em>}</div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}; 