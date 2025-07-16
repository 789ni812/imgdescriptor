import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ENHANCED_FIGHTER_ANALYSIS_PROMPT } from '@/lib/constants';

interface FighterImageUploadProps {
  onUploadComplete: (data: { url: string; analysis: any; file: File }) => void;
  disabled?: boolean;
  label?: string;
  category?: string;
}

export const FighterImageUpload: React.FC<FighterImageUploadProps> = ({
  onUploadComplete,
  disabled = false,
  label = 'Upload Image',
  category = 'fighter',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Automatically upload and analyze as soon as a file is selected
  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const url = data.url;
      setUploading(false);
      setAnalyzing(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Image = (reader.result as string).split(',')[1];
          
          // Create enhanced prompt that includes filename for famous person identification
          const enhancedPrompt = `${ENHANCED_FIGHTER_ANALYSIS_PROMPT}

FILENAME CONTEXT: ${file.name}
If this filename contains a famous person's name, prioritize identifying them in your analysis.`;
          
          const res = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image, prompt: enhancedPrompt }),
          });
          if (!res.ok) throw new Error('Analysis failed');
          const analysis: Record<string, unknown> = await res.json();
          setAnalyzing(false);
          onUploadComplete({ url, analysis, file });
          setSelectedFile(null);
        } catch {
          setError('Failed to analyze image.');
          setAnalyzing(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file.');
        setAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Failed to upload image.');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && !disabled) {
      handleFileSelected(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.jpg'] },
    multiple: false,
    disabled,
  });

  return (
    <div className="space-y-4">
      <div {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} data-testid="file-input" />
        <p className="text-gray-700 font-medium">{label}</p>
        <p className="text-gray-500 text-sm">Drag & drop or click to select an image</p>
        {selectedFile && <p className="text-blue-700 text-xs mt-2">Selected: {selectedFile.name}</p>}
      </div>
      {(uploading || analyzing) && (
        <div className="flex items-center justify-center space-x-2 text-gray-300">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>{analyzing ? 'Analyzing image...' : 'Uploading image...'}</span>
        </div>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}; 