/**
 * BACKUP: Original LLM Prompts for Fighting Game System
 * 
 * This file contains the original prompts as they existed before any tweaks.
 * Use this to restore original prompts if needed.
 * 
 * Created: 2025-01-27
 * Purpose: Backup before prompt tweaks
 */

// ============================================================================
// 1. FIGHTER GENERATION (New Fighter Upload)
// ============================================================================
// Location: src/lib/lmstudio-client.ts - generateFighterStats()

export const ORIGINAL_FIGHTER_GENERATION_SYSTEM_PROMPT = `You are an expert at analyzing images and generating balanced fighter statistics for a fighting game. 
Based on the image description and fighter label, generate realistic but balanced stats.

Return ONLY a JSON object with these fields:
- strength: number (1-200)
- agility: number (1-100) 
- health: number (20-1000)
- defense: number (1-100)
- luck: number (1-50)
- age: number (1-1000000)
- size: "small" | "medium" | "large"
- build: "thin" | "average" | "muscular" | "heavy"
- magic: number (0-100, only if character has supernatural powers)
- ranged: number (0-100, only if character has ranged attacks)
- intelligence: number (1-100)
- uniqueAbilities: string[] (2-4 special abilities based on character type)

Consider the fighter's characteristics when generating stats. Only include magic/ranged if appropriate.`;

export const ORIGINAL_FIGHTER_GENERATION_USER_PROMPT = (fighterLabel: string, imageDescription: string) => 
`Generate stats for: ${fighterLabel}
Image description: ${imageDescription}`;

// ============================================================================
// 2. FIGHTER BALANCING (Rebalance Existing Fighters)
// ============================================================================
// Location: src/lib/fighter-balancing.ts - balanceFighterWithLLM()

export const ORIGINAL_FIGHTER_BALANCING_SYSTEM_PROMPT = `You are an expert at generating balanced fighter statistics for a fighting game. 
Based on the fighter description and type guidelines, generate realistic and balanced stats.

Return ONLY a JSON object with these fields:
- strength: number (within the specified range)
- agility: number (within the specified range) 
- health: number (within the specified range)
- defense: number (within the specified range)
- luck: number (within the specified range)
- age: number (1-1000000)
- size: "small" | "medium" | "large"
- build: "thin" | "average" | "muscular" | "heavy"

Ensure stats are logical and respect the fighter type guidelines.`;

export const ORIGINAL_FIGHTER_BALANCING_USER_PROMPT = (
  fighterName: string, 
  typeConfig: {
    name: string;
    healthRange: [number, number];
    strengthRange: [number, number];
    agilityRange: [number, number];
    defenseRange: [number, number];
    luckRange: [number, number];
    magicRange?: [number, number];
    rangedRange?: [number, number];
    intelligenceRange?: [number, number];
  }, 
  size: string, 
  build: string
) => `Generate balanced stats for a fighting game character.

Fighter: ${fighterName}
Type: ${typeConfig.name}
Size: ${size}
Build: ${build}

Type Guidelines:
- ${typeConfig.name}: Health ${typeConfig.healthRange[0]}-${typeConfig.healthRange[1]}, Strength ${typeConfig.strengthRange[0]}-${typeConfig.strengthRange[1]}, Agility ${typeConfig.agilityRange[0]}-${typeConfig.agilityRange[1]}, Defense ${typeConfig.defenseRange[0]}-${typeConfig.defenseRange[1]}, Luck ${typeConfig.luckRange[0]}-${typeConfig.luckRange[1]}
${typeConfig.magicRange ? `- Magic: ${typeConfig.magicRange[0]}-${typeConfig.magicRange[1]}` : ''}
${typeConfig.rangedRange ? `- Ranged: ${typeConfig.rangedRange[0]}-${typeConfig.rangedRange[1]}` : ''}
${typeConfig.intelligenceRange ? `- Intelligence: ${typeConfig.intelligenceRange[0]}-${typeConfig.intelligenceRange[1]}` : ''}

Important: Respect the type guidelines and ensure logical relationships (e.g., a mouse should have much lower strength than a Sith Lord).`;

