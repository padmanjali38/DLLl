import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Play,
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  RotateCcw,
  Activity,
  Cpu,
  Database,
  Layers,
  Link as LinkIcon,
  HelpCircle,
  Code2,
} from 'lucide-react';
import { TechniqueType } from '../types/game';
import { progressManager, normalizeTheoryChapterId } from '../utils/progressManager';
import { soundManager } from '../utils/audio';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { TheoryVisualEnhancer } from './TheoryVisualEnhancer';

export interface LearnHashingSectionProps {
  initialTopic?: string;
  onStartLevel: (levelId: number) => void;
  onOpenSandbox: (technique?: TechniqueType, size?: number) => void;
}

export interface TheoryChapter {
  id: string; // 'theory-01' to 'theory-12'
  legacySlug: string;
  number: string;
  category: string;
  title: string;
  shortTitle: string;
  readTime: string;
  moduleId: string;
  definition: string;
  analogy: string;
  specifications: string[];
  formula?: string;
  formulaLabel?: string;
  codeSnippet?: {
    cpp: string;
    java: string;
    python: string;
  };
  relatedLevel?: number;
  relatedTechnique?: TechniqueType;
}

export const THEORY_CHAPTERS: TheoryChapter[] = [
  {
    id: 'theory-01',
    legacySlug: 'what-is-dll',
    number: '01',
    category: 'FUNDAMENTALS',
    title: 'WHAT IS A DOUBLY LINKED LIST?',
    shortTitle: 'What is a DLL?',
    readTime: '2 MIN',
    moduleId: 'fn-01-basics',
    definition:
      'A linear dynamic data structure composed of discrete nodes where each node contains a data element and two memory pointers: one pointing forward to the next node and one pointing backward to the previous node.',
    analogy:
      'Imagine a train where every passenger car is physically coupled to both the car in front of it and the car behind it. You can walk forwards toward the locomotive or backwards toward the caboose freely.',
    specifications: [
      'Node Anatomy: Each node contains three distinct fields: `prev` (pointer to predecessor), `data` (stored value), and `next` (pointer to successor).',
      'Bi-directional Navigation: Allows full two-way traversal (forward and backward) unlike a singly linked list.',
      'Head and Tail Terminations: In a linear DLL, `head.prev == null` and `tail.next == null` serve as explicit boundary sentinels.',
      'Dynamic Heap Storage: Nodes are allocated individually on the heap as needed, requiring no contiguous block of memory.',
    ],
    formula: 'Node = { prev: Node*, data: Type, next: Node* }',
    formulaLabel: 'DOUBLY LINKED LIST NODE STRUCTURE',
    codeSnippet: {
      cpp: `struct Node {\n    int data;\n    Node* prev;\n    Node* next;\n    Node(int val) : data(val), prev(nullptr), next(nullptr) {}\n};`,
      java: `class Node {\n    int data;\n    Node prev;\n    Node next;\n    Node(int data) {\n        this.data = data;\n        this.prev = null;\n        this.next = null;\n    }\n}`,
      python: `class Node:\n    def __init__(self, data):\n        self.data = data\n        self.prev = None\n        self.next = None`,
    },
    relatedLevel: 1,
    relatedTechnique: 'basic',
  },
  {
    id: 'theory-02',
    legacySlug: 'node-structure',
    number: '02',
    category: 'MEMORY & POINTERS',
    title: 'NODE STRUCTURE & MEMORY ALLOCATION',
    shortTitle: 'Node Memory Structure',
    readTime: '3 MIN',
    moduleId: 'fn-02-modulo',
    definition:
      'Understanding how Doubly Linked List nodes reside in system memory (the heap), the exact byte overhead of storing two 64-bit pointers per element, and non-contiguous memory pointer chaining.',
    analogy:
      'Instead of an apartment building where units are numbered consecutively in a line (an array), nodes are like houses scattered throughout a town. Each resident keeps the exact GPS coordinates of both their previous neighbor and their next neighbor.',
    specifications: [
      '64-Bit Pointer Overhead: Each pointer consumes 8 bytes on modern 64-bit architectures. A single node with a 4-byte integer payload requires 8 + 4 + 8 = 20 bytes (padded to 24 bytes by memory alignment).',
      'Non-Contiguous Allocation: Nodes can be placed anywhere in heap memory where free space exists, preventing memory fragmentation issues.',
      'No Resizing Copy Overhead: Unlike dynamic arrays (vectors/ArrayLists), expanding a DLL never requires reallocating or copying existing elements.',
      'Cache Performance Trade-off: Non-contiguous pointers result in more CPU cache misses compared to cache-friendly contiguous arrays.',
    ],
    formula: 'Total Node Bytes = sizeof(prev*) + sizeof(data) + sizeof(next*) + padding',
    formulaLabel: 'HEAP MEMORY CONSUMPTION EQUATION',
    codeSnippet: {
      cpp: `// 64-bit architecture node sizing\nsizeof(Node*) == 8 bytes;      // prev pointer\nsizeof(int)   == 4 bytes;      // data payload\nsizeof(Node*) == 8 bytes;      // next pointer\n// Total node size = 24 bytes (with 4-byte padding)`,
      java: `// In Java 64-bit JVM:\n// Object Header: 12-16 bytes\n// References (prev, next): 8 bytes each (or 4 with CompressedOOPs)\n// Primitive field: 4 bytes\n// Total ≈ 32-40 bytes per node`,
      python: `import sys\n# Python object overhead is ~56 bytes per Node instance\n# plus pointers to PyObject references`,
    },
    relatedLevel: 1,
    relatedTechnique: 'basic',
  },
  {
    id: 'theory-03',
    legacySlug: 'head-tail-pointers',
    number: '03',
    category: 'BOUNDARIES',
    title: 'THE HEAD & TAIL POINTERS',
    shortTitle: 'Head & Tail Bounds',
    readTime: '2 MIN',
    moduleId: 'fn-03-table',
    definition:
      'The boundary references maintained by the Doubly Linked List container that track the very first node (`head`) and the very last node (`tail`) in the sequence.',
    analogy:
      'Think of bookends holding a row of books on a shelf. The left bookend marks the start (Head) and the right bookend marks the finish (Tail). Without bookends, you cannot quickly pick up either end of the stack.',
    specifications: [
      'Empty List State: When the list contains zero nodes, `head == null` and `tail == null`.',
      'Single Node State: When exactly one node exists, `head == tail`, with `head.prev == null` and `head.next == null`.',
      'Boundary Invariants: For any valid linear DLL, `head.prev` MUST always be `null` and `tail.next` MUST always be `null`.',
      'O(1) Access to Ends: Maintaining an explicit `tail` pointer allows immediate O(1) appending and tail deletion without traversing the list.',
    ],
    formula: 'Boundary Invariants: head.prev == null && tail.next == null',
    formulaLabel: 'DOUBLY LINKED LIST INVARIANT',
    codeSnippet: {
      cpp: `class DoublyLinkedList {\npublic:\n    Node* head;\n    Node* tail;\n    int size;\n    DoublyLinkedList() : head(nullptr), tail(nullptr), size(0) {}\n    bool isEmpty() const { return head == nullptr; }\n};`,
      java: `public class DoublyLinkedList {\n    private Node head = null;\n    private Node tail = null;\n    private int size = 0;\n    public boolean isEmpty() { return head == null; }\n}`,
      python: `class DoublyLinkedList:\n    def __init__(self):\n        self.head = None\n        self.tail = None\n        self.size = 0\n    def is_empty(self):\n        return self.head is None`,
    },
    relatedLevel: 1,
    relatedTechnique: 'basic',
  },
  {
    id: 'theory-04',
    legacySlug: 'bidirectional-traversal',
    number: '04',
    category: 'TRAVERSAL',
    title: 'BI-DIRECTIONAL TRAVERSAL PIPELINE',
    shortTitle: 'Bi-directional Traversal',
    readTime: '3 MIN',
    moduleId: 'fn-04-lifecycle',
    definition:
      'The algorithmic process of visiting every node in the Doubly Linked List sequentially either from Head to Tail (forward) using `curr = curr.next` or from Tail to Head (backward) using `curr = curr.prev`.',
    analogy:
      'Like a cassette tape that can be played forwards or rewound backwards at any time without having to eject and flip the tape.',
    specifications: [
      'Forward Traversal: Start at `curr = head`, process `curr.data`, and advance `curr = curr.next` until `curr == null`.',
      'Backward Traversal: Start at `curr = tail`, process `curr.data`, and step back `curr = curr.prev` until `curr == null`.',
      'Optimized Search: If searching for an element at known index `k`, traverse from `head` if `k < size/2`, or traverse from `tail` if `k >= size/2` to cut max search steps in half.',
      'Time Complexity: O(N) time where N is the number of nodes, with O(1) auxiliary space.',
    ],
    formula: 'Forward: curr = curr.next  |  Backward: curr = curr.prev',
    formulaLabel: 'TRAVERSAL STEP OPERATIONS',
    codeSnippet: {
      cpp: `void printForward(Node* head) {\n    Node* curr = head;\n    while (curr != nullptr) {\n        cout << curr->data << " <-> ";\n        curr = curr->next;\n    }\n    cout << "NULL\\n";\n}\n\nvoid printBackward(Node* tail) {\n    Node* curr = tail;\n    while (curr != nullptr) {\n        cout << curr->data << " <-> ";\n        curr = curr->prev;\n    }\n    cout << "NULL\\n";\n}`,
      java: `public void traverseForward() {\n    Node curr = head;\n    while (curr != null) {\n        System.out.print(curr.data + " <-> ");\n        curr = curr.next;\n    }\n    System.out.println("null");\n}`,
      python: `def traverse_forward(self):\n    curr = self.head\n    while curr:\n        print(curr.data, end=" <-> ")\n        curr = curr.next\n    print("None")`,
    },
    relatedLevel: 3,
    relatedTechnique: 'linear',
  },
  {
    id: 'theory-05',
    legacySlug: 'insert-head',
    number: '05',
    category: 'OPERATIONS',
    title: 'INSERTION AT HEAD (PREPEND)',
    shortTitle: 'Insert at Head',
    readTime: '3 MIN',
    moduleId: 'fn-05-collision',
    definition:
      'Adding a newly allocated node to the very beginning of the list in guaranteed O(1) constant time by updating the head pointer and linking the old head backward to the new node.',
    analogy:
      'Attaching a new lead locomotive to the very front of a train: you connect the hitch from the new engine to the old first car, ensure the front of the new engine is clear, and declare it the new front.',
    specifications: [
      'Step 1: Allocate `newNode` with `newNode.data = value`, `newNode.prev = null`, `newNode.next = head`.',
      'Step 2: If the list is NOT empty (`head != null`), update `head.prev = newNode`.',
      'Step 3: Update `head = newNode`.',
      'Step 4: If the list WAS empty before insertion, also update `tail = newNode`.',
      'Time Complexity: Strict O(1) constant time, requiring exactly 3-4 pointer assignments.',
    ],
    formula: 'newNode.next = head; head.prev = newNode; head = newNode;',
    formulaLabel: 'HEAD INSERTION POINTER REWIRING',
    codeSnippet: {
      cpp: `void insertAtHead(int val) {\n    Node* newNode = new Node(val);\n    newNode->next = head;\n    if (head != nullptr) {\n        head->prev = newNode;\n    } else {\n        tail = newNode; // List was empty\n    }\n    head = newNode;\n    size++;\n}`,
      java: `public void insertAtHead(int val) {\n    Node newNode = new Node(val);\n    newNode.next = head;\n    if (head != null) {\n        head.prev = newNode;\n    } else {\n        tail = newNode;\n    }\n    head = newNode;\n    size++;\n}`,
      python: `def insert_at_head(self, val):\n    new_node = Node(val)\n    new_node.next = self.head\n    if self.head is not None:\n        self.head.prev = new_node\n    else:\n        self.tail = new_node\n    self.head = new_node\n    self.size += 1`,
    },
    relatedLevel: 1,
    relatedTechnique: 'basic',
  },
  {
    id: 'theory-06',
    legacySlug: 'insert-tail',
    number: '06',
    category: 'OPERATIONS',
    title: 'INSERTION AT TAIL (APPEND)',
    shortTitle: 'Insert at Tail',
    readTime: '3 MIN',
    moduleId: 'fn-06-chaining',
    definition:
      'Adding a new node at the very end of the list in O(1) constant time by linking the current tail forward to the new node and updating the tail pointer.',
    analogy:
      'Coupling a new caboose to the rear of the train: connect the rear hitch of the old last car to the new caboose, set the new caboose rear to empty, and designate it as the new tail.',
    specifications: [
      'Step 1: Allocate `newNode` with `newNode.data = value`, `newNode.prev = tail`, `newNode.next = null`.',
      'Step 2: If the list is NOT empty (`tail != null`), update `tail.next = newNode`.',
      'Step 3: Update `tail = newNode`.',
      'Step 4: If the list WAS empty, also update `head = newNode`.',
      'Time Complexity: Strict O(1) constant time when a `tail` pointer is maintained.',
    ],
    formula: 'newNode.prev = tail; tail.next = newNode; tail = newNode;',
    formulaLabel: 'TAIL INSERTION POINTER REWIRING',
    codeSnippet: {
      cpp: `void insertAtTail(int val) {\n    Node* newNode = new Node(val);\n    newNode->prev = tail;\n    if (tail != nullptr) {\n        tail->next = newNode;\n    } else {\n        head = newNode; // List was empty\n    }\n    tail = newNode;\n    size++;\n}`,
      java: `public void insertAtTail(int val) {\n    Node newNode = new Node(val);\n    newNode.prev = tail;\n    if (tail != null) {\n        tail.next = newNode;\n    } else {\n        head = newNode;\n    }\n    tail = newNode;\n    size++;\n}`,
      python: `def insert_at_tail(self, val):\n    new_node = Node(val)\n    new_node.prev = self.tail\n    if self.tail is not None:\n        self.tail.next = new_node\n    else:\n        self.head = new_node\n    self.tail = new_node\n    self.size += 1`,
    },
    relatedLevel: 2,
    relatedTechnique: 'chaining',
  },
  {
    id: 'theory-07',
    legacySlug: 'insert-position',
    number: '07',
    category: 'OPERATIONS',
    title: 'INSERTION AT MIDDLE POSITION (4-POINTER REWIRE)',
    shortTitle: 'Insert at Position',
    readTime: '4 MIN',
    moduleId: 'fn-07-linear',
    definition:
      'Inserting a node at an arbitrary internal index k between two existing nodes by systematically rewiring 4 distinct pointers without breaking the bi-directional chain.',
    analogy:
      'Two friends holding both hands in a circle. A third friend joins between them: both original friends let go of one hand each, and both connect hands with the newcomer.',
    specifications: [
      'The 4 Essential Pointer Updates:',
      '1. `newNode.next = curr` (New node points forward to successor)',
      '2. `newNode.prev = curr.prev` (New node points backward to predecessor)',
      '3. `curr.prev.next = newNode` (Predecessor points forward to new node)',
      '4. `curr.prev = newNode` (Successor points backward to new node)',
      'Order of Assignment Matters: Step 1 & 2 must occur before Step 4 to avoid losing the reference to `curr.prev` in languages without temp variables.',
    ],
    formula: 'newNode.next = curr; newNode.prev = curr.prev; curr.prev.next = newNode; curr.prev = newNode;',
    formulaLabel: '4-POINTER MIDDLE INSERTION SEQUENCE',
    codeSnippet: {
      cpp: `void insertAtPosition(int index, int val) {\n    if (index == 0) { insertAtHead(val); return; }\n    if (index >= size) { insertAtTail(val); return; }\n    Node* curr = head;\n    for (int i = 0; i < index; i++) curr = curr->next;\n    Node* newNode = new Node(val);\n    newNode->next = curr;\n    newNode->prev = curr->prev;\n    curr->prev->next = newNode;\n    curr->prev = newNode;\n    size++;\n}`,
      java: `public void insertAtPosition(int index, int val) {\n    if (index == 0) { insertAtHead(val); return; }\n    if (index >= size) { insertAtTail(val); return; }\n    Node curr = head;\n    for (int i = 0; i < index; i++) curr = curr.next;\n    Node newNode = new Node(val);\n    newNode.next = curr;\n    newNode.prev = curr.prev;\n    curr.prev.next = newNode;\n    curr.prev = newNode;\n    size++;\n}`,
      python: `def insert_at_position(self, index, val):\n    if index == 0: return self.insert_at_head(val)\n    if index >= self.size: return self.insert_at_tail(val)\n    curr = self.head\n    for _ in range(index): curr = curr.next\n    new_node = Node(val)\n    new_node.next = curr\n    new_node.prev = curr.prev\n    curr.prev.next = new_node\n    curr.prev = new_node\n    self.size += 1`,
    },
    relatedLevel: 4,
    relatedTechnique: 'quadratic',
  },
  {
    id: 'theory-08',
    legacySlug: 'delete-head-tail',
    number: '08',
    category: 'OPERATIONS',
    title: 'DELETION AT HEAD & TAIL',
    shortTitle: 'Delete Head & Tail',
    readTime: '3 MIN',
    moduleId: 'fn-08-quadratic',
    definition:
      'Removing either the first node (`head`) or the last node (`tail`) in O(1) constant time while maintaining boundary `null` invariants and preventing memory leaks.',
    analogy:
      'Decoupling the locomotive from the front of the train and making the second car the new front, or unhitching the caboose from the rear.',
    specifications: [
      'Delete Head: Save reference `toDelete = head`. Advance `head = head.next`. If `head != null`, set `head.prev = null`. Else (list now empty), set `tail = null`. Free `toDelete`.',
      'Delete Tail: Save reference `toDelete = tail`. Retract `tail = tail.prev`. If `tail != null`, set `tail.next = null`. Else (list now empty), set `head = null`. Free `toDelete`.',
      'Single Node Case: When `size == 1`, deleting head/tail resets both `head` and `tail` to `null`.',
      'Empty List Case: When `head == null`, deletion is a safe no-op or throws an underflow exception.',
    ],
    formula: 'head = head.next; if (head) head.prev = null; else tail = null;',
    formulaLabel: 'HEAD DELETION OPERATION',
    codeSnippet: {
      cpp: `void deleteHead() {\n    if (head == nullptr) return;\n    Node* temp = head;\n    head = head->next;\n    if (head != nullptr) head->prev = nullptr;\n    else tail = nullptr;\n    delete temp;\n    size--;\n}\n\nvoid deleteTail() {\n    if (tail == nullptr) return;\n    Node* temp = tail;\n    tail = tail->prev;\n    if (tail != nullptr) tail->next = nullptr;\n    else head = nullptr;\n    delete temp;\n    size--;\n}`,
      java: `public void deleteHead() {\n    if (head == null) return;\n    head = head.next;\n    if (head != null) head.prev = null;\n    else tail = null;\n    size--;\n}`,
      python: `def delete_head(self):\n    if self.head is None: return\n    self.head = self.head.next\n    if self.head is not None:\n        self.head.prev = None\n    else:\n        self.tail = None\n    self.size -= 1`,
    },
    relatedLevel: 4,
    relatedTechnique: 'quadratic',
  },
  {
    id: 'theory-09',
    legacySlug: 'delete-node',
    number: '09',
    category: 'OPERATIONS',
    title: 'DELETION OF A MIDDLE NODE (BYPASS REWIRING)',
    shortTitle: 'Delete Middle Node',
    readTime: '3 MIN',
    moduleId: 'fn-09-double',
    definition:
      'Removing an internal target node by routing its predecessor\'s `next` pointer around it to its successor, and its successor\'s `prev` pointer back to its predecessor in O(1) pointer updates once the node is identified.',
    analogy:
      'A bridge bypass detour: traffic from point A now goes directly to point C, skipping point B entirely, and returning traffic from C goes directly back to A.',
    specifications: [
      'The 2-Line Bypass Wiring:',
      '1. `target.prev.next = target.next` (Predecessor skips target to point forward to successor)',
      '2. `target.next.prev = target.prev` (Successor skips target to point backward to predecessor)',
      'No Traversal Needed If Pointer Is Known: In a DLL, deleting a node given only its direct pointer is O(1) time because `target.prev` is immediately accessible (unlike in a Singly Linked List which requires O(N) traversal to find predecessor).',
      'Memory Deallocation: In C/C++, call `delete target` to reclaim heap memory.',
    ],
    formula: 'target.prev.next = target.next; target.next.prev = target.prev; delete target;',
    formulaLabel: 'NODE BYPASS DELETION INVARIANT',
    codeSnippet: {
      cpp: `void deleteNode(Node* target) {\n    if (target == nullptr) return;\n    if (target == head) { deleteHead(); return; }\n    if (target == tail) { deleteTail(); return; }\n    target->prev->next = target->next;\n    target->next->prev = target->prev;\n    delete target;\n    size--;\n}`,
      java: `public void deleteNode(Node target) {\n    if (target == null) return;\n    if (target == head) { deleteHead(); return; }\n    if (target == tail) { deleteTail(); return; }\n    target.prev.next = target.next;\n    target.next.prev = target.prev;\n    size--;\n}`,
      python: `def delete_node(self, target):\n    if target is None: return\n    if target == self.head: return self.delete_head()\n    if target == self.tail: return self.delete_tail()\n    target.prev.next = target.next\n    target.next.prev = target.prev\n    self.size -= 1`,
    },
    relatedLevel: 5,
    relatedTechnique: 'double_hashing',
  },
  {
    id: 'theory-10',
    legacySlug: 'real-world-applications',
    number: '10',
    category: 'APPLICATIONS',
    title: 'REAL-WORLD APPLICATIONS (LRU CACHE & BROWSER)',
    shortTitle: 'Real-World Applications',
    readTime: '3 MIN',
    moduleId: 'fn-10-realworld',
    definition:
      'Industrial software systems and production architectures that rely on Doubly Linked Lists for fast bi-directional state management, memory caching, and history buffers.',
    analogy:
      'Like the Forward and Back navigation buttons on your web browser or the Next and Previous track controls on a music player: two-way movement with instant insertion of newly visited states.',
    specifications: [
      '1. Web Browser Forward/Back Navigation: Stores visited URLs where clicking Back steps `curr = curr.prev` and clicking Forward steps `curr = curr.next`. Visiting a new page truncates the forward chain and appends the new URL.',
      '2. LRU Cache (Least Recently Used): Combined with a Hash Map, a DLL enables O(1) eviction of the least recently used item (at tail) and O(1) promotion of accessed items (to head).',
      '3. Undo / Redo Command History: Text editors and CAD tools maintain command history nodes where users can undo (step backward) and redo (step forward).',
      '4. Music & Media Playlists: Supports looping, shuffling, previous track, and next track with seamless song insertion/removal.',
    ],
    formula: 'LRU Cache = Hash Map<Key, Node*> + Doubly Linked List<Key, Value>',
    formulaLabel: 'HYBRID LRU CACHE ARCHITECTURE',
    codeSnippet: {
      cpp: `// LRU Cache Node linking pattern\nclass LRUCache {\n    int capacity;\n    unordered_map<int, Node*> map;\n    Node* head; // Most Recently Used\n    Node* tail; // Least Recently Used\npublic:\n    void moveToHead(Node* node) {\n        // O(1) detach and prepend\n        detachNode(node);\n        insertAtHead(node);\n    }\n};`,
      java: `// Java's LinkedHashMap internally uses a Doubly Linked List\n// to preserve insertion order and support LRU access order.\nMap<String, String> lruCache = new LinkedHashMap<>(16, 0.75f, true);`,
      python: `from collections import OrderedDict\n# Python's OrderedDict is implemented using a hash table\n# and a doubly linked list for O(1) reordering.`,
    },
    relatedLevel: 5,
    relatedTechnique: 'double_hashing',
  },
  {
    id: 'theory-11',
    legacySlug: 'core-advantages',
    number: '11',
    category: 'ANALYSIS',
    title: 'ASYMPTOTIC COMPLEXITY & CORE ADVANTAGES',
    shortTitle: 'Complexity & Advantages',
    readTime: '3 MIN',
    moduleId: 'fn-11-advantages',
    definition:
      'A formal mathematical evaluation of Doubly Linked List time and space complexities, comparing them directly against Singly Linked Lists, Static Arrays, and Dynamic Vectors.',
    analogy:
      'Comparing a dual-track railway (DLL) with a one-way street (Singly Linked List) and a rigid parking lot (Static Array): dual tracks give ultimate routing flexibility at both ends without needing to repave the entire lot.',
    specifications: [
      'Insert/Delete at Head: O(1) constant time (Array is O(N) due to shifting elements).',
      'Insert/Delete at Tail: O(1) constant time with tail pointer (Singly Linked List is O(N) for tail deletion because predecessor cannot be reached).',
      'Delete Given Node Pointer: O(1) constant time (Singly Linked List is O(N) to find predecessor).',
      'Search / Random Access: O(N) time (Array is O(1) random access via index multiplication).',
      'Dynamic Sizing: Allocates exactly as needed on the heap with zero wasted pre-allocated buffer slots.',
    ],
    formula: 'Time: Access O(N) | Search O(N) | Insert Ends O(1) | Delete Node O(1)',
    formulaLabel: 'BIG-O COMPLEXITY SUMMARY',
    codeSnippet: {
      cpp: `// Complexity Benchmark Table:\n// Operation         | Array | Singly LL | Doubly LL\n// Access by Index   | O(1)  | O(N)      | O(N)\n// Insert at Head    | O(N)  | O(1)      | O(1)\n// Insert at Tail    | O(1)* | O(1)      | O(1)\n// Delete Tail       | O(1)  | O(N)      | O(1)  <-- DLL Key Win!\n// Delete given node | O(N)  | O(N)      | O(1)  <-- DLL Key Win!`,
      java: `// Memory Complexity: O(N)\n// Auxiliary Space for pointers: 2 * N * sizeof(reference)`,
      python: `# No amortized resize penalties like list.append() when doubling`,
    },
    relatedLevel: 1,
    relatedTechnique: 'basic',
  },
  {
    id: 'theory-12',
    legacySlug: 'limitations-tradeoffs',
    number: '12',
    category: 'TRADE-OFFS',
    title: 'MEMORY OVERHEAD & TRADE-OFFS',
    shortTitle: 'Trade-offs & Limits',
    readTime: '3 MIN',
    moduleId: 'fn-12-tradeoffs',
    definition:
      'The engineering compromises of using Doubly Linked Lists: increased memory footprint per node, lack of CPU cache locality, and the absence of O(1) random index access.',
    analogy:
      'A heavyweight luxury train with twin coupling systems and attendants on both sides: it gives you unmatched flexibility and safety, but consumes more fuel and space than a compact lightweight subway car.',
    specifications: [
      '1. 2x Pointer Memory Overhead: Storing both `prev` and `next` pointers doubles the metadata footprint compared to a Singly Linked List (16 bytes of pointers per node on 64-bit).',
      '2. Poor CPU Cache Locality: Nodes are scattered across the heap. Sequential traversal causes frequent CPU cache misses compared to cache-friendly contiguous arrays.',
      '3. No O(1) Random Index Access: Retrieving the element at index 50 requires traversing 50 nodes from head (or size - 50 from tail).',
      '4. Complex Pointer Bookkeeping: Every insertion/deletion requires accurately rewiring up to 4 pointers; a single missed pointer creates a dangling reference or memory leak.',
    ],
    formula: 'Memory Overhead = N * (2 * sizeof(pointer) + sizeof(data) + struct_padding)',
    formulaLabel: 'SPATIAL OVERHEAD FORMULA',
    codeSnippet: {
      cpp: `// When NOT to use a Doubly Linked List:\n// 1. When high-speed random index access (arr[i]) is primary requirement -> Use Vector/Array\n// 2. When memory is strictly constrained (embedded systems) -> Use Singly Linked List or Array\n// 3. When cache-conscious bulk numeric iterations are needed -> Use Contiguous Array`,
      java: `// LinkedList in Java (Doubly Linked) vs ArrayList:\n// ArrayList<Integer> uses ~4-8 bytes per int\n// LinkedList<Integer> uses ~24-32 bytes per node + Integer object box!`,
      python: `# Python list uses contiguous array of pointers, faster than custom Node DLL for bulk reads`,
    },
    relatedLevel: 1,
    relatedTechnique: 'basic',
  },
];

