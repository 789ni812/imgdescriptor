export type GoodVsBadTheme = 'good-vs-bad' | 'yin-yang' | 'light-vs-dark' | 'hero-vs-villain';

// Enhanced villain personality system
export interface VillainPersonality {
  motivations: string[];
  fears: string[];
  strengths: string[];
  weaknesses: string[];
  backstory: string;
  goals: string[];
  speechStyle: string;
  dialoguePatterns: string[];
  relationshipWithPlayer: 'enemy' | 'rival' | 'corruptor' | 'manipulator' | 'mentor-gone-bad';
  influenceLevel: number; // 1-10 scale
  resources: string[];
  territory: string[];
}

// Enhanced villain state tracking
export interface VillainState {
  health: number; // 0-100
  resources: number; // 0-100
  influence: number; // 0-100
  anger: number; // 0-100
  respect: number; // 0-100 (for the player)
  memory: string[]; // Remembered player actions
  currentGoal: string;
  lastAction: string;
  territoryControl: string[];
}

// Enhanced conflict mechanics
export interface ConflictMechanics {
  escalationLevel: number; // 1-10
  confrontationType: 'verbal' | 'physical' | 'psychological' | 'strategic' | 'mixed';
  villainReactionStyle: 'aggressive' | 'manipulative' | 'calculating' | 'emotional' | 'strategic';
  playerAdvantage: number; // -10 to +10
  villainAdvantage: number; // -10 to +10
  conflictHistory: string[];
}

export interface GoodVsBadConfig {
  isEnabled: boolean;
  badProfilePicture: string | null;
  badDefinition: string;
  theme: GoodVsBadTheme;
  userRole: string;
  badRole: string;
  
  // Enhanced villain configuration
  villainPersonality?: VillainPersonality;
  villainState?: VillainState;
  conflictMechanics?: ConflictMechanics;
  
  // Advanced settings
  enableVillainDialogue: boolean;
  enableConflictEscalation: boolean;
  enableVillainMemory: boolean;
  enableTerritoryControl: boolean;
}

export interface GoodVsBadConfigOptions {
  isEnabled?: boolean;
  badProfilePicture?: string | null;
  badDefinition?: string;
  theme?: GoodVsBadTheme;
  userRole?: string;
  badRole?: string;
  
  // Enhanced options
  villainPersonality?: Partial<VillainPersonality>;
  villainState?: Partial<VillainState>;
  conflictMechanics?: Partial<ConflictMechanics>;
  
  // Advanced settings
  enableVillainDialogue?: boolean;
  enableConflictEscalation?: boolean;
  enableVillainMemory?: boolean;
  enableTerritoryControl?: boolean;
}

// Default villain personality for Darth Vader
export const DEFAULT_DARTH_VADER_PERSONALITY: VillainPersonality = {
  motivations: [
    'Maintain control and order in the galaxy',
    'Seek redemption through power',
    'Protect what he believes is right',
    'Dominate through fear and intimidation'
  ],
  fears: [
    'Losing control of his destiny',
    'Being betrayed by those he trusts',
    'Facing his past mistakes',
    'Weakness and vulnerability'
  ],
  strengths: [
    'Master of the Dark Side of the Force',
    'Exceptional combat skills',
    'Strategic military mind',
    'Intimidating presence and reputation'
  ],
  weaknesses: [
    'Internal conflict between light and dark',
    'Emotional vulnerability to family',
    'Over-reliance on fear and intimidation',
    'Difficulty trusting others'
  ],
  backstory: 'Once a promising Jedi Knight, Anakin Skywalker fell to the Dark Side and became Darth Vader, the feared enforcer of the Galactic Empire. His transformation was driven by fear of loss and desire for power to prevent it.',
  goals: [
    'Maintain Imperial control',
    'Find and eliminate threats to the Empire',
    'Seek personal redemption through dominance',
    'Protect the Empire from chaos and disorder'
  ],
  speechStyle: 'Deep, mechanical voice with formal, commanding tone. Uses "you" to address others and speaks with authority and menace.',
  dialoguePatterns: [
    'Threatening with measured calm',
    'Using formal titles and respect',
    'Offering ultimatums',
    'Referencing the power of the Dark Side',
    'Speaking of order and control'
  ],
  relationshipWithPlayer: 'enemy',
  influenceLevel: 9,
  resources: [
    'Imperial military forces',
    'Advanced technology and weapons',
    'Dark Side abilities',
    'Fear and intimidation',
    'Strategic intelligence network'
  ],
  territory: [
    'Imperial controlled systems',
    'Death Star and Imperial bases',
    'Galactic trade routes',
    'Core worlds under Imperial rule'
  ]
};

// Default villain state for Darth Vader
export const DEFAULT_DARTH_VADER_STATE: VillainState = {
  health: 85,
  resources: 90,
  influence: 95,
  anger: 30,
  respect: 20,
  memory: [],
  currentGoal: 'Maintain Imperial control and eliminate threats',
  lastAction: 'Monitoring Imperial operations',
  territoryControl: ['Imperial Core', 'Death Star', 'Major trade routes']
};

