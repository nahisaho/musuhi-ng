/**
 * Hierarchical Pattern
 *
 * Implements parent-child agent command chain.
 * Managers delegate to subordinates in an organizational hierarchy.
 *
 * Maps to Multi-Agent Orchestration requirements
 * EARS: WHEN a task requires hierarchical command chain, the system SHALL manage parent-child delegation
 */

import { MessageType } from '../types/message.js';
import type { Message } from '../types/message.js';
import { OrchestrationPattern, PatternExecutionStatus } from '../types/pattern.js';
import type {
  ConversationContext,
  HierarchicalPatternConfig,
  PatternConfig,
} from '../types/pattern.js';
import type { Task, TaskResult } from '../types/task.js';

import { BasePattern, type PatternExecutionResult } from './base-pattern.js';

/**
 * Hierarchical execution node
 */
interface HierarchicalNode {
  /** Agent ID */
  agentId: string;
  /** Depth in hierarchy (0 = root) */
  depth: number;
  /** Parent agent ID */
  parentId?: string;
  /** Child agent IDs */
  childIds: string[];
  /** Execution result */
  result?: string;
}

/**
 * Hierarchical Pattern Implementation
 *
 * Executes tasks in a command chain hierarchy where managers delegate
 * to subordinates and aggregate results back up the chain.
 */
export class HierarchicalPattern extends BasePattern {
  /**
   * Pattern type identifier
   */
  protected readonly patternType: OrchestrationPattern = OrchestrationPattern.HIERARCHICAL;

