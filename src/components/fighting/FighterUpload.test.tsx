import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FighterUpload from './FighterUpload';

// Mock the fighting game store
jest.mock('@/lib/stores/fightingGameStore', () => ({
  useFightingGameStore: jest.fn(() => ({
    addFighter: jest.fn(),
  })),
}));

describe('FighterUpload', () => {
  const mockProps = {
    fighterId: 'fighter-a',
    fighterLabel: 'Fighter A',
    onFighterCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  it('renders the fighter upload component with correct label', () => {
    render(<FighterUpload {...mockProps} />);
    // Use heading role for the main label
    expect(screen.getByRole('heading', { name: /Fighter A/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByText(/Upload image for Fighter A/i)).toBeInTheDocument();
  });

  it('shows upload button when no image is selected', () => {
    render(<FighterUpload {...mockProps} />);
    expect(screen.getByRole('button', { name: /Upload Image/i })).toBeInTheDocument();
  });

  it('shows file input when upload button is clicked', () => {
    render(<FighterUpload {...mockProps} />);
    const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
    fireEvent.click(uploadButton);
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
  });

  it('displays loading state when image is being processed', async () => {
    // Mock fetch for analyze-image to return a pending promise
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
    render(<FighterUpload {...mockProps} />);
    const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
    fireEvent.click(uploadButton);
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    // Wait for the uploading spinner
    await waitFor(() => {
      expect(screen.getByText(/Uploading image.../i)).toBeInTheDocument();
    });
  });

  it('shows fighter stats after successful upload and analysis', async () => {
    const mockFighter = {
      id: 'fighter-1',
      name: 'Test Fighter',
      imageUrl: 'test-url',
      description: 'A strong warrior',
      stats: {
        health: 150,
        maxHealth: 150,
        strength: 15,
        luck: 12,
        agility: 10,
        defense: 8,
        age: 25,
        size: 'medium' as const,
        build: 'muscular' as const,
      },
      visualAnalysis: {
        age: 'young adult',
        size: 'medium',
        build: 'muscular',
        appearance: ['strong', 'confident'],
        weapons: [],
        armor: [],
      },
      combatHistory: [],
      winLossRecord: { wins: 0, losses: 0, draws: 0 },
      createdAt: new Date().toISOString(),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ description: 'A strong warrior' }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ fighter: mockFighter }),
    });
    render(<FighterUpload {...mockProps} />);
    const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
    fireEvent.click(uploadButton);
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('Test Fighter')).toBeInTheDocument();
      expect(screen.getByText('Health: 150')).toBeInTheDocument();
      expect(screen.getByText('Strength: 15')).toBeInTheDocument();
    });
  });

  it('shows error message when upload fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));
    render(<FighterUpload {...mockProps} />);
    const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
    fireEvent.click(uploadButton);
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
    });
  });
}); 