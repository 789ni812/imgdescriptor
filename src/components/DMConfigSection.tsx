import React from 'react';
import { useDMStore } from '@/lib/stores/dmStore';
import GoodVsBadConfig from './GoodVsBadConfig';
import { createGoodVsBadConfig, GoodVsBadConfig as GoodVsBadConfigType } from '@/lib/types/goodVsBad';

export const DMConfigSection: React.FC = () => {
  const {
    selectedPersonality,
    freeformAnswers,
    setSelectedPersonality,
    setFreeformAnswers,
  } = useDMStore();

  // Controlled fields for DM config
  const name = selectedPersonality?.name || '';
  const style = selectedPersonality?.style || '';
  const notes = freeformAnswers.notes || '';

  // Good vs Bad config state (stored as JSON in freeformAnswers for now)
  let goodVsBadConfig: GoodVsBadConfigType = createGoodVsBadConfig();
  if (freeformAnswers.goodVsBadConfig) {
    try {
      goodVsBadConfig = JSON.parse(freeformAnswers.goodVsBadConfig);
    } catch {
      goodVsBadConfig = createGoodVsBadConfig();
    }
  }

  const handleGoodVsBadConfigChange = (config: GoodVsBadConfigType) => {
    setFreeformAnswers({
      ...freeformAnswers,
      goodVsBadConfig: JSON.stringify(config),
    });
  };

  return (
    <section
      role="region"
      aria-label="Dungeon Master Config"
      className="space-y-4 bg-card dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md"
    >
      <h3 className="text-lg font-bold text-primary mb-2">Dungeon Master Config</h3>
      <div className="flex flex-col gap-3">
        <label className="text-card-foreground dark:text-slate-100 text-sm">
          DM Name
          <input
            type="text"
            className="w-full mt-1 p-2 rounded-md bg-white text-slate-800 border border-gray-200 placeholder-gray-400 dark:bg-slate-800 dark:text-slate-100 dark:border-gray-700 dark:placeholder-gray-400"
            value={name}
            placeholder="Enter DM name"
            onChange={e => setSelectedPersonality({
              ...selectedPersonality,
              name: e.target.value,
              style: style,
              description: selectedPersonality?.description || '',
            })}
          />
        </label>
        <label className="text-card-foreground dark:text-slate-100 text-sm">
          DM Style
          <input
            type="text"
            className="w-full mt-1 p-2 rounded-md bg-white text-slate-800 border border-gray-200 placeholder-gray-400 dark:bg-slate-800 dark:text-slate-100 dark:border-gray-700 dark:placeholder-gray-400"
            value={style}
            placeholder="Enter DM style (e.g. neutral, descriptive)"
            onChange={e => setSelectedPersonality({
              ...selectedPersonality,
              name: name,
              style: e.target.value,
              description: selectedPersonality?.description || '',
            })}
          />
        </label>
        <label className="text-card-foreground dark:text-slate-100 text-sm">
          Notes
          <textarea
            className="w-full mt-1 p-2 rounded-md bg-white text-slate-800 border border-gray-200 placeholder-gray-400 dark:bg-slate-800 dark:text-slate-100 dark:border-gray-700 dark:placeholder-gray-400"
            value={notes}
            placeholder="Any notes or preferences for the DM..."
            rows={2}
            onChange={e => setFreeformAnswers({ ...freeformAnswers, notes: e.target.value })}
          />
        </label>
      </div>
      {/* Good vs Bad (Yin/Yang) System */}
      <div className="mt-6">
        <GoodVsBadConfig data-testid="good-vs-bad-config" config={goodVsBadConfig} onConfigChange={handleGoodVsBadConfigChange} />
      </div>
    </section>
  );
}; 