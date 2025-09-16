import React, { useMemo, useState } from 'react';
import { NODE_LIBRARY_GROUPS, NODE_TEMPLATES } from '../constants';
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
  const [query, setQuery] = useState('');

  type LibraryNode = { type: NodeType; title: string };

  const normalizedQuery = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    const matchesQuery = (node: LibraryNode) => {
      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${node.title} ${node.type}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    };

    const groups = NODE_LIBRARY_GROUPS.map(group => {
      const nodes: LibraryNode[] = group.types
        .map(type => {
          const template = NODE_TEMPLATES[type];
          if (!template) return null;
          return { type, title: template.title };
        })
        .filter((node): node is LibraryNode => node !== null)
        .filter(matchesQuery)
        .sort((a, b) => a.title.localeCompare(b.title));

      return { label: group.label, nodes };
    }).filter(group => group.nodes.length > 0);

    const groupedTypeSet = new Set<NodeType>(NODE_LIBRARY_GROUPS.flatMap(group => group.types));

    const ungroupedNodes: LibraryNode[] = (Object.keys(NODE_TEMPLATES) as NodeType[])
      .filter(type => !groupedTypeSet.has(type))
      .map(type => ({ type, title: NODE_TEMPLATES[type]?.title ?? type }))
      .filter(matchesQuery)
      .sort((a, b) => a.title.localeCompare(b.title));

    if (ungroupedNodes.length > 0) {
      groups.push({ label: 'Other', nodes: ungroupedNodes });
    }

    return groups;
  }, [normalizedQuery]);

  const totalMatches = filteredGroups.reduce((count, group) => count + group.nodes.length, 0);

  return (
    <aside className="w-64 bg-[#252526] p-4 flex-shrink-0 z-10 shadow-lg overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-300 border-b border-gray-600 pb-2 mb-4">Nodes</h2>
      <div className="mb-4">
        <label htmlFor="node-search" className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
          Search
        </label>
        <input
          id="node-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search nodes..."
          className="w-full px-2 py-1 text-sm bg-[#1e1e1e] border border-gray-600 rounded focus:outline-none focus:border-blue-400"
        />
      </div>

      {totalMatches === 0 ? (
        <p className="text-sm text-gray-500">No nodes match your search.</p>
      ) : (
        filteredGroups.map(group => (
          <section key={group.label} className="mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              {group.label}
              <span className="ml-2 text-[10px] font-normal text-gray-500">{group.nodes.length}</span>
            </h3>
            {group.nodes.map(node => (
              <DraggableNode key={node.type} type={node.type} title={node.title} />
            ))}
          </section>
        ))
      )}
    </aside>
  );
}
