import React from 'react';

interface CodeDisplayProps {
  code: string;
  highlightedLine: number | null;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, highlightedLine }) => {
  const lines = code.split('\n');

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden text-sm font-mono">
      <pre className="p-4 overflow-x-auto">
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const isHighlighted = lineNumber === highlightedLine;
          return (
            <div
              key={lineNumber}
              className={`flex items-start transition-colors duration-200 ${
                isHighlighted ? 'bg-sky-900/50' : ''
              }`}
            >
              <span className="inline-block w-8 text-right pr-4 text-slate-500 select-none">
                {lineNumber}
              </span>
              <code className="flex-1 whitespace-pre-wrap">{line}</code>
            </div>
          );
        })}
      </pre>
    </div>
  );
};

export default CodeDisplay;