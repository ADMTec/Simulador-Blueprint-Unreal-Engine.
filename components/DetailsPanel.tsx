import React from 'react';
import { Node } from '../types';

interface DetailsPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, updates: Partial<Omit<Node, 'id'>>) => void;
}

export default function DetailsPanel({ selectedNode, onUpdateNode }: DetailsPanelProps) {
    if (!selectedNode) {
        return (
            <aside className="w-80 bg-slate-950/45 border-l border-slate-800/70 p-6 flex-shrink-0 text-slate-300 backdrop-blur-md">
                <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400 border-b border-slate-800/60 pb-3 mb-6">
                    Details
                </h2>
                <p className="text-sm text-slate-500">
                    Select a node to inspect its properties.
                </p>
            </aside>
        );
    }
    
    const handlePropertyChange = (key: string, value: any) => {
        const newProperties = { ...selectedNode.properties, [key]: value };
        onUpdateNode(selectedNode.id, { properties: newProperties });
    };

    const handleCommentChange = (comment: string) => {
        onUpdateNode(selectedNode.id, { comment });
    };

    const renderPropertyInput = (key: string, value: any) => {
        const inputId = `prop-${selectedNode.id}-${key}`;
        switch (typeof value) {
            case 'string':
                return (
                    <input
                        id={inputId}
                        key={inputId}
                        type="text"
                        value={value}
                        onChange={(e) => handlePropertyChange(key, e.target.value)}
                        className="w-full px-3 py-2 bg-[#0f172a]/70 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500/70 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    />
                );
            case 'number':
                return (
                    <input
                        id={inputId}
                        key={inputId}
                        type="number"
                        value={value}
                        onChange={(e) => handlePropertyChange(key, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-[#0f172a]/70 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    />
                );
            case 'boolean':
                return (
                    <input
                        id={inputId}
                        key={inputId}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handlePropertyChange(key, e.target.checked)}
                        className="h-5 w-5 accent-sky-500"
                    />
                );
            default:
                return <span key={inputId} className="text-gray-500">Unsupported property type</span>;
        }
    };

    return (
        <aside
            className="w-80 bg-slate-950/45 border-l border-slate-800/70 p-6 flex-shrink-0 text-slate-200 overflow-y-auto backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400 border-b border-slate-800/60 pb-3 mb-6">
                Details
            </h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Node Type</label>
                    <p className="text-base font-semibold text-slate-100 mt-1">{selectedNode.title}</p>
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Node ID</label>
                    <p className="text-xs text-slate-500/90 break-all mt-1">{selectedNode.id}</p>
                </div>

                <div className="border-t border-slate-800/60 pt-5">
                     <label htmlFor={`comment-${selectedNode.id}`} className="block text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Comment</label>
                     <textarea
                        id={`comment-${selectedNode.id}`}
                        value={selectedNode.comment}
                        onChange={(e) => handleCommentChange(e.target.value)}
                        className="w-full p-3 bg-[#0f172a]/70 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500/60 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                        rows={3}
                        placeholder="Add a comment..."
                     />
                </div>

                {Object.keys(selectedNode.properties).length > 0 && (
                    <div className="border-t border-slate-800/60 pt-5 space-y-4">
                        <h3 className="text-xs uppercase tracking-[0.3em] text-slate-500">Properties</h3>
                        {Object.entries(selectedNode.properties).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <label
                                    htmlFor={`prop-${selectedNode.id}-${key}`}
                                    className="block text-xs font-medium uppercase tracking-[0.25em] text-slate-400"
                                >
                                    {key}
                                </label>
                                {renderPropertyInput(key, value)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
