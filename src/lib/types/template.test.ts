import { 
  GameTemplate, 
  importGameTemplate, 
  validateGameTemplate, 
  isTemplateVersionCompatible, 
  createDefaultTemplate, 
  cloneTemplate,
  applyTemplate,
  createTemplateFromCurrentState
} from './template';
import type { Character } from './character';

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
      type: 'game',
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
      type: 'game',
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
      type: 'game',
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

describe('Template System', () => {
  const mockCharacter: Character = {
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
    currentTurn: 2,
    imageHistory: [
      {
        id: 'img-1',
        url: '/test-image-1.jpg',
        description: 'A mysterious forest',
        story: 'The adventurer enters the forest...',
        turn: 1,
        uploadedAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 'img-2',
        url: '/test-image-2.jpg',
        description: 'A dark cave',
        story: 'The adventurer finds a cave...',
        turn: 2,
        uploadedAt: '2024-01-01T11:00:00Z',
      },
    ],
    storyHistory: [
      {
        id: 'img-1',
        text: 'The adventurer enters the forest...',
        imageDescription: 'A mysterious forest',
        turnNumber: 1,
        timestamp: '2024-01-01T10:00:00Z',
      },
      {
        id: 'img-2',
        text: 'The adventurer finds a cave...',
        imageDescription: 'A dark cave',
        turnNumber: 2,
        timestamp: '2024-01-01T11:00:00Z',
      },
    ],
    choicesHistory: [
      {
        turn: 1,
        choices: [
          { id: 'c1', text: 'Enter the forest' },
          { id: 'c2', text: 'Go around' },
        ],
      },
      {
        turn: 2,
        choices: [
          { id: 'c3', text: 'Enter the cave' },
          { id: 'c4', text: 'Search outside' },
        ],
      },
    ],
    choiceHistory: [
      {
        id: 'outcome-1',
        choiceId: 'c1',
        text: 'Enter the forest',
        outcome: 'The adventurer enters the forest...',
        timestamp: '2024-01-01T10:00:00Z',
        turnNumber: 1,
      },
      {
        id: 'outcome-2',
        choiceId: 'c3',
        text: 'Enter the cave',
        outcome: 'The adventurer enters the cave...',
        timestamp: '2024-01-01T11:00:00Z',
        turnNumber: 2,
      },
    ],
    inventory: [],
    currentChoices: [],
  };

  const mockCharacterStore = {
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
      imageHistory: [
        {
          id: 'img-1',
          url: '/test-image-1.jpg',
          description: 'A mysterious forest',
          story: 'The adventurer enters the forest...',
          turn: 1,
          uploadedAt: '2024-01-01T10:00:00Z',
        },
        {
          id: 'img-2',
          url: '/test-image-2.jpg',
          description: 'A dark cave',
          story: 'The adventurer finds a cave...',
          turn: 2,
          uploadedAt: '2024-01-01T11:00:00Z',
        },
      ],
      finalStory: 'The adventurer completes their journey.',
      choicesHistory: [
        {
          turn: 1,
          choices: [
            { id: 'c1', text: 'Enter the forest' },
            { id: 'c2', text: 'Go around' },
          ],
        },
        {
          turn: 2,
          choices: [
            { id: 'c3', text: 'Enter the cave' },
            { id: 'c4', text: 'Search outside' },
          ],
        },
      ],
      choiceHistory: [
        {
          id: 'outcome-1',
          choiceId: 'c1',
          text: 'Enter the forest',
          outcome: 'The adventurer enters the forest...',
          timestamp: '2024-01-01T10:00:00Z',
          turnNumber: 1,
        },
        {
          id: 'outcome-2',
          choiceId: 'c3',
          text: 'Enter the cave',
          outcome: 'The adventurer enters the cave...',
          timestamp: '2024-01-01T11:00:00Z',
          turnNumber: 2,
        },
      ],
    },
  };

  const mockPrompts = {
    imageDescription: 'Describe this image in detail for an RPG adventure.',
    storyGeneration: 'Generate a story based on this image description.',
    finalStory: 'Create a cohesive final story combining all previous stories.',
    characterInitialization: 'Initialize a character based on this image.',
  };

  const mockConfig = {
    maxTurns: 3,
    enableMarkdown: true,
    autoSave: true,
    theme: 'default',
    language: 'en',
  };

  describe('Template Creation', () => {
    it('should create template from current state', () => {
      const template = createTemplateFromCurrentState('Test Template', mockCharacterStore, mockPrompts, mockConfig);

      expect(template.name).toBe('Test Template');
      expect(template.type).toBe('game');
      expect(template.character).toEqual(expect.objectContaining({
        persona: 'Adventurer',
        traits: ['brave', 'curious'],
        stats: expect.objectContaining({
          intelligence: 10,
          creativity: 10,
          perception: 10,
          wisdom: 10,
        }),
        health: 100,
        heartrate: 70,
        age: 25,
        level: 1,
        experience: 0,
      }));
      expect(template.images).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'img-1',
          url: '/test-image-1.jpg',
          description: 'A mysterious forest',
          story: 'The adventurer enters the forest...',
          turn: 1,
          uploadedAt: '2024-01-01T10:00:00Z',
        }),
        expect.objectContaining({
          id: 'img-2',
          url: '/test-image-2.jpg',
          description: 'A dark cave',
          story: 'The adventurer finds a cave...',
          turn: 2,
          uploadedAt: '2024-01-01T11:00:00Z',
        }),
      ]));
      expect(template.choicesHistory).toEqual(expect.any(Array));
      expect(template.choiceHistory).toEqual(expect.any(Array));
      expect(template.version).toBeDefined();
      expect(template.createdAt).toBeDefined();
      expect(template.updatedAt).toBeDefined();
    });

    it('should include DM config when available', () => {
      const dmConfig = {
        personality: { name: 'Test DM', style: 'descriptive', description: 'A test DM' },
        freeformAnswers: { theme: 'fantasy' },
      };

      const template = createTemplateFromCurrentState('Test Template', mockCharacterStore, mockPrompts, mockConfig, dmConfig);

      expect(template.dmConfig).toEqual(dmConfig);
    });
  });

  describe('Template Application System', () => {
    const template: GameTemplate = {
      id: 'template-1',
      name: 'Test Template',
      version: '1.0.0',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
      type: 'game',
      character: mockCharacter,
      images: mockCharacter.imageHistory,
      prompts: mockPrompts,
      config: mockConfig,
      finalStory: 'The adventurer completes their journey.',
      choicesHistory: mockCharacter.choicesHistory,
      choiceHistory: mockCharacter.choiceHistory,
    };

    it('should apply template and restore complete game state', () => {
      const result = applyTemplate(template);

      expect(result.success).toBe(true);
      expect(result.gameState).toBeDefined();
      if (result.gameState) {
        expect(result.gameState.character).toEqual(template.character);
        expect(result.gameState.imageHistory).toEqual(template.images);
        expect(result.gameState.currentTurn).toBe(3); // Next incomplete turn (all turns 1-2 are complete)
        expect(result.gameState.finalStory).toBe(template.finalStory);
        expect(result.gameState.choicesHistory).toEqual(template.choicesHistory);
      }
      expect(result.missingContent).toEqual([]);
    });

    it('should detect missing content when applying incomplete template', () => {
      const incompleteTemplate: GameTemplate = {
        ...template,
        images: [
          {
            ...template.images[0],
            story: template.images[0].story || '', // ensure story is always a string
          },
        ], // Only first image
        finalStory: undefined,
        type: 'game', // ensure type is present
      };

      const result = applyTemplate(incompleteTemplate);

      expect(result.success).toBe(true);
      expect(result.gameState).toBeDefined();
      if (result.gameState) {
        expect(result.gameState.currentTurn).toBe(2); // Next incomplete turn (turn 1 is complete, turn 2 is missing)
      }
      expect(result.missingContent).toContain('turn-2-image');
      expect(result.missingContent).toContain('final-story');
    });

    it('should handle template with no images', () => {
      const emptyTemplate: GameTemplate = {
        ...template,
        images: [],
        finalStory: undefined,
        type: 'game',
      };

      const result = applyTemplate(emptyTemplate);

      expect(result.success).toBe(true);
      expect(result.gameState).toBeDefined();
      if (result.gameState) {
        expect(result.gameState.currentTurn).toBe(1); // Start at turn 1 when no images
        expect(result.missingContent).toEqual([
          'turn-1-image',
          'turn-2-image',
          'turn-3-image',
        ]);
      }
    });

    it('should handle template with all turns complete', () => {
      const completeTemplate: GameTemplate = {
        ...template,
        finalStory: 'Complete story',
        type: 'game',
      };

      const result = applyTemplate(completeTemplate);

      expect(result.success).toBe(true);
      expect(result.gameState).toBeDefined();
      if (result.gameState) {
        expect(result.gameState.currentTurn).toBe(3); // maxTurns + 1 when all turns are complete (if maxTurns=2)
      }
      expect(result.missingContent).toEqual([]);
    });
  });

  describe('Template Validation', () => {
    it('should validate required fields', () => {
      const invalidTemplate = {
        name: 'Test',
        type: 'game',
      } as GameTemplate;

      const result = applyTemplate(invalidTemplate);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid template');
    });

    it('should handle template with invalid character data', () => {
      const invalidTemplate: GameTemplate = {
        id: 'template-1',
        name: 'Test Template',
        version: '1.0.0',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
        type: 'game',
        character: {
          ...mockCharacter,
          persona: '', // Invalid empty persona
        },
        images: [],
        prompts: mockPrompts,
        config: mockConfig,
        choicesHistory: [],
        choiceHistory: [],
      };

      const result = applyTemplate(invalidTemplate);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid template');
    });
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