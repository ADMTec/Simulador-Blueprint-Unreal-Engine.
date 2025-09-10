import React, { useState } from 'react';
import { useBlueprintState } from './hooks/useBlueprintState';
import NodeLibrary from './components/NodeLibrary';
import Canvas from './components/Canvas';
import DetailsPanel from './components/DetailsPanel';
import Console from './components/Console';
import { executeBlueprint } from './services/simulationService';
import { PlayIcon } from './components/Icons';
import { NodeType } from './types';

export default function App() {
  const {
    nodes,
    wires,
    selectedNode,
    addNode,
    updateNodePosition,
    updateNode, // Changed
    addWire,
    deleteWire,
    deleteNode,
    duplicateNode,
    setSelectedNodeId,
  } = useBlueprintState();

  const [consoleOutput, setConsoleOutput] = useState<string[]>(['Console initialized.']);

  const runSimulation = () => {
    const output = executeBlueprint(nodes, wires);
    setConsoleOutput(output);
  };

  return (
    <div className="flex flex-col h-screen bg-[#333] text-white font-sans">
      <header className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
        <h1 className="text-xl font-bold">Blueprint Editor</h1>
        <button
          onClick={runSimulation}
          className="flex items-center px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          <PlayIcon className="w-5 h-5 mr-2" />
          <span>Run</span>
        </button>
      </header>
      <main className="flex flex-grow overflow-hidden">
        <NodeLibrary />
        <div className="flex-grow flex flex-col">
          <div className="flex-grow">
             <Canvas
                nodes={nodes}
                wires={wires}
                selectedNodeId={selectedNode?.id || null}
                onNodePositionChange={updateNodePosition}
                onAddWire={addWire}
                onDeleteWire={deleteWire}
                onSelectNode={setSelectedNodeId}
                onAddNode={(type, x, y) => addNode(type as NodeType, x, y)}
                onDeleteNode={deleteNode}
                onDuplicateNode={duplicateNode}
                onUpdateNode={updateNode}
             />
          </div>
          <div className="h-1/3 flex-shrink-0">
            <Console output={consoleOutput} />
          </div>
        </div>
        <DetailsPanel selectedNode={selectedNode} onUpdateNode={updateNode} />
      </main>
    </div>
  );
}