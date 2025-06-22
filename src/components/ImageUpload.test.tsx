import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ImageUpload } from './ImageUpload';
import { ImageUploadProps } from '@/lib/types';

const mockOnImageSelect = jest.fn();

const renderComponent = (props: Partial<ImageUploadProps> = {}) => {
  const defaultProps: ImageUploadProps = {
    onImageSelect: mockOnImageSelect,
  };
  return render(<ImageUpload {...defaultProps} {...props} />);
};

describe('ImageUpload Component - UI Overhaul', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render a visually distinct dropzone area', () => {
    renderComponent();
    // The dropzone will have a specific test ID
    expect(screen.getByTestId('dropzone')).toBeInTheDocument();
  });

  it('should display an upload icon', () => {
    renderComponent();
    // The icon will be identified by a test ID
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
  });

  it('should display instructional text for the user', () => {
    renderComponent();
    expect(screen.getByText(/drag & drop your image here/i)).toBeInTheDocument();
    expect(screen.getByText(/or click to select a file/i)).toBeInTheDocument();
  });

  it('should have a visually hidden but functional file input', () => {
    renderComponent();
    const inputElement = screen.getByLabelText(/upload an image/i);
    // The 'sr-only' class is a common Tailwind utility to hide elements visually
    // but keep them accessible to screen readers.
    expect(inputElement).toHaveClass('sr-only');
  });

  // --- Keeping existing logic tests ---

  it('should call onImageSelect with the file when a user selects an image', async () => {
    renderComponent();
    const dropzone = screen.getByTestId('dropzone');
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

    await act(async () => {
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
          items: [
            {
              kind: 'file',
              type: file.type,
              getAsFile: () => file,
            },
          ],
          types: ['Files'],
        },
      });
    });

    expect(mockOnImageSelect).toHaveBeenCalledWith(file);
  });

  it('should not call onImageSelect for an invalid file type', async () => {
    renderComponent();
    const dropzone = screen.getByTestId('dropzone');
    const invalidFile = new File(['...'], 'document.txt', { type: 'text/plain' });

    await act(async () => {
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [invalidFile],
          items: [
            {
              kind: 'file',
              type: invalidFile.type,
              getAsFile: () => invalidFile,
            },
          ],
          types: ['Files'],
        },
      });
    });

    expect(mockOnImageSelect).not.toHaveBeenCalled();
  });
}); 