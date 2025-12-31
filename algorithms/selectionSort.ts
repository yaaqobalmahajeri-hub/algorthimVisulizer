import { SortingAnimationStep } from '../types';

export const getSelectionSortAnimations = (array: number[]): SortingAnimationStep[] => {
  const animations: SortingAnimationStep[] = [];
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    animations.push(['ss-outer-loop', i, 3]);
    let minIdx = i; // Line 4
    animations.push(['ss-min-init', minIdx, 4]);

    for (let j = i + 1; j < n; j++) {
      animations.push(['ss-inner-compare', j, minIdx, 5]); // Line 5
      if (array[j] < array[minIdx]) {
        minIdx = j; // Line 6
        animations.push(['ss-min-update', minIdx, 6]);
      }
    }

    if (minIdx !== i) { // Line 9
      animations.push(['ss-swap', i, minIdx, 11]); // Line 11
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
    }
    animations.push(['ss-sorted', i, 2]);
  }

  if (n > 0) {
    animations.push(['ss-sorted', n - 1, 13]);
  }
  animations.push(['finish', 13]);
  return animations;
};