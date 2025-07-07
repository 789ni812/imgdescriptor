'use client';
import React, { useRef, useState } from 'react';
import { Button } from './ui/Button';
import { GameTemplate, validateGameTemplate, applyTemplate, createTemplateFromCurrentState } from '@/lib/types/template';
import type { GameTemplate as GameTemplateType } from '@/lib/types/template';
import { useTemplateStore } from '@/lib/stores/templateStore';
import { useCharacterStore } from '@/lib/stores/characterStore';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useDMStore } from '@/lib/stores/dmStore';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { DMConfigSection } from './DMConfigSection';

interface EditFields {
  name: string;
  prompts: GameTemplate['prompts'];
  config: GameTemplate['config'];
  debugConfig: GameTemplate['debugConfig'];
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

// When initializing editFields or debugConfig, ensure summaryEnabled and storyLengthCustom are present
const getDefaultDebugConfig = (existing?: Partial<GameTemplate['debugConfig']>): GameTemplate['debugConfig'] => ({
  storyLength: existing?.storyLength ?? 'medium',
  storyLengthCustom: existing?.storyLengthCustom ?? undefined,
  choiceCount: existing?.choiceCount ?? 2,
  enableVerboseLogging: existing?.enableVerboseLogging ?? false,
  summaryEnabled: existing?.summaryEnabled ?? false,
  performanceMetrics: existing?.performanceMetrics ?? {
    enabled: false,
    trackStoryGeneration: true,
    trackChoiceGeneration: true,
    trackImageAnalysis: true,
    trackDMReflection: true
  },
  aiResponseTuning: existing?.aiResponseTuning ?? {
    temperature: 0.85,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  },
  userExperience: existing?.userExperience ?? {
    storyPacing: 'medium',
    choiceComplexity: 'moderate',
    narrativeDepth: 'medium',
    characterDevelopment: 'medium',
    moralComplexity: 'medium'
  },
  testing: existing?.testing ?? {
    enableMockMode: false,
    mockResponseDelay: 300,
    enableStressTesting: false,
    maxConcurrentRequests: 5
  }
});

export function TemplateManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState('');
  const [applyResult, setApplyResult] = useState<{ success: boolean; missingContent: string[]; error?: string } | null>(null);
  const {
    templates,
    selectedTemplateId,
    selectedTemplate,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    selectTemplate,
  } = useTemplateStore();

  const characterStore = useCharacterStore();
  const dmStore = useDMStore();
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
      // Get DM config
      const dmContext = dmStore.getDMContext();
      const dmConfig = {
        personality: dmContext.personality,
        freeformAnswers: dmContext.freeformAnswers,
      };
      // Always generate a new UUID
      const template = {
        ...createTemplateFromCurrentState(uniqueName, safeCharacterStore, defaultPrompts, defaultConfig, dmConfig),
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
      // Sync storyHistory from imageHistory
      const storyEntries = result.gameState.imageHistory
        .filter(img => img.story && img.story.trim() !== '')
        .map(img => ({
          id: img.id,
          text: img.story!,
          timestamp: img.uploadedAt,
          turnNumber: img.turn,
          imageDescription: img.description,
        }));
      // Set imageHistory and storyHistory together
      characterStore.updateCharacter({
        ...result.gameState.character,
        currentTurn: result.gameState.currentTurn,
        imageHistory: result.gameState.imageHistory,
        storyHistory: storyEntries,
        choicesHistory: result.gameState.choicesHistory || [],
        choiceHistory: selectedTemplate.choiceHistory || [],
      });
      // Set final story if it exists
      if (result.gameState.finalStory) {
        characterStore.updateCharacter({ finalStory: result.gameState.finalStory });
      }
      const lastImage = result.gameState.imageHistory[result.gameState.imageHistory.length - 1];
      if (lastImage && lastImage.story) {
        try {
          const storyObj = JSON.parse(lastImage.story);
          characterStore.updateCurrentStory(storyObj);
        } catch {
          characterStore.updateCurrentStory(undefined);
        }
      } else {
        characterStore.updateCurrentStory(undefined);
      }
      if (lastImage && lastImage.description) {
        characterStore.updateCurrentDescription(lastImage.description);
      } else {
        characterStore.updateCurrentDescription(undefined);
      }
      // Restore DM config if present
      if (selectedTemplate.dmConfig) {
        dmStore.setSelectedPersonality(selectedTemplate.dmConfig.personality as import('@/lib/types/dungeonMaster').PersonalityType);
        dmStore.setFreeformAnswers((selectedTemplate.dmConfig.freeformAnswers || {}) as Record<string, string>);
      } else {
        dmStore.resetDM();
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
      debugConfig: getDefaultDebugConfig(selectedTemplate.debugConfig),
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

  const handleEditDebugConfigChange = (field: keyof GameTemplate['debugConfig'], value: string | number | boolean | undefined) => {
    setEditFields(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        debugConfig: getDefaultDebugConfig({ ...prev.debugConfig, [field]: value }),
      };
    });
  };

