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

  it('should display a drag and drop message', () => {
    renderComponent();
    expect(screen.getByText(/drag & drop your image here, or click to select/i)).toBeInTheDocument();
  });
}); 