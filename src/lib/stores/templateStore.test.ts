import { act } from 'react-dom/test-utils';
import { createDefaultTemplate } from '../types/template';
import { createTemplateStore } from './templateStore';

describe('templateStore', () => {
  let store: ReturnType<typeof createTemplateStore>;

  beforeEach(() => {
    store = createTemplateStore();
  });

  it('should create a new template', () => {
    const template = createDefaultTemplate('My Adventure');
    act(() => {
      store.getState().addTemplate(template);
    });
    expect(store.getState().templates).toHaveLength(1);
    expect(store.getState().templates[0].name).toBe('My Adventure');
  });

  it('should update a template', () => {
    const template = createDefaultTemplate('Original');
    act(() => {
      store.getState().addTemplate(template);
      store.getState().updateTemplate({ ...template, name: 'Updated' });
    });
    expect(store.getState().templates[0].name).toBe('Updated');
  });

  it('should delete a template', () => {
    const template = createDefaultTemplate('To Delete');
    act(() => {
      store.getState().addTemplate(template);
      store.getState().deleteTemplate(template.id);
    });
    expect(store.getState().templates).toHaveLength(0);
  });

  it('should select a template', () => {
    const t1 = createDefaultTemplate('T1');
    const t2 = createDefaultTemplate('T2');
    act(() => {
      store.getState().addTemplate(t1);
      store.getState().addTemplate(t2);
      store.getState().selectTemplate(t2.id);
    });
    expect(store.getState().selectedTemplateId).toBe(t2.id);
    expect(store.getState().selectedTemplate?.name).toBe('T2');
  });

  it('should list all templates', () => {
    const t1 = createDefaultTemplate('T1');
    const t2 = createDefaultTemplate('T2');
    act(() => {
      store.getState().addTemplate(t1);
      store.getState().addTemplate(t2);
    });
    expect(store.getState().templates.map(t => t.name)).toEqual(['T1', 'T2']);
  });
}); 