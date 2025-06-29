export interface GameTemplate {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  type: 'game' | 'comics' | 'business' | 'education' | 'marketing';
  // Character config
  character: {
    persona: string;
    traits: string[];
    stats: {
      intelligence: number;
      creativity: number;
      perception: number;
      wisdom: number;
    };
    health: number;
    heartrate: number;
    age: number;
    level: number;
    experience: number;
  };
  // Image/story data
  images: {
    id: string;
    url: string;
    description: string;
    story: string;
    turn: number;
    uploadedAt: string;
  }[];
  // Prompts for AI generation
  prompts: {
    imageDescription: string;
    storyGeneration: string;
    finalStory: string;
    characterInitialization: string;
  };
  // App configuration
  config: {
    maxTurns: number;
    enableMarkdown: boolean;
    autoSave: boolean;
    theme: string;
    language: string;
  };
  // Final story (optional, if already generated)
  finalStory?: string;
  // UI/UX config
  fontFamily?: string;
  fontSize?: string;
  // Storage config
  folderLocation?: string;
}

export function importGameTemplate(template: GameTemplate) {
  return {
    character: template.character,
    imageHistory: template.images,
    finalStory: template.finalStory,
    fontFamily: template.fontFamily,
    fontSize: template.fontSize,
    folderLocation: template.folderLocation,
    templateId: template.id,
    templateName: template.name,
  };
}

// Validation functions
export function validateGameTemplate(template: GameTemplate): boolean {
  // Check required fields
  if (!template.id || !template.name || !template.version || !template.createdAt || !template.updatedAt) {
    return false;
  }

  // Check type field
  const validTypes = ['game', 'comics', 'business', 'education', 'marketing'] as const;
  if (!validTypes.includes(template.type)) {
    return false;
  }

  // Check character validation
  if (!validateCharacter(template.character)) {
    return false;
  }

  // Check prompts validation
  if (!validatePrompts(template.prompts)) {
    return false;
  }

  // Check config validation
  if (!validateConfig(template.config)) {
    return false;
  }

  // Check images validation
  if (!Array.isArray(template.images) || !template.images.every(validateImage)) {
    return false;
  }

  return true;
}

function validateCharacter(character: GameTemplate['character']): boolean {
  if (!character.persona || !Array.isArray(character.traits)) {
    return false;
  }

  // Validate stats (1-20 range)
  const stats = character.stats;
  if (stats.intelligence < 1 || stats.intelligence > 20 ||
      stats.creativity < 1 || stats.creativity > 20 ||
      stats.perception < 1 || stats.perception > 20 ||
      stats.wisdom < 1 || stats.wisdom > 20) {
    return false;
  }

  // Validate other character fields
  if (character.health < 0 || character.heartrate < 0 || character.age < 0 || 
      character.level < 1 || character.experience < 0) {
    return false;
  }

  return true;
}

function validatePrompts(prompts: GameTemplate['prompts']): boolean {
  return !!(prompts.imageDescription && prompts.storyGeneration && 
           prompts.finalStory && prompts.characterInitialization);
}

function validateConfig(config: GameTemplate['config']): boolean {
  return !!(config.maxTurns > 0 && typeof config.enableMarkdown === 'boolean' && 
           typeof config.autoSave === 'boolean' && config.theme && config.language);
}

function validateImage(image: GameTemplate['images'][0]): boolean {
  return !!(image.id && image.url && image.description && image.story && 
           image.turn > 0 && image.uploadedAt);
}

// Version compatibility
export function isTemplateVersionCompatible(version: string): boolean {
  const currentVersion = '1.0.0';
  const [major] = version.split('.').map(Number);
  const [currentMajor] = currentVersion.split('.').map(Number);
  
  // Allow same major version or newer
  return major >= currentMajor;
}

// Template creation utilities
export function createDefaultTemplate(name: string): GameTemplate {
  const now = new Date().toISOString();
  return {
    id: generateTemplateId(),
    name,
    version: '1.0.0',
    createdAt: now,
    updatedAt: now,
    type: 'game',
    character: {
      persona: 'Adventurer',
      traits: ['brave', 'curious'],
      stats: {
        intelligence: 10,
        creativity: 10,
        perception: 10,
        wisdom: 10,
      },
      health: 100,
      heartrate: 70,
      age: 25,
      level: 1,
      experience: 0,
    },
    images: [],
    prompts: {
      imageDescription: 'Describe this image in detail for an RPG adventure.',
      storyGeneration: 'Generate a story based on this image description.',
      finalStory: 'Create a cohesive final story combining all previous stories.',
      characterInitialization: 'Initialize a character based on this image.',
    },
    config: {
      maxTurns: 3,
      enableMarkdown: true,
      autoSave: true,
      theme: 'default',
      language: 'en',
    },
  };
}

