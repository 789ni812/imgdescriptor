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
    <div className="space-y-4 bg-zinc-900 p-4 rounded-lg border border-zinc-700">
      <h3 className="text-lg font-semibold text-gray-100 mb-2">Dungeon Master Config</h3>
      <div className="flex flex-col gap-3">
        <label className="text-gray-200 text-sm">
          DM Name
          <input
            type="text"
            className="w-full mt-1 p-2 rounded bg-zinc-800 text-white border border-zinc-700 placeholder-gray-400"
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
        <label className="text-gray-200 text-sm">
          DM Style
          <input
            type="text"
            className="w-full mt-1 p-2 rounded bg-zinc-800 text-white border border-zinc-700 placeholder-gray-400"
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
        <label className="text-gray-200 text-sm">
          Notes
          <textarea
            className="w-full mt-1 p-2 rounded bg-zinc-800 text-white border border-zinc-700 placeholder-gray-400"
            value={notes}
            placeholder="Any notes or preferences for the DM..."
            rows={2}
            onChange={e => setFreeformAnswers({ ...freeformAnswers, notes: e.target.value })}
          />
        </label>
      </div>
      {/* Good vs Bad (Yin/Yang) System */}
      <div className="mt-6">
        <GoodVsBadConfig config={goodVsBadConfig} onConfigChange={handleGoodVsBadConfigChange} />
      </div>
    </div>
  );
}; 