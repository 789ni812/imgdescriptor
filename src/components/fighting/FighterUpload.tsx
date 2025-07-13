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
    console.log('DEBUG handleFileChange called');
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Upload image and get description
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'fighter');

      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      console.log('DEBUG uploadResponse:', uploadResponse);

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.url;
      console.log('DEBUG uploadData:', uploadData);

      // Step 2: Analyze image to get description
      setIsAnalyzing(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Image = (reader.result as string).split(',')[1];
          const analysisRes = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image, prompt: 'Describe this fighter.' }),
          });
          console.log('DEBUG analysisRes:', analysisRes);
          if (!analysisRes.ok) throw new Error('Analysis failed');
          const analysisData = await analysisRes.json();
          const imageDescription = analysisData.description;
          console.log('DEBUG analysisData:', analysisData);

          // Step 3: Generate fighter stats and details
          const fighterResponse = await fetch('/api/fighting-game/generate-fighter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageDescription,
              fighterId,
              fighterLabel,
              imageUrl,
            }),
          });
          console.log('DEBUG fighterResponse:', fighterResponse);

          if (!fighterResponse.ok) {
            throw new Error('Failed to generate fighter');
          }

          const fighterData = await fighterResponse.json();
          const newFighter: Fighter = fighterData.fighter;

          // Debug log to inspect the fighter object
          console.log('DEBUG newFighter:', newFighter);

          // Save fighter metadata JSON
          if (newFighter && newFighter.imageUrl && newFighter.name && newFighter.stats) {
            const imageFilename = newFighter.imageUrl.split('/').pop();
            await fetch('/api/save-fighter-metadata', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image: imageFilename,
                name: newFighter.name,
                stats: newFighter.stats,
              }),
            });
          }

          // Add fighter to store and call callback
          addFighter(newFighter);
          setFighter(newFighter);
          onFighterCreated(newFighter);
          setIsAnalyzing(false);
        } catch (err) {
          console.error('DEBUG error in analysis/generation:', err);
          setError('Failed to analyze image or generate fighter.');
          setIsAnalyzing(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file.');
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('DEBUG error in upload flow:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
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