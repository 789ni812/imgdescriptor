import { getCreatureType, generateStatsFromScoreSheet, initialScoreSheet } from './creatureScoreSheet';

describe('Creature Score Sheet System', () => {
  describe('getCreatureType', () => {
    it('should identify rodents correctly', () => {
      const mouseType = getCreatureType('A small brown mouse', 'mouse');
      expect(mouseType?.name).toBe('rodent');
      expect(mouseType?.size).toBe('tiny');
    });

    it('should identify kaiju correctly', () => {
      const godzillaType = getCreatureType('A massive godzilla monster', 'godzilla');
      expect(godzillaType?.name).toBe('kaiju');
      expect(godzillaType?.size).toBe('huge');
    });

    it('should identify humans correctly', () => {
      const humanType = getCreatureType('A human fighter', 'human');
      expect(humanType?.name).toBe('human');
      expect(humanType?.size).toBe('medium');
    });

    it('should identify large animals correctly', () => {
      const bearType = getCreatureType('A large brown bear', 'bear');
      expect(bearType?.name).toBe('large_animal');
      expect(bearType?.size).toBe('large');
    });

    it('should return null for unrecognized creatures', () => {
      const unknownType = getCreatureType('A mysterious creature', 'unknown');
      expect(unknownType).toBeNull();
    });

    it('should work with just description', () => {
      const mouseType = getCreatureType('A mouse with sharp teeth');
      expect(mouseType?.name).toBe('rodent');
    });

    it('should work with just label', () => {
      const godzillaType = getCreatureType('', 'godzilla');
      expect(godzillaType?.name).toBe('kaiju');
    });
  });

  describe('generateStatsFromScoreSheet', () => {
    it('should generate stats within boundaries for rodents', () => {
      const rodentType = getCreatureType('mouse');
      expect(rodentType).not.toBeNull();
      
      if (rodentType) {
        const stats = generateStatsFromScoreSheet(rodentType);
        
        expect(stats.strength).toBeGreaterThanOrEqual(1);
        expect(stats.strength).toBeLessThanOrEqual(5);
        
        expect(stats.agility).toBeGreaterThanOrEqual(60);
        expect(stats.agility).toBeLessThanOrEqual(90);
        
        expect(stats.health).toBeGreaterThanOrEqual(20);
        expect(stats.health).toBeLessThanOrEqual(50);
        
        expect(stats.defense).toBeGreaterThanOrEqual(5);
        expect(stats.defense).toBeLessThanOrEqual(15);
        
        expect(stats.luck).toBeGreaterThanOrEqual(25);
        expect(stats.luck).toBeLessThanOrEqual(40);
      }
    });

    it('should generate stats within boundaries for kaiju', () => {
      const kaijuType = getCreatureType('godzilla');
      expect(kaijuType).not.toBeNull();
      
      if (kaijuType) {
        const stats = generateStatsFromScoreSheet(kaijuType);
        
        expect(stats.strength).toBeGreaterThanOrEqual(150);
        expect(stats.strength).toBeLessThanOrEqual(200);
        
        expect(stats.agility).toBeGreaterThanOrEqual(5);
        expect(stats.agility).toBeLessThanOrEqual(20);
        
        expect(stats.health).toBeGreaterThanOrEqual(800);
        expect(stats.health).toBeLessThanOrEqual(1000);
        
        expect(stats.defense).toBeGreaterThanOrEqual(70);
        expect(stats.defense).toBeLessThanOrEqual(100);
        
        expect(stats.luck).toBeGreaterThanOrEqual(5);
        expect(stats.luck).toBeLessThanOrEqual(15);
      }
    });

    it('should generate different stats on multiple calls', () => {
      const rodentType = getCreatureType('mouse');
      expect(rodentType).not.toBeNull();
      
      if (rodentType) {
        const stats1 = generateStatsFromScoreSheet(rodentType);
        const stats2 = generateStatsFromScoreSheet(rodentType);
        
        // Check that at least one stat is different (more reliable than checking sum)
        const hasDifferentStats = 
          stats1.strength !== stats2.strength ||
          stats1.agility !== stats2.agility ||
          stats1.health !== stats2.health ||
          stats1.defense !== stats2.defense ||
          stats1.luck !== stats2.luck;
        
        // Note: This test might occasionally fail due to randomness, but it's very unlikely
        // that two random generations would produce identical stats across all fields
        expect(hasDifferentStats).toBe(true);
      }
    });
  });

  describe('initialScoreSheet', () => {
    it('should have valid structure', () => {
      expect(initialScoreSheet.version).toBeDefined();
      expect(initialScoreSheet.lastUpdated).toBeDefined();
      expect(Array.isArray(initialScoreSheet.creatureTypes)).toBe(true);
      expect(initialScoreSheet.creatureTypes.length).toBeGreaterThan(0);
    });

    it('should have valid creature types', () => {
      initialScoreSheet.creatureTypes.forEach(creatureType => {
        expect(creatureType.name).toBeDefined();
        expect(creatureType.size).toBeDefined();
        expect(creatureType.examples).toBeDefined();
        expect(Array.isArray(creatureType.examples)).toBe(true);
        expect(creatureType.examples.length).toBeGreaterThan(0);
        
        // Check stat boundaries
        expect(creatureType.strength.min).toBeLessThanOrEqual(creatureType.strength.max);
        expect(creatureType.agility.min).toBeLessThanOrEqual(creatureType.agility.max);
        expect(creatureType.health.min).toBeLessThanOrEqual(creatureType.health.max);
        expect(creatureType.defense.min).toBeLessThanOrEqual(creatureType.defense.max);
        expect(creatureType.luck.min).toBeLessThanOrEqual(creatureType.luck.max);
        
        // Check that stats are within reasonable bounds
        expect(creatureType.strength.min).toBeGreaterThanOrEqual(1);
        expect(creatureType.strength.max).toBeLessThanOrEqual(200);
        expect(creatureType.agility.min).toBeGreaterThanOrEqual(1);
        expect(creatureType.agility.max).toBeLessThanOrEqual(100);
        expect(creatureType.health.min).toBeGreaterThanOrEqual(5);
        expect(creatureType.health.max).toBeLessThanOrEqual(1000);
      });
    });

    it('should have realistic stat distributions', () => {
      // Check that kaiju have high strength and low agility
      const kaiju = initialScoreSheet.creatureTypes.find(ct => ct.name === 'kaiju');
      expect(kaiju).toBeDefined();
      if (kaiju) {
        expect(kaiju.strength.min).toBeGreaterThan(30); // Very strong
        expect(kaiju.agility.max).toBeLessThanOrEqual(20); // Very slow
      }

      // Check that rodents have low strength and high agility
      const rodent = initialScoreSheet.creatureTypes.find(ct => ct.name === 'rodent');
      expect(rodent).toBeDefined();
      if (rodent) {
        expect(rodent.strength.max).toBeLessThanOrEqual(5); // Very weak
        expect(rodent.agility.min).toBeGreaterThan(15); // Very fast
      }
    });
  });
}); 