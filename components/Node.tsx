import React, { memo, useState, useEffect } from 'react';
import { Node as NodeType, Pin as PinType, DataType, PinDirection, NodeType as NodeTypeEnum } from '../types';
import { PIN_VISUAL_STYLES } from '../constants';

interface PinProps {
  pin: PinType;
  onPinMouseDown: (e: React.MouseEvent, pin: PinType) => void;
  onPinMouseUp: (e: React.MouseEvent, pin: PinType) => void;
}

const Pin: React.FC<PinProps> = ({ pin, onPinMouseDown, onPinMouseUp }) => {
  const isInput = pin.direction === PinDirection.INPUT;
  const visual = PIN_VISUAL_STYLES[pin.dataType] || PIN_VISUAL_STYLES[DataType.ANY];
  const trimmedLabel = (pin.label ?? '').trim();
  const showLabel = trimmedLabel.length > 0;

  const pinSymbol = pin.dataType === DataType.EXEC ? (
    <div
      className="w-4 h-4 transition-transform duration-150 ease-out group-hover:scale-110"
      style={{
        clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
        background: `linear-gradient(135deg, ${visual.fill}, ${visual.inner})`,
        boxShadow: `0 0 14px ${visual.glow}`,
        border: `1px solid ${visual.border}`,
      }}
    />
  ) : (
    <div
      className="w-3.5 h-3.5 rounded-full transition-transform duration-150 ease-out group-hover:scale-110"
      style={{
        background: `radial-gradient(circle at 35% 35%, ${visual.fill}, ${visual.inner})`,
        boxShadow: `0 0 12px ${visual.glow}`,
        border: `1px solid ${visual.border}`,
      }}
    />
  );

  return (
    <div
      className={`group flex items-center gap-3 my-2 h-7 ${isInput ? '' : 'flex-row-reverse text-right'}`}
      onMouseDown={(e) => onPinMouseDown(e, pin)}
      onMouseUp={(e) => onPinMouseUp(e, pin)}
    >
      <div className="relative flex items-center justify-center cursor-pointer">
        <div
          className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-150 pointer-events-none"
          style={{ background: visual.glow, filter: 'blur(8px)' }}
        />
        {pinSymbol}
      </div>
      <span
        className="text-[11px] font-medium uppercase tracking-wide pointer-events-none px-2 py-1 rounded-md transition-colors duration-150"
        style={{
          color: visual.labelText,
          background: `linear-gradient(90deg, ${visual.labelBackground}, rgba(8, 14, 26, 0.55))`,
          border: `1px solid ${visual.border}`,
          boxShadow: `0 2px 8px -6px ${visual.glow}`,
          minWidth: 90,
          textAlign: isInput ? 'left' : 'right',
          visibility: showLabel ? 'visible' : 'hidden',
        }}
      >
        {pin.label}
      </span>
    </div>
  );
};

interface NodeProps {
  node: NodeType;
  isSelected: boolean;
  onNodeMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onPinMouseDown: (e: React.MouseEvent, pin: PinType) => void;
  onPinMouseUp: (e: React.MouseEvent, pin: PinType) => void;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
  onUpdateNode: (nodeId: string, updates: Partial<Omit<NodeType, 'id'>>) => void;
}

