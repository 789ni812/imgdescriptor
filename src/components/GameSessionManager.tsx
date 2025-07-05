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
    
    if (hasFinalStory) return { status: 'Complete', variant: 'default' as const };
    if (imageCount === 0) return { status: 'New', variant: 'secondary' as const };
    if (imageCount < 3) return { status: 'In Progress', variant: 'outline' as const };
    return { status: 'Ready for Final Story', variant: 'default' as const };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Game Session Manager</span>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowSaveForm(true)}
                size="sm"
                variant="default"
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
            <Card className="mb-4">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 text-card-foreground">Save Current Session</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="Enter session name"
                    className="w-full p-2 border rounded bg-background text-foreground border-border placeholder-muted-foreground"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveGameSession}
                      disabled={!sessionName.trim()}
                      size="sm"
                      variant="default"
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
              </CardContent>
            </Card>
          )}

          {/* Load Options */}
          {showLoadOptions && (
            <div className="space-y-4">
              {/* Game Sessions */}
              <div>
                <h4 className="font-semibold mb-2 text-card-foreground">Game Sessions ({gameSessions.length})</h4>
                {gameSessions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No saved game sessions</p>
                ) : (
                  <div className="space-y-2">
                    {gameSessions.map((template) => {
                      const status = getSessionStatus(template as GameTemplate);
                      return (
                        <Card key={template.id} className="hover:bg-muted/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-card-foreground">{template.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(template.createdAt)} • {(template as GameTemplate).images.length} images
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={status.variant}>{status.status}</Badge>
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
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Session Info */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 text-card-foreground">Current Session</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div>Turn: {character.currentTurn}</div>
                <div>Images: {character.imageHistory.length}</div>
                <div>Character: {character.persona}</div>
                {selectedPersonality && (
                  <div>DM Style: {selectedPersonality?.style}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameSessionManager; 