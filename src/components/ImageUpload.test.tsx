import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ImageUpload } from './ImageUpload';
import { ImageUploadProps } from '@/lib/types';

// Mock the CustomPromptInput component
jest.mock('./CustomPromptInput', () => ({
  CustomPromptInput: ({ onPromptChange, value }: { onPromptChange: (prompt: string) => void; value?: string }) => (
    <div data-testid="custom-prompt-input">
      <textarea
        data-testid="prompt-textarea"
        value={value || ''}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Custom prompt input"
      />
    </div>
  ),
}));

const mockOnImageSelect = jest.fn();

const renderComponent = (props: Partial<ImageUploadProps> = {}) => {
  const defaultProps: ImageUploadProps = {
    onImageSelect: mockOnImageSelect,
    maxSize: 10 * 1024 * 1024,
  };
  return render(<ImageUpload {...defaultProps} {...props} />);
};

describe('ImageUpload Component', () => {
  beforeEach(() => {
    mockOnImageSelect.mockClear();
  });

  it('should render a visually distinct dropzone area', () => {
    renderComponent();
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
  });

  it('should display an upload icon with correct styling', () => {
    const { container } = renderComponent();
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();

    if (icon) {
      expect(icon).toHaveClass('w-full', 'h-full', 'text-gray-400', 'heroicon-stroke-1');
      const wrapper = icon.parentElement;
      expect(wrapper).toHaveStyle('width: 50px');
      expect(wrapper).toHaveStyle('height: 50px');
    }
  });

  it('should display instructional text for the user', () => {
    renderComponent();
    expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/or drag and drop/i)).toBeInTheDocument();
  });

  it('should have a functional file input', () => {
    const { container } = renderComponent();
    const inputElement = container.querySelector('input[type="file"]');
    expect(inputElement).toBeInTheDocument();
  });

  it('should render the CustomPromptInput component', () => {
    renderComponent();
    expect(screen.getByTestId('custom-prompt-input')).toBeInTheDocument();
  });

  it('should show upload buttons after file selection and call onImageSelect with custom prompt when custom prompt button is clicked', async () => {
    const mockOnImageSelectWithPrompt = jest.fn();
    renderComponent({ onImageSelect: mockOnImageSelectWithPrompt });
    
    const dropzone = screen.getByTestId('image-upload');
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

    // First, set a custom prompt
    const promptTextarea = screen.getByTestId('prompt-textarea');
    fireEvent.change(promptTextarea, { target: { value: 'Analyze the colors and composition' } });

    // Then drop a file
    await act(async () => {
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
          items: [{ kind: 'file', type: file.type, getAsFile: () => file }],
          types: ['Files'],
        },
      });
    });

    // Check that the file selection info and buttons are shown
    expect(screen.getByText('Selected: chucknorris.png')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload with default prompt/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload with custom prompt/i })).toBeInTheDocument();

    // Click the custom prompt button
    const customPromptButton = screen.getByRole('button', { name: /upload with custom prompt/i });
    fireEvent.click(customPromptButton);

    expect(mockOnImageSelectWithPrompt).toHaveBeenCalledWith(file, 'Analyze the colors and composition');
  });

  it('should call onImageSelect with file and default prompt when default prompt button is clicked', async () => {
    const mockOnImageSelectWithPrompt = jest.fn();
    renderComponent({ onImageSelect: mockOnImageSelectWithPrompt });
    
    const dropzone = screen.getByTestId('image-upload');
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

    await act(async () => {
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
          items: [{ kind: 'file', type: file.type, getAsFile: () => file }],
          types: ['Files'],
        },
      });
    });

    // Click the default prompt button
    const defaultPromptButton = screen.getByRole('button', { name: /upload with default prompt/i });
    fireEvent.click(defaultPromptButton);

    expect(mockOnImageSelectWithPrompt).toHaveBeenCalledWith(file, 'Describe this image in detail.');
  });

  it('should not show upload buttons before file selection', () => {
    renderComponent();
    
    expect(screen.queryByRole('button', { name: /upload with default prompt/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /upload with custom prompt/i })).not.toBeInTheDocument();
  });

  it('should not call onImageSelect for an invalid file type', async () => {
    renderComponent();
    const dropzone = screen.getByTestId('image-upload');
    const invalidFile = new File(['...'], 'document.txt', { type: 'text/plain' });

    await act(async () => {
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [invalidFile],
          items: [{ kind: 'file', type: invalidFile.type, getAsFile: () => invalidFile }],
          types: ['Files'],
        },
      });
    });

    expect(mockOnImageSelect).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /upload with default prompt/i })).not.toBeInTheDocument();
  });
}); 