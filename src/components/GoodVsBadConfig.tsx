import React, { useState } from 'react';
import { GoodVsBadConfig as GoodVsBadConfigType, GoodVsBadTheme, VillainPersonality, VillainState, ConflictMechanics, createDarthVaderConfig, DEFAULT_DARTH_VADER_PERSONALITY, DEFAULT_DARTH_VADER_STATE, DEFAULT_DARTH_VADER_CONFLICT } from '@/lib/types/goodVsBad';
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

const relationshipTypes = [
  { value: 'enemy', label: 'Enemy' },
  { value: 'rival', label: 'Rival' },
  { value: 'corruptor', label: 'Corruptor' },
  { value: 'manipulator', label: 'Manipulator' },
  { value: 'mentor-gone-bad', label: 'Mentor Gone Bad' }
];

const confrontationTypes = [
  { value: 'verbal', label: 'Verbal' },
  { value: 'physical', label: 'Physical' },
  { value: 'psychological', label: 'Psychological' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'mixed', label: 'Mixed' }
];

const reactionStyles = [
  { value: 'aggressive', label: 'Aggressive' },
  { value: 'manipulative', label: 'Manipulative' },
  { value: 'calculating', label: 'Calculating' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'strategic', label: 'Strategic' }
];

export default function GoodVsBadConfig({ config, onConfigChange }: GoodVsBadConfigProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

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

  const handleFieldChange = (field: keyof GoodVsBadConfigType, value: string | GoodVsBadTheme | null | boolean) => {
    const newConfig = { ...config, [field]: value };
    onConfigChange(newConfig);
    
    // Clear validation error when user starts typing
    if (field === 'badDefinition' && typeof value === 'string' && value.trim()) {
      setValidationError(null);
    }
  };

  const handleVillainPersonalityChange = (field: keyof VillainPersonality, value: string | string[] | number) => {
    const currentPersonality = config.villainPersonality || DEFAULT_DARTH_VADER_PERSONALITY;
    const newPersonality = { ...currentPersonality, [field]: value };
    onConfigChange({ ...config, villainPersonality: newPersonality });
  };

  const handleVillainStateChange = (field: keyof VillainState, value: string | string[] | number) => {
    const currentState = config.villainState || DEFAULT_DARTH_VADER_STATE;
    const newState = { ...currentState, [field]: value };
    onConfigChange({ ...config, villainState: newState });
  };

  const handleConflictMechanicsChange = (field: keyof ConflictMechanics, value: string | string[] | number) => {
    const currentMechanics = config.conflictMechanics || DEFAULT_DARTH_VADER_CONFLICT;
    const newMechanics = { ...currentMechanics, [field]: value };
    onConfigChange({ ...config, conflictMechanics: newMechanics });
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

  const applyDarthVaderTemplate = () => {
    const darthVaderConfig = createDarthVaderConfig();
    onConfigChange(darthVaderConfig);
  };

  const handleArrayFieldChange = (field: keyof VillainPersonality, index: number, value: string) => {
    const currentArray = config.villainPersonality?.[field] as string[] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    handleVillainPersonalityChange(field, newArray);
  };

  const addArrayItem = (field: keyof VillainPersonality) => {
    const currentArray = config.villainPersonality?.[field] as string[] || [];
    handleVillainPersonalityChange(field, [...currentArray, '']);
  };

  const removeArrayItem = (field: keyof VillainPersonality, index: number) => {
    const currentArray = config.villainPersonality?.[field] as string[] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    handleVillainPersonalityChange(field, newArray);
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
        {/* Basic Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-card-foreground">Basic Configuration</h3>
          
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
        </div>

        {/* Advanced Configuration Toggle */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">Advanced Configuration</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
            disabled={!config.isEnabled}
          >
            {showAdvancedConfig ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>

        {/* Quick Templates */}
        {config.isEnabled && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={applyDarthVaderTemplate}
              className="text-sm"
            >
              Apply Darth Vader Template
            </Button>
          </div>
        )}

        {/* Advanced Configuration */}
        {showAdvancedConfig && config.isEnabled && (
          <div className="space-y-6 border-t pt-4">
            {/* Villain Personality */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-card-foreground">Villain Personality</h4>
              
              {/* Motivations */}
              <div>
                <label className="block text-sm font-medium mb-2 text-card-foreground">
                  Motivations
                </label>
                {(config.villainPersonality?.motivations || []).map((motivation, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={motivation}
                      onChange={(e) => handleArrayFieldChange('motivations', index, e.target.value)}
                      className="flex-1 p-2 border rounded-md bg-background text-foreground border-border"
                      placeholder="Enter villain motivation..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('motivations', index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('motivations')}
                >
                  Add Motivation
                </Button>
              </div>

              {/* Fears */}
              <div>
                <label className="block text-sm font-medium mb-2 text-card-foreground">
                  Fears
                </label>
                {(config.villainPersonality?.fears || []).map((fear, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={fear}
                      onChange={(e) => handleArrayFieldChange('fears', index, e.target.value)}
                      className="flex-1 p-2 border rounded-md bg-background text-foreground border-border"
                      placeholder="Enter villain fear..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('fears', index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('fears')}
                >
                  Add Fear
                </Button>
              </div>

              {/* Backstory */}
              <div>
                <label className="block text-sm font-medium mb-2 text-card-foreground">
                  Backstory
                </label>
                <textarea
                  value={config.villainPersonality?.backstory || ''}
                  onChange={(e) => handleVillainPersonalityChange('backstory', e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded-md bg-background text-foreground border-border"
                  placeholder="Enter villain backstory..."
                />
              </div>

              {/* Speech Style */}
              <div>
                <label className="block text-sm font-medium mb-2 text-card-foreground">
                  Speech Style
                </label>
                <textarea
                  value={config.villainPersonality?.speechStyle || ''}
                  onChange={(e) => handleVillainPersonalityChange('speechStyle', e.target.value)}
                  rows={2}
                  className="w-full p-2 border rounded-md bg-background text-foreground border-border"
                  placeholder="Describe how the villain speaks..."
                />
              </div>

              {/* Relationship with Player */}
              <div>
                <label className="block text-sm font-medium mb-2 text-card-foreground">
                  Relationship with Player
                </label>
                <select
                  value={config.villainPersonality?.relationshipWithPlayer || 'enemy'}
                  onChange={(e) => handleVillainPersonalityChange('relationshipWithPlayer', e.target.value as any)}
                  className="w-full p-2 border rounded-md bg-background text-foreground border-border"
                >
                  {relationshipTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Influence Level */}
              <div>
                <label className="block text-sm font-medium mb-2 text-card-foreground">
                  Influence Level (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={config.villainPersonality?.influenceLevel || 5}
                  onChange={(e) => handleVillainPersonalityChange('influenceLevel', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground">
                  Current: {config.villainPersonality?.influenceLevel || 5}
                </span>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-card-foreground">Advanced Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.enableVillainDialogue}
                    onChange={(e) => handleFieldChange('enableVillainDialogue', e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded"
                  />
                  <span className="text-sm">Enable Villain Dialogue</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.enableConflictEscalation}
                    onChange={(e) => handleFieldChange('enableConflictEscalation', e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded"
                  />
                  <span className="text-sm">Enable Conflict Escalation</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.enableVillainMemory}
                    onChange={(e) => handleFieldChange('enableVillainMemory', e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded"
                  />
                  <span className="text-sm">Enable Villain Memory</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.enableTerritoryControl}
                    onChange={(e) => handleFieldChange('enableTerritoryControl', e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded"
                  />
                  <span className="text-sm">Enable Territory Control</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {config.isEnabled && (
          <div className="bg-muted border border-border rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              <strong>How this works:</strong> The Dungeon Master will use your villain configuration to create a compelling antagonist with detailed personality, motivations, and dynamic interactions. This creates deeper, more engaging conflicts in your adventure.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 