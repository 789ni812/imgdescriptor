import { 
  DEFAULT_IMAGE_DESCRIPTION_PROMPT, 
  DEFAULT_STORY_GENERATION_PROMPT 
} from './constants';

describe('Constants', () => {
  describe('DEFAULT_IMAGE_DESCRIPTION_PROMPT', () => {
    it('should include markdown formatting instructions', () => {
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('markdown formatting');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**bold**');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('*italic*');
    });

    it('should include structured content sections', () => {
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**Setting**');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**Objects**');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**People**');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**Mood**');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**Colors**');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toContain('**Notable Features**');
    });

    it('should be a non-empty string', () => {
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT).toBeTruthy();
      expect(typeof DEFAULT_IMAGE_DESCRIPTION_PROMPT).toBe('string');
      expect(DEFAULT_IMAGE_DESCRIPTION_PROMPT.length).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_STORY_GENERATION_PROMPT', () => {
    it('should include markdown formatting instructions', () => {
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('markdown formatting');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('**Bold**');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('*Italic*');
    });

    it('should include story structure elements', () => {
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('**Creative**');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('**Entertaining**');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('**Rich in detail**');
    });

    it('should include markdown formatting examples', () => {
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('character names');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('dialogue');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('headings');
      expect(DEFAULT_STORY_GENERATION_PROMPT).toContain('Lists');
    });

    it('should be a non-empty string', () => {
      expect(DEFAULT_STORY_GENERATION_PROMPT).toBeTruthy();
      expect(typeof DEFAULT_STORY_GENERATION_PROMPT).toBe('string');
      expect(DEFAULT_STORY_GENERATION_PROMPT.length).toBeGreaterThan(0);
    });
  });
}); 