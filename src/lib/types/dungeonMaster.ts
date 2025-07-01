// Minimal Dungeon Master types for DM config in templates and DM store

export interface PersonalityType {
  name: string;
  style: string;
  description?: string;
}

export interface DungeonMasterTemplate {
  personality: PersonalityType;
  notes?: string;
}

export function createDefaultDMTemplate(name: string): DungeonMasterTemplate {
  return {
    personality: {
      name: name || 'Default DM',
      style: 'neutral',
      description: 'A balanced, neutral Dungeon Master style.'
    },
    notes: '',
  };
} 