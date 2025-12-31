import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getFibonacciAnimations, buildFibonacciTree } from '../../algorithms/fibonacci';
import { FibonacciNode, FibonacciAnimationStep } from '../../types';
import { PlayIcon, PauseIcon, ResetIcon, PrevStepIcon, NextStepIcon } from '../ui/Icon';
import Slider from '../ui/Slider';
import { ALGORITHMS } from '../../constants';
import CodeDisplay from '../ui/CodeDisplay';

const MAX_SPEED = 1000;
const MIN_SPEED = 50;

interface TreeNodeProps {
    node: FibonacciNode;
    activeNodeId: string | null;
    returnedNodeIds: Set<string>;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, activeNodeId, returnedNodeIds }) => {
    const isActive = activeNodeId === node.id;
    const hasReturned = returnedNodeIds.has(node.id);
    
    let borderColor = 'border-slate-600';
    if(isActive) borderColor = 'border-yellow-400';
    if(hasReturned) borderColor = 'border-green-400';

    let bgColor = 'bg-slate-800';
    if(isActive) bgColor = 'bg-yellow-800/50';
    if(hasReturned) bgColor = 'bg-green-800/50';

    return (
        <div className="flex flex-col items-center">
            <div 
              className={`w-20 h-16 flex flex-col justify-center items-center rounded-lg border-2 ${borderColor} ${bgColor} transition-all duration-300 shadow-md`}
            >
                <div className="text-xs text-slate-400">fib({node.value})</div>
                <div className="text-xl font-bold">{hasReturned ? node.result : '?'}</div>
            </div>
            {node.children.length > 0 && (
                <>
                  <div className="h-8 w-px bg-slate-600" />
                  <div className="flex space-x-4">
                      {node.children.map((child, index) => (
                          <div key={child.id} className="flex flex-col items-center relative">
                              <div className="absolute top-[-32px] h-8 w-px bg-slate-600" />
                              {node.children.length > 1 && (
                                  <div className={`absolute top-[-32px] h-px bg-slate-600 w-1/2 ${index === 0 ? 'right-0' : 'left-0'}`} />
                              )}
                              <TreeNode node={child} activeNodeId={activeNodeId} returnedNodeIds={returnedNodeIds}/>
                          </div>
                      ))}
                  </div>
                </>
            )}
        </div>
    );
};

