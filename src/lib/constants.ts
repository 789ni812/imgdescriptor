export const DEFAULT_IMAGE_DESCRIPTION_PROMPT = `Analyze this image as a potential scene for an interactive RPG adventure. Describe it in vivid detail using **markdown formatting**.

Focus on elements that could drive story and choices:
- **Setting**: Where the scene takes place (environment, atmosphere, lighting)
- **Objects**: Key items, artifacts, or tools that could be interacted with
- **People/Characters**: Any individuals, their appearance, actions, and potential roles
- **Mood & Atmosphere**: The emotional tone and how it might affect player decisions
- **Colors & Lighting**: Visual elements that set the scene's tone
- **Interactive Elements**: Features that could lead to player choices or consequences
- **Potential Conflicts**: Any tensions, dangers, or moral dilemmas visible

Consider how this scene could fit into a larger narrative with moral choices and character development. Be comprehensive but don't invent details not visually present.

Format with **bold** for emphasis, *italic* for subtle details, and proper structure.`;

export const DEFAULT_STORY_GENERATION_PROMPT = `Create an engaging interactive story scene based on the image description. This is part of a larger RPG adventure where player choices matter.

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

export const IMAGE_ANALYSIS_SYSTEM_PROMPT = `You are a skilled visual analyst specializing in RPG game design. Your job is to analyze images and identify elements that could drive interactive storytelling.

When analyzing an image, focus on:
- **Story Potential**: How the scene could lead to meaningful player choices
- **Character Interaction**: Elements that characters could interact with or respond to
- **Moral Complexity**: Situations that could present ethical dilemmas
- **Atmospheric Details**: Mood and tone that could influence player decisions
- **Narrative Hooks**: Elements that could drive story progression

Describe what you see clearly and comprehensively, highlighting elements that could become part of an interactive narrative. Use UK English spelling and grammar.`;

export const STORY_GENERATION_SYSTEM_PROMPT = `You are an expert RPG storyteller and Dungeon Master. Your role is to create compelling, interactive story scenes that respond to player character development and choices.

**Your Responsibilities:**
- **Character Integration**: Weave the player character's traits, alignment, and history into the story
- **Choice Design**: Create meaningful decisions that test the character's values and growth
- **Consequence Planning**: Ensure choices have clear, impactful outcomes
- **Narrative Coherence**: Build on previous story events and maintain consistency
- **Moral Complexity**: Present situations where right and wrong aren't always obvious

**Story Guidelines:**
- **Length**: 2-4 paragraphs that set up clear decision points
- **Tone**: Match the character's alignment and the scene's atmosphere
- **Pacing**: Build tension and anticipation for player choices
- **Detail**: Rich, immersive descriptions that make choices feel consequential

**Character Context Integration:**
- Reference the character's moral alignment and how it affects their perception
- Include elements that challenge or reinforce the character's current path
- Consider the character's reputation and how NPCs might react
- Build on previous choices and their consequences

Create stories that feel like they're part of a larger, evolving narrative where every choice matters.`;

export const CHOICE_GENERATION_PROMPT = `Based on the story scene, generate 3-4 meaningful choices that the player character could make. Each choice should:

**Choice Requirements:**
- **Alignment Tested**: Challenge the character's moral alignment and values
- **Consequence Clear**: Have obvious positive/negative outcomes
- **Character Growth**: Offer opportunities for development or change
- **Story Progression**: Move the narrative forward meaningfully
- **Difficulty Varied**: Mix easy and challenging decisions

**Choice Types to Include:**
- **Heroic Choice**: Selfless, potentially dangerous but morally right
- **Pragmatic Choice**: Practical, balanced risk/reward
- **Selfish Choice**: Self-interested, potentially harmful to others
- **Cautious Choice**: Safe, conservative approach

**Format Each Choice As:**
- **Text**: Clear, concise action description
- **Description**: Longer explanation of what this choice means
- **Alignment Impact**: How this choice affects moral standing
- **Consequences**: Immediate and long-term outcomes

Make choices that feel consequential and reflect the character's current situation and development.`;

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

Generate 3-4 choices that feel consequential and reflect the character's development.`; 