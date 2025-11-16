/**
 * Task-related type definitions for Parallel Task Executor
 *
 * AC-4.1 to AC-4.9: Defines core task interfaces for P-wave labeling and parallel execution
 */

/**
 * Task status enumeration
 *
 * - pending: Task has not started
 * - running: Task is currently executing
 * - completed: Task finished successfully
 * - failed: Task encountered an error
 * - cancelled: Task was cancelled due to dependency failure
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Task executor function type
 *
 * Executes the actual task logic and returns a result
 *
 * @returns Promise resolving to task output (any type)
 * @throws Error if task execution fails
 */
export type TaskExecutor = () => Promise<unknown>;

/**
 * Task definition
 *
 * Represents a single executable task with dependencies
 *
 * AC-4.1: Tasks are labeled with P-wave numbers (0, 1, 2, ...)
 * AC-4.2: Dependencies define DAG edges
 */
export interface Task {
  /**
   * Unique task identifier
   *
   * Format: "task-1", "task-2", etc.
   */
  id: string;

  /**
   * Human-readable task description
   *
   * Example: "Implement user authentication service"
   */
  description: string;

  /**
   * List of task IDs that must complete before this task can run
   *
   * AC-4.2: Defines DAG edges (from dependency -> to this task)
   *
   * Example: ["task-1", "task-3"] means this task depends on tasks 1 and 3
   */
  dependencies: string[];

  /**
   * Task execution function
   *
   * AC-4.3, AC-4.4, AC-4.5: Executed when all dependencies are complete
   */
  executor: TaskExecutor;

  /**
   * Current task status
   *
   * AC-4.8: Updated to 'cancelled' when dependency fails
   * AC-4.9: Tracked by ProgressTracker
   */
  status: TaskStatus;

  /**
   * P-wave label (optional, assigned by PWaveLabeler)
   *
   * AC-4.1: P0 = no dependencies, P1 = depends on P0, P2 = depends on P1, etc.
   */
  wave?: number;
}

/**
 * Task execution result
 *
 * AC-4.8: Contains error information for failure handling
 * AC-4.9: Used by ProgressTracker to report task outcomes
 */
export interface ExecutionResult {
  /**
   * Task ID that was executed
   */
  taskId: string;

  /**
   * Execution status
   */
  status: 'completed' | 'failed' | 'cancelled';

  /**
   * Execution duration in milliseconds
   *
   * AC-4.6: Used by TimeMetricsCollector to calculate time savings
   */
  duration: number;

  /**
   * Task output (if successful)
   */
  output?: unknown;

  /**
   * Error information (if failed)
   *
   * AC-4.8: Used by FailureHandler to determine dependent tasks to cancel
   */
  error?: Error;

  /**
   * Start timestamp
   */
  startTime: number;

  /**
   * End timestamp
   */
  endTime: number;
}