// Default conflict mechanics for Darth Vader
export const DEFAULT_DARTH_VADER_CONFLICT: ConflictMechanics = {
  escalationLevel: 5,
  confrontationType: 'mixed',
  villainReactionStyle: 'calculating',
  playerAdvantage: 0,
  villainAdvantage: 5,
  conflictHistory: []
};

export function createGoodVsBadConfig(options: GoodVsBadConfigOptions = {}): GoodVsBadConfig {
  const {
    isEnabled = false,
    badProfilePicture = null,
    badDefinition = '',
    theme = 'good-vs-bad',
    userRole = 'good',
    badRole = 'bad',
    villainPersonality,
    villainState,
    conflictMechanics,
    enableVillainDialogue = false,
    enableConflictEscalation = false,
    enableVillainMemory = false,
    enableTerritoryControl = false
  } = options;

  // Validate theme
  const validThemes: GoodVsBadTheme[] = ['good-vs-bad', 'yin-yang', 'light-vs-dark', 'hero-vs-villain'];
  const validatedTheme = validThemes.includes(theme) ? theme : 'good-vs-bad';

  // Validate roles (default to good/bad if empty)
  const validatedUserRole = userRole.trim() || 'good';
  const validatedBadRole = badRole.trim() || 'bad';

  // Merge villain personality with defaults
  const finalVillainPersonality = villainPersonality ? {
    ...DEFAULT_DARTH_VADER_PERSONALITY,
    ...villainPersonality
  } : DEFAULT_DARTH_VADER_PERSONALITY;

  // Merge villain state with defaults
  const finalVillainState = villainState ? {
    ...DEFAULT_DARTH_VADER_STATE,
    ...villainState
  } : DEFAULT_DARTH_VADER_STATE;

  // Merge conflict mechanics with defaults
  const finalConflictMechanics = conflictMechanics ? {
    ...DEFAULT_DARTH_VADER_CONFLICT,
    ...conflictMechanics
  } : DEFAULT_DARTH_VADER_CONFLICT;

  return {
    isEnabled,
    badProfilePicture,
    badDefinition,
    theme: validatedTheme,
    userRole: validatedUserRole,
    badRole: validatedBadRole,
    villainPersonality: finalVillainPersonality,
    villainState: finalVillainState,
    conflictMechanics: finalConflictMechanics,
    enableVillainDialogue,
    enableConflictEscalation,
    enableVillainMemory,
    enableTerritoryControl
  };
}

// Helper function to create Darth Vader specific configuration
export function createDarthVaderConfig(): GoodVsBadConfig {
  return createGoodVsBadConfig({
    isEnabled: true,
    badDefinition: 'Darth Vader, the feared Dark Lord of the Sith and enforcer of the Galactic Empire. A fallen Jedi who seeks to maintain order through fear and the power of the Dark Side.',
    theme: 'hero-vs-villain',
    userRole: 'Jedi Knight',
    badRole: 'Dark Lord of the Sith',
    villainPersonality: DEFAULT_DARTH_VADER_PERSONALITY,
    villainState: DEFAULT_DARTH_VADER_STATE,
    conflictMechanics: DEFAULT_DARTH_VADER_CONFLICT,
    enableVillainDialogue: true,
    enableConflictEscalation: true,
    enableVillainMemory: true,
    enableTerritoryControl: true
  });
}

// Helper function to update villain state based on player actions
export function updateVillainState(
  currentState: VillainState,
  playerAction: string,
  actionType: 'aggressive' | 'defensive' | 'diplomatic' | 'stealth' | 'confrontation'
): VillainState {
  const newState = { ...currentState };
  
  // Add action to memory
  newState.memory = [...newState.memory, `${actionType}: ${playerAction}`].slice(-10); // Keep last 10
  
  // Update state based on action type
  switch (actionType) {
    case 'aggressive':
      newState.anger = Math.min(100, newState.anger + 15);
      newState.respect = Math.max(0, newState.respect - 5);
      break;
    case 'defensive':
      newState.anger = Math.max(0, newState.anger - 5);
      newState.respect = Math.min(100, newState.respect + 5);
      break;
    case 'diplomatic':
      newState.anger = Math.max(0, newState.anger - 10);
      newState.respect = Math.min(100, newState.respect + 10);
      break;
    case 'stealth':
      newState.anger = Math.min(100, newState.anger + 20);
      newState.respect = Math.min(100, newState.respect + 5);
      break;
    case 'confrontation':
      newState.anger = Math.min(100, newState.anger + 25);
      newState.respect = Math.min(100, newState.respect + 15);
      break;
  }
  
  newState.lastAction = `Reacted to player's ${actionType} action`;
  return newState;
} 