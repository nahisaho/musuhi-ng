/**
 * DAG (Directed Acyclic Graph) type definitions
 *
 * AC-4.2: Dependency graph construction
 * AC-4.7: Circular dependency detection
 */

import type { Graph } from 'graphlib';

/**
 * DAG node representing a task
 *
 * AC-4.2: Nodes are tasks in the dependency graph
 */
export interface DAGNode {
  /**
   * Task ID (matches Task.id)
   */
  id: string;

  /**
   * Task description
   */
  description: string;

  /**
   * P-wave label (assigned by PWaveLabeler)
   *
   * AC-4.1: Determines execution order
   */
  wave?: number;
}

/**
 * DAG edge representing a dependency
 *
 * AC-4.2: Edges connect dependent tasks
 *
 * Example: { from: "task-1", to: "task-2" } means task-2 depends on task-1
 */
export interface DAGEdge {
  /**
   * Source task ID (dependency)
   */
  from: string;

  /**
   * Target task ID (dependent task)
   */
  to: string;
}

/**
 * Circular dependency error
 *
 * AC-4.7: Thrown when DAG contains cycles
 */
export class CircularDependencyError extends Error {
  /**
   * List of cycles detected
   *
   * Each cycle is an array of task IDs forming a loop
   *
   * Example: [["task-1", "task-2", "task-1"]] means task-1 -> task-2 -> task-1 (cycle)
   */
  public readonly cycles: string[][];

  constructor(cycles: string[][]) {
    const message = `Circular dependencies detected:\n${cycles
      .map((cycle, i) => `  Cycle ${i + 1}: ${cycle.join(' -> ')}`)
      .join('\n')}`;
    super(message);
    this.name = 'CircularDependencyError';
    this.cycles = cycles;
  }
}

/**
 * Re-export graphlib Graph type
 *
 * AC-4.2: Using graphlib for DAG operations
 *
 * Article 1 (Library-First): Using graphlib instead of custom implementation
 */
export type { Graph };
