import React, { useMemo, useState } from 'react';
import { Wire, DataType } from '../types';
import { WIRE_COLORS } from '../constants';

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
  const dy = endPos.y - startPos.y;

  const horizontalOffset = Math.max(Math.abs(dx) * 0.45, 120);
  const verticalOffset = dy * 0.15;

  const controlPointX1 = startPos.x + horizontalOffset;
  const controlPointY1 = startPos.y + verticalOffset;
  const controlPointX2 = endPos.x - horizontalOffset;
  const controlPointY2 = endPos.y - verticalOffset;

  const pathData = `M ${startPos.x} ${startPos.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endPos.x} ${endPos.y}`;

  const finalDataType = dataType || wire.dataType;
  const palette = WIRE_COLORS[finalDataType] || WIRE_COLORS[DataType.ANY];

  const baseId = useMemo(() => {
    const sanitized = wire.id.replace(/[^a-zA-Z0-9_-]/g, '');
    if (sanitized.length > 0) {
      return sanitized;
    }

    let hash = 0;
    for (let i = 0; i < wire.id.length; i += 1) {
      hash = (hash << 5) - hash + wire.id.charCodeAt(i);
      hash |= 0;
    }
    return `wire-${Math.abs(hash)}`;
  }, [wire.id]);

  const gradientId = useMemo(() => `wire-gradient-${baseId}`, [baseId]);
  const innerGradientId = useMemo(() => `wire-inner-${baseId}`, [baseId]);
  const glowId = useMemo(() => `wire-glow-${baseId}`, [baseId]);

  const baseStrokeWidth = finalDataType === DataType.EXEC ? 4.5 : 3.25;
  const strokeWidth = isHovered ? baseStrokeWidth + 0.8 : baseStrokeWidth;
  const highlightWidth = Math.max(strokeWidth - 1.1, 1.6);
  const outerOpacity = isPreview ? 0.55 : isHovered ? 1 : 0.92;
  const innerOpacity = isPreview ? 0.78 : isHovered ? 0.96 : 0.87;
  const glowOpacity = isPreview ? 0.42 : isHovered ? 0.7 : 0.48;
  const glowDeviation = isHovered ? 5.5 : 4.2;
  const previewDash = isPreview ? '12 6' : undefined;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(wire.id);
    }
  };

  return (
    <g onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={startPos.x} y1={startPos.y} x2={endPos.x} y2={endPos.y}>
          <stop offset="0%" stopColor={palette.start} />
          <stop offset="55%" stopColor={palette.mid} />
          <stop offset="100%" stopColor={palette.end} />
        </linearGradient>
        <linearGradient id={innerGradientId} gradientUnits="userSpaceOnUse" x1={startPos.x} y1={startPos.y} x2={endPos.x} y2={endPos.y}>
          <stop offset="0%" stopColor={palette.inner} stopOpacity={0.95} />
          <stop offset="45%" stopColor={palette.mid} stopOpacity={0.8} />
          <stop offset="100%" stopColor={palette.inner} stopOpacity={0.9} />
        </linearGradient>
        <filter id={glowId} x="-100%" y="-100%" width="320%" height="320%" filterUnits="objectBoundingBox">
          <feDropShadow dx="0" dy="0" stdDeviation={glowDeviation} floodColor={palette.glow} floodOpacity={glowOpacity} />
        </filter>
      </defs>
      <path
        d={pathData}
        stroke={palette.start}
        strokeWidth={strokeWidth + 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isPreview ? 0.18 : isHovered ? 0.22 : 0.14}
        fill="none"
      />
      <path
        d={pathData}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={outerOpacity}
        filter={`url(#${glowId})`}
        fill="none"
        strokeDasharray={previewDash}
        style={{ transition: 'stroke-width 120ms ease, opacity 120ms ease' }}
      />
      <path
        d={pathData}
        stroke={`url(#${innerGradientId})`}
        strokeWidth={highlightWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={innerOpacity}
        fill="none"
        strokeDasharray={previewDash}
        style={{ transition: 'stroke-width 120ms ease, opacity 120ms ease' }}
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