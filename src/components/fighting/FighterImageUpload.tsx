import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FighterImageUploadProps {
  onUploadComplete: (result: { url: string; analysis: any; file: File }) => void;
  disabled?: boolean;
  label?: string;
}

export const FighterImageUpload: React.FC<FighterImageUploadProps> = ({
  onUploadComplete,
  disabled = false,
  label = 'Upload Image',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && !disabled) {
      setSelectedFile(acceptedFiles[0]);
      setError(null);
    }
  }, [disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.jpg'] },
    multiple: false,
    disabled,
  });

  const uploadImageToApi = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.url;
    } catch (e) {
      setError('Failed to upload image.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const analyzeImage = async (file: File): Promise<any> => {
    setAnalyzing(true);
    try {
      const reader = new FileReader();
      return await new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Image = (reader.result as string).split(',')[1];
            const res = await fetch('/api/analyze-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: base64Image, prompt: 'Describe this fighter.' }),
            });
            if (!res.ok) throw new Error('Analysis failed');
            const data = await res.json();
            resolve(data);
          } catch (err) {
            setError('Failed to analyze image.');
            reject(err);
          } finally {
            setAnalyzing(false);
          }
        };
        reader.onerror = () => {
          setError('Failed to read image file.');
          setAnalyzing(false);
          reject(new Error('File read error'));
        };
        reader.readAsDataURL(file);
      });
    } catch (e) {
      setError('Failed to analyze image.');
      setAnalyzing(false);
      return null;
    }
  };

  const handleUpload = async () => {
    setError(null);
    if (!selectedFile) return;
    const url = await uploadImageToApi(selectedFile);
    if (!url) return;
    const analysis = await analyzeImage(selectedFile);
    if (!analysis) return;
    onUploadComplete({ url, analysis, file: selectedFile });
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <div {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-700 font-medium">{label}</p>
        <p className="text-gray-500 text-sm">Drag & drop or click to select an image</p>
        {selectedFile && <p className="text-blue-700 text-xs mt-2">Selected: {selectedFile.name}</p>}
      </div>
      {selectedFile && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleUpload}
          disabled={uploading || analyzing || disabled}
        >
          {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Upload & Analyze'}
        </button>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}; 