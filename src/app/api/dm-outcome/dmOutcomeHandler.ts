import type { Character, Choice } from '@/lib/types/character';

export interface DMOutcomeResult {
  outcomeNarration: string;
  statChanges: Partial<Character['stats']>;
  gameOver: boolean;
}

interface DMOutcomeInput {
  character: Character;
  previousStory: string;
  selectedChoice: Choice;
}

export function getDMOutcome({ character, previousStory, selectedChoice }: DMOutcomeInput): DMOutcomeResult {
  // Placeholder logic for TDD: always return a fixed outcome
  // (Will be replaced with LLM prompt and real stat logic)
  const statChanges = { intelligence: 1 };
  // Use wisdom as the critical stat for game over
  const newWisdom = character.stats.wisdom ?? 1;
  const gameOver = newWisdom <= 0;
  return {
    outcomeNarration: `You chose: ${selectedChoice.text}. The DM narrates your fate.`,
    statChanges,
    gameOver,
  };
} 