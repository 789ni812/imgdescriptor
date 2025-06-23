import React, { useState, useEffect } from 'react';

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
    <div className="space-y-2">
      <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700">
        Custom Prompt
      </label>
      <textarea
        id="custom-prompt"
        name="custom-prompt"
        value={localValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Describe this image in detail."
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
        }`}
        rows={3}
      />
    </div>
  );
}; 