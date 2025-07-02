import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { TemplateManager } from './TemplateManager';
import { useTemplateStore } from '@/lib/stores/templateStore';
import { useCharacterStore } from '@/lib/stores/characterStore';
import { GameTemplate } from '@/lib/types/template';
import { useDMStore } from '@/lib/stores/dmStore';

// Mock the stores
jest.mock('@/lib/stores/templateStore');
jest.mock('@/lib/stores/characterStore');
jest.mock('@/lib/stores/dmStore');

// Mock template functions
jest.mock('@/lib/types/template', () => ({
  ...jest.requireActual('@/lib/types/template'),
  createTemplateFromCurrentState: jest.fn((name, characterStore, prompts, config, dmConfig) => ({
    id: 'mock-template-id',
    name,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'game',
    character: characterStore.character,
    images: characterStore.character.imageHistory || [],
    prompts,
    config,
    dmConfig,
    finalStory: characterStore.character.finalStory,
    choicesHistory: characterStore.character.choicesHistory || [],
    choiceHistory: characterStore.character.choiceHistory || [],
  })),
  validateGameTemplate: jest.fn(() => true),
  applyTemplate: jest.fn((template) => ({
    success: true,
    gameState: {
      character: template.character || {},
      imageHistory: template.images || [],
      currentTurn: 3,
      finalStory: template.finalStory,
      choicesHistory: template.choicesHistory || [],
      choiceHistory: template.choiceHistory || [],
      storyHistory: [],
    },
    missingContent: ['turn-2-image', 'turn-3-image', 'final-story']
  })),
}));

const mockUseTemplateStore = useTemplateStore as jest.MockedFunction<typeof useTemplateStore>;
const mockUseCharacterStore = useCharacterStore as jest.MockedFunction<typeof useCharacterStore>;
const mockUseDMStore = useDMStore as jest.MockedFunction<typeof useDMStore>;

