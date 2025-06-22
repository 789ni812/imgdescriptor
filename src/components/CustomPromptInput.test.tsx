import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomPromptInput } from './CustomPromptInput';

describe('CustomPromptInput', () => {
  const mockOnPromptChange = jest.fn();

  beforeEach(() => {
    mockOnPromptChange.mockClear();
  });

  it('renders a textarea input field with a label', () => {
    render(<CustomPromptInput onPromptChange={mockOnPromptChange} />);
    
    expect(screen.getByLabelText(/custom prompt/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays a default placeholder text', () => {
    render(<CustomPromptInput onPromptChange={mockOnPromptChange} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder', 'Describe this image in detail.');
  });

  it('handles user input changes', () => {
    render(<CustomPromptInput onPromptChange={mockOnPromptChange} />);
    
    const textarea = screen.getByRole('textbox');
    const testPrompt = 'Analyze the colors and composition of this image';
    
    fireEvent.change(textarea, { target: { value: testPrompt } });
    
    expect(textarea).toHaveValue(testPrompt);
  });

  it('calls onPromptChange callback when user types', () => {
    render(<CustomPromptInput onPromptChange={mockOnPromptChange} />);
    
    const textarea = screen.getByRole('textbox');
    const testPrompt = 'Focus on the architectural elements';
    
    fireEvent.change(textarea, { target: { value: testPrompt } });
    
    expect(mockOnPromptChange).toHaveBeenCalledWith(testPrompt);
  });

  it('displays the initial value when provided', () => {
    const initialValue = 'Initial prompt text';
    render(
      <CustomPromptInput 
        onPromptChange={mockOnPromptChange} 
        value={initialValue}
      />
    );
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(initialValue);
  });

  it('has proper accessibility attributes', () => {
    render(<CustomPromptInput onPromptChange={mockOnPromptChange} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('id');
    expect(textarea).toHaveAttribute('name', 'custom-prompt');
  });
}); 