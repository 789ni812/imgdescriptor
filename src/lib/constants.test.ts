import { 
  DEFAULT_IMAGE_DESCRIPTION_PROMPT, 
  DEFAULT_STORY_GENERATION_PROMPT,
  CHOICE_GENERATION_PROMPT,
  DM_REFLECTION_PROMPT,
  DYNAMIC_STORY_TEMPLATE,
  DYNAMIC_CHOICE_TEMPLATE
} from './constants';

describe('Constants', () => {
  describe('DEFAULT_IMAGE_DESCRIPTION_PROMPT', () => {
    it('should include RPG game focus', () => {
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('interactive RPG adventure');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('moral choices');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('character development');
    });

    it('should include markdown formatting instructions', () => {
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('markdown formatting');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**bold**');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('*italic*');
    });

    it('should include structured content sections for RPG elements', () => {
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**Setting**');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**Objects**');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**People/Characters**');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**Mood & Atmosphere**');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**Interactive Elements**');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**Potential Conflicts**');
    });

    it('should be a non-empty string', () => {
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toBeTruthy();
      expect(typeof DEFAULT_IMAGE_DESCRIPTION_PROMPT).toBe('string');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT.length).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_STORY_GENERATION_PROMPT', () => {
    it('should include RPG story requirements', () => {
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('interactive story scene');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('RPG adventure');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('player choices matter');
    });

    it('should include character-driven elements', () => {
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('Character-Driven');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('moral alignment');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('Character Growth');
    });

    it('should include story structure elements', () => {
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('Choice-Ready');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('Consequence-Aware');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('Progressive');
    });

    it('should include markdown formatting examples', () => {
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('**Bold**');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('*Italic*');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('character names');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('dialogue');
    });

    it('should be a non-empty string', () => {
      expect(DEFAULT_STORY_GENERATION_PROMPT).toBeTruthy();
      expect(typeof DEFAULT_STORY_GENERATION_PROMPT).toBe('string');
      expect(DEFAULT_STORY_GENERATION_PROMPT.length).toBeGreaterThan(0);
    });
  });

  describe('CHOICE_GENERATION_PROMPT', () => {
    it('should include choice requirements', () => {
      expect(CHOICE_GENERATION_PROMPT).toContain('Alignment Tested');
      expect(CHOICE_GENERATION_PROMPT).toContain('Consequence Clear');
      expect(CHOICE_GENERATION_PROMPT).toContain('Character Growth');
    });

    it('should include choice types', () => {
      expect(CHOICE_GENERATION_PROMPT).toContain('Heroic Choice');
      expect(CHOICE_GENERATION_PROMPT).toContain('Pragmatic Choice');
      expect(CHOICE_GENERATION_PROMPT).toContain('Selfish Choice');
      expect(CHOICE_GENERATION_PROMPT).toContain('Cautious Choice');
    });

    it('should be a non-empty string', () => {
      expect(CHOICE_GENERATION_PROMPT).toBeTruthy();
      expect(typeof CHOICE_GENERATION_PROMPT).toBe('string');
      expect(CHOICE_GENERATION_PROMPT.length).toBeGreaterThan(0);
    });
  });

  describe('DM_REFLECTION_PROMPT', () => {
    it('should include reflection areas', () => {
      expect(DM_REFLECTION_PROMPT).toContain('Choice Analysis');
      expect(DM_REFLECTION_PROMPT).toContain('Alignment Impact');
      expect(DM_REFLECTION_PROMPT).toContain('Story Direction');
      expect(DM_REFLECTION_PROMPT).toContain('Difficulty Adjustment');
    });

    it('should include adaptation considerations', () => {
      expect(DM_REFLECTION_PROMPT).toContain('Mood Adjustment');
      expect(DM_REFLECTION_PROMPT).toContain('Challenge Level');
      expect(DM_REFLECTION_PROMPT).toContain('Theme Focus');
      expect(DM_REFLECTION_PROMPT).toContain('NPC Reactions');
    });

    it('should be a non-empty string', () => {
      expect(DM_REFLECTION_PROMPT).toBeTruthy();
      expect(typeof DM_REFLECTION_PROMPT).toBe('string');
      expect(DM_REFLECTION_PROMPT.length).toBeGreaterThan(0);
    });
  });

  describe('DYNAMIC_STORY_TEMPLATE', () => {
    it('should include character context placeholders', () => {
      expect(DYNAMIC_STORY_TEMPLATE).toContain('{characterName}');
      expect(DYNAMIC_STORY_TEMPLATE).toContain('{alignmentLevel}');
      expect(DYNAMIC_STORY_TEMPLATE).toContain('{alignmentScore}');
      expect(DYNAMIC_STORY_TEMPLATE).toContain('{reputation}');
      expect(DYNAMIC_STORY_TEMPLATE).toContain('{currentTurn}');
      expect(DYNAMIC_STORY_TEMPLATE).toContain('{difficulty}');
    });

    it('should include story requirements placeholders', () => {
      expect(DYNAMIC_STORY_TEMPLATE).toContain('{recentChoices}');
      expect(DYNAMIC_STORY_TEMPLATE).toContain('{traits}');
      expect(DYNAMIC_STORY_TEMPLATE).toContain('{dmStyle}');
      expect(DYNAMIC_STORY_TEMPLATE).toContain('{dmMood}');
    });

    it('should be a non-empty string', () => {
      expect(DYNAMIC_STORY_TEMPLATE).toBeTruthy();
      expect(typeof DYNAMIC_STORY_TEMPLATE).toBe('string');
      expect(DYNAMIC_STORY_TEMPLATE.length).toBeGreaterThan(0);
    });
  });

  describe('DYNAMIC_CHOICE_TEMPLATE', () => {
    it('should include character state placeholders', () => {
      expect(DYNAMIC_CHOICE_TEMPLATE).toContain('{alignmentLevel}');
      expect(DYNAMIC_CHOICE_TEMPLATE).toContain('{alignmentScore}');
      expect(DYNAMIC_CHOICE_TEMPLATE).toContain('{reputation}');
      expect(DYNAMIC_CHOICE_TEMPLATE).toContain('{recentChoices}');
      expect(DYNAMIC_CHOICE_TEMPLATE).toContain('{difficulty}');
    });

    it('should include story context placeholders', () => {
      expect(DYNAMIC_CHOICE_TEMPLATE).toContain('{storyText}');
      expect(DYNAMIC_CHOICE_TEMPLATE).toContain('{currentTurn}');
      expect(DYNAMIC_CHOICE_TEMPLATE).toContain('{dmStyle}');
    });

    it('should be a non-empty string', () => {
      expect(DYNAMIC_CHOICE_TEMPLATE).toBeTruthy();
      expect(typeof DYNAMIC_CHOICE_TEMPLATE).toBe('string');
      expect(DYNAMIC_CHOICE_TEMPLATE.length).toBeGreaterThan(0);
    });
  });
}); 