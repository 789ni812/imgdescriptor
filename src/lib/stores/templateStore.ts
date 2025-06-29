import { create } from 'zustand';
import { GameTemplate } from '../types/template';

export interface TemplateStoreState {
  templates: GameTemplate[];
  selectedTemplateId: string | null;
  selectedTemplate: GameTemplate | undefined;
  addTemplate: (template: GameTemplate) => void;
  updateTemplate: (template: GameTemplate) => void;
  deleteTemplate: (id: string) => void;
  selectTemplate: (id: string) => void;
}

export const createTemplateStore = () =>
  create<TemplateStoreState>((set) => ({
    templates: [],
    selectedTemplateId: null,
    selectedTemplate: undefined,
    addTemplate: (template) =>
      set((state) => ({
        templates: [...state.templates, template],
        selectedTemplateId: state.selectedTemplateId ?? template.id,
        selectedTemplate: state.selectedTemplateId
          ? state.selectedTemplate
          : template,
      })),
    updateTemplate: (template) =>
      set((state) => {
        const templates = state.templates.map((t) =>
          t.id === template.id ? template : t
        );
        const selectedTemplate =
          state.selectedTemplateId === template.id ? template : state.selectedTemplate;
        return { templates, selectedTemplate };
      }),
    deleteTemplate: (id) =>
      set((state) => {
        const templates = state.templates.filter((t) => t.id !== id);
        let selectedTemplateId = state.selectedTemplateId;
        let selectedTemplate = state.selectedTemplate;
        if (state.selectedTemplateId === id) {
          selectedTemplateId = templates.length > 0 ? templates[0].id : null;
          selectedTemplate = templates.length > 0 ? templates[0] : undefined;
        }
        return { templates, selectedTemplateId, selectedTemplate };
      }),
    selectTemplate: (id) =>
      set((state) => {
        const selectedTemplate = state.templates.find((t) => t.id === id);
        return {
          selectedTemplateId: id,
          selectedTemplate,
        };
      }),
  }));

// For use in React components
export const useTemplateStore = createTemplateStore(); 