
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SortingAnimationStep, MergeSortNode, QuickSortNode, PivotStrategy } from '../../types';
import { PlayIcon, PauseIcon, ResetIcon, PrevStepIcon, NextStepIcon, ReplayIcon } from '../ui/Icon';
import Slider from '../ui/Slider';
import { ALGORITHMS } from '../../constants';
import CodeDisplay from '../ui/CodeDisplay';
import { getQuickSortAnimations } from '../../algorithms/quickSort';
import { getMergeSortAnimations } from '../../algorithms/mergeSort';
import { getSelectionSortAnimations } from '../../algorithms/selectionSort';

const MIN_VALUE = 5;
const MAX_VALUE = 100;
const DEFAULT_ARRAY_SIZE = 8; 
const DEFAULT_BLOCK_ARRAY_SIZE = 15;
const MAX_SPEED = 500;
const MIN_SPEED = 5;

interface SortingVisualizerProps {
  algorithmFn: (arr: number[]) => SortingAnimationStep[];
  title: 'Selection Sort' | 'Merge Sort' | 'Quick Sort';
}

const generateRandomArray = (size: number): number[] => {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1) + MIN_VALUE)
  );
};

// --- MERGE SORT TREE COMPONENTS & HELPERS ---
const buildMergeSortTree = (start: number, end: number, id: string = '0'): MergeSortNode => {
    if (start >= end) return { id, start, end, children: [] };
    const middle = Math.floor((start + end) / 2);
    return { id, start, end, children: [ buildMergeSortTree(start, middle, id + '.0'), buildMergeSortTree(middle + 1, end, id + '.1') ]};
};
type NodeStatus = 'inactive' | 'calling' | 'merging' | 'returned';
interface MergeSortNodeState { array: number[]; highlights: { [key: number]: string }; status: NodeStatus; }
const MergeSortNodeComponent: React.FC<{ node: MergeSortNode; nodeStates: Map<string, MergeSortNodeState> }> = ({ node, nodeStates }) => {
    const state = nodeStates.get(node.id);
    if (!state) return null;
    let borderColor = 'border-slate-700', bgColor = 'bg-slate-800/50', conqueringClass = '';
    if (state.status === 'calling') { borderColor = 'border-yellow-400'; bgColor = 'bg-yellow-900/50'; }
    if (state.status === 'merging') { borderColor = 'border-sky-400'; bgColor = 'bg-sky-900/50'; }
    if (state.status === 'returned') { 
        borderColor = 'border-green-400'; 
        bgColor = 'bg-green-900/50';
        conqueringClass = 'animate-pulse-conquer';
    }
    return (
        <div className="flex flex-col items-center flex-shrink-0">
            <div className={`p-2 rounded-lg border-2 ${borderColor} ${bgColor} transition-all duration-300 shadow-md ${conqueringClass}`}>
                <div className="flex justify-center items-center gap-1 flex-wrap min-h-[40px]">
                    {state.array.map((value, idx) => {
                         const highlightType = state.highlights[idx];
                         let blockBg = 'bg-slate-700/50';
                         if (highlightType === 'compare') blockBg = 'bg-yellow-500';
                         if (highlightType === 'write') blockBg = 'bg-sky-500';
                         if (state.status === 'returned') blockBg = 'bg-green-600';
                         return <div key={idx} className={`w-8 h-8 flex items-center justify-center font-bold text-sm rounded ${blockBg} transition-colors`}>{value}</div>;
                    })}
                </div>
            </div>
            {node.children.length > 0 && (
                 <div className="mt-6 flex space-x-4 relative">
                    <div className="absolute left-1/2 -top-6 w-px h-6 bg-slate-600" />
                    <div className="absolute left-0 right-0 top-[-24px] h-px bg-slate-600" />
                    {node.children.map(child => (
                        <div key={child.id} className="relative">
                           <div className="absolute left-1/2 -top-6 w-px h-6 bg-slate-600" />
                           <MergeSortNodeComponent node={child} nodeStates={nodeStates} />
                        </div>
                    ))}
                 </div>
            )}
        </div>
    );
}

