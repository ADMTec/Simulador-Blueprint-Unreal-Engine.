import React, { useState } from 'react';
import { Wire, DataType } from '../types';
import { PIN_COLORS } from '../constants';

interface WireComponentProps {
  wire: Wire;
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  dataType?: DataType;
  isPreview?: boolean;
  onDelete?: (wireId: string) => void;
}

export default function WireComponent({ wire, startPos, endPos, dataType, isPreview = false, onDelete }: WireComponentProps) {
  const [isHovered, setIsHovered] = useState(false);

  const dx = endPos.x - startPos.x;
  
  // A more pronounced curve calculation. The offset scales with half the horizontal
  // distance, with a larger minimum offset. This creates a more visually distinct
  // "S" curve that feels natural even for nodes that are close together.
  const horizontalOffset = Math.max(Math.abs(dx) * 0.5, 100);

  const controlPointX1 = startPos.x + horizontalOffset;
  const controlPointY1 = startPos.y;
  const controlPointX2 = endPos.x - horizontalOffset;
  const controlPointY2 = endPos.y;

  const pathData = `M ${startPos.x} ${startPos.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endPos.x} ${endPos.y}`;

  const finalDataType = dataType || wire.dataType;
  const strokeColorClass = PIN_COLORS[finalDataType] || 'stroke-gray-400';
  const strokeWidth = finalDataType === DataType.EXEC ? 3 : 2;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(wire.id);
    }
  };

  return (
    <g onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <path
        d={pathData}
        className={`${strokeColorClass} fill-none transition-all duration-75 ease-out`}
        strokeWidth={strokeWidth}
      />
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth="20"
        className={onDelete ? "cursor-pointer" : ""}
        onDoubleClick={handleDelete}
      />
      {isHovered && !isPreview && onDelete && (
        <foreignObject x={(startPos.x + endPos.x) / 2 - 10} y={(startPos.y + endPos.y) / 2 - 10} width="20" height="20">
          <button
            onClick={handleDelete}
            className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm leading-none"
          >
            &times;
          </button>
        </foreignObject>
      )}
    </g>
  );
}