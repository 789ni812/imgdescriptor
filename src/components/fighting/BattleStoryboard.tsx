import React from 'react';

interface FighterPanel {
  name: string;
  imageUrl: string;
  commentary: string;
}

interface Scene {
  name: string;
  imageUrl: string;
}

interface PreviousRound {
  round: number;
  attacker: {
    name: string;
    imageUrl: string;
    commentary: string;
  };
  defender: {
    name: string;
    imageUrl: string;
    commentary: string;
  };
}

interface BattleStoryboardProps {
  scene: Scene;
  round: number;
  attacker: FighterPanel;
  defender: FighterPanel;
  roundStep: 'attack' | 'defense';
  previousRounds: PreviousRound[];
}

export const BattleStoryboard: React.FC<BattleStoryboardProps> = ({
  scene,
  round,
  attacker,
  defender,
  roundStep,
  previousRounds,
}) => {
  // Debug output for E2E testing
  console.log('BattleStoryboard Debug:', {
    scene: scene?.name,
    round,
    attacker: attacker?.name,
    defender: defender?.name,
    roundStep,
    previousRoundsLength: previousRounds?.length
  });

  return (
    <div className="flex justify-center items-center min-h-[80vh] w-full" data-testid="battle-storyboard">
      <div
        className="w-[90%] max-w-5xl grid grid-rows-[minmax(120px,auto)_minmax(100px,auto)_minmax(120px,auto)] grid-cols-2 gap-y-4 gap-x-4 bg-gray-100 border border-gray-300 rounded-lg shadow-lg p-6"
        style={{ boxSizing: 'border-box' }}
      >
        {/* Top Panel (spans both columns) */}
        <div className="row-start-1 row-end-2 col-span-2 bg-white border border-black rounded-md p-6 flex flex-col items-center justify-center text-gray-900 min-h-[120px] shadow-md">
          <div className="font-bold text-lg mb-2">{scene.name}</div>
          {scene.imageUrl ? (
            <img className="object-cover rounded shadow max-h-28 mb-2" src={scene.imageUrl} alt={scene.name} />
          ) : (
            <div className="w-32 h-28 bg-gray-300 rounded shadow mb-2 flex items-center justify-center text-gray-600 text-xs text-center">
              No Scene Image
            </div>
          )}
          <div className="text-sm font-semibold">Round {round}</div>
        </div>
        {/* Middle Panels */}
        <div className={`row-start-2 row-end-3 col-start-1 col-end-2 bg-white border border-black rounded-md p-6 flex flex-col items-center justify-start text-gray-900 min-h-[100px] transform -skew-x-3 overflow-auto transition-opacity duration-500 shadow-md ${roundStep === 'defense' ? 'opacity-40' : 'opacity-100'}`} data-testid="attacker-box">
          {attacker.imageUrl ? (
            <img src={attacker.imageUrl} alt={attacker.name} className="w-16 h-16 object-cover rounded mb-1" />
          ) : (
            <div className="w-16 h-16 bg-gray-300 rounded mb-1 flex items-center justify-center text-gray-600 text-xs text-center">
              No Image
            </div>
          )}
          <div className="font-bold text-base mb-1">{attacker.name}</div>
          {roundStep === 'attack' && <div className="text-xs text-center break-words w-full text-gray-900" style={{ wordBreak: 'break-word' }}>{attacker.commentary}</div>}
        </div>
        <div className={`row-start-2 row-end-3 col-start-2 col-end-3 bg-white border border-black rounded-md p-6 flex flex-col items-center justify-start text-gray-900 min-h-[100px] transform skew-x-3 overflow-auto transition-opacity duration-500 shadow-md ${roundStep === 'attack' ? 'opacity-40' : 'opacity-100'}`} data-testid="defender-box">
          {defender.imageUrl ? (
            <img src={defender.imageUrl} alt={defender.name} className="w-16 h-16 object-cover rounded mb-1" />
          ) : (
            <div className="w-16 h-16 bg-gray-300 rounded mb-1 flex items-center justify-center text-gray-600 text-xs text-center">
              No Image
            </div>
          )}
          <div className="font-bold text-base mb-1">{defender.name}</div>
          {roundStep === 'defense' && <div className="text-xs text-center break-words w-full text-gray-900" style={{ wordBreak: 'break-word' }}>{defender.commentary}</div>}
        </div>
        {/* Bottom Panel (spans both columns) */}
        <div className="row-start-3 row-end-4 col-span-2 bg-white border border-black rounded-md p-6 flex flex-col overflow-y-auto text-gray-900 min-h-[120px] max-h-40 shadow-md">
          {previousRounds.map((r) => (
            <div key={r.round} className="flex items-center gap-3 mb-2">
              {/* Attacker avatar and commentary */}
              <img src={r.attacker.imageUrl} alt={r.attacker.name} className="w-6 h-6 object-cover rounded-full border border-gray-400" />
              <span className="font-bold text-xs mr-1">{r.attacker.name}:</span>
              <span className="text-xs">{r.attacker.commentary}</span>
              {/* Defender avatar and commentary */}
              <img src={r.defender.imageUrl} alt={r.defender.name} className="w-6 h-6 object-cover rounded-full border border-gray-400 ml-4" />
              <span className="font-bold text-xs mr-1">{r.defender.name}:</span>
              <span className="text-xs">{r.defender.commentary}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleStoryboard; 