/**
 * Parallel Task Executor - P-wave labeling and parallel execution engine
 *
 * @packageDocumentation
 *
 * This package implements Feature 4 (Parallel Task Execution) of MUSUHI 2.0:
 *
 * - AC-4.1: P-Wave Labeling (P0/P1/P2 assignment)
 * - AC-4.2: Dependency Graph (DAG construction)
 * - AC-4.3: P0 Execution (parallel execution of tasks with no dependencies)
 * - AC-4.4: P1 Execution (parallel execution after P0 completes)
 * - AC-4.5: P2+ Execution (wave-by-wave execution)
 * - AC-4.6: Time Savings Measurement (50%+ time reduction)
 * - AC-4.7: Race Condition Prevention (circular dependency detection)
 * - AC-4.8: Failure Handling (cancel dependent tasks on failure)
 * - AC-4.9: Progress Monitoring (real-time progress tracking)
 *
 * ## Example Usage
 *
 * ```typescript
 * import { ParallelExecutor, Task } from '@musuhi/parallel-executor';
 *
 * const tasks: Task[] = [
 *   {
 *     id: 'task-1',
 *     description: 'Initialize database',
 *     dependencies: [],
 *     executor: async () => { ... },
 *     status: 'pending'
 *   },
 *   {
 *     id: 'task-2',
 *     description: 'Load configuration',
 *     dependencies: [],
 *     executor: async () => { ... },
 *     status: 'pending'
 *   },
 *   {
 *     id: 'task-3',
 *     description: 'Start server',
 *     dependencies: ['task-1', 'task-2'],
 *     executor: async () => { ... },
 *     status: 'pending'
 *   }
 * ];
 *
 * const executor = new ParallelExecutor();
 * const result = await executor.execute(tasks, (event) => {
 *   console.log('Progress:', event.progress);
 * });
 *
 * console.log(`Time savings: ${result.metrics.timeSavings}%`);
 * console.log(`Success: ${result.success}`);
 * ```
 */

// Main executor
export { ParallelExecutor } from './parallel-executor.js';
export type { ParallelExecutorOptions } from './parallel-executor.js';

// Core components
export { DAGBuilder } from './core/dag-builder.js';
export { CircularDependencyDetector } from './core/circular-detector.js';
export { PWaveLabeler } from './core/p-wave-labeler.js';
export { DependencyAnalyzer } from './core/dependency-analyzer.js';

// Execution components
export { ConcurrentExecutor } from './execution/concurrent-executor.js';
export { FailureHandler } from './execution/failure-handler.js';
export { ProgressTracker } from './execution/progress-tracker.js';
export { TimeMetricsCollector } from './execution/time-metrics.js';

// Types
export type {
  Task,
  TaskStatus,
  TaskExecutor,
  ExecutionResult,
  ProgressSnapshot,
  TimeMetrics,
  ParallelExecutionResult,
  ProgressEvent,
  DAGNode,
  DAGEdge,
  Graph,
} from './types/index.js';

export { CircularDependencyError } from './types/index.js';
