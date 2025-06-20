import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageUpload } from './ImageUpload';
import { ImageUploadProps } from '@/lib/types';

const mockOnImageSelect = jest.fn();

const renderComponent = (props: Partial<ImageUploadProps> = {}) => {
  const defaultProps: ImageUploadProps = {
    onImageSelect: mockOnImageSelect,
  };
  return render(<ImageUpload {...defaultProps} {...props} />);
};

describe('ImageUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render a file input to allow file selection', () => {
    renderComponent();
    const inputElement = screen.getByLabelText(/upload an image/i).querySelector('input[type="file"]');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'file');
  });

  it('should call onImageSelect with the file when a user selects an image', () => {
    renderComponent();
    const inputElement = screen.getByLabelText(/upload an image/i).querySelector('input[type="file"]');
    expect(inputElement).not.toBeNull();

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

    fireEvent.change(inputElement!, {
      target: { files: [file] },
    });

    expect(mockOnImageSelect).toHaveBeenCalledTimes(1);
    expect(mockOnImageSelect).toHaveBeenCalledWith(file);
  });

  it('should not call onImageSelect if the file is too large', () => {
    // Mock console.error to prevent logging during this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const maxSize = 1024; // 1KB for testing
    renderComponent({ maxSize });

    const inputElement = screen.getByLabelText(/upload an image/i).querySelector('input[type="file"]');
    expect(inputElement).not.toBeNull();

    // Create a file larger than the max size
    const largeFile = new File(['a'.repeat(2048)], 'large.png', { type: 'image/png' });

    fireEvent.change(inputElement!, {
      target: { files: [largeFile] },
    });

    expect(mockOnImageSelect).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('File is too large'));

    // Clean up the spy
    consoleErrorSpy.mockRestore();
  });

  it('should not call onImageSelect for an invalid file type', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    renderComponent();
    const inputElement = screen.getByLabelText(/upload an image/i).querySelector('input[type="file"]');
    expect(inputElement).not.toBeNull();

    const invalidFile = new File(['dummy content'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(inputElement!, {
      target: { files: [invalidFile] },
    });

    expect(mockOnImageSelect).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid file type'));
    consoleErrorSpy.mockRestore();
  });

  it('should display a drag and drop message', () => {
    renderComponent();
    expect(screen.getByText(/drag & drop your image here, or click to select/i)).toBeInTheDocument();
  });
}); 