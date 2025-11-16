/**
 * DependencyAnalyzer - Analyzes task dependency patterns
 *
 * Helper class for dependency graph analysis
 */

import type { Graph } from 'graphlib';
import type { Task } from '../types/index.js';

/**
 * Analyzes task dependencies and graph structure
 */
export class DependencyAnalyzer {
  /**
   * Validate that all task dependencies exist
   *
   * Ensures no task references non-existent dependencies
   *
   * @param tasks - List of tasks to validate
   * @throws Error if invalid dependencies found
   *
   * @example
   * ```typescript
   * const analyzer = new DependencyAnalyzer();
   * analyzer.validateDependencies(tasks);
   * // Throws if task depends on non-existent task
   * ```
   */
  public validateDependencies(tasks: Task[]): void {
    const taskIds = new Set(tasks.map((t) => t.id));

    for (const task of tasks) {
      for (const depId of task.dependencies) {
        if (!taskIds.has(depId)) {
          throw new Error(
            `Task "${task.id}" depends on non-existent task "${depId}". ` +
              `Available tasks: ${Array.from(taskIds).join(', ')}`
          );
        }
      }
    }
  }

  /**
   * Check for duplicate task IDs
   *
   * @param tasks - List of tasks to check
   * @throws Error if duplicate IDs found
   */
  public validateUniqueIds(tasks: Task[]): void {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const task of tasks) {
      if (seen.has(task.id)) {
        duplicates.push(task.id);
      }
      seen.add(task.id);
    }

    if (duplicates.length > 0) {
      throw new Error(`Duplicate task IDs found: ${duplicates.join(', ')}`);
    }
  }

  /**
   * Get critical path (longest dependency chain)
   *
   * The critical path determines minimum execution time
   *
   * @param graph - Dependency graph
   * @param waves - P-wave assignments
   * @returns Array of task IDs forming the critical path
   *
   * @example
   * ```typescript
   * const criticalPath = analyzer.getCriticalPath(graph, waves);
   * // Returns: ['t1', 't2', 't3'] (longest chain)
   * ```
   */
  public getCriticalPath(graph: Graph, waves: Map<string, number>): string[] {
    // Find task(s) with maximum wave number
    const maxWave = Math.max(...waves.values());
    const endTasks = Array.from(waves.entries())
      .filter(([_, wave]) => wave === maxWave)
      .map(([id, _]) => id);

    // Trace back from end task to root
    // For simplicity, pick first end task
    const endTask = endTasks[0];
    const path: string[] = [];

    let current: string | undefined = endTask;
    while (current) {
      path.unshift(current);
      const predecessors = graph.predecessors(current) || [];

      if (predecessors.length === 0) {
        break; // Reached root
      }

      // Pick predecessor with highest wave
      current = predecessors.reduce((max: string | undefined, pred) => {
        if (!max) return pred;
        const maxWave = waves.get(max) ?? -1;
        const predWave = waves.get(pred) ?? -1;
        return predWave > maxWave ? pred : max;
      }, predecessors[0] as string | undefined);
    }

    return path;
  }

  /**
   * Calculate parallelism factor
   *
   * Average number of tasks that can run in parallel
   *
   * @param waves - P-wave assignments
   * @returns Parallelism factor (1.0 = fully sequential, higher = more parallelism)
   *
   * @example
   * ```typescript
   * const factor = analyzer.getParallelismFactor(waves);
   * // Returns: 2.5 (average 2.5 tasks per wave)
   * ```
   */
  public getParallelismFactor(waves: Map<string, number>): number {
    if (waves.size === 0) {
      return 0;
    }

    const maxWave = Math.max(...waves.values());
    const numWaves = maxWave + 1;

    return waves.size / numWaves;
  }

  /**
   * Get dependency depth for each task
   *
   * Depth = length of longest path from root to task
   *
   * @param graph - Dependency graph
   * @returns Map of task ID to depth
   */
  public getDependencyDepths(graph: Graph): Map<string, number> {
    const depths = new Map<string, number>();

    // Topological sort ensures we process dependencies first
    const alg = require('graphlib/lib/alg');
    const sorted: string[] = alg.topsort(graph);

    for (const nodeId of sorted) {
      const predecessors = graph.predecessors(nodeId) || [];

      if (predecessors.length === 0) {
        depths.set(nodeId, 0);
      } else {
        const predDepths = predecessors.map((pred) => depths.get(pred) ?? 0);
        depths.set(nodeId, Math.max(...predDepths) + 1);
      }
    }

    return depths;
  }
}
