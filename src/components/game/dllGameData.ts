export interface DLLNodeState {
  address: string; // e.g. "0x1000"
  data: number;
  prev: string;    // e.g. "NULL" or "0x1008"
  next: string;    // e.g. "NULL" or "0x1008"
  isNewNode?: boolean;
  isDeleted?: boolean;
}

export interface ExpectedConnection {
  address: string;
  prev: string;
  next: string;
}

export interface GuidedStepAction {
  type: 'pointer' | 'delete' | 'concept' | 'traverse' | 'head' | 'tail' | 'data';
  nodeAddress?: string;
  field?: 'prev' | 'next';
  targetValue?: string;
  conceptField?: 'prev' | 'data' | 'next';
  traverseData?: number;
  newHead?: string;
  newTail?: string;
  targetData?: number;
}

export interface GuidedStep {
  step: number;
  operationText: string;
  explanation: string;
  action: GuidedStepAction;
}

export interface NewNodeConfig {
  data: number;
  address: string;
  studentGoal?: string;
}

export interface DLLTask {
  id: string;
  levelId: 1 | 2 | 3;
  taskNumber: 1 | 2 | 3;
  title: string;
  description: string;
  instruction: string;
  whatToDo?: string;
  interactWith?: string;
  expectedResult?: string;
  xp: number;
  taskType: 'concept' | 'create_node' | 'build' | 'traverse' | 'insert' | 'delete';
  initialNodes: DLLNodeState[];
  targetDeleteAddress?: string;
  newNodeAddress?: string;
  newNodeConfig?: NewNodeConfig;
  expectedConnections?: ExpectedConnection[];
  expectedHead?: string;
  expectedTail?: string;
  expectedTraversal?: number[];
  hint: string;
  guidedSteps?: GuidedStep[];
}

export interface DLLLevel {
  id: 'dll-concepts' | 'dll-insertion' | 'dll-deletion';
  number: 1 | 2 | 3;
  title: string;
  badge: string;
  description: string;
  taskCount: 3;
  tasks: DLLTask[];
}

