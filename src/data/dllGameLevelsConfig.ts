export interface DLLNodeData {
  id: string;
  data: string | number;
  prev: string | null;
  next: string | null;
}

export interface DLLGuidedStepDef {
  step: number;
  title: string;
  instruction: string;
  action: string;
  explanation: string;
  pointerChanges?: string[];
  stateSnapshot?: any;
}

export interface DLLLevelConfig {
  level: number;
  title: string;
  cardTitle: string;
  xp: number;
  difficulty: 'Beginner' | 'Easy' | 'Intermediate' | 'Advanced';
  goal: string;
  task: string;
  description: string;
  tasksList: string[];
  preview: string;
  accentColor: 'indigo' | 'blue' | 'purple' | 'violet' | 'cyan';
  iconName: 'Link' | 'ArrowLeftRight' | 'Layers' | 'Box' | 'PlusCircle' | 'CornerDownRight' | 'Split' | 'Trash2' | 'Scissors';
  learningOutcome: string;
  hints: [string, string, string]; // Hint 1: Conceptual clue, Hint 2: Pointer relationship clue, Hint 3: Exact operation/pseudocode
  feedback: {
    correct: string;
    wrong: string;
  };
  guidedSteps: DLLGuidedStepDef[];
}

export const DLL_9_LEVELS: DLLLevelConfig[] = [
  // LEVEL 1
  {
    level: 1,
    title: 'WHAT IS A DLL?',
    cardTitle: 'Task 1: What is a DLL?',
    xp: 140,
    difficulty: 'Beginner',
    goal: 'Understand that each DLL node contains PREV | DATA | NEXT and links bidirectionally.',
    task: 'Create nodes 10, 20, 30 and wire them bidirectionally: NULL ← 10 ⇄ 20 ⇄ 30 → NULL.',
    description: 'Teach that each DLL node contains: PREV | DATA | NEXT.',
    tasksList: [
      'Create first node DATA=10.',
      'Create second node DATA=20.',
      'Connect 10.NEXT → 20 and 20.PREV → 10.',
      'Add node 30 and create: NULL ← 10 ⇄ 20 ⇄ 30 → NULL.',
    ],
    preview: 'NULL ← [10] ⇄ [20] ⇄ [30] → NULL',
    accentColor: 'indigo',
    iconName: 'Link',
    learningOutcome: 'Every DLL node contains 3 fields: PREV pointer, DATA value, and NEXT pointer. Adjacent nodes must link in BOTH directions.',
    hints: [
      'Unlike a Singly Linked List which only moves forward, a Doubly Linked List links nodes in both forward (NEXT) and backward (PREV) directions.',
      'For adjacent nodes A and B, A.NEXT points to B, and B.PREV points back to A. The first node PREV and last node NEXT point to NULL.',
      'Exact operations: 10.PREV = NULL, 10.NEXT = 20, 20.PREV = 10, 20.NEXT = 30, 30.PREV = 20, 30.NEXT = NULL.',
    ],
    feedback: {
      correct: '🎉 Excellent! You built your first Doubly Linked List: NULL ← 10 ⇄ 20 ⇄ 30 → NULL!',
      wrong: '❌ Make sure both NEXT and PREV are connected between 10 ⇄ 20 ⇄ 30 and boundary pointers connect to NULL.',
    },
    guidedSteps: [
      {
        step: 1,
        title: 'Create Node 10 and set 10.PREV = NULL',
        instruction: 'Create first node with DATA=10 and terminate its PREV link at NULL.',
        action: '10.prev = NULL',
        explanation: 'Because Node 10 is the HEAD of the list, no node precedes it. Set 10.prev to NULL.',
        pointerChanges: ['10.prev = NULL'],
      },
      {
        step: 2,
        title: 'Create Node 20 and wire 10 ⇄ 20',
        instruction: 'Create second node with DATA=20, then set 10.NEXT → 20 and 20.PREV → 10.',
        action: '10.next → 20 and 20.prev → 10',
        explanation: 'In a Doubly Linked List, consecutive nodes must link to each other in both directions.',
        pointerChanges: ['10.next = 20', '20.prev = 10'],
      },
      {
        step: 3,
        title: 'Create Node 30 and wire 20 ⇄ 30',
        instruction: 'Create third node with DATA=30, wire 20.NEXT → 30 and 30.PREV → 20.',
        action: '20.next → 30 and 30.prev → 20',
        explanation: 'Node 20 points forward to 30, and Node 30 points backward to 20.',
        pointerChanges: ['20.next = 30', '30.prev = 20'],
      },
      {
        step: 4,
        title: 'Set 30.NEXT to NULL',
        instruction: 'Terminate the list: point Node 30.NEXT to NULL.',
        action: '30.next = NULL',
        explanation: 'Node 30 is the last node (TAIL), so its forward NEXT pointer terminates at NULL.',
        pointerChanges: ['30.next = NULL'],
      },
    ],
  },

  // LEVEL 2
  {
    level: 2,
    title: 'NODE MEMORY STRUCTURE',
    cardTitle: 'Task 2: Node Memory Structure',
    xp: 150,
    difficulty: 'Beginner',
    goal: 'Master the 3 internal fields of a DLL node: PREV, DATA, and NEXT.',
    task: 'Configure the memory slot fields: DATA=20, PREV → previous node, NEXT → next node, and inspect each field.',
    description: 'Teach PREV, DATA and NEXT fields.',
    tasksList: [
      'Set DATA=20.',
      'Set PREV → previous node.',
      'Set NEXT → next node.',
      'Inspect each field and explain its purpose.',
    ],
    preview: '[PREV | 20 | NEXT]',
    accentColor: 'blue',
    iconName: 'Box',
    learningOutcome: 'Each DLL node occupies a block of memory divided into three distinct segments: PREV (pointer), DATA (payload value), and NEXT (pointer).',
    hints: [
      'Think of a node as a three-compartment memory container: [PREV | DATA | NEXT].',
      'PREV holds the memory address of the node to the left (Node 10). NEXT holds the memory address of the node to the right (Node 30).',
      'Set DATA=20 in the middle slot, PREV to Node 10, NEXT to Node 30, and click each field to inspect its memory role.',
    ],
    feedback: {
      correct: '✅ Great job! You understand how PREV, DATA, and NEXT are arranged in memory.',
      wrong: '❌ Check the node fields: PREV on the left, DATA (20) in the center, and NEXT on the right.',
    },
    guidedSteps: [
      {
        step: 1,
        title: 'Set DATA = 20',
        instruction: 'Populate the center field of the memory node with value 20.',
        action: 'node.data = 20',
        explanation: 'The DATA section stores the actual payload value carried by the node.',
        pointerChanges: ['DATA = 20'],
      },
      {
        step: 2,
        title: 'Set PREV → previous node (10)',
        instruction: 'Wire the left PREV pointer field to the previous node (10).',
        action: 'node.prev = &node10',
        explanation: 'The PREV field stores the memory address of the preceding node, enabling backward navigation.',
        pointerChanges: ['PREV = Node 10'],
      },
      {
        step: 3,
        title: 'Set NEXT → next node (30)',
        instruction: 'Wire the right NEXT pointer field to the next node (30).',
        action: 'node.next = &node30',
        explanation: 'The NEXT field stores the memory address of the succeeding node, enabling forward navigation.',
        pointerChanges: ['NEXT = Node 30'],
      },
      {
        step: 4,
        title: 'Inspect each field',
        instruction: 'Inspect the 3 fields to verify memory addresses and data integrity.',
        action: 'Inspect PREV, DATA, NEXT',
        explanation: 'The node is now fully formed: [PREV (0x1000) | DATA (20) | NEXT (0x3000)].',
        pointerChanges: ['Inspected: Valid DLL Node'],
      },
    ],
  },

  // LEVEL 3
  {
    level: 3,
    title: 'HEAD & TAIL BOUNDS',
    cardTitle: 'Task 3: HEAD & TAIL Bounds',
    xp: 160,
    difficulty: 'Beginner',
    goal: 'Understand the boundary markers of a DLL: HEAD, TAIL, and terminal NULL pointers.',
    task: 'Set HEAD to the first node (10), TAIL to the last node (40), and ensure HEAD.PREV = NULL and TAIL.NEXT = NULL.',
    description: 'Teach HEAD, TAIL and boundary NULL pointers.',
    tasksList: [
      'Set HEAD to first node.',
      'Set TAIL to last node.',
      'Set HEAD.PREV = NULL.',
      'Set TAIL.NEXT = NULL.',
    ],
    preview: 'HEAD → [10] ⇄ [20] ⇄ [30] ⇄ [40] ← TAIL',
    accentColor: 'purple',
    iconName: 'ArrowLeftRight',
    learningOutcome: 'HEAD always references the first node with HEAD.PREV = NULL. TAIL always references the last node with TAIL.NEXT = NULL.',
    hints: [
      'HEAD is the front door of the list; TAIL is the back door. They mark where traversal begins or ends.',
      'Because nothing comes before HEAD, HEAD.PREV must point to NULL. Because nothing follows TAIL, TAIL.NEXT must point to NULL.',
      'Point HEAD to Node 10 and set 10.PREV = NULL. Point TAIL to Node 40 and set 40.NEXT = NULL.',
    ],
    feedback: {
      correct: '🎉 HEAD, TAIL, and boundary NULL pointers are correctly configured!',
      wrong: '❌ Remember: HEAD points to the first node (10) with PREV=NULL; TAIL points to the last node (40) with NEXT=NULL.',
    },
    guidedSteps: [
      {
        step: 1,
        title: 'Set HEAD to first node (10)',
        instruction: 'Assign the external HEAD pointer to Node 10.',
        action: 'HEAD = &node10',
        explanation: 'HEAD points to the first node, giving an entry point for forward traversal.',
        pointerChanges: ['HEAD = 10'],
      },
      {
        step: 2,
        title: 'Set TAIL to last node (40)',
        instruction: 'Assign the external TAIL pointer to Node 40.',
        action: 'TAIL = &node40',
        explanation: 'TAIL points to the last node, giving instant O(1) access to the end of the list.',
        pointerChanges: ['TAIL = 40'],
      },
      {
        step: 3,
        title: 'Set HEAD.PREV = NULL',
        instruction: 'Point Node 10.PREV to NULL.',
        action: 'HEAD.prev = NULL',
        explanation: 'The first node has no predecessor, so its backward link terminates at NULL.',
        pointerChanges: ['10.prev = NULL'],
      },
      {
        step: 4,
        title: 'Set TAIL.NEXT = NULL',
        instruction: 'Point Node 40.NEXT to NULL.',
        action: 'TAIL.next = NULL',
        explanation: 'The last node has no successor, so its forward link terminates at NULL.',
        pointerChanges: ['40.next = NULL'],
      },
    ],
  },

  // LEVEL 4
  {
    level: 4,
    title: 'BI-DIRECTIONAL TRAVERSAL',
    cardTitle: 'Task 4: Bi-directional Traversal',
    xp: 170,
    difficulty: 'Easy',
    goal: 'Experience forward traversal using NEXT and backward traversal using PREV.',
    task: 'Start from HEAD and step forward using NEXT to TAIL, then start from TAIL and step backward using PREV to HEAD.',
    description: 'Teach forward traversal using NEXT and backward traversal using PREV.',
    tasksList: [
      'Start from HEAD.',
      'Traverse using NEXT.',
      'Start from TAIL.',
      'Traverse backward using PREV.',
    ],
    preview: 'HEAD → [10] ⇄ [20] ⇄ [30] ⇄ [40] ← TAIL',
    accentColor: 'violet',
    iconName: 'Split',
    learningOutcome: 'Unlike singly linked lists, a Doubly Linked List allows bidirectional traversal in O(1) step time without auxiliary memory.',
    hints: [
      'Bi-directional traversal means walking the chain in either direction: left-to-right using NEXT or right-to-left using PREV.',
      'Forward: curr = HEAD, then curr = curr.NEXT until TAIL is reached. Backward: curr = TAIL, then curr = curr.PREV until HEAD is reached.',
      'Step forward: 10 → 20 → 30 → 40. Step backward: 40 → 30 → 20 → 10.',
    ],
    feedback: {
      correct: '🚀 Fantastic! You completed full bi-directional traversal across the Doubly Linked List!',
      wrong: '❌ Step forward from HEAD to TAIL using NEXT, then backward from TAIL to HEAD using PREV.',
    },
    guidedSteps: [
      {
        step: 1,
        title: 'Start at HEAD (Node 10)',
        instruction: 'Initialize current cursor at HEAD (Node 10).',
        action: 'curr = HEAD (10)',
        explanation: 'We begin our traversal at the entry point of the list.',
        pointerChanges: ['curr = 10 (HEAD)'],
      },
      {
        step: 2,
        title: 'Traverse forward using NEXT to TAIL',
        instruction: 'Follow curr.NEXT through 20 and 30 until reaching TAIL (40).',
        action: 'curr = curr.next (20 → 30 → 40)',
        explanation: 'Forward traversal follows each node\'s NEXT pointer until curr reaches TAIL.',
        pointerChanges: ['curr = 40 (TAIL reached)'],
      },
      {
        step: 3,
        title: 'Start at TAIL (Node 40)',
        instruction: 'Prepare for backward traversal beginning from TAIL (40).',
        action: 'curr = TAIL (40)',
        explanation: 'We can start right from the back of the list in O(1) time.',
        pointerChanges: ['curr = 40 (TAIL)'],
      },
      {
        step: 4,
        title: 'Traverse backward using PREV to HEAD',
        instruction: 'Follow curr.PREV through 30 and 20 until returning to HEAD (10).',
        action: 'curr = curr.prev (30 → 20 → 10)',
        explanation: 'Backward traversal follows PREV pointers in reverse until curr reaches HEAD.',
        pointerChanges: ['curr = 10 (HEAD reached)'],
      },
    ],
  },

  // LEVEL 5
  {
    level: 5,
    title: 'INSERT AT HEAD',
    cardTitle: 'Task 5: Insert at Head',
    xp: 180,
    difficulty: 'Easy',
    goal: 'Insert a new node (5) at the beginning of an existing DLL (10 ⇄ 20 ⇄ 30).',
    task: 'Create node 5, set 5.NEXT → 10, set 10.PREV → 5, set HEAD → 5, and set 5.PREV = NULL.',
    description: 'Initial: 10 ⇄ 20 ⇄ 30. Insert 5. Final: 5 ⇄ 10 ⇄ 20 ⇄ 30.',
    tasksList: [
      'Create node 5.',
      'Set 5.NEXT → 10.',
      'Set 10.PREV → 5.',
      'Set HEAD → 5 and 5.PREV = NULL.',
    ],
    preview: 'HEAD → [5] ⇄ [10] ⇄ [20] ⇄ [30]',
    accentColor: 'indigo',
    iconName: 'PlusCircle',
    learningOutcome: 'Inserting at the head takes O(1) time: wire the new node forward to the old head, point old head back to new node, then update HEAD.',
    hints: [
      'When inserting at the front, connect the new node to the old HEAD before updating the HEAD pointer so you don\'t lose the list.',
      '1) new_node.NEXT = HEAD, 2) HEAD.PREV = new_node, 3) HEAD = new_node, 4) new_node.PREV = NULL.',
      'Exact operations: 5.NEXT = 10, 10.PREV = 5, HEAD = 5, 5.PREV = NULL.',
    ],
    feedback: {
      correct: '🎉 Perfect! Node 5 is now the new HEAD. The list is: 5 ⇄ 10 ⇄ 20 ⇄ 30.',
      wrong: '❌ Check links: 5.PREV must be NULL, 5.NEXT must be 10, 10.PREV must be 5, and HEAD must point to 5.',
    },
    guidedSteps: [
      {
        step: 1,
        title: 'Create node 5',
        instruction: 'Allocate new node with DATA=5 in memory.',
        action: 'new_node = Node(5)',
        explanation: 'We allocate memory for node 5 with its PREV and NEXT unlinked.',
        pointerChanges: ['Node 5 created'],
      },
      {
        step: 2,
        title: 'Set 5.NEXT → 10',
        instruction: 'Point Node 5.NEXT forward to current HEAD (Node 10).',
        action: '5.next = 10',
        explanation: 'Node 5 establishes its forward link to the existing list.',
        pointerChanges: ['5.next = 10'],
      },
      {
        step: 3,
        title: 'Set 10.PREV → 5',
        instruction: 'Point Node 10.PREV backward to new Node 5.',
        action: '10.prev = 5',
        explanation: 'Node 10 acknowledges Node 5 as its new predecessor.',
        pointerChanges: ['10.prev = 5'],
      },
      {
        step: 4,
        title: 'Set HEAD → 5 and 5.PREV = NULL',
        instruction: 'Update HEAD pointer to point to Node 5 and set 5.PREV to NULL.',
        action: 'HEAD = 5, 5.prev = NULL',
        explanation: 'Node 5 is now the official start of the list with a NULL backward boundary.',
        pointerChanges: ['HEAD = 5', '5.prev = NULL'],
      },
    ],
  },

  // LEVEL 6
  {
    level: 6,
    title: 'INSERT AT TAIL',
    cardTitle: 'Task 6: Insert at Tail',
    xp: 180,
    difficulty: 'Easy',
    goal: 'Append a new node (30) to the end of an existing DLL (5 ⇄ 10 ⇄ 20).',
    task: 'Create node 30, set 20.NEXT → 30, set 30.PREV → 20, and set TAIL → 30 with 30.NEXT = NULL.',
    description: 'Initial: 5 ⇄ 10 ⇄ 20. Insert 30. Final: 5 ⇄ 10 ⇄ 20 ⇄ 30.',
    tasksList: [
      'Create node 30.',
      'Set 20.NEXT → 30.',
      'Set 30.PREV → 20.',
      'Set TAIL → 30 and 30.NEXT = NULL.',
    ],
    preview: '[5] ⇄ [10] ⇄ [20] ⇄ [30] ← TAIL',
    accentColor: 'blue',
    iconName: 'CornerDownRight',
    learningOutcome: 'Appending at the tail takes O(1) time: point the old tail forward to the new node, point new node back to old tail, and move TAIL.',
    hints: [
      'When appending at the end, attach the new node to the current TAIL and then move the TAIL pointer to the new node.',
      '1) TAIL.NEXT = new_node, 2) new_node.PREV = TAIL, 3) new_node.NEXT = NULL, 4) TAIL = new_node.',
      'Exact operations: 20.NEXT = 30, 30.PREV = 20, 30.NEXT = NULL, TAIL = 30.',
    ],
    feedback: {
      correct: '✅ Great job! Node 30 is now the TAIL. The list is: 5 ⇄ 10 ⇄ 20 ⇄ 30.',
      wrong: '❌ Required updates: 20.NEXT → 30, 30.PREV → 20, 30.NEXT → NULL, and TAIL → 30.',
    },
    guidedSteps: [
      {
        step: 1,
        title: 'Create node 30',
        instruction: 'Allocate new node with DATA=30 in memory.',
        action: 'new_node = Node(30)',
        explanation: 'We allocate memory for node 30 ready to be appended.',
        pointerChanges: ['Node 30 created'],
      },
      {
        step: 2,
        title: 'Set 20.NEXT → 30',
        instruction: 'Point current TAIL (Node 20).NEXT forward to Node 30.',
        action: '20.next = 30',
        explanation: 'The old TAIL now links forward to the new node.',
        pointerChanges: ['20.next = 30'],
      },
      {
        step: 3,
        title: 'Set 30.PREV → 20',
        instruction: 'Point Node 30.PREV backward to Node 20.',
        action: '30.prev = 20',
        explanation: 'Node 30 points backward to its predecessor Node 20.',
        pointerChanges: ['30.prev = 20'],
      },
      {
        step: 4,
        title: 'Set TAIL → 30 and 30.NEXT = NULL',
        instruction: 'Update TAIL pointer to Node 30 and terminate its NEXT pointer at NULL.',
        action: 'TAIL = 30, 30.next = NULL',
        explanation: 'Node 30 is now the official end of the list with a NULL boundary.',
        pointerChanges: ['TAIL = 30', '30.next = NULL'],
      },
    ],
  },

  // LEVEL 7
  {
    level: 7,
    title: 'INSERT AT POSITION',
    cardTitle: 'Task 7: Insert at Position',
    xp: 200,
    difficulty: 'Intermediate',
    goal: 'Insert a new node (30) between two existing nodes (20 and 40) in 10 ⇄ 20 ⇄ 40 ⇄ 50.',
    task: 'Create node 30, set 30.PREV → 20 and 30.NEXT → 40, set 20.NEXT → 30, and set 40.PREV → 30.',
    description: 'Initial: 10 ⇄ 20 ⇄ 40 ⇄ 50. Insert 30 between 20 and 40. Final: 10 ⇄ 20 ⇄ 30 ⇄ 40 ⇄ 50.',
    tasksList: [
      'Create node 30.',
      'Set 30.PREV → 20 and 30.NEXT → 40.',
      'Set 20.NEXT → 30.',
      'Set 40.PREV → 30.',
    ],
    preview: '[10] ⇄ [20] ⇄ [30] ⇄ [40] ⇄ [50]',
    accentColor: 'purple',
    iconName: 'Layers',
    learningOutcome: 'Inserting between two nodes requires exactly 4 pointer updates: 2 on the new node, and 1 on each surrounding neighbor.',
    hints: [
      'Inserting in the middle requires rewiring 4 pointers total: 2 on the new node, and 1 on each neighboring node.',
      'Safe order: first connect the new node\'s pointers (30.PREV=20, 30.NEXT=40) before modifying 20.NEXT and 40.PREV.',
      'Exact operations: 1) 30.PREV = 20, 30.NEXT = 40. 2) 20.NEXT = 30. 3) 40.PREV = 30.',
    ],
    feedback: {
      correct: '🎉 Outstanding! You rewired all 4 pointers to insert Node 30 between 20 and 40!',
      wrong: '❌ Required updates: 30.PREV → 20, 30.NEXT → 40, 20.NEXT → 30, and 40.PREV → 30.',
    },
    guidedSteps: [
      {
        step: 1,
        title: 'Create node 30',
        instruction: 'Allocate new node with DATA=30.',
        action: 'new_node = Node(30)',
        explanation: 'We allocate Node 30 ready to be spliced into the list.',
        pointerChanges: ['Node 30 created'],
      },
      {
        step: 2,
        title: 'Set 30.PREV → 20 and 30.NEXT → 40',
        instruction: 'Connect new node\'s pointers: 30.PREV to 20, and 30.NEXT to 40.',
        action: '30.prev = 20, 30.next = 40',
        explanation: 'By wiring the new node first, we avoid losing reference to either side of the chain.',
        pointerChanges: ['30.prev = 20', '30.next = 40'],
      },
      {
        step: 3,
        title: 'Set 20.NEXT → 30',
        instruction: 'Redirect Node 20.NEXT forward to Node 30.',
        action: '20.next = 30',
        explanation: 'Node 20 now points forward to new Node 30 instead of Node 40.',
        pointerChanges: ['20.next = 30'],
      },
      {
        step: 4,
        title: 'Set 40.PREV → 30',
        instruction: 'Redirect Node 40.PREV backward to Node 30.',
        action: '40.prev = 30',
        explanation: 'Node 40 now points backward to new Node 30 instead of Node 20. All 4 links complete!',
        pointerChanges: ['40.prev = 30'],
      },
    ],
  },

  // LEVEL 8
  {
    level: 8,
    title: 'DELETE HEAD & TAIL',
    cardTitle: 'Task 8: Delete Head & Tail',
    xp: 210,
    difficulty: 'Intermediate',
    goal: 'Delete both boundary nodes from 10 ⇄ 20 ⇄ 30 ⇄ 40 to result in 20 ⇄ 30.',
    task: 'Delete HEAD node 10, set HEAD → 20 with 20.PREV = NULL, delete TAIL node 40, and set TAIL → 30 with 30.NEXT = NULL.',
    description: 'Initial: 10 ⇄ 20 ⇄ 30 ⇄ 40. Tasks: Delete 10, advance HEAD; Delete 40, retreat TAIL. Final: 20 ⇄ 30.',
    tasksList: [
      'Delete HEAD node 10.',
      'Set HEAD → 20 and 20.PREV = NULL.',
      'Delete TAIL node 40.',
      'Set TAIL → 30 and 30.NEXT = NULL.',
    ],
    preview: 'HEAD → [20] ⇄ [30] ← TAIL',
    accentColor: 'violet',
    iconName: 'Trash2',
    learningOutcome: 'Deleting boundary nodes requires moving the boundary pointer (HEAD or TAIL) to the adjacent node and severing the old link with NULL.',
    hints: [
      'When deleting a boundary node, move the boundary pointer first, then set the new boundary\'s outer pointer to NULL to isolate the old node.',
      'Delete HEAD: HEAD = HEAD.NEXT, then HEAD.PREV = NULL. Delete TAIL: TAIL = TAIL.PREV, then TAIL.NEXT = NULL.',
      'Exact operations: 1) Delete 10. 2) HEAD = 20, 20.PREV = NULL. 3) Delete 40. 4) TAIL = 30, 30.NEXT = NULL.',
    ],
    feedback: {
      correct: '🔥 Excellent! You safely deleted both HEAD and TAIL. The remaining list is 20 ⇄ 30.',
      wrong: '❌ Delete Node 10 (HEAD → 20, 20.PREV → NULL), and Delete Node 40 (TAIL → 30, 30.NEXT → NULL).',
    },
    guidedSteps: [
      {
        step: 1,
        title: 'Delete HEAD node 10',
        instruction: 'Isolate and remove Node 10 from the front of the list.',
        action: 'Remove Node 10',
        explanation: 'We mark Node 10 for deletion.',
        pointerChanges: ['Node 10 marked for removal'],
      },
      {
        step: 2,
        title: 'Set HEAD → 20 and 20.PREV = NULL',
        instruction: 'Advance HEAD pointer to Node 20 and terminate 20.PREV at NULL.',
        action: 'HEAD = 20, 20.prev = NULL',
        explanation: 'Node 20 is now the new first node with no predecessor.',
        pointerChanges: ['HEAD = 20', '20.prev = NULL'],
      },
      {
        step: 3,
        title: 'Delete TAIL node 40',
        instruction: 'Isolate and remove Node 40 from the back of the list.',
        action: 'Remove Node 40',
        explanation: 'We mark Node 40 for deletion.',
        pointerChanges: ['Node 40 marked for removal'],
      },
      {
        step: 4,
        title: 'Set TAIL → 30 and 30.NEXT = NULL',
        instruction: 'Retreat TAIL pointer to Node 30 and terminate 30.NEXT at NULL.',
        action: 'TAIL = 30, 30.next = NULL',
        explanation: 'Node 30 is now the new last node with no successor. Final list: 20 ⇄ 30.',
        pointerChanges: ['TAIL = 30', '30.next = NULL'],
      },
    ],
  },

  // LEVEL 9
  {
    level: 9,
    title: 'DELETE MIDDLE NODE',
    cardTitle: 'Task 9: Delete Middle Node',
    xp: 250,
    difficulty: 'Advanced',
    goal: 'Remove middle node 30 from 10 ⇄ 20 ⇄ 30 ⇄ 40 ⇄ 50 to produce 10 ⇄ 20 ⇄ 40 ⇄ 50.',
    task: 'Select node 30, set 20.NEXT → 40, set 40.PREV → 20, and remove node 30 from memory.',
    description: 'Initial: 10 ⇄ 20 ⇄ 30 ⇄ 40 ⇄ 50. Delete node 30. Final: 10 ⇄ 20 ⇄ 40 ⇄ 50.',
    tasksList: [
      'Select node 30.',
      'Set 20.NEXT → 40.',
      'Set 40.PREV → 20.',
      'Remove node 30.',
    ],
    preview: '[10] ⇄ [20] ⇄ [40] ⇄ [50]',
    accentColor: 'indigo',
    iconName: 'Scissors',
    learningOutcome: 'Deleting an interior node requires bypassing it in both directions: predecessor.NEXT points to successor, and successor.PREV points to predecessor.',
    hints: [
      'Deleting a middle node means connecting its predecessor directly to its successor, bypassing the target node completely.',
      'Formula: target.PREV.NEXT = target.NEXT, and target.NEXT.PREV = target.PREV, then free target.',
      'Exact operations: 1) Select 30. 2) 20.NEXT = 40. 3) 40.PREV = 20. 4) Free node 30.',
    ],
    feedback: {
      correct: '🏆 Mastered! You bypassed Node 30 in both directions and preserved the list: 10 ⇄ 20 ⇄ 40 ⇄ 50.',
      wrong: '❌ To delete Node 30: connect 20.NEXT directly to 40, and 40.PREV directly to 20, then free Node 30.',
    },
    guidedSteps: [
      {
        step: 1,
        title: 'Select node 30',
        instruction: 'Target Node 30 located between Node 20 and Node 40.',
        action: 'target = Node 30',
        explanation: 'We identify Node 30 to be unlinked and deleted.',
        pointerChanges: ['Target selected: Node 30'],
      },
      {
        step: 2,
        title: 'Set 20.NEXT → 40',
        instruction: 'Point Node 20.NEXT directly forward to Node 40.',
        action: '20.next = 40',
        explanation: 'Node 20 bypasses Node 30, forwarding directly to Node 40.',
        pointerChanges: ['20.next = 40'],
      },
      {
        step: 3,
        title: 'Set 40.PREV → 20',
        instruction: 'Point Node 40.PREV directly backward to Node 20.',
        action: '40.prev = 20',
        explanation: 'Node 40 bypasses Node 30, pointing backward to Node 20.',
        pointerChanges: ['40.prev = 20'],
      },
      {
        step: 4,
        title: 'Remove node 30',
        instruction: 'Free Node 30 from memory and complete the operation.',
        action: 'free(node 30)',
        explanation: 'Node 30 is safely detached from memory. Unbroken list: 10 ⇄ 20 ⇄ 40 ⇄ 50.',
        pointerChanges: ['Node 30 freed', 'List: 10 ⇄ 20 ⇄ 40 ⇄ 50'],
      },
    ],
  },
];
