import React from 'react';

interface WinnerAnimationProps {
  winner: string | null;
  onDone?: () => void;
  fighterAHealth?: number;
  fighterBHealth?: number;
}

const WinnerAnimation: React.FC<WinnerAnimationProps> = ({ winner, onDone, fighterAHealth, fighterBHealth }) => {
  let displayText = '';
  let showKO = false;
  if (winner === 'Draw') {
    displayText = "It's a DRAW!";
  } else if (winner) {
    displayText = `${winner} wins the battle!`;
    // KO logic: show KO if either fighter's health is 0 or less and not a draw
    if ((fighterAHealth !== undefined && fighterAHealth <= 0) || (fighterBHealth !== undefined && fighterBHealth <= 0)) {
      showKO = true;
    }
  } else {
    displayText = "It's a DRAW !!!";
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto bg-black/60">
      <div className="flex flex-col items-center justify-center bg-black/90 rounded-2xl px-16 py-14 shadow-2xl">
        <div className="text-green-400 text-6xl font-extrabold mb-10 text-center">
          {displayText}
        </div>
        {showKO && winner !== 'Draw' && (
          <div className="text-red-500 text-5xl font-extrabold mb-8 text-center">KO!</div>
        )}
        <button
          className="px-10 py-4 rounded-lg font-bold text-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg mt-2"
          onClick={onDone}
          autoFocus
        >
          Restart
        </button>
      </div>
    </div>
  );
};

export default WinnerAnimation; 