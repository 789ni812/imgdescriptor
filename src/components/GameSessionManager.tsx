import React, { useState } from 'react';
import { useCharacterStore } from '@/lib/stores/characterStore';
import { useTemplateStore } from '@/lib/stores/templateStore';
import { useDMStore } from '@/lib/stores/dmStore';
import { GameTemplate, createTemplateFromCurrentState, applyTemplateToStore } from '@/lib/types/template';
import type { PersonalityType } from '@/lib/types/dungeonMaster';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';

interface GameSessionManagerProps {
  className?: string;
}

const GameSessionManager: React.FC<GameSessionManagerProps> = ({ className }) => {
  const { character } = useCharacterStore();
  const { templates, addTemplate, deleteTemplate, selectTemplate } = useTemplateStore();
  const { selectedPersonality } = useDMStore();
  const dmStore = useDMStore();
  
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [showLoadOptions, setShowLoadOptions] = useState(false);

  // Filter templates by type
  const gameSessions = templates;

  const handleSaveGameSession = () => {
    if (!sessionName.trim()) return;

    // Convert character to template format
    const templateCharacter = {
      persona: character.persona,
      traits: character.traits,
      stats: character.stats,
      health: character.health,
      heartrate: character.heartrate,
      age: character.age,
      level: character.level,
      experience: character.experience,
      imageHistory: character.imageHistory.map(img => ({
        id: img.id,
        url: img.url,
        description: img.description,
        story: img.story || '',
        turn: img.turn,
        uploadedAt: img.uploadedAt,
      })),
      finalStory: character.finalStory,
    };

    // Get DM config
    const dmContext = dmStore.getDMContext();
    const dmConfig = {
      personality: dmContext.personality,
      freeformAnswers: dmContext.freeformAnswers,
    };

    const template = createTemplateFromCurrentState(
      sessionName,
      { character: templateCharacter },
      {
        imageDescription: 'Describe this image in detail for an RPG adventure.',
        storyGeneration: 'Generate a story based on this image description.',
        finalStory: 'Create a cohesive final story combining all previous stories.',
        characterInitialization: 'Initialize a character based on this image.',
      },
      {
        maxTurns: 3,
        enableMarkdown: true,
        autoSave: true,
        theme: 'default',
        language: 'en',
      },
      dmConfig
    );

    addTemplate(template);
    setSessionName('');
    setShowSaveForm(false);
  };

  const handleLoadGameSession = (template: GameTemplate) => {
    if (confirm('This will replace your current game session. Continue?')) {
      applyTemplateToStore(template, {
        updateCharacter: (updates) => {
          // Update character store with template data
          Object.assign(character, updates);
        },
        addImageToHistory: (image) => {
          character.imageHistory.push(image);
        },
      });
      // Restore DM config if present
      if (template.dmConfig) {
        dmStore.setSelectedPersonality(template.dmConfig.personality as PersonalityType);
        dmStore.setFreeformAnswers((template.dmConfig.freeformAnswers || {}) as Record<string, string>);
      } else {
        dmStore.resetDM();
      }
      selectTemplate(template.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSessionStatus = (template: GameTemplate) => {
    const imageCount = template.images.length;
    const hasFinalStory = !!template.finalStory;
    
    if (hasFinalStory) return { status: 'Complete', color: 'bg-green-100 text-green-800' };
    if (imageCount === 0) return { status: 'New', color: 'bg-zinc-800 text-gray-100' };
    if (imageCount < 3) return { status: 'In Progress', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Ready for Final Story', color: 'bg-blue-100 text-blue-800' };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Game Session Manager</span>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowSaveForm(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Session
              </Button>
              <Button
                onClick={() => setShowLoadOptions(!showLoadOptions)}
                size="sm"
                variant="outline"
              >
                Load Session
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Save Form */}
          {showSaveForm && (
            <div className="mb-4 p-4 border rounded-lg bg-zinc-900">
              <h4 className="font-semibold mb-2">Save Current Session</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Enter session name"
                  className="w-full p-2 border rounded bg-zinc-800 text-white border-zinc-700 placeholder-gray-400"
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveGameSession}
                    disabled={!sessionName.trim()}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save Game Session
                  </Button>
                  <Button
                    onClick={() => setShowSaveForm(false)}
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Load Options */}
          {showLoadOptions && (
            <div className="space-y-4">
              {/* Game Sessions */}
              <div>
                <h4 className="font-semibold mb-2">Game Sessions ({gameSessions.length})</h4>
                {gameSessions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No saved game sessions</p>
                ) : (
                  <div className="space-y-2">
                    {gameSessions.map((template) => {
                      const status = getSessionStatus(template as GameTemplate);
                      return (
                        <div
                          key={template.id}
                          className="flex justify-between items-center p-2 border rounded hover:bg-zinc-800"
                        >
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-gray-500">
                              {formatDate(template.createdAt)} • {(template as GameTemplate).images.length} images
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={status.color}>{status.status}</Badge>
                            <Button
                              onClick={() => handleLoadGameSession(template as GameTemplate)}
                              size="sm"
                              variant="outline"
                            >
                              Load
                            </Button>
                            <Button
                              onClick={() => deleteTemplate(template.id)}
                              size="sm"
                              variant="destructive"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Session Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Current Session</h4>
            <div className="text-sm space-y-1">
              <div>Turn: {character.currentTurn}</div>
              <div>Images: {character.imageHistory.length}</div>
              <div>Character: {character.persona}</div>
              {selectedPersonality && (
                <div>DM Style: {selectedPersonality?.style}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameSessionManager; 