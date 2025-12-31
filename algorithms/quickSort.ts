import { SortingAnimationStep, PivotStrategy } from '../types';

export const getQuickSortAnimations = (array: number[], pivotStrategy: PivotStrategy = 'last'): SortingAnimationStep[] => {
  const animations: SortingAnimationStep[] = [];
  if (array.length <= 1) {
    if (array.length === 1) {
        animations.push(['qs-call', '0', null, 0, 0, 1]);
        animations.push(['qs-sorted', '0', 1]);
    }
    return animations;
  }
  const mutableArray = array.slice();
  quickSortHelper(mutableArray, 0, mutableArray.length - 1, null, '0', animations, pivotStrategy);
  return animations;
};

function choosePivot(
  arr: number[],
  low: number,
  high: number,
  strategy: PivotStrategy,
  nodeId: string,
  animations: SortingAnimationStep[]
): number {
    let pivotIndex: number;
    switch (strategy) {
        case 'first':
            pivotIndex = low;
            break;
        case 'random':
            pivotIndex = Math.floor(Math.random() * (high - low + 1)) + low;
            break;
        case 'median':
            const mid = Math.floor((low + high) / 2);
            animations.push(['qs-compare', nodeId, low, mid, 12]);
            animations.push(['qs-compare', nodeId, mid, high, 12]);
            animations.push(['qs-compare', nodeId, low, high, 12]);
            const a = arr[low], b = arr[mid], c = arr[high];
            if ((a > b) !== (a > c)) pivotIndex = low;
            else if ((b > a) !== (b > c)) pivotIndex = mid;
            else pivotIndex = high;
            break;
        case 'last':
        default:
            pivotIndex = high;
            break;
    }
    
    animations.push(['qs-pivot-select', nodeId, pivotIndex, arr[pivotIndex], 12]);
    
    if (pivotIndex !== high) {
        animations.push(['qs-swap', nodeId, pivotIndex, high, 12]);
        [arr[pivotIndex], arr[high]] = [arr[high], arr[pivotIndex]];
    }
    
    return high;
}

function quickSortHelper(
  arr: number[],
  low: number,
  high: number,
  parentId: string | null,
  nodeId: string,
  animations: SortingAnimationStep[],
  pivotStrategy: PivotStrategy
): void {
  animations.push(['qs-call', nodeId, parentId, low, high, 2]);

  if (low < high) { // Line 2
    choosePivot(arr, low, high, pivotStrategy, nodeId, animations);
    const pi = partition(arr, low, high, nodeId, animations); // Line 4
    animations.push(['qs-partition-complete', nodeId, pi, 4]);

    // Recurse on sub-arrays
    quickSortHelper(arr, low, pi - 1, nodeId, `${nodeId}.0`, animations, pivotStrategy); // Line 7
    quickSortHelper(arr, pi + 1, high, nodeId, `${nodeId}.1`, animations, pivotStrategy); // Line 8
    
    // After children return, this partition is fully sorted
    animations.push(['qs-sorted', nodeId, 8]);

  } else if (low <= high) {
    // Base case for single-element or empty partitions
    animations.push(['qs-sorted', nodeId, 9]);
  }
}

function partition(
  arr: number[],
  low: number,
  high: number,
  nodeId: string,
  animations: SortingAnimationStep[]
): number {
  const pivotValue = arr[high];
  animations.push(['qs-pivot', nodeId, high, 12]);
  let i = low - 1;
  animations.push(['qs-pointers', nodeId, i, low, 13]);

  for (let j = low; j < high; j++) {
    animations.push(['qs-pointers', nodeId, i, j, 15]);
    animations.push(['qs-compare', nodeId, j, high, 16]);
    if (arr[j] < pivotValue) {
      i++;
      animations.push(['qs-pointers', nodeId, i, j, 17]);
      animations.push(['qs-swap', nodeId, i, j, 18]);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  animations.push(['qs-swap', nodeId, i + 1, high, 22]);
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  animations.push(['qs-pointers', nodeId, null, null, 22]);
  
  return i + 1;
}