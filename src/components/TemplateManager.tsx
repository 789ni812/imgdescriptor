import React, { useRef, useState } from 'react';
import { Button } from './ui/Button';
import { GameTemplate, validateGameTemplate, applyTemplate } from '@/lib/types/template';
import { useTemplateStore } from '@/lib/stores/templateStore';
import { useCharacterStore } from '@/lib/stores/characterStore';
import { useStoryGeneration } from '@/hooks/useStoryGeneration';

interface EditFields {
  name: string;
  prompts: GameTemplate['prompts'];
  config: GameTemplate['config'];
}

export function TemplateManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState('');
  const [applyResult, setApplyResult] = useState<{ success: boolean; missingContent: string[]; error?: string } | null>(null);
  const {
    templates,
    selectedTemplateId,
    selectedTemplate,
    addTemplate,
    deleteTemplate,
    selectTemplate,
  } = useTemplateStore();

  const characterStore = useCharacterStore();
  const { setStory } = useStoryGeneration();
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState<EditFields | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (validateGameTemplate(json)) {
          addTemplate(json as GameTemplate);
          // Immediately apply the imported template
          const result = applyTemplate(json as GameTemplate);
          setApplyResult(result);
          if (result.success && result.gameState) {
            // Apply to character store
            characterStore.updateCharacter({
              ...result.gameState.character,
              currentTurn: result.gameState.currentTurn,
            });
            // Clear existing image history and add template images
            characterStore.updateCharacter({ imageHistory: [] });
            result.gameState.imageHistory.forEach(image => {
              characterStore.addImageToHistory(image);
            });
            // Set final story if it exists
            if (result.gameState.finalStory) {
              characterStore.updateCharacter({ finalStory: result.gameState.finalStory });
            }
            // Set the story state to the last image's story if present
            const lastImage = result.gameState.imageHistory[result.gameState.imageHistory.length - 1];
            if (lastImage && lastImage.story) {
              setStory(lastImage.story);
            } else {
              setStory(null);
            }
          }
        } else {
          setImportError('Invalid template: missing required fields');
        }
      } catch {
        setImportError('Invalid template: missing required fields');
      }
    };
    reader.readAsText(file);
  };

  const handleExportClick = () => {
    if (!selectedTemplate) {
      alert('No template selected.');
      return;
    }

    // Create a template from current game state to capture any updates
    const currentCharacter = characterStore.character;
    const currentTemplate: GameTemplate = {
      ...selectedTemplate,
      character: {
        persona: currentCharacter.persona,
        traits: currentCharacter.traits,
        stats: currentCharacter.stats,
        health: currentCharacter.health,
        heartrate: currentCharacter.heartrate,
        age: currentCharacter.age,
        level: currentCharacter.level,
        experience: currentCharacter.experience,
      },
      images: currentCharacter.imageHistory.map(img => ({
        id: img.id,
        url: img.url,
        description: img.description,
        story: img.story || '', // Handle optional story property
        turn: img.turn,
        uploadedAt: img.uploadedAt,
      })),
      finalStory: currentCharacter.finalStory,
      updatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(currentTemplate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const templateName = currentTemplate.name || 'template';
    a.download = `${templateName}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleCreateTemplate = () => {
    const name = newName.trim() || `Adventure ${templates.length + 1}`;
    
    // Create template from current game state instead of default template
    const currentCharacter = characterStore.character;
    const template: GameTemplate = {
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      character: {
        persona: currentCharacter.persona,
        traits: currentCharacter.traits,
        stats: currentCharacter.stats,
        health: currentCharacter.health,
        heartrate: currentCharacter.heartrate,
        age: currentCharacter.age,
        level: currentCharacter.level,
        experience: currentCharacter.experience,
      },
      images: currentCharacter.imageHistory.map(img => ({
        id: img.id,
        url: img.url,
        description: img.description,
        story: img.story || '', // Handle optional story property
        turn: img.turn,
        uploadedAt: img.uploadedAt,
      })),
      prompts: {
        imageDescription: 'Describe this image in detail for an RPG adventure.',
        storyGeneration: 'Generate a story based on this image description.',
        finalStory: 'Create a cohesive final story combining all previous stories.',
        characterInitialization: 'Initialize a character based on this image.',
      },
      config: {
        maxTurns: 3,
        enableMarkdown: true,
        autoSave: true,
        theme: 'default',
        language: 'en',
      },
      finalStory: currentCharacter.finalStory,
    };

    addTemplate(template);
    setNewName('');
    selectTemplate(template.id);
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) {
      alert('No template selected.');
      return;
    }

    const result = applyTemplate(selectedTemplate);
    setApplyResult(result);

    if (result.success && result.gameState) {
      // Apply to character store
      characterStore.updateCharacter({
        ...result.gameState.character,
        currentTurn: result.gameState.currentTurn,
      });

      // Clear existing image history and add template images
      characterStore.updateCharacter({ imageHistory: [] });
      result.gameState.imageHistory.forEach(image => {
        characterStore.addImageToHistory(image);
      });

      // Set final story if it exists
      if (result.gameState.finalStory) {
        characterStore.updateCharacter({ finalStory: result.gameState.finalStory });
      }
      // Set the story state to the last image's story if present
      const lastImage = result.gameState.imageHistory[result.gameState.imageHistory.length - 1];
      if (lastImage && lastImage.story) {
        setStory(lastImage.story);
      } else {
        setStory(null);
      }

      alert(`Template "${selectedTemplate.name}" applied successfully!`);
    } else {
      alert(`Failed to apply template: ${result.error}`);
    }
  };

  const startEditing = () => {
    if (!selectedTemplate) return;
    setEditFields({
      name: selectedTemplate.name,
      prompts: { ...selectedTemplate.prompts },
      config: { ...selectedTemplate.config },
    });
    setEditing(true);
  };

  const handleEditFieldChange = (field: keyof EditFields, value: string) => {
    setEditFields(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleEditPromptChange = (field: keyof GameTemplate['prompts'], value: string) => {
    setEditFields(prev => prev ? { ...prev, prompts: { ...prev.prompts, [field]: value } } : prev);
  };

  const handleEditConfigChange = (field: keyof GameTemplate['config'], value: number) => {
    setEditFields(prev => prev ? { ...prev, config: { ...prev.config, [field]: value } } : prev);
  };

  const handleSaveEdit = () => {
    setEditError(null);
    if (!selectedTemplate || !editFields) return;
    if (!editFields.name || editFields.name.trim() === '') {
      setEditError('Template name is required');
      return;
    }
    addTemplate({
      ...selectedTemplate,
      name: editFields.name,
      prompts: editFields.prompts,
      config: editFields.config,
      updatedAt: new Date().toISOString(),
    });
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
      <div className="flex gap-2 items-center mb-2">
        <input
          type="text"
          placeholder="New template name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
        <Button onClick={handleCreateTemplate} size="sm" variant="outline" data-testid="create-template-btn">
          Save Current State
        </Button>
        <Button onClick={handleImportClick} variant="outline" size="sm" data-testid="import-template-btn">
          Import Template
        </Button>
        <Button onClick={handleExportClick} variant="outline" size="sm" data-testid="export-template-btn">
          Export Template
        </Button>
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          data-testid="template-file-input"
        />
      </div>
      <div className="border rounded p-2 bg-muted">
        <div className="font-semibold mb-2">Templates</div>
        <ul className="space-y-1">
          {templates.length === 0 && <li className="text-sm text-muted-foreground">No templates yet.</li>}
          {templates.map(t => (
            <li key={t.id} className={`flex items-center gap-2 p-1 rounded ${selectedTemplateId === t.id ? 'bg-accent' : ''}`}>
              <span className="flex-1 cursor-pointer" onClick={() => selectTemplate(t.id)}>
                {t.name}
                {selectedTemplateId === t.id && <span className="ml-2 text-xs text-primary">(selected)</span>}
              </span>
              <Button size="sm" variant="ghost" onClick={() => selectTemplate(t.id)} disabled={selectedTemplateId === t.id}>Select</Button>
              <Button size="sm" variant="destructive" onClick={() => deleteTemplate(t.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      </div>
      {importError && <div className="text-red-600 text-sm" role="alert">{importError}</div>}
      {selectedTemplate && (
        <div className="border rounded p-2 mt-2 bg-muted">
          <div className="font-semibold mb-1">Selected Template</div>
          <div className="text-xs text-muted-foreground">ID: {selectedTemplate.id}</div>
          {!editing ? (
            <>
              <div className="text-sm">Name: {selectedTemplate.name}</div>
              <div className="text-sm">Created: {selectedTemplate.createdAt}</div>
              <div className="text-sm">Updated: {selectedTemplate.updatedAt}</div>
              <div className="text-sm">Images: {selectedTemplate.images.length}</div>
              <div className="text-sm">Final Story: {selectedTemplate.finalStory ? 'Yes' : 'No'}</div>
              <div className="flex gap-2 mt-2">
                <Button onClick={startEditing} size="sm" variant="outline" data-testid="edit-template-btn">Edit</Button>
                <Button 
                  onClick={handleApplyTemplate} 
                  variant="default" 
                  size="sm" 
                  data-testid="apply-template-btn"
                  className="flex-1"
                >
                  Apply Template
                </Button>
              </div>
            </>
          ) : (
            <form className="space-y-2 mt-2">
              <label className="block text-xs font-medium">Name
                <input
                  type="text"
                  value={editFields ? editFields.name : ''}
                  onChange={e => handleEditFieldChange('name', e.target.value)}
                  className="border rounded px-2 py-1 text-sm w-full"
                  data-testid="edit-template-name"
                />
              </label>
              {editError && <div className="text-red-600 text-xs" role="alert">{editError}</div>}
              <label className="block text-xs font-medium">Image Description Prompt
                <input
                  type="text"
                  value={editFields ? editFields.prompts.imageDescription : ''}
                  onChange={e => handleEditPromptChange('imageDescription', e.target.value)}
                  className="border rounded px-2 py-1 text-sm w-full"
                />
              </label>
              <label className="block text-xs font-medium">Max Turns
                <input
                  type="number"
                  value={editFields ? editFields.config.maxTurns : ''}
                  onChange={e => handleEditConfigChange('maxTurns', Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm w-full"
                  aria-label="Max Turns"
                />
              </label>
              <div className="flex gap-2 mt-2">
                <Button type="button" onClick={handleSaveEdit} size="sm" variant="default" data-testid="save-template-btn">Save</Button>
                <Button type="button" onClick={() => setEditing(false)} size="sm" variant="outline">Cancel</Button>
              </div>
            </form>
          )}
          {applyResult && (
            <div className={`mt-2 p-2 rounded text-sm ${applyResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {applyResult.success ? (
                <div>
                  <div className="font-semibold">Template applied successfully!</div>
                  {applyResult.missingContent.length > 0 && (
                    <div className="mt-1">
                      <div className="font-medium">Missing content:</div>
                      <ul className="list-disc list-inside">
                        {applyResult.missingContent.map(content => (
                          <li key={content}>{content}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="font-semibold">Failed to apply template:</div>
                  <div>{applyResult.error}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 