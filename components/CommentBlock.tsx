import React from 'react';

interface CommentBlockProps {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

export default function CommentBlock({ x, y, width, height, text }: CommentBlockProps) {
  return (
    <div
      className="absolute border border-dashed border-gray-500 bg-gray-700 bg-opacity-20"
      style={{ left: x, top: y, width, height }}
    >
      <textarea
        defaultValue={text}
        className="w-full h-full bg-transparent text-white p-2 resize-none"
        placeholder="Type a comment..."
      />
    </div>
  );
}
