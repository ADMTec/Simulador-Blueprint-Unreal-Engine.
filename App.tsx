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
    <div
      className="flex flex-col h-screen text-slate-100 font-sans"
      style={{
        background:
          'radial-gradient(circle at 12% 10%, rgba(59, 130, 246, 0.22), transparent 55%), radial-gradient(circle at 80% 85%, rgba(16, 185, 129, 0.18), transparent 65%), #020617',
      }}
    >
      <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-cyan-900/45 border-b border-slate-800/70 shadow-[0_12px_35px_-22px_rgba(8,47,73,0.85)] backdrop-blur-md">
        <h1 className="text-lg font-semibold uppercase tracking-[0.45em] text-slate-200">Blueprint Editor</h1>
        <button
          onClick={runSimulation}
          className="group relative flex items-center px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500/85 via-teal-400/80 to-sky-400/80 text-slate-900 font-semibold uppercase tracking-wide transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-300/60 hover:scale-105"
          style={{ boxShadow: '0 18px 40px -18px rgba(16, 185, 129, 0.7)' }}
        >
          <span className="absolute -inset-0.5 rounded-lg opacity-0 transition-opacity duration-150 bg-white/40 blur-lg pointer-events-none group-hover:opacity-100" />
          <PlayIcon className="w-5 h-5 mr-2 text-slate-900" />
          <span className="text-sm font-semibold">Run</span>
        </button>
      </header>
      <main className="flex flex-grow overflow-hidden backdrop-blur-sm">
        <NodeLibrary />
        <div className="flex-grow flex flex-col border-x border-slate-800/70 bg-slate-950/40">
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
          <div className="h-1/3 flex-shrink-0 border-t border-slate-800/60 bg-slate-950/60">
            <Console output={consoleOutput} />
          </div>
        </div>
        <DetailsPanel selectedNode={selectedNode} onUpdateNode={updateNode} />
      </main>
    </div>
  );
}