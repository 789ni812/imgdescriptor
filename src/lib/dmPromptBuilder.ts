import type { PersonalityType, DungeonMasterTemplate } from '@/lib/types/dungeonMaster';

export interface DMPromptContext {
  personality: PersonalityType | null;
  freeformAnswers: Record<string, string>;
  template: DungeonMasterTemplate;
}

export function buildDMEnhancedStoryPrompt(
  basePrompt: string,
  description: string,
  dmContext: DMPromptContext,
  characterContext?: string
): string {
  const { personality, freeformAnswers } = dmContext;
  
  // Build personality-specific modifiers
  const personalityModifiers = buildPersonalityModifiers(personality);
  
  // Build freeform context
  const freeformContext = buildFreeformContext(freeformAnswers);
  
  // Build the enhanced prompt
  const enhancedPrompt = [
    basePrompt,
    personalityModifiers,
    freeformContext,
    characterContext,
    `Image Description: ${description}`
  ].filter(Boolean).join('\n\n');

  return enhancedPrompt;
}

export function buildDMEnhancedChoicePrompt(
  story: string,
  dmContext: DMPromptContext
): string {
  const { personality, freeformAnswers } = dmContext;
  
  const personalityModifiers = buildPersonalityModifiers(personality);
  const freeformContext = buildFreeformContext(freeformAnswers);
  
  return [
    'Generate 3-4 meaningful choices for the player based on the story above.',
    personalityModifiers,
    freeformContext,
    `Story: ${story}`,
    'Each choice should reflect the story context and player preferences. Make choices impactful and varied.',
    'Each choice MUST reference the current scene and the player\'s recent actions or stats.'
  ].filter(Boolean).join('\n\n');
}

export function buildDMEnhancedFinalStoryPrompt(
  characterContext: string,
  dmContext: DMPromptContext
): string {
  const { personality, freeformAnswers } = dmContext;
  
  const personalityModifiers = buildPersonalityModifiers(personality);
  const freeformContext = buildFreeformContext(freeformAnswers);
  
  return [
    'Create a final, cohesive story that weaves together all the previous turns into an epic conclusion.',
    personalityModifiers,
    freeformContext,
    characterContext,
    'Make sure the final story reflects the overall theme, setting, and goals established throughout the adventure.'
  ].filter(Boolean).join('\n\n');
}

function buildPersonalityModifiers(personality: PersonalityType | null): string {
  if (!personality) {
    return '';
  }

  const modifiers: string[] = [];
  // Only use valid PersonalityType fields
  modifiers.push(`Dungeon Master Style: ${personality.name} - ${personality.description}`);
  modifiers.push(`Storytelling Style: ${personality.style}`);
  return `DM Personality Context:\n${modifiers.join('\n')}`;
}

function buildFreeformContext(freeformAnswers: Record<string, string>): string {
  const context: string[] = [];
  
  if (freeformAnswers.theme) {
    context.push(`Theme: ${freeformAnswers.theme}`);
  }
  
  if (freeformAnswers.setting) {
    context.push(`Setting: ${freeformAnswers.setting}`);
  }
  
  if (freeformAnswers.goal) {
    context.push(`Character Goal: ${freeformAnswers.goal}`);
  }
  
  if (context.length === 0) {
    return '';
  }
  
  return `Story Context:\n${context.join('\n')}`;
}

export function getDefaultDMContext(): DMPromptContext {
  return {
    personality: {
      name: 'Default DM',
      style: 'neutral',
      description: 'A balanced, neutral Dungeon Master style.'
    },
    freeformAnswers: {},
    template: {
      personality: {
        name: 'Default DM',
        style: 'neutral',
        description: 'A balanced, neutral Dungeon Master style.'
      },
      notes: ''
    }
  };
} 