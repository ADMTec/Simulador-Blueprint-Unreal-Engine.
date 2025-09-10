
import React, { useEffect, useRef } from 'react';

interface ConsoleProps {
  output: string[];
}

export default function Console({ output }: ConsoleProps) {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  return (
    <div className="h-full bg-[#1e1e1e] border-t border-gray-700 flex flex-col">
      <div className="px-4 py-1 bg-[#333] border-b border-gray-700">
        <h3 className="font-semibold text-gray-300">Console</h3>
      </div>
      <div className="p-4 overflow-y-auto flex-grow font-roboto-mono text-sm">
        {output.map((line, index) => (
          <div key={index} className="flex">
            <span className="text-gray-500 mr-2">{'>'}</span>
            <p className={`whitespace-pre-wrap ${line.toLowerCase().includes('error') ? 'text-red-400' : 'text-gray-300'}`}>{line}</p>
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
}