  const handleEditAITuningChange = (field: keyof GameTemplate['debugConfig']['aiResponseTuning'], value: number) => {
    setEditFields(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        debugConfig: {
          ...prev.debugConfig,
          aiResponseTuning: {
            ...prev.debugConfig?.aiResponseTuning,
            [field]: value,
          },
        },
      };
    });
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
    // If the name is changed to a duplicate, assign a new UUID, otherwise keep the same ID
    const newId = isNameChanged ? uuidv4() : selectedTemplate.id;
    // Create the updated template
    const updatedTemplate = {
      ...selectedTemplate,
      id: newId,
      name: uniqueName,
      prompts: editFields.prompts,
      config: editFields.config,
      debugConfig: getDefaultDebugConfig(editFields.debugConfig),
      updatedAt: new Date().toISOString(),
    };
    // If the ID changed, we need to add a new template and delete the old one
    if (isNameChanged) {
      addTemplate(updatedTemplate);
      deleteTemplate(selectedTemplate.id);
    } else {
      // If the ID is the same, just update the existing template
      updateTemplate(updatedTemplate);
    }
    setEditing(false);
    toast.success('Template edited and saved!');
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={process.env.NODE_ENV === 'test' ? 'template-controls' : undefined}
      defaultValue="template-controls"
      className="w-full max-w-3xl mx-auto rounded-xl shadow-lg border border-border bg-card"
    >
      <AccordionItem value="template-controls" className="rounded-xl bg-card border-none shadow-md mb-4">
        <AccordionTrigger className="px-6 py-4 text-lg font-semibold bg-muted rounded-t-xl border-b border-border hover:bg-accent transition-colors">
          Template & Dungeon Master Controls
        </AccordionTrigger>
        <AccordionContent className="px-0 pb-0 rounded-b-xl">
          <div className="space-y-8 px-2 py-4">
            <DMConfigSection />
            <section className="space-y-4 mt-6">
              <div className="flex flex-wrap gap-2 items-center mb-4">
                <input
                  type="text"
                  placeholder="New template name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm bg-background text-foreground placeholder-muted-foreground border-border mr-2 mb-2"
                  data-testid="new-template-name"
                />
                <Button onClick={handleCreateTemplate} size="sm" variant="default" className="rounded-lg font-semibold shadow-md" data-testid="create-template-btn">Save Current State</Button>
                <Button onClick={handleImportClick} variant="secondary" size="sm" className="rounded-lg font-semibold shadow-md" data-testid="import-template-btn">Import Template</Button>
                <Button onClick={handleExportClick} variant="outline" size="sm" className="rounded-lg font-semibold shadow-md" data-testid="export-template-btn">Export Template</Button>
                <input
                  type="file"
                  accept="application/json"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  data-testid="template-file-input"
                />
              </div>
              <div className="border rounded-lg p-4 bg-card mb-4">
                <div className="font-bold text-lg mb-3 text-card-foreground">Templates</div>
                <ul className="space-y-2">
                  {templates.length === 0 && <li className="text-sm text-muted-foreground">No templates yet.</li>}
                  {templates.map(t => (
                    <li key={t.id} className={`flex items-center gap-2 p-2 rounded-lg ${selectedTemplateId === t.id ? 'bg-accent' : ''} text-card-foreground`}>
                      <span className="flex-1 cursor-pointer font-semibold" onClick={() => selectTemplate(t.id)}>
                        {t.name}
                        {selectedTemplateId === t.id && <span className="ml-2 text-xs text-primary">(selected)</span>}
                      </span>
                      <Button size="sm" variant="secondary" className="rounded-lg" onClick={() => selectTemplate(t.id)} disabled={selectedTemplateId === t.id}>Select</Button>
                      <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => deleteTemplate(t.id)}>Delete</Button>
                    </li>
                  ))}
                </ul>
              </div>
              {importError && <div className="text-destructive text-sm mb-2" role="alert">{importError}</div>}
              {selectedTemplate && (
                <div className="border rounded-lg p-4 mt-2 bg-card">
                  <div className="font-bold text-lg mb-2 text-card-foreground">Selected Template</div>
                  <div className="text-xs text-muted-foreground mb-2">ID: {selectedTemplate.id}</div>
                  <div className="text-xs text-muted-foreground mb-2">Name: {selectedTemplate.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">Created: {selectedTemplate.createdAt}</div>
                  <div className="text-xs text-muted-foreground mb-2">Updated: {selectedTemplate.updatedAt}</div>
                  <div className="text-xs text-muted-foreground mb-2">Images: {selectedTemplate.images.length}</div>
                  <div className="text-xs text-muted-foreground mb-3">Final Story: {selectedTemplate.finalStory ? 'Yes' : 'No'}</div>
                  {!editing ? (
                    <>
                      <div className="flex gap-2 mt-2">
                        <Button onClick={startEditing} size="sm" variant="outline" className="rounded-lg font-semibold shadow-md" data-testid="edit-template-btn">Edit</Button>
                        <Button 
                          onClick={handleApplyTemplate} 
                          variant="default" 
                          size="sm" 
                          className="flex-1 rounded-lg font-semibold shadow-md"
                          data-testid="apply-template-btn"
                        >
                          Apply Template
                        </Button>
                      </div>
                    </>
                  ) : (
                    <form className="space-y-3 mt-2">
                      <label className="block text-xs font-medium mb-1 text-card-foreground">Name
                        <input
                          type="text"
                          value={editFields!.name}
                          onChange={e => handleEditFieldChange('name', e.target.value)}
                          className="border rounded-lg px-3 py-2 text-sm w-full bg-background text-foreground border-border"
                          data-testid="edit-template-name"
                        />
                      </label>
                      {editError && <div className="text-destructive text-xs mb-1" role="alert">{editError}</div>}
                      <label className="block text-xs font-medium mb-1 text-card-foreground">Image Description Prompt
                        <input
                          type="text"
                          value={editFields!.prompts.imageDescription}
                          onChange={e => handleEditPromptChange('imageDescription', e.target.value)}
                          className="border rounded-lg px-3 py-2 text-sm w-full bg-background text-foreground border-border"
                        />
                      </label>
                      <label className="block text-xs font-medium mb-1 text-card-foreground">Max Turns
                        <input
                          type="number"
                          value={editFields!.config.maxTurns}
                          onChange={e => handleEditConfigChange('maxTurns', Number(e.target.value))}
                          className="border rounded-lg px-3 py-2 text-sm w-full bg-background text-foreground border-border"
                        />
                      </label>
                      <div className="border rounded-lg p-3 bg-muted mt-4">
                        <div className="font-bold text-lg mb-2 text-card-foreground">Debug / Dev Settings</div>
                        <label htmlFor="story-length-select" className="block text-xs font-medium mb-1 text-card-foreground">Story Length
                          <select
                            id="story-length-select"
                            value={editFields!.debugConfig.storyLength}
                            onChange={e => handleEditDebugConfigChange('storyLength', e.target.value)}
                            className="border rounded-lg px-2 py-1 text-sm w-full bg-background text-foreground border-border"
                          >
                            <option value="short">Short</option>
                            <option value="medium">Medium</option>
                            <option value="long">Long</option>
                            <option value="epic">Epic</option>
                          </select>
                        </label>
                        <label htmlFor="custom-story-length-input" className="block text-xs font-medium mb-1 text-card-foreground">Custom Story Length
                          <input
                            id="custom-story-length-input"
                            type="number"
                            min="1"
                            value={editFields!.debugConfig.storyLengthCustom ?? ''}
                            onChange={e => handleEditDebugConfigChange('storyLengthCustom', e.target.value ? Number(e.target.value) : undefined)}
                            className="border rounded-lg px-2 py-1 text-sm w-full bg-background text-foreground border-border"
                          />
                        </label>
                        <label className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={!!editFields!.debugConfig.summaryEnabled}
                            onChange={e => handleEditDebugConfigChange('summaryEnabled', e.target.checked)}
                            className="form-checkbox h-4 w-4 text-primary"
                          />
                          <span className="text-xs text-card-foreground font-medium">Summary</span>
                        </label>
                        <label className="block text-xs font-medium mb-1 text-card-foreground">Choice Count
                          <select
                            value={editFields!.debugConfig.choiceCount}
                            onChange={e => handleEditDebugConfigChange('choiceCount', Number(e.target.value))}
                            className="border rounded-lg px-2 py-1 text-sm w-full bg-background text-foreground border-border"
                          >
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                          </select>
                        </label>
                        <label className="block text-xs font-medium mb-1 text-card-foreground">AI Temperature
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="2"
                            value={editFields!.debugConfig.aiResponseTuning?.temperature}
                            onChange={e => handleEditAITuningChange('temperature', Number(e.target.value))}
                            className="border rounded-lg px-2 py-1 text-sm w-full bg-background text-foreground border-border"
                          />
                        </label>
                        <label className="block text-xs font-medium mb-1 text-card-foreground">Max Tokens
                          <input
                            type="number"
                            min="512"
                            max="4096"
                            value={editFields!.debugConfig.aiResponseTuning?.maxTokens}
                            onChange={e => handleEditAITuningChange('maxTokens', Number(e.target.value))}
                            className="border rounded-lg px-2 py-1 text-sm w-full bg-background text-foreground border-border"
                          />
                        </label>
                        <label className="block text-xs font-medium mb-1 text-card-foreground">Top P
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={editFields!.debugConfig.aiResponseTuning?.topP}
                            onChange={e => handleEditAITuningChange('topP', Number(e.target.value))}
                            className="border rounded-lg px-2 py-1 text-sm w-full bg-background text-foreground border-border"
                          />
                        </label>
                        <label className="block text-xs font-medium mb-1 text-card-foreground">Frequency Penalty
                          <input
                            type="number"
                            step="0.01"
                            min="-2"
                            max="2"
                            value={editFields!.debugConfig.aiResponseTuning?.frequencyPenalty}
                            onChange={e => handleEditAITuningChange('frequencyPenalty', Number(e.target.value))}
                            className="border rounded-lg px-2 py-1 text-sm w-full bg-background text-foreground border-border"
                          />
                        </label>
                        <label className="block text-xs font-medium mb-1 text-card-foreground">Presence Penalty
                          <input
                            type="number"
                            step="0.01"
                            min="-2"
                            max="2"
                            value={editFields!.debugConfig.aiResponseTuning?.presencePenalty}
                            onChange={e => handleEditAITuningChange('presencePenalty', Number(e.target.value))}
                            className="border rounded-lg px-2 py-1 text-sm w-full bg-background text-foreground border-border"
                          />
                        </label>
                        <label className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={!!editFields!.debugConfig.enableVerboseLogging}
                            onChange={e => handleEditDebugConfigChange('enableVerboseLogging', e.target.checked)}
                            className="form-checkbox h-4 w-4 text-primary"
                          />
                          <span className="text-xs text-card-foreground font-medium">Enable Verbose Debug Logging</span>
                        </label>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button type="button" onClick={handleSaveEdit} size="sm" variant="default" className="rounded-lg font-semibold shadow-md" data-testid="save-template-btn">Save</Button>
                        <Button type="button" onClick={() => setEditing(false)} size="sm" variant="outline" className="rounded-lg font-semibold shadow-md">Cancel</Button>
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
            </section>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 