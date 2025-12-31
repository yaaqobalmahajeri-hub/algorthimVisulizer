import { SortingAnimationStep } from '../types';

export const getMergeSortAnimations = (array: number[]): SortingAnimationStep[] => {
    const animations: SortingAnimationStep[] = [];
    if (array.length <= 1) return animations;
    
    mergeSortHelper(array.slice(), 0, array.length - 1, '0', animations);
    
    return animations;
};

// Returns the sorted sub-array
function mergeSortHelper(
    array: number[],
    start: number,
    end: number,
    nodeId: string,
    animations: SortingAnimationStep[],
): number[] {
    animations.push(['ms-call', nodeId, start, end, 1]);

    if (start >= end) {
        animations.push(['ms-return', nodeId, 4]);
        return [array[start]];
    }
    
    const middle = Math.floor((start + end) / 2);
    
    animations.push(['ms-call', nodeId, start, end, 9]);
    const leftHalf = mergeSortHelper(array, start, middle, nodeId + '.0', animations);
    
    animations.push(['ms-call', nodeId, start, end, 10]);
    const rightHalf = mergeSortHelper(array, middle + 1, end, nodeId + '.1', animations);
    
    animations.push(['ms-call', nodeId, start, end, 13]);
    const merged = merge(leftHalf, rightHalf, nodeId, animations);
    
    animations.push(['ms-return', nodeId, 14]);
    return merged;
}

function merge(
    left: number[],
    right: number[],
    nodeId: string,
    animations: SortingAnimationStep[],
): number[] {
    const result: number[] = [];
    let i = 0; // left pointer
    let j = 0; // right pointer
    let k = 0; // result pointer

    while (i < left.length && j < right.length) { // Line 20
        animations.push(['ms-compare', nodeId, i, j, 21]);
        if (left[i] <= right[j]) {
            animations.push(['ms-write', nodeId, k, left[i], 22]);
            result.push(left[i++]);
        } else {
            animations.push(['ms-write', nodeId, k, right[j], 24]);
            result.push(right[j++]);
        }
        k++;
    }
    
    while (i < left.length) { // Line 28
        animations.push(['ms-compare', nodeId, i, j-1, 28]);
        animations.push(['ms-write', nodeId, k, left[i], 29]);
        result.push(left[i++]);
        k++;
    }
    
    while (j < right.length) { // Line 30
        animations.push(['ms-compare', nodeId, i-1, j, 30]);
        animations.push(['ms-write', nodeId, k, right[j], 31]);
        result.push(right[j++]);
        k++;
    }

    return result;
}