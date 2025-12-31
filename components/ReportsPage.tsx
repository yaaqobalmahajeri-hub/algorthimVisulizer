
import React, { useState } from 'react';
import { ChevronDownIcon } from './ui/Icon';

const reportsData = [
    {
        id: 'selectionSort',
        title: 'Selection Sort',
        definition: 'A simple sorting algorithm based on the idea of finding the smallest element in the unsorted part of the array and placing it at the beginning. This process is repeated for each part of the array until it is fully sorted. For example, if you have a scattered deck of cards, you would look for the smallest card and place it on the far left, then find the smallest card in the remainder and place it next to the first one, and so on.',
        problem: 'Sorting a collection of elements (numbers, words) in ascending or descending order. It is used in situations where memory is limited because it does not require significant additional space (in-place).',
        pros: [
            'Easy to understand and implement.',
            'Efficient in terms of memory consumption (Space Complexity: O(1)).',
            'Performs a small number of swaps, which is useful if the cost of swapping is high.',
        ],
        cons: [
            'Inefficient for large datasets due to its quadratic time complexity (O(n²)).',
            'Its performance does not improve even if the array is partially or fully sorted.',
        ],
        steps: [
            'Assume the first element is the smallest.',
            'Search the rest of the array for a smaller element.',
            'If a smaller element is found, update the "smallest element" index.',
            'After searching the unsorted part, swap the first element of this part with the "smallest element" you found.',
            'Repeat the steps for the remaining part of the array (excluding the element that has been placed in its correct position).',
        ],
        complexity: {
            best: 'O(n²)',
            average: 'O(n²)',
            worst: 'O(n²)',
            space: 'O(1)',
        },
    },
    {
        id: 'mergeSort',
        title: 'Merge Sort',
        definition: 'An efficient sorting algorithm based on the "Divide and Conquer" strategy. It repeatedly divides the array into two halves until it reaches arrays containing only one element (which are inherently sorted), then merges these small sorted arrays back together to get the final sorted array.',
        problem: 'Efficiently sorting large datasets. It is commonly used in real-world applications due to its stable performance.',
        pros: [
            'Very efficient for large datasets, with a time complexity of O(n log n) in all cases.',
            'It is a stable algorithm, meaning it preserves the relative order of equal elements.',
            'Can be easily applied to data structures like Linked Lists.',
        ],
        cons: [
            'Requires additional memory space (O(n)) for the merge process, making it unsuitable for environments with very limited memory.',
            'Slower than other algorithms (like Quick Sort) on average for small datasets due to the overhead of recursive calls.',
        ],
        steps: [
            'Divide: Split the unsorted array into two halves.',
            'Conquer: Recursively call the algorithm for each half until you have arrays with a single element.',
            'Merge: Merge the two smaller sorted arrays to produce a larger sorted array. Repeat the merge process upwards until the entire array is sorted.',
        ],
        complexity: {
            best: 'O(n log n)',
            average: 'O(n log n)',
            worst: 'O(n log n)',
            space: 'O(n)',
        },
    },
    {
        id: 'quickSort',
        title: 'Quick Sort',
        definition: 'A highly efficient sorting algorithm also based on the "Divide and Conquer" strategy. It works by selecting an element from the array called a "pivot" and then partitioning the other elements into two sub-arrays, according to whether they are less than or greater than the pivot. The sub-arrays are then sorted recursively.',
        problem: 'Very fast sorting of large datasets in main memory (in-memory). It is often faster in practice than other O(n log n) algorithms like Merge Sort.',
        pros: [
            'Very fast on average.',
            'Works in-place, meaning it requires minimal additional memory space (O(log n) for the recursion stack).',
        ],
        cons: [
            'Worst-case performance is O(n²), which can occur with poor pivot selection (e.g., always picking the smallest or largest element in a sorted array).',
            'It is not a stable algorithm.',
            'More complex to implement correctly compared to Merge Sort.',
        ],
        steps: [
            'Pick a Pivot: Choose an element from the array as the pivot (can be the first, last, or a random element).',
            'Partition: Reorder the array so that all elements with values less than the pivot come before it, while all elements with values greater than it come after. The pivot is now in its final sorted position.',
            'Recurse: Recursively apply the quick sort algorithm to the sub-array of smaller elements and the sub-array of larger elements.',
        ],
        complexity: {
            best: 'O(n log n)',
            average: 'O(n log n)',
            worst: 'O(n²)',
            space: 'O(log n)',
        },
    },
    {
        id: 'fibonacci',
        title: 'Fibonacci Sequence (Divide and Conquer)',
        definition: 'The Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones, usually starting with 0 and 1. The formula is: F(n) = F(n-1) + F(n-2). When calculated using a "Divide and Conquer" strategy, the problem (calculating F(n)) is divided into two smaller problems (calculating F(n-1) and F(n-2)), solving each independently, and then summing the results.',
        problem: 'Calculating the Fibonacci number at a specific position. This example is primarily used to illustrate the concept of recursion and the "Divide and Conquer" strategy, although this implementation is inefficient.',
        pros: [
            'Clearly and simply illustrates the concept of recursion.',
            'The code is straightforward and reflects the mathematical definition of the sequence.',
        ],
        cons: [
            'Extremely inefficient due to redundant calculations of the same values multiple times (Exponential Time Complexity). For example, to calculate `fib(5)`, `fib(3)` will be calculated twice and `fib(2)` three times.',
            'Can lead to a stack overflow for large numbers.',
        ],
        steps: [
            'If the number (n) is 0 or 1, return the number itself (this is the Base Case).',
            'Otherwise, call the function to calculate `fib(n-1)`.',
            'Call the function to calculate `fib(n-2)`.',
            'Sum the results of the two calls and return the total.',
        ],
        complexity: {
            best: 'O(2ⁿ)',
            average: 'O(2ⁿ)',
            worst: 'O(2ⁿ)',
            space: 'O(n)',
        },
    },
    {
        id: 'dfs',
        title: 'Depth-First Search (DFS)',
        definition: 'An algorithm for traversing or searching tree or graph data structures. The algorithm starts at the root node and explores as far as possible along each branch before backtracking. It\'s like navigating a maze by taking one path until you hit a dead end, then backing up and trying another path.',
        problem: 'Commonly used in solving mazes, detecting cycles in graphs, topological sorting, solving puzzles like Sudoku, and building decision trees in AI.',
        pros: [
            'Simple to implement using recursion.',
            'Requires less memory than BFS for very wide graphs because it only needs to store the current path, not all neighbors at each level.',
            'Can find a solution quickly if it lies deep within the tree.',
        ],
        cons: [
            'May take a very long path before finding a solution, even if the solution is close to the starting point.',
            'Does not guarantee finding the shortest path.',
            'If the tree is very deep, a stack overflow error can occur in the recursive implementation.',
        ],
        steps: [
            'Choose a starting node, push it onto a stack, and mark it as visited.',
            'As long as the stack is not empty, pop a node from the top (this is the current node).',
            'For each neighbor of the current node, if it has not been visited, mark it as visited and push it onto the stack.',
            'When there are no unvisited neighbors left, the algorithm naturally backtracks by popping the next node from the stack.',
        ],
        complexity: {
            best: 'O(V+E)',
            average: 'O(V+E)',
            worst: 'O(V+E)',
            space: 'O(V)',
        },
    },
    {
        id: 'bfs',
        title: 'Breadth-First Search (BFS)',
        definition: 'An algorithm for traversing or searching tree or graph data structures. It starts at the root node and explores all the neighbor nodes at the present level prior to moving on to the nodes at the next level. It\'s like throwing a stone into a pond, where the waves spread out in concentric circles.',
        problem: 'Primarily used to find the shortest path in unweighted graphs. Common in networking applications (like discovering devices on a network), social networks (like finding "second-degree friends"), and web crawlers.',
        pros: [
            'Guarantees finding the shortest path from a starting node to any other node (in terms of the number of edges).',
            'Will not get trapped in very long paths like DFS might (in infinite graphs).',
            'Useful for finding all nodes reachable from a starting point.',
        ],
        cons: [
            'Requires more memory than DFS, especially in dense or deep graphs, because it needs to store all nodes at the current level in a queue.',
        ],
        steps: [
            'Choose a starting node, add it to a queue, and mark it as visited.',
            'As long as the queue is not empty, remove a node from the front of the queue.',
            'Process the node.',
            'Add all its unvisited neighbors to the end of the queue and mark them as visited.',
            'Repeat until the queue is empty.',
        ],
        complexity: {
            best: 'O(V+E)',
            average: 'O(V+E)',
            worst: 'O(V+E)',
            space: 'O(V)',
        },
    },
];

