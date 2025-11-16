/**
 * SDD Workflow Types
 * Based on steering/rules/workflow.md (8-stage workflow)
 * @module @musuhi-ng/core/types/workflow
 */

/**
 * SDD workflow stages
 */
export type WorkflowStage =
  | 'research'
  | 'requirements'
  | 'design'
  | 'tasks'
  | 'implementation'
  | 'testing'
  | 'deployment'
  | 'monitoring';

/**
 * Workflow stage status
 */
export type StageStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'failed';

/**
 * Workflow stage configuration
 */
export interface WorkflowStageConfig {
  /** Stage name */
  stage: WorkflowStage;

  /** Stage status */
  status: StageStatus;

  /** Stage start time */
  startedAt?: Date;

  /** Stage completion time */
  completedAt?: Date;

  /** Stage deliverables (file paths) */
  deliverables?: string[];

  /** Quality gates for this stage */
  qualityGates?: QualityGate[];

  /** Agents assigned to this stage */
  agents?: string[];
}

/**
 * Quality gate configuration
 */
export interface QualityGate {
  /** Gate name */
  name: string;

  /** Gate description */
  description: string;

  /** Gate validation function */
  validator: (context: WorkflowContext) => Promise<GateValidationResult>;

  /** Whether gate is mandatory */
  mandatory: boolean;

  /** Gate priority */
  priority: number;
}

/**
 * Gate validation result
 */
export interface GateValidationResult {
  /** Validation passed */
  passed: boolean;

  /** Validation message */
  message: string;

  /** Validation details */
  details?: Record<string, unknown>;

  /** Suggestions for passing */
  suggestions?: string[];
}

/**
 * Workflow context
 */
export interface WorkflowContext {
  /** Project root directory */
  projectRoot: string;

  /** Current stage */
  currentStage: WorkflowStage;

  /** All stage configurations */
  stages: WorkflowStageConfig[];

  /** Workflow metadata */
  metadata: {
    /** Workflow start time */
    startedAt: Date;

    /** Workflow completion time */
    completedAt?: Date;

    /** Current user/team */
    user?: string;

    /** Project name */
    projectName?: string;
  };
}

/**
 * P-wave task labeling
 * Based on ADR-004: Parallel Execution Implementation
 */
export type PWaveLabel = 'P0' | 'P1' | 'P2' | 'P3';

/**
 * Task configuration
 */
export interface Task {
  /** Task ID (e.g., T-001) */
  id: string;

  /** Task title */
  title: string;

  /** Task description */
  description: string;

  /** P-wave label (dependency level) */
  pWave: PWaveLabel;

  /** Task status */
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'failed';

  /** Estimated effort (hours) */
  estimatedHours?: number;

  /** Actual effort (hours) */
  actualHours?: number;

  /** Dependencies (other task IDs) */
  dependencies?: string[];

  /** Requirements covered by this task */
  requirements?: string[];

  /** Assigned agent */
  agent?: string;

  /** Task deliverables */
  deliverables?: string[];

  /** Start time */
  startedAt?: Date;

  /** Completion time */
  completedAt?: Date;
}

/**
 * Task execution result
 */
export interface TaskResult {
  /** Task ID */
  taskId: string;

  /** Execution status */
  status: 'success' | 'failure' | 'partial';

  /** Result message */
  message: string;

  /** Created/modified files */
  artifacts?: string[];

  /** Execution time (ms) */
  executionTime?: number;

  /** Error details (if failed) */
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
}
