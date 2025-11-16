/**
 * DAGBuilder - Constructs Directed Acyclic Graph from task dependencies
 *
 * AC-4.2: Dependency graph construction
 *
 * Article 1 (Library-First): Uses graphlib library instead of custom implementation
 */

import { Graph } from 'graphlib';
import type { Task, DAGNode } from '../types/index.js';

/**
 * Builds a Directed Acyclic Graph (DAG) from task dependencies
 *
 * AC-4.2: WHEN tasks with dependencies are provided, the system SHALL construct a dependency graph
 */
export class DAGBuilder {
  /**
   * Build a DAG from a list of tasks
   *
   * Creates nodes for each task and edges for dependencies
   *
   * @param tasks - List of tasks to build DAG from
   * @returns Graph object (from graphlib)
   *
   * @example
   * ```typescript
   * const tasks: Task[] = [
   *   { id: 't1', description: 'Task 1', dependencies: [], executor: async () => {}, status: 'pending' },
   *   { id: 't2', description: 'Task 2', dependencies: ['t1'], executor: async () => {}, status: 'pending' },
   * ];
   *
   * const builder = new DAGBuilder();
   * const graph = builder.buildDAG(tasks);
   * // Graph: t1 -> t2
   * ```
   */
  public buildDAG(tasks: Task[]): Graph {
    // Create directed graph (not multigraph)
    const graph = new Graph({ directed: true, compound: false, multigraph: false });

    // Add nodes for each task
    for (const task of tasks) {
      const node: DAGNode = {
        id: task.id,
        description: task.description,
        wave: task.wave,
      };
      graph.setNode(task.id, node);
    }

    // Add edges for dependencies
    for (const task of tasks) {
      for (const depId of task.dependencies) {
        // Validate dependency exists
        if (!graph.hasNode(depId)) {
          throw new Error(
            `Task "${task.id}" depends on non-existent task "${depId}". ` +
              `Available tasks: ${tasks.map((t) => t.id).join(', ')}`
          );
        }

        // Add edge from dependency to task
        // Edge direction: dependency -> task (predecessor -> successor)
        graph.setEdge(depId, task.id);
      }
    }

    return graph;
  }

  /**
   * Get all tasks with no dependencies (P0 candidates)
   *
   * AC-4.3: P0 tasks have no predecessors
   *
   * @param graph - Dependency graph
   * @returns Array of task IDs with no incoming edges
   *
   * @example
   * ```typescript
   * const roots = builder.getRootNodes(graph);
   * // Returns: ['t1'] (tasks with no dependencies)
   * ```
   */
  public getRootNodes(graph: Graph): string[] {
    const allNodes = graph.nodes();
    const rootNodes: string[] = [];

    for (const nodeId of allNodes) {
      const predecessors = graph.predecessors(nodeId);
      if (!predecessors || predecessors.length === 0) {
        rootNodes.push(nodeId);
      }
    }

    return rootNodes;
  }

  /**
   * Get all tasks that depend on a given task
   *
   * Used by FailureHandler to find dependent tasks to cancel
   * AC-4.8: Cancel dependent tasks when predecessor fails
   *
   * @param graph - Dependency graph
   * @param taskId - Task ID to find dependents of
   * @returns Array of task IDs that depend on the given task
   *
   * @example
   * ```typescript
   * const dependents = builder.getDependents(graph, 't1');
   * // Returns: ['t2', 't3'] (tasks that depend on t1)
   * ```
   */
  public getDependents(graph: Graph, taskId: string): string[] {
    return graph.successors(taskId) || [];
  }

  /**
   * Get all tasks that a given task depends on
   *
   * @param graph - Dependency graph
   * @param taskId - Task ID to find dependencies of
   * @returns Array of task IDs that the given task depends on
   *
   * @example
   * ```typescript
   * const dependencies = builder.getDependencies(graph, 't2');
   * // Returns: ['t1'] (tasks that t2 depends on)
   * ```
   */
  public getDependencies(graph: Graph, taskId: string): string[] {
    return graph.predecessors(taskId) || [];
  }

  /**
   * Get topological sort of tasks
   *
   * Returns tasks in an order where dependencies come before dependents
   *
   * AC-4.1: Used by PWaveLabeler to assign wave numbers
   *
   * @param graph - Dependency graph
   * @returns Array of task IDs in topological order
   * @throws Error if graph contains cycles
   *
   * @example
   * ```typescript
   * const sorted = builder.topologicalSort(graph);
   * // Returns: ['t1', 't2', 't3'] (dependencies first)
   * ```
   */
  public topologicalSort(graph: Graph): string[] {
    // graphlib.alg.topsort() throws error if cycles exist
    const alg = require('graphlib/lib/alg');
    return alg.topsort(graph);
  }
}