export const LearnHashingSection: React.FC<LearnHashingSectionProps> = ({
  initialTopic,
  onStartLevel,
  onOpenSandbox,
}) => {
  useScrollReveal();

  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    return normalizeTheoryChapterId(initialTopic || 'theory-01');
  });

  const [completedChapters, setCompletedChapters] = useState<string[]>(() => {
    return progressManager.getState().completedTheoryChapters || [];
  });

  const [activeCodeLang, setActiveCodeLang] = useState<'cpp' | 'java' | 'python'>('cpp');

  // Interactive Workbench States
  const [nodeDataInput, setNodeDataInput] = useState<number>(42);
  const [stepperNodes, setStepperNodes] = useState<number[]>([10, 20, 30, 40, 50]);
  const [stepperIndex, setStepperIndex] = useState<number>(0);
  const [heapElementsCount, setHeapElementsCount] = useState<number>(1000);

  useEffect(() => {
    if (initialTopic) {
      const normalized = normalizeTheoryChapterId(initialTopic);
      setSelectedChapterId(normalized);
    }
  }, [initialTopic]);

  useEffect(() => {
    const unsub = progressManager.subscribe((state) => {
      setCompletedChapters(state.completedTheoryChapters || []);
    });
    return unsub;
  }, []);

  const activeChapter =
    THEORY_CHAPTERS.find((c) => c.id === selectedChapterId) || THEORY_CHAPTERS[0];

  const handleSelectChapter = (chapterId: string) => {
    soundManager.playSelect();
    setSelectedChapterId(chapterId);
    progressManager.setCurrentTheoryChapter(chapterId);
  };

  const handleMarkAsRead = () => {
    soundManager.playSuccess();
    progressManager.completeTheoryChapter(activeChapter.id);
  };

  const isCurrentChapterCompleted = completedChapters.includes(activeChapter.id);
  const totalCompletedCount = completedChapters.length;

  const currentIdx = THEORY_CHAPTERS.findIndex((c) => c.id === activeChapter.id);
  const prevChapter = currentIdx > 0 ? THEORY_CHAPTERS[currentIdx - 1] : null;
  const nextChapter = currentIdx < THEORY_CHAPTERS.length - 1 ? THEORY_CHAPTERS[currentIdx + 1] : null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* =========================================================================
          TOP PROGRESS BAR & HEADER
          ========================================================================= */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-slate-800 flex items-center justify-center text-[#2563EB] dark:text-blue-300 shadow-2xs shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-widest font-mono block">
              Curriculum // 12 Chapters
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Doubly Linked List Masterclass
            </h1>
          </div>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl">
          <div className="flex flex-col text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Theory Progress</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
              {totalCompletedCount} / 12 ({Math.round((totalCompletedCount / 12) * 100)}%)
            </span>
          </div>
          <div className="w-16 h-2.5 bg-slate-200 dark:bg-blue-950/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-gradient rounded-full transition-all duration-300 shadow-xs shadow-primary-gradient"
              style={{ width: `${(totalCompletedCount / 12) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN 2-COLUMN LAYOUT:
             Left Sidebar: Chapter Directory (12 Chapters)
             Right Main: Active Chapter Content
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            LEFT COLUMN: CHAPTER DIRECTORY (12 CHAPTERS)
            ========================================================================= */}
        <aside className="lg:col-span-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden">
          {/* Directory Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B1120] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
              Table of Contents
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
              12 Chapters
            </span>
          </div>

          {/* List of 12 Selectable Chapter Rows */}
          <nav className="divide-y divide-slate-100 dark:divide-slate-800" aria-label="Table of Contents">
            {THEORY_CHAPTERS.map((chap) => {
              const isSelected = activeChapter.id === chap.id;
              const isCompleted = completedChapters.includes(chap.id);

              return (
                <button
                  key={chap.id}
                  id={`btn-chapter-${chap.id}`}
                  onClick={() => handleSelectChapter(chap.id)}
                  className={`w-full text-left px-4 py-3 transition-all flex items-center justify-between gap-2 cursor-pointer group select-none ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/60 text-[#2563EB] dark:text-cyan-300 font-semibold border-l-4 border-l-[#2563EB] dark:border-l-blue-500'
                      : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E293B] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`text-xs font-mono font-bold shrink-0 ${
                        isSelected
                          ? 'text-[#2563EB] dark:text-blue-400'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                    >
                      {chap.number}
                    </span>
                    <span className="text-sm leading-snug font-sans break-words">
                      {chap.shortTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isCompleted ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs" title="Completed">
                        ✓
                      </span>
                    ) : isSelected ? (
                      <span className="text-[#2563EB] dark:text-blue-400 text-xs font-bold" title="Current">
                        ●
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600 text-xs font-normal" title="Available">
                        ○
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Progress Summary */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#0B1120] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-sans">
            <span>Status:</span>
            <span className="font-semibold text-slate-900 dark:text-white font-mono">
              {totalCompletedCount} / 12 Completed
            </span>
          </div>
        </aside>

        {/* =========================================================================
            RIGHT COLUMN: ACTIVE CHAPTER VIEWER
            ========================================================================= */}
        <main
          key={activeChapter.id}
          className="lg:col-span-8 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] space-y-6 animate-chapter-switch"
        >
          {/* Chapter Metadata Header Tag & Read Time */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-slate-800 text-[#2563EB] dark:text-blue-300 rounded-md text-xs font-semibold uppercase tracking-wider font-mono">
                Chapter {activeChapter.number} // {activeChapter.category}
              </span>
              {isCurrentChapterCompleted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-md text-xs font-semibold font-sans">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                  <span>Completed</span>
                </span>
              )}
            </div>
            <div className="text-xs font-sans text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
              <span>Est. Read: {activeChapter.readTime}</span>
            </div>
          </div>

          {/* Chapter Big Heading */}
          <div className="mb-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {parseInt(activeChapter.number, 10)}. {activeChapter.title}
            </h2>
          </div>

          {/* 1. EXECUTIVE DEFINITION */}
          <div className="space-y-2 reveal-on-scroll">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono">
              Executive Definition
            </span>
            <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed max-w-3xl">
              {activeChapter.definition}
            </p>
          </div>

          {/* 2. FIELD ANALOGY */}
          <div className="bg-blue-50/60 dark:bg-blue-950/30 border-l-4 border-l-[#2563EB] dark:border-l-blue-500 border border-blue-100 dark:border-slate-800 rounded-r-xl p-4 sm:p-5 text-slate-800 dark:text-slate-200 leading-relaxed space-y-1.5 shadow-xs reveal-on-scroll stagger-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-300 block font-mono">
              Core Intuition // Analogy
            </span>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed italic">
              "{activeChapter.analogy}"
            </p>
          </div>

          {/* 3. CRITICAL SPECIFICATIONS */}
          <div className="space-y-3 reveal-on-scroll stagger-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono">
              Critical Specifications
            </span>
            <ul className="space-y-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-3xl">
              {activeChapter.specifications.map((spec, sIdx) => {
                const colonIndex = spec.indexOf(':');
                if (colonIndex > 0 && colonIndex < 40) {
                  const lead = spec.slice(0, colonIndex + 1);
                  const rest = spec.slice(colonIndex + 1);
                  return (
                    <li key={sIdx} className="flex items-start gap-3 leading-relaxed">
                      <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-blue-400 mt-2 shrink-0" />
                      <span>
                        <strong className="font-semibold text-slate-900 dark:text-white">{lead}</strong>
                        <span className="font-normal text-slate-600 dark:text-slate-300">{rest}</span>
                      </span>
                    </li>
                  );
                }
                return (
                  <li key={sIdx} className="flex items-start gap-3 leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-blue-400 mt-2 shrink-0" />
                    <span className="font-normal text-slate-600 dark:text-slate-300">{spec}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 4. FORMULA CARD */}
          {activeChapter.formula && (
            <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono shadow-xs reveal-on-scroll stagger-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2 font-mono">
                {activeChapter.formulaLabel || 'Pointer Invariant Formula'}
              </span>
              <div className="bg-[#F8FAFC] dark:bg-[#0B1120] text-[#111827] dark:text-cyan-300 p-3 rounded-lg text-xs sm:text-sm font-semibold overflow-x-auto border border-[#E5E7EB] dark:border-slate-800 border-l-4 border-l-[#2563EB] dark:border-l-blue-500">
                <code>{activeChapter.formula}</code>
              </div>
            </div>
          )}

          {/* 4.5. EDUCATIONAL DIAGRAMS, VISUALIZERS & WORKED EXAMPLES */}
          <TheoryVisualEnhancer chapterId={activeChapter.id} />

          {/* 4.6. MULTI-LANGUAGE CODE IMPLEMENTATION TAB */}
          {activeChapter.codeSnippet && (
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 font-mono space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs sm:text-sm font-bold uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                  Code Implementation
                </span>
                <div className="flex items-center gap-1.5">
                  {(['cpp', 'java', 'python'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveCodeLang(lang)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeCodeLang === lang
                          ? 'bg-primary-gradient text-white shadow-xs shadow-primary-gradient'
                          : 'bg-slate-100 dark:bg-blue-950/40 text-slate-600 dark:text-blue-300 hover:bg-slate-200'
                      }`}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'java' ? 'Java' : 'Python'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0F172A] text-slate-200 p-4 rounded-xl text-xs sm:text-sm overflow-x-auto font-mono leading-relaxed border border-slate-800">
                <pre>{activeChapter.codeSnippet[activeCodeLang]}</pre>
              </div>
            </div>
          )}

          {/* 5. INTERACTIVE WORKBENCHES FOR KEY TOPICS */}
          {activeChapter.id === 'theory-01' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 font-mono space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs sm:text-sm font-bold uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                  Interactive DLL Node Creator
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Node Data:</label>
                  <input
                    type="number"
                    value={nodeDataInput}
                    onChange={(e) => setNodeDataInput(Number(e.target.value))}
                    className="w-24 p-2 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="flex-1 w-full bg-slate-50 dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">prev* (0x7ffe)</span>
                  <span className="text-xs text-[#2563EB] font-bold">←</span>
                  <div className="px-4 py-2 bg-primary-gradient text-white rounded-lg font-bold text-base shadow-xs shadow-primary-gradient">
                    {nodeDataInput}
                  </div>
                  <span className="text-xs text-[#2563EB] font-bold">→</span>
                  <span className="text-xs text-slate-400 font-mono">next* (0x7fff)</span>
                </div>
              </div>
            </div>
          )}

          {activeChapter.id === 'theory-02' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 font-mono space-y-4 shadow-xs">
              <div className="text-xs sm:text-sm font-bold uppercase text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <span>Heap Memory Footprint Calculator</span>
                <span className="text-xs text-[#2563EB] dark:text-blue-400 font-bold">64-Bit Architecture</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Number of Nodes in Doubly Linked List (N):
                  </label>
                  <input
                    type="range"
                    min={100}
                    max={100000}
                    step={100}
                    value={heapElementsCount}
                    onChange={(e) => setHeapElementsCount(Number(e.target.value))}
                    className="w-full accent-[#2563EB]"
                  />
                  <div className="flex justify-between text-slate-500 font-mono mt-1">
                    <span>N = {heapElementsCount.toLocaleString()} Nodes</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-slate-500 block text-[11px]">Payload Bytes</span>
                    <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                      {(heapElementsCount * 4).toLocaleString()} B
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-slate-800 rounded-xl">
                    <span className="text-[#2563EB] dark:text-blue-400 block text-[11px]">Pointer Overhead (2x 8B)</span>
                    <span className="text-base font-bold text-[#2563EB] dark:text-blue-300">
                      {(heapElementsCount * 16).toLocaleString()} B
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl">
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[11px]">Total Heap Footprint</span>
                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                      {(heapElementsCount * 24 / 1024).toFixed(2)} KB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeChapter.id === 'theory-04' && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 font-mono space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs sm:text-sm font-bold uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                  Interactive Forward & Backward Stepper
                </span>
                <span className="text-xs font-mono font-bold text-[#2563EB] dark:text-blue-300">
                  Current: Node[{stepperIndex}] = {stepperNodes[stepperIndex]}
                </span>
              </div>

              {/* Stepper Chain */}
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-3">
                <span className="text-xs text-slate-400 font-mono">null</span>
                <span className="text-xs text-slate-400">←</span>
                {stepperNodes.map((val, idx) => (
                  <React.Fragment key={idx}>
                    <div
                      onClick={() => setStepperIndex(idx)}
                      className={`px-3.5 py-2 rounded-xl border text-center transition-all cursor-pointer ${
                        stepperIndex === idx
                          ? 'bg-primary-gradient text-white font-bold border-transparent shadow-xs shadow-primary-gradient scale-105'
                          : 'bg-slate-50 dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#2563EB]'
                      }`}
                    >
                      <div className="text-[10px] opacity-70">[{idx}]</div>
                      <div className="text-sm font-bold">{val}</div>
                    </div>
                    {idx < stepperNodes.length - 1 && (
                      <span className="text-xs text-blue-400 dark:text-blue-400 font-bold">⇄</span>
                    )}
                  </React.Fragment>
                ))}
                <span className="text-xs text-slate-400">→</span>
                <span className="text-xs text-slate-400 font-mono">null</span>
              </div>

              {/* Stepper Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  disabled={stepperIndex === 0}
                  onClick={() => {
                    soundManager.playClick();
                    setStepperIndex((prev) => Math.max(0, prev - 1));
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-blue-950/50 hover:bg-slate-200 text-slate-800 dark:text-blue-300 disabled:opacity-40 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Step Backward (curr.prev)</span>
                </button>
                <button
                  disabled={stepperIndex === stepperNodes.length - 1}
                  onClick={() => {
                    soundManager.playClick();
                    setStepperIndex((prev) => Math.min(stepperNodes.length - 1, prev + 1));
                  }}
                  className="px-4 py-2 bg-primary-gradient hover:brightness-110 text-white disabled:opacity-40 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs shadow-primary-gradient"
                >
                  <span>Step Forward (curr.next)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 6. BOTTOM ACTIONS & COMPLETION CHECKMARK */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                id="btn-mark-chapter-read"
                onClick={handleMarkAsRead}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                  isCurrentChapterCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-primary-gradient hover:brightness-110 text-white shadow-xs shadow-primary-gradient'
                }`}
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isCurrentChapterCompleted ? 'Chapter Completed ✓' : 'Mark as Completed'}</span>
              </button>
            </div>

            {/* Previous & Next Chapter Navigation Links */}
            <div className="flex items-center gap-2">
              {prevChapter && (
                <button
                  id="btn-prev-chapter"
                  onClick={() => handleSelectChapter(prevChapter.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-blue-950/40 hover:bg-slate-200 dark:hover:bg-blue-900/50 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}
              {nextChapter && (
                <button
                  id="btn-next-chapter"
                  onClick={() => handleSelectChapter(nextChapter.id)}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/70 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Next: {nextChapter.shortTitle}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
