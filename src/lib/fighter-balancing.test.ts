import { 
  classifyFighter, 
  generateBalancedStats, 
  balanceFighter, 
  balanceAllFighters,
  FIGHTER_TYPES,
  type FighterData 
} from './fighter-balancing';

// Mock Math.random to make tests deterministic
const originalRandom = Math.random;
beforeEach(() => {
  Math.random = jest.fn(() => 0.5); // Always return 0.5 for predictable results
});

afterEach(() => {
  Math.random = originalRandom;
});

describe('Fighter Balancing', () => {
  describe('classifyFighter', () => {
    it('should classify Darth Vader as sith_lord', () => {
      const result = classifyFighter('Darth Vader', {});
      expect(result).toBe('sith_lord');
    });

    it('should classify Jedi as force_user', () => {
      const result = classifyFighter('Jedi Knight', {});
      expect(result).toBe('force_user');
    });

    it('should classify Stephen Siegal as peak_human', () => {
      const result = classifyFighter('Stephen Siegal', {});
      expect(result).toBe('peak_human');
    });

    it('should classify Bruce Lee as peak_human', () => {
      const result = classifyFighter('Bruce Lee', {});
      expect(result).toBe('peak_human');
    });

    it('should classify Godzilla as legendary_monster', () => {
      const result = classifyFighter('Godzilla', {});
      expect(result).toBe('legendary_monster');
    });

    it('should classify regular names as regular_human', () => {
      const result = classifyFighter('John Smith', {});
      expect(result).toBe('regular_human');
    });

    it('should be case insensitive', () => {
      expect(classifyFighter('DARTH VADER', {})).toBe('sith_lord');
      expect(classifyFighter('darth vader', {})).toBe('sith_lord');
      expect(classifyFighter('Darth Vader', {})).toBe('sith_lord');
    });
  });

  describe('generateBalancedStats', () => {
    it('should generate stats within sith_lord ranges', () => {
      const currentStats = { health: 100, strength: 30, agility: 50, defense: 20, luck: 15 };
      const sithLordType = FIGHTER_TYPES.sith_lord;
      
      const result = generateBalancedStats(sithLordType, currentStats);
      
      expect(result.health).toBeGreaterThanOrEqual(150);
      expect(result.health).toBeLessThanOrEqual(200);
      expect(result.strength).toBeGreaterThanOrEqual(50);
      expect(result.strength).toBeLessThanOrEqual(70);
      expect(result.agility).toBeGreaterThanOrEqual(40);
      expect(result.agility).toBeLessThanOrEqual(65);
      expect(result.defense).toBeGreaterThanOrEqual(30);
      expect(result.defense).toBeLessThanOrEqual(45);
      expect(result.luck).toBeGreaterThanOrEqual(25);
      expect(result.luck).toBeLessThanOrEqual(40);
      expect(result.magic).toBeGreaterThanOrEqual(70);
      expect(result.magic).toBeLessThanOrEqual(90);
      expect(result.ranged).toBeGreaterThanOrEqual(50);
      expect(result.ranged).toBeLessThanOrEqual(80);
      expect(result.intelligence).toBeGreaterThanOrEqual(40);
      expect(result.intelligence).toBeLessThanOrEqual(60);
      expect(result.uniqueAbilities).toContain('Force Lightning');
      expect(result.uniqueAbilities).toContain('Lightsaber Mastery');
    });

    it('should generate stats within peak_human ranges', () => {
      const currentStats = { health: 100, strength: 30, agility: 50, defense: 20, luck: 15 };
      const peakHumanType = FIGHTER_TYPES.peak_human;
      
      const result = generateBalancedStats(peakHumanType, currentStats);
      
      expect(result.health).toBeGreaterThanOrEqual(100);
      expect(result.health).toBeLessThanOrEqual(150);
      expect(result.strength).toBeGreaterThanOrEqual(35);
      expect(result.strength).toBeLessThanOrEqual(50);
      expect(result.agility).toBeGreaterThanOrEqual(50);
      expect(result.agility).toBeLessThanOrEqual(70);
      expect(result.defense).toBeGreaterThanOrEqual(20);
      expect(result.defense).toBeLessThanOrEqual(35);
      expect(result.luck).toBeGreaterThanOrEqual(15);
      expect(result.luck).toBeLessThanOrEqual(25);
      expect(result.intelligence).toBeGreaterThanOrEqual(25);
      expect(result.intelligence).toBeLessThanOrEqual(45);
      expect(result.uniqueAbilities).toContain('Martial Arts');
      expect(result.uniqueAbilities).toContain('Combat Training');
    });

    it('should not add optional stats for regular_human', () => {
      const currentStats = { health: 100, strength: 30, agility: 50, defense: 20, luck: 15 };
      const regularHumanType = FIGHTER_TYPES.regular_human;
      
      const result = generateBalancedStats(regularHumanType, currentStats);
      
      expect(result.magic).toBeUndefined();
      expect(result.ranged).toBeUndefined();
      expect(result.uniqueAbilities).toBeUndefined();
    });

    it('should set maxHealth equal to health', () => {
      const currentStats = { health: 100, strength: 30, agility: 50, defense: 20, luck: 15 };
      const sithLordType = FIGHTER_TYPES.sith_lord;
      
      const result = generateBalancedStats(sithLordType, currentStats);
      
      expect(result.maxHealth).toBe(result.health);
    });
  });

  describe('balanceFighter', () => {
    it('should balance Darth Vader as Sith Lord', () => {
      const darthVader: FighterData = {
        id: "darth-vader",
        name: "Darth Vader",
        image: "darth-vader.jpg",
        stats: {
          health: 96,
          maxHealth: 96,
          strength: 36,
          luck: 24,
          agility: 65,
          defense: 19,
          age: 18,
          size: "medium",
          build: "average"
        },
        matchHistory: []
      };

      const result = balanceFighter(darthVader);

      expect(result.name).toBe('Darth Vader');
      expect(result.type).toBe('Sith Lord');
      expect(result.oldStats.health).toBe(96);
      expect(result.newStats.health).toBeGreaterThanOrEqual(150);
      expect(result.newStats.health).toBeLessThanOrEqual(200);
      expect(result.newStats.magic).toBeGreaterThanOrEqual(70);
      expect(result.newStats.uniqueAbilities).toContain('Force Lightning');
      expect(result.balancedFighter.stats.health).toBe(result.newStats.health);
    });

    it('should balance Stephen Siegal as Peak Human', () => {
      const stephen: FighterData = {
        id: "stephen-siegal",
        name: "Victor Martel",
        image: "stephen-siegal.jpg",
        stats: {
          health: 120,
          maxHealth: 120,
          strength: 45,
          luck: 18,
          agility: 60,
          defense: 30,
          age: 35,
          size: "medium",
          build: "muscular"
        },
        matchHistory: []
      };

      const result = balanceFighter(stephen);

      expect(result.name).toBe('Victor Martel');
      expect(result.type).toBe('Peak Human');
      expect(result.oldStats.health).toBe(120);
      expect(result.newStats.health).toBeGreaterThanOrEqual(100);
      expect(result.newStats.health).toBeLessThanOrEqual(150);
      expect(result.newStats.uniqueAbilities).toContain('Martial Arts');
    });
  });

  describe('balanceAllFighters', () => {
    it('should balance multiple fighters', () => {
      const fighters: FighterData[] = [
        {
          id: "darth-vader",
          name: "Darth Vader",
          image: "darth-vader.jpg",
          stats: {
            health: 96,
            maxHealth: 96,
            strength: 36,
            luck: 24,
            agility: 65,
            defense: 19,
            age: 18,
            size: "medium",
            build: "average"
          },
          matchHistory: []
        },
        {
          id: "stephen-siegal",
          name: "Victor Martel",
          image: "stephen-siegal.jpg",
          stats: {
            health: 120,
            maxHealth: 120,
            strength: 45,
            luck: 18,
            agility: 60,
            defense: 30,
            age: 35,
            size: "medium",
            build: "muscular"
          },
          matchHistory: []
        }
      ];

      const result = balanceAllFighters(fighters);

      expect(result.message).toBe('Balanced 2 fighters');
      expect(result.results).toHaveLength(2);
      
      const darthResult = result.results.find(r => r.name === 'Darth Vader');
      const stephenResult = result.results.find(r => r.name === 'Victor Martel');
      
      expect(darthResult?.type).toBe('Sith Lord');
      expect(stephenResult?.type).toBe('Peak Human');
    });

    it('should handle empty array', () => {
      const result = balanceAllFighters([]);
      
      expect(result.message).toBe('Balanced 0 fighters');
      expect(result.results).toHaveLength(0);
    });
  });
}); 