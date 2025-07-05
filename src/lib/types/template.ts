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
  // Debug configuration for fine-tuning user experience
  debugConfig: {
    // Story generation settings
    storyLength: 'short' | 'medium' | 'long' | 'epic';
    storyLengthCustom?: number; // Optional: custom token/word count
    choiceCount: 2 | 3 | 4 | 5;
    enableVerboseLogging: boolean;
    summaryEnabled: boolean; // New: enable summary bullet list
    
    // Performance monitoring
    performanceMetrics: {
      enabled: boolean;
      trackStoryGeneration: boolean;
      trackChoiceGeneration: boolean;
      trackImageAnalysis: boolean;
      trackDMReflection: boolean;
    };
    
    // AI response tuning
    aiResponseTuning: {
      temperature: number; // 0.0 to 2.0
      maxTokens: number; // 512 to 4096
      topP: number; // 0.0 to 1.0
      frequencyPenalty: number; // -2.0 to 2.0
      presencePenalty: number; // -2.0 to 2.0
    };
    
    // User experience fine-tuning
    userExperience: {
      storyPacing: 'slow' | 'medium' | 'fast';
      choiceComplexity: 'simple' | 'moderate' | 'complex';
      narrativeDepth: 'light' | 'medium' | 'deep';
      characterDevelopment: 'low' | 'medium' | 'high';
      moralComplexity: 'simple' | 'medium' | 'complex';
    };
    
    // Testing and development
    testing: {
      enableMockMode: boolean;
      mockResponseDelay: number; // milliseconds
      enableStressTesting: boolean;
      maxConcurrentRequests: number;
    };
  };
  // Final story (optional, if already generated)
  finalStory?: string;
  // UI/UX config
  fontFamily?: string;
  fontSize?: string;
  // Storage config
  folderLocation?: string;
  // DM config (optional)
  dmConfig?: {
    personality?: unknown;
    quizAnswers?: Record<string, string>;
    [key: string]: unknown;
  };
  // Add choicesHistory to template
  choicesHistory?: import('./character').ChoicesHistoryEntry[];
  // Add choiceHistory to template
  choiceHistory?: import('./character').ChoiceOutcome[];
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
    console.log('Validation failed: missing required fields');
    return false;
  }

  // Check type field
  const validTypes = ['game', 'comics', 'business', 'education', 'marketing'] as const;
  if (!validTypes.includes(template.type)) {
    console.log('Validation failed: invalid type field', template.type);
    return false;
  }

  // Check character validation
  if (!validateCharacter(template.character)) {
    console.log('Validation failed: invalid character');
    return false;
  }

  // Check prompts validation
  if (!validatePrompts(template.prompts)) {
    console.log('Validation failed: invalid prompts');
    return false;
  }

  // Check config validation
  if (!validateConfig(template.config)) {
    console.log('Validation failed: invalid config');
    return false;
  }

  // Check debug config validation
  if (!validateDebugConfig(template.debugConfig)) {
    console.log('Validation failed: invalid debug config');
    return false;
  }

  // Check images validation
  if (!Array.isArray(template.images) || !template.images.every(validateImage)) {
    console.log('Validation failed: invalid images');
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

function validateDebugConfig(debugConfig: GameTemplate['debugConfig']): boolean {
  // If debugConfig is undefined, use default values
  if (!debugConfig) {
    console.log('Debug config is undefined, using default validation');
    return true; // We'll provide defaults in the template creation
  }
  
  // Validate story length
  const validStoryLengths = ['short', 'medium', 'long', 'epic'] as const;
  if (!validStoryLengths.includes(debugConfig.storyLength)) {
    console.log('Debug config validation failed: invalid story length', debugConfig.storyLength);
    return false;
  }
  
  // Validate storyLengthCustom if present
  if (debugConfig.storyLengthCustom !== undefined && (typeof debugConfig.storyLengthCustom !== 'number' || debugConfig.storyLengthCustom <= 0)) {
    console.log('Debug config validation failed: invalid storyLengthCustom', debugConfig.storyLengthCustom);
    return false;
  }
  
  // Validate summaryEnabled
  if (typeof debugConfig.summaryEnabled !== 'boolean') {
    console.log('Debug config validation failed: summaryEnabled must be boolean', debugConfig.summaryEnabled);
    return false;
  }
  
  // Validate choice count
  const validChoiceCounts = [2, 3, 4, 5] as const;
  if (!validChoiceCounts.includes(debugConfig.choiceCount)) {
    console.log('Debug config validation failed: invalid choice count', debugConfig.choiceCount);
    return false;
  }
  
  // Validate AI response tuning
  const tuning = debugConfig.aiResponseTuning;
  if (tuning.temperature < 0.0 || tuning.temperature >= 2.0) {
    console.log('Debug config validation failed: invalid temperature', tuning.temperature);
    return false;
  }
  if (tuning.maxTokens < 512 || tuning.maxTokens > 4096) {
    console.log('Debug config validation failed: invalid maxTokens', tuning.maxTokens);
    return false;
  }
  if (tuning.topP < 0.0 || tuning.topP > 1.0) {
    console.log('Debug config validation failed: invalid topP', tuning.topP);
    return false;
  }
  if (tuning.frequencyPenalty < -2.0 || tuning.frequencyPenalty > 2.0) {
    console.log('Debug config validation failed: invalid frequencyPenalty', tuning.frequencyPenalty);
    return false;
  }
  if (tuning.presencePenalty < -2.0 || tuning.presencePenalty > 2.0) {
    console.log('Debug config validation failed: invalid presencePenalty', tuning.presencePenalty);
    return false;
  }
  
  // Validate user experience settings
  const ux = debugConfig.userExperience;
  const validPacing: readonly ('slow' | 'medium' | 'fast')[] = ['slow', 'medium', 'fast'];
  const validComplexity: readonly ('simple' | 'moderate' | 'complex')[] = ['simple', 'moderate', 'complex'];
  const validMoralComplexity: readonly ('simple' | 'medium' | 'complex')[] = ['simple', 'medium', 'complex'];
  const validDepth: readonly ('light' | 'medium' | 'deep')[] = ['light', 'medium', 'deep'];
  const validDevelopment: readonly ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  
  if (!validPacing.includes(ux.storyPacing)) {
    console.log('Debug config validation failed: invalid storyPacing', ux.storyPacing);
    return false;
  }
  if (!validComplexity.includes(ux.choiceComplexity)) {
    console.log('Debug config validation failed: invalid choiceComplexity', ux.choiceComplexity);
    return false;
  }
  if (!validDepth.includes(ux.narrativeDepth)) {
    console.log('Debug config validation failed: invalid narrativeDepth', ux.narrativeDepth);
    return false;
  }
  if (!validDevelopment.includes(ux.characterDevelopment)) {
    console.log('Debug config validation failed: invalid characterDevelopment', ux.characterDevelopment);
    return false;
  }
  if (!validMoralComplexity.includes(ux.moralComplexity)) {
    console.log('Debug config validation failed: invalid moralComplexity', ux.moralComplexity);
    return false;
  }
  
  // Validate testing settings
  const testing = debugConfig.testing;
  if (testing.mockResponseDelay < 0 || testing.mockResponseDelay > 10000) {
    console.log('Debug config validation failed: invalid mockResponseDelay', testing.mockResponseDelay);
    return false;
  }
  if (testing.maxConcurrentRequests < 1 || testing.maxConcurrentRequests > 20) {
    console.log('Debug config validation failed: invalid maxConcurrentRequests', testing.maxConcurrentRequests);
    return false;
  }
  
  return true;
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
    debugConfig: {
      storyLength: 'medium',
      storyLengthCustom: undefined,
      choiceCount: 3,
      enableVerboseLogging: false,
      summaryEnabled: false,
      performanceMetrics: {
        enabled: false,
        trackStoryGeneration: true,
        trackChoiceGeneration: true,
        trackImageAnalysis: true,
        trackDMReflection: true
      },
      aiResponseTuning: {
        temperature: 0.85,
        maxTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0
      },
      userExperience: {
        storyPacing: 'medium',
        choiceComplexity: 'moderate',
        narrativeDepth: 'medium',
        characterDevelopment: 'medium',
        moralComplexity: 'medium'
      },
      testing: {
        enableMockMode: false,
        mockResponseDelay: 300,
        enableStressTesting: false,
        maxConcurrentRequests: 5
      }
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
    choicesHistory: GameTemplate['choicesHistory'];
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

  // Determine next incomplete turn
  const maxTurns = template.config.maxTurns;
  let nextTurn = maxTurns + 1;
  for (let turn = 1; turn <= maxTurns; turn++) {
    const hasImage = template.images.some(img => img.turn === turn);
    if (!hasImage) {
      nextTurn = turn;
      break;
    }
  }
  const currentTurn = nextTurn;

  // Create game state
  const gameState = {
    currentTurn,
    character: template.character,
    imageHistory: template.images,
    finalStory: template.finalStory,
    choicesHistory: template.choicesHistory || [],
  };

  // Detect missing content
  const missingContent: string[] = [];

  // If we have a final story, consider the template complete
  if (template.finalStory) {
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
    choicesHistory?: import('./character').ChoicesHistoryEntry[];
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
    choicesHistory: gameState.choicesHistory,
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
      choicesHistory?: import('./character').ChoicesHistoryEntry[];
      choiceHistory?: import('./character').ChoiceOutcome[];
    };
  },
  prompts: GameTemplate['prompts'],
  config: GameTemplate['config'],
  dmConfig?: GameTemplate['dmConfig']
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
    ...(dmConfig ? { dmConfig } : {}),
    choicesHistory: character.choicesHistory || [],
    choiceHistory: character.choiceHistory || [],
    debugConfig: {
      storyLength: 'medium',
      storyLengthCustom: undefined,
      choiceCount: 3,
      enableVerboseLogging: false,
      summaryEnabled: false,
      performanceMetrics: {
        enabled: false,
        trackStoryGeneration: true,
        trackChoiceGeneration: true,
        trackImageAnalysis: true,
        trackDMReflection: true
      },
      aiResponseTuning: {
        temperature: 0.85,
        maxTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0
      },
      userExperience: {
        storyPacing: 'medium',
        choiceComplexity: 'moderate',
        narrativeDepth: 'medium',
        characterDevelopment: 'medium',
        moralComplexity: 'medium'
      },
      testing: {
        enableMockMode: false,
        mockResponseDelay: 300,
        enableStressTesting: false,
        maxConcurrentRequests: 5
      }
    },
  };
} 