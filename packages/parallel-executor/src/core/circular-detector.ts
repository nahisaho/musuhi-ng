/**
 * CircularDependencyDetector - Detects cycles in task dependency graph
 *
 * AC-4.7: Race condition prevention through circular dependency detection
 *
 * Article 1 (Library-First): Uses graphlib's findCycles algorithm
 */

import type { Graph } from 'graphlib';
import { CircularDependencyError } from '../types/index.js';

/**
 * Detects circular dependencies in task graph
 *
 * AC-4.7: IF circular dependencies exist, THEN the system SHALL prevent execution and report cycles
 */
export class CircularDependencyDetector {
  /**
   * Detect cycles in dependency graph
   *
   * @param graph - Dependency graph to check
   * @returns Array of cycles (each cycle is an array of task IDs forming a loop)
   *
   * @example
   * ```typescript
   * // Graph with cycle: t1 -> t2 -> t3 -> t1
   * const detector = new CircularDependencyDetector();
   * const cycles = detector.detectCycles(graph);
   * // Returns: [['t1', 't2', 't3', 't1']]
   * ```
   */
  public detectCycles(graph: Graph): string[][] {
    // Use graphlib's findCycles algorithm (Article 1: Library-First)
    const alg = require('graphlib/lib/alg');
    const cycles: string[][] = alg.findCycles(graph);

    return cycles;
  }

  /**
   * Check if graph has any cycles
   *
   * Convenience method for boolean check
   *
   * @param graph - Dependency graph to check
   * @returns true if cycles exist, false otherwise
   *
   * @example
   * ```typescript
   * if (detector.hasCycles(graph)) {
   *   console.error('Circular dependencies detected!');
   * }
   * ```
   */
  public hasCycles(graph: Graph): boolean {
    const cycles = this.detectCycles(graph);
    return cycles.length > 0;
  }

  /**
   * Validate graph and throw error if cycles exist
   *
   * AC-4.7: Prevent execution if circular dependencies detected
   *
   * @param graph - Dependency graph to validate
   * @throws CircularDependencyError if cycles exist
   *
   * @example
   * ```typescript
   * try {
   *   detector.validateNoCycles(graph);
   * } catch (error) {
   *   if (error instanceof CircularDependencyError) {
   *     console.error('Cycles:', error.cycles);
   *   }
   * }
   * ```
   */
  public validateNoCycles(graph: Graph): void {
    const cycles = this.detectCycles(graph);

    if (cycles.length > 0) {
      throw new CircularDependencyError(cycles);
    }
  }

  /**
   * Get detailed cycle information
   *
   * Returns cycle paths with task descriptions
   *
   * @param graph - Dependency graph
   * @param cycles - Detected cycles
   * @returns Array of cycle descriptions
   *
   * @example
   * ```typescript
   * const cycles = detector.detectCycles(graph);
   * const descriptions = detector.describeCycles(graph, cycles);
   * // Returns: ['Cycle 1: Task A -> Task B -> Task C -> Task A']
   * ```
   */
  public describeCycles(graph: Graph, cycles: string[][]): string[] {
    return cycles.map((cycle, index) => {
      const taskNames = cycle.map((taskId) => {
        const node = graph.node(taskId);
        return node?.description || taskId;
      });

      return `Cycle ${index + 1}: ${taskNames.join(' -> ')}`;
    });
  }
}
