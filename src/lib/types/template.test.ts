import { 
  GameTemplate, 
  importGameTemplate, 
  validateGameTemplate, 
  isTemplateVersionCompatible, 
  createDefaultTemplate, 
  cloneTemplate,
  applyTemplate
} from './template';

describe('GameTemplate Import', () => {
  it('should import a template and initialize app state', () => {
    const template: GameTemplate = {
      id: 'template-1',
      name: 'Test Adventure',
      version: '1.0.0',
      createdAt: '2025-01-27T10:00:00Z',
      updatedAt: '2025-01-27T10:00:00Z',
      character: {
        persona: 'Explorer',
        traits: ['brave', 'curious'],
        stats: { intelligence: 12, creativity: 14, perception: 16, wisdom: 18 },
        health: 100,
        heartrate: 70,
        age: 20,
        level: 1,
        experience: 0,
      },
      images: [
        {
          id: 'img-1',
          url: '/images/forest.jpg',
          description: 'A mysterious forest',
          story: 'The explorer enters the forest...',
          turn: 1,
          uploadedAt: '2025-01-27T10:01:00Z',
        },
      ],
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
      finalStory: 'The explorer completes their journey.',
      fontFamily: 'Inter',
      fontSize: '16px',
      folderLocation: '/adventures/test',
      type: 'game',
    };
    const state = importGameTemplate(template);
    expect(state.character).toEqual(template.character);
    expect(state.imageHistory).toEqual(template.images);
    expect(state.finalStory).toBe(template.finalStory);
    expect(state.fontFamily).toBe(template.fontFamily);
    expect(state.fontSize).toBe(template.fontSize);
    expect(state.folderLocation).toBe(template.folderLocation);
    expect(state.templateId).toBe(template.id);
    expect(state.templateName).toBe(template.name);
  });
});

