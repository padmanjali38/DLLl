import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Lightbulb,
  Award,
  ArrowRight,
  Trash2,
  Sparkles,
  Link,
  Edit3,
  X,
  PlusCircle,
  Lock,
} from 'lucide-react';
import {
  DLLTask,
  DLLNodeState,
  normalizeAddress,
  normalizeAddressInput,
  isValidPointerAddress,
  isNullPointer,
  arePointersEqual,
} from './dllGameData';
import { soundManager } from '../../utils/audio';

export interface GuidedStepHistoryItem {
  stepNumber: number;
  operationText?: string;
  explanation: string;
}

interface DLLInteractiveTaskWorkspaceProps {
  task: DLLTask;
  isAlreadyCompleted: boolean;
  onBackToTasks: () => void;
  onTaskSolved: (taskId: string, xp: number) => void;
  onNextTask?: () => void;
}

interface DLLValidationResult {
  isValid: boolean;
  title?: string;
  message: string;
  explanation?: string;
}

/**
 * Pure DLL Validator evaluating the live internal state against all structural requirements:
 * 1. HEAD and TAIL presence
 * 2. Boundary conditions (HEAD.prev == NULL, TAIL.next == NULL)
 * 3. Forward traversal reaches all active nodes without cycles and ends at TAIL
 * 4. Backward traversal reaches all active nodes without cycles and ends at HEAD
 * 5. Bidirectional integrity (A.next == B <=> B.prev == A)
 * 6. Specific expected connections if specified on the task
 */
