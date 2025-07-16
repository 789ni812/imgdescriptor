import React, { useState } from 'react';
import { createTruncatedDescription } from '@/lib/utils/descriptionFormatter';

interface TruncatedDescriptionProps {
  description: Record<string, unknown>;
  maxLength?: number;
  className?: string;
  showTooltip?: boolean;
}

export const TruncatedDescription: React.FC<TruncatedDescriptionProps> = ({
  description,
  maxLength = 150,
  className = '',
  showTooltip = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const formattedDesc = createTruncatedDescription(description, maxLength);

  if (!formattedDesc.isTruncated) {
    return (
      <span className={className}>
        {formattedDesc.short}
      </span>
    );
  }

  return (
    <span
      className={`cursor-help ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={showTooltip ? formattedDesc.full : undefined}
    >
      {formattedDesc.short}
      {isHovered && showTooltip && (
        <div className="absolute z-50 max-w-md p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg border border-gray-600 mt-2">
          {formattedDesc.full}
        </div>
      )}
    </span>
  );
};

export default TruncatedDescription; 