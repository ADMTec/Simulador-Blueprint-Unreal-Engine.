import React, { memo } from 'react';
import { Node as NodeType, Pin as PinType, DataType, PinDirection } from '../types';
import { PIN_BACKGROUND_COLORS } from '../constants';

interface PinProps {
  pin: PinType;
  onPinMouseDown: (e: React.MouseEvent, pin: PinType) => void;
  onPinMouseUp: (e: React.MouseEvent, pin: PinType) => void;
}

const Pin: React.FC<PinProps> = ({ pin, onPinMouseDown, onPinMouseUp }) => {
  const isInput = pin.direction === PinDirection.INPUT;
  const pinColor = PIN_BACKGROUND_COLORS[pin.dataType] || 'bg-gray-400';
  
  const pinSymbol = pin.dataType === DataType.EXEC ? (
    <div className="w-4 h-4" style={{
        clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
        backgroundColor: 'white'
    }}></div>
  ) : (
    <div className={`w-3 h-3 rounded-full ${pinColor}`} />
  );

  return (
    <div
      className={`flex items-center space-x-2 my-3 h-4 ${isInput ? '' : 'flex-row-reverse space-x-reverse'}`}
      onMouseDown={(e) => onPinMouseDown(e, pin)}
      onMouseUp={(e) => onPinMouseUp(e, pin)}
    >
      {pinSymbol}
      <span className="text-xs text-gray-300">{pin.label}</span>
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
}

const NodeComponent: React.FC<NodeProps> = ({ node, isSelected, onNodeMouseDown, onPinMouseDown, onPinMouseUp, onContextMenu }) => {
  return (
    <div
      className={`absolute bg-[#2d2d2d] rounded-lg shadow-xl border-2 ${isSelected ? 'border-yellow-400' : 'border-black'} text-white select-none`}
      style={{ left: node.x, top: node.y, minWidth: 150 }}
      onMouseDown={(e) => onNodeMouseDown(e, node.id)}
      onContextMenu={(e) => onContextMenu(e, node.id)}
    >
      <div className="bg-[#3c3c3c] rounded-t-md px-3 py-1 font-bold text-sm cursor-move">
        {node.title}
      </div>
      <div className="p-2 flex justify-between space-x-4">
        <div className="flex flex-col">
          {node.inputs.map(pin => (
            <Pin key={pin.id} pin={pin} onPinMouseDown={onPinMouseDown} onPinMouseUp={onPinMouseUp}/>
          ))}
        </div>
        <div className="flex flex-col items-end">
          {node.outputs.map(pin => (
            <Pin key={pin.id} pin={pin} onPinMouseDown={onPinMouseDown} onPinMouseUp={onPinMouseUp}/>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(NodeComponent);