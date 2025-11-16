/**
 * PWaveLabeler - Assigns P-wave labels to tasks based on dependency depth
 *
 * AC-4.1: P-Wave Labeling
 * - P0: Tasks with no dependencies (execute first, in parallel)
 * - P1: Tasks depending only on P0 tasks
 * - P2: Tasks depending on P1 tasks
 * - Pn: Tasks depending on P(n-1) tasks
 *
 * Article 1 (Library-First): Uses graphlib's topological sort
 */

import type { Graph } from 'graphlib';

/**
 * Assigns P-wave labels to tasks based on longest dependency path
 *
 * AC-4.1: WHEN tasks are submitted, the system SHALL assign P-wave labels (P0/P1/P2/...)
 * based on dependency depth
 */
export class PWaveLabeler {
  /**
   * Label tasks with P-wave numbers
   *
   * Algorithm:
   * 1. Topologically sort tasks (dependencies first)
   * 2. For each task:
   *    - If no predecessors: P0
   *    - Else: max(predecessor waves) + 1
   *
   * @param graph - Dependency graph with tasks as nodes
   * @returns Map of task ID to P-wave number
   *
   * @example
   * ```typescript
   * // Graph: t1 -> t2 -> t3, t4 (independent)
   * const labeler = new PWaveLabeler();
   * const waves = labeler.labelTasks(graph);
   * // Returns: Map { 't1' => 0, 't2' => 1, 't3' => 2, 't4' => 0 }
   * ```
   */
  public labelTasks(graph: Graph): Map<string, number> {
    const waves = new Map<string, number>();

    // Get topological sort (dependencies before dependents)
    const alg = require('graphlib/lib/alg');
    const sorted: string[] = alg.topsort(graph);

    // Assign wave numbers
    for (const nodeId of sorted) {
      const predecessors = graph.predecessors(nodeId) || [];

      if (predecessors.length === 0) {
        // P0: No dependencies
        waves.set(nodeId, 0);
      } else {
        // P1+: max(predecessor waves) + 1
        const predecessorWaves = predecessors.map((predId) => waves.get(predId) ?? 0);
        const maxPredWave = Math.max(...predecessorWaves);
        waves.set(nodeId, maxPredWave + 1);
      }
    }

    return waves;
  }

  /**
   * Get tasks by wave number
   *
   * Groups tasks into waves for parallel execution
   *
   * AC-4.3: P0 tasks executed in parallel
   * AC-4.4: P1 tasks executed after P0 completes
   * AC-4.5: P2+ tasks executed wave by wave
   *
   * @param waves - Wave assignments (from labelTasks)
   * @returns Map of wave number to task IDs
   *
   * @example
   * ```typescript
   * const grouped = labeler.groupByWave(waves);
   * // Returns: Map { 0 => ['t1', 't4'], 1 => ['t2'], 2 => ['t3'] }
   * ```
   */
  public groupByWave(waves: Map<string, number>): Map<number, string[]> {
    const grouped = new Map<number, string[]>();

    for (const [taskId, wave] of waves.entries()) {
      if (!grouped.has(wave)) {
        grouped.set(wave, []);
      }
      grouped.get(wave)!.push(taskId);
    }

    return grouped;
  }

  /**
   * Get maximum wave number
   *
   * Indicates total number of execution stages
   *
   * @param waves - Wave assignments
   * @returns Maximum wave number
   *
   * @example
   * ```typescript
   * const maxWave = labeler.getMaxWave(waves);
   * // Returns: 2 (waves 0, 1, 2 exist)
   * ```
   */
  public getMaxWave(waves: Map<string, number>): number {
    if (waves.size === 0) {
      return -1; // No tasks
    }
    return Math.max(...waves.values());
  }

  /**
   * Calculate expected time savings from parallel execution
   *
   * AC-4.6: Estimates time savings based on wave distribution
   *
   * Simple heuristic: if all tasks take equal time T,
   * sequential time = N * T, parallel time = (max_wave + 1) * T
   * savings = (sequential - parallel) / sequential * 100
   *
   * @param waves - Wave assignments
   * @returns Estimated time savings percentage (0-100)
   *
   * @example
   * ```typescript
   * // 10 tasks: 5 in P0, 3 in P1, 2 in P2
   * const savings = labeler.estimateTimeSavings(waves);
   * // Sequential: 10 units, Parallel: 3 units (max wave = 2)
   * // Savings: (10 - 3) / 10 * 100 = 70%
   * ```
   */
  public estimateTimeSavings(waves: Map<string, number>): number {
    if (waves.size === 0) {
      return 0;
    }

    const totalTasks = waves.size;
    const maxWave = this.getMaxWave(waves);

    // Sequential time: all tasks run one-by-one
    const sequentialTime = totalTasks;

    // Parallel time: one wave executes at a time
    const parallelTime = maxWave + 1;

    // Time savings percentage
    const savings = ((sequentialTime - parallelTime) / sequentialTime) * 100;

    return Math.max(0, Math.min(100, savings)); // Clamp to 0-100%
  }

  /**
   * Get wave statistics
   *
   * Provides summary of wave distribution
   *
   * @param waves - Wave assignments
   * @returns Wave statistics object
   *
   * @example
   * ```typescript
   * const stats = labeler.getWaveStatistics(waves);
   * // Returns: { totalTasks: 10, maxWave: 2, waveCounts: Map { 0 => 5, 1 => 3, 2 => 2 } }
   * ```
   */
  public getWaveStatistics(waves: Map<string, number>): {
    totalTasks: number;
    maxWave: number;
    waveCounts: Map<number, number>;
    estimatedSavings: number;
  } {
    const grouped = this.groupByWave(waves);
    const waveCounts = new Map<number, number>();

    for (const [wave, tasks] of grouped.entries()) {
      waveCounts.set(wave, tasks.length);
    }

    return {
      totalTasks: waves.size,
      maxWave: this.getMaxWave(waves),
      waveCounts,
      estimatedSavings: this.estimateTimeSavings(waves),
    };
  }
}
