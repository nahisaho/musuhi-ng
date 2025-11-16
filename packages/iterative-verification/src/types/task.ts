/**
 * Task Type Definitions
 *
 * Defines task structure, status, results, and file changes for iterative verification.
 *
 * Requirement Coverage:
 * - AC-7.1: Task-by-Task Mode (Task structure, TaskStatus)
 * - AC-7.3: Continue Option (TaskStatus.completed)
 * - AC-7.5: Rollback Option (FileChange for rollback)
 */

/**
 * Task status enumeration
 * AC-7.1: Task-by-Task Mode requires status tracking
 */
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';

/**
 * Task representation
 * AC-7.1: Task-by-Task Mode - Execute one task at a time
 */
export interface Task {
  /** Unique task identifier */
  id: string;

  /** Human-readable task title */
  title: string;

  /** Detailed task description */
  description: string;

  /** Task IDs that must complete before this task */
  dependencies: string[];

  /** Current task status */
  status: TaskStatus;

  /** Task execution result (if executed) */
  result?: TaskResult;

  /** Task creation timestamp */
  createdAt: Date;

  /** Task execution start timestamp */
  startedAt?: Date;

  /** Task completion timestamp */
  completedAt?: Date;
}

/**
 * Task execution result
 * AC-7.2: Task Completion Prompt - Display results to user
 * AC-7.5: Rollback Option - Track changes for rollback
 */
export interface TaskResult {
  /** Whether task executed successfully */
  success: boolean;

  /** File changes made during task execution */
  changes: FileChange[];

  /** Errors encountered during execution */
  errors: TaskError[];

  /** Execution duration in milliseconds */
  duration: number;

  /** Task execution output (logs, stdout) */
  output: string;
}

/**
 * File change tracking for rollback support
 * AC-7.5: Rollback Option - Undo all task changes
 */
export interface FileChange {
  /** Absolute path to changed file */
  path: string;

  /** Type of change operation */
  type: 'created' | 'modified' | 'deleted';

  /** Original file content before change (for rollback) */
  beforeContent?: string;

  /** New file content after change */
  afterContent?: string;
}

/**
 * Task error representation
 * AC-7.2: Task Completion Prompt - Display errors to user
 */
export interface TaskError {
  /** Error message */
  message: string;

  /** Error severity level */
  severity: 'error' | 'warning';

  /** File where error occurred (if applicable) */
  file?: string;

  /** Line number where error occurred (if applicable) */
  line?: number;
}
