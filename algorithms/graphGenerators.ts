import { GraphData, GraphNode, GraphEdge, GraphType } from '../types';

const CANVAS_WIDTH = 580;
const CANVAS_HEIGHT = 380;
const PADDING = 20;

const createAdjacencyList = (nodes: GraphNode[], edges: GraphEdge[]): Map<string, string[]> => {
    const adjList = new Map<string, string[]>();
    nodes.forEach(node => adjList.set(node.id, []));
    edges.forEach(edge => {
        adjList.get(edge.source)?.push(edge.target);
    });
    for (const [, value] of adjList.entries()) {
        value.sort();
    }
    return adjList;
};

const generateDefaultGraph = (): GraphData => {
    const nodes: GraphNode[] = [
        { id: 'A', x: 300, y: 50 }, { id: 'B', x: 150, y: 150 },
        { id: 'C', x: 450, y: 150 }, { id: 'D', x: 75, y: 250 },
        { id: 'E', x: 225, y: 250 }, { id: 'F', x: 375, y: 250 },
        { id: 'G', x: 525, y: 250 },
    ];
    const edges = [
        { source: 'A', target: 'B' }, { source: 'A', target: 'C' },
        { source: 'B', target: 'D' }, { source: 'B', target: 'E' },
        { source: 'C', target: 'F' }, { source: 'C', target: 'G' },
    ];
    return { nodes, edges, adjacencyList: createAdjacencyList(nodes, edges) };
}

const generateTreeGraph = (): GraphData => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const levels = 4;
    let nodeId = 0;

    const buildLevel = (parentIndex: number | null, level: number, x: number, y: number, xOffset: number) => {
        if (level >= levels || nodeId >= 15) return;

        const currentNodeId = String.fromCharCode(65 + nodeId++);
        nodes.push({ id: currentNodeId, x, y });

        if (parentIndex !== null) {
            edges.push({ source: String.fromCharCode(65 + parentIndex), target: currentNodeId });
        }

        const newXOffset = xOffset / 2;
        const newY = y + (CANVAS_HEIGHT - PADDING * 2) / (levels - 1);
        
        buildLevel(nodeId - 1, level + 1, x - newXOffset, newY, newXOffset);
        buildLevel(nodeId - 1, level + 1, x + newXOffset, newY, newXOffset);
    };

    buildLevel(null, 0, CANVAS_WIDTH / 2 + PADDING, PADDING + 20, CANVAS_WIDTH / 2);
    return { nodes, edges, adjacencyList: createAdjacencyList(nodes, edges) };
}

const generateGridGraph = (): GraphData => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const rows = 4;
    const cols = 5;
    const xStep = (CANVAS_WIDTH - PADDING * 4) / (cols - 1);
    const yStep = (CANVAS_HEIGHT - PADDING * 4) / (rows - 1);
    let nodeIdCounter = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const id = String.fromCharCode(65 + nodeIdCounter++);
            nodes.push({
                id,
                x: c * xStep + PADDING * 2,
                y: r * yStep + PADDING * 2,
            });
        }
    }

    nodeIdCounter = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const currentId = String.fromCharCode(65 + nodeIdCounter);
            if (c < cols - 1) {
                const rightId = String.fromCharCode(65 + nodeIdCounter + 1);
                edges.push({ source: currentId, target: rightId });
            }
            if (r < rows - 1) {
                const bottomId = String.fromCharCode(65 + nodeIdCounter + cols);
                 edges.push({ source: currentId, target: bottomId });
            }
            nodeIdCounter++;
        }
    }
    return { nodes, edges, adjacencyList: createAdjacencyList(nodes, edges) };
};

const generateRandomGraph = (): GraphData => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeCount = 12;

    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            id: String.fromCharCode(65 + i),
            x: Math.random() * (CANVAS_WIDTH - PADDING * 2) + PADDING,
            y: Math.random() * (CANVAS_HEIGHT - PADDING * 2) + PADDING,
        });
    }

    const shuffledNodes = [...nodes].sort(() => 0.5 - Math.random());
    for (let i = 0; i < shuffledNodes.length - 1; i++) {
        edges.push({ source: shuffledNodes[i].id, target: shuffledNodes[i+1].id });
    }

    const additionalEdges = Math.floor(nodeCount / 2);
    for (let i = 0; i < additionalEdges; i++) {
        const node1 = nodes[Math.floor(Math.random() * nodeCount)];
        const node2 = nodes[Math.floor(Math.random() * nodeCount)];

        if (node1.id !== node2.id && !edges.some(e => (e.source === node1.id && e.target === node2.id) || (e.source === node2.id && e.target === node1.id))) {
            edges.push({ source: node1.id, target: node2.id });
        }
    }

    return { nodes, edges, adjacencyList: createAdjacencyList(nodes, edges) };
};


export const generateGraph = (type: GraphType): GraphData => {
    switch (type) {
        case 'tree':
            return generateTreeGraph();
        case 'grid':
            return generateGridGraph();
        case 'random':
            return generateRandomGraph();
        case 'default':
        default:
            return generateDefaultGraph();
    }
};
