import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
// FIX: Removed redundant `Node` import. It was causing a type collision with the global DOM `Node` type,
// leading to an error on line 263 where `e.currentTarget` was incorrectly cast.
// The custom node type is consistently aliased as `NodeType`.
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
  onUpdateNode: (nodeId: string, updates: Partial<Omit<NodeType, 'id'>>) => void;
}

interface Transform {
    x: number;
    y: number;
    k: number; // Scale
}

interface DraggingState {
  type: 'node' | 'pan';
  id?: string;
  startX: number;
  startY: number;
  nodeInitialX?: number;
  nodeInitialY?: number;
  transformInitialX?: number;
  transformInitialY?: number;
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
  onUpdateNode,
}: CanvasProps) {
  const [dragging, setDragging] = useState<DraggingState | null>(null);
  const [wirePreview, setWirePreview] = useState<WirePreview | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);
  const pinMap = useMemo(() => {
    const map = new Map<string, Pin>();
    for (const node of nodes) {
      for (const pin of [...node.inputs, ...node.outputs]) {
        map.set(pin.id, pin);
      }
    }
    return map;
  }, [nodes]);

  const getPinPosition = useCallback((pinId: string) => {
    const pin = pinMap.get(pinId);
    const node = pin ? nodeMap.get(pin.nodeId) : undefined;
    if (!node || !pin) return { x: 0, y: 0 };

    const pins = pin.direction === PinDirection.INPUT ? node.inputs : node.outputs;
    const pinIndex = pins.findIndex(p => p.id === pin.id);
    
    // Estimates for positioning wires.
    const NODE_HEADER_HEIGHT = 32;
    const PIN_VERTICAL_OFFSET = 20;
    const PIN_SPACING = 28;
    const INPUT_PIN_X = 8;
    const OUTPUT_PIN_X = 142; // Assuming minWidth 150

    const x = node.x + (pin.direction === PinDirection.INPUT ? INPUT_PIN_X : OUTPUT_PIN_X);
    const y = node.y + NODE_HEADER_HEIGHT + PIN_VERTICAL_OFFSET + (pinIndex * PIN_SPACING);
    
    return { x, y };
  }, [nodeMap, pinMap]);
  
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const { left, top } = canvasRef.current.getBoundingClientRect();
      const x = (clientX - left - transform.x) / transform.k;
      const y = (clientY - top - transform.y) / transform.k;
      return { x, y };
  }, [transform]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.nativeEvent.getModifierState("Space"))) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      setDragging({
        type: 'pan',
        startX: e.clientX,
        startY: e.clientY,
        transformInitialX: transform.x,
        transformInitialY: transform.y,
      });
    }
  }, [transform]);
  
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodeMap.get(nodeId);
    if (node && e.button === 0) {
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
  }, [nodeMap, onSelectNode]);

  const handlePinMouseDown = useCallback((e: React.MouseEvent, pin: Pin) => {
    e.stopPropagation();
    if (e.button === 0 && pin.direction === PinDirection.OUTPUT) {
        const startPos = getPinPosition(pin.id);
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
    setIsPanning(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) {
        if (wirePreview) {
            const canvasCoords = getCanvasCoords(e.clientX, e.clientY);
            setWirePreview({ ...wirePreview, toPos: canvasCoords });
        }
        return;
    }

    const dx = (e.clientX - dragging.startX);
    const dy = (e.clientY - dragging.startY);

    if (dragging.type === 'node' && dragging.id && dragging.nodeInitialX !== undefined && dragging.nodeInitialY !== undefined) {
      onNodePositionChange(dragging.id, dragging.nodeInitialX + (dx / transform.k), dragging.nodeInitialY + (dy / transform.k));
    } else if (dragging.type === 'pan' && dragging.transformInitialX !== undefined && dragging.transformInitialY !== undefined) {
      setTransform(prev => ({ ...prev, x: dragging.transformInitialX! + dx, y: dragging.transformInitialY! + dy }));
    }
  }, [dragging, onNodePositionChange, wirePreview, transform.k, getCanvasCoords]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectNode(null);
    }
    setContextMenu(null);
  };
  
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 1.1;
    const newScale = e.deltaY < 0 ? transform.k * scaleFactor : transform.k / scaleFactor;
    const clampedScale = Math.max(0.2, Math.min(2, newScale));
    
    const { left, top } = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    
    const newX = mouseX - (mouseX - transform.x) * (clampedScale / transform.k);
    const newY = mouseY - (mouseY - transform.y) * (clampedScale / transform.k);

    setTransform({ x: newX, y: newY, k: clampedScale });
  }, [transform]);


  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        onDeleteNode(selectedNodeId);
    }
    if (e.code === 'Space') {
      e.preventDefault();
      setIsPanning(true);
    }
  }, [selectedNodeId, onDeleteNode]);
  
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      setIsPanning(false);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('keyup', handleKeyUp);
    return () => {
      canvas.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const { x, y } = getCanvasCoords(event.clientX, event.clientY);
    onAddNode(type, x, y);
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (!canvasRef.current || !target.contains(e.currentTarget as Node)) return;

    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    const items = Object.entries(NODE_TEMPLATES).map(([type, template]) => ({
        label: template.title,
        action: () => onAddNode(type, x, y),
    }));

    setContextMenu({ x: e.clientX, y: e.clientY, items });
  }, [onAddNode, getCanvasCoords]);

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
      className={`relative w-full h-full bg-[#1a1a1a] overflow-hidden select-none focus:outline-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
      onClick={handleCanvasClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
      tabIndex={0}
    >
        <div 
            className="absolute top-0 left-0"
            style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`, transformOrigin: '0 0' }}
        >
            <svg className="absolute top-0 left-0 pointer-events-none" style={{ width: '100vw', height: '100vh', overflow: 'visible' }}>
                {wires.map(wire => {
                    return (
                    <WireComponent
                        key={wire.id}
                        wire={wire}
                        startPos={getPinPosition(wire.fromPinId)}
                        endPos={getPinPosition(wire.toPinId)}
                        onDelete={onDeleteWire}
                    />
                    );
                })}
                {wirePreview && (
                    <WireComponent
                    isPreview
                    wire={{ id: 'preview', dataType: wirePreview.fromPin.dataType } as WireType}
                    startPos={getPinPosition(wirePreview.fromPin.id)}
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
                onUpdateNode={onUpdateNode}
                />
            ))}
      </div>
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