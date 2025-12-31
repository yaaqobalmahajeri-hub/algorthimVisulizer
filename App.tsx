
import React, { useState } from 'react';
import { ALGORITHMS, ALGORITHM_KEYS } from './constants';
import { AlgorithmId } from './types';
import { GithubIcon } from './components/ui/Icon';

const App: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmId>('selectionSort');

  const VisualizerComponent = ALGORITHMS[selectedAlgorithm].component;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 lg:p-8 flex flex-col">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-sky-400">
            Algorithm Visualizer
          </h1>
          <p className="text-slate-400 mt-1">
            An interactive journey into data structures and algorithms.
          </p>
        </div>
        <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors">
          <GithubIcon className="h-8 w-8" />
        </a>
      </header>

      <nav className="mb-6">
        <div className="overflow-x-auto">
          <div className="flex space-x-2 border-b border-slate-700">
            {ALGORITHM_KEYS.map((algoId) => (
              <button
                key={algoId}
                onClick={() => setSelectedAlgorithm(algoId)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none ${
                  selectedAlgorithm === algoId
                    ? 'border-b-2 border-sky-400 text-sky-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {ALGORITHMS[algoId].name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <VisualizerComponent key={selectedAlgorithm} />
      </main>
    </div>
  );
};

export default App;
