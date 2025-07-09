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
    <div className="battle-storyboard-root">
      {/* Top Panel: Scene and Round */}
      <div className="battle-storyboard-top-panel">
        <div className="battle-storyboard-scene-name">{scene.name}</div>
        <img className="battle-storyboard-scene-image" src={scene.imageUrl} alt={scene.name} />
        <div className="battle-storyboard-round">{`Round ${round}`}</div>
      </div>
      {/* Middle Row: Attacker/Defender */}
      <div className="battle-storyboard-middle-row" style={{ display: 'flex' }}>
        <div className="battle-storyboard-attacker" data-testid="attacker-box">
          <img src={attacker.imageUrl} alt={attacker.name} />
          <div>{attacker.name}</div>
          <div>{attacker.action}</div>
        </div>
        <div className="battle-storyboard-defender" data-testid="defender-box">
          <img src={defender.imageUrl} alt={defender.name} />
          <div>{defender.name}</div>
          <div>{defender.action}</div>
        </div>
      </div>
      {/* Bottom Panel: Previous Rounds */}
      <div className="battle-storyboard-bottom-panel">
        {previousRounds.map((r) => (
          <div key={r.round}>{`Round ${r.round}: ${r.summary}`}</div>
        ))}
      </div>
    </div>
  );
};

export default BattleStoryboard; 