const FibonacciVisualizer: React.FC = () => {
    const [fibNumber, setFibNumber] = useState(5);
    const [tree, setTree] = useState<FibonacciNode | null>(null);
    const [animations, setAnimations] = useState<FibonacciAnimationStep[]>([]);
    const [animationIndex, setAnimationIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(500);
    const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

    // Create a map from node ID to its value 'n'
    const nodeIdToValueMap = useMemo(() => {
        const map = new Map<string, number>();
        function traverse(node: FibonacciNode) {
            map.set(node.id, node.value);
            node.children.forEach(traverse);
        }
        if (tree) traverse(tree);
        return map;
    }, [tree]);


    const resetVisualization = useCallback(() => {
        setIsPlaying(false);
        const newTree = buildFibonacciTree(fibNumber);
        const newAnimations = getFibonacciAnimations(fibNumber);
        setTree(newTree);
        setAnimations(newAnimations);
        setAnimationIndex(0);
        setHighlightedLine(null);
    }, [fibNumber]);

    useEffect(() => {
        resetVisualization();
    }, [fibNumber, resetVisualization]);
    
    // Autoplay effect
    useEffect(() => {
        if (isPlaying && animationIndex < animations.length) {
            const timer = setTimeout(() => {
                setAnimationIndex(prev => prev + 1);
            }, MAX_SPEED - speed);
            return () => clearTimeout(timer);
        } else if (isPlaying && animationIndex >= animations.length) {
            setIsPlaying(false);
        }
    }, [animationIndex, isPlaying, animations.length, speed]);

    // State computation memo
    const visualState = useMemo(() => {
        const state = {
            returnedNodeIds: new Set<string>(),
            nodeResults: new Map<string, number>(),
            activeNodeId: null as string | null,
            highlightedLine: null as number | null,
            callStack: [] as string[]
        };
        
        if (!animations.length) return state;

        for (let i = 0; i <= animationIndex; i++) {
            const step = animations[i];
            if (!step) continue;
            
            const [type, ...data] = step;
            const isCurrentStep = i === animationIndex;
            
            if (isCurrentStep) {
                state.highlightedLine = data[data.length - 1] as number;
            }

            switch(type) {
                case 'call':
                    state.activeNodeId = data[0] as string;
                    break;
                case 'return': {
                    const [id, result] = data as [string, number];
                    state.returnedNodeIds.add(id);
                    state.nodeResults.set(id, result);
                    break;
                }
                case 'stack_push':
                    state.callStack.push(data[0] as string);
                    if (isCurrentStep) state.activeNodeId = data[0] as string;
                    break;
                case 'stack_pop':
                    state.callStack.pop();
                    if (isCurrentStep) state.activeNodeId = state.callStack[state.callStack.length - 1] || null;
                    break;
            }
        }
        
        // If animation is over, ensure the final result is shown correctly
        if (animationIndex >= animations.length && tree) {
            const finalStep = animations[animations.length-2]; // Second to last is the final return
            if (finalStep && finalStep[0] === 'return') {
                 state.nodeResults.set(finalStep[1], finalStep[2]);
                 state.returnedNodeIds.add(finalStep[1]);
            }
            state.activeNodeId = null;
        }

        return state;
    }, [animationIndex, animations, tree]);


    useEffect(() => {
        setHighlightedLine(visualState.highlightedLine);
    }, [visualState]);


    const handlePlayPause = () => {
        if (animationIndex >= animations.length) {
            resetVisualization();
            setTimeout(() => setIsPlaying(true), 100);
        } else {
            setIsPlaying(!isPlaying);
        }
    };

    const handleNextStep = () => {
      setIsPlaying(false);
      if (animationIndex < animations.length) {
          setAnimationIndex(prev => prev + 1);
      }
    };

    const handlePreviousStep = () => {
        setIsPlaying(false);
        if (animationIndex > 0) {
            setAnimationIndex(prev => prev - 1);
        }
    };
    
    const updateTreeWithResults = (node: FibonacciNode): FibonacciNode => {
        return {
            ...node,
            result: visualState.nodeResults.get(node.id),
            children: node.children.map(updateTreeWithResults)
        }
    }

    const displayedTree = tree ? updateTreeWithResults(tree) : null;
    const { description, complexity, code } = ALGORITHMS.fibonacci;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-3 bg-slate-800/50 p-4 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <button onClick={handlePreviousStep} disabled={isPlaying || animationIndex === 0} className="p-2 bg-slate-600 text-white rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed">
                                <PrevStepIcon className="h-6 w-6" />
                            </button>
                            <button onClick={handlePlayPause} className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400">
                                {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                            </button>
                            <button onClick={handleNextStep} disabled={isPlaying || animationIndex >= animations.length} className="p-2 bg-slate-600 text-white rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed">
                                <NextStepIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <button onClick={resetVisualization} className="p-2 bg-slate-600 text-white rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500">
                            <ResetIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-48">
                            <Slider label={`fib(${fibNumber})`} min={0} max={8} value={fibNumber} onChange={(e) => setFibNumber(Number(e.target.value))} />
                        </div>
                        <div className="w-full sm:w-48">
                            <Slider label="Speed" min={MIN_SPEED} max={MAX_SPEED} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
                        </div>
                    </div>
                </div>
                <div className="h-[65vh] xl:h-[70vh] bg-slate-900 rounded-md p-4 flex justify-center items-start overflow-auto">
                    {displayedTree && <TreeNode node={displayedTree} activeNodeId={visualState.activeNodeId} returnedNodeIds={visualState.returnedNodeIds}/>}
                </div>
            </div>
             <div className="xl:col-span-2 flex flex-col gap-6">
                <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-sky-400 mb-4">Fibonacci (Recursive)</h2>
                    <p className="text-slate-300 mb-6">{description}</p>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-slate-200 mb-3">Call Stack</h3>
                        <div className="h-40 bg-slate-900 rounded-md p-2 flex flex-col-reverse gap-1 overflow-y-auto">
                            {visualState.callStack.map((nodeId, index) => (
                                <div key={`${nodeId}-${index}`} className="bg-slate-700 text-center rounded p-1 text-sm font-mono animate-fade-in">
                                    fib({nodeIdToValueMap.get(nodeId)})
                                </div>
                            ))}
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-3">Complexity Analysis</h3>
                     <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                            <span className="font-semibold text-green-400">Time</span>
                            <div className="text-right">
                                <div className="font-mono">{complexity.average.time}</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                            <span className="font-semibold text-yellow-400">Space</span>
                             <div className="text-right">
                                <div className="font-mono">{complexity.average.space}</div>
                            </div>
                        </div>
                     <p className="text-xs text-slate-400 pt-2">Note: With memoization, time complexity improves to O(n).</p>
                    </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-200 mb-3 px-2">Code</h3>
                    <CodeDisplay code={code} highlightedLine={highlightedLine} />
                </div>
            </div>
        </div>
    );
};

export default FibonacciVisualizer;