import { GraphAnimationStep } from '../types';

export const getGraphTraversalAnimations = (
  graph: Map<string, string[]>,
  startNode: string,
  method: 'dfs' | 'bfs'
): GraphAnimationStep[] => {
  if (method === 'dfs') {
    return dfs(graph, startNode);
  } else {
    return bfs(graph, startNode);
  }
};

const dfs = (graph: Map<string, string[]>, startNode: string): GraphAnimationStep[] => {
  const animations: GraphAnimationStep[] = [];
  const visited = new Set<string>();

  function traverse(node: string, parent: string | null) {
    animations.push(['visit', node, 5]);
    if (visited.has(node)) return;

    visited.add(node);
    animations.push(['visit', node, 7]);
    if (parent) {
      animations.push(['parent', parent, node, 7]);
    }


    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) { // Line 9
      animations.push(['explore', node, neighbor, 9]);
      if (!visited.has(neighbor)) {
        traverse(neighbor, node); // Line 10
      }
    }
    animations.push(['finish', node, 12]);
  }
  
  traverse(startNode, null); // Line 15
  
  return animations;
};

const bfs = (graph: Map<string, string[]>, startNode: string): GraphAnimationStep[] => {
  const animations: GraphAnimationStep[] = [];
  const visited = new Set<string>();
  const queue: { node: string; parent: string | null }[] = [{ node: startNode, parent: null }]; // Line 3
  animations.push(['queue', startNode, 3]);
  
  visited.add(startNode); // Line 4
  animations.push(['visit', startNode, 4]);


  while (queue.length > 0) { // Line 6
    const { node, parent } = queue.shift()!;
    animations.push(['dequeue', node, 7]);
    if (parent) {
        animations.push(['parent', parent, node, 7]);
    }

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) { // Line 9
      animations.push(['explore', node, neighbor, 10]);
      if (!visited.has(neighbor)) { // Line 10
        visited.add(neighbor); // Line 11
        animations.push(['visit', neighbor, 11]);
        queue.push({ node: neighbor, parent: node }); // Line 12
        animations.push(['queue', neighbor, 12]);
      }
    }
    animations.push(['finish', node, 6]);
  }

  return animations;
};