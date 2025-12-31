
import React from 'react';

export type AlgorithmId =
  | 'selectionSort'
  | 'mergeSort'
  | 'quickSort'
  | 'fibonacci'
  | 'graphTraversal'
  | 'reports'
  | 'about';

export interface Complexity {
  time: string;
  space: string;
}

export interface AlgorithmData {
  name: string;
  description: string;
  code: string;
  complexity: {
    best: Complexity;
    average: Complexity;
    worst: Complexity;
  };
  component: React.FC;
}

// For Sorting Algorithms
export type PivotStrategy = 'first' | 'last' | 'random' | 'median';

export type SortingAnimationStep =
  | ['compare', number, number, number] // DEPRECATED for selectionSort, kept for compatibility
  | ['swap', number, number, number, number, number] // DEPRECATED for selectionSort, kept for compatibility
  | ['overwrite', number, number, number]
  | ['sorted', number, number]
  // --- Selection Sort Additions ---
  | ['ss-outer-loop', number, number] // i, lineNumber
  | ['ss-min-init', number, number] // min_idx, lineNumber
  | ['ss-inner-compare', number, number, number] // j, min_idx, lineNumber
  | ['ss-min-update', number, number] // new_min_idx, lineNumber
  | ['ss-swap', number, number, number] // idx1, idx2, lineNumber
  | ['ss-sorted', number, number] // idx, lineNumber
  | ['finish', number] // lineNumber
  // --- Tree-based Merge Sort Additions ---
  | ['ms-call', string, number, number, number] // nodeId, start, end, lineNumber
  | ['ms-compare', string, number, number, number] // nodeId, leftIdx, rightIdx, lineNumber
  | ['ms-write', string, number, number, number] // nodeId, writeIdx, value, lineNumber
  | ['ms-return', string, number] // nodeId, lineNumber
  // --- Tree-based Quick Sort Additions (Revised) ---
  | ['qs-call', string, string | null, number, number, number] // nodeId, parentId, start, end, lineNumber
  | ['qs-pivot', string, number, number] // nodeId, pivotIndex, lineNumber
  | ['qs-pivot-select', string, number, number, number] // nodeId, pivotIndex, pivotValue, lineNumber
  | ['qs-pointers', string, number | null, number | null, number] // nodeId, i, j, lineNumber
  | ['qs-compare', string, number, number, number] // nodeId, index1, index2, lineNumber
  | ['qs-swap', string, number, number, number] // nodeId, index1, index2, lineNumber
  | ['qs-partition-complete', string, number, number] // nodeId, pivotFinalIndex, lineNumber
  | ['qs-sorted', string, number]; // nodeId, lineNumber


// For Merge Sort Tree
export interface MergeSortNode {
  id: string;
  start: number;
  end: number;
  children: MergeSortNode[];
}

// For Quick Sort Tree
export interface QuickSortNode {
  id: string;
  parentId: string | null;
  start: number;
  end: number;
  children: QuickSortNode[];
}


// For Fibonacci
export interface FibonacciNode {
    id: string;
    value: number;
    result?: number;
    children: FibonacciNode[];
}
export type FibonacciAnimationStep =
  | ['call', string, number] // nodeId, lineNumber
  | ['return', string, number, number] // nodeId, result, lineNumber
  | ['stack_push', string, number] // nodeId, lineNumber
  | ['stack_pop', string, number]; // nodeId, lineNumber

// For Graph Traversal
export type GraphAnimationStep =
  | ['visit', string, number]
  | ['explore', string, string, number]
  | ['queue', string, number]
  | ['dequeue', string, number]
  | ['finish', string, number]
  | ['parent', string, string, number]; // parentNode, childNode, lineNumber


// For Graph Visualizer
export interface GraphNode {
  id: string;
  x: number;
  y: number;
}
export interface GraphEdge {
  source: string;
  target: string;
}
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacencyList: Map<string, string[]>;
}

export type GraphType = 'default' | 'tree' | 'grid' | 'random';
