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
      userRole: 'protector',
      badRole: 'corruptor',
      badDefinition: 'A dark force seeking to corrupt the world',
      badProfilePicture: '/images/villain.jpg'
    });
    
    render(<GoodVsBadConfig {...defaultProps} config={config} />);
    
    // Check select value by checking if the option is selected
    const themeSelect = screen.getByLabelText(/theme/i);
    expect(themeSelect).toHaveValue('yin-yang');
    
    expect(screen.getByDisplayValue('protector')).toBeInTheDocument();
    expect(screen.getByDisplayValue('corruptor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A dark force seeking to corrupt the world')).toBeInTheDocument();
  });

  it('displays enhanced villain personality configuration when advanced config is shown', () => {
    const enabledConfig = createGoodVsBadConfig({ isEnabled: true });
    
    render(<GoodVsBadConfig {...defaultProps} config={enabledConfig} />);
    
    // Click to show advanced configuration
    const advancedButton = screen.getByText(/show advanced configuration/i);
    fireEvent.click(advancedButton);
    
    // Check for villain personality section
    expect(screen.getByText(/villain personality/i)).toBeInTheDocument();
    
    // Check for detailed villain characteristics - use more specific queries
    expect(screen.getByText('Motivations')).toBeInTheDocument();
    expect(screen.getByText('Fears')).toBeInTheDocument();
    expect(screen.getByText('Strengths')).toBeInTheDocument();
    expect(screen.getByText('Weaknesses')).toBeInTheDocument();
    expect(screen.getByText('Backstory')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Speech Style')).toBeInTheDocument();
    expect(screen.getByText('Dialogue Patterns')).toBeInTheDocument();
    expect(screen.getByText('Relationship with Player')).toBeInTheDocument();
    expect(screen.getByText('Influence Level (1-10)')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Territory')).toBeInTheDocument();
  });

  it('allows editing of villain personality fields', () => {
    const onConfigChange = jest.fn();
    const enabledConfig = createGoodVsBadConfig({ isEnabled: true });
    
    render(<GoodVsBadConfig 
      {...defaultProps} 
      config={enabledConfig}
      onConfigChange={onConfigChange} 
    />);
    
    // Show advanced configuration
    const advancedButton = screen.getByText(/show advanced configuration/i);
    fireEvent.click(advancedButton);
    
    // Edit backstory - find the textarea by placeholder
    const backstoryField = screen.getByPlaceholderText(/enter villain backstory/i);
    fireEvent.change(backstoryField, { 
      target: { value: 'A fallen hero who seeks redemption through power' } 
    });
    
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        villainPersonality: expect.objectContaining({
          backstory: 'A fallen hero who seeks redemption through power'
        })
      })
    );
  });

  it('allows adding and removing array items in villain personality', () => {
    const onConfigChange = jest.fn();
    const enabledConfig = createGoodVsBadConfig({ isEnabled: true });
    
    render(<GoodVsBadConfig 
      {...defaultProps} 
      config={enabledConfig}
      onConfigChange={onConfigChange} 
    />);
    
    // Show advanced configuration
    const advancedButton = screen.getByText(/show advanced configuration/i);
    fireEvent.click(advancedButton);
    
    // Add a new motivation
    const addMotivationButton = screen.getByText(/add motivation/i);
    fireEvent.click(addMotivationButton);
    
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        villainPersonality: expect.objectContaining({
          motivations: expect.arrayContaining([''])
        })
      })
    );
  });

  it('displays villain state configuration when advanced config is shown', () => {
    const enabledConfig = createGoodVsBadConfig({ isEnabled: true });
    
    render(<GoodVsBadConfig {...defaultProps} config={enabledConfig} />);
    
    // Show advanced configuration
    const advancedButton = screen.getByText(/show advanced configuration/i);
    fireEvent.click(advancedButton);
    
    // Check for villain state section
    expect(screen.getByText('Villain State')).toBeInTheDocument();
    
    // Check for state tracking fields - use more specific queries
    expect(screen.getByText('Health (0-100)')).toBeInTheDocument();
    expect(screen.getByText('Resources (0-100)')).toBeInTheDocument();
    expect(screen.getByText('Influence (0-100)')).toBeInTheDocument();
    expect(screen.getByText('Anger (0-100)')).toBeInTheDocument();
    expect(screen.getByText('Respect for Player (0-100)')).toBeInTheDocument();
    expect(screen.getByText('Current Goal')).toBeInTheDocument();
    expect(screen.getByText('Last Action')).toBeInTheDocument();
  });

  it('displays conflict mechanics configuration when advanced config is shown', () => {
    const enabledConfig = createGoodVsBadConfig({ isEnabled: true });
    
    render(<GoodVsBadConfig {...defaultProps} config={enabledConfig} />);
    
    // Show advanced configuration
    const advancedButton = screen.getByText(/show advanced configuration/i);
    fireEvent.click(advancedButton);
    
    // Check for conflict mechanics section
    expect(screen.getByText('Conflict Mechanics')).toBeInTheDocument();
    
    // Check for conflict fields - use more specific queries
    expect(screen.getByText('Escalation Level (1-10)')).toBeInTheDocument();
    expect(screen.getByText('Confrontation Type')).toBeInTheDocument();
    expect(screen.getByText('Villain Reaction Style')).toBeInTheDocument();
    expect(screen.getByText('Player Advantage (-10 to +10)')).toBeInTheDocument();
    expect(screen.getByText('Villain Advantage (-10 to +10)')).toBeInTheDocument();
  });
}); 