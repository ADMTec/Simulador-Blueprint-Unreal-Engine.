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
      className="group relative mb-3 overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/60 px-3 py-2.5 text-slate-200 cursor-grab select-none transition-transform duration-150 hover:-translate-y-0.5 hover:border-sky-400/60"
      style={{ boxShadow: '0 14px 30px -24px rgba(56, 189, 248, 0.8)' }}
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.16), rgba(8, 145, 178, 0.12))',
        }}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-sm font-medium tracking-wide">{title}</span>
        <span className="text-[10px] uppercase tracking-[0.35em] text-sky-300/80">Drag</span>
      </div>
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
    <aside className="w-72 bg-slate-950/45 border-r border-slate-800/70 px-5 py-6 flex-shrink-0 z-10 overflow-y-auto backdrop-blur-md text-slate-200">
      <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400 border-b border-slate-800/60 pb-3 mb-6">
        Nodes
      </h2>
      <div className="mb-6">
        <label htmlFor="node-search" className="block text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">
          Search
        </label>
        <input
          id="node-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search nodes..."
          className="w-full px-3 py-2 text-sm bg-[#0f172a]/70 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500/70 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        />
        <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-slate-500">
          {totalMatches} match{totalMatches === 1 ? '' : 'es'}
        </p>
      </div>

      {totalMatches === 0 ? (
        <p className="text-sm text-slate-500">No nodes match your search.</p>
      ) : (
        filteredGroups.map(group => (
          <section key={group.label} className="mb-7">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 mb-3 flex items-center justify-between">
              <span>{group.label}</span>
              <span className="text-[10px] font-normal text-slate-500">{group.nodes.length}</span>
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
