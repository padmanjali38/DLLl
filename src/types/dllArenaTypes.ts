export type LevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface ArenaNodePort {
  id: string;
  type: 'prev_out' | 'next_out' | 'in';
  connectedTo: string | null; // target node id or 'NULL'
}

export interface ArenaNode {
  id: string;
  label: string;
  value: string | number;
  subtitle?: string;
  ports?: {
    prev_out?: string | null;
    next_out?: string | null;
  };
  hasHeadBadge?: boolean;
  hasTailBadge?: boolean;
  isDeallocated?: boolean;
  isSevered?: boolean;
  hasGem?: boolean;
  gemCollected?: boolean;
  isCurrentTraversal?: boolean;
}

export interface MemoryDraggableItem {
  id: string;
  label: string;
  type: 'pointer_prev' | 'data_payload' | 'pointer_next' | 'distractor';
  correctSlot: 'left_slot' | 'center_slot' | 'right_slot' | null;
  rejectionMessage?: string;
}

export interface GuidedStepArena {
  stepNumber: number;
  instruction: string;
  explanation: string;
  codeSnippet?: string;
  action: () => void;
}

export interface ArenaLevelConfig {
  level_id: LevelId;
  code: string;
  title: string;
  topic: string;
  objective: string;
  interactionMode: string;
  feedbackEngine: string;
  totalXp: number;
  cCodeSnippet: string;
  iconType: 'link' | 'pointer' | 'plus' | 'trash' | 'star';
  description: string;
}
