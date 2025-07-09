import React, { useEffect, useState } from 'react';

interface RoundStartAnimationProps {
  round: number;
  onDone?: () => void;
}

const RoundStartAnimation: React.FC<RoundStartAnimationProps> = ({ round, onDone }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [round, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-black/80 rounded-2xl px-12 py-8 text-white text-5xl font-extrabold shadow-2xl animate-scale-fade">
        Round {round}
      </div>
      <style jsx>{`
        .animate-scale-fade {
          animation: scaleFade 1s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes scaleFade {
          0% { opacity: 0; transform: scale(0.7); }
          30% { opacity: 1; transform: scale(1.1); }
          60% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
};

export default RoundStartAnimation; 