export const validateDLLState = (
  task: DLLTask,
  currentNodes: DLLNodeState[],
  exploredFields: { prev: boolean; data: boolean; next: boolean },
  visitedSequence: number[],
  currentHead?: string | null,
  currentTail?: string | null,
  nodeBuilderSlots?: { prev: string | null; data: string | null; next: string | null },
  traversalSlots?: (number | null)[]
): DLLValidationResult => {
  // 1. Concept Task
  if (task.taskType === 'concept') {
    if (exploredFields.prev && exploredFields.data && exploredFields.next) {
      return {
        isValid: true,
        title: 'Correct!',
        message: 'You explored all 3 components of a Doubly Linked List node: PREV, DATA, and NEXT.',
        explanation: 'PREV points to the previous node, DATA stores the value, and NEXT points to the successor.',
      };
    }
    return {
      isValid: false,
      title: 'Incomplete',
      message: 'Click each field (PREV, DATA, NEXT) of the node to inspect what it does.',
      explanation: 'Make sure you have explored all three parts of the node.',
    };
  }

  // 2. Task 1: Creating a Node (task.taskType === 'create_node' or task.id === 'task-1-1')
  if (task.taskType === 'create_node' || task.id === 'task-1-1') {
    const activeNodes = currentNodes.filter((n) => !n.isDeleted);
    if (activeNodes.length === 0) {
      return {
        isValid: false,
        title: 'No Node Created',
        message: 'No node has been created in memory.',
        explanation: 'A standalone node with DATA = 5 must be constructed.',
      };
    }
    if (activeNodes.length > 1) {
      return {
        isValid: false,
        title: 'Too Many Nodes',
        message: 'There should only be 1 standalone node in memory.',
        explanation: 'This task requires creating a single standalone node.',
      };
    }

    const node = activeNodes[0];
    const dataNum = Number(node.data);

    // Exact numeric comparison: strictly 5, never 0, never 50
    if (dataNum === 0) {
      return {
        isValid: false,
        title: 'Incomplete',
        message: 'The node DATA is still 0.',
        explanation: 'Click the DATA field on the node to change it from 0 to 5.',
      };
    }
    if (dataNum !== 5) {
      return {
        isValid: false,
        title: 'Wrong Answer',
        message: `Wrong answer. DATA must be 5, not ${node.data}.`,
        explanation: 'The task requires setting the node DATA to exact value 5.',
      };
    }
    if (!isNullPointer(node.prev)) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: 'Wrong pointer. PREV must be NULL for a standalone node.',
        explanation: 'Because this node is isolated, its backward PREV pointer points to NULL.',
      };
    }
    if (!isNullPointer(node.next)) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: 'Wrong pointer. NEXT must be NULL for a standalone node.',
        explanation: 'Because this node is not linked to a successor, its NEXT pointer points to NULL.',
      };
    }

    return {
      isValid: true,
      title: 'Correct!',
      message: 'Node 5 was created successfully!',
      explanation: 'The new node contains DATA = 5 with PREV and NEXT correctly initialized to NULL.',
    };
  }

  // 3. Task 2: Build the DLL (task.taskType === 'build' or task.id === 'task-1-2')
  if (task.taskType === 'build' || task.id === 'task-1-2') {
    const activeNodes = currentNodes.filter((n) => !n.isDeleted);
    const nodeMap = new Map<string, DLLNodeState>();
    for (const n of activeNodes) {
      nodeMap.set(normalizeAddress(n.address), n);
    }

    if (activeNodes.length !== 3) {
      return {
        isValid: false,
        title: 'Wrong Node Count',
        message: 'The DLL must contain exactly 3 nodes: 10, 20, and 30.',
        explanation: 'Ensure all 3 initial nodes are present.',
      };
    }

    const node10 = nodeMap.get('0x1000');
    const node20 = nodeMap.get('0x1008');
    const node30 = nodeMap.get('0x1010');

    if (!node10 || !node20 || !node30) {
      return {
        isValid: false,
        title: 'Missing Node',
        message: 'One of the required nodes (10, 20, 30) is missing.',
        explanation: 'Verify that nodes 10 (0x1000), 20 (0x1008), and 30 (0x1010) exist.',
      };
    }

    // Check HEAD
    if (!currentHead || !arePointersEqual(currentHead, '0x1000')) {
      return {
        isValid: false,
        title: 'Wrong HEAD',
        message: 'Wrong HEAD pointer. HEAD must point to the first node (10 at 0x1000).',
        explanation: 'Click the HEAD button in the toolbar and select node 10.',
      };
    }

    // Check TAIL
    if (!currentTail || !arePointersEqual(currentTail, '0x1010')) {
      return {
        isValid: false,
        title: 'Wrong TAIL',
        message: 'Wrong TAIL pointer. TAIL must point to the last node (30 at 0x1010).',
        explanation: 'Click the TAIL button in the toolbar and select node 30.',
      };
    }

    // Node 10
    if (!isNullPointer(node10.prev)) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: 'Node 10 is the HEAD, so its PREV pointer must be NULL.',
        explanation: 'The first node has no preceding node in memory.',
      };
    }
    if (!arePointersEqual(node10.next, '0x1008')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Node 10's NEXT should point forward to node 20 (0x1008).",
        explanation: 'Connect node 10 forward to node 20.',
      };
    }

    // Node 20
    if (!arePointersEqual(node20.prev, '0x1000')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Node 20's PREV should point backward to node 10 (0x1000).",
        explanation: 'Connect node 20 backward to node 10.',
      };
    }
    if (!arePointersEqual(node20.next, '0x1010')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Node 20's NEXT should point forward to node 30 (0x1010).",
        explanation: 'Connect node 20 forward to node 30.',
      };
    }

    // Node 30
    if (!arePointersEqual(node30.prev, '0x1008')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Node 30's PREV should point backward to node 20 (0x1008).",
        explanation: 'Connect node 30 backward to node 20.',
      };
    }
    if (!isNullPointer(node30.next)) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: 'Node 30 is the TAIL, so its NEXT pointer must be NULL.',
        explanation: 'The last node has no succeeding node.',
      };
    }

    return {
      isValid: true,
      title: 'Correct!',
      message: 'The Doubly Linked List is properly built!',
      explanation: 'Every node is connected bidirectionally, HEAD points to node 10, and TAIL points to node 30.',
    };
  }

  // 4. Task 3: Traversal in DLL (task.taskType === 'traverse' or task.id === 'task-1-3')
  if (task.taskType === 'traverse' || task.id === 'task-1-3') {
    const expected = task.expectedTraversal || [10, 20, 30];
    const slots = traversalSlots || [];

    if (slots.length < expected.length || slots.some((s) => s === null)) {
      return {
        isValid: false,
        title: 'Incomplete',
        message: 'Place all nodes into the traversal order.',
        explanation: `There are ${expected.length} nodes in the list. Drag each node into its corresponding position.`,
      };
    }

    for (let i = 0; i < expected.length; i++) {
      if (slots[i] !== expected[i]) {
        if (i === 0) {
          return {
            isValid: false,
            title: 'Wrong Order',
            message: 'Traversal order is incorrect. Traversal must start from HEAD (node 10).',
            explanation: 'Start at the HEAD of the list and follow NEXT pointers forward.',
          };
        } else {
          return {
            isValid: false,
            title: 'Wrong Order',
            message: `Traversal order is incorrect at position ${i + 1}. Expected node ${expected[i]}, but found ${slots[i]}.`,
            explanation: "Follow each node's NEXT pointer from HEAD to find the correct sequence.",
          };
        }
      }
    }

    return {
      isValid: true,
      title: 'Correct!',
      message: 'Traversal completed successfully!',
      explanation: 'You started at HEAD and followed each NEXT pointer until reaching TAIL: 10 → 20 → 30.',
    };
  }

  // 5. Level 2 Task 1: Insert at Beginning (task.id === 'task-2-1')
  if (task.id === 'task-2-1') {
    const activeNodes = currentNodes.filter((n) => !n.isDeleted);
    const nodeMap = new Map<string, DLLNodeState>();
    for (const n of activeNodes) {
      nodeMap.set(normalizeAddress(n.address), n);
    }

    // Check new node at 0x1018 exists
    const newNode = nodeMap.get('0x1018');
    if (!newNode) {
      return {
        isValid: false,
        title: 'Missing Node',
        message: 'The new node (0x1018) has not been allocated.',
        explanation: 'Click CREATE NODE in the toolbar to allocate the new node.',
      };
    }

    // Check new node DATA
    const dataVal = Number(newNode.data);
    if (dataVal === 0) {
      return {
        isValid: false,
        title: 'Incomplete DATA',
        message: 'The new node DATA is still 0.',
        explanation: 'Click the DATA field on node 0x1018 and enter DATA = 5.',
      };
    }
    if (dataVal !== 5) {
      return {
        isValid: false,
        title: 'Wrong DATA',
        message: `Wrong answer. DATA must be 5, not ${newNode.data}.`,
        explanation: 'The task requires creating a node with DATA = 5.',
      };
    }

    // Check new node PREV (must be NULL)
    if (!isNullPointer(newNode.prev)) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: 'Wrong pointer. Since node 5 is at the beginning, its PREV pointer must be NULL.',
        explanation: 'The first node in the DLL has no predecessor.',
      };
    }

    // Check new node NEXT (must point to old HEAD 0x1000)
    if (!arePointersEqual(newNode.next, '0x1000')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Wrong pointer. Node 5's NEXT pointer must point to the old HEAD (node 10 at 0x1000).",
        explanation: 'Connect the new node forward to node 10.',
      };
    }

    // Check node 10 (0x1000)
    const node10 = nodeMap.get('0x1000');
    if (!node10 || !arePointersEqual(node10.prev, '0x1018')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Wrong pointer. Node 10's PREV should point backward to the new node (0x1018).",
        explanation: 'Node 10 must point backward to the new node to maintain bidirectional linking.',
      };
    }
    if (!arePointersEqual(node10.next, '0x1008')) {
      return {
        isValid: false,
        title: 'Broken Connection',
        message: "Node 10's NEXT should remain connected to node 20 (0x1008).",
        explanation: 'Preserve existing successor connections.',
      };
    }

    // Check node 20 and 30
    const node20 = nodeMap.get('0x1008');
    if (!node20 || !arePointersEqual(node20.prev, '0x1000') || !arePointersEqual(node20.next, '0x1010')) {
      return {
        isValid: false,
        title: 'Broken Connection',
        message: 'Connections on node 20 were altered.',
        explanation: 'Node 20 must link backward to 0x1000 and forward to 0x1010.',
      };
    }
    const node30 = nodeMap.get('0x1010');
    if (!node30 || !arePointersEqual(node30.prev, '0x1008') || !isNullPointer(node30.next)) {
      return {
        isValid: false,
        title: 'Broken Connection',
        message: 'Connections on node 30 were altered.',
        explanation: 'Node 30 must link backward to 0x1008 and have NEXT as NULL.',
      };
    }

    // Check HEAD
    if (!currentHead || arePointersEqual(currentHead, '0x1000')) {
      return {
        isValid: false,
        title: 'HEAD Not Updated',
        message: 'Not complete yet. The new node is connected correctly, but HEAD still points to 0x1000.',
        explanation: 'Click HEAD in the toolbar and select the new node (0x1018) to update HEAD.',
      };
    }
    if (!arePointersEqual(currentHead, '0x1018')) {
      return {
        isValid: false,
        title: 'Wrong HEAD',
        message: 'Wrong HEAD pointer. HEAD must point to the new first node (0x1018).',
        explanation: 'Click HEAD in the toolbar and select node 5.',
      };
    }

    // Check TAIL
    if (!currentTail || !arePointersEqual(currentTail, '0x1010')) {
      return {
        isValid: false,
        title: 'Wrong TAIL',
        message: 'TAIL pointer must remain pointing to node 30 (0x1010).',
        explanation: 'Do not change the TAIL pointer when inserting at the beginning.',
      };
    }

    return {
      isValid: true,
      title: 'Correct!',
      message: 'Node 5 was successfully inserted at the beginning!',
      explanation: 'HEAD points to node 5, bidirectional connections with node 10 are established, and TAIL remains at node 30.',
    };
  }

  // 6. Level 2 Task 2: Insert at End (task.id === 'task-2-2')
  if (task.id === 'task-2-2') {
    const activeNodes = currentNodes.filter((n) => !n.isDeleted);
    const nodeMap = new Map<string, DLLNodeState>();
    for (const n of activeNodes) {
      nodeMap.set(normalizeAddress(n.address), n);
    }

    const newNode = nodeMap.get('0x1018');
    if (!newNode) {
      return {
        isValid: false,
        title: 'Missing Node',
        message: 'The new node (0x1018) has not been allocated.',
        explanation: 'Click CREATE NODE in the toolbar to allocate the new node.',
      };
    }

    const dataVal = Number(newNode.data);
    if (dataVal === 0) {
      return {
        isValid: false,
        title: 'Incomplete DATA',
        message: 'The new node DATA is still 0.',
        explanation: 'Click the DATA field on node 0x1018 and enter DATA = 40.',
      };
    }
    if (dataVal !== 40) {
      return {
        isValid: false,
        title: 'Wrong DATA',
        message: `Wrong answer. DATA must be 40, not ${newNode.data}.`,
        explanation: 'The task requires creating a node with DATA = 40.',
      };
    }

    // Check node 30 NEXT points to 0x1018
    const node30 = nodeMap.get('0x1010');
    if (!node30 || !arePointersEqual(node30.next, '0x1018')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Wrong pointer. Node 30's NEXT pointer must point to the new node (0x1018).",
        explanation: 'Connect node 30 forward to the newly created node.',
      };
    }

    // Check new node PREV points to 0x1010
    if (!arePointersEqual(newNode.prev, '0x1010')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Wrong pointer. The new node's PREV pointer must point backward to node 30 (0x1010).",
        explanation: 'Link the new node backward to node 30.',
      };
    }

    // Check new node NEXT is NULL
    if (!isNullPointer(newNode.next)) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: 'Wrong pointer. Since the new node is at the end, its NEXT pointer must be NULL.',
        explanation: 'The last node in a DLL has no successor.',
      };
    }

    // Check HEAD
    if (!currentHead || !arePointersEqual(currentHead, '0x1000')) {
      return {
        isValid: false,
        title: 'Wrong HEAD',
        message: 'HEAD must remain pointing to node 10 (0x1000).',
        explanation: 'Do not move HEAD when inserting at the end.',
      };
    }

    // Check TAIL
    if (!currentTail || arePointersEqual(currentTail, '0x1010')) {
      return {
        isValid: false,
        title: 'TAIL Not Updated',
        message: 'Not complete yet. The new node is connected correctly, but TAIL still points to 0x1010.',
        explanation: 'Click TAIL in the toolbar and select the new node (0x1018) to update TAIL.',
      };
    }
    if (!arePointersEqual(currentTail, '0x1018')) {
      return {
        isValid: false,
        title: 'Wrong TAIL',
        message: 'Wrong TAIL pointer. TAIL must point to the new last node (0x1018).',
        explanation: 'Click TAIL in the toolbar and select node 40.',
      };
    }

    return {
      isValid: true,
      title: 'Correct!',
      message: 'Node 40 was successfully inserted at the end!',
      explanation: 'TAIL is updated to node 40, node 30 connects forward to 40, and 40 connects backward to 30.',
    };
  }

  // 7. Level 2 Task 3: Insert at Any Position (task.id === 'task-2-3')
  if (task.id === 'task-2-3') {
    const activeNodes = currentNodes.filter((n) => !n.isDeleted);
    const nodeMap = new Map<string, DLLNodeState>();
    for (const n of activeNodes) {
      nodeMap.set(normalizeAddress(n.address), n);
    }

    const newNode = nodeMap.get('0x1018');
    if (!newNode) {
      return {
        isValid: false,
        title: 'Missing Node',
        message: 'The new node (0x1018) has not been allocated.',
        explanation: 'Click CREATE NODE in the toolbar to allocate the new node.',
      };
    }

    const dataVal = Number(newNode.data);
    if (dataVal === 0) {
      return {
        isValid: false,
        title: 'Incomplete DATA',
        message: 'The new node DATA is still 0.',
        explanation: 'Click the DATA field on node 0x1018 and enter DATA = 30.',
      };
    }
    if (dataVal !== 30) {
      return {
        isValid: false,
        title: 'Wrong DATA',
        message: `Wrong answer. DATA must be 30, not ${newNode.data}.`,
        explanation: 'The task requires creating a node with DATA = 30.',
      };
    }

    // Node 20 NEXT must be 0x1018
    const node20 = nodeMap.get('0x1008');
    if (!node20 || !arePointersEqual(node20.next, '0x1018')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Wrong pointer. Node 20's NEXT should point forward to the inserted node (0x1018).",
        explanation: 'Connect node 20 forward to node 30.',
      };
    }

    // New node PREV must be 0x1008
    if (!arePointersEqual(newNode.prev, '0x1008')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Wrong pointer. The new node's PREV must point backward to node 20 (0x1008).",
        explanation: 'Connect the new node backward to node 20.',
      };
    }

    // New node NEXT must be 0x1010
    if (!arePointersEqual(newNode.next, '0x1010')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Wrong pointer. The new node's NEXT must point forward to node 40 (0x1010).",
        explanation: 'Connect the new node forward to node 40.',
      };
    }

    // Node 40 PREV must be 0x1018
    const node40 = nodeMap.get('0x1010');
    if (!node40 || !arePointersEqual(node40.prev, '0x1018')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Wrong pointer. Node 40's PREV should point backward to the inserted node (0x1018).",
        explanation: 'Connect node 40 backward to the new node.',
      };
    }

    // HEAD and TAIL
    if (!currentHead || !arePointersEqual(currentHead, '0x1000')) {
      return {
        isValid: false,
        title: 'Wrong HEAD',
        message: 'HEAD must remain pointing to node 10 (0x1000).',
        explanation: 'Inserting in the middle does not change HEAD.',
      };
    }
    if (!currentTail || !arePointersEqual(currentTail, '0x1010')) {
      return {
        isValid: false,
        title: 'Wrong TAIL',
        message: 'TAIL must remain pointing to node 40 (0x1010).',
        explanation: 'Inserting in the middle does not change TAIL.',
      };
    }

    return {
      isValid: true,
      title: 'Correct!',
      message: 'Node 30 was inserted between 20 and 40 successfully!',
      explanation: 'All 4 pointers (20.NEXT, new.PREV, new.NEXT, 40.PREV) are properly updated with bidirectional symmetry.',
    };
  }

  // 8. Level 3 Task 1: Delete at Beginning (task.id === 'task-3-1')
  if (task.id === 'task-3-1') {
    const activeNodes = currentNodes.filter((n) => !n.isDeleted);
    const nodeMap = new Map<string, DLLNodeState>();
    for (const n of activeNodes) {
      nodeMap.set(normalizeAddress(n.address), n);
    }

    // Node 10 must be deleted
    if (nodeMap.has('0x1000')) {
      return {
        isValid: false,
        title: 'Node Not Deleted',
        message: 'Not complete yet. Node 10 has not been deleted.',
        explanation: 'Select DELETE NODE from the toolbar and click node 10 to remove it.',
      };
    }

    // Check HEAD
    if (!currentHead || arePointersEqual(currentHead, '0x1000')) {
      return {
        isValid: false,
        title: 'HEAD Not Updated',
        message: 'Not complete yet. Node 10 was deleted, but HEAD still points to 0x1000.',
        explanation: 'Click HEAD in the toolbar and select node 20 (0x1008).',
      };
    }
    if (!arePointersEqual(currentHead, '0x1008')) {
      return {
        isValid: false,
        title: 'Wrong HEAD',
        message: 'Wrong HEAD pointer. HEAD must point to node 20 (0x1008).',
        explanation: 'Designate node 20 as the new HEAD.',
      };
    }

    // Node 20 PREV must be NULL
    const node20 = nodeMap.get('0x1008');
    if (!node20 || !isNullPointer(node20.prev)) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: 'Wrong pointer. Since node 20 is now HEAD, its PREV pointer must be NULL.',
        explanation: 'Update node 20 PREV to NULL.',
      };
    }

    // Node 20 NEXT must be 0x1010
    if (!arePointersEqual(node20.next, '0x1010')) {
      return {
        isValid: false,
        title: 'Broken Connection',
        message: "Node 20's NEXT should remain connected to node 30 (0x1010).",
        explanation: 'Do not alter remaining connections.',
      };
    }

    // Node 30 PREV must be 0x1008, NEXT must be NULL
    const node30 = nodeMap.get('0x1010');
    if (!node30 || !arePointersEqual(node30.prev, '0x1008') || !isNullPointer(node30.next)) {
      return {
        isValid: false,
        title: 'Broken Connection',
        message: 'Connections on node 30 were altered.',
        explanation: 'Node 30 PREV must be 0x1008 and NEXT must be NULL.',
      };
    }

    // TAIL
    if (!currentTail || !arePointersEqual(currentTail, '0x1010')) {
      return {
        isValid: false,
        title: 'Wrong TAIL',
        message: 'TAIL must remain pointing to node 30 (0x1010).',
        explanation: 'Do not change TAIL in this task.',
      };
    }

    return {
      isValid: true,
      title: 'Correct!',
      message: 'Node 10 was deleted from the beginning successfully!',
      explanation: 'HEAD was updated to node 20, and node 20 PREV was set to NULL.',
    };
  }

  // 9. Level 3 Task 2: Delete at End (task.id === 'task-3-2')
  if (task.id === 'task-3-2') {
    const activeNodes = currentNodes.filter((n) => !n.isDeleted);
    const nodeMap = new Map<string, DLLNodeState>();
    for (const n of activeNodes) {
      nodeMap.set(normalizeAddress(n.address), n);
    }

    // Node 30 must be deleted
    if (nodeMap.has('0x1010')) {
      return {
        isValid: false,
        title: 'Node Not Deleted',
        message: 'Not complete yet. Node 30 has not been deleted.',
        explanation: 'Select DELETE NODE from the toolbar and click node 30 to remove it.',
      };
    }

    // Check TAIL
    if (!currentTail || arePointersEqual(currentTail, '0x1010')) {
      return {
        isValid: false,
        title: 'TAIL Not Updated',
        message: 'Not complete yet. Node 30 was deleted, but TAIL still points to 0x1010.',
        explanation: 'Click TAIL in the toolbar and select node 20 (0x1008).',
      };
    }
    if (!arePointersEqual(currentTail, '0x1008')) {
      return {
        isValid: false,
        title: 'Wrong TAIL',
        message: 'Wrong TAIL pointer. TAIL must point to node 20 (0x1008).',
        explanation: 'Designate node 20 as the new TAIL.',
      };
    }

    // Node 20 NEXT must be NULL
    const node20 = nodeMap.get('0x1008');
    if (!node20 || !isNullPointer(node20.next)) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: 'Wrong pointer. Since node 20 is now TAIL, its NEXT pointer must be NULL.',
        explanation: 'Update node 20 NEXT to NULL.',
      };
    }

    // Node 20 PREV must be 0x1000
    if (!arePointersEqual(node20.prev, '0x1000')) {
      return {
        isValid: false,
        title: 'Broken Connection',
        message: "Node 20's PREV should remain connected to node 10 (0x1000).",
        explanation: 'Do not alter remaining connections.',
      };
    }

    // Node 10 PREV must be NULL, NEXT must be 0x1008
    const node10 = nodeMap.get('0x1000');
    if (!node10 || !isNullPointer(node10.prev) || !arePointersEqual(node10.next, '0x1008')) {
      return {
        isValid: false,
        title: 'Broken Connection',
        message: 'Connections on node 10 were altered.',
        explanation: 'Node 10 PREV must be NULL and NEXT must be 0x1008.',
      };
    }

    // HEAD
    if (!currentHead || !arePointersEqual(currentHead, '0x1000')) {
      return {
        isValid: false,
        title: 'Wrong HEAD',
        message: 'HEAD must remain pointing to node 10 (0x1000).',
        explanation: 'Do not change HEAD in this task.',
      };
    }

    return {
      isValid: true,
      title: 'Correct!',
      message: 'Node 30 was deleted from the end successfully!',
      explanation: 'TAIL was updated to node 20, and node 20 NEXT was set to NULL.',
    };
  }

  // 10. Level 3 Task 3: Delete at Any Position (task.id === 'task-3-3')
  if (task.id === 'task-3-3') {
    const activeNodes = currentNodes.filter((n) => !n.isDeleted);
    const nodeMap = new Map<string, DLLNodeState>();
    for (const n of activeNodes) {
      nodeMap.set(normalizeAddress(n.address), n);
    }

    // Node 30 must be deleted
    if (nodeMap.has('0x1010')) {
      return {
        isValid: false,
        title: 'Node Not Deleted',
        message: 'Not complete yet. Node 30 has not been deleted.',
        explanation: 'Select DELETE NODE from the toolbar and click node 30 to remove it.',
      };
    }

    // Node 20 NEXT must point directly to node 40 (0x1018)
    const node20 = nodeMap.get('0x1008');
    if (node20 && arePointersEqual(node20.next, '0x1010')) {
      return {
        isValid: false,
        title: 'Dangling Pointer',
        message: "Wrong pointer. Node 20's NEXT still points to deleted node 30.",
        explanation: 'Update node 20 NEXT to point directly to node 40 (0x1018).',
      };
    }
    if (!node20 || !arePointersEqual(node20.next, '0x1018')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Wrong pointer. Node 20's NEXT must point forward to node 40 (0x1018).",
        explanation: 'Bypass node 30 by connecting node 20 to node 40.',
      };
    }

    // Node 40 PREV must point directly back to node 20 (0x1008)
    const node40 = nodeMap.get('0x1018');
    if (node40 && arePointersEqual(node40.prev, '0x1010')) {
      return {
        isValid: false,
        title: 'Dangling Pointer',
        message: "Wrong pointer. Node 40's PREV still points to deleted node 30.",
        explanation: 'Update node 40 PREV to point directly back to node 20 (0x1008).',
      };
    }
    if (!node40 || !arePointersEqual(node40.prev, '0x1008')) {
      return {
        isValid: false,
        title: 'Wrong Pointer',
        message: "Wrong pointer. Node 40's PREV must point back to node 20 (0x1008).",
        explanation: 'Bypass node 30 by connecting node 40 back to node 20.',
      };
    }

    // HEAD and TAIL
    if (!currentHead || !arePointersEqual(currentHead, '0x1000')) {
      return {
        isValid: false,
        title: 'Wrong HEAD',
        message: 'HEAD must remain pointing to node 10 (0x1000).',
        explanation: 'Deleting a middle node does not change HEAD.',
      };
    }
    if (!currentTail || !arePointersEqual(currentTail, '0x1018')) {
      return {
        isValid: false,
        title: 'Wrong TAIL',
        message: 'TAIL must remain pointing to node 40 (0x1018).',
        explanation: 'Deleting a middle node does not change TAIL.',
      };
    }

    return {
      isValid: true,
      title: 'Correct!',
      message: 'Node 30 was deleted and neighbors reconnected successfully!',
      explanation: 'Node 20 NEXT points directly to node 40, and node 40 PREV points back to node 20.',
    };
  }

  // General Fallback Validator for any other tasks
  const activeNodes = currentNodes.filter((n) => !n.isDeleted);

  if (activeNodes.length === 0) {
    return {
      isValid: false,
      title: 'Wrong Answer',
      message: 'The DLL is not correct yet.',
      explanation: 'No active nodes exist in memory. Reconnect or allocate the required nodes.',
    };
  }

  // If a specific node was supposed to be deleted, ensure it is not active
  if (task.targetDeleteAddress) {
    const targetStillActive = activeNodes.some((n) =>
      arePointersEqual(n.address, task.targetDeleteAddress)
    );
    if (targetStillActive) {
      return {
        isValid: false,
        title: 'Wrong Answer',
        message: 'The target node has not been deleted.',
        explanation: 'Select DELETE NODE from the toolbar to remove the specified node.',
      };
    }
  }

  // If new node was supposed to be created, ensure it exists in active nodes
  if (task.newNodeAddress || task.newNodeConfig?.address) {
    const expNewAddr = normalizeAddress(task.newNodeAddress || task.newNodeConfig!.address);
    const newPresent = activeNodes.some((n) => arePointersEqual(n.address, expNewAddr));
    if (!newPresent) {
      return {
        isValid: false,
        title: 'Wrong Answer',
        message: 'The required node has not been created.',
        explanation: 'Select CREATE NODE in the toolbar to allocate the required node in memory.',
      };
    }
  }

  // Check expected HEAD and TAIL presence
  const expHead = task.expectedHead
    ? normalizeAddress(task.expectedHead)
    : currentHead
    ? normalizeAddress(currentHead)
    : null;
  const expTail = task.expectedTail
    ? normalizeAddress(task.expectedTail)
    : currentTail
    ? normalizeAddress(currentTail)
    : null;

  if (!expHead || !expTail) {
    return {
      isValid: false,
      title: 'Wrong Answer',
      message: 'HEAD and TAIL pointers must be designated.',
      explanation: 'Use the HEAD and TAIL controls in the toolbar to designate the first and last nodes.',
    };
  }

  if (currentHead && !arePointersEqual(currentHead, expHead)) {
    return {
      isValid: false,
      title: 'Wrong Answer',
      message: 'The HEAD pointer is incorrect.',
      explanation: 'Use the HEAD button in the toolbar to point HEAD to the start of the list.',
    };
  }
  if (currentTail && !arePointersEqual(currentTail, expTail)) {
    return {
      isValid: false,
      title: 'Wrong Answer',
      message: 'The TAIL pointer is incorrect.',
      explanation: 'Use the TAIL button in the toolbar to point TAIL to the end of the list.',
    };
  }

  const headNode = activeNodes.find((n) => arePointersEqual(n.address, expHead));
  const tailNode = activeNodes.find((n) => arePointersEqual(n.address, expTail));

  if (!headNode || !tailNode) {
    return {
      isValid: false,
      title: 'Wrong Answer',
      message: 'HEAD or TAIL refers to a node that does not exist.',
      explanation: 'Verify that HEAD and TAIL point to valid active nodes.',
    };
  }

  if (!isNullPointer(headNode.prev)) {
    return {
      isValid: false,
      title: 'Wrong Answer',
      message: 'The HEAD node PREV pointer must be NULL.',
      explanation: 'Since HEAD is the first node, there is no preceding node; its PREV pointer must be NULL.',
    };
  }
  if (!isNullPointer(tailNode.next)) {
    return {
      isValid: false,
      title: 'Wrong Answer',
      message: 'The TAIL node NEXT pointer must be NULL.',
      explanation: 'Since TAIL is the last node, there is no succeeding node; its NEXT pointer must be NULL.',
    };
  }

  const nodeMap = new Map<string, DLLNodeState>();
  for (const node of activeNodes) {
    nodeMap.set(normalizeAddress(node.address), node);
  }

  // Forward traversal from HEAD to TAIL verifying complete ordering
  let currAddr: string = expHead;
  const forwardOrder: string[] = [];
  const forwardVisited = new Set<string>();

  while (!isNullPointer(currAddr)) {
    if (forwardVisited.has(currAddr)) {
      return {
        isValid: false,
        title: 'Wrong Answer',
        message: 'A circular loop was detected in the forward NEXT pointers.',
        explanation: 'Ensure that the list does not loop back onto itself and ends with a NULL pointer at TAIL.',
      };
    }
    forwardVisited.add(currAddr);
    forwardOrder.push(currAddr);

    const currentNode = nodeMap.get(currAddr);
    if (!currentNode) {
      return {
        isValid: false,
        title: 'Wrong Answer',
        message: 'A node points to an invalid address.',
        explanation: 'Check all NEXT pointers to ensure they point to existing nodes or NULL.',
      };
    }
    currAddr = normalizeAddress(currentNode.next);
  }

  if (
    forwardOrder.length !== activeNodes.length ||
    !arePointersEqual(forwardOrder[forwardOrder.length - 1], expTail)
  ) {
    return {
      isValid: false,
      title: 'Wrong Answer',
      message: 'Forward traversal did not reach all nodes or did not end at TAIL.',
      explanation: 'Verify that every node has a correct NEXT pointer connecting to the next node in the list.',
    };
  }

  // Backward traversal from TAIL to HEAD
  let backAddr: string = expTail;
  const backwardOrder: string[] = [];
  const backwardVisited = new Set<string>();

  while (!isNullPointer(backAddr)) {
    if (backwardVisited.has(backAddr)) {
      return {
        isValid: false,
        title: 'Wrong Answer',
        message: 'A circular loop was detected in the backward PREV pointers.',
        explanation: 'Ensure that the PREV pointers do not form an infinite loop and that HEAD PREV is NULL.',
      };
    }
    backwardVisited.add(backAddr);
    backwardOrder.push(backAddr);

    const currentNode = nodeMap.get(backAddr);
    if (!currentNode) {
      return {
        isValid: false,
        title: 'Wrong Answer',
        message: 'A node PREV pointer refers to an invalid address.',
        explanation: 'Check all PREV pointers to ensure they point to existing predecessors or NULL.',
      };
    }
    backAddr = normalizeAddress(currentNode.prev);
  }

  if (
    backwardOrder.length !== activeNodes.length ||
    !arePointersEqual(backwardOrder[backwardOrder.length - 1], expHead)
  ) {
    return {
      isValid: false,
      title: 'Wrong Answer',
      message: 'Backward traversal did not reach all nodes or did not end at HEAD.',
      explanation: 'Verify that every node has a correct PREV pointer connecting to its predecessor.',
    };
  }

  // Verify that backwardOrder is the exact mirror of forwardOrder
  const reversedForward = [...forwardOrder].reverse();
  for (let i = 0; i < backwardOrder.length; i++) {
    if (!arePointersEqual(backwardOrder[i], reversedForward[i])) {
      return {
        isValid: false,
        title: 'Wrong Answer',
        message: 'The list order is not symmetrical.',
        explanation: 'In a Doubly Linked List, backward traversal must mirror forward traversal exactly.',
      };
    }
  }

  // Verify bidirectional integrity for EVERY active node:
  for (const node of activeNodes) {
    const addr = normalizeAddress(node.address);
    const nextAddr = normalizeAddress(node.next);
    const prevAddr = normalizeAddress(node.prev);

    if (!isNullPointer(nextAddr)) {
      const targetNode = nodeMap.get(nextAddr);
      if (!targetNode || !arePointersEqual(targetNode.prev, addr)) {
        return {
          isValid: false,
          title: 'Wrong Answer',
          message: 'Bidirectional link broken.',
          explanation: 'When node A points to node B with NEXT, node B must point back to node A with PREV.',
        };
      }
    }

    if (!isNullPointer(prevAddr)) {
      const targetNode = nodeMap.get(prevAddr);
      if (!targetNode || !arePointersEqual(targetNode.next, addr)) {
        return {
          isValid: false,
          title: 'Wrong Answer',
          message: 'Bidirectional link broken.',
          explanation: 'When node B points back to node A with PREV, node A must point to node B with NEXT.',
        };
      }
    }
  }

  // Verify specific expected connections if declared on the task
  if (task.expectedConnections && task.expectedConnections.length > 0) {
    for (const expected of task.expectedConnections) {
      const expectedAddr = normalizeAddress(expected.address);
      const node = nodeMap.get(expectedAddr);
      if (!node) {
        return {
          isValid: false,
          title: 'Wrong Answer',
          message: 'A required node is missing.',
          explanation: 'Verify that all necessary nodes are present in the Doubly Linked List.',
        };
      }
      if (
        !arePointersEqual(node.prev, expected.prev) ||
        !arePointersEqual(node.next, expected.next)
      ) {
        return {
          isValid: false,
          title: 'Wrong Answer',
          message: 'The pointer connections are not correct yet.',
          explanation: 'Check PREV and NEXT connections for each node according to the task instruction.',
        };
      }
    }
  }

  return {
    isValid: true,
    title: 'Correct!',
    message: 'The DLL is properly connected.',
    explanation: 'All pointer connections and HEAD/TAIL pointers are valid.',
  };
};

