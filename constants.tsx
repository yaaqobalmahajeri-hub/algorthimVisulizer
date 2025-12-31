
import React from 'react';
import { AlgorithmData, AlgorithmId } from './types';
import SortingVisualizer from './components/visualizers/SortingVisualizer';
import FibonacciVisualizer from './components/visualizers/FibonacciVisualizer';
import GraphTraversalVisualizer from './components/visualizers/GraphTraversalVisualizer';
import ReportsPage from './components/ReportsPage';
import AboutPage from './components/AboutPage';
import { getSelectionSortAnimations } from './algorithms/selectionSort';
import { getMergeSortAnimations } from './algorithms/mergeSort';
import { getQuickSortAnimations } from './algorithms/quickSort';

export const ALGORITHMS: Record<AlgorithmId, AlgorithmData> = {
  selectionSort: {
    name: 'Selection Sort',
    description: 'Selection sort is an in-place comparison sorting algorithm. It has an O(n^2) time complexity, which makes it inefficient on large lists.',
    code: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        
        if min_idx != i:
            # Swap elements
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
            
    return arr`,
    complexity: {
      best: { time: 'O(n^2)', space: 'O(1)' },
      average: { time: 'O(n^2)', space: 'O(1)' },
      worst: { time: 'O(n^2)', space: 'O(1)' },
    },
    component: () => <SortingVisualizer algorithmFn={getSelectionSortAnimations} title="Selection Sort" />,
  },
  mergeSort: {
    name: 'Merge Sort',
    description: 'Merge sort is an efficient, stable, comparison-based sorting algorithm. Most implementations produce a stable sort, which means that the order of equal elements is the same in the input and output.',
    code: `def merge_sort(arr):
    # Base case: array of 1 is sorted
    if len(arr) <= 1:
        return arr

    middle = len(arr) // 2

    # 1. DIVIDE: Recurse on sub-arrays
    left_half = merge_sort(arr[:middle])
    right_half = merge_sort(arr[middle:])

    # 2. CONQUER: Merge sorted sub-arrays
    return merge(left_half, right_half)

def merge(left, right):
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    # Copy remaining elements
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
    complexity: {
      best: { time: 'O(n log n)', space: 'O(n)' },
      average: { time: 'O(n log n)', space: 'O(n)' },
      worst: { time: 'O(n log n)', space: 'O(n)' },
    },
    component: () => <SortingVisualizer algorithmFn={getMergeSortAnimations} title="Merge Sort" />,
  },
  quickSort: {
    name: 'Quick Sort',
    description: 'Quicksort is an efficient sorting algorithm. Developed by British computer scientist Tony Hoare in 1959. It is still a commonly used algorithm for sorting.',
    code: `def quick_sort(arr, low, high):
    if low < high:
        # 1. DIVIDE: Partition the array
        pi = partition(arr, low, high)
        
        # 2. CONQUER: Recurse on sub-arrays
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]  # Choose last element as pivot
    i = low - 1
    
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i] # Swap
    
    # Place pivot in its correct position
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
    complexity: {
      best: { time: 'O(n log n)', space: 'O(log n)' },
      average: { time: 'O(n log n)', space: 'O(log n)' },
      worst: { time: 'O(n^2)', space: 'O(n)' },
    },
    component: () => <SortingVisualizer algorithmFn={getQuickSortAnimations} title="Quick Sort" />,
  },
  fibonacci: {
    name: 'Fibonacci (Recursive)',
    description: 'The Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones, usually starting with 0 and 1. This visualization shows the recursive call tree.',
    code: `def fibonacci(n):
    if n <= 1:
        return n
    
    left = fibonacci(n - 1)
    right = fibonacci(n - 2)
    return left + right`,
    complexity: {
      best: { time: 'O(2^n)', space: 'O(n)' },
      average: { time: 'O(2^n)', space: 'O(n)' },
      worst: { time: 'O(2^n)', space: 'O(n)' },
    },
    component: FibonacciVisualizer,
  },
  graphTraversal: {
    name: 'Graph Traversal',
    description: 'An interactive comparison of Depth-First Search (DFS) which explores as far as possible along each branch before backtracking, and Breadth-First Search (BFS) which explores neighbors first.',
    code: `###--- Depth-First Search (DFS) ---###
def dfs(graph, start_node):
    visited = set()
    stack = [start_node]
    
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            # Process node
            for neighbor in reversed(graph[node]):
                 if neighbor not in visited:
                    stack.append(neighbor)

###--- Breadth-First Search (BFS) ---###
def bfs(graph, start_node):
    visited = set()
    queue = [start_node]
    visited.add(start_node)

    while queue:
        node = queue.pop(0)
        # Process node
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
    complexity: {
      best: { time: 'O(V+E)', space: 'O(V)' },
      average: { time: 'O(V+E)', space: 'O(V)' },
      worst: { time: 'O(V+E)', space: 'O(V)' },
    },
    component: GraphTraversalVisualizer,
  },
  reports: {
    name: 'Algorithm Reports',
    description: 'A Detailed and Simplified Analysis of the Most Popular Algorithms',
    code: '',
    complexity: {
      best: { time: '', space: '' },
      average: { time: '', space: '' },
      worst: { time: '', space: '' },
    },
    component: ReportsPage,
  },
  about: {
    name: 'حول الموقع',
    description: 'تعرف على فريق العمل والهدف من المشروع',
    code: '',
    complexity: {
      best: { time: '', space: '' },
      average: { time: '', space: '' },
      worst: { time: '', space: '' },
    },
    component: AboutPage,
  },
};

export const ALGORITHM_KEYS = Object.keys(ALGORITHMS) as AlgorithmId[];
