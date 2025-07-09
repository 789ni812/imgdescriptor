import React from 'react';

interface WinnerAnimationProps {
  winner: string | null;
  onDone?: () => void;
}

const WinnerAnimation: React.FC<WinnerAnimationProps> = ({ winner, onDone }) => {
  let displayText = '';
  if (winner === 'Draw') {
    displayText = "It's a DRAW!";
  } else if (winner) {
    displayText = `${winner} wins the battle!`;
  } else {
    displayText = "It's a DRAW !!!";
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto bg-black/60">
      <div className="flex flex-col items-center justify-center bg-black/90 rounded-2xl px-16 py-14 shadow-2xl">
        <div className="text-green-400 text-6xl font-extrabold mb-10 text-center">
          {displayText}
        </div>
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