const ComplexityTable: React.FC<{ data: typeof reportsData[0]['complexity'] }> = ({ data }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                <tr>
                    <th scope="col" className="px-6 py-3">Case</th>
                    <th scope="col" className="px-6 py-3">Time Complexity</th>
                    <th scope="col" className="px-6 py-3">Space Complexity</th>
                </tr>
            </thead>
            <tbody>
                <tr className="border-b border-slate-700">
                    <td className="px-6 py-4 font-medium text-green-400">Best Case</td>
                    <td className="px-6 py-4 font-mono">{data.best}</td>
                    <td className="px-6 py-4 font-mono" rowSpan={3}>{data.space}</td>
                </tr>
                <tr className="border-b border-slate-700">
                    <td className="px-6 py-4 font-medium text-yellow-400">Average Case</td>
                    <td className="px-6 py-4 font-mono">{data.average}</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 font-medium text-red-400">Worst Case</td>
                    <td className="px-6 py-4 font-mono">{data.worst}</td>
                </tr>
            </tbody>
        </table>
    </div>
);


const ReportsPage: React.FC = () => {
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 text-slate-200">
            <header className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-bold text-sky-400">
                    Comprehensive Algorithm Reports
                </h1>
                <p className="text-slate-400 mt-2 text-lg">
                    A detailed and simplified analysis of the most popular algorithms
                </p>
            </header>

            <div className="space-y-4">
                {reportsData.map(report => (
                    <div key={report.id} className="bg-slate-800/50 rounded-lg shadow-lg overflow-hidden transition-all duration-300">
                        <button
                            onClick={() => toggleAccordion(report.id)}
                            className="w-full flex justify-between items-center p-5 text-left cursor-pointer focus:outline-none focus:bg-slate-700/50"
                            aria-expanded={openAccordion === report.id}
                            aria-controls={`report-content-${report.id}`}
                        >
                            <h2 className="text-xl sm:text-2xl font-semibold text-sky-300">{report.title}</h2>
                            <ChevronDownIcon
                                className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${openAccordion === report.id ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <div
                            id={`report-content-${report.id}`}
                            className={`transition-all duration-500 ease-in-out ${openAccordion === report.id ? 'max-h-[2500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
                        >
                            <div className="p-6 text-left border-t border-slate-700 space-y-8">
                                <section>
                                    <h3 className="text-xl font-bold text-sky-400 mb-2">Algorithm Definition</h3>
                                    <p className="text-slate-300 leading-relaxed">{report.definition}</p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-sky-400 mb-2">Problem Solved</h3>
                                    <p className="text-slate-300 leading-relaxed">{report.problem}</p>
                                </section>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <section>
                                        <h3 className="text-xl font-bold text-sky-400 mb-2">Advantages</h3>
                                        <ul className="list-disc list-inside pl-4 space-y-2 text-slate-300">
                                            {report.pros.map((pro, index) => <li key={index}>{pro}</li>)}
                                        </ul>
                                    </section>
                                    <section>
                                        <h3 className="text-xl font-bold text-sky-400 mb-2">Disadvantages</h3>
                                        <ul className="list-disc list-inside pl-4 space-y-2 text-slate-300">
                                            {report.cons.map((con, index) => <li key={index}>{con}</li>)}
                                        </ul>
                                    </section>
                                </div>
                                
                                <section>
                                    <h3 className="text-xl font-bold text-sky-400 mb-2">Key Steps</h3>
                                    <ol className="list-decimal list-inside pl-4 space-y-2 text-slate-300">
                                        {report.steps.map((step, index) => <li key={index}>{step}</li>)}
                                    </ol>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-sky-400 mb-4">Time and Space Complexity</h3>
                                    <ComplexityTable data={report.complexity} />
                                </section>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportsPage;
