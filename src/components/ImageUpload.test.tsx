import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ImageUpload } from './ImageUpload';
import { ImageUploadProps } from '@/lib/types';

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
    expect(icon).toHaveClass('w-14', 'h-14', 'text-gray-400', 'heroicon-stroke-1');
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

  it('should call onImageSelect with the file when a user selects an image via drop', async () => {
    renderComponent();
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

    expect(mockOnImageSelect).toHaveBeenCalledWith(file);
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
  });
}); 