const NodeComponent: React.FC<NodeProps> = ({ node, isSelected, onNodeMouseDown, onPinMouseDown, onPinMouseUp, onContextMenu, onUpdateNode }) => {
  const showVariableName =
    node.type === NodeTypeEnum.SetVariable ||
    node.type === NodeTypeEnum.GetVariable ||
    node.type === NodeTypeEnum.ClearVariable;
    
  const showEditableTitle =
    node.type === NodeTypeEnum.StringLiteral ||
    node.type === NodeTypeEnum.IntegerLiteral ||
    node.type === NodeTypeEnum.FloatLiteral ||
    node.type === NodeTypeEnum.BooleanLiteral;

  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(node.properties.name);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(node.title);
  
  useEffect(() => {
    if (!isEditingTitle) {
      setEditingTitle(node.title);
    }
  }, [node.title, isEditingTitle]);
  
  useEffect(() => {
    if (!isEditingName) {
      setEditingName(node.properties.name);
    }
  }, [node.properties.name, isEditingName]);


  const handleNameCommit = () => {
    if (editingName !== node.properties.name) {
      onUpdateNode(node.id, {
        properties: { ...node.properties, name: editingName },
      });
    }
    setIsEditingName(false);
  };
  
  const handleTitleCommit = () => {
    if (editingTitle !== node.title) {
      onUpdateNode(node.id, { title: editingTitle });
    }
    setIsEditingTitle(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameCommit();
    } else if (e.key === 'Escape') {
      setEditingName(node.properties.name);
      setIsEditingName(false);
    }
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleCommit();
    } else if (e.key === 'Escape') {
      setEditingTitle(node.title);
      setIsEditingTitle(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    left: node.x,
    top: node.y,
    minWidth: 190,
    background: 'linear-gradient(180deg, rgba(11, 18, 32, 0.95) 0%, rgba(6, 11, 22, 0.92) 100%)',
    border: '1px solid rgba(71, 85, 105, 0.55)',
    boxShadow: isSelected
      ? '0 0 0 1px rgba(56, 189, 248, 0.45), 0 28px 60px -35px rgba(14, 165, 233, 0.65)'
      : '0 25px 55px -35px rgba(8, 47, 73, 0.8)',
    transition: 'box-shadow 160ms ease, transform 160ms ease',
    transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
    backdropFilter: 'blur(6px)',
  };

  const accentColor = isSelected
    ? 'linear-gradient(180deg, rgba(56, 189, 248, 0.95), rgba(37, 99, 235, 0.7))'
    : 'linear-gradient(180deg, rgba(59, 130, 246, 0.75), rgba(56, 189, 248, 0.3))';

  return (
    <div
      className="absolute rounded-2xl overflow-hidden text-white select-none"
      style={cardStyle}
      onMouseDown={(e) => onNodeMouseDown(e, node.id)}
      onContextMenu={(e) => onContextMenu(e, node.id)}
    >
      <div
        className="absolute inset-y-4 left-0 w-1.5 pointer-events-none"
        style={{
          background: accentColor,
          boxShadow: isSelected
            ? '0 0 16px rgba(56, 189, 248, 0.55)'
            : '0 0 14px rgba(59, 130, 246, 0.35)',
        }}
      />
      <div
        className="relative px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] cursor-move"
        style={{
          background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.18), rgba(8, 47, 73, 0.55))',
          borderBottom: '1px solid rgba(51, 65, 85, 0.65)',
        }}
      >
        {showEditableTitle && isEditingTitle ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleTitleCommit}
            onKeyDown={handleTitleKeyDown}
            className="w-full text-sm font-semibold tracking-[0.15em] text-sky-100 bg-[#0f172a]/60 px-3 py-1 rounded-md outline-none"
            style={{
              border: '1px solid rgba(56, 189, 248, 0.6)',
              boxShadow: '0 0 0 1px rgba(56, 189, 248, 0.25)',
            }}
            autoFocus
            onMouseDown={e => e.stopPropagation()}
          />
        ) : (
          <p className="text-sky-100" onDoubleClick={() => showEditableTitle && setIsEditingTitle(true)}>
            {node.title}
          </p>
        )}

        {node.comment && (
          <p className="text-[11px] font-normal text-slate-300/80 italic mt-2 tracking-normal">
            {node.comment}
          </p>
        )}
        {showVariableName && (
          isEditingName ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleNameCommit}
              onKeyDown={handleNameKeyDown}
              className="w-full text-xs font-roboto-mono text-sky-200 bg-[#0b1120]/80 px-2 py-1 rounded-md mt-3 outline-none"
              style={{
                border: '1px solid rgba(56, 189, 248, 0.45)',
                boxShadow: '0 0 0 1px rgba(56, 189, 248, 0.15)',
              }}
              autoFocus
              onMouseDown={e => e.stopPropagation()}
            />
          ) : (
            <p
              className="text-xs font-roboto-mono text-sky-200 bg-[#0b1120]/70 px-2 py-1 rounded-md mt-3 truncate cursor-pointer"
              style={{
                border: '1px solid rgba(56, 189, 248, 0.35)',
                boxShadow: '0 2px 6px -4px rgba(56, 189, 248, 0.35)',
              }}
              onDoubleClick={() => setIsEditingName(true)}
            >
              {node.properties.name}
            </p>
          )
        )}
      </div>
      <div className="relative px-4 py-3 flex justify-between">
        <div className="flex flex-col">
          {node.inputs.map(pin => (
            <Pin key={pin.id} pin={pin} onPinMouseDown={onPinMouseDown} onPinMouseUp={onPinMouseUp} />
          ))}
        </div>
        <div className="flex flex-col items-end">
          {node.outputs.map(pin => (
            <Pin key={pin.id} pin={pin} onPinMouseDown={onPinMouseDown} onPinMouseUp={onPinMouseUp} />
          ))}
        </div>
        <div
          className="absolute inset-y-4 left-1/2 w-px"
          style={{
            background: 'linear-gradient(180deg, rgba(148, 163, 184, 0.1), rgba(148, 163, 184, 0))',
            pointerEvents: 'none',
          }}
          aria-hidden
        />
      </div>
    </div>
  );
};

export default memo(NodeComponent);