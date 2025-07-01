import { Character, CharacterStats } from '../types/character';
import { PersonalityType } from '../types/dungeonMaster';
import { PromptContext } from './dynamicPrompts';

// DM Personality Analysis Interface
export interface DMPersonalityAnalysis {
  traits: string[];
  storytellingStyle: string;
  communicationStyle: string;
  difficultyPreference: 'easy' | 'medium' | 'hard';
  choiceStyle: string;
  narrativeVoice: string;
}

// Personality Modifiers Interface
export interface PersonalityModifiers {
  storyTone: string;
  choiceStyle: string;
  difficultyAdjustment: number;
  communicationStyle: string;
  narrativeVoice: string;
  moodInfluence: string;
}

// DM Personality Prompt Generation
export function createDMPersonalityPrompt(context: PromptContext): string {
  const { character, dm, current } = context;
  const analysis = dm.personality ? analyzeDMPersonality(dm.personality) : null;

  let prompt = `You are ${dm.personality?.name || 'a Dungeon Master'}, ${dm.personality?.description || 'guiding an adventure'}.

**DM Personality Context:**
- **Style**: ${dm.style}
- **Mood**: ${dm.mood}
${analysis ? `- **Traits**: ${analysis.traits.join(', ')}
- **Storytelling Style**: ${analysis.storytellingStyle}
- **Communication Style**: ${analysis.communicationStyle}` : '- **Traits**: Balanced and neutral'}

**Character Context:**
- **Stats**: INT ${character.stats.intelligence}, CRE ${character.stats.creativity}, PER ${character.stats.perception}, WIS ${character.stats.wisdom}
- **Level**: ${character.level} (${character.experience} experience)
- **Health**: ${character.health}/200

**Current Situation:**
- **Image**: ${current.imageDescription}
${current.previousStory ? `- **Previous Story**: ${current.previousStory}` : ''}

**Personality-Driven Requirements:**
- Maintain your ${dm.style} style throughout the interaction
- Reflect your ${dm.mood} mood in the narrative tone
- Use your unique personality traits to shape the story
- Provide choices that align with your storytelling approach
- Create consequences that reflect your DM personality

The story and choices should feel like they're coming from a DM with your specific personality and style.`;

  return prompt;
}

// Personality-Driven Story Generation
export function createPersonalityDrivenStoryPrompt(context: PromptContext): string {
  const { character, game, dm, current } = context;
  const analysis = dm.personality ? analyzeDMPersonality(dm.personality) : null;
  const modifiers = dm.personality ? generatePersonalityModifiers(dm.personality) : null;

  let prompt = `Create a personality-driven story that reflects your unique DM style.

**DM Personality:**
- **Name**: ${dm.personality?.name || 'Default DM'}
- **Style**: ${dm.style}
- **Mood**: ${dm.mood}
${analysis ? `- **Traits**: ${analysis.traits.join(', ')}
- **Storytelling Approach**: ${analysis.storytellingStyle}
- **Narrative Voice**: ${analysis.narrativeVoice}` : '- **Approach**: Balanced and neutral'}

**Character Context:**
- **Level**: ${character.level} (${character.experience} experience)
- **Stats**: INT ${character.stats.intelligence}, CRE ${character.stats.creativity}, PER ${character.stats.perception}, WIS ${character.stats.wisdom}
- **Health**: ${character.health}/200
- **Current Turn**: ${game.currentTurn} of ${game.totalTurns}

**Story Requirements:**
- **Tone**: ${modifiers?.storyTone || 'balanced'}
- **Communication**: ${modifiers?.communicationStyle || 'clear and direct'}
- **Character Development**: Focus on personal growth and character arc
- **Mood Influence**: ${dm.mood === 'positive' ? 'Optimistic and encouraging' : dm.mood === 'negative' ? 'Challenging and intense' : 'Balanced and objective'}

**Current Context:**
- **Image**: ${current.imageDescription}
${current.previousStory ? `- **Story Continuation**: Build upon ${current.previousStory}` : '- **New Adventure**: Begin a new chapter'}

Create a story that embodies your unique personality while advancing the character's journey.`;

  return prompt;
}

// DM Mood System
export function createDMMoodSystemPrompt(context: PromptContext): string {
  const { dm } = context;
  const mood = dm.mood;

  let prompt = `Adjust your storytelling based on your current mood: ${mood}.

**Mood-Based Modifications:**
${mood === 'positive' ? 
  `- **Optimistic Tone**: Focus on opportunities and positive outcomes
- **Encouraging Language**: Support character growth and success
- **Hopeful Atmosphere**: Create uplifting and inspiring moments
- **Reward-Oriented**: Emphasize achievements and progress` :
  mood === 'negative' ?
  `- **Challenging Tone**: Present difficult situations and obstacles
- **Intense Atmosphere**: Create tension and dramatic moments
- **Consequence-Focused**: Emphasize the weight of decisions
- **Growth Through Adversity**: Use challenges for character development` :
  `- **Balanced Tone**: Maintain objective and fair storytelling
- **Neutral Atmosphere**: Create balanced opportunities and challenges
- **Measured Approach**: Provide fair consequences and rewards
- **Character-Driven**: Focus on character choices and development`
}

**Mood Integration:**
- Let your ${mood} mood influence the story's emotional tone
- Adjust difficulty and consequences based on mood
- Maintain personality consistency while reflecting mood
- Use mood to enhance character development opportunities

Your mood should enhance the storytelling experience while maintaining your core personality.`;

  return prompt;
}

