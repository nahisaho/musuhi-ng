/**
 * Checkpoint Type Definitions
 *
 * Defines checkpoint structure for resuming interrupted workflows.
 *
 * Requirement Coverage:
 * - AC-7.6: Resume from Checkpoint (Checkpoint, CheckpointState)
 */

import type { TaskError } from './task.js';

/**
 * Checkpoint for resuming interrupted workflows
 * AC-7.6: Resume from Checkpoint - Save state after each task
 */
export interface Checkpoint {
  /** Unique checkpoint identifier */
  id: string;

  /** Checkpoint creation timestamp */
  timestamp: Date;

  /** ID of last completed task */
  taskId: string;

  /** IDs of all completed tasks */
  completedTasks: string[];

  /** IDs of all pending tasks */
  pendingTasks: string[];

  /** Checkpoint state snapshot */
  state: CheckpointState;
}

/**
 * Checkpoint state snapshot
 * AC-7.6: Resume from Checkpoint - Restore workflow state
 */
export interface CheckpointState {
  /** Snapshot of file system state (filepath -> content) */
  filesSnapshot: Map<string, string>;

  /** Index of current task in task list */
  currentTaskIndex: number;

  /** Total number of tasks */
  totalTasks: number;

  /** Accumulated errors across all tasks */
  errors: TaskError[];
}
