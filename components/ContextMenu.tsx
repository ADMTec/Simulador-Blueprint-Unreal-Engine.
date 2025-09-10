import React from 'react';

export interface ContextMenuItem {
  label: string;
  action: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const handleItemClick = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      className="absolute z-50 bg-[#252526] border border-gray-600 rounded-md shadow-lg text-white text-sm"
      style={{ top: y, left: x }}
    >
      <ul className="py-1">
        {items.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => handleItemClick(item.action)}
              className="w-full text-left px-4 py-2 hover:bg-[#3c3c3c] transition-colors"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}