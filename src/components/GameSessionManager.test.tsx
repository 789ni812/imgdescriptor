import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GameSessionManager from './GameSessionManager';
import { useCharacterStore } from '@/lib/stores/characterStore';
import { useTemplateStore } from '@/lib/stores/templateStore';
import { useDMStore } from '@/lib/stores/dmStore';

// Mock the stores
jest.mock('@/lib/stores/characterStore');
jest.mock('@/lib/stores/templateStore');
jest.mock('@/lib/stores/dmStore');

// Mock window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

const mockCharacterStore = {
  character: {
    persona: 'Adventurer',
    currentTurn: 2,
    imageHistory: [{ id: 'img1', url: '/test.jpg', description: 'Test image', story: 'Test story', turn: 1, uploadedAt: '2025-01-27T10:00:00Z' }],
    storyHistory: [{ id: 'img1', text: 'Test story', imageDescription: 'Test image', turnNumber: 1, timestamp: '2025-01-27T10:00:00Z' }],
    choicesHistory: [],
    choiceHistory: [],
    traits: ['brave', 'curious'],
    stats: { creativity: 10, intelligence: 10, perception: 10, wisdom: 10 },
    health: 100,
    heartrate: 70,
    age: 25,
    level: 1,
    experience: 0,
  },
  updateCharacter: jest.fn(),
};

const mockTemplateStore = {
  templates: [
    {
      id: 'template-1',
      name: 'Forest Adventure',
      type: 'game',
      character: { persona: 'Explorer' },
      images: [
        { id: 'img1', url: '/forest.jpg', description: 'A mysterious forest', story: 'The explorer enters the forest...', turn: 1, uploadedAt: '2025-01-27T10:00:00Z' },
        { id: 'img2', url: '/cave.jpg', description: 'A dark cave', story: 'The explorer finds a cave...', turn: 2, uploadedAt: '2025-01-27T10:01:00Z' },
      ],
      finalStory: 'The explorer completes their journey.',
      choicesHistory: [],
      choiceHistory: [],
    },
  ],
  addTemplate: jest.fn(),
  loadTemplate: jest.fn(),
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

describe('GameSessionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true); // Default to true for confirm dialogs
    (useCharacterStore as unknown as jest.Mock).mockReturnValue(mockCharacterStore);
    (useTemplateStore as unknown as jest.Mock).mockReturnValue(mockTemplateStore);
    (useDMStore as unknown as jest.Mock).mockReturnValue(mockDMStore);
  });

  it('should render game session manager', () => {
    render(<GameSessionManager />);
    
    expect(screen.getByText('Game Session Manager')).toBeInTheDocument();
    expect(screen.getByText('Save Session')).toBeInTheDocument();
    expect(screen.getByText('Load Session')).toBeInTheDocument();
  });

  it('should show current session info', () => {
    render(<GameSessionManager />);
    
    expect(screen.getByText('Turn: 2')).toBeInTheDocument();
    expect(screen.getByText('Images: 1')).toBeInTheDocument();
    expect(screen.getByText('Character: Adventurer')).toBeInTheDocument();
  });

  it('should show save form when Save Session is clicked', () => {
    render(<GameSessionManager />);
    
    fireEvent.click(screen.getByText('Save Session'));
    
    expect(screen.getByPlaceholderText('Enter session name')).toBeInTheDocument();
    expect(screen.getByText('Save Game Session')).toBeInTheDocument();
  });

  it('should save game session when form is submitted', async () => {
    render(<GameSessionManager />);
    
    fireEvent.click(screen.getByText('Save Session'));
    
    const nameInput = screen.getByPlaceholderText('Enter session name');
    fireEvent.change(nameInput, { target: { value: 'My Adventure' } });
    
    fireEvent.click(screen.getByText('Save Game Session'));
    
    await waitFor(() => {
      expect(mockTemplateStore.addTemplate).toHaveBeenCalledWith(expect.objectContaining({
        name: 'My Adventure',
        character: expect.objectContaining({
          persona: 'Adventurer',
          traits: expect.any(Array),
          stats: expect.any(Object),
          health: 100,
          heartrate: 70,
          age: 25,
          level: 1,
          experience: 0,
        }),
        images: expect.any(Array),
        choicesHistory: expect.any(Array),
        choiceHistory: expect.any(Array),
      }));
    });
  });

  it('should show load options when Load Session is clicked', () => {
    render(<GameSessionManager />);
    
    fireEvent.click(screen.getByText('Load Session'));
    
    expect(screen.getByText('Game Sessions (1)')).toBeInTheDocument();
    expect(screen.getByText('Forest Adventure')).toBeInTheDocument();
  });

  it('should show session status badges', () => {
    render(<GameSessionManager />);
    
    fireEvent.click(screen.getByText('Load Session'));
    
    // Should show "Complete" for game session with final story
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('should load game session when Load button is clicked', () => {
    render(<GameSessionManager />);
    
    fireEvent.click(screen.getByText('Load Session'));
    const loadButtons = screen.getAllByText('Load');
    fireEvent.click(loadButtons[0]);
    
    expect(mockTemplateStore.selectTemplate).toHaveBeenCalledWith('template-1');
  });

  it('should delete template when Delete button is clicked', () => {
    render(<GameSessionManager />);
    
    fireEvent.click(screen.getByText('Load Session'));
    fireEvent.click(screen.getByText('Delete'));
    
    expect(mockTemplateStore.deleteTemplate).toHaveBeenCalledWith('template-1');
  });

  it('should disable save buttons when no session name is provided', () => {
    render(<GameSessionManager />);
    
    fireEvent.click(screen.getByText('Save Session'));
    
    const saveGameButton = screen.getByText('Save Game Session');
    
    expect(saveGameButton).toBeDisabled();
  });

  it('should enable save buttons when session name is provided', () => {
    render(<GameSessionManager />);
    
    fireEvent.click(screen.getByText('Save Session'));
    
    const nameInput = screen.getByPlaceholderText('Enter session name');
    fireEvent.change(nameInput, { target: { value: 'My Adventure' } });
    
    const saveGameButton = screen.getByText('Save Game Session');
    
    expect(saveGameButton).not.toBeDisabled();
  });

  it('should show empty state when no templates exist', () => {
    const emptyTemplateStore = {
      ...mockTemplateStore,
      templates: [],
    };
    (useTemplateStore as unknown as jest.Mock).mockReturnValue(emptyTemplateStore);
    
    render(<GameSessionManager />);
    
    fireEvent.click(screen.getByText('Load Session'));
    
    expect(screen.getByText('No saved game sessions')).toBeInTheDocument();
  });
}); 