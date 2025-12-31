import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GraphAnimationStep, GraphData, GraphType } from '../../types';
import { PlayIcon, PauseIcon, ResetIcon, PrevStepIcon, NextStepIcon } from '../ui/Icon';
import Slider from '../ui/Slider';
import { ALGORITHMS } from '../../constants';
import CodeDisplay from '../ui/CodeDisplay';
import { getGraphTraversalAnimations } from '../../algorithms/graphTraversal';
import { generateGraph } from '../../algorithms/graphGenerators';

const MAX_SPEED = 1000;
const MIN_SPEED = 50;
type AlgoType = 'dfs' | 'bfs';

const useVisualState = (animations: GraphAnimationStep[], animationIndex: number, algoId: AlgoType, startNode: string) => {
    return useMemo(() => {
        const state = {
            visitedNodes: new Set<string>(), finishedNodes: new Set<string>(),
            exploringEdge: null as { source: string; target: string } | null,
            queue: [] as string[], parentEdges: new Map<string, string>(),
            highlightedLine: null as number | null, currentNode: null as string | null,
            explanation: 'Select a starting node and press Play.',
            nodesVisitedCount: 0,
            edgesProcessedCount: 0
        };
        if (!animations.length) return state;

        const generateExplanation = (step: GraphAnimationStep): string => {
            const [type, ...data] = step;
            switch(type) {
                case 'visit': return `Visiting and marking node ${data[0]}.`;
                case 'explore': return `From node ${data[0]}, exploring neighbor ${data[1]}.`;
                case 'queue': return `Node ${data[0]} is unvisited, adding to the queue.`;
                case 'dequeue': return `Processing node ${data[0]} from the front of the queue.`;
                case 'finish': return `Finished exploring all neighbors of node ${data[0]}.`;
                case 'parent': return `Setting node ${data[0]} as the parent of ${data[1]} in the discovery path.`;
                default: return '';
            }
        };
        
        const finalIndex = Math.min(animationIndex, animations.length - 1);

        if (animationIndex >= animations.length) {
            state.explanation = 'Simulation complete. Press Reset to start over.';
            animations.forEach(step => {
                const [type, ...data] = step;
                if (type === 'visit' && !state.visitedNodes.has(data[0] as string)) { state.visitedNodes.add(data[0] as string); state.nodesVisitedCount++; }
                if (type === 'explore') state.edgesProcessedCount++;
                if (type === 'finish') state.finishedNodes.add(data[0] as string);
                if (type === 'parent') state.parentEdges.set(data[1] as string, data[0] as string);
            });
            return state;
        }

        for (let i = 0; i <= finalIndex; i++) {
            const step = animations[i];
            if (!step) continue;
            const [type, ...data] = step;
            state.highlightedLine = data[data.length - 1] as number;

            switch(type) {
                case 'visit': if (!state.visitedNodes.has(data[0] as string)) { state.visitedNodes.add(data[0] as string); state.nodesVisitedCount++; } if(algoId === 'dfs') state.currentNode = data[0] as string; break;
                case 'explore': state.exploringEdge = { source: data[0] as string, target: data[1] as string }; state.edgesProcessedCount++; break;
                case 'queue': state.queue.push(data[0] as string); break;
                case 'dequeue': if(state.queue.length > 0) state.queue.shift(); state.currentNode = data[0] as string; break;
                case 'finish': state.finishedNodes.add(data[0] as string); break;
                case 'parent': state.parentEdges.set(data[1] as string, data[0] as string); break;
            }
        }

        const currentStep = animations[finalIndex];
        if (currentStep) state.explanation = generateExplanation(currentStep);
        if (finalIndex === 0 && animations.length > 0) state.explanation = `Starting ${algoId.toUpperCase()} from node ${startNode}.`;

        return state;
    }, [animationIndex, animations, algoId, startNode]);
};

