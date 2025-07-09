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
    <div className="relative w-full max-w-3xl mx-auto bg-gray-100 border border-gray-300 rounded-lg shadow-lg p-4" style={{ minHeight: 700 }}>
      {/* Top Panel */}
      <div className="absolute left-4 right-4 top-4 h-48 bg-white border border-black text-gray-800" style={{ zIndex: 2 }}>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="font-bold text-lg mb-2">{scene.name}</div>
          <img className="object-cover rounded shadow max-h-28 mb-2" src={scene.imageUrl} alt={scene.name} />
          <div className="text-sm font-semibold">Round {round}</div>
        </div>
      </div>
      {/* Middle Panels */}
      <div className="absolute left-4 top-56 w-[45%] h-32 bg-white border border-black transform -skew-x-3 flex flex-col items-center justify-center text-gray-800" style={{ zIndex: 2 }} data-testid="attacker-box">
        <img src={attacker.imageUrl} alt={attacker.name} className="w-16 h-16 object-cover rounded mb-1" />
        <div className="font-bold text-base">{attacker.name}</div>
        <div className="text-xs text-center px-2">{attacker.action}</div>
      </div>
      <div className="absolute right-4 top-56 w-[45%] h-32 bg-white border border-black transform skew-x-3 flex flex-col items-center justify-center text-gray-800" style={{ zIndex: 2 }} data-testid="defender-box">
        <img src={defender.imageUrl} alt={defender.name} className="w-16 h-16 object-cover rounded mb-1" />
        <div className="font-bold text-base">{defender.name}</div>
        <div className="text-xs text-center px-2">{defender.action}</div>
      </div>
      {/* Bottom Panel */}
      <div className="absolute left-4 right-4 bottom-4 h-40 bg-white border border-black flex flex-col overflow-y-auto p-2 text-gray-800" style={{ zIndex: 2 }}>
        {previousRounds.map((r) => (
          <div key={r.round} className="text-xs mb-1">{`Round ${r.round}: ${r.summary}`}</div>
        ))}
      </div>
      {/* Background panel lines (optional, for manga effect) */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {/* You can add SVG or extra divs here for more hand-drawn panel lines if desired */}
      </div>
    </div>
  );
};

export default BattleStoryboard; 