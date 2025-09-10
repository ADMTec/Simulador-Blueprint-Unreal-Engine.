import React, { useState, useRef, useCallback } from 'react';
import { Node as NodeType, Wire as WireType, Pin, PinDirection, DataType } from '../types';
import { NODE_TEMPLATES } from '../constants';
import NodeComponent from './Node';
import WireComponent from './Wire';
import ContextMenu, { ContextMenuItem } from './ContextMenu';


interface CanvasProps {
  nodes: NodeType[];
  wires: WireType[];
  selectedNodeId: string | null;
  onNodePositionChange: (nodeId: string, x: number, y: number) => void;
  onAddWire: (wire: Omit<WireType, 'id'>) => void;
  onDeleteWire: (wireId: string) => void;
  onSelectNode: (nodeId: string | null) => void;
  onAddNode: (type: string, x: number, y: number) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
}


interface DraggingState {
  type: 'node';
  id: string;
  startX: number;
  startY: number;
  nodeInitialX: number;
  nodeInitialY: number;
}

interface WirePreview {
    fromPin: Pin;
    toPos: { x: number; y: number };
}

interface ContextMenuState {
    x: number;
    y: number;
    items: ContextMenuItem[];
}

// These are estimates for positioning wires.
const NODE_HEADER_HEIGHT = 28;
const PIN_VERTICAL_OFFSET = 18;
const PIN_SPACING = 28;
const INPUT_PIN_HORIZONTAL_OFFSET = 8;
const OUTPUT_PIN_HORIZONTAL_OFFSET = 142; // Assuming minWidth 150

export default function Canvas({
  nodes,
  wires,
  selectedNodeId,
  onNodePositionChange,
  onAddWire,
  onDeleteWire,
  onSelectNode,
  onAddNode,
  onDeleteNode,
  onDuplicateNode,
}: CanvasProps) {
  const [dragging, setDragging] = useState<DraggingState | null>(null);
  const [wirePreview, setWirePreview] = useState<WirePreview | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const getPinPosition = useCallback((pin: Pin) => {
    const node = nodes.find(n => n.id === pin.nodeId);
    if (!node) return { x: 0, y: 0 };

    const pins = pin.direction === PinDirection.INPUT ? node.inputs : node.outputs;
    const pinIndex = pins.findIndex(p => p.id === pin.id);
    const x = node.x + (pin.direction === PinDirection.INPUT ? INPUT_PIN_HORIZONTAL_OFFSET : OUTPUT_PIN_HORIZONTAL_OFFSET);
    const y = node.y + NODE_HEADER_HEIGHT + PIN_VERTICAL_OFFSET + (pinIndex * PIN_SPACING);
    
    return { x, y };
  }, [nodes]);
  
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (node && e.button === 0) { // Only drag on left-click
      onSelectNode(nodeId);
      setDragging({
        type: 'node',
        id: nodeId,
        startX: e.clientX,
        startY: e.clientY,
        nodeInitialX: node.x,
        nodeInitialY: node.y,
      });
    }
  }, [nodes, onSelectNode]);

  const handlePinMouseDown = useCallback((e: React.MouseEvent, pin: Pin) => {
    e.stopPropagation();
    if (e.button === 0 && pin.direction === PinDirection.OUTPUT) {
        const startPos = getPinPosition(pin);
        setWirePreview({ fromPin: pin, toPos: startPos });
    }
  }, [getPinPosition]);

  const handlePinMouseUp = useCallback((e: React.MouseEvent, toPin: Pin) => {
    e.stopPropagation();
    if (e.button === 0 && wirePreview && toPin.direction === PinDirection.INPUT) {
        const fromPin = wirePreview.fromPin;
        if (toPin.nodeId !== fromPin.nodeId && (
            toPin.dataType === fromPin.dataType ||
            fromPin.dataType === DataType.ANY ||
            toPin.dataType === DataType.ANY ||
            (fromPin.dataType === DataType.EXEC && toPin.dataType === DataType.EXEC)
        )) {
            onAddWire({
                fromNodeId: fromPin.nodeId,
                fromPinId: fromPin.id,
                toNodeId: toPin.nodeId,
                toPinId: toPin.id,
                dataType: fromPin.dataType === DataType.EXEC ? DataType.EXEC : (fromPin.dataType !== DataType.ANY ? fromPin.dataType : toPin.dataType),
            });
        }
    }
    setWirePreview(null);
  }, [wirePreview, onAddWire]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setWirePreview(null);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging?.type === 'node') {
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;
      onNodePositionChange(dragging.id, dragging.nodeInitialX + dx, dragging.nodeInitialY + dy);
    }
    if (wirePreview && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        setWirePreview({
            ...wirePreview,
            toPos: {
                x: e.clientX - canvasRect.left,
                y: e.clientY - canvasRect.top,
            }
        });
    }
  }, [dragging, onNodePositionChange, wirePreview]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectNode(null);
    }
    setContextMenu(null);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        onDeleteNode(selectedNodeId);
    }
  }, [selectedNodeId, onDeleteNode]);

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !canvasRef.current) return;
    const { left, top } = canvasRef.current.getBoundingClientRect();
    onAddNode(type, event.clientX - left, event.clientY - top);
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    if (e.target !== e.currentTarget) return; // Open only on canvas background

    const { left, top } = canvasRef.current.getBoundingClientRect();
    const dropX = e.clientX - left;
    const dropY = e.clientY - top;

    const items = Object.entries(NODE_TEMPLATES).map(([type, template]) => ({
        label: template.title,
        action: () => onAddNode(type, dropX, dropY),
    }));

    setContextMenu({ x: e.clientX, y: e.clientY, items });
  }, [onAddNode]);

  const handleNodeContextMenu = useCallback((e: React.MouseEvent, nodeId: string) => {
      e.preventDefault();
      e.stopPropagation();
      onSelectNode(nodeId);

      const items = [
          { label: 'Duplicate Node', action: () => onDuplicateNode(nodeId) },
          { label: 'Delete Node', action: () => onDeleteNode(nodeId) },
      ];

      setContextMenu({ x: e.clientX, y: e.clientY, items });
  }, [onSelectNode, onDeleteNode, onDuplicateNode]);
  
  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-[#1a1a1a] overflow-hidden select-none focus:outline-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      tabIndex={0}
    >
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {wires.map(wire => {
            const allPins = nodes.flatMap(n => [...n.inputs, ...n.outputs]);
            const fromPin = allPins.find(p => p.id === wire.fromPinId);
            const toPin = allPins.find(p => p.id === wire.toPinId);
            if (!fromPin || !toPin) return null;
            return (
              <WireComponent
                key={wire.id}
                wire={wire}
                startPos={getPinPosition(fromPin)}
                endPos={getPinPosition(toPin)}
                onDelete={onDeleteWire}
              />
            );
        })}
        {wirePreview && (
            <WireComponent
              isPreview
              wire={{ id: 'preview', dataType: wirePreview.fromPin.dataType } as WireType}
              startPos={getPinPosition(wirePreview.fromPin)}
              endPos={wirePreview.toPos}
            />
        )}
      </svg>
      {nodes.map(node => (
        <NodeComponent
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          onNodeMouseDown={handleNodeMouseDown}
          onPinMouseDown={handlePinMouseDown}
          onPinMouseUp={handlePinMouseUp}
          onContextMenu={handleNodeContextMenu}
        />
      ))}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}