const PerformanceChart = () => (
    <div className="relative h-40 bg-slate-900/50 p-4 rounded-md">
        <svg width="100%" height="100%" viewBox="0 0 200 100">
            <path d="M 10 90 Q 50 80, 100 50 T 190 10" stroke="#0ea5e9" fill="none" strokeWidth="2" />
            <text x="100" y="98" textAnchor="middle" fill="#94a3b8" fontSize="8">Nodes + Edges (V+E)</text>
            <text x="10" y="50" transform="rotate(-90, 10, 50)" textAnchor="middle" fill="#94a3b8" fontSize="8">Time</text>
        </svg>
        <div className="absolute top-2 right-3 text-xs text-slate-400">Conceptual O(V+E) Growth</div>
    </div>
);

const ComparisonTable = () => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                <tr>
                    <th className="px-4 py-2">Feature</th>
                    <th className="px-4 py-2">DFS</th>
                    <th className="px-4 py-2">BFS</th>
                </tr>
            </thead>
            <tbody>
                <tr className="border-b border-slate-700">
                    <td className="px-4 py-2 font-semibold">Data Structure</td>
                    <td className="px-4 py-2 font-mono">Stack (LIFO)</td>
                    <td className="px-4 py-2 font-mono">Queue (FIFO)</td>
                </tr>
                <tr className="border-b border-slate-700">
                    <td className="px-4 py-2 font-semibold">Visit Order</td>
                    <td className="px-4 py-2">Goes deep down one path</td>
                    <td className="px-4 py-2">Explores level by level</td>
                </tr>
                <tr className="border-b border-slate-700">
                    <td className="px-4 py-2 font-semibold">Shortest Path</td>
                    <td className="px-4 py-2">Not guaranteed</td>
                    <td className="px-4 py-2">Guaranteed (unweighted)</td>
                </tr>
                <tr>
                    <td className="px-4 py-2 font-semibold">Memory Usage</td>
                    <td className="px-4 py-2">O(height of graph)</td>
                    <td className="px-4 py-2">O(width of graph)</td>
                </tr>
            </tbody>
        </table>
    </div>
);


