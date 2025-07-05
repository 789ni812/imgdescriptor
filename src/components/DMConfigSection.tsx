import React from 'react';
import { useDMStore } from '@/lib/stores/dmStore';
import GoodVsBadConfig from './GoodVsBadConfig';
import { createGoodVsBadConfig, GoodVsBadConfig as GoodVsBadConfigType } from '@/lib/types/goodVsBad';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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
    <Card
      role="region"
      aria-label="Dungeon Master Config"
      className="space-y-4"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary">Dungeon Master Config</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <label className="text-card-foreground text-sm">
            DM Name
            <input
              type="text"
              className="w-full mt-1 p-2 rounded-md bg-background text-foreground border border-border placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
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
          <label className="text-card-foreground text-sm">
            DM Style
            <input
              type="text"
              className="w-full mt-1 p-2 rounded-md bg-background text-foreground border border-border placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
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
          <label className="text-card-foreground text-sm">
            Notes
            <textarea
              className="w-full mt-1 p-2 rounded-md bg-background text-foreground border border-border placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
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
      </CardContent>
    </Card>
  );
}; 