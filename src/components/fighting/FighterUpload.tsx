'use client';

import React, { useState, useRef } from 'react';
import { useFightingGameStore, Fighter } from '@/lib/stores/fightingGameStore';

interface FighterUploadProps {
  fighterId: string;
  fighterLabel: string;
  onFighterCreated: (fighter: Fighter) => void;
}

export default function FighterUpload({ fighterId, fighterLabel, onFighterCreated }: FighterUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fighter, setFighter] = useState<Fighter | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFighter } = useFightingGameStore();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Upload image and get description
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      const imageDescription = uploadData.description;

      // Step 2: Generate fighter stats and details
      setIsAnalyzing(true);

      const fighterResponse = await fetch('/api/fighting-game/generate-fighter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageDescription,
          fighterId,
          fighterLabel,
        }),
      });

      if (!fighterResponse.ok) {
        throw new Error('Failed to generate fighter');
      }

      const fighterData = await fighterResponse.json();
      const newFighter: Fighter = fighterData.fighter;

      // Add fighter to store and call callback
      addFighter(newFighter);
      setFighter(newFighter);
      onFighterCreated(newFighter);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (fighter) {
    return (
      <div className="bg-green-900/20 backdrop-blur-sm rounded-lg p-4 border border-green-500/30">
        <h4 className="text-lg font-semibold text-green-400 mb-3">{fighter.name}</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Health: {fighter.stats.health}</div>
          <div>Strength: {fighter.stats.strength}</div>
          <div>Luck: {fighter.stats.luck}</div>
          <div>Agility: {fighter.stats.agility}</div>
          <div>Defense: {fighter.stats.defense}</div>
          <div>Size: {fighter.stats.size}</div>
        </div>
        <div className="mt-3 text-xs text-gray-300">
          <p><strong>Build:</strong> {fighter.stats.build}</p>
          <p><strong>Age:</strong> {fighter.visualAnalysis.age}</p>
        </div>
        <button
          onClick={() => {
            setFighter(null);
            setError(null);
          }}
          className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
        >
          Remove Fighter
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-4">{fighterLabel}</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {isUploading || isAnalyzing ? (
        <div className="flex items-center justify-center space-x-2 text-gray-300">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>{isAnalyzing ? 'Analyzing fighter...' : 'Uploading image...'}</span>
        </div>
      ) : (
        <div>
          <p className="text-gray-300 mb-4">Upload image for {fighterLabel}</p>
          <button
            onClick={handleUploadClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Upload Image
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            data-testid="file-input"
          />
        </div>
      )}
    </div>
  );
} 