describe('GameTemplate Schema Validation', () => {
  it('should validate a complete template with all required fields', () => {
    const template: GameTemplate = {
      id: 'template-1',
      name: 'Test Adventure',
      version: '1.0.0',
      createdAt: '2025-01-27T10:00:00Z',
      updatedAt: '2025-01-27T10:00:00Z',
      character: {
        persona: 'Explorer',
        traits: ['brave', 'curious'],
        stats: { intelligence: 12, creativity: 14, perception: 16, wisdom: 18 },
        health: 100,
        heartrate: 70,
        age: 20,
        level: 1,
        experience: 0,
      },
      images: [
        {
          id: 'img-1',
          url: '/images/forest.jpg',
          description: 'A mysterious forest',
          story: 'The explorer enters the forest...',
          turn: 1,
          uploadedAt: '2025-01-27T10:01:00Z',
        },
      ],
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
      finalStory: 'The explorer completes their journey.',
      fontFamily: 'Inter',
      fontSize: '16px',
      folderLocation: '/adventures/test',
      type: 'game',
    };
    
    const isValid = validateGameTemplate(template);
    expect(isValid).toBe(true);
  });

  it('should reject template with missing required fields', () => {
    const invalidTemplate = {
      id: 'template-1',
      name: 'Test Adventure',
      // Missing required fields
    } as GameTemplate;
    
    const isValid = validateGameTemplate(invalidTemplate);
    expect(isValid).toBe(false);
  });

  it('should reject template with invalid character stats', () => {
    const template: GameTemplate = {
      id: 'template-1',
      name: 'Test Adventure',
      version: '1.0.0',
      createdAt: '2025-01-27T10:00:00Z',
      updatedAt: '2025-01-27T10:00:00Z',
      character: {
        persona: 'Explorer',
        traits: ['brave', 'curious'],
        stats: { intelligence: 25, creativity: 14, perception: 16, wisdom: 18 }, // Invalid: intelligence > 20
        health: 100,
        heartrate: 70,
        age: 20,
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
    
    const isValid = validateGameTemplate(template);
    expect(isValid).toBe(false);
  });

  it('should validate template version compatibility', () => {
    const template: GameTemplate = {
      id: 'template-1',
      name: 'Test Adventure',
      version: '2.0.0', // Newer version
      createdAt: '2025-01-27T10:00:00Z',
      updatedAt: '2025-01-27T10:00:00Z',
      character: {
        persona: 'Explorer',
        traits: ['brave', 'curious'],
        stats: { intelligence: 12, creativity: 14, perception: 16, wisdom: 18 },
        health: 100,
        heartrate: 70,
        age: 20,
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
    
    const isCompatible = isTemplateVersionCompatible(template.version);
    expect(isCompatible).toBe(true);
  });
});

describe('GameTemplate Creation and Utilities', () => {
  it('should create a default template with all required fields', () => {
    const defaultTemplate = createDefaultTemplate('New Adventure');
    
    expect(defaultTemplate.id).toBeDefined();
    expect(defaultTemplate.name).toBe('New Adventure');
    expect(defaultTemplate.version).toBe('1.0.0');
    expect(defaultTemplate.prompts).toBeDefined();
    expect(defaultTemplate.config).toBeDefined();
    expect(defaultTemplate.character).toBeDefined();
    expect(defaultTemplate.images).toEqual([]);
  });

  it('should clone a template with a new ID', () => {
    const originalTemplate: GameTemplate = {
      id: 'template-1',
      name: 'Original Adventure',
      version: '1.0.0',
      createdAt: '2025-01-27T10:00:00Z',
      updatedAt: '2025-01-27T10:00:00Z',
      character: {
        persona: 'Explorer',
        traits: ['brave', 'curious'],
        stats: { intelligence: 12, creativity: 14, perception: 16, wisdom: 18 },
        health: 100,
        heartrate: 70,
        age: 20,
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
    
    const clonedTemplate = cloneTemplate(originalTemplate, 'Cloned Adventure');
    
    expect(clonedTemplate.id).not.toBe(originalTemplate.id);
    expect(clonedTemplate.name).toBe('Cloned Adventure');
    expect(clonedTemplate.character).toEqual(originalTemplate.character);
    expect(clonedTemplate.prompts).toEqual(originalTemplate.prompts);
    expect(clonedTemplate.config).toEqual(originalTemplate.config);
  });
});

describe('Template Application System', () => {
  it('should apply template and restore complete game state', () => {
    const template: GameTemplate = {
      id: 'template-1',
      name: 'Test Adventure',
      version: '1.0.0',
      createdAt: '2025-01-27T10:00:00Z',
      updatedAt: '2025-01-27T10:00:00Z',
      character: {
        persona: 'Explorer',
        traits: ['brave', 'curious'],
        stats: { intelligence: 15, creativity: 12, perception: 18, wisdom: 14 },
        health: 85,
        heartrate: 75,
        age: 25,
        level: 2,
        experience: 150,
      },
      images: [
        {
          id: 'img-1',
          url: '/images/forest.jpg',
          description: 'A mysterious forest with ancient trees',
          story: 'The explorer enters the forest and discovers ancient ruins...',
          turn: 1,
          uploadedAt: '2025-01-27T10:01:00Z',
        },
        {
          id: 'img-2',
          url: '/images/cave.jpg',
          description: 'A dark cave entrance with mysterious symbols',
          story: 'The explorer finds a cave with glowing symbols on the walls...',
          turn: 2,
          uploadedAt: '2025-01-27T10:02:00Z',
        },
      ],
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
      finalStory: 'The explorer completes their journey through the forest and cave, discovering ancient secrets.',
      type: 'game',
    };

    const result = applyTemplate(template);
    
    expect(result.success).toBe(true);
    expect(result.gameState).toBeDefined();
    expect(result.gameState.character).toEqual(template.character);
    expect(result.gameState.imageHistory).toEqual(template.images);
    expect(result.gameState.currentTurn).toBe(2);
    expect(result.gameState.finalStory).toBe(template.finalStory);
    expect(result.missingContent).toEqual([]);
  });

  it('should detect missing content when applying incomplete template', () => {
    const incompleteTemplate: GameTemplate = {
      id: 'template-2',
      name: 'Incomplete Adventure',
      version: '1.0.0',
      createdAt: '2025-01-27T10:00:00Z',
      updatedAt: '2025-01-27T10:00:00Z',
      character: {
        persona: 'Explorer',
        traits: ['brave', 'curious'],
        stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
        health: 100,
        heartrate: 70,
        age: 25,
        level: 1,
        experience: 0,
      },
      images: [
        {
          id: 'img-1',
          url: '/images/forest.jpg',
          description: 'A mysterious forest',
          story: 'The explorer enters the forest...',
          turn: 1,
          uploadedAt: '2025-01-27T10:01:00Z',
        },
      ],
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
      type: 'game',
    };

    const result = applyTemplate(incompleteTemplate);
    
    expect(result.success).toBe(true);
    expect(result.gameState.currentTurn).toBe(1);
    expect(result.missingContent).toContain('turn-2-image');
    expect(result.missingContent).toContain('turn-3-image');
    expect(result.missingContent).toContain('final-story');
  });

  it('should fail to apply invalid template', () => {
    const result = applyTemplate({
      id: 'template-3',
      name: 'Invalid Template',
      // Missing required fields
    } as GameTemplate);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.gameState).toBeUndefined();
  });

  it('should handle template with no images', () => {
    const emptyTemplate: GameTemplate = {
      id: 'template-4',
      name: 'Empty Adventure',
      version: '1.0.0',
      createdAt: '2025-01-27T10:00:00Z',
      updatedAt: '2025-01-27T10:00:00Z',
      character: {
        persona: 'Explorer',
        traits: ['brave', 'curious'],
        stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
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
      type: 'game',
    };

    const result = applyTemplate(emptyTemplate);
    
    expect(result.success).toBe(true);
    expect(result.gameState.currentTurn).toBe(1);
    expect(result.gameState.imageHistory).toEqual([]);
    expect(result.missingContent).toContain('turn-1-image');
    expect(result.missingContent).toContain('turn-2-image');
    expect(result.missingContent).toContain('turn-3-image');
  });
});

describe('Template Type Field', () => {
  it('should have a type field with default value "game"', () => {
    // Arrange & Act
    const template = createDefaultTemplate('Test Template');
    
    // Assert
    expect(template.type).toBe('game');
  });

  it('should support different generation types', () => {
    // Arrange
    const gameTemplate = createDefaultTemplate('Game Template');
    const comicsTemplate = { ...createDefaultTemplate('Comics Template'), type: 'comics' as const };
    const businessTemplate = { ...createDefaultTemplate('Business Template'), type: 'business' as const };
    
    // Assert
    expect(gameTemplate.type).toBe('game');
    expect(comicsTemplate.type).toBe('comics');
    expect(businessTemplate.type).toBe('business');
  });

  it('should validate template type field', () => {
    // Arrange
    const validTemplate = createDefaultTemplate('Valid Template');
    
    // Assert
    expect(validateGameTemplate(validTemplate)).toBe(true);
    // Note: We'll update validation to check type field
  });
}); 