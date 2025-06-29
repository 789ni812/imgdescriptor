import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { TemplateManager } from './TemplateManager';
import { useTemplateStore } from '@/lib/stores/templateStore';
import { useCharacterStore } from '@/lib/stores/characterStore';
import { GameTemplate } from '@/lib/types/template';

// Mock the stores
jest.mock('@/lib/stores/templateStore');
jest.mock('@/lib/stores/characterStore');

const mockUseTemplateStore = useTemplateStore as jest.MockedFunction<typeof useTemplateStore>;
const mockUseCharacterStore = useCharacterStore as jest.MockedFunction<typeof useCharacterStore>;

// Mock Sonner toast
jest.mock('sonner', () => ({
  toast: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
  }),
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTemplateStore.mockReturnValue(mockTemplateStore);
    mockUseCharacterStore.mockReturnValue(mockCharacterStore);
  });

  it('should render template manager with apply button', () => {
    render(<TemplateManager />);
    
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Test Adventure')).toBeInTheDocument();
    expect(screen.getByTestId('apply-template-btn')).toBeInTheDocument();
    expect(screen.getByText('Apply Template')).toBeInTheDocument();
  });

  it('should display template details including images and final story', () => {
    render(<TemplateManager />);
    
    expect(screen.getByText('Images: 2')).toBeInTheDocument();
    expect(screen.getByText('Final Story: Yes')).toBeInTheDocument();
  });

  it('should apply template successfully when apply button is clicked', async () => {
    render(<TemplateManager />);
    
    const applyButton = screen.getByTestId('apply-template-btn');
    fireEvent.click(applyButton);

    await waitFor(() => {
      // Verify character store was updated with current story and description
      expect(mockCharacterStore.updateCurrentStory).toHaveBeenCalledWith(mockTemplate.images[1].story);
      expect(mockCharacterStore.updateCurrentDescription).toHaveBeenCalledWith(mockTemplate.images[1].description);
    });

    // Verify character store was updated
    expect(mockCharacterStore.updateCharacter).toHaveBeenCalledWith({
      ...mockTemplate.character,
      currentTurn: 2,
    });

    // Verify image history was cleared and re-added
    expect(mockCharacterStore.updateCharacter).toHaveBeenCalledWith({ imageHistory: [] });
    expect(mockCharacterStore.addImageToHistory).toHaveBeenCalledTimes(2);
    expect(mockCharacterStore.addImageToHistory).toHaveBeenCalledWith(mockTemplate.images[0]);
    expect(mockCharacterStore.addImageToHistory).toHaveBeenCalledWith(mockTemplate.images[1]);

    // Verify final story was set
    expect(mockCharacterStore.updateCharacter).toHaveBeenCalledWith({ 
      finalStory: mockTemplate.finalStory 
    });
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
    
    const applyButton = screen.getByTestId('apply-template-btn');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('Template applied successfully!')).toBeInTheDocument();
      expect(screen.getByText('Missing content:')).toBeInTheDocument();
      expect(screen.getByText('turn-2-image')).toBeInTheDocument();
      expect(screen.getByText('turn-3-image')).toBeInTheDocument();
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
    
    const nameInput = screen.getByPlaceholderText('New template name');
    const createButton = screen.getByTestId('create-template-btn');
    
    fireEvent.change(nameInput, { target: { value: 'New Template' } });
    fireEvent.click(createButton);

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
    
    const nameInput = screen.getByPlaceholderText('New template name');
    const createButton = screen.getByTestId('create-template-btn');
    
    fireEvent.change(nameInput, { target: { value: 'Current Adventure' } });
    fireEvent.click(createButton);
    
    // Verify template was created with current game state
    expect(mockTemplateStore.addTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Current Adventure',
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
    
    const nameInput = screen.getByPlaceholderText('New template name');
    const createButton = screen.getByTestId('create-template-btn');
    
    fireEvent.change(nameInput, { target: { value: 'No Stories Adventure' } });
    fireEvent.click(createButton);
    
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

  it('should allow editing template name, prompts, and config from the UI', async () => {
    render(<TemplateManager />);

    // Select the template to edit
    fireEvent.click(screen.getByText('Test Adventure'));
    // Click Edit to show the edit form
    fireEvent.click(screen.getByTestId('edit-template-btn'));

    // Edit name
    const nameInput = screen.getByDisplayValue('Test Adventure');
    fireEvent.change(nameInput, { target: { value: 'Epic Quest' } });
    expect(nameInput).toHaveValue('Epic Quest');

    // Edit a prompt
    const promptInput = screen.getByDisplayValue('Describe this image in detail for an RPG adventure.');
    fireEvent.change(promptInput, { target: { value: 'Describe the scene for a fantasy RPG.' } });
    expect(promptInput).toHaveValue('Describe the scene for a fantasy RPG.');

    // Edit config
    const maxTurnsInput = screen.getByLabelText('Max Turns');
    fireEvent.change(maxTurnsInput, { target: { value: 5 } });
    expect(maxTurnsInput).toHaveValue(5);

    // Save changes
    const saveButton = screen.getByTestId('save-template-btn');
    fireEvent.click(saveButton);

    await waitFor(() => {
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
  });

  it('should show validation errors for missing required fields when saving a template', async () => {
    render(<TemplateManager />);
    fireEvent.click(screen.getByText('Test Adventure'));
    fireEvent.click(screen.getByTestId('edit-template-btn'));

    // Clear the name field
    const nameInput = screen.getByDisplayValue('Test Adventure');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Try to save
    const saveButton = screen.getByTestId('save-template-btn');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Template name is required')).toBeInTheDocument();
    });
  });

  it('should show an error if importing an invalid template (missing required fields)', async () => {
    render(<TemplateManager />);

    const file = new File(['{"invalid": "template"}'], 'invalid.json', { type: 'application/json' });
    const input = screen.getByTestId('template-file-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Invalid template file.')).toBeInTheDocument();
    });
  });

  describe('Toast notifications', () => {
    it('shows a toast when exporting a template', async () => {
      render(<TemplateManager />);
      const exportBtn = screen.getByTestId('export-template-btn');
      fireEvent.click(exportBtn);
      // Verify toast was called
      expect(mockToast).toHaveBeenCalledWith('Template exported successfully!');
    });
  });
}); 