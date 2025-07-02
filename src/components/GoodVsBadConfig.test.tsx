import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GoodVsBadConfig from './GoodVsBadConfig';
import { createGoodVsBadConfig } from '@/lib/types/goodVsBad';

// Mock URL.createObjectURL for file upload tests
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
Object.defineProperty(global, 'URL', {
  value: class URL {
    static createObjectURL = mockCreateObjectURL;
  },
  writable: true,
});

describe('GoodVsBadConfig', () => {
  const defaultProps = {
    config: createGoodVsBadConfig(),
    onConfigChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with default state', () => {
    render(<GoodVsBadConfig {...defaultProps} />);
    
    expect(screen.getByText(/Good vs Bad System/i)).toBeInTheDocument();
    expect(screen.getByText(/Enable Good vs Bad Dynamic/i)).toBeInTheDocument();
    expect(screen.getByText(/Theme/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bad profile picture/i)).toBeInTheDocument();
    expect(screen.getByText(/Define "Bad"/i)).toBeInTheDocument();
  });

  it('shows disabled state when system is not enabled', () => {
    render(<GoodVsBadConfig {...defaultProps} />);
    
    const enableToggle = screen.getByRole('checkbox', { name: /enable good vs bad dynamic/i });
    expect(enableToggle).not.toBeChecked();
    
    // Bad definition field should be disabled
    const badDefinitionField = screen.getByLabelText(/define "bad"/i);
    expect(badDefinitionField).toBeDisabled();
  });

  it('enables configuration when toggle is switched on', async () => {
    const onConfigChange = jest.fn();
    
    render(<GoodVsBadConfig {...defaultProps} onConfigChange={onConfigChange} />);
    
    const enableToggle = screen.getByRole('checkbox', { name: /enable good vs bad dynamic/i });
    fireEvent.click(enableToggle);
    
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        isEnabled: true
      })
    );
  });

  it('allows theme selection when enabled', () => {
    const onConfigChange = jest.fn();
    const enabledConfig = createGoodVsBadConfig({ isEnabled: true });
    
    render(<GoodVsBadConfig 
      {...defaultProps} 
      config={enabledConfig}
      onConfigChange={onConfigChange} 
    />);
    
    const themeSelect = screen.getByLabelText(/theme/i);
    fireEvent.change(themeSelect, { target: { value: 'yin-yang' } });
    
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'yin-yang'
      })
    );
  });

  it('allows custom role definitions', () => {
    const onConfigChange = jest.fn();
    const enabledConfig = createGoodVsBadConfig({ isEnabled: true });
    
    render(<GoodVsBadConfig 
      {...defaultProps} 
      config={enabledConfig}
      onConfigChange={onConfigChange} 
    />);
    
    const userRoleField = screen.getByLabelText(/your role/i);
    const badRoleField = screen.getByLabelText(/bad role/i);
    
    fireEvent.change(userRoleField, { target: { value: 'protector' } });
    fireEvent.change(badRoleField, { target: { value: 'corruptor' } });
    
    // Check that both changes were made (separate calls)
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        userRole: 'protector'
      })
    );
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        badRole: 'corruptor'
      })
    );
  });

  it('allows bad definition input when enabled', () => {
    const onConfigChange = jest.fn();
    const enabledConfig = createGoodVsBadConfig({ isEnabled: true });
    
    render(<GoodVsBadConfig 
      {...defaultProps} 
      config={enabledConfig}
      onConfigChange={onConfigChange} 
    />);
    
    const badDefinitionField = screen.getByLabelText(/define "bad"/i);
    fireEvent.change(badDefinitionField, { 
      target: { value: 'A mysterious dark force that seeks to corrupt the world' } 
    });
    
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        badDefinition: 'A mysterious dark force that seeks to corrupt the world'
      })
    );
  });

  it('shows profile picture upload when enabled', () => {
    const enabledConfig = createGoodVsBadConfig({ 
      isEnabled: true,
      badProfilePicture: '/images/villain.jpg'
    });
    
    render(<GoodVsBadConfig {...defaultProps} config={enabledConfig} />);
    
    expect(screen.getByText(/bad profile picture/i)).toBeInTheDocument();
    expect(screen.getByAltText(/bad profile/i)).toHaveAttribute('src', expect.stringContaining('villain.jpg'));
  });

  it('handles profile picture upload', () => {
    const onConfigChange = jest.fn();
    const enabledConfig = createGoodVsBadConfig({ isEnabled: true });
    
    render(<GoodVsBadConfig 
      {...defaultProps} 
      config={enabledConfig}
      onConfigChange={onConfigChange} 
    />);
    
    const file = new File(['test'], 'villain.jpg', { type: 'image/jpeg' });
    const uploadInput = screen.getByLabelText(/upload bad profile picture/i);
    
    fireEvent.change(uploadInput, { target: { files: [file] } });
    
    // The component should call onConfigChange when a file is uploaded
    // Note: URL.createObjectURL might not work in test environment
    expect(onConfigChange).toHaveBeenCalled();
  });

  it('shows validation error for empty bad definition when enabled', () => {
    const onConfigChange = jest.fn();
    const enabledConfig = createGoodVsBadConfig({ isEnabled: true });
    
    render(<GoodVsBadConfig 
      {...defaultProps} 
      config={enabledConfig}
      onConfigChange={onConfigChange} 
    />);
    
    const badDefinitionField = screen.getByLabelText(/define "bad"/i);
    fireEvent.change(badDefinitionField, { target: { value: '' } });
    
    // Trigger validation by blurring the field
    fireEvent.blur(badDefinitionField);
    
    expect(screen.getByText(/bad definition is required when enabled/i)).toBeInTheDocument();
  });

  it('disables all fields when system is disabled', () => {
    render(<GoodVsBadConfig {...defaultProps} />);
    
    const themeSelect = screen.getByLabelText(/theme/i);
    const badDefinitionField = screen.getByLabelText(/define "bad"/i);
    const userRoleField = screen.getByLabelText(/your role/i);
    const badRoleField = screen.getByLabelText(/bad role/i);
    
    expect(themeSelect).toBeDisabled();
    expect(badDefinitionField).toBeDisabled();
    expect(userRoleField).toBeDisabled();
    expect(badRoleField).toBeDisabled();
  });

  it('shows current configuration values', () => {
    const config = createGoodVsBadConfig({
      isEnabled: true,
      theme: 'yin-yang',
      userRole: 'light',
      badRole: 'dark',
      badDefinition: 'A mysterious dark force',
      badProfilePicture: '/images/villain.jpg'
    });
    
    render(<GoodVsBadConfig {...defaultProps} config={config} />);
    
    // Check select value by checking if the option is selected
    const themeSelect = screen.getByLabelText(/theme/i);
    expect(themeSelect).toHaveValue('yin-yang');
    
    expect(screen.getByDisplayValue('light')).toBeInTheDocument();
    expect(screen.getByDisplayValue('dark')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A mysterious dark force')).toBeInTheDocument();
    expect(screen.getByAltText(/bad profile/i)).toHaveAttribute('src', expect.stringContaining('villain.jpg'));
  });
}); 