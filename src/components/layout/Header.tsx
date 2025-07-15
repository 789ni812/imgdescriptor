"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HeaderSoundControls from './HeaderSoundControls';

export function Header() {
  const pathname = usePathname();

  return (
    <header data-testid="header" className="w-full bg-background shadow-md border-b border-border">
      <div className="container mx-auto px-4 py-0">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
              <h1 className="text-2xl font-bold text-primary font-sans">
                AI Image Describer
              </h1>
            </Link>
            
            {/* Navigation Links */}
            <nav className="flex items-center space-x-6">
              <Link 
                href="/tournament" 
                className={`text-sm font-medium transition-colors ${
                  pathname === '/tournament' 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                Tournament
              </Link>
              <Link 
                href="/leaderboard" 
                className={`text-sm font-medium transition-colors ${
                  pathname === '/leaderboard' 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                Leaderboard
              </Link>
              <Link 
                href="/playervs" 
                className={`text-sm font-medium transition-colors ${
                  pathname === '/playervs' 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                Battle Arena
              </Link>
            </nav>
          </div>
          <HeaderSoundControls />
        </div>
      </div>
    </header>
  );
} 