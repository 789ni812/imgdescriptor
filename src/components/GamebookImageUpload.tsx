import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';


interface GamebookImageUploadProps {
  onImageSelect: (image: { url: string; file: File }, prompt?: string) => void;
  disabled?: boolean;
}

export const GamebookImageUpload: React.FC<GamebookImageUploadProps> = ({
  onImageSelect,
  disabled = false,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      onImageSelect({ url, file }, customPrompt || undefined);
    }
  }, [onImageSelect, customPrompt]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif text-amber-800 dark:text-amber-200 mb-2">
          Begin Your Adventure
        </h2>
        <p className="text-amber-600 dark:text-amber-400">
          Upload an image to start your journey
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30' 
            : 'border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          {/* Upload Text */}
          <div>
            {isDragActive ? (
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                Drop your image here...
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-amber-700 dark:text-amber-300 font-medium">
                  Drag & drop an image here, or click to select
                </p>
                <p className="text-amber-600 dark:text-amber-400 text-sm">
                  Supports: JPG, PNG, GIF, WebP
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Prompt Input */}
      <div className="mt-6">
        <label className="block text-amber-700 dark:text-amber-300 font-medium mb-2">
          Optional: Describe what you want to see in this scene
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="e.g., 'A mysterious forest with ancient ruins' or 'A bustling medieval marketplace'"
          className="w-full p-3 border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 placeholder-amber-500 dark:placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          rows={3}
          disabled={disabled}
        />
      </div>

      {/* Help Text */}
      <div className="mt-4 text-center">
        <p className="text-amber-600 dark:text-amber-400 text-sm">
          The AI will analyze your image and create a story around it. 
          Your choices will shape the adventure!
        </p>
      </div>
    </div>
  );
}; 