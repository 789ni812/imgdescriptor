import React, { useState } from 'react';
import { GoodVsBadConfig as GoodVsBadConfigType, GoodVsBadTheme } from '@/lib/types/goodVsBad';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import Image from 'next/image';

interface GoodVsBadConfigProps {
  config: GoodVsBadConfigType;
  onConfigChange: (config: GoodVsBadConfigType) => void;
}

const themes: { value: GoodVsBadTheme; label: string }[] = [
  { value: 'good-vs-bad', label: 'Good vs Bad' },
  { value: 'yin-yang', label: 'Yin & Yang' },
  { value: 'light-vs-dark', label: 'Light vs Dark' },
  { value: 'hero-vs-villain', label: 'Hero vs Villain' }
];

export default function GoodVsBadConfig({ config, onConfigChange }: GoodVsBadConfigProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleToggleChange = (enabled: boolean) => {
    const newConfig = { ...config, isEnabled: enabled };
    if (!enabled) {
      // Reset to defaults when disabling
      newConfig.badDefinition = '';
      newConfig.badProfilePicture = null;
    }
    onConfigChange(newConfig);
    setValidationError(null);
  };

  const handleFieldChange = (field: keyof GoodVsBadConfigType, value: string | GoodVsBadTheme | null) => {
    const newConfig = { ...config, [field]: value };
    onConfigChange(newConfig);
    
    // Clear validation error when user starts typing
    if (field === 'badDefinition' && typeof value === 'string' && value.trim()) {
      setValidationError(null);
    }
  };

  const handleBadDefinitionBlur = () => {
    if (config.isEnabled && !config.badDefinition.trim()) {
      setValidationError('Bad definition is required when enabled');
    } else {
      setValidationError(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create a mock URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      handleFieldChange('badProfilePicture', imageUrl);
    } catch {
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeProfilePicture = () => {
    handleFieldChange('badProfilePicture', null);
  };

  return (
    <Card className="w-full" data-testid="good-vs-bad-config">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Good vs Bad System</span>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enable-good-vs-bad"
              checked={config.isEnabled}
              onChange={(e) => handleToggleChange(e.target.checked)}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring focus:ring-2"
            />
            <label htmlFor="enable-good-vs-bad" className="text-sm font-medium text-card-foreground">
              Enable Good vs Bad Dynamic
            </label>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Theme Selection */}
        <div>
          <label htmlFor="theme" className="block text-sm font-medium mb-2 text-card-foreground">
            Theme
          </label>
          <select
            id="theme"
            value={config.theme}
            onChange={(e) => handleFieldChange('theme', e.target.value as GoodVsBadTheme)}
            disabled={!config.isEnabled}
            className="w-full p-2 border rounded-md bg-background text-foreground border-border placeholder-muted-foreground disabled:bg-muted disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          >
            {themes.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>

        {/* Role Definitions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="userRole" className="block text-sm font-medium mb-2 text-card-foreground">
              Your Role
            </label>
            <input
              type="text"
              id="userRole"
              value={config.userRole}
              onChange={(e) => handleFieldChange('userRole', e.target.value)}
              disabled={!config.isEnabled}
              className="w-full p-2 border rounded-md bg-background text-foreground border-border placeholder-muted-foreground disabled:bg-muted disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              placeholder="e.g., good, light, hero"
            />
          </div>
          <div>
            <label htmlFor="badRole" className="block text-sm font-medium mb-2 text-card-foreground">
              Bad Role
            </label>
            <input
              type="text"
              id="badRole"
              value={config.badRole}
              onChange={(e) => handleFieldChange('badRole', e.target.value)}
              disabled={!config.isEnabled}
              className="w-full p-2 border rounded-md bg-background text-foreground border-border placeholder-muted-foreground disabled:bg-muted disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              placeholder="e.g., bad, dark, villain"
            />
          </div>
        </div>

        {/* Bad Profile Picture */}
        <div>
          <label className="block text-sm font-medium mb-2 text-card-foreground">
            Bad Profile Picture
          </label>
          {config.badProfilePicture ? (
            <div className="flex items-center gap-4">
              <Image
                src={config.badProfilePicture}
                alt="Bad profile"
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
              <Button
                onClick={removeProfilePicture}
                disabled={!config.isEnabled}
                variant="outline"
                size="sm"
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <input
                type="file"
                id="bad-profile-upload"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={!config.isEnabled || isUploading}
                className="hidden"
              />
              <label
                htmlFor="bad-profile-upload"
                className={`cursor-pointer block ${
                  !config.isEnabled || isUploading ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner className="w-4 h-4" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-primary hover:text-primary/80">
                      Upload Bad Profile Picture
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose an image to represent the &quot;bad&quot; force
                    </p>
                  </div>
                )}
              </label>
            </div>
          )}
          {uploadError && <ErrorMessage message={uploadError} />}
        </div>

        {/* Bad Definition */}
        <div>
          <label htmlFor="badDefinition" className="block text-sm font-medium mb-2 text-card-foreground">
            Define &quot;Bad&quot;
          </label>
          <textarea
            id="badDefinition"
            value={config.badDefinition}
            onChange={(e) => handleFieldChange('badDefinition', e.target.value)}
            onBlur={handleBadDefinitionBlur}
            disabled={!config.isEnabled}
            rows={3}
            className="w-full p-2 border rounded-md bg-background text-foreground border-border placeholder-muted-foreground disabled:bg-muted disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            placeholder="Describe what the &apos;bad&apos; force represents in your game..."
          />
          {validationError && <ErrorMessage message={validationError} />}
        </div>

        {/* Help Text */}
        {config.isEnabled && (
          <div className="bg-muted border border-border rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              <strong>How this works:</strong> The Dungeon Master will use your &quot;Bad&quot; definition and profile picture 
              to create a compelling antagonist or opposing force in your story. This adds depth and conflict to your adventure.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 