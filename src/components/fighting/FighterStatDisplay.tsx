import React from 'react';

interface FighterStats {
  health: number;
  maxHealth: number;
  strength: number;
  agility: number;
  defense: number;
  luck: number;
  magic?: number;
  ranged?: number;
  intelligence?: number;
  age: number;
  size: 'small' | 'medium' | 'large';
  build: 'thin' | 'average' | 'muscular' | 'heavy';
}

interface Fighter {
  id: string;
  name: string;
  imageUrl: string;
  stats: FighterStats;
  uniqueAbilities?: string[];
  description?: string;
}

interface FighterStatDisplayProps {
  fighter: Fighter;
  showAbilities?: boolean;
  showTooltips?: boolean;
  size?: 'compact' | 'detailed' | 'full';
  comparisonMode?: boolean;
}

const FighterStatDisplay: React.FC<FighterStatDisplayProps> = ({
  fighter,
  showAbilities = true,
  showTooltips = false,
  size = 'full',
  comparisonMode = false,
}) => {
  const getStatColor = (stat: string, value: number): string => {
    const maxValues: Record<string, number> = {
      health: 2000,
      strength: 200,
      agility: 100,
      defense: 100,
      luck: 50,
      magic: 100,
      ranged: 100,
      intelligence: 100,
    };

    const maxValue = maxValues[stat] || 100;
    const percentage = (value / maxValue) * 100;

    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatTooltip = (stat: string): string => {
    const tooltips: Record<string, string> = {
      health: 'Total health points. 0 = defeated, 2000 = legendary monster level',
      strength: 'Physical power. 1 = ant, 30-40 = Bruce Lee, 200 = Godzilla',
      agility: 'Speed and reflexes. 1 = sloth, 50-70 = Bruce Lee, 100 = speedster',
      defense: 'Damage resistance. 1 = paper, 20-40 = human, 100 = indestructible',
      luck: 'Chance for lucky hits/escapes. 1 = unlucky, 10-20 = average, 50 = extremely lucky',
      magic: 'Supernatural abilities. 1 = mundane, 50-80 = Jedi, 100 = cosmic power',
      ranged: 'Ranged attack capability. 1 = melee only, 30-50 = blaster, 100 = death star',
      intelligence: 'Strategic thinking. 1 = simple, 30-50 = human, 100 = super genius',
    };
    return tooltips[stat] || '';
  };

  const renderStat = (label: string, value: number, statKey: string) => (
    <div 
      key={statKey}
      className="flex justify-between items-center py-1"
      title={showTooltips ? getStatTooltip(statKey) : undefined}
    >
      <span className="text-gray-300 text-sm">{label}:</span>
      <span className={`font-semibold ${getStatColor(statKey, value)}`}>
        {value}
      </span>
    </div>
  );

  const renderProgressBar = (label: string, value: number, statKey: string) => {
    const maxValues: Record<string, number> = {
      health: 2000,
      strength: 200,
      agility: 100,
      defense: 100,
      luck: 50,
      magic: 100,
      ranged: 100,
      intelligence: 100,
    };

    const maxValue = maxValues[statKey] || 100;
    const percentage = Math.min((value / maxValue) * 100, 100);

    return (
      <div key={statKey} className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-300 text-sm">{label}</span>
          <span className={`text-xs font-semibold ${getStatColor(statKey, value)}`}>
            {value}/{maxValue}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              percentage >= 80 ? 'bg-green-500' :
              percentage >= 60 ? 'bg-yellow-500' :
              percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const renderBasicStats = () => (
    <div className="space-y-1">
      {renderStat('Health', fighter.stats.health, 'health')}
      {renderStat('Strength', fighter.stats.strength, 'strength')}
      {renderStat('Agility', fighter.stats.agility, 'agility')}
      {renderStat('Defense', fighter.stats.defense, 'defense')}
      {renderStat('Luck', fighter.stats.luck, 'luck')}
    </div>
  );

  const renderOptionalStats = () => (
    <div className="space-y-1">
      {fighter.stats.magic !== undefined && renderStat('Magic', fighter.stats.magic, 'magic')}
      {fighter.stats.ranged !== undefined && renderStat('Ranged', fighter.stats.ranged, 'ranged')}
      {fighter.stats.intelligence !== undefined && renderStat('Intelligence', fighter.stats.intelligence, 'intelligence')}
    </div>
  );

  const renderDetailedStats = () => (
    <div className="space-y-3">
      {renderProgressBar('Health', fighter.stats.health, 'health')}
      {renderProgressBar('Strength', fighter.stats.strength, 'strength')}
      {renderProgressBar('Agility', fighter.stats.agility, 'agility')}
      {renderProgressBar('Defense', fighter.stats.defense, 'defense')}
      {renderProgressBar('Luck', fighter.stats.luck, 'luck')}
      {fighter.stats.magic !== undefined && renderProgressBar('Magic', fighter.stats.magic, 'magic')}
      {fighter.stats.ranged !== undefined && renderProgressBar('Ranged', fighter.stats.ranged, 'ranged')}
      {fighter.stats.intelligence !== undefined && renderProgressBar('Intelligence', fighter.stats.intelligence, 'intelligence')}
    </div>
  );

  const renderUniqueAbilities = () => {
    if (!showAbilities || !fighter.uniqueAbilities || fighter.uniqueAbilities.length === 0) {
      return null;
    }

    return (
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-white mb-2">Unique Abilities</h4>
        <div className="flex flex-wrap gap-2">
          {fighter.uniqueAbilities.map((ability, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full font-medium"
              title={showTooltips ? `Special ability: ${ability}` : undefined}
            >
              {ability}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderFighterInfo = () => (
    <div className="flex items-center mb-4">
      {fighter.imageUrl ? (
        <img
          src={fighter.imageUrl}
          alt={fighter.name}
          className="w-16 h-16 object-cover rounded-lg mr-3"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-600 rounded-lg mr-3 flex items-center justify-center text-gray-400 text-xs">
          No Image
        </div>
      )}
      <div>
        <h3 className="text-xl font-bold text-white">{fighter.name}</h3>
        {fighter.description && (
          <p className="text-sm text-gray-300">{fighter.description}</p>
        )}
        <div className="text-xs text-gray-400 mt-1">
          {fighter.stats.size} • {fighter.stats.build} • Age: {fighter.stats.age}
        </div>
      </div>
    </div>
  );

  const renderCompactView = () => (
    <div className="flex items-center space-x-4">
      {fighter.imageUrl ? (
        <img
          src={fighter.imageUrl}
          alt={fighter.name}
          className="w-12 h-12 object-cover rounded"
        />
      ) : (
        <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center text-gray-400 text-xs">
          No Image
        </div>
      )}
      <div>
        <h4 className="font-semibold text-white">{fighter.name}</h4>
        <div className="text-xs text-gray-300">
          HP: {fighter.stats.health} | STR: {fighter.stats.strength} | AGI: {fighter.stats.agility}
        </div>
      </div>
    </div>
  );

  if (size === 'compact') {
    return (
      <div data-testid="fighter-stat-display" className="bg-gray-800 rounded-lg p-3">
        {renderCompactView()}
      </div>
    );
  }

  return (
    <div 
      data-testid="fighter-stat-display" 
      className={`bg-gray-800 rounded-lg p-4 border border-gray-600 ${comparisonMode ? 'w-full' : ''}`}
    >
      {renderFighterInfo()}
      
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">Basic Stats</h4>
          {renderBasicStats()}
        </div>

        {(fighter.stats.magic !== undefined || fighter.stats.ranged !== undefined || fighter.stats.intelligence !== undefined) && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Special Stats</h4>
            {renderOptionalStats()}
          </div>
        )}

        {size === 'detailed' && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Detailed Stats</h4>
            {renderDetailedStats()}
          </div>
        )}
      </div>

      {renderUniqueAbilities()}
    </div>
  );
};

export default FighterStatDisplay; 