// Personality Adaptation System
export function createPersonalityAdaptationPrompt(context: PromptContext): string {
  const { character, game, dm } = context;
  const analysis = dm.personality ? analyzeDMPersonality(dm.personality) : null;
  const choiceHistory = game.choiceHistory;

  let prompt = `Adapt your personality to the character's preferences and choices while maintaining your core identity.

**DM Personality:**
- **Core Traits**: ${analysis?.traits.join(', ') || 'Balanced'}
- **Adaptation Style**: ${analysis?.storytellingStyle || 'Flexible'}
- **Communication**: ${analysis?.communicationStyle || 'Clear'}

**Character Analysis:**
- **Choice History**: ${choiceHistory.length} previous choices
- **Character Level**: ${character.level} (${character.experience} experience)
- **Current Stats**: INT ${character.stats.intelligence}, CRE ${character.stats.creativity}, PER ${character.stats.perception}, WIS ${character.stats.wisdom}

**Adaptation Requirements:**
- **Maintain Core Identity**: Stay true to your fundamental personality
- **Respond to Preferences**: Adapt to character's choice patterns
- **Flexible Approach**: Adjust difficulty and style based on character needs
- **Consistent Voice**: Keep your unique narrative voice throughout
- **Character Growth**: Support character development through your personality

**Adaptive Storytelling:**
- Use your personality to enhance character experiences
- Provide choices that align with both your style and character preferences
- Create consequences that reflect your personality while serving character growth
- Maintain narrative consistency while being responsive to character actions

Adapt your approach while staying true to who you are as a DM.`;

  return prompt;
}

// Analyze DM Personality
export function analyzeDMPersonality(personality: PersonalityType): DMPersonalityAnalysis {
  const traits: string[] = [];
  const description = personality.description.toLowerCase();
  const style = personality.style.toLowerCase();

  // Extract traits from description
  if (description.includes('mysterious') || description.includes('enigmatic')) {
    traits.push('mysterious', 'enigmatic');
  }
  if (description.includes('action') || description.includes('dynamic')) {
    traits.push('action-oriented', 'dynamic');
  }
  if (description.includes('humorous') || description.includes('witty')) {
    traits.push('humorous', 'witty');
  }
  if (description.includes('strategic') || description.includes('analytical')) {
    traits.push('strategic', 'analytical');
  }
  if (description.includes('empathetic') || description.includes('caring')) {
    traits.push('empathetic', 'caring');
  }
  if (description.includes('challenging') || description.includes('demanding')) {
    traits.push('challenging', 'demanding');
  }
  if (description.includes('wise') || description.includes('sage')) {
    traits.push('wise', 'sage-like');
  }

  // Determine storytelling style
  let storytellingStyle = style;
  if (style.includes('mysterious')) {
    storytellingStyle = 'mysterious and enigmatic';
  } else if (style.includes('action')) {
    storytellingStyle = 'action-oriented and dynamic';
  } else if (style.includes('humorous')) {
    storytellingStyle = 'humorous and entertaining';
  }

  // Determine communication style
  let communicationStyle = 'clear and direct';
  if (traits.includes('mysterious')) {
    communicationStyle = 'enigmatic and cryptic';
  } else if (traits.includes('humorous')) {
    communicationStyle = 'witty and entertaining';
  } else if (traits.includes('strategic')) {
    communicationStyle = 'analytical and methodical';
  }

  // Determine difficulty preference
  let difficultyPreference: 'easy' | 'medium' | 'hard' = 'medium';
  if (traits.includes('challenging') || traits.includes('demanding')) {
    difficultyPreference = 'hard';
  } else if (traits.includes('empathetic') || traits.includes('caring')) {
    difficultyPreference = 'easy';
  }

  // Determine choice style
  let choiceStyle = 'balanced';
  if (traits.includes('mysterious')) {
    choiceStyle = 'mysterious and thought-provoking';
  } else if (traits.includes('action')) {
    choiceStyle = 'action-oriented and dynamic';
  } else if (traits.includes('strategic')) {
    choiceStyle = 'strategic and tactical';
  }

  // Determine narrative voice
  let narrativeVoice = 'neutral';
  if (traits.includes('mysterious')) {
    narrativeVoice = 'enigmatic and mystical';
  } else if (traits.includes('humorous')) {
    narrativeVoice = 'witty and entertaining';
  } else if (traits.includes('action')) {
    narrativeVoice = 'dynamic and exciting';
  }

  return {
    traits: [...new Set(traits)],
    storytellingStyle,
    communicationStyle,
    difficultyPreference,
    choiceStyle,
    narrativeVoice
  };
}

