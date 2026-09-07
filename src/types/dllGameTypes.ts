export interface HeapNode {
  id: string;
  address: number;
  data: number | string;
  prev: number | null; // target address or null
  next: number | null; // target address or null
  x?: number;
  y?: number;
  isSevered?: boolean;
  isIsolated?: boolean;
  isFloating?: boolean;
  isTargetDelete?: boolean;
  isCorruptedLink?: boolean;
  hasGem?: boolean;
}

export interface VerificationCriterion {
  id: string;
  label: string;
  isMet: boolean;
}

export interface GuidedStep {
  stepNumber: number;
  instruction: string;
  explanation: string;
  actionType:
    | 'CREATE_NODE'
    | 'CONNECT_NEXT'
    | 'CONNECT_PREV'
    | 'SET_HEAD'
    | 'SET_TAIL'
    | 'DELETE_NODE'
    | 'VERIFY'
    | 'SLOT_COMPONENT'
    | 'TRAVERSE_STEP'
    | 'SEVER_LINK'
    | 'MULTISTAGE_ACTION';
  payload?: any;
}

export interface ToolbarButtonConfig {
  id: string;
  label: string;
  style: 'primary_purple' | 'outline_purple' | 'primary_cyan' | 'primary_amber' | 'secondary_gray' | 'success' | 'danger' | 'warning' | 'subtle' | string;
}

export interface WorkspaceLayoutConfig {
  statusBar?: {
    leftLabel?: string;
    nodeCount?: string;
    headState?: string;
    tailState?: string;
  };
  canvasState?: {
    type:
      | 'assembly_dropzone'
      | 'linking_nodes'
      | 'boundary_assignment'
      | 'traversal_runner'
      | 'node_insertion'
      | 'node_deletion'
      | 'diagnostic_repair'
      | 'multistage_challenge'
      | string;
    slots?: string[];
    inventory?: string[];
    activeNodes?: { id: string; data: number | string; pos?: [number, number] }[];
    connectionsRequired?: string[];
    renderedChain?: string;
    draggableLabels?: string[];
    characterPosition?: string;
    existingChain?: string;
    floatingNode?: string;
    currentChain?: string;
    targetNode?: string;
    brokenState?: string;
    errorsToFix?: number;
    initialChain?: string;
    targetChain?: string;
  };
  toolbarButtons?: ToolbarButtonConfig[];
}

export interface RightPanelConfig {
  checklist: string[];
  guidedSteps: string[];
  codeEquivalent: string;
}

export interface TaskConfig {
  id: string;
  taskNumber: number;
  tag?: string; // e.g. "Task #1"
  concept?: string; // e.g. "Node Structure"
  objective?: string;
  title: string;
  description: string;
  xpReward: number;
  iconType: 'plus' | 'link' | 'pointer' | 'trash' | 'star';
  cCode: string;
  codeSnippet?: string;
  initialNodes: HeapNode[];
  initialHead: number | null;
  initialTail: number | null;
  workspaceLayout?: WorkspaceLayoutConfig;
  rightPanel?: RightPanelConfig;
  targetCriteria: {
    id: string;
    label: string;
    validate: (nodes: HeapNode[], head: number | null, tail: number | null) => boolean;
  }[];
  guidedSteps: GuidedStep[];
  hints?: [string, string, string] | string[];
  targetState?: {
    nodes: { address: number; data: number | string; prev: number | null; next: number | null }[];
    head: number | null;
    tail: number | null;
  };
}

export interface LevelConfig {
  id: number;
  levelNumber: number;
  code: string;
  moduleId?: string;
  breadcrumb?: string;
  title: string;
  subtitle: string;
  levelSelector?: string[];
  interactionMode: string;
  feedbackEngine: string;
  totalXp: number;
  tasks: TaskConfig[];
}

