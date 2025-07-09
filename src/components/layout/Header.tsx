"use client";

import Link from 'next/link';
import HeaderSoundControls from './HeaderSoundControls';

export function Header() {
  return (
    <header data-testid="header" className="w-full bg-background shadow-md border-b border-border">
      <div className="container mx-auto px-4 py-0">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
              <h1 className="text-2xl font-bold text-primary font-sans">
                AI Image Describer
              </h1>
            </Link>
          </div>
          <HeaderSoundControls />
        </div>
      </div>
    </header>
  );
} 