// Helper to determine initial HEAD address from task definition
const getInitialHeadAddress = (t: DLLTask): string | null => {
  const found = t.initialNodes.find((n) => isNullPointer(n.prev));
  if (found) return normalizeAddress(found.address);
  return t.initialNodes[0] ? normalizeAddress(t.initialNodes[0].address) : null;
};

// Helper to determine initial TAIL address from task definition
const getInitialTailAddress = (t: DLLTask): string | null => {
  const found = t.initialNodes.find((n) => isNullPointer(n.next));
  if (found) return normalizeAddress(found.address);
  return t.initialNodes[t.initialNodes.length - 1]
    ? normalizeAddress(t.initialNodes[t.initialNodes.length - 1].address)
    : null;
};

// Helper to auto-generate a non-colliding memory address for new nodes
const getGeneratedAddress = (currentNodes: DLLNodeState[], t: DLLTask): string => {
  if (t.newNodeConfig?.address) {
    const isUsed = currentNodes.some(
      (n) => !n.isDeleted && arePointersEqual(n.address, t.newNodeConfig!.address)
    );
    if (!isUsed) return normalizeAddress(t.newNodeConfig.address);
  }
  let maxHex = 0x1000;
  for (const n of currentNodes) {
    const hex = parseInt(n.address.replace(/^0x/i, ''), 16);
    if (!isNaN(hex) && hex > maxHex) {
      maxHex = hex;
    }
  }
  return `0x${(maxHex + 8).toString(16).toLowerCase()}`;
};

export interface DLLComputedLayout {
  mainChainNodes: DLLNodeState[];
  unconnectedNodes: DLLNodeState[];
}

/**
 * Orders a collection of connected DLL nodes strictly following pointer relationships:
 * HEAD -> NEXT -> NEXT ... until NULL (with cycle protection).
 */
