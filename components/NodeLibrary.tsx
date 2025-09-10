import React from 'react';
import { NODE_TEMPLATES } from '../constants';
import { NodeType } from '../types';

const DraggableNode: React.FC<{ type: NodeType, title: string }> = ({ type, title }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="p-2 mb-2 bg-[#3c3c3c] text-white rounded-md cursor-grab hover:bg-[#4a4a4a] transition-colors"
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      {title}
    </div>
  );
};

export default function NodeLibrary() {
  return (
    <aside className="w-64 bg-[#252526] p-4 flex-shrink-0 z-10 shadow-lg overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-300 border-b border-gray-600 pb-2 mb-4">Nodes</h2>
      {Object.entries(NODE_TEMPLATES).map(([type, template]) => (
        <DraggableNode key={type} type={type as NodeType} title={template.title} />
      ))}
    </aside>
  );
}
