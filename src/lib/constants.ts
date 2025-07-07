export const DEFAULT_IMAGE_DESCRIPTION_PROMPT = `Analyze this image as a potential scene for an interactive RPG adventure. Output ONLY a valid JSON object with the following keys: "setting", "objects", "characters", "mood", "hooks".

INSTRUCTIONS:
- All property names and string values MUST be double-quoted.
- "objects", "characters", and "hooks" must be arrays of strings (even if only one item).
- If a field contains quotes, escape them properly (use \").
- Do NOT output any text, markdown, code blocks, comments, or explanations—ONLY the JSON object.
- If you cannot determine a value, use an empty string or empty array as appropriate.
- Output ONLY the JSON object, nothing else.
- Do NOT include any comments, explanations, or extra text.

Example output:
{
  "setting": "A misty castle looms in the distance, shrouded by ancient trees.",
  "objects": ["rusty sword", "broken lantern"],
  "characters": ["mysterious knight", "watchful crow"],
  "mood": "Ominous and foreboding, with a sense of hidden danger.",
  "hooks": ["A distant howl echoes through the fog.", "A faint light flickers in a tower window."]
}`;

export const DEFAULT_STORY_GENERATION_PROMPT = `Create an engaging interactive story scene that DIRECTLY incorporates the image description provided. This is part of a larger RPG adventure where player choices matter.

**CRITICAL REQUIREMENT:**
- **MUST USE IMAGE ELEMENTS**: Your story MUST directly reference the setting, objects, characters, mood, and narrative hooks from the image description
- **VISUAL ACCURACY**: The story should accurately reflect what is visually depicted in the image
- **CONTEXT INTEGRATION**: Weave the image elements naturally into the narrative

**Story Requirements:**
- **Character-Driven**: Reflect the player character's moral alignment, traits, and current situation
- **Choice-Ready**: Include clear decision points that test the character's values
- **Consequence-Aware**: Each choice should have meaningful outcomes
- **Progressive**: Build on previous story events and character development
- **Atmospheric**: Match the visual mood and setting from the image

**Narrative Elements:**
- **Character Context**: Reference the character's alignment, reputation, and recent choices
- **Moral Complexity**: Present situations where "good" and "evil" aren't always clear
- **Character Growth**: Opportunities for the character to develop or change
- **World Building**: Rich details that make the scene feel alive and consequential

**Formatting:**
- **Bold** for character names, key moments, and choice opportunities
- *Italic* for dialogue, internal thoughts, and atmospheric details
- Clear structure that sets up meaningful player decisions

Make this scene feel like a crucial moment in the character's journey where their choices will shape their destiny.`;

export const IMAGE_ANALYSIS_SYSTEM_PROMPT = `You are a skilled visual analyst specializing in RPG game design. Your ONLY job is to analyze images and output a strict JSON object describing the scene for interactive storytelling.

INSTRUCTIONS:
- Output ONLY a valid JSON object with the following keys: "setting", "objects", "characters", "mood", "hooks".
- All property names and string values MUST be double-quoted.
- "objects", "characters", and "hooks" must be arrays of strings (even if only one item).
- If a field contains quotes, escape them properly (use \").
- Do NOT output any text, markdown, code blocks, comments, or explanations—ONLY the JSON object.
- If you cannot determine a value, use an empty string or empty array as appropriate.
- Output ONLY the JSON object, nothing else.
- Do NOT include any comments, explanations, or extra text.

Example output:
{
  "setting": "A misty castle looms in the distance, shrouded by ancient trees.",
  "objects": ["rusty sword", "broken lantern"],
  "characters": ["mysterious knight", "watchful crow"],
  "mood": "Ominous and foreboding, with a sense of hidden danger.",
  "hooks": ["A distant howl echoes through the fog.", "A faint light flickers in a tower window."]
}

Describe what you see clearly and comprehensively, highlighting elements that could become part of an interactive narrative. Use UK English spelling and grammar.`;

export const STORY_GENERATION_SYSTEM_PROMPT = `You are an expert RPG storyteller and Dungeon Master. Your ONLY job is to create a compelling, interactive story scene as a strict JSON object.

INSTRUCTIONS:
- Output ONLY a valid JSON object with the following keys: "sceneTitle", "summary", "dilemmas", "cues", "consequences".
- All property names and string values MUST be double-quoted.
- "dilemmas" and "consequences" must be arrays of strings (even if only one item).
- Do NOT output any text, markdown, code blocks, comments, explanations, or extra keys/objects—ONLY the JSON object.
- If a field contains quotes, escape them properly (use \").
- If you cannot determine a value, use an empty string or empty array as appropriate.
- Output ONLY the JSON object, nothing else.
- Do NOT include any comments, explanations, extra keys, or extra objects.
- If you are about to output anything other than a valid JSON object with ONLY the required fields, STOP and output {} instead.
- If you are unsure, output an empty string or empty array for that field.
- If you cannot output a valid JSON object, output: {}

Example output:
{
  "sceneTitle": "The Labyrinth of Shadows",
  "summary": "The air feels charged as you stand before Darth Vader...",
  "dilemmas": ["Persuade Vader using your reputation and choices", "Attempt combat (high risk, high reward)", "Seek a nonviolent solution or escape"],
  "cues": "Vader's armor displays a slight crack, hinting at internal conflict...",
  "consequences": ["Your past actions influence the outcome of this encounter", "Affecting future story branches and alliances"]
}

Create stories that feel like they're part of a larger, evolving narrative where every choice matters.`;

