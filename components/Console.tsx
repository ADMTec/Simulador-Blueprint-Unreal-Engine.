
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
    <div className="h-full flex flex-col text-slate-200">
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/60 backdrop-blur">
        <h3 className="text-xs uppercase tracking-[0.4em] text-slate-400">Console</h3>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(12, 74, 110, 0.12), transparent 50%), radial-gradient(circle at 15% 20%, rgba(56, 189, 248, 0.12), transparent 60%)',
            opacity: 0.9,
          }}
        />
        <div className="relative h-full overflow-y-auto p-4 font-roboto-mono text-sm space-y-2">
          {output.map((line, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-[11px] uppercase tracking-[0.35em] text-slate-500/80 mt-0.5">{'>'}</span>
              <p
                className={`whitespace-pre-wrap ${line.toLowerCase().includes('error') ? 'text-rose-300' : 'text-slate-200/90'}`}
              >
                {line}
              </p>
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
}