// --- QUICK SORT TREE COMPONENTS & HELPERS ---
type QuickSortNodeStatus = 'inactive' | 'calling' | 'partitioning' | 'waiting' | 'conquering' | 'sorted';
interface QuickSortNodeState { array: number[]; highlights: { [key: number]: string }; status: QuickSortNodeStatus; pivotIndex: number | null; pointers: { i: number | null; j: number | null }; }
const QuickSortNodeComponent: React.FC<{ node: QuickSortNode; nodeStates: Map<string, QuickSortNodeState> }> = ({ node, nodeStates }) => {
    const state = nodeStates.get(node.id);
    if (!state) return null;
    let borderColor = 'border-slate-700', bgColor = 'bg-slate-800/50', conqueringClass = '';

    if (state.status === 'conquering') {
        borderColor = 'border-green-400';
        bgColor = 'bg-green-900/50';
        conqueringClass = 'animate-pulse-conquer';
    } else if (state.status === 'calling' || state.status === 'partitioning') { 
        borderColor = 'border-yellow-400';
        bgColor = 'bg-yellow-900/50';
    } else if (state.status === 'waiting' || state.status === 'sorted') {
        borderColor = 'border-green-400';
        bgColor = 'bg-green-900/50';
    }


    return (
        <div className="flex flex-col items-center flex-shrink-0">
            <div className={`p-2 rounded-lg border-2 ${borderColor} ${bgColor} transition-all duration-300 shadow-md ${conqueringClass}`}>
                <div className="flex justify-center items-center gap-1 flex-wrap min-h-[40px] relative pt-6">
                    {state.array.map((value, idx) => {
                         const highlightType = state.highlights[idx];
                         let blockBg = 'bg-slate-700/50';
                         
                         if (state.status === 'conquering' || state.status === 'sorted') {
                            blockBg = 'bg-green-600';
                         } else if (state.status === 'waiting') {
                            if (idx === state.pivotIndex) blockBg = 'bg-green-600';
                            else if (idx < state.pivotIndex!) blockBg = 'bg-sky-800';
                            else blockBg = 'bg-orange-800';
                         } else {
                             if (idx === state.pivotIndex) blockBg = 'bg-purple-600';
                             else if (highlightType === 'compare') blockBg = 'bg-yellow-500';
                             else if (highlightType === 'swap') blockBg = 'bg-red-500';
                         }

                         return (
                            <div key={idx} className="relative">
                                <div className={`w-8 h-8 flex items-center justify-center font-bold text-sm rounded ${blockBg} transition-colors duration-300`}>{value}</div>
                                {idx === state.pointers.i && <div className="absolute -bottom-6 text-center text-sky-400 font-mono text-xs">↑<br/>i</div>}
                                {idx === state.pointers.j && <div className="absolute -bottom-6 text-center text-yellow-400 font-mono text-xs">↑<br/>j</div>}
                            </div>
                         );
                    })}
                </div>
            </div>
             {node.children.length > 0 && (
                 <div className="mt-12 flex justify-center space-x-4 relative">
                    <div className="absolute left-1/2 -top-12 w-px h-12 bg-slate-600" />
                    {node.children.length > 1 && <div className="absolute left-1/4 right-1/4 top-[-48px] h-px bg-slate-600" />}
                    {node.children.map((child, index) => (
                        <div key={child.id} className="relative">
                           <div className={`absolute ${node.children.length === 1 ? 'left-1/2' : (index === 0 ? 'left-1/4' : 'right-1/4')} -top-12 w-px h-12 bg-slate-600`} />
                           <QuickSortNodeComponent node={child} nodeStates={nodeStates} />
                        </div>
                    ))}
                 </div>
            )}
        </div>
    );
}