export function cloneTemplate(template: GameTemplate, newName: string): GameTemplate {
  const now = new Date().toISOString();
  return {
    ...template,
    id: generateTemplateId(),
    name: newName,
    updatedAt: now,
    images: [], // Reset images for new game
    finalStory: undefined, // Reset final story
    type: template.type || 'game',
  };
}

function generateTemplateId(): string {
  return `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Template application system
export interface TemplateApplicationResult {
  success: boolean;
  gameState?: {
    currentTurn: number;
    character: GameTemplate['character'];
    imageHistory: GameTemplate['images'];
    finalStory?: string;
  };
  missingContent: string[];
  error?: string;
}

export function applyTemplate(template: GameTemplate): TemplateApplicationResult {
  // Validate template first
  if (!validateGameTemplate(template)) {
    return {
      success: false,
      missingContent: [],
      error: 'Invalid template: missing required fields or invalid data',
    };
  }

  // Check version compatibility
  if (!isTemplateVersionCompatible(template.version)) {
    return {
      success: false,
      missingContent: [],
      error: `Template version ${template.version} is not compatible with current version`,
    };
  }

  // Determine current turn based on image history
  const currentTurn = template.images.length > 0 
    ? Math.max(...template.images.map(img => img.turn))
    : 0;

  // Create game state
  const gameState = {
    currentTurn,
    character: template.character,
    imageHistory: template.images,
    finalStory: template.finalStory,
  };

  // Detect missing content
  const missingContent: string[] = [];
  const maxTurns = template.config.maxTurns;

  // If we have a final story, consider the template complete
  // (user might have chosen to end early or the game was designed for fewer turns)
  if (template.finalStory) {
    // No missing content if final story exists
    return {
      success: true,
      gameState,
      missingContent: [],
    };
  }

  // Check for missing images
  for (let turn = 1; turn <= maxTurns; turn++) {
    const hasImage = template.images.some(img => img.turn === turn);
    if (!hasImage) {
      missingContent.push(`turn-${turn}-image`);
    }
  }

  // Check for missing final story if we have some images but no final story
  // This covers both incomplete games and complete games without final story
  if (template.images.length > 0 && !template.finalStory) {
    missingContent.push('final-story');
  }

  return {
    success: true,
    gameState,
    missingContent,
  };
}

// Helper function to apply template to character store
export function applyTemplateToStore(template: GameTemplate, characterStore: {
  updateCharacter: (updates: Partial<{ 
    persona: string; 
    traits: string[]; 
    stats: { intelligence: number; creativity: number; perception: number; wisdom: number };
    health: number;
    heartrate: number;
    age: number;
    level: number;
    experience: number;
    currentTurn: number;
    imageHistory: GameTemplate['images'];
    finalStory?: string;
  }>) => void;
  addImageToHistory: (image: GameTemplate['images'][0]) => void;
}): boolean {
  const result = applyTemplate(template);
  
  if (!result.success || !result.gameState) {
    return false;
  }

  const { gameState } = result;

  // Update character state
  characterStore.updateCharacter({
    ...gameState.character,
    currentTurn: gameState.currentTurn,
  });

  // Clear existing image history and add template images
  characterStore.updateCharacter({ imageHistory: [] });
  gameState.imageHistory.forEach(image => {
    characterStore.addImageToHistory(image);
  });

  // Set final story if it exists
  if (gameState.finalStory) {
    // Note: You may need to add a setFinalStory action to the character store
    // For now, we'll store it in the character state
    characterStore.updateCharacter({ finalStory: gameState.finalStory });
  }

  return true;
}

// Helper function to create template from current game state
export function createTemplateFromCurrentState(
  name: string,
  characterStore: {
    character: {
      persona: string;
      traits: string[];
      stats: { intelligence: number; creativity: number; perception: number; wisdom: number };
      health: number;
      heartrate: number;
      age: number;
      level: number;
      experience: number;
      imageHistory: GameTemplate['images'];
      finalStory?: string;
    };
  },
  prompts: GameTemplate['prompts'],
  config: GameTemplate['config']
): GameTemplate {
  const character = characterStore.character;
  
  return {
    id: generateTemplateId(),
    name,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'game',
    character: {
      persona: character.persona,
      traits: character.traits,
      stats: character.stats,
      health: character.health,
      heartrate: character.heartrate,
      age: character.age,
      level: character.level,
      experience: character.experience,
    },
    images: character.imageHistory,
    prompts,
    config,
    finalStory: character.finalStory,
  };
} 