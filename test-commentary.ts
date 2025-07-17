import { generateBattleCommentary } from './src/lib/lmstudio-client';

async function testCommentary() {
  console.log('=== BATTLE COMMENTARY TEST ===\n');
  
  const fighterA = {
    name: "Godzilla",
    stats: {
      strength: 180,
      agility: 40,
      size: "large" as const,
      build: "muscular" as const,
      uniqueAbilities: ["Atomic Breath", "Tail Whip", "Ground Slam"]
    }
  };
  
  const fighterB = {
    name: "Bruce Lee",
    stats: {
      strength: 80,
      agility: 95,
      size: "medium" as const,
      build: "thin" as const,
      uniqueAbilities: ["Lightning Fists", "Dragon Kick", "Flow State"]
    }
  };

  console.log('Testing commentary for: Godzilla vs Bruce Lee\n');
  
  // Test multiple rounds to see vocabulary diversity
  for (let round = 1; round <= 5; round++) {
    console.log(`--- ROUND ${round} ---`);
    
    // Attack commentary
    try {
      const attackCommentary = await generateBattleCommentary(
        fighterA, 
        fighterB, 
        round, 
        true, 
        25,
        round > 1 ? `Round ${round-1} was intense` : undefined,
        "Championship Tournament Finals"
      );
      console.log(`Attack: ${attackCommentary}`);
    } catch (error) {
      console.log(`Attack: Error - ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Defense commentary
    try {
      const defenseCommentary = await generateBattleCommentary(
        fighterA, 
        fighterB, 
        round, 
        false, 
        0,
        round > 1 ? `Round ${round-1} was intense` : undefined,
        "Championship Tournament Finals"
      );
      console.log(`Defense: ${defenseCommentary}`);
    } catch (error) {
      console.log(`Defense: Error - ${error instanceof Error ? error.message : String(error)}`);
    }
    
    console.log('');
  }
}

testCommentary().catch(console.error); 