// Generate Personality Modifiers
export function generatePersonalityModifiers(personality: PersonalityType): PersonalityModifiers {
  const analysis = analyzeDMPersonality(personality);
  const style = personality.style.toLowerCase();

  let storyTone = 'balanced';
  let choiceStyle = 'standard';
  let difficultyAdjustment = 0;
  let communicationStyle = 'clear';
  let narrativeVoice = 'neutral';
  let moodInfluence = 'moderate';

  if (style.includes('mysterious')) {
    storyTone = 'mysterious and enigmatic';
    choiceStyle = 'mysterious and thought-provoking';
    communicationStyle = 'enigmatic and cryptic';
    narrativeVoice = 'mystical and mysterious';
    moodInfluence = 'strong';
  } else if (style.includes('action')) {
    storyTone = 'action-oriented and dynamic';
    choiceStyle = 'action-packed and exciting';
    difficultyAdjustment = 1;
    communicationStyle = 'energetic and direct';
    narrativeVoice = 'dynamic and thrilling';
    moodInfluence = 'moderate';
  } else if (style.includes('humorous')) {
    storyTone = 'humorous and light-hearted';
    choiceStyle = 'entertaining and fun';
    difficultyAdjustment = -1;
    communicationStyle = 'witty and entertaining';
    narrativeVoice = 'amusing and engaging';
    moodInfluence = 'strong';
  } else if (style.includes('strategic')) {
    storyTone = 'strategic and analytical';
    choiceStyle = 'tactical and thoughtful';
    difficultyAdjustment = 1;
    communicationStyle = 'methodical and precise';
    narrativeVoice = 'analytical and strategic';
    moodInfluence = 'weak';
  }

  return {
    storyTone,
    choiceStyle,
    difficultyAdjustment,
    communicationStyle,
    narrativeVoice,
    moodInfluence
  };
}

// Create DM Style Prompt
export function createDMStylePrompt(context: PromptContext): string {
  const { dm } = context;
  const analysis = dm.personality ? analyzeDMPersonality(dm.personality) : null;
  const modifiers = dm.personality ? generatePersonalityModifiers(dm.personality) : null;

  let prompt = `Maintain your unique ${dm.style} style throughout the storytelling.

**Style Characteristics:**
- **Storytelling Approach**: ${analysis?.storytellingStyle || 'balanced'}
- **Narrative Voice**: ${modifiers?.narrativeVoice || 'neutral'}
- **Communication Style**: ${modifiers?.communicationStyle || 'clear'}
- **Choice Presentation**: ${modifiers?.choiceStyle || 'standard'}

**Style Requirements:**
- **Consistent Voice**: Maintain your unique narrative voice
- **Style Integration**: Let your style influence all story elements
- **Character Interaction**: Use your style to enhance character engagement
- **Atmosphere Creation**: Create atmosphere that reflects your style
- **Choice Design**: Design choices that align with your storytelling approach

**Style Application:**
- Apply your ${dm.style} style to story descriptions
- Use your style to shape choice consequences
- Maintain style consistency across all interactions
- Let your style enhance the overall experience

Your style should be evident in every aspect of the storytelling while serving the character's development.`;

  return prompt;
}

// Create Personality Consistency Prompt
export function createPersonalityConsistencyPrompt(context: PromptContext): string {
  const { character, game, dm } = context;
  const analysis = dm.personality ? analyzeDMPersonality(dm.personality) : null;
  const storyHistory = game.storyHistory;

  let prompt = `Maintain personality consistency throughout the character's journey.

**DM Personality:**
- **Core Identity**: ${dm.personality?.name || 'Default DM'}
- **Key Traits**: ${analysis?.traits.join(', ') || 'Balanced'}
- **Narrative Voice**: ${analysis?.narrativeVoice || 'Neutral'}

**Consistency Requirements:**
- **Character Voice**: Maintain your unique voice across all interactions
- **Story Progression**: Keep personality consistent through story development
- **Choice Consistency**: Ensure choices reflect your personality style
- **Consequence Alignment**: Make consequences align with your approach
- **Mood Integration**: Integrate mood changes while maintaining core personality

**Story Continuity:**
${storyHistory.length > 0 ? 
  `- **Previous Stories**: ${storyHistory.length} stories told
- **Narrative Thread**: Continue your personality-driven narrative
- **Character Development**: Support character growth through your consistent style` :
  '- **New Journey**: Begin with your personality-driven approach'
}

**Consistency Guidelines:**
- Stay true to your fundamental personality traits
- Adapt to character needs while maintaining your identity
- Use your unique style to enhance the storytelling experience
- Ensure all interactions reflect your core personality
- Maintain narrative voice consistency throughout

Your personality should be a constant presence that enhances the character's journey.`;

  return prompt;
} 