export const orderDLLNodes = (
  nodesToOrder: DLLNodeState[],
  headAddress: string | null
): DLLNodeState[] => {
  if (nodesToOrder.length <= 1) return [...nodesToOrder];

  const nodeMap = new Map<string, DLLNodeState>();
  for (const n of nodesToOrder) {
    nodeMap.set(normalizeAddress(n.address), n);
  }

  // 1. Identify starting node (HEAD):
  // Candidate A: The node explicitly marked by headAddress, IF it has no predecessor in nodesToOrder
  let startNode: DLLNodeState | undefined = undefined;

  if (headAddress) {
    const cand = nodeMap.get(normalizeAddress(headAddress));
    if (cand) {
      const hasPredInSet = nodesToOrder.some(
        (n) => !arePointersEqual(n.address, cand.address) && arePointersEqual(n.next, cand.address)
      );
      if (!hasPredInSet) {
        startNode = cand;
      }
    }
  }

  // Candidate B: A node whose PREV is NULL or points to an address outside nodesToOrder
  if (!startNode) {
    startNode = nodesToOrder.find((n) => {
      if (isNullPointer(n.prev)) return true;
      const hasPred = nodesToOrder.some(
        (other) => !arePointersEqual(other.address, n.address) && arePointersEqual(other.next, n.address)
      );
      return !hasPred;
    });
  }

  // Candidate C: Fallback to any node with no predecessor in nodesToOrder
  if (!startNode) {
    startNode = nodesToOrder.find((n) => {
      return !nodesToOrder.some(
        (other) => !arePointersEqual(other.address, n.address) && arePointersEqual(other.next, n.address)
      );
    });
  }

  // Fallback to first node if circular
  if (!startNode) {
    startNode = nodesToOrder[0];
  }

  // 2. Traverse forward along NEXT pointers
  const result: DLLNodeState[] = [];
  const visited = new Set<string>();
  let curr: DLLNodeState | undefined = startNode;

  while (curr && !visited.has(normalizeAddress(curr.address))) {
    visited.add(normalizeAddress(curr.address));
    result.push(curr);

    let nextNode: DLLNodeState | undefined = undefined;
    if (!isNullPointer(curr.next)) {
      nextNode = nodeMap.get(normalizeAddress(curr.next));
    }
    // If not found via curr.next, check if an unvisited node declares curr as its prev
    if (!nextNode) {
      nextNode = nodesToOrder.find(
        (n) => !visited.has(normalizeAddress(n.address)) && arePointersEqual(n.prev, curr!.address)
      );
    }

    curr = nextNode;
  }

  // 3. Any unvisited nodes in nodesToOrder appended at the end
  for (const n of nodesToOrder) {
    if (!visited.has(normalizeAddress(n.address))) {
      result.push(n);
    }
  }

  return result;
};

/**
 * Calculates which nodes are active in the main DLL sequence and which are allocated but unconnected.
 * A newly created node remains separately displayed until pointer operations form a valid connection into the DLL.
 */
export const computeDLLLayout = (
  allNodes: DLLNodeState[],
  headAddress: string | null,
  tailAddress: string | null,
  task: DLLTask
): DLLComputedLayout => {
  const activeNodes = allNodes.filter((n) => !n.isDeleted);
  if (activeNodes.length === 0) {
    return { mainChainNodes: [], unconnectedNodes: [] };
  }

  // Concept, create_node, or Traversal tasks use direct active sequence
  if (task.taskType === 'concept' || task.taskType === 'create_node' || task.taskType === 'traverse') {
    return { mainChainNodes: activeNodes, unconnectedNodes: [] };
  }

  const createdNodes = activeNodes.filter((n) => n.isNewNode);
  const baseNodes = activeNodes.filter((n) => !n.isNewNode);

  // If there are no newly created nodes, all active nodes are in the main list
  if (createdNodes.length === 0) {
    return {
      mainChainNodes: orderDLLNodes(activeNodes, headAddress),
      unconnectedNodes: [],
    };
  }

  const connectedNodes: DLLNodeState[] = [...baseNodes];
  const unconnectedNodes: DLLNodeState[] = [];

  for (const newNode of createdNodes) {
    const normNewAddr = normalizeAddress(newNode.address);
    const newPrev = normalizeAddress(newNode.prev);
    const newNext = normalizeAddress(newNode.next);

    let isConnected = false;

    // Check relationship rules with existing base nodes:
    for (const base of baseNodes) {
      const bAddr = normalizeAddress(base.address);
      const bNext = normalizeAddress(base.next);
      const bPrev = normalizeAddress(base.prev);

      // Bidirectional connection:
      if (arePointersEqual(bNext, normNewAddr) && arePointersEqual(newPrev, bAddr)) {
        isConnected = true;
        break;
      }
      if (arePointersEqual(bPrev, normNewAddr) && arePointersEqual(newNext, bAddr)) {
        isConnected = true;
        break;
      }
      // Forward pointer from existing node:
      if (arePointersEqual(bNext, normNewAddr)) {
        isConnected = true;
        break;
      }
      // Backward pointer from existing node:
      if (arePointersEqual(bPrev, normNewAddr)) {
        isConnected = true;
        break;
      }
    }

    // Check if newNode is designated HEAD and points forward to an existing node
    if (!isConnected && headAddress && arePointersEqual(headAddress, normNewAddr)) {
      if (!isNullPointer(newNext) && baseNodes.some((b) => arePointersEqual(b.address, newNext))) {
        isConnected = true;
      }
    }

    // Check if newNode is designated TAIL and points backward to an existing node
    if (!isConnected && tailAddress && arePointersEqual(tailAddress, normNewAddr)) {
      if (!isNullPointer(newPrev) && baseNodes.some((b) => arePointersEqual(b.address, newPrev))) {
        isConnected = true;
      }
    }

    if (isConnected) {
      connectedNodes.push(newNode);
    } else {
      unconnectedNodes.push(newNode);
    }
  }

  return {
    mainChainNodes: orderDLLNodes(connectedNodes, headAddress),
    unconnectedNodes,
  };
};

