import React, { memo, useState, useEffect } from 'react';
import { Node as NodeType, Pin as PinType, DataType, PinDirection, NodeType as NodeTypeEnum } from '../types';
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
      <div className="cursor-pointer">{pinSymbol}</div>
      <span className="text-xs text-gray-300 pointer-events-none">{pin.label}</span>
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

  return (
    <div
      className={`absolute bg-[#2d2d2d] rounded-lg shadow-xl border-2 ${isSelected ? 'border-yellow-400' : 'border-black'} text-white select-none`}
      style={{ left: node.x, top: node.y, minWidth: 150 }}
      onMouseDown={(e) => onNodeMouseDown(e, node.id)}
      onContextMenu={(e) => onContextMenu(e, node.id)}
    >
      <div className="bg-[#3c3c3c] rounded-t-md px-3 py-2 font-bold text-sm cursor-move">
        {showEditableTitle && isEditingTitle ? (
           <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleTitleCommit}
              onKeyDown={handleTitleKeyDown}
              className="w-full text-sm font-bold text-white bg-black bg-opacity-50 px-2 py-0 rounded outline-none border border-yellow-400"
              autoFocus
              onMouseDown={e => e.stopPropagation()}
            />
        ) : (
          <p onDoubleClick={() => showEditableTitle && setIsEditingTitle(true)}>{node.title}</p>
        )}
        
        {node.comment && <p className="text-xs font-normal text-gray-400 italic mt-1">{node.comment}</p>}
        {showVariableName && (
          isEditingName ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleNameCommit}
              onKeyDown={handleNameKeyDown}
              className="w-full text-xs font-roboto-mono text-cyan-400 bg-black bg-opacity-50 px-2 py-1 rounded-sm mt-2 outline-none border border-cyan-400"
              autoFocus
              onMouseDown={e => e.stopPropagation()} // Prevent node drag while editing
            />
          ) : (
            <p
              className="text-xs font-roboto-mono text-cyan-400 bg-black bg-opacity-20 px-2 py-1 rounded-sm mt-2 truncate cursor-pointer"
              onDoubleClick={() => setIsEditingName(true)}
            >
              {node.properties.name}
            </p>
          )
        )}
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