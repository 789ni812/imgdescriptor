import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses an RPG image description string into structured sections.
 * Returns an object with keys: setting, objects, characters, mood, hooks, and other.
 */
type SectionKey = 'setting' | 'objects' | 'characters' | 'mood' | 'hooks' | 'other';
export function parseImageDescriptionSections(description: string) {
  // Simple regex-based section splitter for common RPG analysis headings
  const sections: Record<SectionKey, string> = {
    setting: '',
    objects: '',
    characters: '',
    mood: '',
    hooks: '',
    other: ''
  };
  if (!description) return sections;
  // Normalize line endings
  const text = description.replace(/\r\n|\r/g, '\n');
  // Split by numbered or named headings
  const regex = /(?:^|\n)(\d+\.\s*Setting:|Setting:|\d+\.\s*Objects:|Objects:|\d+\.\s*People\/Characters:|People\/Characters:|\d+\.\s*Mood & Atmosphere:|Mood & Atmosphere:|\d+\.\s*Narrative Hooks.*:|Narrative Hooks.*:)/gi;
  const parts = text.split(regex).map(s => s.trim()).filter(Boolean);
  let current: SectionKey = 'other';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].toLowerCase();
    if (part.includes('setting')) current = 'setting';
    else if (part.includes('object')) current = 'objects';
    else if (part.includes('people/characters')) current = 'characters';
    else if (part.includes('mood')) current = 'mood';
    else if (part.includes('hook')) current = 'hooks';
    else {
      sections[current] += (sections[current] ? '\n' : '') + parts[i];
    }
  }
  return sections;
}

/**
 * Parses an RPG story string into structured sections.
 * Returns an object with keys: sceneTitle, summary, dilemmas, cues, consequences, other.
 */
type StorySectionKey = 'sceneTitle' | 'summary' | 'dilemmas' | 'cues' | 'consequences' | 'other';
export function parseStorySections(story: string) {
  const sections: Record<StorySectionKey, string> = {
    sceneTitle: '',
    summary: '',
    dilemmas: '',
    cues: '',
    consequences: '',
    other: ''
  };
  if (!story) return sections;
  const text = story.replace(/\r\n|\r/g, '\n');
  // Try to extract a scene title (e.g., 'Scene: The Labyrinth of Shadows')
  const sceneTitleMatch = text.match(/Scene:\s*([\w\s\-']+)/i);
  if (sceneTitleMatch) {
    sections.sceneTitle = sceneTitleMatch[1].trim();
  }
  // Extract dilemmas, cues, consequences by heading or keywords
  const regex = /(?:^|\n)(Key Dilemmas:|Dilemmas:|Visual Cues:|Cues:|Ongoing Consequences:|Consequences:)/gi;
  const parts = text.split(regex).map(s => s.trim()).filter(Boolean);
  let current: StorySectionKey = 'summary';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].toLowerCase();
    if (part.includes('dilemma')) current = 'dilemmas';
    else if (part.includes('cue')) current = 'cues';
    else if (part.includes('consequence')) current = 'consequences';
    else {
      sections[current] += (sections[current] ? '\n' : '') + parts[i];
    }
  }
  // If no headings found, treat the whole story as summary
  if (!sections.summary && text) sections.summary = text;
  return sections;
}