  /**
   * Execute hierarchical pattern
   *
   * Executes agents in parent-child hierarchy with result aggregation.
   *
   * @param task - Task to execute
   * @param context - Conversation context
   * @returns Pattern execution result
   */
  async execute(task: Task, context: ConversationContext): Promise<PatternExecutionResult> {
    const config = context.execution.config as HierarchicalPatternConfig;
    const executionContext = this.createExecutionContext(config, context.conversationId);

    try {
      // Validate configuration
      this.validateConfig(config);

      // Update status to running
      this.updateContextStatus(executionContext, PatternExecutionStatus.RUNNING);

      const messages: Message[] = [];

      // Build hierarchy tree
      const hierarchyTree = this.buildHierarchyTree(config);

      // Validate hierarchy depth
      const maxDepth = this.getMaxDepth(hierarchyTree);
      if (config.maxDepth && maxDepth > config.maxDepth) {
        throw new Error(`Hierarchy depth (${maxDepth}) exceeds maximum (${config.maxDepth})`);
      }

      this.updateContextStep(executionContext, 0, hierarchyTree.length);

      // Execute hierarchy top-down
      const rootNode = hierarchyTree[0]!; // Safe - buildHierarchy ensures root exists
      await this.executeHierarchyNode(
        rootNode,
        task,
        hierarchyTree,
        context.conversationId,
        messages
      );

      // Mark execution as completed
      this.updateContextStatus(executionContext, PatternExecutionStatus.COMPLETED);

      // Create task result
      const taskResult: TaskResult = {
        taskId: task.id,
        success: true,
        data: {
          hierarchyResult: rootNode.result,
          hierarchyDepth: maxDepth,
          nodesExecuted: hierarchyTree.length,
        },
        duration: executionContext.endTime
          ? executionContext.endTime.getTime() - executionContext.startTime.getTime()
          : 0,
        completedAt: new Date(),
        executedBy: config.rootAgentId,
      };

      return {
        success: true,
        result: taskResult,
        messages,
        context: executionContext,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return this.handleExecutionError(err, executionContext, context.conversationId);
    }
  }

  /**
   * Validate hierarchical pattern configuration
   *
   * @param config - Pattern configuration
   * @throws Error if configuration is invalid
   */
  protected validateConfig(config: PatternConfig): void {
    const hierConfig = config as HierarchicalPatternConfig;

    if (!hierConfig.rootAgentId) {
      throw new Error('Root agent ID is required for hierarchical pattern');
    }

    if (!hierConfig.agentHierarchy) {
      throw new Error('Agent hierarchy is required for hierarchical pattern');
    }

    if (typeof hierConfig.agentHierarchy !== 'object') {
      throw new Error('Agent hierarchy must be an object');
    }

    // Validate root agent exists in hierarchy
    if (!hierConfig.agentHierarchy[hierConfig.rootAgentId]) {
      // Root can have no children (edge case)
      hierConfig.agentHierarchy[hierConfig.rootAgentId] = [];
    }

    if (hierConfig.maxDepth !== undefined && hierConfig.maxDepth < 1) {
      throw new Error('Max depth must be at least 1');
    }
  }

  /**
   * Build hierarchy tree from configuration
   *
   * @param config - Hierarchical pattern configuration
   * @returns Hierarchy nodes in breadth-first order
   */
  private buildHierarchyTree(config: HierarchicalPatternConfig): HierarchicalNode[] {
    const nodes: HierarchicalNode[] = [];
    const visited = new Set<string>();

    // BFS to build tree
    const queue: Array<{ agentId: string; depth: number; parentId?: string }> = [
      { agentId: config.rootAgentId, depth: 0 },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Prevent cycles
      if (visited.has(current.agentId)) {
        throw new Error(`Cycle detected in hierarchy at agent '${current.agentId}'`);
      }

      visited.add(current.agentId);

      const childIds = config.agentHierarchy[current.agentId] || [];

      const node: HierarchicalNode = {
        agentId: current.agentId,
        depth: current.depth,
        parentId: current.parentId,
        childIds,
      };

      nodes.push(node);

      // Add children to queue
      for (const childId of childIds) {
        queue.push({
          agentId: childId,
          depth: current.depth + 1,
          parentId: current.agentId,
        });
      }
    }

    return nodes;
  }

  /**
   * Get maximum depth of hierarchy
   */
  private getMaxDepth(nodes: HierarchicalNode[]): number {
    return Math.max(...nodes.map((n) => n.depth));
  }

  /**
   * Execute hierarchy node (agent)
   *
   * Recursively executes node and its children, aggregating results.
   *
   * @param node - Current node to execute
   * @param task - Task to execute
   * @param allNodes - All hierarchy nodes
   * @param conversationId - Conversation ID
   * @param messages - Message array
   * @returns Node's aggregated result
   */
  private async executeHierarchyNode(
    node: HierarchicalNode,
    task: Task,
    allNodes: HierarchicalNode[],
    conversationId: string,
    messages: Message[]
  ): Promise<string> {
    // Verify agent exists
    const agent = this.capabilityRegistry.getAgent(node.agentId);
    if (!agent) {
      throw new Error(`Agent '${node.agentId}' not found in registry`);
    }

    // Create task message
    const taskMessage = this.createMessage(
      node.parentId || 'system',
      node.agentId,
      `[Level ${node.depth}] ${task.description}`,
      MessageType.TASK,
      conversationId
    );
    messages.push(taskMessage);

    // If node has children, delegate to them first
    const childResults: string[] = [];

    if (node.childIds.length > 0) {
      for (const childId of node.childIds) {
        const childNode = allNodes.find((n) => n.agentId === childId);
        if (!childNode) {
          continue;
        }

        const childResult = await this.executeHierarchyNode(
          childNode,
          task,
          allNodes,
          conversationId,
          messages
        );

        childResults.push(childResult);
      }
    }

    // Execute current agent (manager synthesizes child results)
    const agentResult = await this.executeAgent(node.agentId, task.description, childResults);

    // Create result message
    const resultMessage = this.createMessage(
      node.agentId,
      node.parentId || 'system',
      agentResult,
      MessageType.RESULT,
      conversationId
    );
    messages.push(resultMessage);

    // Store result in node
    node.result = agentResult;

    return agentResult;
  }

  /**
   * Execute agent with optional child results
   *
   * @param agentId - Agent ID
   * @param taskDescription - Task description
   * @param childResults - Results from subordinate agents
   * @returns Agent's output
   */
  private async executeAgent(
    agentId: string,
    taskDescription: string,
    childResults: string[] = []
  ): Promise<string> {
    // Placeholder implementation
    await this.wait(10);

    if (childResults.length > 0) {
      // Manager aggregates child results
      const summary = childResults.join('\n  - ');
      return `[${agentId}] Managed ${childResults.length} subordinates:\n  - ${summary}`;
    } else {
      // Leaf node executes task directly
      return `[${agentId}] Executed: "${taskDescription.substring(0, 40)}${taskDescription.length > 40 ? '...' : ''}"`;
    }
  }
}
