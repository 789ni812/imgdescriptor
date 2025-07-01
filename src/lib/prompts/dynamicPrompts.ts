import { Character, StoryEntry, ChoiceOutcome } from "../types/character";
import { PersonalityType } from "../types/dungeonMaster";

export interface DynamicPromptTemplate {
  id: string;
  name: string;
  type: "image-description" | "story-generation" | "choice-generation" | "final-story";
  basePrompt: string;
  placeholders: {
    [key: string]: {
      description: string;
      required: boolean;
      defaultValue?: string;
      validation?: (value: unknown) => boolean;
    };
  };
  requiredContext: string[];
  version: string;
  tags: string[];
  description: string;
}

export interface PromptContext {
  character: Character;
  dmConfig?: {
    personality?: PersonalityType;
    style?: string;
    difficulty?: string;
  };
  gameState?: {
    currentTurn?: number;
    maxTurns?: number;
    storyHistory?: StoryEntry[];
    choiceHistory?: ChoiceOutcome[];
  };
  imageDescription?: string;
  previousStory?: string;
  [key: string]: unknown;
}

export function replacePlaceholders(template: string, context: Record<string, unknown>): string {
  let result = template;
  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined && value !== null) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value));
    }
  }
  return result;
}

export function validatePromptTemplate(template: DynamicPromptTemplate): boolean {
  if (!template.id || !template.name || !template.basePrompt) {
    return false;
  }
  for (const [, config] of Object.entries(template.placeholders)) {
    if (!config.description || typeof config.required !== "boolean") {
      return false;
    }
  }
  return true;
}

export function createPromptContext(
  character: Character, 
  dmConfig?: { personality?: PersonalityType; style?: string; difficulty?: string }, 
  gameState?: { currentTurn?: number; maxTurns?: number; storyHistory?: StoryEntry[]; choiceHistory?: ChoiceOutcome[] }
): PromptContext {
  return {
    character,
    dmConfig,
    gameState,
    characterName: character.persona,
    characterLevel: character.level,
    characterStats: JSON.stringify(character.stats),
    characterHealth: character.health,
    dmPersonality: dmConfig?.personality || "balanced",
    dmStyle: dmConfig?.style || "narrative",
    difficulty: dmConfig?.difficulty || "medium"
  };
}
