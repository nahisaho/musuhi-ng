/**
 * Execution-related type definitions
 *
 * AC-4.6: Time savings measurement
 * AC-4.9: Progress monitoring
 */

import type { ExecutionResult } from './task.js';

/**
 * Progress snapshot
 *
 * AC-4.9: Real-time progress monitoring
 */
export interface ProgressSnapshot {
  /**
   * Number of tasks currently running
   */
  active: number;

  /**
   * Number of tasks completed successfully
   */
  completed: number;

  /**
   * Number of tasks pending (not yet started)
   */
  pending: number;

  /**
   * Number of tasks failed
   */
  failed: number;

  /**
   * Number of tasks cancelled (due to dependency failure)
   *
   * AC-4.8: Cancelled when predecessor fails
   */
  cancelled: number;

  /**
   * Total number of tasks
   */
  total: number;

  /**
   * Current P-wave being executed
   *
   * AC-4.3, AC-4.4, AC-4.5: Indicates which wave is active
   */
  currentWave?: number;

  /**
   * Timestamp of this snapshot
   */
  timestamp: number;
}

/**
 * Time metrics for parallel execution
 *
 * AC-4.6: Measures time savings from parallel execution
 */
export interface TimeMetrics {
  /**
   * Sequential execution time (baseline)
   *
   * Sum of all task durations
   */
  sequentialTime: number;

  /**
   * Actual parallel execution time
   *
   * Measured wall-clock time from start to finish
   */
  parallelTime: number;

  /**
   * Time savings percentage
   *
   * AC-4.6: Must be 50%+ for successful parallel execution
   *
   * Formula: ((sequentialTime - parallelTime) / sequentialTime) * 100
   */
  timeSavings: number;

  /**
   * Breakdown by P-wave
   *
   * Maps wave number to execution time
   *
   * Example: { 0: 100, 1: 50, 2: 30 } means P0 took 100ms, P1 took 50ms, P2 took 30ms
   */
  waveBreakdown: Record<number, number>;

  /**
   * Routing overhead (orchestration time)
   *
   * NFR-P.4: Must be < 200ms
   */
  routingOverhead: number;
}

/**
 * Parallel execution result
 *
 * Aggregates all execution results and metrics
 */
export interface ParallelExecutionResult {
  /**
   * Individual task execution results
   */
  results: ExecutionResult[];

  /**
   * P-wave assignments (task ID -> wave number)
   *
   * AC-4.1: P-wave labeling results
   */
  waves: Map<string, number>;

  /**
   * Time metrics
   *
   * AC-4.6: Time savings measurement
   */
  metrics: TimeMetrics;

  /**
   * Final progress snapshot
   *
   * AC-4.9: Final task status counts
   */
  progress: ProgressSnapshot;

  /**
   * Success status
   *
   * true if all tasks completed successfully
   * false if any task failed or was cancelled
   */
  success: boolean;

  /**
   * Failed task IDs
   *
   * AC-4.8: List of tasks that failed
   */
  failedTasks: string[];

  /**
   * Cancelled task IDs
   *
   * AC-4.8: List of tasks cancelled due to dependency failure
   */
  cancelledTasks: string[];
}

/**
 * Progress event
 *
 * AC-4.9: Emitted by ProgressTracker for real-time updates
 */
export interface ProgressEvent {
  /**
   * Event type
   */
  type: 'task-start' | 'task-complete' | 'task-fail' | 'task-cancel' | 'wave-start' | 'wave-complete';

  /**
   * Task ID (for task-specific events)
   */
  taskId?: string;

  /**
   * Wave number (for wave-specific events)
   */
  wave?: number;

  /**
   * Current progress snapshot
   */
  progress: ProgressSnapshot;

  /**
   * Timestamp of event
   */
  timestamp: number;
}
