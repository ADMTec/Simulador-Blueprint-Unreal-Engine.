import React from 'react';
import { Node } from '../types';

interface DetailsPanelProps {
  selectedNode: Node | null;
  onUpdateProperties: (nodeId: string, newProperties: Record<string, any>) => void;
}

export default function DetailsPanel({ selectedNode, onUpdateProperties }: DetailsPanelProps) {
    if (!selectedNode) {
        return (
            <aside className="w-80 bg-[#252526] p-4 flex-shrink-0 text-gray-400">
                <h2 className="text-lg font-bold text-gray-300 border-b border-gray-600 pb-2 mb-4">Details</h2>
                <p>Select a node to see its properties.</p>
            </aside>
        );
    }
    
    const handlePropertyChange = (key: string, value: any) => {
        onUpdateProperties(selectedNode.id, { [key]: value });
    };

    const renderPropertyInput = (key: string, value: any) => {
        const inputId = `prop-${selectedNode.id}-${key}`;
        switch (typeof value) {
            case 'string':
                return <input id={inputId} type="text" value={value} onChange={(e) => handlePropertyChange(key, e.target.value)} className="w-full p-1 bg-[#3c3c3c] border border-gray-500 rounded" />;
            case 'number':
                return <input id={inputId} type="number" value={value} onChange={(e) => handlePropertyChange(key, parseFloat(e.target.value) || 0)} className="w-full p-1 bg-[#3c3c3c] border border-gray-500 rounded" />;
            case 'boolean':
                return <input id={inputId} type="checkbox" checked={value} onChange={(e) => handlePropertyChange(key, e.target.checked)} className="h-5 w-5" />;
            default:
                return <span className="text-gray-500">Unsupported property type</span>;
        }
    };

    return (
        <aside className="w-80 bg-[#252526] p-4 flex-shrink-0 text-gray-300 overflow-y-auto">
            <h2 className="text-lg font-bold border-b border-gray-600 pb-2 mb-4">Details</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Node Type</label>
                    <p className="text-md font-semibold">{selectedNode.title}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Node ID</label>
                    <p className="text-xs text-gray-500 break-all">{selectedNode.id}</p>
                </div>
                {Object.keys(selectedNode.properties).length > 0 && (
                    <div className="border-t border-gray-600 pt-4">
                        <h3 className="text-md font-bold mb-2">Properties</h3>
                        {Object.entries(selectedNode.properties).map(([key, value]) => (
                            <div key={key} className="mb-3">
                                <label htmlFor={`prop-${selectedNode.id}-${key}`} className="block text-sm font-medium text-gray-400 capitalize mb-1">{key}</label>
                                {renderPropertyInput(key, value)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
