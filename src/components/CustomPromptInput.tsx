import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';

interface CustomPromptInputProps {
  onPromptChange: (prompt: string) => void;
  value?: string;
  disabled?: boolean;
}

export const CustomPromptInput: React.FC<CustomPromptInputProps> = ({
  onPromptChange,
  value,
  disabled = false,
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  
  // Update local value when prop changes
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    
    const newValue = event.target.value;
    setLocalValue(newValue);
    onPromptChange(newValue);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <label htmlFor="custom-prompt" className="block text-sm font-medium text-card-foreground">
          Custom Prompt
        </label>
        <textarea
          id="custom-prompt"
          name="custom-prompt"
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Describe this image in detail."
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground border-border placeholder-muted-foreground ${
            disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''
          }`}
          rows={3}
        />
      </CardContent>
    </Card>
  );
}; 