/**
 * ConcurrentExecutor - Executes tasks in P-wave order with parallelism
 *
 * AC-4.3: P0 Execution (no dependencies, parallel)
 * AC-4.4: P1 Execution (depends on P0, parallel within wave)
 * AC-4.5: P2+ Execution (depends on previous wave, parallel within wave)
 *
 * Article 2 (Test-First): Designed for testability with dependency injection
 */

import type { Graph } from 'graphlib';
import type { Task, ExecutionResult } from '../types/index.js';

/**
 * Executes tasks in P-wave order with parallelism
 *
 * AC-4.3: WHEN P0 tasks are identified, the system SHALL execute them in parallel
 * AC-4.4: WHEN P0 completes, the system SHALL execute P1 tasks in parallel
 * AC-4.5: WHEN each wave completes, the system SHALL execute the next wave
 */
export class ConcurrentExecutor {
  /**
   * Execute tasks in P-wave order
   *
   * @param tasks - All tasks to execute
   * @param waves - P-wave assignments (from PWaveLabeler)
   * @param graph - Dependency graph (for validation)
   * @returns Array of execution results
   *
   * @example
   * ```typescript
   * const executor = new ConcurrentExecutor();
   * const results = await executor.executeWaves(tasks, waves, graph);
   * // Executes P0 tasks in parallel, then P1, then P2, etc.
   * ```
   */
  public async executeWaves(
    tasks: Task[],
    waves: Map<string, number>,
    _graph: Graph
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    const maxWave = Math.max(...waves.values());

    // Execute wave by wave
    for (let wave = 0; wave <= maxWave; wave++) {
      const waveTasks = tasks.filter((t) => waves.get(t.id) === wave);

      // AC-4.3, AC-4.4, AC-4.5: Execute wave concurrently
      const waveResults = await this.executeWave(waveTasks, wave);
      results.push(...waveResults);

      // Check for failures
      const failedTasks = waveResults.filter((r) => r.status === 'failed');
      if (failedTasks.length > 0) {
        // Note: Failure handling is delegated to FailureHandler
        // We just report the failure here
        break; // Stop execution on first wave failure
      }
    }

    return results;
  }

  /**
   * Execute tasks concurrently (public API for single wave execution)
   *
   * Used by ParallelExecutor for wave-by-wave execution
   *
   * @param waveTasks - Tasks to execute in parallel
   * @returns Array of execution results
   */
  public async executeConcurrent(waveTasks: Task[]): Promise<ExecutionResult[]> {
    return this.executeWave(waveTasks, 0);
  }

  /**
   * Execute all tasks in a single wave concurrently
   *
   * AC-4.3, AC-4.4, AC-4.5: Parallel execution within wave
   *
   * @param waveTasks - Tasks in this wave
   * @param waveNumber - Wave number (for logging/tracking)
   * @returns Array of execution results
   */
  private async executeWave(waveTasks: Task[], _waveNumber: number): Promise<ExecutionResult[]> {
    // Execute all tasks in parallel using Promise.all
    const promises = waveTasks.map((task) => this.executeTask(task));

    // Wait for all tasks to complete
    const results = await Promise.all(promises);

    return results;
  }

  /**
   * Execute a single task
   *
   * Measures execution time and handles errors
   *
   * @param task - Task to execute
   * @returns Execution result
   */
  private async executeTask(task: Task): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Update task status
      task.status = 'running';

      // Execute task
      const output = await task.executor();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Update task status
      task.status = 'completed';

      return {
        taskId: task.id,
        status: 'completed',
        duration,
        output,
        startTime,
        endTime,
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Update task status
      task.status = 'failed';

      return {
        taskId: task.id,
        status: 'failed',
        duration,
        error: error instanceof Error ? error : new Error(String(error)),
        startTime,
        endTime,
      };
    }
  }

  /**
   * Execute tasks with dependency checking
   *
   * More sophisticated version that validates dependencies before execution
   *
   * @param tasks - All tasks
   * @param waves - P-wave assignments
   * @param graph - Dependency graph
   * @param completedTasks - Set of completed task IDs
   * @returns Execution results
   */
  public async executeWithDependencyCheck(
    tasks: Task[],
    waves: Map<string, number>,
    graph: Graph,
    completedTasks: Set<string> = new Set()
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    const maxWave = Math.max(...waves.values());

    for (let wave = 0; wave <= maxWave; wave++) {
      const waveTasks = tasks.filter((t) => waves.get(t.id) === wave);

      // Validate dependencies are met
      for (const task of waveTasks) {
        const dependencies = graph.predecessors(task.id) || [];
        const allDependenciesMet = dependencies.every((depId) => completedTasks.has(depId));

        if (!allDependenciesMet) {
          const missingDeps = dependencies.filter((depId) => !completedTasks.has(depId));
          throw new Error(
            `Task "${task.id}" cannot execute: missing dependencies [${missingDeps.join(', ')}]`
          );
        }
      }

      // Execute wave
      const waveResults = await this.executeWave(waveTasks, wave);
      results.push(...waveResults);

      // Update completed tasks
      for (const result of waveResults) {
        if (result.status === 'completed') {
          completedTasks.add(result.taskId);
        }
      }

      // Check for failures
      const failedTasks = waveResults.filter((r) => r.status === 'failed');
      if (failedTasks.length > 0) {
        break;
      }
    }

    return results;
  }

  /**
   * Execute tasks with custom concurrency limit
   *
   * Limits number of concurrent tasks (useful for resource-constrained environments)
   *
   * @param tasks - Tasks to execute
   * @param concurrencyLimit - Maximum number of concurrent tasks
   * @returns Execution results
   */
  public async executeWithLimit(tasks: Task[], concurrencyLimit: number): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    const executing: Promise<ExecutionResult>[] = [];

    for (const task of tasks) {
      // Create execution promise
      const promise = this.executeTask(task).then((result) => {
        // Remove from executing list when done
        executing.splice(executing.indexOf(promise), 1);
        return result;
      });

      executing.push(promise);

      // Wait if limit reached
      if (executing.length >= concurrencyLimit) {
        const result = await Promise.race(executing);
        results.push(result);
      }
    }

    // Wait for remaining tasks
    const remainingResults = await Promise.all(executing);
    results.push(...remainingResults);

    return results;
  }
}
