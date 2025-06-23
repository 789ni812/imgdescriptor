import { characterStore } from './characterStore';

describe('characterStore', () => {
  it('should initialize with default character values', () => {
    const state = characterStore.getState();
    expect(state.character.health).toBe(100);
    expect(state.character.heartrate).toBe(70);
    expect(state.character.age).toBe(18);
    expect(state.character.persona).toBe('Adventurer');
    expect(state.character.traits).toEqual([]);
    expect(state.character.experience).toBe(0);
    expect(state.character.level).toBe(1);
    expect(state.character.inventory).toEqual([]);
    expect(state.character.storyHistory).toEqual([]);
    expect(state.character.currentTurn).toBe(1);
  });
}); 