export const DLL_LEVELS: DLLLevel[] = [
  // =========================================================================
  // LEVEL 1 — DLL FOUNDATIONS
  // =========================================================================
  {
    id: 'dll-concepts',
    number: 1,
    title: 'DLL Foundations',
    badge: 'Level 1',
    description: 'Understand how a Doubly Linked List works, create and connect nodes, and learn how PREV and NEXT pointers move through the list.',
    taskCount: 3,
    tasks: [
      {
        id: 'task-1-1',
        levelId: 1,
        taskNumber: 1,
        title: 'Creating a Node',
        description: 'Create and initialize a new DLL node.',
        instruction: 'Construct a standalone Doubly Linked List node with DATA = 5, PREV = NULL, and NEXT = NULL.',
        xp: 25,
        taskType: 'create_node',
        hint: 'The new node contains DATA = 5 and is not connected yet, so PREV and NEXT are NULL.',
        initialNodes: [
          { address: '0x1000', data: 0, prev: 'NULL', next: 'NULL', isNewNode: true },
        ],
        newNodeConfig: {
          data: 5,
          address: '0x1000',
          studentGoal: 'Create a new DLL node with DATA = 5 and initialize PREV and NEXT to NULL.',
        },
        guidedSteps: [
          {
            step: 1,
            operationText: 'Change node DATA to 5.',
            explanation: 'Set the node DATA payload to 5.',
            action: { type: 'data', nodeAddress: '0x1000', targetData: 5 },
          },
          {
            step: 2,
            operationText: 'Verify PREV pointer is NULL.',
            explanation: 'Because this node is standalone, its backward PREV pointer points to NULL.',
            action: { type: 'pointer', nodeAddress: '0x1000', field: 'prev', targetValue: 'NULL' },
          },
          {
            step: 3,
            operationText: 'Verify NEXT pointer is NULL.',
            explanation: 'Because this node has no successor, its forward NEXT pointer points to NULL.',
            action: { type: 'pointer', nodeAddress: '0x1000', field: 'next', targetValue: 'NULL' },
          },
        ],
      },
      {
        id: 'task-1-2',
        levelId: 1,
        taskNumber: 2,
        title: 'Build the DLL',
        description: 'Connect the nodes correctly to form a Doubly Linked List.',
        instruction: 'Build the DLL by connecting the nodes 10, 20 and 30 in the correct order. Set HEAD to node 10 and TAIL to node 30.',
        xp: 30,
        taskType: 'build',
        hint: 'Set node 10 NEXT to 0x1008, node 20 PREV to 0x1000 and NEXT to 0x1010, node 30 PREV to 0x1008. Set HEAD to node 10 and TAIL to node 30.',
        initialNodes: [
          { address: '0x1000', data: 10, prev: 'NULL', next: 'NULL' },
          { address: '0x1008', data: 20, prev: 'NULL', next: 'NULL' },
          { address: '0x1010', data: 30, prev: 'NULL', next: 'NULL' },
        ],
        expectedHead: '0x1000',
        expectedTail: '0x1010',
        expectedConnections: [
          { address: '0x1000', prev: 'NULL', next: '0x1008' },
          { address: '0x1008', prev: '0x1000', next: '0x1010' },
          { address: '0x1010', prev: '0x1008', next: 'NULL' },
        ],
        guidedSteps: [
          {
            step: 1,
            operationText: 'Connect node 10 forward: set 10.NEXT to 0x1008.',
            explanation: 'Node 10 must point forward to the second node (20 at 0x1008).',
            action: { type: 'pointer', nodeAddress: '0x1000', field: 'next', targetValue: '0x1008' },
          },
          {
            step: 2,
            operationText: 'Connect node 20 backward: set 20.PREV to 0x1000.',
            explanation: 'Node 20 must point backward to node 10 (0x1000) for bidirectional linking.',
            action: { type: 'pointer', nodeAddress: '0x1008', field: 'prev', targetValue: '0x1000' },
          },
          {
            step: 3,
            operationText: 'Connect node 20 forward: set 20.NEXT to 0x1010.',
            explanation: 'Node 20 must point forward to the third node (30 at 0x1010).',
            action: { type: 'pointer', nodeAddress: '0x1008', field: 'next', targetValue: '0x1010' },
          },
          {
            step: 4,
            operationText: 'Connect node 30 backward: set 30.PREV to 0x1008.',
            explanation: 'Node 30 must point backward to node 20 (0x1008) for bidirectional linking.',
            action: { type: 'pointer', nodeAddress: '0x1010', field: 'prev', targetValue: '0x1008' },
          },
          {
            step: 5,
            operationText: 'Designate node 10 (0x1000) as HEAD.',
            explanation: 'Node 10 is the first node of the Doubly Linked List, so it is the HEAD.',
            action: { type: 'head', newHead: '0x1000' },
          },
          {
            step: 6,
            operationText: 'Designate node 30 (0x1010) as TAIL.',
            explanation: 'Node 30 is the last node of the Doubly Linked List, so it is the TAIL.',
            action: { type: 'tail', newTail: '0x1010' },
          },
        ],
      },
      {
        id: 'task-1-3',
        levelId: 1,
        taskNumber: 3,
        title: 'Traversal in DLL',
        description: 'Traverse the DLL from HEAD using the NEXT pointers.',
        instruction: 'Starting from HEAD, traverse the DLL by following the NEXT pointers and place the nodes in the correct order.',
        xp: 30,
        taskType: 'traverse',
        hint: 'Start at HEAD (node 10 at 0x1000) and follow each NEXT pointer to sequence the nodes.',
        initialNodes: [
          { address: '0x1000', data: 10, prev: 'NULL', next: '0x1008' },
          { address: '0x1008', data: 20, prev: '0x1000', next: '0x1010' },
          { address: '0x1010', data: 30, prev: '0x1008', next: 'NULL' },
        ],
        expectedHead: '0x1000',
        expectedTail: '0x1010',
        expectedTraversal: [10, 20, 30],
        guidedSteps: [
          {
            step: 1,
            operationText: 'Place HEAD node (10 at 0x1000) into Slot 1.',
            explanation: 'Start traversal at HEAD (address 0x1000, value 10).',
            action: { type: 'traverse', nodeAddress: '0x1000', traverseData: 10 },
          },
          {
            step: 2,
            operationText: 'Follow NEXT to place node 20 (0x1008) into Slot 2.',
            explanation: 'Node 10 NEXT pointer (0x1008) leads to node 20.',
            action: { type: 'traverse', nodeAddress: '0x1008', traverseData: 20 },
          },
          {
            step: 3,
            operationText: 'Follow NEXT to place TAIL node 30 (0x1010) into Slot 3.',
            explanation: 'Node 20 NEXT pointer (0x1010) leads to node 30 (NEXT is NULL, ending traversal).',
            action: { type: 'traverse', nodeAddress: '0x1010', traverseData: 30 },
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LEVEL 2 — INSERTION
  // =========================================================================
  {
    id: 'dll-insertion',
    number: 2,
    title: 'Insertion',
    badge: 'Level 2',
    description: 'Create a new node and insert it at the beginning, end, or a chosen position while correctly updating the required PREV, NEXT, HEAD, and TAIL pointers.',
    taskCount: 3,
    tasks: [
      {
        id: 'task-2-1',
        levelId: 2,
        taskNumber: 1,
        title: 'Insert at Beginning',
        description: 'Create a new node and insert it before the current HEAD.',
        instruction: 'Create a node with DATA = 5, insert it at the beginning of the DLL, and update HEAD correctly.',
        xp: 30,
        taskType: 'insert',
        newNodeAddress: '0x1018',
        newNodeConfig: {
          data: 5,
          address: '0x1018',
          studentGoal: 'Create a node with DATA = 5, insert it at the beginning of the DLL, and update HEAD correctly.',
        },
        hint: 'The new node becomes HEAD: its PREV is NULL, its NEXT points to the old head (0x1000), and the old head PREV must point to it (0x1018).',
        initialNodes: [
          { address: '0x1000', data: 10, prev: 'NULL', next: '0x1008' },
          { address: '0x1008', data: 20, prev: '0x1000', next: '0x1010' },
          { address: '0x1010', data: 30, prev: '0x1008', next: 'NULL' },
        ],
        expectedHead: '0x1018',
        expectedTail: '0x1010',
        expectedConnections: [
          { address: '0x1018', prev: 'NULL', next: '0x1000' },
          { address: '0x1000', prev: '0x1018', next: '0x1008' },
          { address: '0x1008', prev: '0x1000', next: '0x1010' },
          { address: '0x1010', prev: '0x1008', next: 'NULL' },
        ],
        guidedSteps: [
          {
            step: 1,
            operationText: 'Designate node 5 (0x1018) as HEAD.',
            explanation: 'Newly created node 5 is inserted at the front of the list, so it must become the new HEAD.',
            action: { type: 'head', newHead: '0x1018' },
          },
          {
            step: 2,
            operationText: 'Set node 5 (0x1018) NEXT to 0x1000.',
            explanation: 'Newly created node 5 must point forward to the previous HEAD (node 10 at 0x1000).',
            action: { type: 'pointer', nodeAddress: '0x1018', field: 'next', targetValue: '0x1000' },
          },
          {
            step: 3,
            operationText: 'Set node 10 (0x1000) PREV to 0x1018.',
            explanation: 'Node 10 must point backward to the newly inserted node 5 (0x1018) to maintain the bidirectional connection.',
            action: { type: 'pointer', nodeAddress: '0x1000', field: 'prev', targetValue: '0x1018' },
          },
          {
            step: 4,
            operationText: 'Set node 5 (0x1018) PREV to NULL.',
            explanation: 'Because node 5 is now the new HEAD of the list, its PREV pointer must remain NULL.',
            action: { type: 'pointer', nodeAddress: '0x1018', field: 'prev', targetValue: 'NULL' },
          },
        ],
      },
      {
        id: 'task-2-2',
        levelId: 2,
        taskNumber: 2,
        title: 'Insert at End',
        description: 'Create a new node and insert it after the current TAIL.',
        instruction: 'Create a node with DATA = 40, insert it at the end of the DLL, and update TAIL correctly.',
        xp: 40,
        taskType: 'insert',
        newNodeAddress: '0x1018',
        newNodeConfig: {
          data: 40,
          address: '0x1018',
          studentGoal: 'Create a node with DATA = 40, insert it at the end of the DLL, and update TAIL correctly.',
        },
        hint: 'The new node becomes TAIL: its PREV points to the old tail (0x1010), the old tail NEXT points to it (0x1018), and its NEXT is NULL.',
        initialNodes: [
          { address: '0x1000', data: 10, prev: 'NULL', next: '0x1008' },
          { address: '0x1008', data: 20, prev: '0x1000', next: '0x1010' },
          { address: '0x1010', data: 30, prev: '0x1008', next: 'NULL' },
        ],
        expectedHead: '0x1000',
        expectedTail: '0x1018',
        expectedConnections: [
          { address: '0x1000', prev: 'NULL', next: '0x1008' },
          { address: '0x1008', prev: '0x1000', next: '0x1010' },
          { address: '0x1010', prev: '0x1008', next: '0x1018' },
          { address: '0x1018', prev: '0x1010', next: 'NULL' },
        ],
        guidedSteps: [
          {
            step: 1,
            operationText: 'Designate node 40 (0x1018) as TAIL.',
            explanation: 'Newly created node 40 is inserted at the end of the list, so it must become the new TAIL.',
            action: { type: 'tail', newTail: '0x1018' },
          },
          {
            step: 2,
            operationText: 'Set node 40 (0x1018) PREV to 0x1010.',
            explanation: 'Newly created node 40 needs a backward connection to the current TAIL (node 30 at 0x1010).',
            action: { type: 'pointer', nodeAddress: '0x1018', field: 'prev', targetValue: '0x1010' },
          },
          {
            step: 3,
            operationText: 'Set node 30 (0x1010) NEXT to 0x1018.',
            explanation: 'Old TAIL node 30 NEXT pointer must point forward to newly inserted node 40 (0x1018).',
            action: { type: 'pointer', nodeAddress: '0x1010', field: 'next', targetValue: '0x1018' },
          },
          {
            step: 4,
            operationText: 'Set node 40 (0x1018) NEXT to NULL.',
            explanation: 'Because node 40 is now the new TAIL of the list, its NEXT pointer must remain NULL.',
            action: { type: 'pointer', nodeAddress: '0x1018', field: 'next', targetValue: 'NULL' },
          },
        ],
      },
      {
        id: 'task-2-3',
        levelId: 2,
        taskNumber: 3,
        title: 'Insert at Any Position',
        description: 'Create a new node and insert it between two existing nodes.',
        instruction: 'Create a node with DATA = 30, insert it between node 20 and node 40, and update all required pointers.',
        xp: 50,
        taskType: 'insert',
        newNodeAddress: '0x1018',
        newNodeConfig: {
          data: 30,
          address: '0x1018',
          studentGoal: 'Create a node with DATA = 30, insert it between node 20 and node 40, and update all required pointers.',
        },
        hint: 'Four pointers must be updated: node 20 NEXT, node 40 PREV, and the new node PREV and NEXT.',
        initialNodes: [
          { address: '0x1000', data: 10, prev: 'NULL', next: '0x1008' },
          { address: '0x1008', data: 20, prev: '0x1000', next: '0x1010' },
          { address: '0x1010', data: 40, prev: '0x1008', next: 'NULL' },
        ],
        expectedHead: '0x1000',
        expectedTail: '0x1010',
        expectedConnections: [
          { address: '0x1000', prev: 'NULL', next: '0x1008' },
          { address: '0x1008', prev: '0x1000', next: '0x1018' },
          { address: '0x1018', prev: '0x1008', next: '0x1010' },
          { address: '0x1010', prev: '0x1018', next: 'NULL' },
        ],
        guidedSteps: [
          {
            step: 1,
            operationText: 'Set node 20 NEXT to the new node address (0x1018).',
            explanation: 'Node 20 must now point forward to the new node.',
            action: { type: 'pointer', nodeAddress: '0x1008', field: 'next', targetValue: '0x1018' },
          },
          {
            step: 2,
            operationText: 'Set the new node PREV to node 20 address (0x1008).',
            explanation: 'The new node needs a backward connection to node 20.',
            action: { type: 'pointer', nodeAddress: '0x1018', field: 'prev', targetValue: '0x1008' },
          },
          {
            step: 3,
            operationText: 'Set the new node NEXT to node 40 address (0x1010).',
            explanation: 'The new node must point forward to node 40.',
            action: { type: 'pointer', nodeAddress: '0x1018', field: 'next', targetValue: '0x1010' },
          },
          {
            step: 4,
            operationText: 'Set node 40 PREV to the new node address (0x1018).',
            explanation: 'Node 40 must point backward to the new node.',
            action: { type: 'pointer', nodeAddress: '0x1010', field: 'prev', targetValue: '0x1018' },
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LEVEL 3 — DELETION
  // =========================================================================
  {
    id: 'dll-deletion',
    number: 3,
    title: 'Deletion',
    badge: 'Level 3',
    description: 'Learn how to remove nodes from different positions and reconnect the remaining nodes while keeping the DLL structure correct.',
    taskCount: 3,
    tasks: [
      {
        id: 'task-3-1',
        levelId: 3,
        taskNumber: 1,
        title: 'Delete at Beginning',
        description: 'Remove the first node and correctly update the DLL.',
        instruction: 'Delete the first node (10) from the DLL and update HEAD and the required PREV pointer correctly.',
        xp: 30,
        taskType: 'delete',
        targetDeleteAddress: '0x1000',
        hint: 'Remove node 10, then update node 20 so that its PREV pointer becomes NULL, making it the new HEAD.',
        initialNodes: [
          { address: '0x1000', data: 10, prev: 'NULL', next: '0x1008' },
          { address: '0x1008', data: 20, prev: '0x1000', next: '0x1010' },
          { address: '0x1010', data: 30, prev: '0x1008', next: 'NULL' },
        ],
        expectedHead: '0x1008',
        expectedTail: '0x1010',
        expectedConnections: [
          { address: '0x1008', prev: 'NULL', next: '0x1010' },
          { address: '0x1010', prev: '0x1008', next: 'NULL' },
        ],
        guidedSteps: [
          {
            step: 1,
            operationText: 'Delete node 10 at 0x1000.',
            explanation: 'Remove node 10 from the active list.',
            action: { type: 'delete', nodeAddress: '0x1000' },
          },
          {
            step: 2,
            operationText: 'Designate node 20 (0x1008) as HEAD.',
            explanation: 'Node 10 was deleted, so node 20 becomes the new starting HEAD of the DLL.',
            action: { type: 'head', newHead: '0x1008' },
          },
          {
            step: 3,
            operationText: 'Set node 20 (0x1008) PREV to NULL.',
            explanation: 'Node 20 is now the new HEAD, so its PREV pointer must be set to NULL.',
            action: { type: 'pointer', nodeAddress: '0x1008', field: 'prev', targetValue: 'NULL' },
          },
        ],
      },
      {
        id: 'task-3-2',
        levelId: 3,
        taskNumber: 2,
        title: 'Delete at End',
        description: 'Remove the last node and correctly update the DLL.',
        instruction: 'Delete the last node (30) from the DLL and update TAIL and the required NEXT pointer correctly.',
        xp: 40,
        taskType: 'delete',
        targetDeleteAddress: '0x1010',
        hint: 'Remove node 30, then update node 20 so that its NEXT pointer becomes NULL, making it the new TAIL.',
        initialNodes: [
          { address: '0x1000', data: 10, prev: 'NULL', next: '0x1008' },
          { address: '0x1008', data: 20, prev: '0x1000', next: '0x1010' },
          { address: '0x1010', data: 30, prev: '0x1008', next: 'NULL' },
        ],
        expectedHead: '0x1000',
        expectedTail: '0x1008',
        expectedConnections: [
          { address: '0x1000', prev: 'NULL', next: '0x1008' },
          { address: '0x1008', prev: '0x1000', next: 'NULL' },
        ],
        guidedSteps: [
          {
            step: 1,
            operationText: 'Delete node 30 at 0x1010.',
            explanation: 'Remove node 30 from the active list.',
            action: { type: 'delete', nodeAddress: '0x1010' },
          },
          {
            step: 2,
            operationText: 'Designate node 20 (0x1008) as TAIL.',
            explanation: 'Node 30 was deleted, so node 20 becomes the new ending TAIL of the DLL.',
            action: { type: 'tail', newTail: '0x1008' },
          },
          {
            step: 3,
            operationText: 'Set node 20 (0x1008) NEXT to NULL.',
            explanation: 'Node 20 is now the new TAIL, so its NEXT pointer must be set to NULL.',
            action: { type: 'pointer', nodeAddress: '0x1008', field: 'next', targetValue: 'NULL' },
          },
        ],
      },
      {
        id: 'task-3-3',
        levelId: 3,
        taskNumber: 3,
        title: 'Delete at Any Position',
        description: 'Remove a middle node and reconnect the remaining nodes correctly.',
        instruction: 'Delete middle node 30 and reconnect the neighboring nodes (20 and 40) directly.',
        xp: 50,
        taskType: 'delete',
        targetDeleteAddress: '0x1010',
        hint: 'Bypass node 30 by linking node 20 NEXT directly to node 40, and linking node 40 PREV back to node 20.',
        initialNodes: [
          { address: '0x1000', data: 10, prev: 'NULL', next: '0x1008' },
          { address: '0x1008', data: 20, prev: '0x1000', next: '0x1010' },
          { address: '0x1010', data: 30, prev: '0x1008', next: '0x1018' },
          { address: '0x1018', data: 40, prev: '0x1010', next: 'NULL' },
        ],
        expectedHead: '0x1000',
        expectedTail: '0x1018',
        expectedConnections: [
          { address: '0x1000', prev: 'NULL', next: '0x1008' },
          { address: '0x1008', prev: '0x1000', next: '0x1018' },
          { address: '0x1018', prev: '0x1008', next: 'NULL' },
        ],
        guidedSteps: [
          {
            step: 1,
            operationText: 'Delete node 30 at 0x1010.',
            explanation: 'Remove middle node 30 from the active list.',
            action: { type: 'delete', nodeAddress: '0x1010' },
          },
          {
            step: 2,
            operationText: 'Set node 20 (0x1008) NEXT to node 40 (0x1018).',
            explanation: 'Bypass node 30 by linking node 20 NEXT directly to node 40 (0x1018).',
            action: { type: 'pointer', nodeAddress: '0x1008', field: 'next', targetValue: '0x1018' },
          },
          {
            step: 3,
            operationText: 'Set node 40 (0x1018) PREV to node 20 (0x1008).',
            explanation: 'Bypass node 30 by linking node 40 PREV directly back to node 20 (0x1008).',
            action: { type: 'pointer', nodeAddress: '0x1018', field: 'prev', targetValue: '0x1008' },
          },
        ],
      },
    ],
  },
];

// Helper to normalize pointer address inputs (e.g. "null", "NULL", "0x0", "0", "0x1008", " 0X1008 ")
export const normalizeAddress = (val: string | null | undefined): string => {
  if (val === null || val === undefined) return 'NULL';
  const trimmed = String(val).trim();
  if (
    !trimmed ||
    trimmed.toUpperCase() === 'NULL' ||
    trimmed === '0' ||
    trimmed === '0x0' ||
    trimmed === '0X0' ||
    trimmed.toUpperCase() === 'NONE' ||
    trimmed.toUpperCase() === 'NIL'
  ) {
    return 'NULL';
  }
  const clean = trimmed.toLowerCase();
  if (clean.startsWith('0x')) {
    return clean;
  }
  return `0x${clean}`;
};

export const normalizeAddressInput = (val: string | null | undefined): string => {
  return normalizeAddress(val);
};

export const isNullPointer = (val: string | null | undefined): boolean => {
  return normalizeAddress(val) === 'NULL';
};

export const arePointersEqual = (
  a: string | null | undefined,
  b: string | null | undefined
): boolean => {
  return normalizeAddress(a) === normalizeAddress(b);
};

// Validate if input is a valid hex address or NULL
export const isValidPointerAddress = (val: string | null | undefined): boolean => {
  if (val === null || val === undefined) return true;
  const norm = normalizeAddress(val);
  if (norm === 'NULL') return true;
  return /^0x[0-9a-f]+$/i.test(norm);
};