const SortingVisualizer: React.FC<SortingVisualizerProps> = ({ algorithmFn, title }) => {
  const [initialArray, setInitialArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState(title === 'Selection Sort' ? DEFAULT_BLOCK_ARRAY_SIZE : DEFAULT_ARRAY_SIZE);
  const [animations, setAnimations] = useState<SortingAnimationStep[]>([]);
  const [animationIndex, setAnimationIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [pivotStrategy, setPivotStrategy] = useState<PivotStrategy>('last');
  const [copied, setCopied] = useState(false);
  const [customArrayInput, setCustomArrayInput] = useState('');

  const algoId = useMemo(() => {
    if (title === 'Selection Sort') return 'selectionSort';
    if (title === 'Merge Sort') return 'mergeSort';
    return 'quickSort';
  }, [title]);
  
  const isTreeAlgo = algoId === 'mergeSort' || algoId === 'quickSort';

  const resetArray = useCallback((newSize?: number) => {
    setIsPlaying(false);
    const sizeToUse = newSize || arraySize;
    const newArray = generateRandomArray(sizeToUse);
    setInitialArray(newArray.slice());
    setAnimationIndex(0);
    setCustomArrayInput(newArray.join(', '));
  }, [arraySize]);
  
  useEffect(() => { resetArray(); }, []);
  
  useEffect(() => {
    if (initialArray.length > 0) {
      let newAnimations;
      if (algoId === 'quickSort') {
        newAnimations = getQuickSortAnimations(initialArray.slice(), pivotStrategy);
      } else if (algoId === 'mergeSort') {
        newAnimations = getMergeSortAnimations(initialArray.slice());
      } else if (algoId === 'selectionSort') {
        newAnimations = getSelectionSortAnimations(initialArray.slice());
      }
      else {
        newAnimations = algorithmFn(initialArray.slice());
      }
      setAnimations(newAnimations);
      setAnimationIndex(0);
    }
  }, [initialArray, pivotStrategy, algoId, algorithmFn]);

  useEffect(() => {
    if (isPlaying && animationIndex < animations.length) {
      const timer = setTimeout(() => { setAnimationIndex(prev => prev + 1); }, MAX_SPEED - speed);
      return () => clearTimeout(timer);
    } else if (isPlaying && animationIndex >= animations.length) { setIsPlaying(false); }
  }, [animationIndex, isPlaying, animations.length, speed]);
  
  const visualState = useMemo(() => {
    if (!initialArray.length || !animations.length) return null;

    if (algoId === 'selectionSort') {
        const state = {
            displayMode: 'selectionSortBlocks' as const,
            array: initialArray.slice(),
            sortedIndices: new Set<number>(),
            iPointer: null as number | null,
            jPointer: null as number | null,
            minPointer: null as number | null,
            justUpdatedMin: null as number | null,
            comparingIndices: [] as number[],
            swappingIndices: [] as number[],
            explanation: 'Enter a custom array or press Play to start.',
            comparisonCount: 0,
            swapCount: 0,
            highlightedLine: null as number | null,
            isFinished: false,
        };

        const generateExplanation = (step: SortingAnimationStep, arr: number[]): string => {
            const [type, ...data] = step;
            switch(type) {
                case 'ss-outer-loop': return `Starting outer loop. Sorted partition ends at index ${Number(data[0])-1}.`;
                case 'ss-min-init': return `Assume element ${arr[data[0] as number]} at index ${data[0]} is the minimum.`;
                case 'ss-inner-compare': return `Comparing element ${arr[data[0] as number]} (at j) with current minimum ${arr[data[1] as number]} (at min).`;
                case 'ss-min-update': return `Found a new minimum: ${arr[data[0] as number]}. Updating min pointer.`;
                case 'ss-swap': return `Swapping minimum element ${arr[data[1] as number]} with element ${arr[data[0] as number]} at the start of the unsorted partition.`;
                case 'ss-sorted': return `Element ${arr[data[0] as number]} is now in its final sorted position.`;
                case 'finish': return 'Array is sorted! Complexity: O(n²).';
                default: return state.explanation;
            }
        };
        
        const finalIndex = Math.min(animationIndex, animations.length - 1);

        for (let i = 0; i <= finalIndex; i++) {
            const step = animations[i]; if (!step) continue;
            const [type, ...data] = step;
            
            state.justUpdatedMin = null;
            state.comparingIndices = [];
            state.swappingIndices = [];

            switch (type) {
                case 'ss-outer-loop': state.iPointer = data[0] as number; state.jPointer = null; break;
                case 'ss-min-init': state.minPointer = data[0] as number; break;
                case 'ss-inner-compare': 
                    state.jPointer = data[0] as number;
                    state.minPointer = data[1] as number;
                    state.comparingIndices = [data[0] as number, data[1] as number];
                    if(i > 0 && animations[i-1][0] !== 'ss-inner-compare') state.comparisonCount = 0; // Reset for each outer loop
                    state.comparisonCount++;
                    break;
                case 'ss-min-update': 
                    state.minPointer = data[0] as number; 
                    state.justUpdatedMin = data[0] as number;
                    break;
                case 'ss-swap': {
                    const [idx1, idx2] = data;
                    [state.array[idx1 as number], state.array[idx2 as number]] = [state.array[idx2 as number], state.array[idx1 as number]];
                    state.swappingIndices = [idx1 as number, idx2 as number];
                    state.swapCount++;
                    break;
                }
                case 'ss-sorted': state.sortedIndices.add(data[0] as number); break;
                case 'finish': state.isFinished = true; break;
            }

            if (i === finalIndex) {
                state.highlightedLine = step[step.length - 1] as number;
                state.explanation = generateExplanation(step, state.array);
            }
        }
        
        if (state.isFinished) {
           state.sortedIndices = new Set(Array.from({ length: state.array.length }, (_, i) => i));
           state.iPointer = null; state.jPointer = null; state.minPointer = null;
        }

        return state;
    }

    if (algoId === 'mergeSort') {
        const tree = buildMergeSortTree(0, initialArray.length - 1);
        const nodeStates = new Map<string, MergeSortNodeState>();
        let currentLine: number | null = null;
        let comparisonCount = 0;
        let mergeWriteCount = 0;

        const populateInitialStates = (node: MergeSortNode) => {
            nodeStates.set(node.id, { array: [], highlights: {}, status: 'inactive' });
            node.children.forEach(populateInitialStates);
        };
        populateInitialStates(tree);

        for (let i = 0; i <= animationIndex; i++) {
            const step = animations[i]; if (!step || !step[0].startsWith('ms-')) continue;
            const [type, nodeId, ...data] = step; if (typeof nodeId !== 'string') continue;
            const state = nodeStates.get(nodeId); if (!state) continue;
            if (type === 'ms-compare') comparisonCount++;
            if (type === 'ms-write') mergeWriteCount++;

            switch(type) {
                case 'ms-call': {
                    const [start, end] = data as [number, number, number];
                    if (start !== undefined && end !== undefined) state.array = initialArray.slice(start, end + 1);
                    break;
                }
                case 'ms-return': state.status = 'returned'; break;
            }

            if (i === animationIndex) {
                 currentLine = step[step.length-1] as number;
                 switch(type) {
                    case 'ms-return': state.status = 'returned'; break;
                    case 'ms-compare':
                    case 'ms-write': state.status = 'merging'; break;
                 }
            }
        }
        
        const currentStep = animations[animationIndex];
        if (currentStep && currentStep[0].startsWith('ms-')) {
            const [type, nodeId, ...data] = currentStep;
             if (typeof nodeId === 'string') {
                const state = nodeStates.get(nodeId);
                if (state) {
                    state.highlights = {};
                    if(type === 'ms-compare') { state.highlights[data[0] as number] = 'compare'; state.highlights[data[1] as number] = 'compare'; }
                    if(type === 'ms-write') { state.highlights[data[0] as number] = 'write'; }
                }
             }
        }
        
        if (animationIndex >= animations.length) {
            nodeStates.get('0')!.array = [...initialArray].sort((a,b) => a-b);
            nodeStates.get('0')!.status = 'returned';
        }

        return { displayMode: 'mergeTree' as const, tree, nodeStates, highlightedLine: currentLine, comparisonCount, mergeWriteCount };
    }
    
    if (algoId === 'quickSort') {
        const nodes = new Map<string, QuickSortNode>();
        const nodeStates = new Map<string, QuickSortNodeState>();
        let rootNode: QuickSortNode | null = null;
        let currentLine: number | null = null;
        let comparisonCount = 0;
        let swapCount = 0;
        let explanation = 'Select a pivot strategy and press Play to start.';
        
        const generateExplanation = (step: SortingAnimationStep): string => {
            const [type, ...data] = step;
            switch(type) {
                case 'qs-call': return `Recursive call for subarray from index ${data[2]} to ${data[3]}.`;
                case 'qs-pivot-select': return `Selected pivot is ${data[2]} at index ${data[1]} using '${pivotStrategy}' strategy.`;
                case 'qs-pivot': return `Partitioning subarray around pivot.`;
                case 'qs-pointers': {
                    const i = data[2] as number | null;
                    const j = data[3] as number | null;
                    let iText = i === null ? 'start' : (i < (data[4] as number) ? 'start' : i);
                    return `Moving pointers. i is at ${iText}, j is at ${j}.`;
                }
                case 'qs-compare': return `Comparing element at index ${data[2]} with pivot.`;
                case 'qs-swap': {
                    return data[1] === (data[2] as any) ? `Moving pivot to its final place.` : `Swapping elements at indices ${data[2]} and ${data[3]}.`
                }
                case 'qs-partition-complete': return `Partition complete. Pivot is now at its final sorted position: ${data[2]}.`;
                case 'qs-sorted': return `Subarray is sorted. Returning from recursive call.`;
                default: return explanation;
            }
        };

        const tempArray = initialArray.slice();

        for (let i = 0; i < animations.length && i <= animationIndex; i++) {
            const step = animations[i]; if (!step) continue;
            
            if (step[0] === 'qs-compare') comparisonCount++;
            if (step[0] === 'qs-swap') swapCount++;

            if (step[0] === 'qs-call') {
                const [, nodeId, parentId, start, end] = step;
                const newNode: QuickSortNode = { id: nodeId, parentId, start, end, children: [] };
                nodes.set(nodeId, newNode);
                if (parentId && nodes.has(parentId)) {
                    nodes.get(parentId)!.children.push(newNode);
                } else {
                    rootNode = newNode;
                }
            } else if (step[0] === 'qs-swap') {
                const [, , idx1, idx2] = step;
                [tempArray[idx1 as number], tempArray[idx2 as number]] = [tempArray[idx2 as number], tempArray[idx1 as number]];
            }
        }
        
        nodes.forEach(node => {
            nodeStates.set(node.id, {
                array: tempArray.slice(node.start, node.end + 1),
                highlights: {}, status: 'inactive',
                pivotIndex: null,
                pointers: { i: null, j: null }
            });
        });
        
        for (let i = 0; i < animations.length && i <= animationIndex; i++) {
             const step = animations[i]; if (!step) continue;
             if (!step[0].startsWith('qs-')) continue;
             const nodeId = step[1]; if (typeof nodeId !== 'string') continue;
             const state = nodeStates.get(nodeId); if (!state) continue;
             switch(step[0]) {
                case 'qs-call': state.status = 'calling'; break;
                case 'qs-pivot': state.status = 'partitioning'; break;
                case 'qs-partition-complete': {
                    state.status = 'waiting'; 
                    const [, , pivotFinalIdx] = step;
                    const node = nodes.get(nodeId);
                    if (node) { state.pivotIndex = (pivotFinalIdx as number) - node.start; }
                    break;
                }
                case 'qs-sorted': state.status = 'sorted'; break;
             }
        }

        const currentStep = animations[animationIndex];
        if (currentStep) {
            currentLine = currentStep[currentStep.length - 1] as number;
            explanation = generateExplanation(currentStep);
            if (currentStep[0].startsWith('qs-')) {
                const nodeId = currentStep[1];
                if (typeof nodeId === 'string') {
                    if (currentStep[0] === 'qs-sorted') {
                        const state = nodeStates.get(nodeId); if (state) state.status = 'conquering';
                    } else {
                        const state = nodeStates.get(nodeId); const node = nodes.get(nodeId);
                        if (state && node) {
                             switch(currentStep[0]) {
                                case 'qs-pivot':
                                case 'qs-pivot-select': { const [, , pivotIdx] = currentStep; state.pivotIndex = (pivotIdx as number) - node.start; break; }
                                case 'qs-pointers': { const [, , i, j] = currentStep; state.pointers = { i: i === null ? null : (i as number) - node.start, j: j === null ? null : (j as number) - node.start }; break; }
                                case 'qs-compare': { const [, , idx1, idx2] = currentStep; state.highlights[(idx1 as number) - node.start] = 'compare'; state.highlights[(idx2 as number) - node.start] = 'compare'; break; }
                                case 'qs-swap': { const [, , idx1, idx2] = currentStep; state.highlights[(idx1 as number) - node.start] = 'swap'; state.highlights[(idx2 as number) - node.start] = 'swap'; break; }
                            }
                        }
                    }
                }
            }
        }
        if (animationIndex >= animations.length && rootNode) {
            nodes.forEach(node => { const state = nodeStates.get(node.id); if (state) state.status = 'sorted'; });
        }
         return { displayMode: 'quickTree' as const, tree: rootNode, nodeStates, highlightedLine: currentLine, comparisonCount, swapCount, explanation };
    }

    return null; // Should not be reached if algoId is handled
  }, [animationIndex, animations, initialArray, algoId, pivotStrategy]);

  useEffect(() => { if (visualState) setHighlightedLine(visualState.highlightedLine); }, [visualState]);

  const handlePlayPause = () => { if (animationIndex >= animations.length && animations.length > 0) { setAnimationIndex(0); setIsPlaying(true); } else { setIsPlaying(!isPlaying); } };
  const handleNextStep = () => { setIsPlaying(false); if (animationIndex < animations.length) setAnimationIndex(prev => prev + 1); };
  const handlePreviousStep = () => { setIsPlaying(false); if (animationIndex > 0) setAnimationIndex(prev => prev - 1); };
  const handleRestart = () => { setIsPlaying(false); setAnimationIndex(0); };
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const newSize = Number(e.target.value);
    setArraySize(newSize);
    resetArray(newSize);
  }
  
  const handleExport = () => {
      if (algoId !== 'quickSort' || !animations.length) return;
      
      const totalComparisons = animations.filter(s => s[0] === 'qs-compare').length;
      const totalSwaps = animations.filter(s => s[0] === 'qs-swap').length;
      const sortedArray = [...initialArray].sort((a,b)=>a-b);

      const resultText = `Algorithm: Quick Sort\n` +
                         `Pivot Strategy: ${pivotStrategy}\n` +
                         `Initial Array: [${initialArray.join(', ')}]\n` +
                         `Sorted Array: [${sortedArray.join(', ')}]\n\n` +
                         `Performance:\n` +
                         `  - Comparisons: ${totalComparisons}\n` +
                         `  - Swaps: ${totalSwaps}`;

      navigator.clipboard.writeText(resultText).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      });
  };

  const handleLoadCustomArray = () => {
    const parsedArray = customArrayInput
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n >= MIN_VALUE && n <= MAX_VALUE);

    if (parsedArray.length > 0) {
      setIsPlaying(false);
      setInitialArray(parsedArray);
      setAnimationIndex(0);
      setArraySize(parsedArray.length);
    } else {
      alert(`Please enter a valid comma-separated list of numbers between ${MIN_VALUE} and ${MAX_VALUE}.`);
    }
  };

  const Pointer: React.FC<{ label: string; color: string; visible: boolean, isPulsing?: boolean }> = ({ label, color, visible, isPulsing = false }) => {
    if (!visible) return null;
    return (
        <div className={`absolute -bottom-8 w-full text-center font-mono text-sm transition-opacity duration-300 ${color} ${isPulsing ? 'animate-pulse-min-update' : ''}`}>
            ↑<br/>{label}
        </div>
    );
};

  const renderSelectionSortBlocks = (state: NonNullable<typeof visualState> & { displayMode: 'selectionSortBlocks' }) => {
      const { array, sortedIndices, iPointer, jPointer, minPointer, comparingIndices, swappingIndices, justUpdatedMin, isFinished } = state;
      const scalingFactor = 250, minSize = 28, maxSize = 96;
      const itemSize = Math.max(minSize, Math.min(maxSize, scalingFactor / Math.sqrt(arraySize)));
      const fontSize = Math.max(12, itemSize * 0.4);
      return array.map((value, idx) => {
          const isSorted = sortedIndices.has(idx);
          const isComparing = comparingIndices.includes(idx);
          const isSwapping = swappingIndices.includes(idx);

          let bgColor = 'bg-slate-700/50', textColor = 'text-slate-100', borderColor = 'border-slate-700', zIndex = 0;
          if (isSorted) { bgColor = 'bg-green-600'; borderColor = 'border-green-500'; }
          else if (isSwapping) { zIndex = 10; bgColor = 'bg-red-500'; borderColor = 'border-red-400'; }
          else if (isComparing) { zIndex = 10; bgColor = 'bg-yellow-500'; borderColor = 'border-yellow-400'; }
          
          if (isSorted || isComparing || isSwapping) textColor = 'text-slate-900';
          
          return (
              <div key={idx} className="relative flex-shrink-0" style={{ width: `${itemSize}px`, height: `${itemSize}px`, fontSize: `${fontSize}px`, zIndex }}>
                  <div className={`w-full h-full flex items-center justify-center font-bold rounded-md transition-all duration-300 border ${bgColor} ${textColor} ${borderColor} ${isFinished ? 'animate-pulse-sorted' : ''}`}>
                    {value}
                  </div>
                   <Pointer label="i" color="text-orange-400" visible={iPointer === idx} />
                   <Pointer label="j" color="text-yellow-400" visible={jPointer === idx} />
                   <Pointer label="min" color="text-sky-400" visible={minPointer === idx} isPulsing={justUpdatedMin === idx} />
              </div>
          );
      });
  }

  const { complexity, code } = ALGORITHMS[algoId];
  const activeLegend = useMemo(() => {
    const legends = {
        selectionSort: { 
            sorted: { color: 'bg-green-600', label: 'Sorted' },
            compare: { color: 'bg-yellow-500', label: 'Comparing' },
            swap: { color: 'bg-red-500', label: 'Swapping' },
            i_pointer: { color: 'text-orange-400', label: 'i Pointer', type: 'text' },
            j_pointer: { color: 'text-yellow-400', label: 'j Pointer', type: 'text' },
            min_pointer: { color: 'text-sky-400', label: 'min Pointer', type: 'text' },
        },
        quickSort: { 
            partitioning: { color: 'border-yellow-400', label: 'Partitioning Call', type: 'border' }, 
            pivot: { color: 'bg-purple-600', label: 'Pivot' }, 
            lessThanPivot: { color: 'bg-sky-800', label: '< Pivot' },
            greaterThanPivot: { color: 'bg-orange-800', label: '> Pivot' },
            partitionSorted: { color: 'bg-green-600', label: 'Partition Complete' },
            swap: { color: 'bg-red-500', label: 'Swapping' },
            conquering: { color: 'border-green-400', label: 'Sorted (Returned)', type: 'border-pulse'},
        },
        mergeSort: { calling: { color: 'border-yellow-400', label: 'Divide', type: 'border' }, merging: { color: 'border-sky-400', label: 'Merge', type: 'border' }, returned: { color: 'border-green-400', label: 'Conquer (Sorted)', type: 'border-pulse' }, compare: { color: 'bg-yellow-500', label: 'Comparing' }, write: { color: 'bg-sky-500', label: 'Writing to Parent' } }
    };
    return legends[algoId] || {};
  }, [algoId]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-slate-800/50 p-4 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                      <button onClick={handlePreviousStep} disabled={isPlaying || animationIndex === 0} className="p-2 bg-slate-600 text-white rounded-full hover:bg-slate-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"><PrevStepIcon className="h-6 w-6" /></button>
                      <button onClick={handlePlayPause} className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600">{isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}</button>
                      <button onClick={handleNextStep} disabled={isPlaying || animationIndex >= animations.length} className="p-2 bg-slate-600 text-white rounded-full hover:bg-slate-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"><NextStepIcon className="h-6 w-6" /></button>
                  </div>
                  <button onClick={handleRestart} disabled={isPlaying} className="p-2 bg-slate-600 text-white rounded-full hover:bg-slate-700 disabled:opacity-50"><ReplayIcon className="h-6 w-6" /></button>
                  <button onClick={() => resetArray()} className="p-2 bg-slate-600 text-white rounded-full hover:bg-slate-700"><ResetIcon className="h-6 w-6" /></button>
                </div>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-end gap-4">
                  {algoId === 'quickSort' && (
                    <div className="w-full sm:w-48">
                        <label htmlFor="pivot-strategy" className="block text-sm font-medium text-slate-300 mb-1">Pivot Strategy</label>
                        <select id="pivot-strategy" value={pivotStrategy} onChange={(e) => setPivotStrategy(e.target.value as PivotStrategy)} disabled={isPlaying} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500 text-white">
                            <option value="last">Last Element</option>
                            <option value="first">First Element</option>
                            <option value="random">Random</option>
                            <option value="median">Median of Three</option>
                        </select>
                    </div>
                  )}
                   <div className="w-full sm:w-48">
                    <Slider label="Array Size" min={4} max={isTreeAlgo ? 8 : 30} value={arraySize} onChange={handleSizeChange} />
                  </div>
                  <div className="w-full sm:w-48">
                    <Slider label="Speed" min={MIN_SPEED} max={MAX_SPEED} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
                  </div>
                </div>
            </div>
             { (algoId === 'quickSort' || algoId === 'selectionSort') && (
                <div className="h-24 bg-slate-900/80 p-3 rounded-md shadow-lg border border-slate-700 mb-2">
                    <h4 className="text-md font-semibold mb-1 text-sky-400">Explanation</h4>
                    <p className="text-slate-200 text-sm h-12 transition-opacity duration-300" key={visualState?.displayMode === 'quickTree' ? visualState.explanation : visualState?.displayMode === 'selectionSortBlocks' ? visualState.explanation : ''}>
                        {visualState?.displayMode === 'quickTree' ? visualState.explanation : visualState?.displayMode === 'selectionSortBlocks' ? visualState.explanation : 'Loading...'}
                    </p>
                </div>
             )}
            { (algoId === 'mergeSort' || algoId === 'selectionSort') && (
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input type="text" value={customArrayInput} onChange={(e) => setCustomArrayInput(e.target.value)} placeholder="e.g., 8, 3, 10, 1, 6" disabled={isPlaying} className="flex-grow bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500 text-white" />
                <button onClick={handleLoadCustomArray} disabled={isPlaying} className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 disabled:bg-sky-800 disabled:cursor-not-allowed">Load Array</button>
              </div>
            )}
            <div className="h-[55vh] xl:h-[60vh] bg-slate-900 rounded-md p-4 flex justify-center items-center overflow-auto">
                {visualState?.displayMode === 'selectionSortBlocks' && (
                    <div className="flex justify-center items-center gap-2 flex-wrap">{renderSelectionSortBlocks(visualState)}</div>
                )}
                {visualState?.displayMode === 'mergeTree' && visualState.tree && <MergeSortNodeComponent node={visualState.tree} nodeStates={visualState.nodeStates} />}
                {visualState?.displayMode === 'quickTree' && visualState.tree && <QuickSortNodeComponent node={visualState.tree} nodeStates={visualState.nodeStates} />}
            </div>
        </div>
        <div className="xl:col-span-2 flex flex-col gap-6">
            <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-sky-400 mb-2">{title}</h2>
                <p className="text-slate-300 text-sm mb-4">{ALGORITHMS[algoId].description}</p>
                 <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Legend</h3>
                     <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                        {Object.values(activeLegend).map((item: any) => (
                           <div key={item.label} className="flex items-center gap-2">
                            {item.type === 'border' ? <div className={`w-4 h-4 rounded-sm border-2 ${item.color}`}></div> : 
                             item.type === 'border-pulse' ? <div className={`w-4 h-4 rounded-sm border-2 ${item.color} animate-pulse-conquer`}></div> :
                             item.type === 'text' ? <span className={`font-bold ${item.color}`}>↑</span> :
                             <div className={`w-4 h-4 rounded-sm ${item.color}`}></div>
                            }
                            <span className="text-slate-300">{item.label}</span>
                           </div>
                        ))}
                    </div>
                 </div>
                 { algoId !== 'mergeSort' && (
                     <div className="grid grid-cols-2 gap-2 text-center bg-slate-700/50 p-3 rounded-md mb-4">
                        <div>
                            <span className="text-sm text-slate-400">Comparisons</span>
                            <p className="text-2xl font-mono font-bold text-sky-400">
                                {visualState?.displayMode === 'quickTree' ? visualState.comparisonCount : visualState?.displayMode === 'selectionSortBlocks' ? visualState.comparisonCount : 0}
                            </p>
                        </div>
                         <div>
                            <span className="text-sm text-slate-400">Swaps</span>
                            <p className="text-2xl font-mono font-bold text-sky-400">
                                {visualState?.displayMode === 'quickTree' ? visualState.swapCount : visualState?.displayMode === 'selectionSortBlocks' ? visualState.swapCount : 0}
                            </p>
                        </div>
                     </div>
                 )}
                 { algoId === 'mergeSort' && (
                     <div className="grid grid-cols-2 gap-2 text-center bg-slate-700/50 p-3 rounded-md mb-4">
                        <div>
                            <span className="text-sm text-slate-400">Comparisons</span>
                            <p className="text-2xl font-mono font-bold text-sky-400">
                                {visualState?.displayMode === 'mergeTree' ? visualState.comparisonCount : 0}
                            </p>
                        </div>
                         <div>
                            <span className="text-sm text-slate-400">Merge Writes</span>
                            <p className="text-2xl font-mono font-bold text-sky-400">
                               {visualState?.displayMode === 'mergeTree' ? visualState.mergeWriteCount : 0}
                            </p>
                        </div>
                     </div>
                 )}
                 {algoId === 'quickSort' && (
                    <button onClick={handleExport} className="w-full px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors">
                        {copied ? 'Copied to Clipboard!' : 'Export Performance Stats'}
                    </button>
                 )}
            </div>
             <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg">
                 <h3 className="text-xl font-semibold text-slate-200 mb-3 px-2">Complexity & Code</h3>
                <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                            <tr>
                                <th scope="col" className="px-4 py-2">Case</th>
                                <th scope="col" className="px-4 py-2">Time</th>
                                <th scope="col" className="px-4 py-2">Space</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-700"><td className="px-4 py-2 font-medium text-green-400">Best</td><td className="px-4 py-2 font-mono">{complexity.best.time}</td><td className="px-4 py-2 font-mono">{complexity.best.space}</td></tr>
                            <tr className="border-b border-slate-700"><td className="px-4 py-2 font-medium text-yellow-400">Average</td><td className="px-4 py-2 font-mono">{complexity.average.time}</td><td className="px-4 py-2 font-mono">{complexity.average.space}</td></tr>
                            <tr><td className="px-4 py-2 font-medium text-red-400">Worst</td><td className="px-4 py-2 font-mono">{complexity.worst.time}</td><td className="px-4 py-2 font-mono">{complexity.worst.space}</td></tr>
                        </tbody>
                    </table>
                </div>
                <CodeDisplay code={code} highlightedLine={highlightedLine} />
            </div>
        </div>
    </div>
  );
};

// FIX: Add default export to make the component available for import.
export default SortingVisualizer;
