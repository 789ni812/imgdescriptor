import React from 'react';
import Image from 'next/image';

interface Fighter {
  id: string;
  name: string;
  imageUrl: string;
}

interface TournamentCommentaryProps {
  commentary: string;
  onContinue?: () => void;
  fighterA?: Fighter;
  fighterB?: Fighter;
}

const TournamentCommentary: React.FC<TournamentCommentaryProps> = ({ 
  commentary, 
  onContinue, 
  fighterA, 
  fighterB 
}) => {
  return (
    <div data-testid="tournament-commentary" className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      {/* Fighter Images Behind Commentary */}
      <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none">
        {/* Left Fighter */}
        {fighterA && (
          <div className="relative w-64 h-64 opacity-30">
            <Image
              src={fighterA.imageUrl}
              alt={fighterA.name}
              fill
              className="object-cover rounded-full border-4 border-gray-600"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-full" />
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-sm font-semibold text-center">
              {fighterA.name}
            </div>
          </div>
        )}
        
        {/* Right Fighter */}
        {fighterB && (
          <div className="relative w-64 h-64 opacity-30">
            <Image
              src={fighterB.imageUrl}
              alt={fighterB.name}
              fill
              className="object-cover rounded-full border-4 border-gray-600"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-full" />
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-sm font-semibold text-center">
              {fighterB.name}
            </div>
          </div>
        )}
      </div>

      {/* Commentary Box - Overlapping the fighter images */}
      <div className="relative max-w-2xl w-full mx-4 bg-gray-900 rounded-2xl p-8 border-2 border-yellow-500 shadow-2xl text-center z-10">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4 drop-shadow-lg">Tournament Commentary</h2>
        <div className="text-lg text-white whitespace-pre-line mb-6 leading-relaxed">{commentary}</div>
        {onContinue && (
          <button
            className="mt-4 px-8 py-3 rounded-lg font-semibold text-lg bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg transition-colors"
            onClick={onContinue}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default TournamentCommentary; 