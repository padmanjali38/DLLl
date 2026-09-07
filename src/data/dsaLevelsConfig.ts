export interface DSAGuidedStep {
  step: number;
  instruction: string;
  explanation: string;
  actionHighlight?: string;
  stateSnapshot: any;
}

export interface DSALevelDefinition {
  level: number;
  title: string;
  progressType: string;
  difficulty: 'Very Easy' | 'Easy' | 'Medium' | 'Hard' | 'Expert';
  xp: number;
  status: 'unlocked' | 'locked';
  description: string;
  concept: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  guidedSteps: DSAGuidedStep[];
  whatWasLearned: string[];
  normalTask: {
    prompt: string;
    objective: string;
    hint: string;
    initialData: any;
  };
}

export const DSA_GAME_LEVELS: DSALevelDefinition[] = [
  // LEVEL 1: Data Structure Detective
  {
    level: 1,
    title: 'Data Structure Detective',
    progressType: 'Identify',
    difficulty: 'Very Easy',
    xp: 500,
    status: 'unlocked',
    description: 'Identify the right data structure for different problems.',
    concept: 'Introduction to Array, Stack, Queue, Linked List and Tree.',
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    guidedSteps: [
      {
        step: 1,
        instruction: 'Read the requirement.',
        actionHighlight: 'scenario',
        explanation: 'The problem asks for a fixed indexed collection where elements can be accessed instantly by index.',
        stateSnapshot: {
          scenario: 'I need to store elements in a fixed indexed collection with instant random access.',
          highlightedOption: null,
          selectedOption: null,
          options: ['Array', 'Stack', 'Queue', 'Linked List', 'Tree'],
        },
      },
      {
        step: 2,
        instruction: 'Compare the available data structures.',
        actionHighlight: 'options',
        explanation: 'An Array provides contiguous memory with numeric indices [0, 1, 2...], making it ideal for fixed indexed collections.',
        stateSnapshot: {
          scenario: 'I need to store elements in a fixed indexed collection with instant random access.',
          highlightedOption: 'Array',
          selectedOption: null,
          options: ['Array', 'Stack', 'Queue', 'Linked List', 'Tree'],
        },
      },
      {
        step: 3,
        instruction: 'Choose Array.',
        actionHighlight: 'selected',
        explanation: 'Array is the correct data structure because it provides O(1) indexed access and fixed-size layout.',
        stateSnapshot: {
          scenario: 'I need to store elements in a fixed indexed collection with instant random access.',
          highlightedOption: 'Array',
          selectedOption: 'Array',
          options: ['Array', 'Stack', 'Queue', 'Linked List', 'Tree'],
          isCorrect: true,
        },
      },
    ],
    whatWasLearned: [
      'Arrays offer contiguous memory and instant O(1) random lookup via numeric index.',
      'Stacks follow LIFO (Last-In First-Out) for backtrack/undo operations.',
      'Queues follow FIFO (First-In First-Out) for arrival-order processing.',
      'Linked Lists allow dynamic resizing and fast insertion/deletion at nodes.',
      'Trees organize hierarchical relationships with parent and child links.',
    ],
    normalTask: {
      prompt: 'Match each real-world challenge to its optimal data structure:',
      objective: 'Solve all 3 scenario investigations to earn +500 XP.',
      hint: 'Remember: Browser Back button = Stack (LIFO), Printer jobs = Queue (FIFO), Fixed lookup table = Array.',
      initialData: {
        scenarios: [
          {
            id: 's1',
            question: '1. Storing browser history where clicking "Back" returns to the most recently visited page.',
            correct: 'Stack',
            options: ['Stack', 'Queue', 'Array', 'Tree'],
          },
          {
            id: 's2',
            question: '2. Managing print jobs in an office so documents print in the exact order they were sent.',
            correct: 'Queue',
            options: ['Stack', 'Queue', 'Linked List', 'Array'],
          },
          {
            id: 's3',
            question: '3. A phone keypad mapping digits 0–9 to fixed memory slots with instant lookup.',
            correct: 'Array',
            options: ['Array', 'Stack', 'Queue', 'Tree'],
          },
        ],
      },
    },
  },

  // LEVEL 2: Array Builder
  {
    level: 2,
    title: 'Array Builder',
    progressType: 'Build',
    difficulty: 'Easy',
    xp: 500,
    status: 'locked',
    description: 'Build arrays and master positions, indexes and elements.',
    concept: 'Array positions, indexing, insertion and retrieval.',
    accentColor: 'blue',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    badgeText: 'text-blue-600 dark:text-blue-400',
    guidedSteps: [
      {
        step: 1,
        instruction: 'Find the element 40.',
        actionHighlight: 'element-40',
        explanation: 'We need to place the value 40 into the requested index position.',
        stateSnapshot: {
          array: [null, null, null, null, null],
          targetValue: 40,
          targetIndex: 2,
          highlightedSlot: null,
          highlightedElement: 40,
        },
      },
      {
        step: 2,
        instruction: 'Locate index 2.',
        actionHighlight: 'index-2',
        explanation: 'Array indexing starts from 0, so index 2 is the 3rd slot: slot 0, slot 1, slot 2.',
        stateSnapshot: {
          array: [null, null, null, null, null],
          targetValue: 40,
          targetIndex: 2,
          highlightedSlot: 2,
          highlightedElement: 40,
        },
      },
      {
        step: 3,
        instruction: 'Place 40 at index 2.',
        actionHighlight: 'placed',
        explanation: 'The value 40 is now stored at array[2]. The array index provides instant O(1) access to this slot.',
        stateSnapshot: {
          array: [null, null, 40, null, null],
          targetValue: 40,
          targetIndex: 2,
          highlightedSlot: 2,
          highlightedElement: null,
          isCompleted: true,
        },
      },
    ],
    whatWasLearned: [
      'Array indexes are zero-based: the first element is at index 0.',
      'Index 2 refers to the 3rd physical memory slot.',
      'Accessing any array element by its index takes constant O(1) time.',
    ],
    normalTask: {
      prompt: 'Build the target array by placing elements into the correct zero-indexed slots:',
      objective: 'Place 10 at index 0, 40 at index 2, and 50 at index 4.',
      hint: 'Click on a value card, then click on the target slot [0..4] to insert.',
      initialData: {
        slotsCount: 5,
        required: { 0: 10, 2: 40, 4: 50 },
        availableValues: [10, 25, 40, 50, 99],
      },
    },
  },

  // LEVEL 3: Stack Tower
  {
    level: 3,
    title: 'Stack Tower',
    progressType: 'Operate',
    difficulty: 'Easy',
    xp: 500,
    status: 'locked',
    description: 'Build and operate a stack using PUSH and POP.',
    concept: 'Stack and LIFO.',
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    badgeText: 'text-indigo-600 dark:text-indigo-400',
    guidedSteps: [
      {
        step: 1,
        instruction: 'PUSH 10.',
        actionHighlight: 'push-10',
        explanation: 'PUSH adds an element to the top of the stack. 10 is now at the base and is currently the TOP.',
        stateSnapshot: {
          stack: [10],
          topIndex: 0,
          topValue: 10,
          lastAction: 'PUSH 10',
        },
      },
      {
        step: 2,
        instruction: 'PUSH 20.',
        actionHighlight: 'push-20',
        explanation: 'PUSH adds 20 onto the top of 10. 20 becomes the new TOP.',
        stateSnapshot: {
          stack: [10, 20],
          topIndex: 1,
          topValue: 20,
          lastAction: 'PUSH 20',
        },
      },
      {
        step: 3,
        instruction: 'PUSH 30.',
        actionHighlight: 'push-30',
        explanation: 'PUSH adds 30 on top of 20. 30 is now the active TOP element.',
        stateSnapshot: {
          stack: [10, 20, 30],
          topIndex: 2,
          topValue: 30,
          lastAction: 'PUSH 30',
        },
      },
      {
        step: 4,
        instruction: 'POP.',
        actionHighlight: 'pop-30',
        explanation: 'Stack follows LIFO (Last-In First-Out). POP removes the most recently added element (30). 20 is the new TOP.',
        stateSnapshot: {
          stack: [10, 20],
          poppedValue: 30,
          topIndex: 1,
          topValue: 20,
          lastAction: 'POP (removed 30)',
          isCompleted: true,
        },
      },
    ],
    whatWasLearned: [
      'Stack is a LIFO (Last-In, First-Out) data structure.',
      'PUSH adds an element to the TOP of the stack.',
      'POP removes the most recently added element from the TOP.',
      'Both PUSH and POP operate in constant O(1) time.',
    ],
    normalTask: {
      prompt: 'Operate the Stack Tower to match the target sequence:',
      objective: 'Execute operations to leave the stack with exactly [10, 20] and TOP = 20.',
      hint: 'Push 10, Push 20, Push 30, then Pop 30!',
      initialData: {
        targetStack: [10, 20],
        initialStack: [],
      },
    },
  },

  // LEVEL 4: Queue Station
  {
    level: 4,
    title: 'Queue Station',
    progressType: 'Manage',
    difficulty: 'Medium',
    xp: 500,
    status: 'locked',
    description: 'Manage a queue and understand who leaves first.',
    concept: 'Queue and FIFO.',
    accentColor: 'cyan',
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    badgeText: 'text-cyan-600 dark:text-cyan-400',
    guidedSteps: [
      {
        step: 1,
        instruction: 'ENQUEUE A.',
        actionHighlight: 'enqueue-A',
        explanation: 'ENQUEUE adds an element to the rear of the queue. Customer A is both the FRONT and REAR.',
        stateSnapshot: {
          queue: ['A'],
          front: 'A',
          rear: 'A',
          lastAction: 'ENQUEUE A',
        },
      },
      {
        step: 2,
        instruction: 'ENQUEUE B.',
        actionHighlight: 'enqueue-B',
        explanation: 'ENQUEUE adds B behind A. FRONT remains A, while REAR is now B.',
        stateSnapshot: {
          queue: ['A', 'B'],
          front: 'A',
          rear: 'B',
          lastAction: 'ENQUEUE B',
        },
      },
      {
        step: 3,
        instruction: 'ENQUEUE C.',
        actionHighlight: 'enqueue-C',
        explanation: 'C joins the queue at the rear behind B. C is now the REAR element.',
        stateSnapshot: {
          queue: ['A', 'B', 'C'],
          front: 'A',
          rear: 'C',
          lastAction: 'ENQUEUE C',
        },
      },
      {
        step: 4,
        instruction: 'DEQUEUE.',
        actionHighlight: 'dequeue-A',
        explanation: 'Queue follows FIFO (First-In, First-Out). DEQUEUE removes A from the FRONT. B is now at the FRONT!',
        stateSnapshot: {
          queue: ['B', 'C'],
          dequeued: 'A',
          front: 'B',
          rear: 'C',
          lastAction: 'DEQUEUE (Served A)',
          isCompleted: true,
        },
      },
    ],
    whatWasLearned: [
      'Queue is a FIFO (First-In, First-Out) data structure.',
      'ENQUEUE adds new arrivals to the REAR.',
      'DEQUEUE removes the oldest element from the FRONT.',
      'Queue order models line-ups, ticket counters, and scheduling pipelines.',
    ],
    normalTask: {
      prompt: 'Manage the queue arrivals and departures to serve passengers in FIFO order:',
      objective: 'ENQUEUE Passenger A, B, C, then DEQUEUE Passenger A so the queue holds [B, C].',
      hint: 'Click ENQUEUE buttons to add passengers, then click DEQUEUE to serve the front passenger.',
      initialData: {
        targetQueue: ['B', 'C'],
        initialQueue: [],
      },
    },
  },

  // LEVEL 5: Linked List Workshop
  {
    level: 5,
    title: 'Linked List Workshop',
    progressType: 'Connect',
    difficulty: 'Medium',
    xp: 500,
    status: 'locked',
    description: 'Connect nodes and manipulate linked-list links.',
    concept: 'Nodes, DATA, NEXT and linked-list operations.',
    accentColor: 'purple',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
    badgeText: 'text-purple-600 dark:text-purple-400',
    guidedSteps: [
      {
        step: 1,
        instruction: 'Select node 10.',
        actionHighlight: 'node-10',
        explanation: 'This will be the first node in the linked list (HEAD). Each node holds DATA and a NEXT pointer.',
        stateSnapshot: {
          nodes: [
            { id: 'n1', data: 10, next: null },
            { id: 'n2', data: 20, next: null },
            { id: 'n3', data: 30, next: null },
          ],
          activeHighlight: 'n1',
          head: 'n1',
          chainDesc: 'HEAD → [10 | NULL]',
        },
      },
      {
        step: 2,
        instruction: 'Connect 10 to 20.',
        actionHighlight: 'link-10-20',
        explanation: 'The NEXT field of node 10 is set to point to node 20: node10.next = node20.',
        stateSnapshot: {
          nodes: [
            { id: 'n1', data: 10, next: 'n2' },
            { id: 'n2', data: 20, next: null },
            { id: 'n3', data: 30, next: null },
          ],
          activeHighlight: 'link-10-20',
          head: 'n1',
          chainDesc: 'HEAD → [10] → [20 | NULL]',
        },
      },
      {
        step: 3,
        instruction: 'Connect 20 to 30.',
        actionHighlight: 'link-20-30',
        explanation: 'The NEXT field of node 20 is set to point to node 30: node20.next = node30.',
        stateSnapshot: {
          nodes: [
            { id: 'n1', data: 10, next: 'n2' },
            { id: 'n2', data: 20, next: 'n3' },
            { id: 'n3', data: 30, next: null },
          ],
          activeHighlight: 'link-20-30',
          head: 'n1',
          chainDesc: 'HEAD → [10] → [20] → [30 | NULL]',
        },
      },
      {
        step: 4,
        instruction: 'End the list.',
        actionHighlight: 'link-null',
        explanation: 'Set the final NEXT pointer of node 30 to NULL. NULL signals the boundary where the list terminates.',
        stateSnapshot: {
          nodes: [
            { id: 'n1', data: 10, next: 'n2' },
            { id: 'n2', data: 20, next: 'n3' },
            { id: 'n3', data: 30, next: 'NULL' },
          ],
          activeHighlight: 'null-end',
          head: 'n1',
          chainDesc: 'HEAD → [10] → [20] → [30] → NULL',
          isCompleted: true,
        },
      },
    ],
    whatWasLearned: [
      'A Linked List node consists of a DATA value and a NEXT memory pointer.',
      'The list begins at the HEAD reference pointer.',
      'Connecting nodes requires setting node.next = targetNode.',
      'The final node in a singly or doubly linked list points to NULL.',
    ],
    normalTask: {
      prompt: 'Construct a linked list chain connecting 10 → 20 → 30 → NULL:',
      objective: 'Wire the NEXT pointers to connect all 3 nodes in ascending sequence and terminate at NULL.',
      hint: 'Click "Connect Next" between nodes, then set the final node\'s NEXT pointer to NULL.',
      initialData: {
        nodes: [
          { id: 'n1', data: 10, next: null },
          { id: 'n2', data: 20, next: null },
          { id: 'n3', data: 30, next: null },
        ],
      },
    },
  },

  // LEVEL 6: Tree Builder
  {
    level: 6,
    title: 'Tree Builder',
    progressType: 'Organize',
    difficulty: 'Medium',
    xp: 500,
    status: 'locked',
    description: 'Build a tree and understand its hierarchy.',
    concept: 'Root, parent, child, leaf and binary tree.',
    accentColor: 'amber',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
    badgeText: 'text-amber-600 dark:text-amber-400',
    guidedSteps: [
      {
        step: 1,
        instruction: 'Place 50.',
        actionHighlight: 'place-root',
        explanation: 'The first value becomes the ROOT of the tree. Every binary search tree traversal starts at the root.',
        stateSnapshot: {
          root: 50,
          left: null,
          right: null,
          highlight: 'root',
          placedNodes: [50],
        },
      },
      {
        step: 2,
        instruction: 'Place 30.',
        actionHighlight: 'place-left',
        explanation: '30 is smaller than 50 (30 < 50), so according to Binary Search Tree rules, it goes to the LEFT child.',
        stateSnapshot: {
          root: 50,
          left: 30,
          right: null,
          highlight: 'left',
          placedNodes: [50, 30],
        },
      },
      {
        step: 3,
        instruction: 'Place 70.',
        actionHighlight: 'place-right',
        explanation: '70 is greater than 50 (70 > 50), so it goes to the RIGHT child.',
        stateSnapshot: {
          root: 50,
          left: 30,
          right: 70,
          highlight: 'right',
          placedNodes: [50, 30, 70],
        },
      },
      {
        step: 4,
        instruction: 'Continue placing the remaining nodes.',
        actionHighlight: 'place-subtrees',
        explanation: '20 (< 30) & 40 (> 30) attach under 30. 60 (< 70) & 80 (> 70) attach under 70, completing the balanced BST!',
        stateSnapshot: {
          root: 50,
          left: 30,
          right: 70,
          leftLeft: 20,
          leftRight: 40,
          rightLeft: 60,
          rightRight: 80,
          highlight: 'complete',
          placedNodes: [50, 30, 70, 20, 40, 60, 80],
          isCompleted: true,
        },
      },
    ],
    whatWasLearned: [
      'The topmost node with no parent is called the ROOT.',
      'In a Binary Search Tree (BST), left child < parent and right child > parent.',
      'Nodes with no children are called LEAF nodes.',
      'Hierarchical tree structures allow O(log N) lookup and insertion.',
    ],
    normalTask: {
      prompt: 'Construct the Binary Search Tree using the values [50, 30, 70, 20, 40]:',
      objective: 'Place 50 at root, 30 left, 70 right, 20 left-child of 30, and 40 right-child of 30.',
      hint: 'Remember BST invariant: smaller values go to the left, larger values go to the right.',
      initialData: {
        availableValues: [50, 30, 70, 20, 40],
      },
    },
  },

  // LEVEL 7: Sorting Race
  {
    level: 7,
    title: 'Sorting Race',
    progressType: 'Sort',
    difficulty: 'Hard',
    xp: 500,
    status: 'locked',
    description: 'Race through comparisons and sort numbers correctly.',
    concept: 'Sorting and beginner Bubble Sort.',
    accentColor: 'rose',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
    badgeText: 'text-rose-600 dark:text-rose-400',
    guidedSteps: [
      {
        step: 1,
        instruction: 'Compare 40 and 10.',
        actionHighlight: 'compare-40-10',
        explanation: 'Bubble Sort compares neighboring elements at index 0 and index 1. Here, 40 and 10 are being compared.',
        stateSnapshot: {
          array: [40, 10, 30, 20, 50],
          comparingIndices: [0, 1],
          lastAction: 'Compare 40 vs 10',
        },
      },
      {
        step: 2,
        instruction: '40 is greater than 10.',
        actionHighlight: 'swap-40-10',
        explanation: 'Since 40 > 10, they are out of order. We SWAP them so the larger number bubbles to the right.',
        stateSnapshot: {
          array: [10, 40, 30, 20, 50],
          comparingIndices: [0, 1],
          swapped: true,
          lastAction: 'Swapped 40 & 10',
        },
      },
      {
        step: 3,
        instruction: 'Compare the next pair.',
        actionHighlight: 'compare-40-30',
        explanation: 'We now compare index 1 and index 2: 40 and 30. Since 40 > 30, we swap them as well.',
        stateSnapshot: {
          array: [10, 30, 40, 20, 50],
          comparingIndices: [1, 2],
          swapped: true,
          lastAction: 'Swapped 40 & 30',
        },
      },
      {
        step: 4,
        instruction: 'Continue the comparisons and swaps.',
        actionHighlight: 'sort-complete',
        explanation: 'Comparing 40 & 20 yields a swap, leaving 40 at index 3. 40 and 50 are compared (40 < 50, no swap). All passes complete: array is sorted!',
        stateSnapshot: {
          array: [10, 20, 30, 40, 50],
          comparingIndices: [],
          isSorted: true,
          lastAction: 'Array completely sorted [10, 20, 30, 40, 50]',
          isCompleted: true,
        },
      },
    ],
    whatWasLearned: [
      'Bubble Sort repeatedly compares adjacent elements and swaps them if out of order.',
      'In each pass, the largest unsorted element "bubbles up" to its correct position on the right.',
      'Bubble sort takes O(N²) worst-case time and O(1) auxiliary space.',
    ],
    normalTask: {
      prompt: 'Execute Bubble Sort steps to sort [40, 10, 30, 20, 50] into ascending order:',
      objective: 'Use Compare and Swap controls to sort the list into [10, 20, 30, 40, 50].',
      hint: 'Compare adjacent elements. If left > right, click Swap! Otherwise advance to next pair.',
      initialData: {
        initialArray: [40, 10, 30, 20, 50],
        targetArray: [10, 20, 30, 40, 50],
      },
    },
  },

  // LEVEL 8: Search Mission
  {
    level: 8,
    title: 'Search Mission',
    progressType: 'Search',
    difficulty: 'Hard',
    xp: 500,
    status: 'locked',
    description: 'Find targets using Linear Search and Binary Search.',
    concept: 'Linear Search and Binary Search.',
    accentColor: 'teal',
    badgeBg: 'bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30',
    badgeText: 'text-teal-600 dark:text-teal-400',
    guidedSteps: [
      {
        step: 1,
        instruction: 'Start with the complete sorted array.',
        actionHighlight: 'full-range',
        explanation: 'Binary Search requires a sorted collection. Search interval starts with LOW = 0 (10) and HIGH = 6 (70). Target = 60.',
        stateSnapshot: {
          array: [10, 20, 30, 40, 50, 60, 70],
          low: 0,
          high: 6,
          mid: null,
          target: 60,
          searchSpace: [0, 1, 2, 3, 4, 5, 6],
        },
      },
      {
        step: 2,
        instruction: 'Check the middle value.',
        actionHighlight: 'mid-40',
        explanation: 'Calculate MID = floor((0 + 6) / 2) = index 3. Array[3] = 40.',
        stateSnapshot: {
          array: [10, 20, 30, 40, 50, 60, 70],
          low: 0,
          high: 6,
          mid: 3,
          midValue: 40,
          target: 60,
          searchSpace: [0, 1, 2, 3, 4, 5, 6],
        },
      },
      {
        step: 3,
        instruction: 'Compare 60 with 40.',
        actionHighlight: 'eliminate-left',
        explanation: 'Since 60 > 40, target must be in the right half. We eliminate the entire left half: LOW becomes mid + 1 = index 4.',
        stateSnapshot: {
          array: [10, 20, 30, 40, 50, 60, 70],
          low: 4,
          high: 6,
          mid: 3,
          target: 60,
          searchSpace: [4, 5, 6],
        },
      },
      {
        step: 4,
        instruction: 'Check the new middle.',
        actionHighlight: 'found-target',
        explanation: 'New MID = floor((4 + 6) / 2) = index 5. Array[5] = 60. Array[5] == Target! Target found in only 2 comparisons!',
        stateSnapshot: {
          array: [10, 20, 30, 40, 50, 60, 70],
          low: 4,
          high: 6,
          mid: 5,
          midValue: 60,
          target: 60,
          found: true,
          isCompleted: true,
        },
      },
    ],
    whatWasLearned: [
      'Linear Search scans elements one by one in O(N) time.',
      'Binary Search requires a sorted array and halves the search space each step in O(log N) time.',
      'Midpoint calculation: mid = floor((low + high) / 2).',
      'If target > mid, discard left (low = mid + 1). If target < mid, discard right (high = mid - 1).',
    ],
    normalTask: {
      prompt: 'Find target value 60 in the sorted array using Binary Search:',
      objective: 'Calculate Low, High, Mid and pinpoint the target at index 5.',
      hint: 'Array is [10, 20, 30, 40, 50, 60, 70]. Check middle (40). Since 60 > 40, search right half [50, 60, 70].',
      initialData: {
        array: [10, 20, 30, 40, 50, 60, 70],
        target: 60,
      },
    },
  },

  // LEVEL 9: DSA Master Challenge
  {
    level: 9,
    title: 'DSA Master Challenge',
    progressType: 'Master',
    difficulty: 'Expert',
    xp: 1000,
    status: 'locked',
    description: 'Combine everything you learned in one final challenge.',
    concept: 'Choosing the correct data structure and algorithm.',
    accentColor: 'violet',
    badgeBg: 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/30',
    badgeText: 'text-violet-600 dark:text-violet-400',
    guidedSteps: [
      {
        step: 1,
        instruction: 'Choose Queue for processing customers in arrival order.',
        actionHighlight: 'mission-queue',
        explanation: 'Customer ticketing and requests require FIFO order. Queue guarantees the first customer to arrive is served first.',
        stateSnapshot: {
          mission: 1,
          topic: 'Queue (FIFO)',
          answer: 'Queue',
          status: 'verified',
        },
      },
      {
        step: 2,
        instruction: 'Perform the Stack PUSH/POP challenge.',
        actionHighlight: 'mission-stack',
        explanation: 'Stack uses LIFO. Adding items on top and popping returns the latest element, exactly like browser back/forward or undo/redo.',
        stateSnapshot: {
          mission: 2,
          topic: 'Stack (LIFO)',
          answer: 'PUSH & POP',
          status: 'verified',
        },
      },
      {
        step: 3,
        instruction: 'Insert 30 into the linked list.',
        actionHighlight: 'mission-linked-list',
        explanation: 'Updating adjacent NEXT and PREV pointer references re-routes the chain in O(1) time without shifting elements.',
        stateSnapshot: {
          mission: 3,
          topic: 'Linked List Splicing',
          answer: 'Pointer Rewiring',
          status: 'verified',
        },
      },
      {
        step: 4,
        instruction: 'Build the requested tree.',
        actionHighlight: 'mission-tree',
        explanation: 'BST maintains sorted order hierarchically: left child < parent < right child, providing fast O(log N) operations.',
        stateSnapshot: {
          mission: 4,
          topic: 'Binary Search Tree',
          answer: 'Left < Root < Right',
          status: 'verified',
        },
      },
      {
        step: 5,
        instruction: 'Sort the provided numbers.',
        actionHighlight: 'mission-sort',
        explanation: 'Adjacent comparison and swapping bubble the largest unsorted value into place until all items are ordered.',
        stateSnapshot: {
          mission: 5,
          topic: 'Sorting (Bubble Sort)',
          answer: 'Ascending Order',
          status: 'verified',
        },
      },
      {
        step: 6,
        instruction: 'Choose Binary Search for a sorted array.',
        actionHighlight: 'mission-search',
        explanation: 'In a sorted array, Binary Search eliminates half the remaining items at each step, making it dramatically faster than Linear Search.',
        stateSnapshot: {
          mission: 6,
          topic: 'Binary Search O(log N)',
          answer: 'Binary Search',
          status: 'verified',
          isCompleted: true,
        },
      },
    ],
    whatWasLearned: [
      'Mastered the core trade-offs between Arrays, Stacks, Queues, Linked Lists, and Trees.',
      'Learned when to use LIFO vs FIFO vs Hierarchical structures.',
      'Understood the logarithmic power of Binary Search on sorted data.',
      'Congratulations on completing the entire DSA Master curriculum!',
    ],
    normalTask: {
      prompt: 'Synthesize your DSA knowledge across 4 grand master quiz & operation challenges:',
      objective: 'Score 100% on the final master assessment to earn the DSA Master Champion status and +1000 XP.',
      hint: 'Review your key principles: Stack = LIFO, Queue = FIFO, Binary Search = O(log N), BST = left < root < right.',
      initialData: {
        questions: [
          {
            id: 'm1',
            q: 'Which data structure is optimal for handling real-time customer queues in arrival order?',
            options: ['Queue (FIFO)', 'Stack (LIFO)', 'Binary Tree', 'Unordered Array'],
            correct: 'Queue (FIFO)',
          },
          {
            id: 'm2',
            q: 'What is the time complexity of searching a sorted array of N elements using Binary Search?',
            options: ['O(log N)', 'O(N)', 'O(N²)', 'O(1)'],
            correct: 'O(log N)',
          },
          {
            id: 'm3',
            q: 'In a Binary Search Tree (BST), where is a value smaller than the root placed?',
            options: ['Left subtree', 'Right subtree', 'At the tail', 'In random slot'],
            correct: 'Left subtree',
          },
          {
            id: 'm4',
            q: 'Which data structure allows constant-time O(1) insertion and deletion at both ends with bidirectional links?',
            options: ['Doubly Linked List', 'Single Array', 'Binary Heap', 'Queue with single pointer'],
            correct: 'Doubly Linked List',
          },
        ],
      },
    },
  },
];