// Mock Sonner toast
jest.mock('sonner', () => ({
  toast: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

// Mock template functions
jest.mock('@/lib/types/template', () => ({
  ...jest.requireActual('@/lib/types/template'),
  createTemplateFromCurrentState: jest.fn((name, characterStore, prompts, config, dmConfig) => ({
    id: 'mock-template-id',
    name,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'game',
    character: characterStore.character,
    images: characterStore.character.imageHistory || [],
    prompts,
    config,
    dmConfig,
    finalStory: characterStore.character.finalStory,
    choicesHistory: characterStore.character.choicesHistory || [],
    choiceHistory: characterStore.character.choiceHistory || [],
  })),
  validateGameTemplate: jest.fn(() => true),
  applyTemplate: jest.fn((template) => ({
    success: true,
    gameState: {
      character: template.character || {},
      imageHistory: template.images || [],
      currentTurn: 3,
      finalStory: template.finalStory,
      choicesHistory: template.choicesHistory || [],
      choiceHistory: template.choiceHistory || [],
      storyHistory: [],
    },
    missingContent: ['turn-2-image', 'turn-3-image', 'final-story']
  })),
}));

import { toast } from 'sonner';
const mockToast = toast as jest.MockedFunction<typeof toast> & {
  success: jest.MockedFunction<typeof toast.success>;
  error: jest.MockedFunction<typeof toast.error>;
};

describe('TemplateManager', () => {
  const mockTemplate: GameTemplate = {
    id: 'template-1',
    name: 'Test Adventure',
    version: '1.0.0',
    createdAt: '2025-01-27T10:00:00Z',
    updatedAt: '2025-01-27T10:00:00Z',
    type: 'game',
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
    dmConfig: {
      personality: null,
      freeformAnswers: {},
    },
  };

  const mockCharacterStore = {
    updateCharacter: jest.fn(),
    addImageToHistory: jest.fn(),
    updateCurrentStory: jest.fn(),
    updateCurrentDescription: jest.fn(),
    character: {
      persona: 'Adventurer',
      traits: ['brave'],
      stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
      health: 100,
      heartrate: 70,
      age: 25,
      level: 1,
      experience: 0,
      imageHistory: [],
      finalStory: undefined,
    },
  };

  const mockTemplateStore = {
    templates: [mockTemplate],
    selectedTemplateId: 'template-1',
    selectedTemplate: mockTemplate,
    addTemplate: jest.fn(),
    deleteTemplate: jest.fn(),
    selectTemplate: jest.fn(),
  };

  const mockDMStore = {
    selectedPersonality: null,
    freeformAnswers: {},
    setSelectedPersonality: jest.fn(),
    setFreeformAnswers: jest.fn(),
    resetDM: jest.fn(),
    getDMContext: jest.fn().mockReturnValue({
      personality: null,
      freeformAnswers: {},
      template: { name: 'Default DM', personality: null, freeformAnswers: {} }
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTemplateStore.mockReturnValue(mockTemplateStore);
    mockUseCharacterStore.mockReturnValue(mockCharacterStore);
    mockUseDMStore.mockReturnValue(mockDMStore);
  });

  const openAccordion = () => {
    fireEvent.click(screen.getByText('Template & Dungeon Master Controls'));
  };

  it('should render template manager with apply button', () => {
    render(<TemplateManager />);
    openAccordion();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    openAccordion();
    expect(screen.getByText('Test Adventure')).toBeInTheDocument();
    openAccordion();
    expect(screen.getByTestId('apply-template-btn')).toBeInTheDocument();
    openAccordion();
    expect(screen.getByText('Apply Template')).toBeInTheDocument();
  });

  it('should display template details including images and final story', () => {
    render(<TemplateManager />);
    openAccordion();
    expect(screen.getByText('Images: 2')).toBeInTheDocument();
    openAccordion();
    expect(screen.getByText('Final Story: Yes')).toBeInTheDocument();
  });

  it('should apply template successfully when apply button is clicked', () => {
    render(<TemplateManager />);
    openAccordion();
    // First import a template
    openAccordion();
    fireEvent.click(screen.getByText('Import Template'));
    openAccordion();
    
    // Mock file input with a valid template
    const validTemplate = {
      ...mockTemplate,
      id: 'imported-template',
      name: 'Imported Template'
    };
    const file = new File([JSON.stringify(validTemplate)], 'test.json', { type: 'application/json' });
    openAccordion();
    const input = screen.getByTestId('template-file-input');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    // Wait for the template to be imported and selected
    // Then click the Apply Template button
    openAccordion();
    const applyButton = screen.getByTestId('apply-template-btn');
    fireEvent.click(applyButton);
    openAccordion();
    
    expect(mockCharacterStore.updateCharacter).toHaveBeenCalledWith(expect.objectContaining({
      ...mockTemplate.character,
      currentTurn: 3, // Next incomplete turn
      imageHistory: expect.any(Array),
      storyHistory: expect.any(Array),
      choicesHistory: expect.any(Array),
      choiceHistory: expect.any(Array),
    }));
    
    expect(mockDMStore.setSelectedPersonality).toHaveBeenCalledWith(mockTemplate.dmConfig?.personality);
    expect(mockDMStore.setFreeformAnswers).toHaveBeenCalledWith(mockTemplate.dmConfig?.freeformAnswers || {});
  });

  it('should show success message and missing content when template is applied', async () => {
    const incompleteTemplate = {
      ...mockTemplate,
      images: [mockTemplate.images[0]], // Only one image
      finalStory: undefined, // No final story
    };

    mockUseTemplateStore.mockReturnValue({
      ...mockTemplateStore,
      selectedTemplate: incompleteTemplate,
    });

    render(<TemplateManager />);
    openAccordion();
    const applyButton = screen.getByTestId('apply-template-btn');
    fireEvent.click(applyButton);
    openAccordion();
    await waitFor(() => {
      openAccordion();
      expect(screen.getByText('Template applied successfully!')).toBeInTheDocument();
      openAccordion();
      expect(screen.getByText('Missing content:')).toBeInTheDocument();
      openAccordion();
      expect(screen.getByText('turn-2-image')).toBeInTheDocument();
      openAccordion();
      expect(screen.getByText('turn-3-image')).toBeInTheDocument();
      openAccordion();
      expect(screen.getByText('final-story')).toBeInTheDocument();
    });
  });

  it('should show error message when no template is selected', () => {
    mockUseTemplateStore.mockReturnValue({
      ...mockTemplateStore,
      selectedTemplateId: null,
      selectedTemplate: null,
    });

    render(<TemplateManager />);
    
    // When no template is selected, the Apply Template button should not be rendered
    expect(screen.queryByTestId('apply-template-btn')).not.toBeInTheDocument();
    
    // The selected template section should not be rendered
    expect(screen.queryByText('Selected Template')).not.toBeInTheDocument();
  });

  it('should handle template creation', () => {
    render(<TemplateManager />);
    openAccordion();
    const nameInput = screen.getByPlaceholderText('New template name');
    openAccordion();
    const createButton = screen.getByTestId('create-template-btn');
    
    fireEvent.change(nameInput, { target: { value: 'New Template' } });
    fireEvent.click(createButton);
    openAccordion();
    expect(mockTemplateStore.addTemplate).toHaveBeenCalled();
  });

  it('should handle template deletion', () => {
    render(<TemplateManager />);
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    expect(mockTemplateStore.deleteTemplate).toHaveBeenCalledWith('template-1');
  });

  it('should handle template selection', () => {
    render(<TemplateManager />);
    
    const templateName = screen.getByText('Test Adventure');
    fireEvent.click(templateName);
    
    expect(mockTemplateStore.selectTemplate).toHaveBeenCalledWith('template-1');
  });

  it('should display selected template indicator', () => {
    render(<TemplateManager />);
    
    expect(screen.getByText('(selected)')).toBeInTheDocument();
  });

  it('should show no templates message when empty', () => {
    mockUseTemplateStore.mockReturnValue({
      ...mockTemplateStore,
      templates: [],
      selectedTemplateId: null,
      selectedTemplate: null,
    });

    render(<TemplateManager />);
    
    expect(screen.getByText('No templates yet.')).toBeInTheDocument();
  });

  it('should create template from current game state', () => {
    // Mock character store with current game state
    const mockCharacterWithState = {
      ...mockCharacterStore,
      character: {
        persona: 'Explorer',
        traits: ['brave', 'curious'],
        stats: { intelligence: 15, creativity: 12, perception: 18, wisdom: 14 },
        health: 85,
        heartrate: 75,
        age: 25,
        level: 2,
        experience: 150,
        imageHistory: [
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
        finalStory: 'The explorer completes their journey through the forest and cave.',
      },
    };

    mockUseCharacterStore.mockReturnValue(mockCharacterWithState);

    render(<TemplateManager />);
    openAccordion();
    const nameInput = screen.getByPlaceholderText('New template name');
    openAccordion();
    const createButton = screen.getByTestId('create-template-btn');
    
    fireEvent.change(nameInput, { target: { value: 'Current Adventure' } });
    fireEvent.click(createButton);
    openAccordion();
    // Verify template was created with current game state
    expect(mockTemplateStore.addTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Current Adventure',
        character: expect.objectContaining({
          persona: 'Explorer',
          traits: ['brave', 'curious'],
          stats: expect.objectContaining({
            intelligence: 15,
            creativity: 12,
            perception: 18,
            wisdom: 14,
          }),
          health: 85,
          heartrate: 75,
          age: 25,
          level: 2,
          experience: 150,
        }),
        images: expect.arrayContaining([
          expect.objectContaining({
            id: 'img-1',
            url: '/images/forest.jpg',
            description: 'A mysterious forest with ancient trees',
            story: 'The explorer enters the forest and discovers ancient ruins...',
            turn: 1,
            uploadedAt: '2025-01-27T10:01:00Z',
          }),
          expect.objectContaining({
            id: 'img-2',
            url: '/images/cave.jpg',
            description: 'A dark cave entrance with mysterious symbols',
            story: 'The explorer finds a cave with glowing symbols on the walls...',
            turn: 2,
            uploadedAt: '2025-01-27T10:02:00Z',
          }),
        ]),
        finalStory: 'The explorer completes their journey through the forest and cave.',
      })
    );
  });

  it('should handle images without stories when creating template', () => {
    // Mock character store with images that don't have stories
    const mockCharacterWithImagesNoStories = {
      ...mockCharacterStore,
      character: {
        persona: 'Explorer',
        traits: ['brave'],
        stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
        health: 100,
        heartrate: 70,
        age: 25,
        level: 1,
        experience: 0,
        imageHistory: [
          {
            id: 'img-1',
            url: '/images/forest.jpg',
            description: 'A mysterious forest',
            story: undefined, // No story
            turn: 1,
            uploadedAt: '2025-01-27T10:01:00Z',
          },
        ],
        finalStory: undefined,
      },
    };

    mockUseCharacterStore.mockReturnValue(mockCharacterWithImagesNoStories);

    render(<TemplateManager />);
    openAccordion();
    const nameInput = screen.getByPlaceholderText('New template name');
    openAccordion();
    const createButton = screen.getByTestId('create-template-btn');
    
    fireEvent.change(nameInput, { target: { value: 'No Stories Adventure' } });
    fireEvent.click(createButton);
    openAccordion();
    // Verify template was created with empty story string
    expect(mockTemplateStore.addTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'No Stories Adventure',
        images: [
          {
            id: 'img-1',
            url: '/images/forest.jpg',
            description: 'A mysterious forest',
            story: '', // Should be empty string when story is undefined
            turn: 1,
            uploadedAt: '2025-01-27T10:01:00Z',
          },
        ],
        finalStory: undefined,
      })
    );
  });

  it('should allow editing template name, prompts, and config from the UI', () => {
    render(<TemplateManager />);
    openAccordion();
    openAccordion();
    fireEvent.click(screen.getByText('Test Adventure'));
    openAccordion();
    fireEvent.click(screen.getByTestId('edit-template-btn'));

    // Edit name
    openAccordion();
    const nameInput = screen.getByDisplayValue('Test Adventure');
    fireEvent.change(nameInput, { target: { value: 'Epic Quest' } });
    expect(nameInput).toHaveValue('Epic Quest');

    // Edit a prompt
    openAccordion();
    const promptInput = screen.getByDisplayValue('Describe this image in detail for an RPG adventure.');
    fireEvent.change(promptInput, { target: { value: 'Describe the scene for a fantasy RPG.' } });
    expect(promptInput).toHaveValue('Describe the scene for a fantasy RPG.');

    // Edit config
    openAccordion();
    const maxTurnsInput = screen.getByLabelText('Max Turns');
    fireEvent.change(maxTurnsInput, { target: { value: 5 } });
    expect(maxTurnsInput).toHaveValue(5);

    // Save changes
    openAccordion();
    const saveButton = screen.getByTestId('save-template-btn');
    fireEvent.click(saveButton);
    openAccordion();

    expect(mockTemplateStore.addTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Epic Quest',
        prompts: expect.objectContaining({
          imageDescription: 'Describe the scene for a fantasy RPG.'
        }),
        config: expect.objectContaining({ maxTurns: 5 })
      })
    );
  });

  it('should show validation errors for missing required fields when saving a template', () => {
    render(<TemplateManager />);
    openAccordion();
    openAccordion();
    fireEvent.click(screen.getByText('Test Adventure'));
    openAccordion();
    fireEvent.click(screen.getByTestId('edit-template-btn'));

    // Clear the name field
    openAccordion();
    const nameInput = screen.getByDisplayValue('Test Adventure');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Try to save
    openAccordion();
    const saveButton = screen.getByTestId('save-template-btn');
    fireEvent.click(saveButton);
    openAccordion();

    expect(screen.getByText('Template name is required')).toBeInTheDocument();
  });

  it('should show an error if importing an invalid template (missing required fields)', async () => {
    // Override the validateGameTemplate mock to return false for this test
    const { validateGameTemplate } = jest.requireMock('@/lib/types/template');
    (validateGameTemplate as jest.Mock).mockReturnValueOnce(false);
    
    render(<TemplateManager />);
    openAccordion();
    fireEvent.click(screen.getByText('Import Template'));
    openAccordion();
    const file = new File(['{"invalid":true}'], 'invalid.json', { type: 'application/json' });
    openAccordion();
    const input = screen.getByTestId('template-file-input');
    fireEvent.change(input, { target: { files: [file] } });
    openAccordion();
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Invalid template file.');
    });
  });

  describe('Toast notifications', () => {
    it('shows a toast when exporting a template', async () => {
      render(<TemplateManager />);
      openAccordion();
      openAccordion();
      const exportBtn = screen.getByTestId('export-template-btn');
      fireEvent.click(exportBtn);
      openAccordion();
      expect(mockToast).toHaveBeenCalledWith('Template exported successfully!');
    });
  });
}); 