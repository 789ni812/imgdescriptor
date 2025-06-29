import { GameTemplate, importGameTemplate } from './template';

describe('GameTemplate Import', () => {
  it('should import a template and initialize app state', () => {
    const template: GameTemplate = {
      id: 'template-1',
      name: 'Test Adventure',
      createdAt: '2025-01-27T10:00:00Z',
      updatedAt: '2025-01-27T10:00:00Z',
      character: {
        persona: 'Explorer',
        traits: ['brave', 'curious'],
        stats: { intelligence: 12, creativity: 14, perception: 16, wisdom: 18 },
        health: 100,
        heartrate: 70,
        age: 20,
        level: 1,
        experience: 0,
      },
      images: [
        {
          id: 'img-1',
          url: '/images/forest.jpg',
          description: 'A mysterious forest',
          story: 'The explorer enters the forest...',
          turn: 1,
          uploadedAt: '2025-01-27T10:01:00Z',
        },
      ],
      finalStory: 'The explorer completes their journey.',
      fontFamily: 'Inter',
      fontSize: '16px',
      folderLocation: '/adventures/test',
    };
    const state = importGameTemplate(template);
    expect(state.character).toEqual(template.character);
    expect(state.imageHistory).toEqual(template.images);
    expect(state.finalStory).toBe(template.finalStory);
    expect(state.fontFamily).toBe(template.fontFamily);
    expect(state.fontSize).toBe(template.fontSize);
    expect(state.folderLocation).toBe(template.folderLocation);
    expect(state.templateId).toBe(template.id);
    expect(state.templateName).toBe(template.name);
  });
}); 