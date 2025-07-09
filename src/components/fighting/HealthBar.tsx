import React, { useEffect, useRef, useState } from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  color: string;
}

const HealthBar: React.FC<HealthBarProps> = ({ current, max, color }) => {
  const [displayed, setDisplayed] = useState(current);
  const prev = useRef(current);

  useEffect(() => {
    if (current !== prev.current) {
      const timeout = setTimeout(() => setDisplayed(current), 200);
      prev.current = current;
      return () => clearTimeout(timeout);
    }
  }, [current]);

  const percent = Math.max(0, Math.min(100, (displayed / max) * 100));

  return (
    <div className="w-32 bg-gray-700 rounded-full h-4 mt-2 overflow-hidden">
      <div
        data-testid="health-bar-inner"
        className={`h-4 rounded-full transition-all duration-300 ease-in-out`}
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
      <div className="text-xs mt-1 text-center text-white">
        Health: {current} / {max}
      </div>
    </div>
  );
};

export default HealthBar; 