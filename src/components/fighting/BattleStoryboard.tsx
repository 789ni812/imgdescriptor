import React from 'react';

interface Fighter {
  name: string;
  imageUrl: string;
  action: string;
}

interface Scene {
  name: string;
  imageUrl: string;
}

interface PreviousRound {
  round: number;
  summary: string;
}

interface BattleStoryboardProps {
  scene: Scene;
  round: number;
  attacker: Fighter;
  defender: Fighter;
  previousRounds: PreviousRound[];
}

export const BattleStoryboard: React.FC<BattleStoryboardProps> = ({
  scene,
  round,
  attacker,
  defender,
  previousRounds,
}) => {
  return (
    <div className="flex justify-center items-center min-h-[80vh] w-full">
      <div
        className="w-[90%] max-w-5xl grid grid-rows-[minmax(120px,auto)_minmax(100px,auto)_minmax(120px,auto)] grid-cols-2 gap-y-4 gap-x-4 bg-gray-100 border border-gray-300 rounded-lg shadow-lg p-6"
        style={{ boxSizing: 'border-box' }}
      >
        {/* Top Panel (spans both columns) */}
        <div className="row-start-1 row-end-2 col-span-2 bg-white border border-black rounded-md p-6 flex flex-col items-center justify-center text-gray-800 min-h-[120px]">
          <div className="font-bold text-lg mb-2">{scene.name}</div>
          <img className="object-cover rounded shadow max-h-28 mb-2" src={scene.imageUrl} alt={scene.name} />
          <div className="text-sm font-semibold">Round {round}</div>
        </div>
        {/* Middle Panels */}
        <div className="row-start-2 row-end-3 col-start-1 col-end-2 bg-white border border-black rounded-md p-6 flex flex-col items-center justify-start text-gray-800 min-h-[100px] transform -skew-x-3 overflow-auto">
          <img src={attacker.imageUrl} alt={attacker.name} className="w-16 h-16 object-cover rounded mb-1" />
          <div className="font-bold text-base mb-1">{attacker.name}</div>
          <div className="text-xs text-center break-words w-full" style={{ wordBreak: 'break-word' }}>{attacker.action}</div>
        </div>
        <div className="row-start-2 row-end-3 col-start-2 col-end-3 bg-white border border-black rounded-md p-6 flex flex-col items-center justify-start text-gray-800 min-h-[100px] transform skew-x-3 overflow-auto">
          <img src={defender.imageUrl} alt={defender.name} className="w-16 h-16 object-cover rounded mb-1" />
          <div className="font-bold text-base mb-1">{defender.name}</div>
          <div className="text-xs text-center break-words w-full" style={{ wordBreak: 'break-word' }}>{defender.action}</div>
        </div>
        {/* Bottom Panel (spans both columns) */}
        <div className="row-start-3 row-end-4 col-span-2 bg-white border border-black rounded-md p-6 flex flex-col overflow-y-auto text-gray-800 min-h-[120px] max-h-40">
          {previousRounds.map((r) => (
            <div key={r.round} className="text-xs mb-1 break-words w-full" style={{ wordBreak: 'break-word' }}>{`Round ${r.round}: ${r.summary}`}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleStoryboard; 