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
      fontFamily: 'Inter',
      fontSize: '16px',
      folderLocation: '/adventures/test',
      type: 'game',
      debugConfig: {
        storyLength: 'medium',
        choiceCount: 2,
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
      }
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
      fontFamily: 'Inter',
      fontSize: '16px',
      folderLocation: '/adventures/test',
      type: 'game',
      debugConfig: {
        storyLength: 'medium',
        choiceCount: 2,
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
      }
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
      debugConfig: {
        storyLength: 'medium',
        choiceCount: 2,
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
      }
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
      debugConfig: {
        storyLength: 'medium',
        choiceCount: 2,
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
      }
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
      debugConfig: {
        storyLength: 'medium',
        choiceCount: 2,
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
      }
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

describe('GameTemplate Debug Configuration', () => {
  describe('Debug Configuration Structure', () => {
    it('should include debug configuration in template', () => {
      const template = createDefaultTemplate('Test Template');
      expect(template.debugConfig).toBeDefined();
      expect(template.debugConfig?.storyLength).toBeDefined();
      expect(template.debugConfig?.storyLengthCustom).toBeUndefined();
      expect(template.debugConfig?.choiceCount).toBeDefined();
      expect(template.debugConfig?.enableVerboseLogging).toBeDefined();
      expect(template.debugConfig?.summaryEnabled).toBeDefined();
      expect(template.debugConfig?.performanceMetrics).toBeDefined();
      expect(template.debugConfig?.aiResponseTuning).toBeDefined();
    });

    it('should have default debug values', () => {
      const template = createDefaultTemplate('Test Template');
      expect(template.debugConfig?.storyLength).toBe('medium');
      expect(template.debugConfig?.storyLengthCustom).toBeUndefined();
      expect(template.debugConfig?.choiceCount).toBe(3);
      expect(template.debugConfig?.enableVerboseLogging).toBe(false);
      expect(template.debugConfig?.summaryEnabled).toBe(false);
      expect(template.debugConfig?.performanceMetrics.enabled).toBe(false);
      expect(template.debugConfig?.aiResponseTuning.temperature).toBe(0.85);
      expect(template.debugConfig?.aiResponseTuning.maxTokens).toBe(2048);
    });
  });

  describe('Debug Configuration Validation', () => {
    it('should validate debug configuration with valid values', () => {
      const template = createDefaultTemplate('Test Template');
      template.debugConfig = {
        storyLength: 'short',
        storyLengthCustom: 500,
        choiceCount: 2,
        enableVerboseLogging: true,
        summaryEnabled: true,
        performanceMetrics: {
          enabled: true,
          trackStoryGeneration: true,
          trackChoiceGeneration: true,
          trackImageAnalysis: true,
          trackDMReflection: true
        },
        aiResponseTuning: {
          temperature: 0.9,
          maxTokens: 1500,
          topP: 0.95,
          frequencyPenalty: 0.1,
          presencePenalty: 0.1
        },
        userExperience: {
          storyPacing: 'fast',
          choiceComplexity: 'simple',
          narrativeDepth: 'medium',
          characterDevelopment: 'high',
          moralComplexity: 'medium'
        },
        testing: {
          enableMockMode: false,
          mockResponseDelay: 300,
          enableStressTesting: false,
          maxConcurrentRequests: 5
        }
      };
      expect(validateGameTemplate(template)).toBe(true);
    });

    it('should reject invalid storyLengthCustom', () => {
      const template = createDefaultTemplate('Test Template');
      template.debugConfig!.storyLengthCustom = -10;
      expect(validateGameTemplate(template)).toBe(false);
      template.debugConfig!.storyLengthCustom = 0;
      expect(validateGameTemplate(template)).toBe(false);
      template.debugConfig!.storyLengthCustom = 'abc' as any;
      expect(validateGameTemplate(template)).toBe(false);
    });

    it('should reject invalid summaryEnabled', () => {
      const template = createDefaultTemplate('Test Template');
      template.debugConfig!.summaryEnabled = 'yes' as any;
      expect(validateGameTemplate(template)).toBe(false);
      template.debugConfig!.summaryEnabled = undefined as any;
      expect(validateGameTemplate(template)).toBe(false);
    });

    it('should reject invalid story length', () => {
      const template = createDefaultTemplate('Test Template');
      template.debugConfig!.storyLength = 'invalid' as any;
      
      expect(validateGameTemplate(template)).toBe(false);
    });

    it('should reject invalid choice count', () => {
      const template = createDefaultTemplate('Test Template');
      template.debugConfig!.choiceCount = 0;
      
      expect(validateGameTemplate(template)).toBe(false);
    });

    it('should reject invalid temperature', () => {
      const template = createDefaultTemplate('Test Template');
      template.debugConfig!.aiResponseTuning.temperature = 2.0;
      
      expect(validateGameTemplate(template)).toBe(false);
    });
  });

  describe('Debug Configuration Types', () => {
    it('should accept all valid story length values', () => {
      const validLengths = ['short', 'medium', 'long', 'epic'] as const;
      
      validLengths.forEach(length => {
        const template = createDefaultTemplate('Test Template');
        template.debugConfig!.storyLength = length;
        expect(validateGameTemplate(template)).toBe(true);
      });
    });

    it('should accept valid choice count range', () => {
      const validCounts = [2, 3, 4, 5];
      
      validCounts.forEach(count => {
        const template = createDefaultTemplate('Test Template');
        template.debugConfig!.choiceCount = count;
        expect(validateGameTemplate(template)).toBe(true);
      });
    });

    it('should accept valid temperature range', () => {
      const validTemperatures = [0.1, 0.5, 0.85, 1.0];
      
      validTemperatures.forEach(temp => {
        const template = createDefaultTemplate('Test Template');
        template.debugConfig!.aiResponseTuning.temperature = temp;
        expect(validateGameTemplate(template)).toBe(true);
      });
    });
  });

  describe('Debug Configuration Defaults', () => {
    it('should provide sensible defaults for performance metrics', () => {
      const template = createDefaultTemplate('Test Template');
      
      expect(template.debugConfig?.performanceMetrics.enabled).toBe(false);
      expect(template.debugConfig?.performanceMetrics.trackStoryGeneration).toBe(true);
      expect(template.debugConfig?.performanceMetrics.trackChoiceGeneration).toBe(true);
      expect(template.debugConfig?.performanceMetrics.trackImageAnalysis).toBe(true);
      expect(template.debugConfig?.performanceMetrics.trackDMReflection).toBe(true);
    });

    it('should provide sensible defaults for AI tuning', () => {
      const template = createDefaultTemplate('Test Template');
      
      expect(template.debugConfig?.aiResponseTuning.temperature).toBe(0.85);
      expect(template.debugConfig?.aiResponseTuning.maxTokens).toBe(2048);
      expect(template.debugConfig?.aiResponseTuning.topP).toBe(0.9);
      expect(template.debugConfig?.aiResponseTuning.frequencyPenalty).toBe(0.0);
      expect(template.debugConfig?.aiResponseTuning.presencePenalty).toBe(0.0);
    });

    it('should provide sensible defaults for user experience', () => {
      const template = createDefaultTemplate('Test Template');
      
      expect(template.debugConfig?.userExperience.storyPacing).toBe('medium');
      expect(template.debugConfig?.userExperience.choiceComplexity).toBe('moderate');
      expect(template.debugConfig?.userExperience.narrativeDepth).toBe('medium');
      expect(template.debugConfig?.userExperience.characterDevelopment).toBe('medium');
      expect(template.debugConfig?.userExperience.moralComplexity).toBe('medium');
    });
  });
}); 