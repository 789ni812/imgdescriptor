// API Response Types
export interface AnalyzeImageResponse {
  success: boolean;
  description?: string;
  error?: string;
}

export interface AnalyzeImageRequest {
  image: string; // base64 encoded
  prompt: string;
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  acceptedFormats?: string[];
  maxSize?: number;
}

export interface ImagePreviewProps {
  imageUrl: string | null;
  isLoading?: boolean;
  alt?: string;
  onRemove?: () => void;
  error?: string | null;
  generationTime?: number | null;
}

export interface DescriptionDisplayProps {
  description: string | null;
  isLoading: boolean;
  error: string | null;
}

// Props for the StoryDisplay component
export interface StoryDisplayProps {
  story: string | null;
  isLoading: boolean;
  error: string | null;
}

// File Upload Types
export interface UploadedFile {
  file: File;
  previewUrl: string;
  size: number;
  type: string;
}

// Error Types
export interface AppError {
  message: string;
  type: 'network' | 'model' | 'file' | 'general';
  details?: string;
}

export type AnalysisResult = {
  success: boolean;
  description?: string;
  error?: string;
};

export type StoryResult = {
  success: boolean;
  story?: string;
  error?: string;
}; 