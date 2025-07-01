import { renderHook, act } from '@testing-library/react';
import { useDMStore } from './dmStore';
import type { PersonalityType } from '@/lib/types/dungeonMaster';

describe('DM Store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useDMStore());
    act(() => {
      result.current.resetDM();
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDMStore());
    
    expect(result.current.selectedPersonality).toBeNull();
    expect(result.current.freeformAnswers).toEqual({});
    expect(result.current.isDMSelected).toBe(false);
  });

  it('should set selected personality', () => {
    const { result } = renderHook(() => useDMStore());
    const personality: PersonalityType = {
      name: 'Test DM',
      style: 'descriptive',
      description: 'A test dungeon master',
    };
    
    act(() => {
      result.current.setSelectedPersonality(personality);
    });
    
    expect(result.current.selectedPersonality).toEqual(personality);
    expect(result.current.isDMSelected).toBe(true);
  });

  it('should set freeform answers', () => {
    const { result } = renderHook(() => useDMStore());
    const answers = {
      theme: 'fantasy',
      setting: 'medieval',
    };
    
    act(() => {
      result.current.setFreeformAnswers(answers);
    });
    
    expect(result.current.freeformAnswers).toEqual(answers);
  });

  it('should update freeform answers', () => {
    const { result } = renderHook(() => useDMStore());
    
    act(() => {
      result.current.setFreeformAnswers({ theme: 'fantasy' });
    });
    
    act(() => {
      result.current.setFreeformAnswers({ setting: 'medieval' });
    });
    
    expect(result.current.freeformAnswers).toEqual({ setting: 'medieval' });
  });

  it('should reset DM state', () => {
    const { result } = renderHook(() => useDMStore());
    const personality: PersonalityType = {
      name: 'Test DM',
      style: 'descriptive',
      description: 'A test dungeon master',
    };
    
    act(() => {
      result.current.setSelectedPersonality(personality);
      result.current.setFreeformAnswers({ theme: 'fantasy' });
    });
    
    act(() => {
      result.current.resetDM();
    });
    
    expect(result.current.selectedPersonality).toBeNull();
    expect(result.current.freeformAnswers).toEqual({});
    expect(result.current.isDMSelected).toBe(false);
  });
}); 