/**
 * FailureHandler - Handles task failures and cancels dependent tasks
 *
 * AC-4.8: Failure Handling
 * - When a task fails, cancel all dependent tasks
 * - Prevent execution of tasks whose dependencies failed
 * - Track cancelled tasks for reporting
 */

import type { Graph } from 'graphlib';
import type { Task, ExecutionResult } from '../types/index.js';

/**
 * Handles task failures and dependency cancellation
 *
 * AC-4.8: IF a task fails, THEN the system SHALL cancel all dependent tasks
 * and prevent their execution
 */
export class FailureHandler {
  /**
   * Cancel all tasks that depend on failed tasks
   *
   * Uses graph.successors() to find all downstream dependencies
   *
   * @param failedTaskIds - IDs of tasks that failed
   * @param tasks - All tasks
   * @param graph - Dependency graph
   * @returns Array of cancelled task IDs
   *
   * @example
   * ```typescript
   * const handler = new FailureHandler();
   * const cancelled = handler.cancelDependentTasks(['task-1'], tasks, graph);
   * // Returns: ['task-2', 'task-3'] (tasks depending on task-1)
   * ```
   */
  public cancelDependentTasks(failedTaskIds: string[], tasks: Task[], graph: Graph): string[] {
    const cancelledTaskIds = new Set<string>();

    // For each failed task, find all downstream dependencies
    for (const failedTaskId of failedTaskIds) {
      const dependents = this.getAllDependents(failedTaskId, graph);

      for (const dependentId of dependents) {
        cancelledTaskIds.add(dependentId);

        // Update task status to 'cancelled'
        const task = tasks.find((t) => t.id === dependentId);
        if (task) {
          task.status = 'cancelled';
        }
      }
    }

    return Array.from(cancelledTaskIds);
  }

  /**
   * Get all transitive dependents of a task
   *
   * Recursively finds all tasks that directly or indirectly depend on the given task
   *
   * @param taskId - Task ID to find dependents of
   * @param graph - Dependency graph
   * @returns Array of all dependent task IDs (direct and transitive)
   *
   * @example
   * ```typescript
   * // Graph: t1 -> t2 -> t3, t1 -> t4
   * const dependents = handler.getAllDependents('t1', graph);
   * // Returns: ['t2', 't3', 't4'] (all downstream tasks)
   * ```
   */
  private getAllDependents(taskId: string, graph: Graph): string[] {
    const visited = new Set<string>();
    const queue: string[] = [taskId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const successors = graph.successors(current) || [];

      for (const successor of successors) {
        if (!visited.has(successor)) {
          visited.add(successor);
          queue.push(successor);
        }
      }
    }

    return Array.from(visited);
  }

  /**
   * Create execution results for cancelled tasks
   *
   * Generates ExecutionResult objects for tasks that were cancelled
   *
   * @param cancelledTaskIds - IDs of cancelled tasks
   * @param tasks - All tasks
   * @returns Array of execution results with status 'cancelled'
   *
   * @example
   * ```typescript
   * const results = handler.createCancelledResults(['task-2', 'task-3'], tasks);
   * // Returns: [{ taskId: 'task-2', status: 'cancelled', ... }, ...]
   * ```
   */
  public createCancelledResults(cancelledTaskIds: string[], tasks: Task[]): ExecutionResult[] {
    const timestamp = Date.now();

    return cancelledTaskIds.map((taskId) => {
      const task = tasks.find((t) => t.id === taskId);

      return {
        taskId,
        status: 'cancelled' as const,
        duration: 0,
        error: new Error(
          `Task "${taskId}" was cancelled because a dependency failed. ` +
            `Description: ${task?.description || 'Unknown'}`
        ),
        startTime: timestamp,
        endTime: timestamp,
      };
    });
  }

  /**
   * Handle failures in execution results
   *
   * Processes execution results, identifies failures, and cancels dependent tasks
   *
   * @param results - Execution results from a wave
   * @param tasks - All tasks
   * @param graph - Dependency graph
   * @returns Updated execution results (including cancelled tasks)
   *
   * @example
   * ```typescript
   * const updatedResults = handler.handleFailures(waveResults, allTasks, graph);
   * // Includes cancelled results for dependent tasks
   * ```
   */
  public handleFailures(
    results: ExecutionResult[],
    tasks: Task[],
    graph: Graph
  ): ExecutionResult[] {
    // Identify failed tasks
    const failedTaskIds = results.filter((r) => r.status === 'failed').map((r) => r.taskId);

    if (failedTaskIds.length === 0) {
      return results; // No failures, no cancellations needed
    }

    // Cancel dependent tasks
    const cancelledTaskIds = this.cancelDependentTasks(failedTaskIds, tasks, graph);

    // Create results for cancelled tasks
    const cancelledResults = this.createCancelledResults(cancelledTaskIds, tasks);

    // Return combined results
    return [...results, ...cancelledResults];
  }

  /**
   * Check if task can execute given current completed/failed tasks
   *
   * Validates that all dependencies are completed (not failed or cancelled)
   *
   * @param taskId - Task to check
   * @param graph - Dependency graph
   * @param completedTasks - Set of completed task IDs
   * @param failedTasks - Set of failed task IDs
   * @returns true if task can execute, false otherwise
   *
   * @example
   * ```typescript
   * const canExecute = handler.canExecute('task-3', graph, completed, failed);
   * // Returns: false if any dependency failed
   * ```
   */
  public canExecute(
    taskId: string,
    graph: Graph,
    completedTasks: Set<string>,
    failedTasks: Set<string>
  ): boolean {
    const dependencies = graph.predecessors(taskId) || [];

    // All dependencies must be completed (not failed)
    for (const depId of dependencies) {
      if (failedTasks.has(depId)) {
        return false; // Dependency failed
      }
      if (!completedTasks.has(depId)) {
        return false; // Dependency not completed yet
      }
    }

    return true;
  }

  /**
   * Get failure summary
   *
   * Summarizes failure impact (failed tasks and cascading cancellations)
   *
   * @param results - All execution results
   * @returns Failure summary object
   */
  public getFailureSummary(results: ExecutionResult[]): {
    failedCount: number;
    cancelledCount: number;
    failedTasks: string[];
    cancelledTasks: string[];
    totalImpact: number;
  } {
    const failed = results.filter((r) => r.status === 'failed');
    const cancelled = results.filter((r) => r.status === 'cancelled');

    return {
      failedCount: failed.length,
      cancelledCount: cancelled.length,
      failedTasks: failed.map((r) => r.taskId),
      cancelledTasks: cancelled.map((r) => r.taskId),
      totalImpact: failed.length + cancelled.length,
    };
  }
}