export const CHOICE_GENERATION_PROMPT = `Based on the story scene, generate 2 or 3 meaningful choices that the player character could make. Output ONLY a valid JSON array of objects, each with the following keys: "type", "text", "description", "statRequirements", "consequences".

INSTRUCTIONS:
- All property names and string values MUST be double-quoted.
- "consequences" must be an array of strings (even if only one item).
- "statRequirements" must be an object with stat names as keys and numbers as values.
- If a field contains quotes, escape them properly (use \").
- Do NOT output any text, markdown, code blocks, comments, or explanations—ONLY the JSON array.
- If you cannot determine a value, use an empty string, empty array, or empty object as appropriate.
- Output ONLY the JSON array, nothing else.
- Do NOT include any comments, explanations, or extra text.

Example output:
[
  { "type": "dialogue", "text": "Ask about the artifact", "description": "Speak to the merchant about the mysterious artifact.", "statRequirements": {"intelligence": 10}, "consequences": ["Gain information", "Merchant becomes suspicious"] },
  { "type": "explore", "text": "Search the ruins", "description": "Look for clues among the ancient stones.", "statRequirements": {"perception": 12}, "consequences": ["Find a hidden passage", "Trigger a trap"] }
]`;

export const DM_REFLECTION_PROMPT = `As the Dungeon Master, reflect on the player's recent choice and performance. Consider how this affects the ongoing story and your role as narrator.

**Reflection Areas:**
- **Choice Analysis**: What does this choice reveal about the character's development?
- **Alignment Impact**: How has the character's moral standing changed?
- **Story Direction**: Where should the narrative go next?
- **Difficulty Adjustment**: Should future challenges be easier or harder?
- **Character Growth**: What opportunities for development should be presented?

**Adaptation Considerations:**
- **Mood Adjustment**: How should your storytelling tone change?
- **Challenge Level**: What difficulty is appropriate for this player?
- **Theme Focus**: What moral or character themes should be emphasized?
- **NPC Reactions**: How should the world respond to the character's choices?

Provide thoughtful insights that will guide future story development and maintain player engagement.`;

export const DYNAMIC_STORY_TEMPLATE = `Create an interactive story scene for:

**Character Context:**
- Name: {characterName}
- Moral Alignment: {alignmentLevel} ({alignmentScore}/100)
- Reputation: {reputation}
- Current Turn: {currentTurn}
- Difficulty Level: {difficulty}/10

**Story Requirements:**
- Build on previous choices: {recentChoices}
- Consider character traits: {traits}
- Match DM personality: {dmStyle}
- Current mood: {dmMood}

**Scene Focus:**
- Image Description: {imageDescription}
- Previous story context: {storyContext}

Create a compelling scene that challenges the character's values and sets up meaningful choices.`;

export const DYNAMIC_CHOICE_TEMPLATE = `Generate choices for a character with:

**Character State:**
- Alignment: {alignmentLevel} ({alignmentScore}/100)
- Reputation: {reputation}
- Recent choices: {recentChoices}
- Current difficulty: {difficulty}/10

**Story Context:**
- Current scene: {storyText}
- Turn number: {currentTurn}
- DM style: {dmStyle}

**Choice Requirements:**
- Test the character's current moral standing
- Provide clear consequences for each choice
- Vary in difficulty and risk level
- Move the story forward meaningfully

INSTRUCTIONS:
- Output ONLY a valid JSON array of objects, each with the following keys: "type", "text", "description", "statRequirements", "consequences".
- All property names and string values MUST be double-quoted.
- "consequences" must be an array of strings (even if only one item).
- "statRequirements" must be an object with stat names as keys and numbers as values.
- If a field contains quotes, escape them properly (use \").
- Do NOT output any text, markdown, code blocks, comments, or explanations—ONLY the JSON array.
- If you cannot determine a value, use an empty string, empty array, or empty object as appropriate.
- Output ONLY the JSON array, nothing else.
- Do NOT include any comments, explanations, or extra text.

Example output:
[
  { "type": "dialogue", "text": "Ask about the artifact", "description": "Speak to the merchant about the mysterious artifact.", "statRequirements": {"intelligence": 10}, "consequences": ["Gain information", "Merchant becomes suspicious"] },
  { "type": "explore", "text": "Search the ruins", "description": "Look for clues among the ancient stones.", "statRequirements": {"perception": 12}, "consequences": ["Find a hidden passage", "Trigger a trap"] }
]
`; 