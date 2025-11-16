/**
 * ParallelExecutor - Main orchestrator for parallel task execution
 *
 * Integrates all components:
 * - DAGBuilder (AC-4.2)
 * - CircularDependencyDetector (AC-4.7)
 * - PWaveLabeler (AC-4.1)
 * - ConcurrentExecutor (AC-4.3, AC-4.4, AC-4.5)
 * - FailureHandler (AC-4.8)
 * - ProgressTracker (AC-4.9)
 * - TimeMetricsCollector (AC-4.6)
 *
 * Article 1 (Library-First): Uses graphlib for DAG operations
 * Article 2 (Test-First): Designed with dependency injection for testability
 */

import { DAGBuilder } from './core/dag-builder.js';
import { CircularDependencyDetector } from './core/circular-detector.js';
import { PWaveLabeler } from './core/p-wave-labeler.js';
import { DependencyAnalyzer } from './core/dependency-analyzer.js';
import { ConcurrentExecutor } from './execution/concurrent-executor.js';
import { FailureHandler } from './execution/failure-handler.js';
import { ProgressTracker } from './execution/progress-tracker.js';
import { TimeMetricsCollector } from './execution/time-metrics.js';

import type {
  Task,
  ParallelExecutionResult,
  ExecutionResult,
  ProgressEvent,
} from './types/index.js';

/**
 * Configuration options for ParallelExecutor
 */
export interface ParallelExecutorOptions {
  /**
   * Whether to stop execution on first failure
   *
   * Default: true (stop on failure)
   */
  stopOnFailure?: boolean;

  /**
   * Maximum number of concurrent tasks
   *
   * Default: unlimited (all tasks in wave run concurrently)
   */
  concurrencyLimit?: number;

  /**
   * Whether to track progress events
   *
   * Default: true
   */
  trackProgress?: boolean;
}

/**
 * Main parallel execution orchestrator
 *
 * Coordinates all components to execute tasks in P-wave order with parallelism
 *
 * @example
 * ```typescript
 * const executor = new ParallelExecutor();
 *
 * const tasks: Task[] = [
 *   { id: 't1', description: 'Task 1', dependencies: [], executor: async () => {...}, status: 'pending' },
 *   { id: 't2', description: 'Task 2', dependencies: ['t1'], executor: async () => {...}, status: 'pending' },
 * ];
 *
 * const result = await executor.execute(tasks);
 * console.log(`Time savings: ${result.metrics.timeSavings}%`);
 * ```
 */
export class ParallelExecutor {
  private dagBuilder: DAGBuilder;
  private circularDetector: CircularDependencyDetector;
  private pWaveLabeler: PWaveLabeler;
  private dependencyAnalyzer: DependencyAnalyzer;
  private concurrentExecutor: ConcurrentExecutor;
  private failureHandler: FailureHandler;
  private timeMetrics: TimeMetricsCollector;
  private options: Required<ParallelExecutorOptions>;

  constructor(options: ParallelExecutorOptions = {}) {
    this.dagBuilder = new DAGBuilder();
    this.circularDetector = new CircularDependencyDetector();
    this.pWaveLabeler = new PWaveLabeler();
    this.dependencyAnalyzer = new DependencyAnalyzer();
    this.concurrentExecutor = new ConcurrentExecutor();
    this.failureHandler = new FailureHandler();
    this.timeMetrics = new TimeMetricsCollector();

    this.options = {
      stopOnFailure: options.stopOnFailure ?? true,
      concurrencyLimit: options.concurrencyLimit ?? Infinity,
      trackProgress: options.trackProgress ?? true,
    };
  }

