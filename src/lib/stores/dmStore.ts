import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PersonalityType, DungeonMasterTemplate } from '@/lib/types/dungeonMaster';
import { createDefaultDMTemplate } from '@/lib/types/dungeonMaster';

interface DMState {
  selectedPersonality: PersonalityType | null;
  freeformAnswers: Record<string, string>;
  dmTemplate: DungeonMasterTemplate;
  isDMSelected: boolean;
}

interface DMActions {
  setSelectedPersonality: (personality: PersonalityType) => void;
  setFreeformAnswers: (answers: Record<string, string>) => void;
  setDMTemplate: (template: DungeonMasterTemplate) => void;
  resetDM: () => void;
  getDMContext: () => {
    personality: PersonalityType | null;
    freeformAnswers: Record<string, string>;
    template: DungeonMasterTemplate;
  };
}

type DMStore = DMState & DMActions;

const defaultTemplate = createDefaultDMTemplate('Default DM');

export const useDMStore = create<DMStore>()(
  devtools(
    (set, get) => ({
      // State
      selectedPersonality: null,
      freeformAnswers: {},
      dmTemplate: defaultTemplate,
      isDMSelected: false,

      // Actions
      setSelectedPersonality: (personality: PersonalityType) => {
        set({
          selectedPersonality: personality,
          isDMSelected: true
        });
      },

      setFreeformAnswers: (answers: Record<string, string>) => {
        set({ freeformAnswers: answers });
      },

      setDMTemplate: (template: DungeonMasterTemplate) => {
        set({ dmTemplate: template });
      },

      resetDM: () => {
        set({
          selectedPersonality: null,
          freeformAnswers: {},
          dmTemplate: defaultTemplate,
          isDMSelected: false
        });
      },

      getDMContext: () => {
        const state = get();
        return {
          personality: state.selectedPersonality,
          freeformAnswers: state.freeformAnswers,
          template: state.dmTemplate
        };
      }
    }),
    {
      name: 'dm-store',
    }
  )
); 