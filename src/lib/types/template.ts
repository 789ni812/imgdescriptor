export interface GameTemplate {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Character config
  character: {
    persona: string;
    traits: string[];
    stats: {
      intelligence: number;
      creativity: number;
      perception: number;
      wisdom: number;
    };
    health: number;
    heartrate: number;
    age: number;
    level: number;
    experience: number;
  };
  // Image/story data
  images: {
    id: string;
    url: string;
    description: string;
    story: string;
    turn: number;
    uploadedAt: string;
  }[];
  // Final story (optional, if already generated)
  finalStory?: string;
  // UI/UX config
  fontFamily?: string;
  fontSize?: string;
  // Storage config
  folderLocation?: string;
  // No custom fields for now
}

export function importGameTemplate(template: GameTemplate) {
  return {
    character: template.character,
    imageHistory: template.images,
    finalStory: template.finalStory,
    fontFamily: template.fontFamily,
    fontSize: template.fontSize,
    folderLocation: template.folderLocation,
    templateId: template.id,
    templateName: template.name,
  };
} 