const GraphTraversalVisualizer: React.FC = () => {
    const [activeAlgorithm, setActiveAlgorithm] = useState<AlgoType>('dfs');
    const [graphData, setGraphData] = useState<GraphData>(() => generateGraph('default'));
    const [startNode, setStartNode] = useState<string>('A');
    const [animations, setAnimations] = useState<GraphAnimationStep[]>([]);
    const [animationIndex, setAnimationIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(500);
    const [activeGraphType, setActiveGraphType] = useState<GraphType>('default');
    
    const resetVisualization = useCallback(() => {
        setIsPlaying(false);
        if (graphData.nodes.length === 0) {
            setAnimations([]); setAnimationIndex(0); return;
        }
        const validStartNode = graphData.nodes.find(n => n.id === startNode) ? startNode : graphData.nodes[0].id;
        const newAnimations = getGraphTraversalAnimations(graphData.adjacencyList, validStartNode, activeAlgorithm);
        setAnimations(newAnimations);
        setAnimationIndex(0);
    }, [startNode, graphData, activeAlgorithm]);
    
    useEffect(() => {
      if (graphData.nodes.length > 0) {
          const newStartNode = graphData.nodes.find(n=>n.id === 'A') ? 'A' : graphData.nodes[0].id;
          if (startNode !== newStartNode) setStartNode(newStartNode);
          else resetVisualization();
      }
    }, [graphData]);
    
    useEffect(() => { resetVisualization(); }, [resetVisualization]);

    useEffect(() => {
        if (isPlaying && animationIndex < animations.length) {
            const timer = setTimeout(() => setAnimationIndex(p => p + 1), MAX_SPEED - speed);
            return () => clearTimeout(timer);
        } else if (isPlaying && animationIndex >= animations.length) { setIsPlaying(false); }
    }, [animationIndex, isPlaying, animations, speed]);

    const visualState = useVisualState(animations, animationIndex, activeAlgorithm, startNode);
    
    const handlePlayPause = () => {
        if (animationIndex >= animations.length) { resetVisualization(); setTimeout(() => setIsPlaying(true), 100); }
        else { setIsPlaying(!isPlaying); }
    };
    const handleNextStep = () => { setIsPlaying(false); if (animationIndex < animations.length) setAnimationIndex(p => p + 1); };
    const handlePreviousStep = () => { setIsPlaying(false); if (animationIndex > 0) setAnimationIndex(p => p - 1); };
    
    const handleGraphChange = (type: GraphType) => { setActiveGraphType(type); setGraphData(generateGraph(type)); };

    const nodeMap = useMemo(() => new Map(graphData.nodes.map(n => [n.id, n])), [graphData.nodes]);
    const { description, code } = ALGORITHMS.graphTraversal;
    const currentCode = activeAlgorithm === 'dfs' ? code.split('###--- Breadth-First Search (BFS) ---###')[0] : '###--- Breadth-First Search (BFS) ---###\n' + code.split('###--- Breadth-First Search (BFS) ---###')[1];


    return (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-3 bg-slate-800/50 p-4 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <button onClick={handlePreviousStep} disabled={isPlaying || animationIndex === 0} className="p-2 bg-slate-600 text-white rounded-full hover:bg-slate-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"><PrevStepIcon className="h-6 w-6" /></button>
                           <button onClick={handlePlayPause} className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600">{isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}</button>
                           <button onClick={handleNextStep} disabled={isPlaying || animationIndex >= animations.length} className="p-2 bg-slate-600 text-white rounded-full hover:bg-slate-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"><NextStepIcon className="h-6 w-6" /></button>
                        </div>
                        <button onClick={resetVisualization} className="p-2 bg-slate-600 text-white rounded-full hover:bg-slate-700"><ResetIcon className="h-6 w-6" /></button>
                    </div>
                     <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
                         <div className="w-full sm:w-48">
                            <label htmlFor="start-node-select" className="block text-sm font-medium text-slate-300 mb-1">Start Node</label>
                            <select id="start-node-select" value={startNode} onChange={(e) => setStartNode(e.target.value)} disabled={isPlaying} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500 text-white">
                                {graphData.nodes.map(node => <option key={node.id} value={node.id}>{node.id}</option>)}
                            </select>
                        </div>
                        <div className="w-full sm:w-48">
                            <Slider label="Speed" min={MIN_SPEED} max={MAX_SPEED} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mb-4 p-2 bg-slate-900/50 rounded-md">
                    {['default', 'tree', 'grid', 'random'].map((type) => (
                        <button key={type} onClick={() => handleGraphChange(type as GraphType)} disabled={isPlaying} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${activeGraphType === type ? 'bg-sky-500 text-white' : 'bg-slate-600 hover:bg-slate-700'}`}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
                
                <div className="h-[58vh] xl:h-[62vh] bg-slate-900 rounded-md p-2 pt-16 relative">
                    <div className="absolute top-2 left-2 right-2 bg-slate-900/80 p-3 rounded-md shadow-lg border border-slate-700 h-14" >
                        <p className="text-slate-200 text-sm h-full transition-opacity duration-300" key={visualState.explanation}>
                            {visualState.explanation}
                        </p>
                    </div>
                    <svg width="100%" height="100%" viewBox="0 0 600 400">
                        <defs><marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className="fill-green-500" /></marker></defs>
                        {graphData.edges.map(edge => {
                            const sourceNode = nodeMap.get(edge.source); const targetNode = nodeMap.get(edge.target);
                            if (!sourceNode || !targetNode) return null;
                            const isExploring = visualState.exploringEdge?.source === edge.source && visualState.exploringEdge?.target === edge.target;
                            return (<line key={`${edge.source}-${edge.target}`} x1={sourceNode.x} y1={sourceNode.y} x2={targetNode.x} y2={targetNode.y} className={`stroke-2 transition-all duration-300 ${isExploring ? 'stroke-yellow-400 animate-pulse' : 'stroke-slate-600'}`} />);
                        })}
                        {Array.from(visualState.parentEdges.entries()).map(([childId, parentId]) => {
                            const parentNode = nodeMap.get(parentId); const childNode = nodeMap.get(childId);
                            if (!parentNode || !childNode) return null;
                            const dx = childNode.x - parentNode.x; const dy = childNode.y - parentNode.y;
                            const dist = Math.sqrt(dx * dx + dy * dy); const ratio = (dist - 15) / dist;
                            const endX = parentNode.x + dx * ratio; const endY = parentNode.y + dy * ratio;
                            return (<line key={`p-${parentId}-${childId}`} x1={parentNode.x} y1={parentNode.y} x2={endX} y2={endY} className="stroke-2 stroke-green-500" markerEnd="url(#arrowhead)" />);
                        })}
                        {graphData.nodes.map(node => {
                            const isCurrent = visualState.currentNode === node.id; const isFinished = visualState.finishedNodes.has(node.id); const isVisited = visualState.visitedNodes.has(node.id);
                            let fill = 'fill-slate-700', stroke = 'stroke-slate-500', extraClasses = '';
                            if (isCurrent) { fill = 'fill-purple-700'; stroke = 'stroke-purple-400'; extraClasses = 'animate-pulse-current'; }
                            else if (isFinished) { fill = 'fill-green-900'; stroke = 'stroke-green-600'; }
                            else if (isVisited) { fill = 'fill-sky-800'; stroke = 'stroke-sky-400'; }
                            return (<g key={node.id} transform={`translate(${node.x}, ${node.y})`}><circle r="15" className={`transition-all duration-300 ${fill} stroke-2 ${stroke} ${extraClasses}`} /><text textAnchor="middle" dy=".3em" className="fill-white text-sm font-bold select-none">{node.id}</text></g>);
                        })}
                    </svg>
                    {activeAlgorithm === 'bfs' && (
                        <div className="absolute bottom-2 left-2 right-2">
                             <div className="flex justify-start items-center gap-2 p-2 bg-slate-900/80 rounded-md h-14" dir="ltr">
                                <span className="text-slate-300 font-semibold mr-2">Queue:</span>
                                 {visualState.queue.map(nodeId => (<div key={nodeId} className="w-10 h-10 bg-sky-800 text-white flex items-center justify-center rounded font-mono font-bold text-sm flex-shrink-0">{nodeId}</div>))}
                                 {visualState.queue.length === 0 && <span className="text-slate-500 text-sm">Empty</span>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="xl:col-span-2 flex flex-col gap-6">
                <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-sky-400">Graph Traversal</h2>
                        <div className="flex rounded-lg bg-slate-700 p-1">
                            <button onClick={() => setActiveAlgorithm('dfs')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${activeAlgorithm === 'dfs' ? 'bg-sky-500 text-white' : 'text-slate-300'}`}>DFS</button>
                            <button onClick={() => setActiveAlgorithm('bfs')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${activeAlgorithm === 'bfs' ? 'bg-sky-500 text-white' : 'text-slate-300'}`}>BFS</button>
                        </div>
                    </div>
                    <p className="text-slate-300 mb-4 text-sm">{activeAlgorithm === 'dfs' ? 'DFS explores as far as possible along each branch before backtracking.' : 'BFS explores neighbor nodes first, before moving to the next level neighbors.'}</p>
                    <div className="flex justify-around bg-slate-700/50 p-3 rounded-md text-center mb-4">
                        <div><span className="text-sm text-slate-400">Nodes Visited</span><p className="text-2xl font-mono font-bold text-sky-400">{visualState.nodesVisitedCount}</p></div>
                        <div><span className="text-sm text-slate-400">Edges Processed</span><p className="text-2xl font-mono font-bold text-sky-400">{visualState.edgesProcessedCount}</p></div>
                    </div>
                    <div className="space-y-4">
                        <div><h3 className="text-lg font-semibold text-slate-200 mb-2">Performance & Complexity</h3><PerformanceChart /></div>
                        <div><h3 className="text-lg font-semibold text-slate-200 mb-2">DFS vs. BFS Comparison</h3><ComparisonTable/></div>
                    </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-200 mb-3 px-2">Code: {activeAlgorithm.toUpperCase()}</h3>
                    <CodeDisplay code={currentCode} highlightedLine={visualState.highlightedLine} />
                </div>
            </div>
        </div>
    );
};

export default GraphTraversalVisualizer;
