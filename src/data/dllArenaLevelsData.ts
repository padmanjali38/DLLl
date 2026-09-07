import { LevelConfig } from '../types/dllGameTypes';

export const DLL_ARENA_LEVELS: LevelConfig[] = [
  // =========================================================================
  // LEVEL 01: CREATE TWO NODES + LINK THEM (XP: 130)
  // =========================================================================
  {
    id: 1,
    levelNumber: 1,
    code: 'L01',
    breadcrumb: 'HANDS-ON POINTER MANIPULATION • LEVEL 01 OF 08',
    title: 'Level 01 • Create Two Nodes & Link Them',
    subtitle: 'Learn how nodes are stored in memory and how PREV and NEXT addresses connect two nodes in a Doubly Linked List.',
    interactionMode: 'Manual Pointers & Memory',
    feedbackEngine: 'Concept & Address Validation',
    totalXp: 130,
    tasks: [
      {
        id: 'arena-l1-t1',
        taskNumber: 1,
        title: 'Task 1: Allocate Node 1001 (DATA: 10)',
        tag: 'Task #1',
        concept: 'Heap Node Struct Allocation',
        objective: 'Create Node at ADDRESS = 1001 with DATA = 10. Initial PREV = NULL, NEXT = NULL.',
        description: 'Allocate the first struct node on the RAM heap: ADDRESS = 1001, DATA = 10, PREV = NULL, NEXT = NULL.',
        xpReward: 30,
        iconType: 'plus',
        cCode: `Node* n1 = (Node*)malloc(sizeof(Node));\nn1->data = 10;\nn1->prev = NULL;\nn1->next = NULL;`,
        codeSnippet: `Node* n1 = (Node*)malloc(sizeof(Node));`,
        initialNodes: [],
        initialHead: null,
        initialTail: null,
        targetState: {
          nodes: [
            { address: 1001, data: 10, prev: null, next: null },
          ],
          head: null,
          tail: null,
        },
        hints: [
          'Click the "+ Create Node" button in the Pointer Tools bar.',
          'The simulator allocates memory at address 1001 with DATA = 10.',
          'Leave PREV and NEXT set to NULL for unlinked nodes.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: 'Node at ADDRESS = 1001 exists with DATA = 10',
            validate: (nodes) => nodes.some((n) => n.address === 1001 && Number(n.data) === 10),
          },
          {
            id: 'c2',
            label: 'Node 1001: PREV = NULL and NEXT = NULL',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1001);
              return Boolean(n && n.prev === null && n.next === null);
            },
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Click "+ Create Node" to allocate Node 1001.',
            explanation: 'Allocates memory on the RAM heap: Node* n1 = (Node*)malloc(sizeof(Node));',
            actionType: 'CREATE_NODE',
            payload: { address: 1001, data: 10 },
          },
          {
            stepNumber: 2,
            instruction: 'Click "Check Answer" to verify the first allocated node.',
            explanation: 'Node 1001 is now initialized with data 10 and null pointer fields.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
      {
        id: 'arena-l1-t2',
        taskNumber: 2,
        title: 'Task 2: Allocate Node 1002 (DATA: 20)',
        tag: 'Task #2',
        concept: 'Heap Node Struct Allocation',
        objective: 'Create Node at ADDRESS = 1002 with DATA = 20. Initial PREV = NULL, NEXT = NULL.',
        description: 'Allocate the second struct node on the RAM heap: ADDRESS = 1002, DATA = 20, PREV = NULL, NEXT = NULL.',
        xpReward: 30,
        iconType: 'plus',
        cCode: `Node* n2 = (Node*)malloc(sizeof(Node));\nn2->data = 20;\nn2->prev = NULL;\nn2->next = NULL;`,
        codeSnippet: `Node* n2 = (Node*)malloc(sizeof(Node));`,
        initialNodes: [
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: null },
        ],
        initialHead: null,
        initialTail: null,
        targetState: {
          nodes: [
            { address: 1001, data: 10, prev: null, next: null },
            { address: 1002, data: 20, prev: null, next: null },
          ],
          head: null,
          tail: null,
        },
        hints: [
          'Click "+ Create Node" to allocate the second node in RAM.',
          'It will be placed at heap address 1002 with DATA = 20.',
          'Verify both nodes exist independently with NULL pointers.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: 'Node at ADDRESS = 1001 exists with DATA = 10',
            validate: (nodes) => nodes.some((n) => n.address === 1001 && Number(n.data) === 10),
          },
          {
            id: 'c2',
            label: 'Node at ADDRESS = 1002 exists with DATA = 20',
            validate: (nodes) => nodes.some((n) => n.address === 1002 && Number(n.data) === 20),
          },
          {
            id: 'c3',
            label: 'Both nodes have PREV = NULL and NEXT = NULL',
            validate: (nodes) =>
              nodes.every((n) => (n.address === 1001 || n.address === 1002) && n.prev === null && n.next === null),
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Click "+ Create Node" to allocate Node 1002 with data 20.',
            explanation: 'Allocates second node on heap: Node* n2 = (Node*)malloc(sizeof(Node));',
            actionType: 'CREATE_NODE',
            payload: { address: 1002, data: 20 },
          },
          {
            stepNumber: 2,
            instruction: 'Click "Check Answer" to confirm both unlinked nodes.',
            explanation: 'Both structs are now ready on the heap with unlinked NULL pointers.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
      {
        id: 'arena-l1-t3',
        taskNumber: 3,
        title: 'Task 3: Change 1001.NEXT = 1002',
        tag: 'Task #3',
        concept: 'Forward Address Linking',
        objective: 'Change Node 1001.NEXT address field to 1002.',
        description: 'Edit the NEXT address field in Node 1001 so it stores memory address 1002.',
        xpReward: 35,
        iconType: 'link',
        cCode: `n1->next = n2;   // 1001.NEXT = 1002`,
        codeSnippet: `n1->next = n2;`,
        initialNodes: [
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: null },
          { id: 'node_1002', address: 1002, data: 20, prev: null, next: null },
        ],
        initialHead: null,
        initialTail: null,
        targetState: {
          nodes: [
            { address: 1001, data: 10, prev: null, next: 1002 },
            { address: 1002, data: 20, prev: null, next: null },
          ],
          head: null,
          tail: null,
        },
        hints: [
          'Locate Node 1001 in the workspace.',
          'Click on the NEXT address field and type 1002 (or select 1002).',
          'Ensure 1001.NEXT is 1002 while 1001.PREV remains NULL.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: '1001.NEXT = 1002',
            validate: (nodes) => {
              const n1 = nodes.find((n) => n.address === 1001);
              return Boolean(n1 && n1.next === 1002);
            },
          },
          {
            id: 'c2',
            label: '1001.PREV = NULL',
            validate: (nodes) => {
              const n1 = nodes.find((n) => n.address === 1001);
              return Boolean(n1 && n1.prev === null);
            },
          },
          {
            id: 'c3',
            label: 'Node 1002 remains in RAM',
            validate: (nodes) => nodes.some((n) => n.address === 1002),
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Set Node 1001.NEXT to 1002.',
            explanation: 'Stores address 1002 into n1->next pointer field.',
            actionType: 'CONNECT_NEXT',
            payload: { fromAddress: 1001, toAddress: 1002 },
          },
          {
            stepNumber: 2,
            instruction: 'Click "Check Answer" to verify the forward link.',
            explanation: '1001 now points forward to 1002.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
      {
        id: 'arena-l1-t4',
        taskNumber: 4,
        title: 'Task 4: Change 1002.PREV = 1001',
        tag: 'Task #4',
        concept: 'Backward Address Linking',
        objective: 'Change Node 1002.PREV address field to 1001. Finalize bidirectional link.',
        description: 'Edit the PREV address field in Node 1002 to 1001. Final state: 1001 (PREV: NULL, NEXT: 1002) and 1002 (PREV: 1001, NEXT: NULL).',
        xpReward: 35,
        iconType: 'link',
        cCode: `n2->prev = n1;   // 1002.PREV = 1001\n// Final:\n// 1001: prev = NULL, next = 1002\n// 1002: prev = 1001, next = NULL`,
        codeSnippet: `n2->prev = n1;`,
        initialNodes: [
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: null, next: null },
        ],
        initialHead: null,
        initialTail: null,
        targetState: {
          nodes: [
            { address: 1001, data: 10, prev: null, next: 1002 },
            { address: 1002, data: 20, prev: 1001, next: null },
          ],
          head: null,
          tail: null,
        },
        hints: [
          'Locate Node 1002 in the workspace.',
          'Change the PREV address field from NULL to 1001.',
          'Notice the bidirectional link 1001 ⇄ 1002 is now fully formed.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: '1001.NEXT = 1002 and 1001.PREV = NULL',
            validate: (nodes) => {
              const n1 = nodes.find((n) => n.address === 1001);
              return Boolean(n1 && n1.next === 1002 && n1.prev === null);
            },
          },
          {
            id: 'c2',
            label: '1002.PREV = 1001 and 1002.NEXT = NULL',
            validate: (nodes) => {
              const n2 = nodes.find((n) => n.address === 1002);
              return Boolean(n2 && n2.prev === 1001 && n2.next === null);
            },
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Set Node 1002.PREV to 1001.',
            explanation: 'Stores address 1001 into n2->prev: n2->prev = n1;',
            actionType: 'CONNECT_PREV',
            payload: { fromAddress: 1002, toAddress: 1001 },
          },
          {
            stepNumber: 2,
            instruction: 'Click "Check Answer" to complete Level 01!',
            explanation: 'Both bidirectional links are verified.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LEVEL 02: CREATE THREE NODES + HEAD & TAIL (XP: 180)
  // =========================================================================
  {
    id: 2,
    levelNumber: 2,
    code: 'L02',
    breadcrumb: 'HANDS-ON POINTER MANIPULATION • LEVEL 02 OF 08',
    title: 'Level 02 • Create Three Nodes + HEAD & TAIL',
    subtitle: 'Allocate 3 nodes, establish reciprocal links, and assign HEAD and TAIL pointers.',
    interactionMode: 'Manual Pointers & Memory',
    feedbackEngine: 'Concept & Address Validation',
    totalXp: 180,
    tasks: [
      {
        id: 'arena-l2-t1',
        taskNumber: 1,
        title: 'Task 1: Allocate & Wire 3 Nodes',
        tag: 'Task #1',
        concept: 'Chaining Multiple DLL Structs',
        objective: 'Create 1001 (10), 1002 (20), 1003 (30). Set 1001.NEXT = 1002, 1002.PREV = 1001, 1002.NEXT = 1003, 1003.PREV = 1002.',
        description: 'Allocate three nodes (1001 with 10, 1002 with 20, 1003 with 30) and connect all forward and backward addresses.',
        xpReward: 100,
        iconType: 'link',
        cCode: `n1->prev = NULL; n1->next = n2;\nn2->prev = n1;   n2->next = n3;\nn3->prev = n2;   n3->next = NULL;`,
        codeSnippet: `n1->next = n2; n2->next = n3;`,
        initialNodes: [],
        initialHead: null,
        initialTail: null,
        targetState: {
          nodes: [
            { address: 1001, data: 10, prev: null, next: 1002 },
            { address: 1002, data: 20, prev: 1001, next: 1003 },
            { address: 1003, data: 30, prev: 1002, next: null },
          ],
          head: null,
          tail: null,
        },
        hints: [
          'Click "+ Create Node" 3 times to allocate nodes 1001, 1002, and 1003.',
          'Edit addresses: 1001.NEXT = 1002, 1002.PREV = 1001, 1002.NEXT = 1003, 1003.PREV = 1002.',
          'Keep 1001.PREV = NULL and 1003.NEXT = NULL.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: '1001 (DATA: 10): PREV = NULL, NEXT = 1002',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1001);
              return Boolean(n && Number(n.data) === 10 && n.prev === null && n.next === 1002);
            },
          },
          {
            id: 'c2',
            label: '1002 (DATA: 20): PREV = 1001, NEXT = 1003',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1002);
              return Boolean(n && Number(n.data) === 20 && n.prev === 1001 && n.next === 1003);
            },
          },
          {
            id: 'c3',
            label: '1003 (DATA: 30): PREV = 1002, NEXT = NULL',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1003);
              return Boolean(n && Number(n.data) === 30 && n.prev === 1002 && n.next === null);
            },
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Create Node 1001, Node 1002, and Node 1003.',
            explanation: 'Allocates the three sequential memory blocks in RAM.',
            actionType: 'CREATE_NODE',
            payload: { address: 1001, data: 10 },
          },
          {
            stepNumber: 2,
            instruction: 'Create Node 1002.',
            explanation: 'Allocates 1002 on heap.',
            actionType: 'CREATE_NODE',
            payload: { address: 1002, data: 20 },
          },
          {
            stepNumber: 3,
            instruction: 'Create Node 1003.',
            explanation: 'Allocates 1003 on heap.',
            actionType: 'CREATE_NODE',
            payload: { address: 1003, data: 30 },
          },
          {
            stepNumber: 4,
            instruction: 'Link 1001.NEXT = 1002 and 1002.PREV = 1001.',
            explanation: 'Wires bidirectional link between node 1 and node 2.',
            actionType: 'CONNECT_NEXT',
            payload: { fromAddress: 1001, toAddress: 1002, backAddress: 1001 },
          },
          {
            stepNumber: 5,
            instruction: 'Link 1002.NEXT = 1003 and 1003.PREV = 1002.',
            explanation: 'Wires bidirectional link between node 2 and node 3.',
            actionType: 'CONNECT_NEXT',
            payload: { fromAddress: 1002, toAddress: 1003, backAddress: 1002 },
          },
        ],
      },
      {
        id: 'arena-l2-t2',
        taskNumber: 2,
        title: 'Task 2: Set HEAD = 1001 & TAIL = 1003',
        tag: 'Task #2',
        concept: 'Boundary Register Pointers',
        objective: 'Assign boundary markers: set HEAD = 1001 and TAIL = 1003.',
        description: 'Assign the list boundary registers: point HEAD to address 1001, and point TAIL to address 1003. Final state: NULL ← 10 ⇄ 20 ⇄ 30 → NULL.',
        xpReward: 80,
        iconType: 'pointer',
        cCode: `head = n1;   // HEAD = 1001\ntail = n3;   // TAIL = 1003`,
        codeSnippet: `head = n1; tail = n3;`,
        initialNodes: [
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: 1001, next: 1003 },
          { id: 'node_1003', address: 1003, data: 30, prev: 1002, next: null },
        ],
        initialHead: null,
        initialTail: null,
        targetState: {
          nodes: [
            { address: 1001, data: 10, prev: null, next: 1002 },
            { address: 1002, data: 20, prev: 1001, next: 1003 },
            { address: 1003, data: 30, prev: 1002, next: null },
          ],
          head: 1001,
          tail: 1003,
        },
        hints: [
          'Select Node 1001 and click the "HEAD" tool (or use the dropdown) to set HEAD = 1001.',
          'Select Node 1003 and click the "TAIL" tool to set TAIL = 1003.',
          'Final list: NULL ← 10 ⇄ 20 ⇄ 30 → NULL with HEAD at 1001 and TAIL at 1003.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: 'HEAD = 1001 (Points to first node)',
            validate: (_nodes, head) => head === 1001,
          },
          {
            id: 'c2',
            label: 'TAIL = 1003 (Points to last node)',
            validate: (_nodes, _head, tail) => tail === 1003,
          },
          {
            id: 'c3',
            label: 'Three nodes correctly chained: 1001 ⇄ 1002 ⇄ 1003',
            validate: (nodes) => {
              const n1 = nodes.find((x) => x.address === 1001);
              const n2 = nodes.find((x) => x.address === 1002);
              const n3 = nodes.find((x) => x.address === 1003);
              return Boolean(
                n1 && n1.prev === null && n1.next === 1002 &&
                n2 && n2.prev === 1001 && n2.next === 1003 &&
                n3 && n3.prev === 1002 && n3.next === null
              );
            },
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Point HEAD to address 1001.',
            explanation: 'head = n1; stores pointer to the first node.',
            actionType: 'SET_HEAD',
            payload: { address: 1001 },
          },
          {
            stepNumber: 2,
            instruction: 'Point TAIL to address 1003.',
            explanation: 'tail = n3; stores pointer to the last node.',
            actionType: 'SET_TAIL',
            payload: { address: 1003 },
          },
          {
            stepNumber: 3,
            instruction: 'Click "Check Answer" to complete Level 02!',
            explanation: 'Full DLL structure verified.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LEVEL 03: INSERT AT BEGINNING (XP: 190)
  // =========================================================================
  {
    id: 3,
    levelNumber: 3,
    code: 'L03',
    breadcrumb: 'HANDS-ON POINTER MANIPULATION • LEVEL 03 OF 08',
    title: 'Level 03 • Insert at Beginning',
    subtitle: 'Prepend a new node at the front of the list, rewire pointer addresses, and advance HEAD.',
    interactionMode: 'Manual Pointers & Memory',
    feedbackEngine: 'Concept & Address Validation',
    totalXp: 190,
    tasks: [
      {
        id: 'arena-l3-t1',
        taskNumber: 1,
        title: 'Task 1: Allocate New Node (1000 = 5)',
        tag: 'Task #1',
        concept: 'Prepend Struct Allocation',
        objective: 'Allocate Node at ADDRESS = 1000 with DATA = 5.',
        description: 'Existing list: 1001 (10) ⇄ 1002 (20) ⇄ 1003 (30). Allocate new struct: ADDRESS = 1000, DATA = 5.',
        xpReward: 60,
        iconType: 'plus',
        cCode: `Node* newNode = (Node*)malloc(sizeof(Node));\nnewNode->data = 5;\nnewNode->prev = NULL;\nnewNode->next = NULL;`,
        codeSnippet: `Node* newNode = (Node*)malloc(sizeof(Node));`,
        initialNodes: [
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: 1001, next: 1003 },
          { id: 'node_1003', address: 1003, data: 30, prev: 1002, next: null },
        ],
        initialHead: 1001,
        initialTail: 1003,
        targetState: {
          nodes: [
            { address: 1000, data: 5, prev: null, next: null },
            { address: 1001, data: 10, prev: null, next: 1002 },
            { address: 1002, data: 20, prev: 1001, next: 1003 },
            { address: 1003, data: 30, prev: 1002, next: null },
          ],
          head: 1001,
          tail: 1003,
        },
        hints: [
          'Click "+ Create Node" in the toolbar.',
          'The simulator allocates Node 1000 with DATA = 5 on the RAM heap.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: 'Node 1000 allocated with DATA = 5',
            validate: (nodes) => nodes.some((n) => n.address === 1000 && Number(n.data) === 5),
          },
          {
            id: 'c2',
            label: 'Existing list 1001 ⇄ 1002 ⇄ 1003 remains intact',
            validate: (nodes) => nodes.length >= 4,
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Click "+ Create Node" to allocate Node 1000 (DATA: 5).',
            explanation: 'Node* newNode = (Node*)malloc(sizeof(Node)); newNode->data = 5;',
            actionType: 'CREATE_NODE',
            payload: { address: 1000, data: 5 },
          },
          {
            stepNumber: 2,
            instruction: 'Click "Check Answer" to verify allocation.',
            explanation: 'Node 1000 is ready for rewiring.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
      {
        id: 'arena-l3-t2',
        taskNumber: 2,
        title: 'Task 2: Wire Prepend Links & Set HEAD = 1000',
        tag: 'Task #2',
        concept: 'Prepend Pointer Linking',
        objective: 'Perform: 1000.NEXT = 1001, 1001.PREV = 1000, 1000.PREV = NULL, HEAD = 1000.',
        description: 'Link Node 1000 to 1001: set 1000.NEXT = 1001, 1001.PREV = 1000, keep 1000.PREV = NULL, and update HEAD = 1000. Final list: NULL ← 5 ⇄ 10 ⇄ 20 ⇄ 30 → NULL.',
        xpReward: 130,
        iconType: 'link',
        cCode: `newNode->next = head;       // 1000.NEXT = 1001\nhead->prev = newNode;       // 1001.PREV = 1000\nnewNode->prev = NULL;       // 1000.PREV = NULL\nhead = newNode;             // HEAD = 1000`,
        codeSnippet: `newNode->next = head; head->prev = newNode; head = newNode;`,
        initialNodes: [
          { id: 'node_1000', address: 1000, data: 5, prev: null, next: null },
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: 1001, next: 1003 },
          { id: 'node_1003', address: 1003, data: 30, prev: 1002, next: null },
        ],
        initialHead: 1001,
        initialTail: 1003,
        targetState: {
          nodes: [
            { address: 1000, data: 5, prev: null, next: 1001 },
            { address: 1001, data: 10, prev: 1000, next: 1002 },
            { address: 1002, data: 20, prev: 1001, next: 1003 },
            { address: 1003, data: 30, prev: 1002, next: null },
          ],
          head: 1000,
          tail: 1003,
        },
        hints: [
          'In Node 1000, set NEXT = 1001 and PREV = NULL.',
          'In Node 1001, change PREV from NULL to 1000.',
          'Update HEAD to address 1000.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: '1000.NEXT = 1001 and 1000.PREV = NULL',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1000);
              return Boolean(n && n.next === 1001 && n.prev === null);
            },
          },
          {
            id: 'c2',
            label: '1001.PREV = 1000',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1001);
              return Boolean(n && n.prev === 1000);
            },
          },
          {
            id: 'c3',
            label: 'HEAD = 1000',
            validate: (_nodes, head) => head === 1000,
          },
          {
            id: 'c4',
            label: 'TAIL remains 1003',
            validate: (_nodes, _head, tail) => tail === 1003,
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Set 1000.NEXT = 1001.',
            explanation: 'newNode->next = head; points new node to former head.',
            actionType: 'CONNECT_NEXT',
            payload: { fromAddress: 1000, toAddress: 1001 },
          },
          {
            stepNumber: 2,
            instruction: 'Set 1001.PREV = 1000.',
            explanation: 'head->prev = newNode; links former head back to new node.',
            actionType: 'CONNECT_PREV',
            payload: { fromAddress: 1001, toAddress: 1000 },
          },
          {
            stepNumber: 3,
            instruction: 'Advance HEAD marker to 1000.',
            explanation: 'head = newNode; sets new node as head.',
            actionType: 'SET_HEAD',
            payload: { address: 1000 },
          },
          {
            stepNumber: 4,
            instruction: 'Click "Check Answer" to complete Level 03!',
            explanation: 'Verify prepended list: NULL ← 5 ⇄ 10 ⇄ 20 ⇄ 30 → NULL.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LEVEL 04: INSERT AT ENDING (XP: 190)
  // =========================================================================
  {
    id: 4,
    levelNumber: 4,
    code: 'L04',
    breadcrumb: 'HANDS-ON POINTER MANIPULATION • LEVEL 04 OF 08',
    title: 'Level 04 • Insert at Ending',
    subtitle: 'Append a new node to the end of the list, rewire pointers, and advance TAIL.',
    interactionMode: 'Manual Pointers & Memory',
    feedbackEngine: 'Concept & Address Validation',
    totalXp: 190,
    tasks: [
      {
        id: 'arena-l4-t1',
        taskNumber: 1,
        title: 'Task 1: Allocate New Node (1003 = 30)',
        tag: 'Task #1',
        concept: 'Append Struct Allocation',
        objective: 'Allocate Node at ADDRESS = 1003 with DATA = 30.',
        description: 'Existing list: 1000 (5) ⇄ 1001 (10) ⇄ 1002 (20), TAIL = 1002. Allocate new struct: ADDRESS = 1003, DATA = 30.',
        xpReward: 60,
        iconType: 'plus',
        cCode: `Node* newNode = (Node*)malloc(sizeof(Node));\nnewNode->data = 30;\nnewNode->prev = NULL;\nnewNode->next = NULL;`,
        codeSnippet: `Node* newNode = (Node*)malloc(sizeof(Node));`,
        initialNodes: [
          { id: 'node_1000', address: 1000, data: 5, prev: null, next: 1001 },
          { id: 'node_1001', address: 1001, data: 10, prev: 1000, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: 1001, next: null },
        ],
        initialHead: 1000,
        initialTail: 1002,
        targetState: {
          nodes: [
            { address: 1000, data: 5, prev: null, next: 1001 },
            { address: 1001, data: 10, prev: 1000, next: 1002 },
            { address: 1002, data: 20, prev: 1001, next: null },
            { address: 1003, data: 30, prev: null, next: null },
          ],
          head: 1000,
          tail: 1002,
        },
        hints: [
          'Click "+ Create Node" in the Pointer Tools bar.',
          'Node 1003 with DATA = 30 will be allocated on the heap.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: 'Node 1003 allocated with DATA = 30',
            validate: (nodes) => nodes.some((n) => n.address === 1003 && Number(n.data) === 30),
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Click "+ Create Node" to allocate Node 1003.',
            explanation: 'Node* newNode = (Node*)malloc(sizeof(Node)); newNode->data = 30;',
            actionType: 'CREATE_NODE',
            payload: { address: 1003, data: 30 },
          },
          {
            stepNumber: 2,
            instruction: 'Click "Check Answer" to verify allocation.',
            explanation: 'Node 1003 is allocated on heap.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
      {
        id: 'arena-l4-t2',
        taskNumber: 2,
        title: 'Task 2: Wire Append Links & Set TAIL = 1003',
        tag: 'Task #2',
        concept: 'Append Pointer Linking',
        objective: 'Perform: 1002.NEXT = 1003, 1003.PREV = 1002, 1003.NEXT = NULL, TAIL = 1003.',
        description: 'Connect Node 1002 to 1003: set 1002.NEXT = 1003, 1003.PREV = 1002, keep 1003.NEXT = NULL, and update TAIL = 1003. Final list: 5 ⇄ 10 ⇄ 20 ⇄ 30.',
        xpReward: 130,
        iconType: 'link',
        cCode: `tail->next = newNode;       // 1002.NEXT = 1003\nnewNode->prev = tail;       // 1003.PREV = 1002\nnewNode->next = NULL;       // 1003.NEXT = NULL\ntail = newNode;             // TAIL = 1003`,
        codeSnippet: `tail->next = newNode; newNode->prev = tail; tail = newNode;`,
        initialNodes: [
          { id: 'node_1000', address: 1000, data: 5, prev: null, next: 1001 },
          { id: 'node_1001', address: 1001, data: 10, prev: 1000, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: 1001, next: null },
          { id: 'node_1003', address: 1003, data: 30, prev: null, next: null },
        ],
        initialHead: 1000,
        initialTail: 1002,
        targetState: {
          nodes: [
            { address: 1000, data: 5, prev: null, next: 1001 },
            { address: 1001, data: 10, prev: 1000, next: 1002 },
            { address: 1002, data: 20, prev: 1001, next: 1003 },
            { address: 1003, data: 30, prev: 1002, next: null },
          ],
          head: 1000,
          tail: 1003,
        },
        hints: [
          'In Node 1002, change NEXT from NULL to 1003.',
          'In Node 1003, set PREV = 1002 and NEXT = NULL.',
          'Update TAIL to address 1003.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: '1002.NEXT = 1003',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1002);
              return Boolean(n && n.next === 1003);
            },
          },
          {
            id: 'c2',
            label: '1003.PREV = 1002 and 1003.NEXT = NULL',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1003);
              return Boolean(n && n.prev === 1002 && n.next === null);
            },
          },
          {
            id: 'c3',
            label: 'TAIL = 1003',
            validate: (_nodes, _head, tail) => tail === 1003,
          },
          {
            id: 'c4',
            label: 'HEAD remains 1000',
            validate: (_nodes, head) => head === 1000,
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Set 1002.NEXT = 1003.',
            explanation: 'tail->next = newNode; connects former tail to new node.',
            actionType: 'CONNECT_NEXT',
            payload: { fromAddress: 1002, toAddress: 1003 },
          },
          {
            stepNumber: 2,
            instruction: 'Set 1003.PREV = 1002.',
            explanation: 'newNode->prev = tail; points new node back to former tail.',
            actionType: 'CONNECT_PREV',
            payload: { fromAddress: 1003, toAddress: 1002 },
          },
          {
            stepNumber: 3,
            instruction: 'Advance TAIL marker to 1003.',
            explanation: 'tail = newNode; updates tail to the newly appended node.',
            actionType: 'SET_TAIL',
            payload: { address: 1003 },
          },
          {
            stepNumber: 4,
            instruction: 'Click "Check Answer" to complete Level 04!',
            explanation: 'Verify appended list: 5 ⇄ 10 ⇄ 20 ⇄ 30.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LEVEL 05: INSERT AT ANY POSITION (XP: 220)
  // =========================================================================
  {
    id: 5,
    levelNumber: 5,
    code: 'L05',
    breadcrumb: 'HANDS-ON POINTER MANIPULATION • LEVEL 05 OF 08',
    title: 'Level 05 • Insert at Any Position',
    subtitle: 'Insert a new node in between two existing nodes, updating all 4 surrounding pointer addresses.',
    interactionMode: 'Manual Pointers & Memory',
    feedbackEngine: 'Concept & Address Validation',
    totalXp: 220,
    tasks: [
      {
        id: 'arena-l5-t1',
        taskNumber: 1,
        title: 'Task 1: Allocate Node (1003 = 30)',
        tag: 'Task #1',
        concept: 'Middle Node Allocation',
        objective: 'Create Node 1003 with DATA = 30.',
        description: 'Existing list: 1001 (10) ⇄ 1002 (20) ⇄ 1004 (40) ⇄ 1005 (50). Allocate new node: ADDRESS = 1003, DATA = 30.',
        xpReward: 70,
        iconType: 'plus',
        cCode: `Node* newNode = (Node*)malloc(sizeof(Node));\nnewNode->data = 30;\nnewNode->prev = NULL;\nnewNode->next = NULL;`,
        codeSnippet: `Node* newNode = (Node*)malloc(sizeof(Node));`,
        initialNodes: [
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: 1001, next: 1004 },
          { id: 'node_1004', address: 1004, data: 40, prev: 1002, next: 1005 },
          { id: 'node_1005', address: 1005, data: 50, prev: 1004, next: null },
        ],
        initialHead: 1001,
        initialTail: 1005,
        targetState: {
          nodes: [
            { address: 1001, data: 10, prev: null, next: 1002 },
            { address: 1002, data: 20, prev: 1001, next: 1004 },
            { address: 1003, data: 30, prev: null, next: null },
            { address: 1004, data: 40, prev: 1002, next: 1005 },
            { address: 1005, data: 50, prev: 1004, next: null },
          ],
          head: 1001,
          tail: 1005,
        },
        hints: [
          'Click "+ Create Node" to allocate Node 1003 with DATA = 30.',
          'This node will be spliced between Node 1002 (20) and Node 1004 (40).',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: 'Node 1003 allocated with DATA = 30',
            validate: (nodes) => nodes.some((n) => n.address === 1003 && Number(n.data) === 30),
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Click "+ Create Node" to allocate Node 1003.',
            explanation: 'Node* newNode = (Node*)malloc(sizeof(Node)); newNode->data = 30;',
            actionType: 'CREATE_NODE',
            payload: { address: 1003, data: 30 },
          },
          {
            stepNumber: 2,
            instruction: 'Click "Check Answer" to verify allocation.',
            explanation: 'Node 1003 is ready for middle insertion.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
      {
        id: 'arena-l5-t2',
        taskNumber: 2,
        title: 'Task 2: Splice Node 1003 between 1002 and 1004',
        tag: 'Task #2',
        concept: 'Middle 4-Way Pointer Rewiring',
        objective: 'Perform: 1003.PREV = 1002, 1003.NEXT = 1004, 1002.NEXT = 1003, 1004.PREV = 1003.',
        description: 'Splice Node 1003 between 20 and 40. Update all 4 pointer addresses. Final list: 10 ⇄ 20 ⇄ 30 ⇄ 40 ⇄ 50.',
        xpReward: 150,
        iconType: 'link',
        cCode: `newNode->prev = prevNode;       // 1003.PREV = 1002\nnewNode->next = nextNode;       // 1003.NEXT = 1004\nprevNode->next = newNode;       // 1002.NEXT = 1003\nnextNode->prev = newNode;       // 1004.PREV = 1003`,
        codeSnippet: `newNode->prev = p; newNode->next = n; p->next = newNode; n->prev = newNode;`,
        initialNodes: [
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: 1001, next: 1004 },
          { id: 'node_1003', address: 1003, data: 30, prev: null, next: null },
          { id: 'node_1004', address: 1004, data: 40, prev: 1002, next: 1005 },
          { id: 'node_1005', address: 1005, data: 50, prev: 1004, next: null },
        ],
        initialHead: 1001,
        initialTail: 1005,
        targetState: {
          nodes: [
            { address: 1001, data: 10, prev: null, next: 1002 },
            { address: 1002, data: 20, prev: 1001, next: 1003 },
            { address: 1003, data: 30, prev: 1002, next: 1004 },
            { address: 1004, data: 40, prev: 1003, next: 1005 },
            { address: 1005, data: 50, prev: 1004, next: null },
          ],
          head: 1001,
          tail: 1005,
        },
        hints: [
          'First configure the new node: 1003.PREV = 1002 and 1003.NEXT = 1004.',
          'Then rewire the neighbors: 1002.NEXT = 1003 and 1004.PREV = 1003.',
          'Ensure bidirectional consistency: 1002 ⇄ 1003 ⇄ 1004.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: '1003.PREV = 1002 and 1003.NEXT = 1004',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1003);
              return Boolean(n && n.prev === 1002 && n.next === 1004);
            },
          },
          {
            id: 'c2',
            label: '1002.NEXT = 1003',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1002);
              return Boolean(n && n.next === 1003);
            },
          },
          {
            id: 'c3',
            label: '1004.PREV = 1003',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1004);
              return Boolean(n && n.prev === 1003);
            },
          },
          {
            id: 'c4',
            label: 'Complete chain: 10 ⇄ 20 ⇄ 30 ⇄ 40 ⇄ 50',
            validate: (nodes) => {
              const n1 = nodes.find((x) => x.address === 1001);
              const n2 = nodes.find((x) => x.address === 1002);
              const n3 = nodes.find((x) => x.address === 1003);
              const n4 = nodes.find((x) => x.address === 1004);
              const n5 = nodes.find((x) => x.address === 1005);
              return Boolean(
                n1 && n1.next === 1002 &&
                n2 && n2.prev === 1001 && n2.next === 1003 &&
                n3 && n3.prev === 1002 && n3.next === 1004 &&
                n4 && n4.prev === 1003 && n4.next === 1005 &&
                n5 && n5.prev === 1004
              );
            },
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Set 1003.PREV = 1002 and 1003.NEXT = 1004.',
            explanation: 'newNode->prev = 1002; newNode->next = 1004;',
            actionType: 'CONNECT_NEXT',
            payload: { fromAddress: 1003, toAddress: 1004 },
          },
          {
            stepNumber: 2,
            instruction: 'Set 1003.PREV = 1002.',
            explanation: 'Points backward to 1002.',
            actionType: 'CONNECT_PREV',
            payload: { fromAddress: 1003, toAddress: 1002 },
          },
          {
            stepNumber: 3,
            instruction: 'Set 1002.NEXT = 1003.',
            explanation: '1002->next = 1003; rewires predecessor forward link.',
            actionType: 'CONNECT_NEXT',
            payload: { fromAddress: 1002, toAddress: 1003 },
          },
          {
            stepNumber: 4,
            instruction: 'Set 1004.PREV = 1003.',
            explanation: '1004->prev = 1003; rewires successor backward link.',
            actionType: 'CONNECT_PREV',
            payload: { fromAddress: 1004, toAddress: 1003 },
          },
          {
            stepNumber: 5,
            instruction: 'Click "Check Answer" to complete Level 05!',
            explanation: 'Verify 5-node DLL chain: 10 ⇄ 20 ⇄ 30 ⇄ 40 ⇄ 50.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LEVEL 06: DELETE AT BEGINNING (XP: 200)
  // =========================================================================
  {
    id: 6,
    levelNumber: 6,
    code: 'L06',
    breadcrumb: 'HANDS-ON POINTER MANIPULATION • LEVEL 06 OF 08',
    title: 'Level 06 • Delete at Beginning',
    subtitle: 'Advance HEAD pointer, sever the predecessor link, and deallocate the original first node.',
    interactionMode: 'Manual Pointers & Memory',
    feedbackEngine: 'Concept & Address Validation',
    totalXp: 200,
    tasks: [
      {
        id: 'arena-l6-t1',
        taskNumber: 1,
        title: 'Task 1: Advance HEAD & Sever Predecessor Link',
        tag: 'Task #1',
        concept: 'Deleting Head Node Pointer Setup',
        objective: 'Perform: HEAD = 1002 and 1002.PREV = NULL.',
        description: 'Initial list: 1001 (10) ⇄ 1002 (20) ⇄ 1003 (30), HEAD = 1001. Advance HEAD to 1002 and set 1002.PREV = NULL.',
        xpReward: 100,
        iconType: 'pointer',
        cCode: `Node* temp = head;\nhead = head->next;          // HEAD = 1002\nhead->prev = NULL;          // 1002.PREV = NULL;`,
        codeSnippet: `head = head->next; head->prev = NULL;`,
        initialNodes: [
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: 1001, next: 1003 },
          { id: 'node_1003', address: 1003, data: 30, prev: 1002, next: null },
        ],
        initialHead: 1001,
        initialTail: 1003,
        targetState: {
          nodes: [
            { address: 1001, data: 10, prev: null, next: 1002 },
            { address: 1002, data: 20, prev: null, next: 1003 },
            { address: 1003, data: 30, prev: 1002, next: null },
          ],
          head: 1002,
          tail: 1003,
        },
        hints: [
          'Set HEAD pointer to address 1002.',
          'In Node 1002, change the PREV address field to NULL.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: 'HEAD = 1002',
            validate: (_nodes, head) => head === 1002,
          },
          {
            id: 'c2',
            label: '1002.PREV = NULL',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1002);
              return Boolean(n && n.prev === null);
            },
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Advance HEAD to 1002.',
            explanation: 'head = head->next; moves head to the second node.',
            actionType: 'SET_HEAD',
            payload: { address: 1002 },
          },
          {
            stepNumber: 2,
            instruction: 'Set 1002.PREV = NULL.',
            explanation: 'head->prev = NULL; makes 1002 the new first node.',
            actionType: 'CONNECT_PREV',
            payload: { fromAddress: 1002, toAddress: null },
          },
          {
            stepNumber: 3,
            instruction: 'Click "Check Answer" to verify new head boundary.',
            explanation: 'New head setup is verified.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
      {
        id: 'arena-l6-t2',
        taskNumber: 2,
        title: 'Task 2: Delete Node 1001 from Heap',
        tag: 'Task #2',
        concept: 'Freeing Deallocated Memory',
        objective: 'Delete Node 1001. Final list: NULL ← 20 ⇄ 30 → NULL.',
        description: 'Select Node 1001 and click "Delete Node" to free its memory from the heap. Final list: 1002 (DATA: 20) ⇄ 1003 (DATA: 30).',
        xpReward: 100,
        iconType: 'trash',
        cCode: `free(temp);   // free(1001);\n// Final: NULL <- 20 <-> 30 -> NULL`,
        codeSnippet: `free(temp);`,
        initialNodes: [
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: null, next: 1003 },
          { id: 'node_1003', address: 1003, data: 30, prev: 1002, next: null },
        ],
        initialHead: 1002,
        initialTail: 1003,
        targetState: {
          nodes: [
            { address: 1002, data: 20, prev: null, next: 1003 },
            { address: 1003, data: 30, prev: 1002, next: null },
          ],
          head: 1002,
          tail: 1003,
        },
        hints: [
          'Click on Node 1001 to select it.',
          'Click the "Delete Node" tool in the Pointer Tools bar to deallocate it.',
          'Final list must have only nodes 1002 and 1003.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: 'Node 1001 deleted from RAM',
            validate: (nodes) => !nodes.some((n) => n.address === 1001),
          },
          {
            id: 'c2',
            label: 'Final list: NULL ← 20 ⇄ 30 → NULL',
            validate: (nodes) => {
              const n2 = nodes.find((x) => x.address === 1002);
              const n3 = nodes.find((x) => x.address === 1003);
              return Boolean(
                nodes.length === 2 &&
                n2 && n2.prev === null && n2.next === 1003 &&
                n3 && n3.prev === 1002 && n3.next === null
              );
            },
          },
          {
            id: 'c3',
            label: 'HEAD = 1002 and TAIL = 1003',
            validate: (_nodes, head, tail) => head === 1002 && tail === 1003,
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Delete Node 1001 from the heap.',
            explanation: 'free(temp); releases memory back to system heap.',
            actionType: 'DELETE_NODE',
            payload: { address: 1001 },
          },
          {
            stepNumber: 2,
            instruction: 'Click "Check Answer" to complete Level 06!',
            explanation: 'Verify NULL ← 20 ⇄ 30 → NULL.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LEVEL 07: DELETE AT ENDING (XP: 200)
  // =========================================================================
  {
    id: 7,
    levelNumber: 7,
    code: 'L07',
    breadcrumb: 'HANDS-ON POINTER MANIPULATION • LEVEL 07 OF 08',
    title: 'Level 07 • Delete at Ending',
    subtitle: 'Retract TAIL pointer, sever the forward link, and deallocate the original last node.',
    interactionMode: 'Manual Pointers & Memory',
    feedbackEngine: 'Concept & Address Validation',
    totalXp: 200,
    tasks: [
      {
        id: 'arena-l7-t1',
        taskNumber: 1,
        title: 'Task 1: Retract TAIL & Sever Forward Link',
        tag: 'Task #1',
        concept: 'Deleting Tail Node Pointer Setup',
        objective: 'Perform: TAIL = 1002 and 1002.NEXT = NULL.',
        description: 'Initial list: 1001 (10) ⇄ 1002 (20) ⇄ 1003 (30), TAIL = 1003. Retract TAIL to 1002 and set 1002.NEXT = NULL.',
        xpReward: 100,
        iconType: 'pointer',
        cCode: `Node* temp = tail;\ntail = tail->prev;          // TAIL = 1002\ntail->next = NULL;          // 1002.NEXT = NULL;`,
        codeSnippet: `tail = tail->prev; tail->next = NULL;`,
        initialNodes: [
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: 1001, next: 1003 },
          { id: 'node_1003', address: 1003, data: 30, prev: 1002, next: null },
        ],
        initialHead: 1001,
        initialTail: 1003,
        targetState: {
          nodes: [
            { address: 1001, data: 10, prev: null, next: 1002 },
            { address: 1002, data: 20, prev: 1001, next: null },
            { address: 1003, data: 30, prev: 1002, next: null },
          ],
          head: 1001,
          tail: 1002,
        },
        hints: [
          'Set TAIL pointer to address 1002.',
          'In Node 1002, change the NEXT address field to NULL.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: 'TAIL = 1002',
            validate: (_nodes, _head, tail) => tail === 1002,
          },
          {
            id: 'c2',
            label: '1002.NEXT = NULL',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1002);
              return Boolean(n && n.next === null);
            },
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Retract TAIL pointer to 1002.',
            explanation: 'tail = tail->prev; moves tail to predecessor node.',
            actionType: 'SET_TAIL',
            payload: { address: 1002 },
          },
          {
            stepNumber: 2,
            instruction: 'Set 1002.NEXT = NULL.',
            explanation: 'tail->next = NULL; terminates the new list ending.',
            actionType: 'CONNECT_NEXT',
            payload: { fromAddress: 1002, toAddress: null },
          },
          {
            stepNumber: 3,
            instruction: 'Click "Check Answer" to verify new tail boundary.',
            explanation: 'New tail setup is verified.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
      {
        id: 'arena-l7-t2',
        taskNumber: 2,
        title: 'Task 2: Delete Node 1003 from Heap',
        tag: 'Task #2',
        concept: 'Freeing Deallocated Memory',
        objective: 'Delete Node 1003. Final list: 10 ⇄ 20 → NULL.',
        description: 'Select Node 1003 and click "Delete Node" to free its memory from the heap. Final list: 1001 (DATA: 10) ⇄ 1002 (DATA: 20).',
        xpReward: 100,
        iconType: 'trash',
        cCode: `free(temp);   // free(1003);\n// Final: 10 <-> 20 -> NULL`,
        codeSnippet: `free(temp);`,
        initialNodes: [
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: 1001, next: null },
          { id: 'node_1003', address: 1003, data: 30, prev: 1002, next: null },
        ],
        initialHead: 1001,
        initialTail: 1002,
        targetState: {
          nodes: [
            { address: 1001, data: 10, prev: null, next: 1002 },
            { address: 1002, data: 20, prev: 1001, next: null },
          ],
          head: 1001,
          tail: 1002,
        },
        hints: [
          'Click on Node 1003 to select it.',
          'Click the "Delete Node" button to deallocate it.',
          'Final list must contain only nodes 1001 and 1002.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: 'Node 1003 deleted from RAM',
            validate: (nodes) => !nodes.some((n) => n.address === 1003),
          },
          {
            id: 'c2',
            label: 'Final list: 10 ⇄ 20 → NULL',
            validate: (nodes) => {
              const n1 = nodes.find((x) => x.address === 1001);
              const n2 = nodes.find((x) => x.address === 1002);
              return Boolean(
                nodes.length === 2 &&
                n1 && n1.prev === null && n1.next === 1002 &&
                n2 && n2.prev === 1001 && n2.next === null
              );
            },
          },
          {
            id: 'c3',
            label: 'HEAD = 1001 and TAIL = 1002',
            validate: (_nodes, head, tail) => head === 1001 && tail === 1002,
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Delete Node 1003 from the heap.',
            explanation: 'free(temp); deallocates the severed tail node.',
            actionType: 'DELETE_NODE',
            payload: { address: 1003 },
          },
          {
            stepNumber: 2,
            instruction: 'Click "Check Answer" to complete Level 07!',
            explanation: 'Verify 10 ⇄ 20 → NULL.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LEVEL 08: DELETE AT ANY POSITION (XP: 250)
  // =========================================================================
  {
    id: 8,
    levelNumber: 8,
    code: 'L08',
    breadcrumb: 'HANDS-ON POINTER MANIPULATION • LEVEL 08 OF 08',
    title: 'Level 08 • Delete at Any Position',
    subtitle: 'Bypass a target node by bridging its neighbors directly, then deallocate the orphaned node.',
    interactionMode: 'Manual Pointers & Memory',
    feedbackEngine: 'Concept & Address Validation',
    totalXp: 250,
    tasks: [
      {
        id: 'arena-l8-t1',
        taskNumber: 1,
        title: 'Task 1: Bridge Neighbors Around Node 1003',
        tag: 'Task #1',
        concept: 'Middle Node Bypass Linking',
        objective: 'Perform: 1002.NEXT = 1004 and 1004.PREV = 1002.',
        description: 'Initial chain: 1001 (10) ⇄ 1002 (20) ⇄ 1003 (30) ⇄ 1004 (40) ⇄ 1005 (50). Rewire pointers so 1002 links directly to 1004, bypassing 1003.',
        xpReward: 120,
        iconType: 'link',
        cCode: `target->prev->next = target->next;   // 1002.NEXT = 1004\ntarget->next->prev = target->prev;   // 1004.PREV = 1002`,
        codeSnippet: `target->prev->next = target->next; target->next->prev = target->prev;`,
        initialNodes: [
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: 1001, next: 1003 },
          { id: 'node_1003', address: 1003, data: 30, prev: 1002, next: 1004 },
          { id: 'node_1004', address: 1004, data: 40, prev: 1003, next: 1005 },
          { id: 'node_1005', address: 1005, data: 50, prev: 1004, next: null },
        ],
        initialHead: 1001,
        initialTail: 1005,
        targetState: {
          nodes: [
            { address: 1001, data: 10, prev: null, next: 1002 },
            { address: 1002, data: 20, prev: 1001, next: 1004 },
            { address: 1003, data: 30, prev: 1002, next: 1004 },
            { address: 1004, data: 40, prev: 1002, next: 1005 },
            { address: 1005, data: 50, prev: 1004, next: null },
          ],
          head: 1001,
          tail: 1005,
        },
        hints: [
          'In Node 1002, change NEXT from 1003 to 1004.',
          'In Node 1004, change PREV from 1003 to 1002.',
          'Node 1003 will become completely bypassed.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: '1002.NEXT = 1004 (Bypasses 1003 forward)',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1002);
              return Boolean(n && n.next === 1004);
            },
          },
          {
            id: 'c2',
            label: '1004.PREV = 1002 (Bypasses 1003 backward)',
            validate: (nodes) => {
              const n = nodes.find((x) => x.address === 1004);
              return Boolean(n && n.prev === 1002);
            },
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Set 1002.NEXT = 1004.',
            explanation: 'target->prev->next = target->next; routes around target.',
            actionType: 'CONNECT_NEXT',
            payload: { fromAddress: 1002, toAddress: 1004 },
          },
          {
            stepNumber: 2,
            instruction: 'Set 1004.PREV = 1002.',
            explanation: 'target->next->prev = target->prev; routes back around target.',
            actionType: 'CONNECT_PREV',
            payload: { fromAddress: 1004, toAddress: 1002 },
          },
          {
            stepNumber: 3,
            instruction: 'Click "Check Answer" to verify the bypass link.',
            explanation: '1002 and 1004 are now directly connected.',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
      {
        id: 'arena-l8-t2',
        taskNumber: 2,
        title: 'Task 2: Free Orphaned Node 1003',
        tag: 'Task #2',
        concept: 'Freeing Deallocated Memory',
        objective: 'Delete Node 1003. Final list: 10 ⇄ 20 ⇄ 40 ⇄ 50.',
        description: 'Delete Node 1003 from the heap. Final list: 1001 (10) ⇄ 1002 (20) ⇄ 1004 (40) ⇄ 1005 (50), HEAD = 1001, TAIL = 1005.',
        xpReward: 130,
        iconType: 'trash',
        cCode: `free(target);   // free(1003);\n// Final: 10 <-> 20 <-> 40 <-> 50`,
        codeSnippet: `free(target);`,
        initialNodes: [
          { id: 'node_1001', address: 1001, data: 10, prev: null, next: 1002 },
          { id: 'node_1002', address: 1002, data: 20, prev: 1001, next: 1004 },
          { id: 'node_1003', address: 1003, data: 30, prev: 1002, next: 1004 },
          { id: 'node_1004', address: 1004, data: 40, prev: 1002, next: 1005 },
          { id: 'node_1005', address: 1005, data: 50, prev: 1004, next: null },
        ],
        initialHead: 1001,
        initialTail: 1005,
        targetState: {
          nodes: [
            { address: 1001, data: 10, prev: null, next: 1002 },
            { address: 1002, data: 20, prev: 1001, next: 1004 },
            { address: 1004, data: 40, prev: 1002, next: 1005 },
            { address: 1005, data: 50, prev: 1004, next: null },
          ],
          head: 1001,
          tail: 1005,
        },
        hints: [
          'Select Node 1003 in the RAM heap workspace.',
          'Click the "Delete Node" tool in the Pointer Tools bar to free it.',
          'Verify the resulting 4-node DLL: 10 ⇄ 20 ⇄ 40 ⇄ 50.',
        ],
        targetCriteria: [
          {
            id: 'c1',
            label: 'Node 1003 deleted from RAM heap',
            validate: (nodes) => !nodes.some((n) => n.address === 1003),
          },
          {
            id: 'c2',
            label: 'Final list: 10 ⇄ 20 ⇄ 40 ⇄ 50',
            validate: (nodes) => {
              const n1 = nodes.find((x) => x.address === 1001);
              const n2 = nodes.find((x) => x.address === 1002);
              const n4 = nodes.find((x) => x.address === 1004);
              const n5 = nodes.find((x) => x.address === 1005);
              return Boolean(
                nodes.length === 4 &&
                n1 && n1.prev === null && n1.next === 1002 &&
                n2 && n2.prev === 1001 && n2.next === 1004 &&
                n4 && n4.prev === 1002 && n4.next === 1005 &&
                n5 && n5.prev === 1004 && n5.next === null
              );
            },
          },
          {
            id: 'c3',
            label: 'HEAD = 1001 and TAIL = 1005',
            validate: (_nodes, head, tail) => head === 1001 && tail === 1005,
          },
        ],
        guidedSteps: [
          {
            stepNumber: 1,
            instruction: 'Delete Node 1003 from the heap.',
            explanation: 'free(target); releases the orphaned node back to memory.',
            actionType: 'DELETE_NODE',
            payload: { address: 1003 },
          },
          {
            stepNumber: 2,
            instruction: 'Click "Check Answer" to complete Level 08!',
            explanation: 'All 8 DLL levels mastered!',
            actionType: 'VERIFY',
            payload: {},
          },
        ],
      },
    ],
  },
];
