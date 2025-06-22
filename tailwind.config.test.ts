import config from './tailwind.config';

describe('Tailwind Config', () => {
  it('should include Inter font in fontFamily.sans', () => {
    expect(config.theme.extend.fontFamily.sans).toContain('Inter');
  });

  it('should include a custom color palette', () => {
    expect(config.theme.extend.colors).toHaveProperty('primary');
    expect(config.theme.extend.colors).toHaveProperty('accent');
  });
}); 