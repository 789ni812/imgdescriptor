import { Character, StoryEntry, ChoiceOutcome } from './character';
import { PersonalityType } from './dungeonMaster';

// Game State Analysis Interface (from gameStatePrompts.ts)
export interface GameStateAnalysis {
  turnProgress: {
    current: number;
    total: number;
    percentage: number;
    remaining: number;
    phase: 'early' | 'middle' | 'late' | 'final';
  };
  storyThemes: string[];
  choicePatterns: {
    successRate: number;
    types: string[];
    recentTrends: string[];
  };
  performanceMetrics: {
    overall: 'excellent' | 'good' | 'average' | 'poor' | 'struggling';
    statPerformance: {
      intelligence: number;
      creativity: number;
      perception: number;
      wisdom: number;
    };
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  };
  adaptiveDifficulty: {
    current: 'easy' | 'medium' | 'hard' | 'extreme';
    trend: 'increasing' | 'stable' | 'decreasing';
    nextAdjustment: number;
  };
  narrativeCoherence: {
    score: number;
    themes: string[];
    consistency: 'high' | 'medium' | 'low';
  };
}

// Enhanced Image Entry with Partial State Support
export interface ImageEntry {
  id: string;
  url: string;
  description: string;
  turn: number;
  uploadedAt: string;
  story?: string; // Optional - may not be generated yet
  analysisStatus: 'pending' | 'analyzing' | 'complete' | 'failed';
  metadata?: {
    fileSize?: number;
    dimensions?: { width: number; height: number };
    format?: string;
  };
}

// Enhanced Choice Entry with Partial State Support
export interface ChoiceEntry {
  turn: number;
  choices: Array<{
    id: string;
    text: string;
    description: string;
    statRequirements: Partial<Record<keyof Character['stats'], number>>;
    consequences: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
  }>;
  selectedChoice?: {
    id: string;
    timestamp: string;
    outcome: string;
    statChanges: Partial<Record<keyof Character['stats'], number>>;
  };
  status: 'pending' | 'generated' | 'selected' | 'completed';
}

// DM Configuration with Partial State Support
export interface DMConfig {
  personality: PersonalityType;
  style: 'narrative' | 'challenging' | 'supportive' | 'mysterious';
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  freeformNotes?: string;
  customPrompts?: {
    [key: string]: string;
  };
  preferences?: {
    storyLength: 'short' | 'medium' | 'long';
    choiceComplexity: 'simple' | 'moderate' | 'complex';
    statFocus: 'balanced' | 'intelligence' | 'creativity' | 'perception' | 'wisdom';
  };
}

// Template Completeness Enum
export enum TemplateCompleteness {
  EMPTY = 'empty',
  PARTIAL = 'partial',
  COMPLETE = 'complete',
  FINISHED = 'finished'
}

// Game State Snapshot for Capturing State at Any Moment
export interface GameStateSnapshot {
  id: string;
  timestamp: string;
  turnNumber: number;
  phase: 'pre-image' | 'post-image' | 'post-story' | 'post-choices' | 'post-selection' | 'final';
  
  // Current game state
  character: Character;
  currentImage?: ImageEntry;
  currentStory?: string;
  currentChoices?: ChoiceEntry['choices'];
  selectedChoice?: ChoiceEntry['selectedChoice'];
  
  // Historical data
  completedImages: ImageEntry[];
  completedStories: StoryEntry[];
  completedChoices: ChoiceOutcome[];
  
  // Configuration
  dmConfig?: DMConfig;
  gameConfig: {
    maxTurns: number;
    difficulty: string;
    [key: string]: unknown;
  };
  
  // Analysis data
  gameStateAnalysis?: GameStateAnalysis;
  
  // Metadata
  sessionDuration: number; // minutes
  saveReason: 'auto' | 'manual' | 'checkpoint' | 'error';
  notes?: string;
}

// Enhanced Partial Template Interface
export interface PartialTemplate {
  // Basic template info
  id: string;
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  type: 'game' | 'template' | 'checkpoint';
  
  // Character data
  character: Character;
  
  // Game data (all optional for partial state support)
  images: ImageEntry[];
  storyHistory: StoryEntry[];
  choiceHistory: ChoiceOutcome[];
  choicesHistory: ChoiceEntry[];
  
  // Final story (optional - only present when game is finished)
  finalStory?: string;
  
  // Configuration
  config: {
    maxTurns: number;
    [key: string]: unknown;
  };
  
  // DM Configuration (optional)
  dmConfig?: DMConfig | null;
  
  // Game state analysis (optional)
  gameStateAnalysis?: GameStateAnalysis;
  
  // Prompts used (optional)
  prompts?: {
    [key: string]: string;
  };
  
  // Completeness indicator
  completeness: TemplateCompleteness;
  
  // Metadata
  tags?: string[];
  description?: string;
  estimatedCompletionTime?: number; // minutes
  lastPlayedAt?: string;
  playCount?: number;
}

// Template Validation Result
export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completeness: TemplateCompleteness;
  canResume: boolean;
  resumePoint?: string;
  estimatedTimeToComplete: number; // minutes
}

// Template Progress Information
export interface TemplateProgressInfo {
  percentage: number;
  completedTurns: number;
  totalTurns: number;
  remainingTurns: number;
  currentPhase: 'not-started' | 'early' | 'middle' | 'late' | 'final';
  milestones: string[];
  nextAction: string;
  estimatedTimeRemaining: number; // minutes
}

// Template Summary for UI Display
export interface TemplateSummary {
  id: string;
  name: string;
  completeness: TemplateCompleteness;
  progress: number;
  lastUpdated: string;
  estimatedTime: number; // minutes
  canResume: boolean;
  characterName: string;
  turnCount: number;
  hasFinalStory: boolean;
}

// Template Export/Import Format
export interface TemplateExportData {
  version: string;
  exportedAt: string;
  template: PartialTemplate;
  metadata: {
    exportReason: 'backup' | 'share' | 'migration' | 'manual';
    sourceVersion: string;
    targetVersion?: string;
    notes?: string;
  };
}

// Template Migration Result
export interface TemplateMigrationResult {
  success: boolean;
  migratedTemplate?: PartialTemplate;
  errors: string[];
  warnings: string[];
  changes: string[];
  compatibility: 'full' | 'partial' | 'none';
} 