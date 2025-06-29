import React, { useRef, useState } from 'react';
import { Button } from './ui/Button';
import { GameTemplate, validateGameTemplate, applyTemplate, createTemplateFromCurrentState } from '@/lib/types/template';
import type { GameTemplate as GameTemplateType } from '@/lib/types/template';
import { useTemplateStore } from '@/lib/stores/templateStore';
import { useCharacterStore } from '@/lib/stores/characterStore';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface EditFields {
  name: string;
  prompts: GameTemplate['prompts'];
  config: GameTemplate['config'];
}

const defaultPrompts: GameTemplateType['prompts'] = {
  imageDescription: 'Describe this image in detail for an RPG adventure.',
  storyGeneration: 'Generate a story based on this image description.',
  finalStory: 'Create a cohesive final story combining all previous stories.',
  characterInitialization: 'Initialize a character based on this image.',
};

const defaultConfig: GameTemplateType['config'] = {
  maxTurns: 3,
  enableMarkdown: true,
  autoSave: true,
  theme: 'default',
  language: 'en',
};

// Utility to generate a unique template name
function getUniqueTemplateName(baseName: string, templates: GameTemplate[]): string {
  const existingNames = templates.map(t => t.name);
  if (!existingNames.includes(baseName)) return baseName;
  let copyNumber = 1;
  let newName = `${baseName} (copy)`;
  while (existingNames.includes(newName)) {
    copyNumber++;
    newName = `${baseName} (copy ${copyNumber})`;
  }
  return newName;
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
          // Always assign a new UUID on import
          const imported = { ...json, id: uuidv4() };
          addTemplate(imported as GameTemplate);
          setImportError(null);
          toast.success('Template imported successfully!');
        } else {
          setImportError('Invalid template file.');
          toast.error('Invalid template file.');
        }
      } catch {
        setImportError('Failed to import template.');
        toast.error('Failed to import template.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportClick = () => {
    if (!selectedTemplate) return;
    try {
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedTemplate, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', `${selectedTemplate.name || 'template'}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast('Template exported successfully!');
    } catch {
      toast.error('Failed to export template.');
    }
  };

  const handleCreateTemplate = () => {
    if (!newName.trim()) {
      toast.error('Template name is required');
      return;
    }
    try {
      // Map imageHistory to ensure all stories are strings
      const safeCharacterStore = {
        character: {
          ...characterStore.character,
          imageHistory: characterStore.character.imageHistory.map(img => ({
            ...img,
            story: img.story ?? '',
          })),
        },
      };
      // Ensure unique name
      const uniqueName = getUniqueTemplateName(newName.trim(), templates);
      // Always generate a new UUID
      const template = {
        ...createTemplateFromCurrentState(uniqueName, safeCharacterStore, defaultPrompts, defaultConfig),
        id: uuidv4(),
        name: uniqueName,
      };
      addTemplate(template);
      setNewName('');
      toast.success('Template saved successfully!');
    } catch {
      toast.error('Failed to save template.');
    }
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) {
      toast.error('No template selected.');
      return;
    }
    const result = applyTemplate(selectedTemplate);
    setApplyResult(result);

    if (result.success && result.gameState) {
      characterStore.updateCharacter({ ...result.gameState.character, currentTurn: result.gameState.currentTurn });
      characterStore.updateCharacter({ imageHistory: [] });
      result.gameState.imageHistory.forEach(image => {
        characterStore.addImageToHistory(image);
      });
      if (result.gameState.finalStory) {
        characterStore.updateCharacter({ finalStory: result.gameState.finalStory });
      }
      const lastImage = result.gameState.imageHistory[result.gameState.imageHistory.length - 1];
      if (lastImage && lastImage.story) {
        characterStore.updateCurrentStory(lastImage.story);
      } else {
        characterStore.updateCurrentStory(null);
      }
      if (lastImage && lastImage.description) {
        characterStore.updateCurrentDescription(lastImage.description);
      } else {
        characterStore.updateCurrentDescription(null);
      }
      toast.success('Template applied successfully!');
    } else {
      toast.error(`Failed to apply template: ${result.error}`);
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
    if (field === 'name') toast('Template name changed.');
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
      toast.error('Template name is required');
      return;
    }
    // Ensure unique name for edit (except for the current template)
    const baseName = editFields.name.trim();
    const otherTemplates = templates.filter(t => t.id !== selectedTemplate.id);
    const uniqueName = getUniqueTemplateName(baseName, otherTemplates);
    // If the name is changed to a duplicate, assign a new UUID
    const isNameChanged = uniqueName !== selectedTemplate.name;
    addTemplate({
      ...selectedTemplate,
      id: isNameChanged ? uuidv4() : selectedTemplate.id,
      name: uniqueName,
      prompts: editFields.prompts,
      config: editFields.config,
      updatedAt: new Date().toISOString(),
    });
    setEditing(false);
    toast.success('Template edited and saved!');
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