export const DLLInteractiveTaskWorkspace: React.FC<DLLInteractiveTaskWorkspaceProps> = ({
  task,
  isAlreadyCompleted,
  onBackToTasks,
  onTaskSolved,
  onNextTask,
}) => {
  // Local editable state of nodes — single source of truth initialized with normalized addresses
  const [nodes, setNodes] = useState<DLLNodeState[]>(() =>
    task.initialNodes.map((n) => ({
      ...n,
      address: normalizeAddress(n.address),
      prev: normalizeAddress(n.prev),
      next: normalizeAddress(n.next),
    }))
  );

  // Real-time HEAD and TAIL pointers
  const [headAddress, setHeadAddress] = useState<string | null>(() => getInitialHeadAddress(task));
  const [tailAddress, setTailAddress] = useState<string | null>(() => getInitialTailAddress(task));

  // Selection Mode: 'head' | 'tail' | 'delete' | null
  const [selectionMode, setSelectionMode] = useState<'head' | 'tail' | 'delete' | null>(null);

  // Deletion Confirmation Modal State
  const [nodePendingDelete, setNodePendingDelete] = useState<DLLNodeState | null>(null);

  // Create Node Panel / Modal State
  const [isCreateNodeOpen, setIsCreateNodeOpen] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [justUpdatedNode, setJustUpdatedNode] = useState<string | null>(null);

  // Concept task tracking (which fields were explored)
  const [exploredFields, setExploredFields] = useState<{ prev: boolean; data: boolean; next: boolean }>({
    prev: false,
    data: false,
    next: false,
  });
  const [activeConceptField, setActiveConceptField] = useState<'prev' | 'data' | 'next' | null>(null);

  // Level 2 Node Creation Phase state
  const [hasCreatedNode, setHasCreatedNode] = useState<boolean>(() => {
    if (task.taskType !== 'insert' || !task.newNodeConfig) return true;
    return task.initialNodes.some((n) => arePointersEqual(n.address, task.newNodeConfig!.address));
  });
  const [nodeCreationData, setNodeCreationData] = useState<number>(() => {
    return task.newNodeConfig?.data ?? 5;
  });
  const [isJustCreated, setIsJustCreated] = useState<boolean>(false);

  // Traversal task tracking
  const [visitedSequence, setVisitedSequence] = useState<number[]>([]);

  // Progressive wrong-answer attempt count
  const [attemptCount, setAttemptCount] = useState<number>(0);

  // Level 1 Task 2: Interactive Node Builder slots & selected chip
  const [nodeBuilderSlots, setNodeBuilderSlots] = useState<{
    prev: string | null;
    data: string | null;
    next: string | null;
  }>({ prev: null, data: null, next: null });
  const [selectedBuilderChip, setSelectedBuilderChip] = useState<{ id: string; val: string } | null>(null);

  // Level 1 Task 3: Traversal slots & selected chip (dynamically sized to match node count)
  const [traversalSlots, setTraversalSlots] = useState<(number | null)[]>(() =>
    new Array(task.initialNodes.length).fill(null)
  );
  const [selectedTraversalVal, setSelectedTraversalVal] = useState<number | null>(null);

  // Pointer Edit Modal State
  const [editingPointer, setEditingPointer] = useState<{
    nodeAddress: string;
    field: 'prev' | 'next';
    currentValue: string;
  } | null>(null);
  const [inputAddress, setInputAddress] = useState<string>('');
  const [pointerError, setPointerError] = useState<string | null>(null);

  // Feedback State
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackTitle, setFeedbackTitle] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackExplanation, setFeedbackExplanation] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Guided Solve State
  const [guidedState, setGuidedState] = useState<{
    isActive: boolean;
    currentStep: number;
    totalSteps: number;
    taskId: string;
    isFinished: boolean;
  }>({
    isActive: false,
    currentStep: 0,
    totalSteps: task.guidedSteps?.length || 0,
    taskId: task.id,
    isFinished: false,
  });

  // Guided Solve Persistent Step History
  const [guidedHistory, setGuidedHistory] = useState<GuidedStepHistoryItem[]>([]);
  const guidedHistoryEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll toward the newest step whenever a new guided step is appended
  useEffect(() => {
    if (guidedState.isActive && guidedHistory.length > 0) {
      guidedHistoryEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [guidedHistory.length, guidedState.isActive]);

  // Brief highlight for the affected pointer during guided step execution
  const [highlightedPointer, setHighlightedPointer] = useState<{
    nodeAddress: string;
    field: 'prev' | 'next';
  } | null>(null);

  // Reset when task changes
  useEffect(() => {
    handleReset();
  }, [task.id]);

  // Clear pointer highlight after brief animation
  useEffect(() => {
    if (highlightedPointer) {
      const timer = setTimeout(() => {
        setHighlightedPointer(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [highlightedPointer]);

  const handleReset = () => {
    setNodes(
      task.initialNodes.map((n) => ({
        ...n,
        address: normalizeAddress(n.address),
        prev: normalizeAddress(n.prev),
        next: normalizeAddress(n.next),
      }))
    );
    setHeadAddress(getInitialHeadAddress(task));
    setTailAddress(getInitialTailAddress(task));
    setSelectionMode(null);
    setNodePendingDelete(null);
    setIsCreateNodeOpen(false);
    setStatusNotice(null);
    setJustUpdatedNode(null);
    setHasCreatedNode(
      task.taskType !== 'insert' || !task.newNodeConfig
        ? true
        : task.initialNodes.some((n) => arePointersEqual(n.address, task.newNodeConfig!.address))
    );
    setNodeCreationData(task.newNodeConfig?.data ?? 5);
    setIsJustCreated(false);
    setExploredFields({ prev: false, data: false, next: false });
    setActiveConceptField(null);
    setVisitedSequence([]);
    setAttemptCount(0);
    setNodeBuilderSlots({ prev: null, data: null, next: null });
    setSelectedBuilderChip(null);
    setTraversalSlots([null, null, null, null]);
    setSelectedTraversalVal(null);
    setEditingPointer(null);
    setInputAddress('');
    setPointerError(null);
    setValidationStatus('idle');
    setFeedbackTitle(null);
    setFeedbackMessage(null);
    setFeedbackExplanation(null);
    setShowHint(false);
    setHighlightedPointer(null);
    setGuidedHistory([]);
    setGuidedState({
      isActive: false,
      currentStep: 0,
      totalSteps: task.guidedSteps?.length || 0,
      taskId: task.id,
      isFinished: false,
    });
  };

  // Helper to allocate new node in memory with PREV = NULL, NEXT = NULL (not automatically inserted into DLL chain)
  const instantiateNewNode = (customData?: number) => {
    const address = task.newNodeConfig
      ? normalizeAddress(task.newNodeConfig.address)
      : getGeneratedAddress(nodes, task);
    const dataVal = customData !== undefined ? customData : nodeCreationData;
    const newNode: DLLNodeState = {
      address,
      data: dataVal,
      prev: 'NULL',
      next: 'NULL',
      isNewNode: true,
    };

    setNodes((prev) => {
      const filtered = prev.filter((n) => !arePointersEqual(n.address, address));
      return [...filtered, newNode];
    });
    setHasCreatedNode(true);
    return address;
  };

  // Confirm creation from the Create New Node panel
  const handleConfirmCreateNode = () => {
    soundManager.playClick();
    const createdAddress = instantiateNewNode(nodeCreationData);
    setIsCreateNodeOpen(false);
    setIsJustCreated(true);
    setJustUpdatedNode(createdAddress);
    setTimeout(() => {
      setIsJustCreated(false);
      setJustUpdatedNode(null);
    }, 1400);
    setStatusNotice('Node allocated in memory. Update PREV and NEXT pointers to connect it into the DLL.');
    setValidationStatus('idle');
    setFeedbackTitle(null);
    setFeedbackMessage(null);
    setFeedbackExplanation(null);
  };

  // Student designates HEAD
  const handleSelectNodeForHead = (address: string) => {
    soundManager.playClick();
    const normalized = normalizeAddress(address);
    setHeadAddress(normalized);
    setSelectionMode(null);
    setJustUpdatedNode(normalized);
    setTimeout(() => setJustUpdatedNode(null), 1400);
    setStatusNotice(`HEAD pointer set to ${normalized}.`);
    setValidationStatus('idle');
    setFeedbackTitle(null);
    setFeedbackMessage(null);
    setFeedbackExplanation(null);
  };

  // Student designates TAIL
  const handleSelectNodeForTail = (address: string) => {
    soundManager.playClick();
    const normalized = normalizeAddress(address);
    setTailAddress(normalized);
    setSelectionMode(null);
    setJustUpdatedNode(normalized);
    setTimeout(() => setJustUpdatedNode(null), 1400);
    setStatusNotice(`TAIL pointer set to ${normalized}.`);
    setValidationStatus('idle');
    setFeedbackTitle(null);
    setFeedbackMessage(null);
    setFeedbackExplanation(null);
  };

  // Student clicks node to delete (opens confirmation modal)
  const handleSelectNodeForDelete = (node: DLLNodeState) => {
    soundManager.playClick();
    setNodePendingDelete(node);
  };

  // Student confirms deletion in modal
  const handleConfirmDeleteNode = () => {
    if (!nodePendingDelete) return;
    const targetAddress = normalizeAddress(nodePendingDelete.address);
    soundManager.playClick();

    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        arePointersEqual(n.address, targetAddress) ? { ...n, isDeleted: true } : n
      )
    );

    if (headAddress && arePointersEqual(headAddress, targetAddress)) {
      setHeadAddress(null);
    }
    if (tailAddress && arePointersEqual(tailAddress, targetAddress)) {
      setTailAddress(null);
    }

    setNodePendingDelete(null);
    setSelectionMode(null);
    setValidationStatus('idle');
    setFeedbackTitle(null);
    setFeedbackMessage(null);
    setFeedbackExplanation(null);
    setStatusNotice(
      `Node [${nodePendingDelete.data}] at ${nodePendingDelete.address} deleted. Reconnect remaining pointers and update HEAD/TAIL if needed.`
    );
  };

  // Create Node Action (Level 2 Phase 1)
  const handleCreateNode = () => {
    if (!task.newNodeConfig) return;
    soundManager.playClick();
    instantiateNewNode(nodeCreationData);
    setIsJustCreated(true);
    setTimeout(() => setIsJustCreated(false), 1400);
    setValidationStatus('idle');
    setFeedbackTitle(null);
    setFeedbackMessage(null);
    setFeedbackExplanation(null);
  };

  // Start Guided Solve Mode
  const handleStartGuidedSolve = () => {
    soundManager.playClick();
    // In Level 2 insert tasks, ensure the node is allocated in memory so guided steps can connect it
    if (task.taskType === 'insert' && task.newNodeConfig && !hasCreatedNode) {
      instantiateNewNode(task.newNodeConfig.data);
    }
    const total = task.guidedSteps?.length || 0;
    setGuidedHistory([]);
    setGuidedState({
      isActive: true,
      currentStep: 0,
      totalSteps: total,
      taskId: task.id,
      isFinished: false,
    });
    setShowHint(false);
    setValidationStatus('idle');
    setFeedbackMessage(null);
  };

  // Stop Guided Solve Mode
  const handleStopGuidedSolve = () => {
    soundManager.playClick();
    setGuidedHistory([]);
    setGuidedState({
      isActive: false,
      currentStep: 0,
      totalSteps: task.guidedSteps?.length || 0,
      taskId: task.id,
      isFinished: false,
    });
    setHighlightedPointer(null);
  };

  // Execute Next Step in Guided Solve Mode (uses exact same state as student edits)
  const handleNextGuidedStep = () => {
    if (!task.guidedSteps || task.guidedSteps.length === 0) return;

    const nextStepIndex = guidedState.currentStep; // 0-indexed for array
    if (nextStepIndex >= task.guidedSteps.length) return;

    const stepObj = task.guidedSteps[nextStepIndex];
    const newStepNumber = nextStepIndex + 1;

    soundManager.playClick();

    // Modify the REAL internal DLL data model according to the step
    if (stepObj.action.type === 'head' && stepObj.action.newHead) {
      const targetHead = normalizeAddress(stepObj.action.newHead);
      setHeadAddress(targetHead);
      setJustUpdatedNode(targetHead);
      setTimeout(() => setJustUpdatedNode(null), 1400);
      setHighlightedPointer(null);
    } else if (stepObj.action.type === 'tail' && stepObj.action.newTail) {
      const targetTail = normalizeAddress(stepObj.action.newTail);
      setTailAddress(targetTail);
      setJustUpdatedNode(targetTail);
      setTimeout(() => setJustUpdatedNode(null), 1400);
      setHighlightedPointer(null);
    } else if (stepObj.action.type === 'pointer') {
      const { nodeAddress, field, targetValue } = stepObj.action;
      if (nodeAddress && field && targetValue !== undefined) {
        const normalizedTarget = normalizeAddress(targetValue);
        setNodes((prevNodes) =>
          prevNodes.map((n) =>
            arePointersEqual(n.address, nodeAddress)
              ? { ...n, [field]: normalizedTarget }
              : n
          )
        );
        // Highlight the affected pointer briefly
        setHighlightedPointer({ nodeAddress: normalizeAddress(nodeAddress), field });
      }
    } else if (stepObj.action.type === 'delete') {
      const { nodeAddress } = stepObj.action;
      if (nodeAddress) {
        const delAddr = normalizeAddress(nodeAddress);
        setNodes((prevNodes) =>
          prevNodes.map((n) =>
            arePointersEqual(n.address, delAddr) ? { ...n, isDeleted: true } : n
          )
        );
        if (headAddress && arePointersEqual(headAddress, delAddr)) {
          setHeadAddress(null);
        }
        if (tailAddress && arePointersEqual(tailAddress, delAddr)) {
          setTailAddress(null);
        }
        setHighlightedPointer(null);
      }
    } else if (stepObj.action.type === 'concept') {
      const { conceptField } = stepObj.action;
      if (conceptField) {
        setActiveConceptField(conceptField);
        setExploredFields((prev) => ({ ...prev, [conceptField]: true }));
        if (task.taskType === 'create_node') {
          if (conceptField === 'prev') {
            setNodeBuilderSlots((p) => ({ ...p, prev: 'NULL' }));
          } else if (conceptField === 'data') {
            setNodeBuilderSlots((p) => ({ ...p, data: '25' }));
          } else if (conceptField === 'next') {
            setNodeBuilderSlots((p) => ({ ...p, next: 'NULL' }));
          }
        }
      }
    } else if (stepObj.action.type === 'traverse') {
      const { traverseData } = stepObj.action;
      if (traverseData !== undefined) {
        setVisitedSequence((prev) =>
          prev.includes(traverseData) ? prev : [...prev, traverseData]
        );
        setTraversalSlots((prev) => {
          const nextSlots = [...prev];
          const emptyIdx = nextSlots.findIndex((s) => s === null);
          if (emptyIdx !== -1) {
            nextSlots[emptyIdx] = traverseData;
          }
          return nextSlots;
        });
      }
    }

    const isComplete = newStepNumber === task.guidedSteps.length;

    // Append executed step to persistent chronological history
    setGuidedHistory((prev) => {
      if (prev.some((s) => s.stepNumber === newStepNumber)) {
        return prev;
      }
      return [
        ...prev,
        {
          stepNumber: newStepNumber,
          operationText: stepObj.operationText || (typeof stepObj.action.type === 'string' ? `Perform ${stepObj.action.type} update` : undefined),
          explanation: stepObj.explanation,
        },
      ];
    });

    setGuidedState((prev) => ({
      ...prev,
      currentStep: newStepNumber,
      isFinished: isComplete,
    }));
  };

  // Open Pointer Edit Panel
  const handleOpenEditPointer = (nodeAddress: string, field: 'prev' | 'next', currentValue: string) => {
    soundManager.playClick();
    setEditingPointer({ nodeAddress, field, currentValue });
    setInputAddress(isNullPointer(currentValue) ? '' : currentValue);
    setPointerError(null);
  };

  // Submit Pointer Update with strict node address verification & state update
  const handleUpdatePointer = () => {
    if (!editingPointer) return;

    const raw = inputAddress.trim();
    if (!raw) {
      setPointerError('Please enter a pointer address or NULL.');
      return;
    }

    if (!isValidPointerAddress(raw)) {
      setPointerError('That address does not belong to a node in this task.');
      return;
    }

    const normalized = normalizeAddress(raw);

    // Validate that address belongs to a node in this task or is NULL
    const validAddresses = [
      'NULL',
      ...nodes
        .filter((n) => !n.isDeleted)
        .map((n) => normalizeAddress(n.address)),
    ];
    if (!validAddresses.includes(normalized)) {
      setPointerError('That address does not belong to a node in this task.');
      return;
    }

    soundManager.playClick();

    // Update actual internal node state; preserve all other nodes and relationships
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (arePointersEqual(n.address, editingPointer.nodeAddress)) {
          return {
            ...n,
            [editingPointer.field]: normalized,
          };
        }
        return n;
      })
    );

    setEditingPointer(null);
    setInputAddress('');
    setPointerError(null);
    setValidationStatus('idle');
    setFeedbackTitle(null);
    setFeedbackMessage(null);
    setFeedbackExplanation(null);
  };

  // Delete node action (Level 3 tasks)
  const handleDeleteNode = (address: string) => {
    soundManager.playClick();
    const target = nodes.find((n) => arePointersEqual(n.address, address));
    if (target) {
      setNodePendingDelete(target);
    }
  };

  // Concept task field click (Level 1 Task 1)
  const handleConceptFieldClick = (field: 'prev' | 'data' | 'next') => {
    soundManager.playClick();
    setActiveConceptField(field);
    setExploredFields((prev) => ({ ...prev, [field]: true }));
  };

  // Traversal task node click (Level 1 Task 3)
  const handleTraversalNodeClick = (nodeData: number) => {
    soundManager.playClick();
    setVisitedSequence((prev) => {
      if (prev.includes(nodeData)) return prev;
      return [...prev, nodeData];
    });
  };

  const getWrongAnswerHint = (t: DLLTask, attempt: number): string => {
    if (t.taskType === 'create_node') {
      if (attempt <= 1) {
        return 'Check what DATA value is requested, and what PREV and NEXT represent when a new node is unlinked.';
      }
      return 'Create a new DLL node with DATA = 5. When first created, neither pointer connects anywhere, so both PREV and NEXT must be NULL.';
    }

    if (t.taskType === 'build') {
      if (attempt <= 1) {
        return 'Check both PREV and NEXT connections between adjacent nodes, and verify HEAD and TAIL.';
      }
      return 'Node 10 NEXT should point to 20; node 20 PREV should point to 10 and NEXT to 30; node 30 PREV should point to 20. HEAD is 10 and TAIL is 30.';
    }

    if (t.taskType === 'traverse') {
      if (attempt <= 1) {
        return 'Start at HEAD and follow the NEXT pointer to find each subsequent node in order.';
      }
      return 'Start at HEAD (node 10 at 0x1000). Follow its NEXT pointer: 10 -> 20 -> 30.';
    }

    if (t.taskType === 'insert') {
      if (attempt <= 1) {
        return 'Check the bidirectional connections between the new node and its neighbors.';
      }
      return 'Remember bidirectional links: if node A NEXT points to B, then B PREV must point back to A. Check HEAD/TAIL if inserting at the boundary.';
    }

    if (t.taskType === 'delete') {
      if (attempt <= 1) {
        return 'After deleting the node, check whether the remaining nodes are reconnected in both directions.';
      }
      return 'Ensure the remaining nodes bypass the deleted node, and verify if HEAD or TAIL pointer must be updated.';
    }

    // Concept task
    if (attempt <= 1) {
      return 'Click each field (PREV, DATA, NEXT) of the node to inspect what it does.';
    }
    return 'A DLL node requires all three components: PREV, DATA, and NEXT. Explore all three to complete the task.';
  };

  // Validate Task Answer against complete internal DLL model
  const handleCheckAnswer = () => {
    soundManager.playClick();

    // If node creation is required and the student has not created the node yet
    if (task.taskType === 'insert' && task.newNodeConfig && !hasCreatedNode) {
      setAttemptCount((prev) => prev + 1);
      setValidationStatus('error');
      setFeedbackTitle('Missing Node');
      setFeedbackMessage('The DLL is not correct yet. Please create and connect the new node.');
      setFeedbackExplanation('You need to allocate the new node first using CREATE NODE, then update pointers to integrate it.');
      soundManager.playCollision();
      return;
    }

    if (task.taskType === 'create_node' && nodes.filter((n) => !n.isDeleted).length === 0) {
      setAttemptCount((prev) => prev + 1);
      setValidationStatus('error');
      setFeedbackTitle('No Node Created');
      setFeedbackMessage('You have not created the node yet.');
      setFeedbackExplanation('Click CREATE NODE in the toolbar above to initialize your new node with DATA = 5.');
      soundManager.playCollision();
      return;
    }

    const result = validateDLLState(
      task,
      nodes,
      exploredFields,
      visitedSequence,
      headAddress,
      tailAddress,
      nodeBuilderSlots,
      traversalSlots
    );

    if (result.isValid) {
      setValidationStatus('success');
      setFeedbackTitle(result.title || 'Correct!');
      setFeedbackMessage(result.message);
      setFeedbackExplanation(result.explanation || null);
      soundManager.playSuccess();
      onTaskSolved(task.id, task.xp);
    } else {
      setAttemptCount((prev) => prev + 1);
      setValidationStatus('error');
      setFeedbackTitle(result.title || 'Wrong Answer');
      setFeedbackMessage(result.message);
      setFeedbackExplanation(result.explanation || null);
      soundManager.playCollision();
    }
  };

  // Quick address helper pills for the modal
  const availableAddresses = ['NULL', ...nodes.filter((n) => !n.isDeleted).map((n) => n.address)];

  // Active (non-deleted) nodes
  const activeNodes = useMemo(() => nodes.filter((n) => !n.isDeleted), [nodes]);

  // Dynamic layout calculation: separates connected nodes (ordered by pointer relationships)
  // from newly allocated, unconnected nodes
  const { mainChainNodes, unconnectedNodes } = useMemo(
    () => computeDLLLayout(nodes, headAddress, tailAddress, task),
    [nodes, headAddress, tailAddress, task]
  );

  // Render an individual DLL Node Card
  const renderNodeCard = (node: DLLNodeState, isUnconnected: boolean = false) => {
    const isHead = arePointersEqual(node.address, headAddress);
    const isTail = arePointersEqual(node.address, tailAddress);
    const isJustUpdated = justUpdatedNode && arePointersEqual(node.address, justUpdatedNode);
    const isEditingPrev = editingPointer?.nodeAddress === node.address && editingPointer?.field === 'prev';
    const isEditingNext = editingPointer?.nodeAddress === node.address && editingPointer?.field === 'next';
    const isHighlightedPrev = highlightedPointer?.nodeAddress === node.address && highlightedPointer?.field === 'prev';
    const isHighlightedNext = highlightedPointer?.nodeAddress === node.address && highlightedPointer?.field === 'next';

    const handleCardClick = () => {
      if (selectionMode === 'head') {
        handleSelectNodeForHead(node.address);
      } else if (selectionMode === 'tail') {
        handleSelectNodeForTail(node.address);
      } else if (selectionMode === 'delete') {
        handleSelectNodeForDelete(node);
      }
    };

    return (
      <div
        key={node.address}
        id={`node-${node.address}`}
        onClick={selectionMode ? handleCardClick : undefined}
        className={`relative flex flex-col rounded-xl border-2 p-3 sm:p-3.5 min-w-[135px] sm:min-w-[150px] transition-all duration-200 ${
          selectionMode === 'head'
            ? 'ring-2 ring-blue-500 hover:ring-4 hover:scale-102 cursor-pointer bg-blue-50/70 dark:bg-blue-950/50 border-blue-500 shadow-md'
            : selectionMode === 'tail'
            ? 'ring-2 ring-purple-500 hover:ring-4 hover:scale-102 cursor-pointer bg-purple-50/70 dark:bg-purple-950/50 border-purple-500 shadow-md'
            : selectionMode === 'delete'
            ? 'ring-2 ring-rose-500 hover:ring-4 hover:scale-102 cursor-pointer bg-rose-50/70 dark:bg-rose-950/50 border-rose-500 shadow-md'
            : isJustUpdated
            ? 'ring-2 ring-amber-400 scale-102 border-amber-400 shadow-md'
            : isUnconnected
            ? `border-amber-400 dark:border-amber-600 bg-white dark:bg-[#111827] ${
                isJustCreated ? 'scale-105 ring-2 ring-amber-400/70 shadow-md' : 'shadow-sm'
              }`
            : isHead && isTail
            ? 'border-2 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-[#111827] shadow-sm'
            : isHead
            ? 'border-2 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-[#111827] shadow-sm'
            : isTail
            ? 'border-2 border-purple-500 dark:border-purple-500 ring-2 ring-purple-500/20 bg-white dark:bg-[#111827] shadow-sm'
            : 'border-slate-300/90 dark:border-slate-700 bg-white dark:bg-[#111827] hover:border-blue-400 dark:hover:border-blue-700 shadow-xs'
        }`}
      >
        {/* Top: Address & Badges */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono">
          <span
            className={`font-extrabold ${
              isUnconnected
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-[#2563EB] dark:text-blue-400'
            }`}
          >
            {node.address}
          </span>
          <div className="flex items-center gap-1">
            {isHead && (
              <span className="text-[9px] font-bold text-white bg-[#2563EB] px-1.5 py-0.5 rounded shadow-xs tracking-wider">
                HEAD
              </span>
            )}
            {isTail && (
              <span className="text-[9px] font-bold text-white bg-purple-600 px-1.5 py-0.5 rounded shadow-xs tracking-wider">
                TAIL
              </span>
            )}
            {isUnconnected ? (
              <span className="text-[9px] font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 px-1.5 py-0.5 rounded tracking-wider">
                NEW
              </span>
            ) : node.isNewNode ? (
              <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded tracking-wider">
                NEW
              </span>
            ) : null}
          </div>
        </div>

        {/* Data Value */}
        <div className="py-2.5 text-center">
          <span className="text-base sm:text-lg font-mono font-extrabold text-slate-900 dark:text-white">
            {node.data}
          </span>
        </div>

        {/* Bottom: PREV and NEXT Pointer Buttons (Level 5 Controls) */}
        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-[10px]">
          {/* PREV button */}
          <button
            type="button"
            disabled={selectionMode !== null}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditPointer(node.address, 'prev', node.prev);
            }}
            className={`flex flex-col items-center p-1.5 rounded-lg border transition-all ${
              selectionMode !== null ? 'opacity-70 cursor-pointer' : 'cursor-pointer'
            } ${
              isEditingPrev || isHighlightedPrev
                ? 'ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900/60 border-blue-500 text-blue-950 dark:text-blue-100 font-extrabold shadow-sm'
                : isUnconnected
                ? 'bg-amber-50/80 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border-amber-200/90 dark:border-amber-800/60 text-slate-800 dark:text-slate-200'
                : 'bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/50 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Click to edit PREV pointer address"
          >
            <span className="text-[9px] text-slate-400 uppercase font-bold">PREV</span>
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[55px]">
              {node.prev}
            </span>
          </button>

          {/* NEXT button */}
          <button
            type="button"
            disabled={selectionMode !== null}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditPointer(node.address, 'next', node.next);
            }}
            className={`flex flex-col items-center p-1.5 rounded-lg border transition-all ${
              selectionMode !== null ? 'opacity-70 cursor-pointer' : 'cursor-pointer'
            } ${
              isEditingNext || isHighlightedNext
                ? 'ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900/60 border-blue-500 text-blue-950 dark:text-blue-100 font-extrabold shadow-sm'
                : isUnconnected
                ? 'bg-amber-50/80 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border-amber-200/90 dark:border-amber-800/60 text-slate-800 dark:text-slate-200'
                : 'bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/50 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Click to edit NEXT pointer address"
          >
            <span className="text-[9px] text-slate-400 uppercase font-bold">NEXT</span>
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[55px]">
              {node.next}
            </span>
          </button>
        </div>
      </div>
    );
  };

  // Control visibility strictly based on task requirements:
  // - Task 1 (create_node): Standalone node construction. Hide HEAD, TAIL, CREATE NODE.
  // - Task 3 (traverse): Interactive sequence. Hide HEAD, TAIL.
  // - Concept tasks: Hide HEAD, TAIL.
  const isCreateNodeTask = task.taskType === 'create_node' || task.id === 'task-1-1';
  const isTraverseTask = task.taskType === 'traverse' || task.id === 'task-1-3';
  const isConceptTask = task.taskType === 'concept';

  const showHeadControl = !isCreateNodeTask && !isTraverseTask && !isConceptTask;
  const showTailControl = !isCreateNodeTask && !isTraverseTask && !isConceptTask;
  const showCreateControl = task.taskType === 'insert';
  const showDeleteControl = task.taskType === 'delete';
  const hasAnyToolbarControl = showHeadControl || showTailControl || showCreateControl || showDeleteControl;

  return (
    <div
      id="dll-task-workspace"
      className={`w-full ${
        guidedState.isActive ? 'max-w-7xl' : 'max-w-5xl'
      } mx-auto flex flex-col gap-6 font-sans select-text transition-all duration-200`}
    >
      {/* Two-Column Responsive Container: Left 70%, Right 30% on desktop */}
      <div
        className={`w-full flex flex-col ${
          guidedState.isActive ? 'lg:flex-row items-start gap-6' : 'gap-6'
        }`}
      >
        {/* =========================================================================
            LEFT COLUMN (~70% on desktop when Guided Solve active, 100% when inactive)
            Content: Task Title, Instruction, DLL Workspace, Nodes, Connections, Controls
            ========================================================================= */}
        <div
          className={`w-full flex flex-col gap-6 min-w-0 ${
            guidedState.isActive ? 'lg:w-[70%]' : ''
          }`}
        >
          {/* TOP AREA: BACK BUTTON, TASK TITLE & SINGLE CLEAR INSTRUCTION CARD */}
          <div className="flex flex-col gap-4 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBackToTasks}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  Task {task.taskNumber}
                </span>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>{task.xp} XP</span>
                </span>
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {task.title}
              </h1>
            </div>

            {/* Single Clear Instruction Box */}
            <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-900/50 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                  Instruction
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  {task.instruction}
                </p>
              </div>
            </div>
          </div>

          {/* =========================================================================
              PART 1: INTERACTIVE CONTROLS CARD
              Conditionally rendered based on current task requirements.
              Hidden completely on Level 1 tasks (no empty toolbar!).
              ========================================================================= */}
          {hasAnyToolbarControl && (
            <div
              id="interactive-controls-card"
              className="w-full bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col gap-3"
            >
              {/* Header: Title & Subtitle */}
              <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                  <h2 className="text-xs font-mono font-extrabold tracking-wider text-slate-700 dark:text-slate-300 uppercase">
                    Interactive Controls
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                  Task-specific pointer assignment &amp; node management
                </span>
              </div>

              {/* Controls Horizontal Row - Only displays buttons relevant to the task */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {/* 1. HEAD Button - Only shown when relevant */}
                {showHeadControl && (
                  <button
                    type="button"
                    id="toolbar-head-button"
                    onClick={() => {
                      soundManager.playClick();
                      setSelectionMode((prev) => (prev === 'head' ? null : 'head'));
                    }}
                    className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                      selectionMode === 'head'
                        ? 'bg-[#2563EB] text-white ring-2 ring-blue-400 shadow-sm'
                        : 'bg-blue-50/90 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                    }`}
                    title="Choose which node should be HEAD"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectionMode === 'head' ? 'bg-white' : 'bg-[#2563EB]'
                      }`}
                    />
                    <span>HEAD</span>
                    <span className="text-[10px] font-semibold opacity-85">
                      ({headAddress ? headAddress : 'NULL'})
                    </span>
                  </button>
                )}

                {/* 2. TAIL Button - Only shown when relevant */}
                {showTailControl && (
                  <button
                    type="button"
                    id="toolbar-tail-button"
                    onClick={() => {
                      soundManager.playClick();
                      setSelectionMode((prev) => (prev === 'tail' ? null : 'tail'));
                    }}
                    className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                      selectionMode === 'tail'
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400 shadow-sm'
                        : 'bg-purple-50/90 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60'
                    }`}
                    title="Choose which node should be TAIL"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectionMode === 'tail' ? 'bg-white' : 'bg-purple-600'
                      }`}
                    />
                    <span>TAIL</span>
                    <span className="text-[10px] font-semibold opacity-85">
                      ({tailAddress ? tailAddress : 'NULL'})
                    </span>
                  </button>
                )}

                {/* 3. CREATE NODE Button - Only shown on Level 2 */}
                {showCreateControl && (
                  <button
                    type="button"
                    id="toolbar-create-node-button"
                    onClick={() => {
                      soundManager.playClick();
                      setSelectionMode(null);
                      setIsCreateNodeOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl font-mono text-xs font-bold bg-emerald-50/90 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Allocate a new node in memory"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>CREATE NODE</span>
                  </button>
                )}

                {/* 4. DELETE NODE Button - Only shown on Level 3 */}
                {showDeleteControl && (
                  <button
                    type="button"
                    id="toolbar-delete-node-button"
                    onClick={() => {
                      soundManager.playClick();
                      setSelectionMode((prev) => (prev === 'delete' ? null : 'delete'));
                    }}
                    className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      selectionMode === 'delete'
                        ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-sm'
                        : 'bg-rose-50/90 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                    }`}
                    title="Select a node in the DLL to delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>DELETE NODE</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Interactive Selection Mode Notice */}
          {selectionMode && (
            <div
              id="selection-mode-banner"
              className={`w-full p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium border shadow-xs animate-fade-in ${
                selectionMode === 'head'
                  ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                  : selectionMode === 'tail'
                  ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                  : 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">
                  {selectionMode === 'head' && 'Select HEAD Node:'}
                  {selectionMode === 'tail' && 'Select TAIL Node:'}
                  {selectionMode === 'delete' && 'Select Node to Delete:'}
                </span>
                <span>
                  {selectionMode === 'head' && 'Click any node below to designate it as HEAD.'}
                  {selectionMode === 'tail' && 'Click any node below to designate it as TAIL.'}
                  {selectionMode === 'delete' && 'Click any node below you wish to delete.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectionMode(null)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shrink-0"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Status Notice (e.g. Node created, or action feedback) */}
          {statusNotice && !selectionMode && (
            <div
              id="status-notice-banner"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300 animate-fade-in font-medium"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{statusNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusNotice(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* =========================================================================
              PART 2: DLL MEMORY CANVAS
              Dedicated Level 3 workspace with cool-tinted light surface in bright mode.
              Provides strong visual separation, depth, and structured game-like aesthetics.
              ========================================================================= */}
          <div
            id="dll-memory-canvas-section"
            className="relative min-h-[320px] sm:min-h-[380px] bg-slate-100/70 dark:bg-[#0c1220] rounded-2xl border-2 border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-7 shadow-xs flex flex-col justify-start items-stretch"
          >
            {/* Dedicated Canvas Header */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-3 border-b border-slate-200/80 dark:border-slate-800/90">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                <h3 className="text-xs font-mono font-extrabold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
                  DOUBLY LINKED LIST MEMORY CANVAS
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#2563EB] dark:text-blue-400 font-bold shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  HEAD: {headAddress ?? 'NULL'}
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-purple-700 dark:text-purple-400 font-bold shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                  TAIL: {tailAddress ?? 'NULL'}
                </span>
              </div>
            </div>

            {/* Scrollable Canvas Body: Ensures horizontal scrolling on mobile and smaller screens */}
            <div className="w-full overflow-x-auto pb-2 flex flex-col items-center justify-center flex-1">
        {/* 1. LEVEL 1 TASK 1: Understand a DLL Node */}
        {task.taskType === 'concept' ? (
          <div className="w-full max-w-xl flex flex-col items-center gap-6 py-4">
            <div className="text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400 font-medium">
              Click each component of the node to inspect its function:
            </div>

            {/* Single Large Interactive DLL Node */}
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 p-4 shadow-sm">
              {/* Address Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">Node Address</span>
                <span className="font-bold text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/40">
                  0x1000
                </span>
              </div>

              {/* Node 3-Part Layout: PREV | DATA | NEXT */}
              <div className="grid grid-cols-3 gap-2 pt-4">
                {/* PREV Field */}
                <button
                  type="button"
                  onClick={() => handleConceptFieldClick('prev')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    activeConceptField === 'prev'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : exploredFields.prev
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 border-blue-300 dark:border-blue-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-80">
                    PREV
                  </span>
                  <span className="text-xs font-mono font-extrabold mt-1">
                    ← Pointer
                  </span>
                  {exploredFields.prev && (
                    <span className="text-[9px] font-mono mt-1 opacity-90">✓ Explored</span>
                  )}
                </button>

                {/* DATA Field */}
                <button
                  type="button"
                  onClick={() => handleConceptFieldClick('data')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    activeConceptField === 'data'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : exploredFields.data
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 border-blue-300 dark:border-blue-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-80">
                    DATA
                  </span>
                  <span className="text-sm font-mono font-extrabold mt-1">
                    42
                  </span>
                  {exploredFields.data && (
                    <span className="text-[9px] font-mono mt-1 opacity-90">✓ Explored</span>
                  )}
                </button>

                {/* NEXT Field */}
                <button
                  type="button"
                  onClick={() => handleConceptFieldClick('next')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    activeConceptField === 'next'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : exploredFields.next
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 border-blue-300 dark:border-blue-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-80">
                    NEXT
                  </span>
                  <span className="text-xs font-mono font-extrabold mt-1">
                    Pointer →
                  </span>
                  {exploredFields.next && (
                    <span className="text-[9px] font-mono mt-1 opacity-90">✓ Explored</span>
                  )}
                </button>
              </div>
            </div>

            {/* Explanation of the clicked field */}
            <div className="w-full max-w-md min-h-[70px] p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 shadow-xs">
              {activeConceptField === 'prev' && (
                <div>
                  <strong className="text-[#2563EB] dark:text-blue-400 font-bold block mb-1">
                    PREV Pointer:
                  </strong>
                  Stores the memory address of the previous node in the sequence. For the HEAD node, this holds{' '}
                  <code className="font-mono font-bold bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded">NULL</code>.
                </div>
              )}
              {activeConceptField === 'data' && (
                <div>
                  <strong className="text-[#2563EB] dark:text-blue-400 font-bold block mb-1">
                    DATA Field:
                  </strong>
                  Stores the actual integer value or payload stored inside this memory block (here: 42).
                </div>
              )}
              {activeConceptField === 'next' && (
                <div>
                  <strong className="text-[#2563EB] dark:text-blue-400 font-bold block mb-1">
                    NEXT Pointer:
                  </strong>
                  Stores the memory address of the subsequent node in the sequence. For the TAIL node, this holds{' '}
                  <code className="font-mono font-bold bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded">NULL</code>.
                </div>
              )}
              {!activeConceptField && (
                <div className="text-slate-500 dark:text-slate-400 italic">
                  Select PREV, DATA, or NEXT on the node card above to inspect how each field works.
                </div>
              )}
            </div>
          </div>
        ) : task.taskType === 'create_node' ? (
          /* 2. LEVEL 1 TASK 1: Standalone Node Construction */
          <div className="w-full max-w-xl flex flex-col items-center gap-6 py-6">
            <div className="text-xs sm:text-sm text-center text-slate-600 dark:text-slate-400 font-medium">
              Construct a standalone Doubly Linked List node. Set <code className="font-mono font-bold bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded text-[#2563EB] dark:text-blue-300">DATA = 5</code>, with both <code className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">PREV</code> and <code className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">NEXT</code> set to <code className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">NULL</code>.
            </div>

            {/* Standalone Node in Heap Memory with NULL on both sides */}
            <div className="w-full flex items-center justify-center gap-3 sm:gap-4 py-4 overflow-x-auto">
              {/* Left NULL */}
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0">
                <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  NULL
                </span>
                <span className="text-slate-400">←</span>
              </div>

              {/* Node Card */}
              {activeNodes.length > 0 && renderNodeCard(activeNodes[0], false)}

              {/* Right NULL */}
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0">
                <span className="text-slate-400">→</span>
                <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  NULL
                </span>
              </div>
            </div>

            {/* Standalone Node Direct DATA Input Field */}
            <div className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col items-center gap-3">
              <label htmlFor="create-node-data-input" className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-slate-400">
                Set Node DATA Value
              </label>
              <div className="flex items-center gap-2 w-full">
                <input
                  id="create-node-data-input"
                  type="number"
                  value={activeNodes.length > 0 ? activeNodes[0].data : 0}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const num = raw === '' ? 0 : Number(raw);
                    if (activeNodes.length > 0) {
                      setNodes((prev) =>
                        prev.map((n) =>
                          arePointersEqual(n.address, activeNodes[0].address)
                            ? { ...n, data: num }
                            : n
                        )
                      );
                      setValidationStatus('idle');
                      setFeedbackTitle(null);
                      setFeedbackMessage(null);
                      setFeedbackExplanation(null);
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-extrabold text-lg text-center focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="0"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                Enter DATA = 5 to complete construction. Click the PREV or NEXT buttons on the card if you wish to inspect or modify pointers.
              </p>
            </div>
          </div>
        ) : task.taskType === 'traverse' ? (
          /* 3. LEVEL 1 TASK 3: Traversal in DLL */
          <div className="w-full flex flex-col items-center gap-6 py-3">
            {/* PART A: Visual Memory representation of DLL nodes with bidirectional links */}
            <div className="w-full flex flex-col items-center gap-2">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                Doubly Linked List in Memory
              </span>
              <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
                <div className="flex items-center px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 select-none shadow-xs shrink-0">
                  NULL ←
                </div>

                {activeNodes.map((node, index) => {
                  return (
                    <React.Fragment key={node.address}>
                      <div className="relative flex flex-col rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 min-w-[130px] shadow-xs">
                        {/* Address Header */}
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono">
                          <span className="text-slate-400">Node</span>
                          <span className="font-bold text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                            {node.address}
                          </span>
                        </div>

                        {/* 3 Fields: PREV | DATA | NEXT */}
                        <div className="grid grid-cols-3 gap-1 text-center font-mono">
                          <div className="p-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="block text-[8px] text-slate-400 uppercase font-bold">PREV</span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate block">
                              {node.prev}
                            </span>
                          </div>
                          <div className="p-1 rounded bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60">
                            <span className="block text-[8px] text-blue-500 uppercase font-bold">DATA</span>
                            <span className="text-sm font-extrabold text-blue-700 dark:text-blue-300 block">
                              {node.data}
                            </span>
                          </div>
                          <div className="p-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="block text-[8px] text-slate-400 uppercase font-bold">NEXT</span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate block">
                              {node.next}
                            </span>
                          </div>
                        </div>
                      </div>

                      {index < activeNodes.length - 1 && (
                        <div
                          className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900/50 text-[#2563EB] dark:text-blue-400 font-extrabold text-sm shadow-xs shrink-0"
                          title="Bidirectional link (⇄)"
                        >
                          ⇄
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                <div className="flex items-center px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 select-none shadow-xs shrink-0">
                  → NULL
                </div>
              </div>
            </div>

            {/* PART B: Traversal Ordering Interface (Dynamic Slots = Number of Nodes in DLL) */}
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Traversal Order (HEAD to TAIL)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Starting from HEAD (0x1000), follow each NEXT pointer to sequence the nodes:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setTraversalSlots(new Array(activeNodes.length).fill(null));
                    setSelectedTraversalVal(null);
                    setValidationStatus('idle');
                    setFeedbackTitle(null);
                    setFeedbackMessage(null);
                    setFeedbackExplanation(null);
                  }}
                  className="text-[11px] font-mono text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer self-start sm:self-auto"
                >
                  Clear Order
                </button>
              </div>

              {/* Available Nodes Pool - ONLY nodes that actually exist in the DLL! (No 40 or extra numbers) */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  Available Nodes (Drag or Click)
                </span>
                <div className="flex items-center gap-3">
                  {(activeNodes.length === 3 ? [20, 10, 30] : activeNodes.map((n) => n.data)).map((val) => {
                    const isPlaced = traversalSlots.includes(val);
                    const isSelected = selectedTraversalVal === val;
                    return (
                      <div
                        key={val}
                        draggable={!isPlaced}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', String(val));
                        }}
                        onClick={() => {
                          if (isPlaced) return;
                          soundManager.playClick();
                          setSelectedTraversalVal(isSelected ? null : val);
                        }}
                        className={`w-12 h-12 rounded-xl font-mono text-base font-extrabold flex items-center justify-center border-2 select-none transition-all ${
                          isPlaced
                            ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                            : isSelected
                            ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400 scale-105 shadow-sm cursor-pointer'
                            : 'bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-[#2563EB] dark:text-blue-300 border-blue-300 dark:border-blue-800 cursor-grab shadow-xs'
                        }`}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Ordered Drop Slots: exactly equal to activeNodes.length (3 slots for 3 nodes) */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
                {activeNodes.map((_, idx) => {
                  const label = idx === 0 ? '1st' : idx === 1 ? '2nd' : idx === 2 ? '3rd' : `${idx + 1}th`;
                  const slotVal = traversalSlots[idx] !== undefined ? traversalSlots[idx] : null;
                  return (
                    <React.Fragment key={idx}>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const rawVal = e.dataTransfer.getData('text/plain');
                          const numVal = parseInt(rawVal, 10);
                          if (!isNaN(numVal)) {
                            soundManager.playClick();
                            setTraversalSlots((prev) => {
                              const copy = [...prev];
                              while (copy.length < activeNodes.length) copy.push(null);
                              const existingIdx = copy.indexOf(numVal);
                              if (existingIdx !== -1) copy[existingIdx] = null;
                              copy[idx] = numVal;
                              return copy;
                            });
                            setValidationStatus('idle');
                            setFeedbackTitle(null);
                            setFeedbackMessage(null);
                            setFeedbackExplanation(null);
                          }
                        }}
                        onClick={() => {
                          if (selectedTraversalVal !== null) {
                            soundManager.playClick();
                            const valToSet = selectedTraversalVal;
                            setTraversalSlots((prev) => {
                              const copy = [...prev];
                              while (copy.length < activeNodes.length) copy.push(null);
                              const existingIdx = copy.indexOf(valToSet);
                              if (existingIdx !== -1) copy[existingIdx] = null;
                              copy[idx] = valToSet;
                              return copy;
                            });
                            setSelectedTraversalVal(null);
                            setValidationStatus('idle');
                            setFeedbackTitle(null);
                            setFeedbackMessage(null);
                            setFeedbackExplanation(null);
                          } else if (slotVal !== null) {
                            soundManager.playClick();
                            setTraversalSlots((prev) => {
                              const copy = [...prev];
                              copy[idx] = null;
                              return copy;
                            });
                            setValidationStatus('idle');
                            setFeedbackTitle(null);
                            setFeedbackMessage(null);
                            setFeedbackExplanation(null);
                          }
                        }}
                        className={`w-20 sm:w-24 h-20 sm:h-22 rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all cursor-pointer ${
                          slotVal !== null
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-xs'
                            : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30 hover:border-blue-400'
                        }`}
                        title={slotVal !== null ? 'Click to remove' : 'Drop or click node to place'}
                      >
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                          [ {label} ]
                        </span>
                        {slotVal !== null ? (
                          <>
                            <span className="text-base sm:text-lg font-mono font-extrabold text-[#2563EB] dark:text-blue-300">
                              {slotVal}
                            </span>
                            <span className="text-[8px] font-mono text-slate-400 mt-0.5">remove</span>
                          </>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400 italic text-center">
                            Empty
                          </span>
                        )}
                      </div>

                      {idx < activeNodes.length - 1 && (
                        <span className="text-slate-400 font-mono font-bold text-sm sm:text-base">
                          →
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* 3. STANDARD DLL MANIPULATION WORKSPACE (Build, Insert, Delete) */
          <div className="w-full flex flex-col items-center gap-6 py-2">
            {/* Horizontal Main DLL Nodes Chain */}
            <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
              {mainChainNodes.length > 0 ? (
                <>
                  {/* Leading NULL <- indicator */}
                  <div className="flex items-center px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 select-none shadow-xs shrink-0">
                    NULL ←
                  </div>

                  {mainChainNodes.map((node, index) => {
                    const nextNode = mainChainNodes[index + 1];
                    const isForwardLinked = nextNode && arePointersEqual(node.next, nextNode.address);
                    const isBackwardLinked = nextNode && arePointersEqual(nextNode.prev, node.address);
                    const isTwoWay = isForwardLinked && isBackwardLinked;

                    return (
                      <React.Fragment key={node.address}>
                        {renderNodeCard(node, false)}

                        {/* Connection Indicator between adjacent nodes */}
                        {index < mainChainNodes.length - 1 && (
                          <div className="flex flex-col items-center justify-center px-1 font-mono select-none shrink-0">
                            {isTwoWay ? (
                              <div
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900/50 text-[#2563EB] dark:text-blue-400 font-extrabold text-base shadow-xs"
                                title="2-way link verified (⇄)"
                              >
                                ⇄
                              </div>
                            ) : isForwardLinked ? (
                              <div
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 font-extrabold text-base shadow-xs"
                                title="Forward pointer only (→)"
                              >
                                →
                              </div>
                            ) : isBackwardLinked ? (
                              <div
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 font-extrabold text-base shadow-xs"
                                title="Backward pointer only (←)"
                              >
                                ←
                              </div>
                            ) : (
                              <div
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200/70 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs tracking-widest"
                                title="Not linked"
                              >
                                · ·
                              </div>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Trailing -> NULL indicator */}
                  <div className="flex items-center px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 select-none shadow-xs shrink-0">
                    → NULL
                  </div>
                </>
              ) : (
                <div className="text-xs font-mono text-slate-400 italic py-6">
                  No connected nodes in the DLL chain.
                </div>
              )}
            </div>

            {/* Separate Allocated Memory Area (displayed when node exists but is not yet inserted into DLL) */}
            {unconnectedNodes.length > 0 && (
              <div
                id="dll-unconnected-nodes-area"
                className="w-full mt-4 p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-800/60 flex flex-col items-center gap-3 animate-fade-in shadow-xs"
              >
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-200/80 dark:border-amber-900/40 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono uppercase font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Allocated Memory (New Node)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-300/80 dark:border-amber-800">
                      Not in DLL chain yet
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-900/80 dark:text-slate-400 font-medium">
                    Update PREV and NEXT pointers to link into the Doubly Linked List
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 py-2">
                  {unconnectedNodes.map((node) => renderNodeCard(node, true))}
                </div>
              </div>
            )}

            {/* Hint on how to update */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
              Click the <strong className="text-slate-700 dark:text-slate-200">PREV</strong> or{' '}
              <strong className="text-slate-700 dark:text-slate-200">NEXT</strong> fields on any node to update its pointer address.
            </div>
          </div>
        )}
            </div>
          </div>



      {/* =========================================================================
          FEEDBACK BANNER (SUCCESS / ERROR / HINT)
          ========================================================================= */}
      {validationStatus === 'success' && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-medium animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedbackMessage || 'Correct! The DLL is valid.'}</span>
          </div>

          <button
            type="button"
            onClick={onBackToTasks}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Return to Tasks
          </button>
        </div>
      )}

      {validationStatus === 'error' && (
        <div
          id="wrong-answer-card"
          className="w-full p-4 sm:p-5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800/70 flex flex-col gap-3.5 shadow-sm animate-fade-in"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100">
                    {feedbackTitle || 'Wrong Answer'}
                  </h4>
                  {attemptCount > 0 && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-200/80 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200">
                      Attempt #{attemptCount}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-200 leading-relaxed">
                  {feedbackMessage || 'The DLL is not correct yet.'}
                </p>
                {feedbackExplanation && (
                  <p className="text-xs text-rose-700 dark:text-rose-300/90 leading-relaxed mt-1">
                    {feedbackExplanation}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setValidationStatus('idle')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-rose-100 dark:hover:bg-slate-800 border border-rose-300 dark:border-rose-800 text-xs font-bold text-rose-800 dark:text-rose-200 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Try Again
            </button>
          </div>

          {/* Progressive Conceptual Hint */}
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white font-bold block mb-0.5">
                {attemptCount >= 2 ? 'Deep Conceptual Hint:' : 'Conceptual Hint:'}
              </strong>
              {getWrongAnswerHint(task, attemptCount)}
            </div>
          </div>
        </div>
      )}

      {showHint && (
        <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-2.5 text-blue-900 dark:text-blue-200 text-xs sm:text-sm leading-relaxed animate-fade-in">
          <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Conceptual Hint:</strong>
            {task.hint}
          </div>
        </div>
      )}

      {/* =========================================================================
          ESSENTIAL CONTROLS: CHECK ANSWER, RESET, HINT, & GUIDED SOLVE
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Secondary Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs transition-colors cursor-pointer"
            title="Reset to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          {/* Optional Hint Button */}
          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
          </button>

          {/* Guided Solve Button (Visible when Guided Solve is not active) */}
          {task.guidedSteps && task.guidedSteps.length > 0 && !guidedState.isActive && (
            <button
              type="button"
              onClick={handleStartGuidedSolve}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#2563EB] dark:text-blue-300 text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Step-by-step assistance"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
              <span>Guided Solve</span>
            </button>
          )}
        </div>

        {/* Primary CHECK ANSWER Button */}
        <button
          type="button"
          onClick={handleCheckAnswer}
          className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>CHECK ANSWER</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div> {/* Closes Left Column */}

    {/* =========================================================================
        RIGHT COLUMN: GUIDED SOLVE PANEL (~30% on desktop)
        Persistent Chronological Step History View
        ========================================================================= */}
    {guidedState.isActive && (
      <div className="w-full lg:w-[30%] shrink-0 lg:sticky lg:top-6 min-w-0">
        <div
          id="guided-solve-panel"
          className="w-full bg-white dark:bg-[#111827] rounded-2xl border-2 border-blue-200/90 dark:border-blue-900/60 p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Guided Solve
                </h3>
                <span className="text-[11px] font-mono font-bold text-[#2563EB] dark:text-blue-400">
                  {guidedState.currentStep === 0
                    ? `Ready (${guidedState.totalSteps} steps)`
                    : `Step ${guidedState.currentStep} of ${guidedState.totalSteps}`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStopGuidedSolve}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Stop Guided Solve"
              aria-label="Stop Guided Solve"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Step History Area */}
          <div
            id="guided-step-history-scroll"
            className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1 py-1 scroll-smooth"
          >
            {/* Initial State: Empty Guided Solve history with current task instructions */}
            {guidedHistory.length === 0 ? (
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] dark:text-blue-400 font-mono uppercase tracking-wider">
                  <span>Task Instruction</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {task.instruction}
                </p>
                <div className="pt-2 border-t border-blue-100/80 dark:border-blue-900/40 text-[11px] text-slate-500 dark:text-slate-400">
                  Click <strong className="text-[#2563EB] dark:text-blue-400">NEXT STEP</strong> below to execute Step 1 and observe the pointer updates live in the workspace.
                </div>
              </div>
            ) : (
              /* Chronological Step Cards: Never removes completed steps */
              guidedHistory.map((step, idx) => {
                const isLatest = idx === guidedHistory.length - 1 && !guidedState.isFinished;

                return (
                  <div
                    key={`guided-step-${step.stepNumber}`}
                    id={`guided-step-card-${step.stepNumber}`}
                    className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-2 ${
                      isLatest
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/50 shadow-xs'
                        : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800'
                    }`}
                  >
                    {/* Step Card Header: Step number & Step status */}
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60 dark:border-slate-800 text-xs">
                      <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                        Step {step.stepNumber}
                      </span>
                      {isLatest ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900/70 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
                          Current
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Completed
                        </span>
                      )}
                    </div>

                    {/* Operation Performed */}
                    {step.operationText && (
                      <div className="flex items-start gap-1.5 text-xs font-mono">
                        <span className="text-slate-400 dark:text-slate-500 font-semibold shrink-0">Action:</span>
                        <span className="font-bold text-[#2563EB] dark:text-blue-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/80 break-words leading-tight">
                          {step.operationText}
                        </span>
                      </div>
                    )}

                    {/* Short Explanation */}
                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {step.explanation}
                    </p>
                  </div>
                );
              })
            )}

            {/* Guided Solve Complete Banner */}
            {guidedState.isFinished && (
              <div
                id="guided-solve-complete-banner"
                className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-start gap-2.5 animate-fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 text-[13px]">
                    Guided Solve Complete
                  </span>
                  <span className="text-[12px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                    All operations have been demonstrated! The Doubly Linked List is now in the solved state. Review the completed steps above, or click Reset to practice independently.
                  </span>
                </div>
              </div>
            )}

            {/* Bottom scroll anchor */}
            <div ref={guidedHistoryEndRef} />
          </div>

          {/* Navigation Controls: NEXT STEP & STOP GUIDED SOLVE */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {!guidedState.isFinished ? (
              <button
                type="button"
                id="guided-next-step-btn"
                onClick={handleNextGuidedStep}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{guidedState.currentStep === 0 ? 'START STEP 1' : 'NEXT STEP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                id="guided-finish-btn"
                onClick={handleStopGuidedSolve}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>DONE</span>
              </button>
            )}

            <button
              type="button"
              id="guided-stop-btn"
              onClick={handleStopGuidedSolve}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs transition-colors cursor-pointer text-center uppercase tracking-wider"
            >
              STOP GUIDED SOLVE
            </button>
          </div>
        </div>
      </div>
    )}
  </div> {/* Closes Two-Column Container */}

      {/* =========================================================================
          CLEAN POINTER EDITING PANEL / MODAL
          ========================================================================= */}
      {editingPointer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Update Pointer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPointer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details: Node Address, Pointer Type, Current Value */}
            <div className="space-y-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Node Address:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {editingPointer.nodeAddress}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Pointer Type:</span>
                <span className="font-bold text-[#2563EB] dark:text-blue-400 uppercase">
                  {editingPointer.field}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Current Value:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {editingPointer.currentValue}
                </span>
              </div>
            </div>

            {/* Quick-Select Helper Pills */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                Quick Select Address:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableAddresses.map((addr) => (
                  <button
                    key={addr}
                    type="button"
                    onClick={() => setInputAddress(addr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                      arePointersEqual(inputAddress, addr)
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {addr}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Address Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-700 dark:text-slate-300 block">
                Enter pointer address:
              </label>
              <input
                type="text"
                value={inputAddress}
                onChange={(e) => {
                  setInputAddress(e.target.value);
                  setPointerError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdatePointer();
                }}
                placeholder="e.g. 0x1008 or NULL"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              {pointerError && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">
                  {pointerError}
                </p>
              )}
            </div>

            {/* Action Button: UPDATE */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPointer(null)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdatePointer}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                UPDATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE NEW NODE MODAL / PANEL
          ========================================================================= */}
      {isCreateNodeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create New Node
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateNodeOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Allocate memory and initialize the node before connecting pointers.
            </p>

            {/* 4 Fields Grid: DATA, ADDRESS, PREV, NEXT */}
            <div className="grid grid-cols-2 gap-3">
              {/* 1. DATA (Editable Number Input) */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800">
                <label className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>DATA</span>
                  <span className="text-[9px] text-[#2563EB] dark:text-blue-400 font-sans font-semibold">
                    Editable
                  </span>
                </label>
                <input
                  type="number"
                  value={nodeCreationData}
                  onChange={(e) => setNodeCreationData(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-extrabold text-base text-center focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* 2. ADDRESS (Auto-Allocated, Non-Editable) */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>ADDRESS</span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Generated</span>
                  </span>
                </div>
                <div className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[#2563EB] dark:text-blue-400 font-mono font-bold text-base text-center select-none">
                  {task.newNodeConfig?.address || getGeneratedAddress(nodes, task)}
                </div>
              </div>

              {/* 3. PREV (Initial Value NULL, Non-Editable) */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>PREV</span>
                  <span className="text-[9px] text-slate-400 font-sans font-medium">Initial</span>
                </div>
                <div className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono font-bold text-base text-center select-none">
                  NULL
                </div>
              </div>

              {/* 4. NEXT (Initial Value NULL, Non-Editable) */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>NEXT</span>
                  <span className="text-[9px] text-slate-400 font-sans font-medium">Initial</span>
                </div>
                <div className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono font-bold text-base text-center select-none">
                  NULL
                </div>
              </div>
            </div>

            {/* Buttons: Cancel & CREATE NODE */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateNodeOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateNode}
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                CREATE NODE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE NODE CONFIRMATION MODAL
          ========================================================================= */}
      {nodePendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-2xl border border-rose-200 dark:border-rose-900/60 p-6 shadow-xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete this node?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNodePendingDelete(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Node Details */}
            <div className="space-y-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>DATA:</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {nodePendingDelete.data}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>ADDRESS:</span>
                <span className="font-bold text-[#2563EB] dark:text-blue-400">
                  {nodePendingDelete.address}
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              This node will be removed from the list. Pointers will not be automatically repaired.
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNodePendingDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteNode}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
