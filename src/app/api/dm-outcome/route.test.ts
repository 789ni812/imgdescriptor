import { getDMOutcome } from './dmOutcomeHandler';

describe('getDMOutcome', () => {
  it('returns outcome narration, stat changes, and game over flag for a valid choice', () => {
    const result = getDMOutcome({
      character: {
        persona: 'Adventurer',
        traits: ['brave'],
        stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 10 },
        health: 10,
        heartrate: 70,
        age: 25,
        level: 1,
        experience: 0,
        currentTurn: 1,
        imageHistory: [],
        storyHistory: [],
        choiceHistory: [],
        currentChoices: [],
        inventory: [],
        choicesHistory: [],
        moralAlignment: { level: 'neutral', score: 0, reputation: 'An unknown adventurer', recentChoices: [], alignmentHistory: [] },
      },
      previousStory: 'You stand before the dragon.',
      selectedChoice: { id: 'c1', text: 'Attack the dragon', statRequirements: { intelligence: 8 } },
    });
    expect(result).toHaveProperty('outcomeNarration');
    expect(result).toHaveProperty('statChanges');
    expect(result).toHaveProperty('gameOver');
  });

  it('handles death outcome and sets gameOver to true', () => {
    const result = getDMOutcome({
      character: {
        persona: 'Adventurer',
        traits: ['brave'],
        stats: { intelligence: 10, creativity: 10, perception: 10, wisdom: 0 },
        health: 10,
        heartrate: 70,
        age: 25,
        level: 1,
        experience: 0,
        currentTurn: 2,
        imageHistory: [],
        storyHistory: [],
        choiceHistory: [],
        currentChoices: [],
        inventory: [],
        choicesHistory: [],
        moralAlignment: { level: 'neutral', score: 0, reputation: 'An unknown adventurer', recentChoices: [], alignmentHistory: [] },
      },
      previousStory: 'You fall into a pit.',
      selectedChoice: { id: 'c2', text: 'Leap across', statRequirements: { perception: 12 } },
    });
    expect(result.gameOver).toBe(true);
    expect(result.outcomeNarration).toMatch(/dm narrates/i);
  });
}); 