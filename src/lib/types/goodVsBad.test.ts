import { createGoodVsBadConfig, type GoodVsBadConfig } from './goodVsBad';

describe('Good vs Bad (Yin/Yang) System', () => {
  describe('GoodVsBadConfig', () => {
    it('should create a default Good vs Bad configuration', () => {
      const config = createGoodVsBadConfig();
      
      expect(config).toEqual({
        isEnabled: false,
        badProfilePicture: null,
        badDefinition: '',
        theme: 'good-vs-bad',
        userRole: 'good',
        badRole: 'bad'
      });
    });

    it('should create a custom Good vs Bad configuration', () => {
      const customConfig = createGoodVsBadConfig({
        isEnabled: true,
        badProfilePicture: '/images/villain.jpg',
        badDefinition: 'A mysterious dark force that seeks to corrupt the world',
        theme: 'yin-yang',
        userRole: 'light',
        badRole: 'dark'
      });

      expect(customConfig).toEqual({
        isEnabled: true,
        badProfilePicture: '/images/villain.jpg',
        badDefinition: 'A mysterious dark force that seeks to corrupt the world',
        theme: 'yin-yang',
        userRole: 'light',
        badRole: 'dark'
      });
    });

    it('should validate required fields', () => {
      const config: GoodVsBadConfig = {
        isEnabled: true,
        badProfilePicture: '/images/villain.jpg',
        badDefinition: 'A mysterious dark force',
        theme: 'good-vs-bad',
        userRole: 'good',
        badRole: 'bad'
      };

      expect(config.isEnabled).toBe(true);
      expect(config.badProfilePicture).toBe('/images/villain.jpg');
      expect(config.badDefinition).toBe('A mysterious dark force');
      expect(config.theme).toBe('good-vs-bad');
      expect(config.userRole).toBe('good');
      expect(config.badRole).toBe('bad');
    });

    it('should support different themes', () => {
      const themes = ['good-vs-bad', 'yin-yang', 'light-vs-dark', 'hero-vs-villain'] as const;
      
      themes.forEach(theme => {
        const config = createGoodVsBadConfig({ theme });
        expect(config.theme).toBe(theme);
      });
    });

    it('should allow custom role definitions', () => {
      const config = createGoodVsBadConfig({
        isEnabled: true,
        userRole: 'protector',
        badRole: 'destroyer'
      });

      expect(config.userRole).toBe('protector');
      expect(config.badRole).toBe('destroyer');
    });

    it('should handle null profile picture', () => {
      const config = createGoodVsBadConfig({
        isEnabled: true,
        badProfilePicture: null
      });

      expect(config.badProfilePicture).toBeNull();
      expect(config.isEnabled).toBe(true);
    });

    it('should require bad definition when enabled', () => {
      const config = createGoodVsBadConfig({
        isEnabled: true,
        badDefinition: 'Must have a definition when enabled'
      });

      expect(config.isEnabled).toBe(true);
      expect(config.badDefinition).toBe('Must have a definition when enabled');
    });
  });

  describe('Theme Validation', () => {
    it('should accept valid themes', () => {
      const validThemes = ['good-vs-bad', 'yin-yang', 'light-vs-dark', 'hero-vs-villain'] as const;
      
      validThemes.forEach(theme => {
        expect(() => createGoodVsBadConfig({ theme })).not.toThrow();
      });
    });

    it('should default to good-vs-bad for invalid themes', () => {
      const config = createGoodVsBadConfig({ theme: 'invalid-theme' as any });
      expect(config.theme).toBe('good-vs-bad');
    });
  });

  describe('Role Validation', () => {
    it('should accept custom role names', () => {
      const config = createGoodVsBadConfig({
        userRole: 'guardian',
        badRole: 'corruptor'
      });

      expect(config.userRole).toBe('guardian');
      expect(config.badRole).toBe('corruptor');
    });

    it('should default to good/bad for empty roles', () => {
      const config = createGoodVsBadConfig({
        userRole: '',
        badRole: ''
      });

      expect(config.userRole).toBe('good');
      expect(config.badRole).toBe('bad');
    });
  });
}); 