import { FibonacciNode, FibonacciAnimationStep } from '../types';

// Function to build the visual tree structure
export const buildFibonacciTree = (n: number, id: string = '0'): FibonacciNode => {
    if (n <= 1) {
        return { id, value: n, children: [] };
    }
    return {
        id,
        value: n,
        children: [
            buildFibonacciTree(n - 1, id + '.0'),
            buildFibonacciTree(n - 2, id + '.1'),
        ],
    };
};

// Function to generate animation steps
export const getFibonacciAnimations = (n: number): FibonacciAnimationStep[] => {
    const animations: FibonacciAnimationStep[] = [];
    
    function fib(num: number, id: string): number {
        animations.push(['stack_push', id, 1]);
        animations.push(['call', id, 1]);

        if (num <= 1) { // Line 2
            animations.push(['return', id, num, 3]);
            animations.push(['stack_pop', id, 3]);
            return num;
        }

        const leftResult = fib(num - 1, id + '.0'); // Line 5
        animations.push(['call', id, 6]); // Highlight parent again before second call
        const rightResult = fib(num - 2, id + '.1'); // Line 6
        
        const result = leftResult + rightResult;
        animations.push(['return', id, result, 7]);
        animations.push(['stack_pop', id, 7]);
        return result;
    }

    fib(n, '0');
    return animations;
};