// ============================================================================
// 3. BATTLE COMMENTARY GENERATION
// ============================================================================
// Location: src/lib/lmstudio-client.ts - generateBattleCommentary()

export const ORIGINAL_BATTLE_COMMENTARY_SYSTEM_PROMPT = `You are an expert fighting game commentator. Generate concise, exciting, and readable battle commentary. Use normal sentence casing, never all-caps.`;

export const ORIGINAL_BATTLE_COMMENTARY_USER_PROMPT = (
  fighterA: string, 
  fighterB: string, 
  round: number, 
  action: string, 
  damage?: number
) => `Generate a concise, exciting, and readable battle commentary for a fighting game round.

Fighter A: ${fighterA}
Fighter B: ${fighterB}
Round: ${round}
Action: ${action}${damage ? ` (Damage: ${damage})` : ''}

Requirements:
- 1 to 2 sentences, maximum 30 words total
- Use normal sentence casing (no all-caps, only capitalize proper nouns or dramatic effect)
- Make it clear, exciting, and easy to read
- Avoid awkward or nonsensical phrases
- Do not use repetitive language
- Do not use markdown, formatting, or JSON—just the commentary text`;

// ============================================================================
// 4. PLANNED TOURNAMENT PROMPTS (Not Yet Implemented)
// ============================================================================
// From spec.md - planned but not yet implemented

export const PLANNED_TOURNAMENT_OVERVIEW_PROMPT = `You are a sports commentator analyzing a fighting tournament. 
Generate a brief tournament overview for this battle including:
- Tournament context and significance
- Arena description and tactical implications
- Any notable highlights leading to this battle

Keep it concise (2-3 sentences) and exciting.
Return ONLY the overview text, no JSON formatting.`;

export const PLANNED_BATTLE_SUMMARY_PROMPT = `You are a sports commentator summarizing a fighting match.
Based on the battle log, create a 2-3 sentence summary highlighting:
- Key turning points
- Notable attacks or defenses
- Special events or abilities used
- Overall battle flow and outcome

Make it exciting and capture the drama of the fight.
Return ONLY the summary text, no JSON formatting.`;

// ============================================================================
// 5. MODEL CONFIGURATIONS
// ============================================================================

export const ORIGINAL_MODEL_CONFIGS = {
  FIGHTER_GENERATION: {
    model: 'gemma-the-writer-n-restless-quill-10b-uncensored@q2_k',
    temperature: 0.7,
    max_tokens: 512
  },
  FIGHTER_BALANCING: {
    model: 'local-model',
    temperature: 0.3,
    max_tokens: 512
  },
  BATTLE_COMMENTARY: {
    model: 'gemma-the-writer-n-restless-quill-10b-uncensored@q2_k',
    temperature: 0.7,
    max_tokens: 100,
    top_p: 0.85,
    frequency_penalty: 0.3,
    presence_penalty: 0.2
  }
};

// ============================================================================
// 6. RESTORE FUNCTION
// ============================================================================

export function restoreOriginalPrompts() {
  console.log('Original prompts backed up. To restore, replace the current prompts with these original versions.');
  return {
    fighterGeneration: {
      system: ORIGINAL_FIGHTER_GENERATION_SYSTEM_PROMPT,
      user: ORIGINAL_FIGHTER_GENERATION_USER_PROMPT
    },
    fighterBalancing: {
      system: ORIGINAL_FIGHTER_BALANCING_SYSTEM_PROMPT,
      user: ORIGINAL_FIGHTER_BALANCING_USER_PROMPT
    },
    battleCommentary: {
      system: ORIGINAL_BATTLE_COMMENTARY_SYSTEM_PROMPT,
      user: ORIGINAL_BATTLE_COMMENTARY_USER_PROMPT
    },
    modelConfigs: ORIGINAL_MODEL_CONFIGS
  };
} 