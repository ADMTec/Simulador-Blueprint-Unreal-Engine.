import { useState, useCallback } from 'react';
import { Node, Wire, Pin, NodeType } from '../types';
import { NODE_TEMPLATES } from '../constants';

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useBlueprintState = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const createNode = useCallback((type: NodeType, x: number, y: number): Node => {
    const template = NODE_TEMPLATES[type];
    const nodeId = generateId();

    const createPins = (pinTemplates: Omit<Pin, 'id' | 'nodeId'>[]): Pin[] => {
      return pinTemplates.map((pin, index) => ({
        ...pin,
        id: `${nodeId}_${pin.direction}_${pin.label || pin.dataType}_${index}`,
        nodeId,
      }));
    };

    return {
      id: nodeId,
      type: template.type,
      title: template.title,
      x,
      y,
      inputs: createPins(template.inputs),
      outputs: createPins(template.outputs),
      properties: { ...template.properties },
      comment: template.comment,
    };
  }, []);

  const addNode = useCallback((type: NodeType, x: number, y: number) => {
    const newNode = createNode(type, x, y);
    setNodes(prevNodes => [...prevNodes, newNode]);
  }, [createNode]);
  
  const updateNode = useCallback((nodeId: string, updates: Partial<Omit<Node, 'id'>>) => {
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    );
  }, []);

  const updateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    updateNode(nodeId, { x, y });
  }, [updateNode]);
  
  const updateNodeProperties = useCallback((nodeId: string, newProperties: Record<string, any>) => {
    const node = nodes.find(n => n.id === nodeId);
    if(node) {
        updateNode(nodeId, { properties: { ...node.properties, ...newProperties } });
    }
  }, [nodes, updateNode]);

  const addWire = useCallback((wire: Omit<Wire, 'id'>) => {
    // Prevent duplicate connections to the same input pin
    if (wires.some(w => w.toPinId === wire.toPinId)) {
        console.warn('Input pin already connected.');
        return;
    }
    const newWire = { ...wire, id: generateId() };
    setWires(prevWires => [...prevWires, newWire]);
  }, [wires]);
  
  const deleteWire = useCallback((wireId: string) => {
    setWires(prevWires => prevWires.filter(w => w.id !== wireId));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prevNodes => prevNodes.filter(n => n.id !== nodeId));
    setWires(prevWires => prevWires.filter(w => w.fromNodeId !== nodeId && w.toNodeId !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const duplicateNode = useCallback((nodeId: string) => {
    const originalNode = nodes.find(n => n.id === nodeId);
    if (!originalNode) return;
    
    const newNode = createNode(originalNode.type, originalNode.x + 40, originalNode.y + 40);
    
    // Deep copy properties and comment
    newNode.properties = JSON.parse(JSON.stringify(originalNode.properties));
    newNode.comment = originalNode.comment;
    
    setNodes(prevNodes => [...prevNodes, newNode]);
  }, [nodes, createNode]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return {
    nodes,
    wires,
    selectedNode,
    addNode,
    updateNodePosition,
    updateNodeProperties,
    updateNode,
    addWire,
    deleteWire,
    deleteNode,
    duplicateNode,
    setSelectedNodeId,
  };
};
