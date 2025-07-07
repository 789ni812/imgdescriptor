import { createGoodVsBadConfig, createDarthVaderConfig, updateVillainState, type GoodVsBadConfig } from './goodVsBad';

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
        badRole: 'bad',
        villainPersonality: expect.objectContaining({
          motivations: expect.any(Array),
          fears: expect.any(Array),
          strengths: expect.any(Array),
          weaknesses: expect.any(Array),
          backstory: expect.any(String),
          goals: expect.any(Array),
          speechStyle: expect.any(String),
          dialoguePatterns: expect.any(Array),
          relationshipWithPlayer: expect.any(String),
          influenceLevel: expect.any(Number),
          resources: expect.any(Array),
          territory: expect.any(Array)
        }),
        villainState: expect.objectContaining({
          health: expect.any(Number),
          resources: expect.any(Number),
          influence: expect.any(Number),
          anger: expect.any(Number),
          respect: expect.any(Number),
          memory: expect.any(Array),
          currentGoal: expect.any(String),
          lastAction: expect.any(String),
          territoryControl: expect.any(Array)
        }),
        conflictMechanics: expect.objectContaining({
          escalationLevel: expect.any(Number),
          confrontationType: expect.any(String),
          villainReactionStyle: expect.any(String),
          playerAdvantage: expect.any(Number),
          villainAdvantage: expect.any(Number),
          conflictHistory: expect.any(Array)
        }),
        enableVillainDialogue: false,
        enableConflictEscalation: false,
        enableVillainMemory: false,
        enableTerritoryControl: false
      });
    });

    it('should create a custom Good vs Bad configuration', () => {
      const customConfig = createGoodVsBadConfig({
        isEnabled: true,
        badProfilePicture: '/images/villain.jpg',
        badDefinition: 'A mysterious dark force that seeks to corrupt the world',
        theme: 'yin-yang',
        userRole: 'light',
        badRole: 'dark',
        enableVillainDialogue: true,
        enableConflictEscalation: true
      });

      expect(customConfig.isEnabled).toBe(true);
      expect(customConfig.badProfilePicture).toBe('/images/villain.jpg');
      expect(customConfig.badDefinition).toBe('A mysterious dark force that seeks to corrupt the world');
      expect(customConfig.theme).toBe('yin-yang');
      expect(customConfig.userRole).toBe('light');
      expect(customConfig.badRole).toBe('dark');
      expect(customConfig.enableVillainDialogue).toBe(true);
      expect(customConfig.enableConflictEscalation).toBe(true);
      expect(customConfig.enableVillainMemory).toBe(false);
      expect(customConfig.enableTerritoryControl).toBe(false);
    });

    it('should validate required fields', () => {
      const config: GoodVsBadConfig = {
        isEnabled: true,
        badProfilePicture: '/images/villain.jpg',
        badDefinition: 'A mysterious dark force',
        theme: 'good-vs-bad',
        userRole: 'good',
        badRole: 'bad',
        villainPersonality: expect.any(Object),
        villainState: expect.any(Object),
        conflictMechanics: expect.any(Object),
        enableVillainDialogue: false,
        enableConflictEscalation: false,
        enableVillainMemory: false,
        enableTerritoryControl: false
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

  describe('Darth Vader Configuration', () => {
    it('should create a Darth Vader specific configuration', () => {
      const config = createDarthVaderConfig();
      
      expect(config.isEnabled).toBe(true);
      expect(config.theme).toBe('hero-vs-villain');
      expect(config.userRole).toBe('Jedi Knight');
      expect(config.badRole).toBe('Dark Lord of the Sith');
      expect(config.badDefinition).toContain('Darth Vader');
      expect(config.badDefinition).toContain('Dark Lord of the Sith');
      expect(config.enableVillainDialogue).toBe(true);
      expect(config.enableConflictEscalation).toBe(true);
      expect(config.enableVillainMemory).toBe(true);
      expect(config.enableTerritoryControl).toBe(true);
      
      // Check villain personality
      expect(config.villainPersonality?.motivations).toContain('Maintain control and order in the galaxy');
      expect(config.villainPersonality?.fears).toContain('Losing control of his destiny');
      expect(config.villainPersonality?.strengths).toContain('Master of the Dark Side of the Force');
      expect(config.villainPersonality?.backstory).toContain('Anakin Skywalker');
      expect(config.villainPersonality?.speechStyle).toContain('Deep, mechanical voice');
      expect(config.villainPersonality?.relationshipWithPlayer).toBe('enemy');
      expect(config.villainPersonality?.influenceLevel).toBe(9);
      
      // Check villain state
      expect(config.villainState?.health).toBe(85);
      expect(config.villainState?.resources).toBe(90);
      expect(config.villainState?.influence).toBe(95);
      expect(config.villainState?.currentGoal).toContain('Imperial control');
      
      // Check conflict mechanics
      expect(config.conflictMechanics?.escalationLevel).toBe(5);
      expect(config.conflictMechanics?.confrontationType).toBe('mixed');
      expect(config.conflictMechanics?.villainReactionStyle).toBe('calculating');
    });
  });

  describe('Villain State Updates', () => {
    it('should update villain state based on aggressive player action', () => {
      const initialState = {
        health: 85,
        resources: 90,
        influence: 95,
        anger: 30,
        respect: 20,
        memory: [],
        currentGoal: 'Test goal',
        lastAction: 'Initial action',
        territoryControl: ['Test territory']
      };
      
      const newState = updateVillainState(initialState, 'Player attacked', 'aggressive');
      
      expect(newState.anger).toBe(45); // 30 + 15
      expect(newState.respect).toBe(15); // 20 - 5
      expect(newState.memory).toContain('aggressive: Player attacked');
      expect(newState.lastAction).toBe("Reacted to player's aggressive action");
    });

    it('should update villain state based on diplomatic player action', () => {
      const initialState = {
        health: 85,
        resources: 90,
        influence: 95,
        anger: 50,
        respect: 20,
        memory: [],
        currentGoal: 'Test goal',
        lastAction: 'Initial action',
        territoryControl: ['Test territory']
      };
      
      const newState = updateVillainState(initialState, 'Player negotiated', 'diplomatic');
      
      expect(newState.anger).toBe(40); // 50 - 10
      expect(newState.respect).toBe(30); // 20 + 10
      expect(newState.memory).toContain('diplomatic: Player negotiated');
    });

    it('should limit state values to valid ranges', () => {
      const initialState = {
        health: 85,
        resources: 90,
        influence: 95,
        anger: 95,
        respect: 95,
        memory: [],
        currentGoal: 'Test goal',
        lastAction: 'Initial action',
        territoryControl: ['Test territory']
      };
      
      const newState = updateVillainState(initialState, 'Player action', 'aggressive');
      
      expect(newState.anger).toBe(100); // Capped at 100
      expect(newState.respect).toBe(90); // 95 - 5
    });

    it('should keep memory limited to last 10 entries', () => {
      const initialState = {
        health: 85,
        resources: 90,
        influence: 95,
        anger: 30,
        respect: 20,
        memory: ['old1', 'old2', 'old3', 'old4', 'old5', 'old6', 'old7', 'old8', 'old9', 'old10'],
        currentGoal: 'Test goal',
        lastAction: 'Initial action',
        territoryControl: ['Test territory']
      };
      
      const newState = updateVillainState(initialState, 'New action', 'confrontation');
      
      expect(newState.memory).toHaveLength(10);
      expect(newState.memory[0]).toBe('old2'); // First old entry removed
      expect(newState.memory[9]).toBe('confrontation: New action'); // New entry added
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

  describe('Advanced Features', () => {
    it('should support enabling advanced features', () => {
      const config = createGoodVsBadConfig({
        isEnabled: true,
        enableVillainDialogue: true,
        enableConflictEscalation: true,
        enableVillainMemory: true,
        enableTerritoryControl: true
      });

      expect(config.enableVillainDialogue).toBe(true);
      expect(config.enableConflictEscalation).toBe(true);
      expect(config.enableVillainMemory).toBe(true);
      expect(config.enableTerritoryControl).toBe(true);
    });

    it('should default advanced features to false', () => {
      const config = createGoodVsBadConfig({
        isEnabled: true
      });

      expect(config.enableVillainDialogue).toBe(false);
      expect(config.enableConflictEscalation).toBe(false);
      expect(config.enableVillainMemory).toBe(false);
      expect(config.enableTerritoryControl).toBe(false);
    });
  });
}); 