  /**
   * Execute tasks in parallel with P-wave ordering
   *
   * Main entry point for parallel execution
   *
   * @param tasks - Tasks to execute
   * @param onProgress - Optional progress callback
   * @returns Execution result with metrics
   *
   * @throws CircularDependencyError if cycles detected
   * @throws Error if invalid dependencies
   */
  public async execute(
    tasks: Task[],
    onProgress?: (event: ProgressEvent) => void
  ): Promise<ParallelExecutionResult> {
    // Start routing overhead tracking
    this.timeMetrics.markRoutingStart();

    // Validation
    this.validateTasks(tasks);

    // Build DAG
    const graph = this.dagBuilder.buildDAG(tasks);

    // Detect cycles
    this.circularDetector.validateNoCycles(graph);

    // Label P-waves
    const waves = this.pWaveLabeler.labelTasks(graph);

    // Update task wave labels
    for (const [taskId, wave] of waves.entries()) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        task.wave = wave;
      }
    }

    // End routing overhead tracking
    this.timeMetrics.markRoutingEnd();

    // Setup progress tracker
    const progressTracker = new ProgressTracker(tasks);
    if (this.options.trackProgress && onProgress) {
      progressTracker.subscribe(onProgress);
    }

    // Start execution timing
    this.timeMetrics.markExecutionStart();

    // Execute tasks wave by wave
    const results = await this.executeWaves(tasks, waves, graph, progressTracker);

    // End execution timing
    this.timeMetrics.markExecutionEnd();

    // Calculate metrics
    const metrics = this.timeMetrics.calculate(tasks, waves, results);

    // Get final progress
    const progress = progressTracker.getSnapshot();

    // Determine success
    const failedTasks = results.filter((r) => r.status === 'failed').map((r) => r.taskId);
    const cancelledTasks = results.filter((r) => r.status === 'cancelled').map((r) => r.taskId);
    const success = failedTasks.length === 0 && cancelledTasks.length === 0;

    return {
      results,
      waves,
      metrics,
      progress,
      success,
      failedTasks,
      cancelledTasks,
    };
  }

  /**
   * Execute tasks wave by wave
   *
   * Internal method that coordinates execution across waves
   */
  private async executeWaves(
    tasks: Task[],
    waves: Map<string, number>,
    graph: import('graphlib').Graph,
    progressTracker: ProgressTracker
  ): Promise<ExecutionResult[]> {
    const allResults: ExecutionResult[] = [];
    const maxWave = this.pWaveLabeler.getMaxWave(waves);

    for (let wave = 0; wave <= maxWave; wave++) {
      // Notify wave start
      progressTracker.notifyWaveStart(wave);

      // Get tasks for this wave
      const waveTasks = tasks.filter((t) => waves.get(t.id) === wave);

      // Execute wave
      const waveResults = await this.executeWave(waveTasks, progressTracker);
      allResults.push(...waveResults);

      // Notify wave complete
      progressTracker.notifyWaveComplete(wave);

      // Handle failures
      const failures = waveResults.filter((r) => r.status === 'failed');
      if (failures.length > 0) {
        if (this.options.stopOnFailure) {
          // Cancel dependent tasks
          const failedTaskIds = failures.map((r) => r.taskId);
          const cancelledIds = this.failureHandler.cancelDependentTasks(
            failedTaskIds,
            tasks,
            graph
          );
          const cancelledResults = this.failureHandler.createCancelledResults(cancelledIds, tasks);

          // Notify cancellations
          for (const result of cancelledResults) {
            progressTracker.notifyTaskCancel(result.taskId);
          }

          allResults.push(...cancelledResults);
          break; // Stop execution
        }
      }
    }

    return allResults;
  }

  /**
   * Execute a single wave
   */
  private async executeWave(
    waveTasks: Task[],
    progressTracker: ProgressTracker
  ): Promise<ExecutionResult[]> {
    // Notify task starts
    for (const task of waveTasks) {
      progressTracker.notifyTaskStart(task.id);
    }

    // Execute tasks in parallel
    // Note: We don't need to rebuild the DAG here - it's already validated in execute()
    // All tasks in a wave can run concurrently since dependencies are satisfied
    const results = await this.concurrentExecutor.executeConcurrent(waveTasks);

    // Notify completions/failures
    for (const result of results) {
      if (result.status === 'completed') {
        progressTracker.notifyTaskComplete(result.taskId);
      } else if (result.status === 'failed') {
        progressTracker.notifyTaskFail(result.taskId);
      }
    }

    return results;
  }

  /**
   * Validate tasks before execution
   */
  private validateTasks(tasks: Task[]): void {
    if (tasks.length === 0) {
      throw new Error('No tasks provided');
    }

    this.dependencyAnalyzer.validateUniqueIds(tasks);
    this.dependencyAnalyzer.validateDependencies(tasks);
  }

  /**
   * Get wave statistics
   *
   * Provides summary of P-wave distribution
   *
   * @param tasks - Tasks to analyze
   * @returns Wave statistics
   */
  public getWaveStatistics(tasks: Task[]): {
    totalTasks: number;
    maxWave: number;
    waveCounts: Map<number, number>;
    estimatedSavings: number;
  } {
    const graph = this.dagBuilder.buildDAG(tasks);
    this.circularDetector.validateNoCycles(graph);
    const waves = this.pWaveLabeler.labelTasks(graph);
    return this.pWaveLabeler.getWaveStatistics(waves);
  }

  /**
   * Get critical path
   *
   * Returns longest dependency chain
   *
   * @param tasks - Tasks to analyze
   * @returns Critical path (array of task IDs)
   */
  public getCriticalPath(tasks: Task[]): string[] {
    const graph = this.dagBuilder.buildDAG(tasks);
    const waves = this.pWaveLabeler.labelTasks(graph);
    return this.dependencyAnalyzer.getCriticalPath(graph, waves);
  }
}
