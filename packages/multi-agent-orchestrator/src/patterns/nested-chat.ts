/**
 * Nested Chat Pattern
 *
 * Implements hierarchical delegation pattern.
 * Parent agents delegate to child agents, aggregating results.
 *
 * Maps to AC-3.3: Nested Chat Pattern
 * EARS: WHEN a task requires hierarchical delegation, the system SHALL manage nested agent execution
 */

import { MessageType } from '../types/message.js';
import type { Message } from '../types/message.js';
import { OrchestrationPattern, PatternExecutionStatus } from '../types/pattern.js';
import type { ConversationContext, NestedChatConfig, PatternConfig } from '../types/pattern.js';
import type { Task, TaskResult } from '../types/task.js';

import { BasePattern, type PatternExecutionResult } from './base-pattern.js';

/**
 * Nested execution context
 * Tracks the nesting hierarchy
 */
interface NestedExecutionContext {
  /** Current nesting depth (0 = root) */
  depth: number;
  /** Parent agent ID (undefined for root) */
  parentAgentId?: string;
  /** Child task results */
  childResults: TaskResult[];
}

/**
 * Nested Chat Pattern Implementation
 *
 * Executes tasks in a hierarchical manner where agents can delegate
 * subtasks to child agents. Results are aggregated up the hierarchy.
 */
export class NestedChat extends BasePattern {
  /**
   * Pattern type identifier
   */
  protected readonly patternType: OrchestrationPattern = OrchestrationPattern.NESTED;

  /**
   * Nested execution contexts (keyed by execution ID)
   */
  private nestedContexts: Map<string, NestedExecutionContext> = new Map();

  /**
   * Execute nested chat pattern
   *
   * Executes root agent and manages hierarchical delegation.
   *
   * @param task - Task to execute
   * @param context - Conversation context
   * @returns Pattern execution result
   */
  async execute(task: Task, context: ConversationContext): Promise<PatternExecutionResult> {
    const config = context.execution.config as NestedChatConfig;
    const executionContext = this.createExecutionContext(config, context.conversationId);

    try {
      // Validate configuration
      this.validateConfig(config);

      // Update status to running
      this.updateContextStatus(executionContext, PatternExecutionStatus.RUNNING);

      const messages: Message[] = [];

      // Initialize root nested context
      const nestedContext: NestedExecutionContext = {
        depth: 0,
        childResults: [],
      };

      this.nestedContexts.set(executionContext.executionId, nestedContext);

      // Execute root agent
      const rootResult = await this.executeNestedAgent(
        config.rootAgentId,
        task,
        context.conversationId,
        nestedContext,
        config,
        messages
      );

      // Mark execution as completed
      this.updateContextStatus(executionContext, PatternExecutionStatus.COMPLETED);

      // Create task result
      const taskResult: TaskResult = {
        taskId: task.id,
        success: true,
        data: {
          rootOutput: rootResult,
          nestedResults: nestedContext.childResults,
          maxDepthReached: this.getMaxDepth(nestedContext),
        },
        duration: executionContext.endTime
          ? executionContext.endTime.getTime() - executionContext.startTime.getTime()
          : 0,
        completedAt: new Date(),
        executedBy: config.rootAgentId,
      };

      // Cleanup nested contexts
      this.nestedContexts.delete(executionContext.executionId);

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
   * Validate nested chat configuration
   *
   * @param config - Pattern configuration
   * @throws Error if configuration is invalid
   */
  protected validateConfig(config: PatternConfig): void {
    const nestedConfig = config as NestedChatConfig;

    if (!nestedConfig.rootAgentId) {
      throw new Error('Root agent ID is required for nested chat pattern');
    }

    if (nestedConfig.maxDepth !== undefined && nestedConfig.maxDepth < 1) {
      throw new Error('Max depth must be at least 1');
    }
  }

  /**
   * Execute agent with nested capability
   *
   * Agent can spawn child agents to handle subtasks.
   *
   * @param agentId - Agent to execute
   * @param task - Task to execute
   * @param conversationId - Conversation ID
   * @param nestedContext - Nested execution context
   * @param config - Pattern configuration
   * @param messages - Message array to append to
   * @returns Agent's final output
   */
  private async executeNestedAgent(
    agentId: string,
    task: Task,
    conversationId: string,
    nestedContext: NestedExecutionContext,
    config: NestedChatConfig,
    messages: Message[]
  ): Promise<string> {
    // Verify agent exists
    const agent = this.capabilityRegistry.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent '${agentId}' not found in registry`);
    }

    // Check depth limit
    const maxDepth = config.maxDepth || 5;
    if (nestedContext.depth >= maxDepth) {
      throw new Error(`Maximum nesting depth (${maxDepth}) exceeded at agent '${agentId}'`);
    }

    // Create task message
    const taskMessage = this.createMessage(
      nestedContext.parentAgentId || 'system',
      agentId,
      `[Depth ${nestedContext.depth}] Task: ${task.name}\n${task.description}`,
      MessageType.TASK,
      conversationId
    );
    messages.push(taskMessage);

    // Check if task has subtasks
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    if (hasSubtasks && config.allowRecursion !== false) {
      // Execute subtasks recursively
      const subtaskResults: string[] = [];

      for (const subtask of task.subtasks) {
        // Create child nested context
        const childContext: NestedExecutionContext = {
          depth: nestedContext.depth + 1,
          parentAgentId: agentId,
          childResults: [],
        };

        // Determine which agent should handle subtask
        const childAgentId = this.selectChildAgent(subtask, agentId);

        // Execute child agent
        const childResult = await this.executeNestedAgent(
          childAgentId,
          subtask,
          conversationId,
          childContext,
          config,
          messages
        );

        subtaskResults.push(childResult);

        // Store child result
        nestedContext.childResults.push({
          taskId: subtask.id,
          success: true,
          data: childResult,
          duration: 0,
          completedAt: new Date(),
          executedBy: childAgentId,
        });
      }

      // Aggregate subtask results
      const aggregatedResult = this.aggregateResults(agentId, task, subtaskResults);

      // Create result message
      const resultMessage = this.createMessage(
        agentId,
        nestedContext.parentAgentId || 'system',
        aggregatedResult,
        MessageType.RESULT,
        conversationId
      );
      messages.push(resultMessage);

      return aggregatedResult;
    } else {
      // No subtasks - execute agent directly
      const agentResult = await this.executeAgent(agentId, task.description);

      // Create result message
      const resultMessage = this.createMessage(
        agentId,
        nestedContext.parentAgentId || 'system',
        agentResult,
        MessageType.RESULT,
        conversationId
      );
      messages.push(resultMessage);

      return agentResult;
    }
  }

  /**
   * Select child agent for subtask
   *
   * In a real implementation, this would:
   * 1. Analyze subtask requirements
   * 2. Match capabilities
   * 3. Select best agent
   *
   * @param subtask - Subtask to execute
   * @param parentAgentId - Parent agent ID
   * @returns Selected child agent ID
   */
  private selectChildAgent(subtask: Task, parentAgentId: string): string {
    // If subtask has assigned agents, use the first one
    if (subtask.assignedAgents && subtask.assignedAgents.length > 0) {
      return subtask.assignedAgents[0]!; // Safe - length check ensures element exists
    }

    // Otherwise, use parent agent (self-delegation)
    return parentAgentId;
  }

  /**
   * Aggregate results from child agents
   *
   * Combines child results into a summary for the parent.
   *
   * @param agentId - Parent agent ID
   * @param task - Parent task
   * @param childResults - Results from child agents
   * @returns Aggregated result
   */
  private aggregateResults(agentId: string, task: Task, childResults: string[]): string {
    // Use task context for aggregation strategy
    // Future: task.aggregationStrategy, task.priority for weighted aggregation
    const taskContext = task.description.substring(0, 50);

    // Placeholder implementation
    // In real implementation, parent agent would synthesize child results
    const summary = childResults.join('\n---\n');
    return `[${agentId}] Aggregated ${childResults.length} subtask results for "${taskContext}":\n${summary}`;
  }

  /**
   * Get maximum depth reached in nested execution
   */
  private getMaxDepth(context: NestedExecutionContext): number {
    let maxDepth = context.depth;

    for (const childResult of context.childResults) {
      if (childResult.data && typeof childResult.data === 'object') {
        const childData = childResult.data as Record<string, unknown>;
        if (typeof childData.maxDepthReached === 'number') {
          maxDepth = Math.max(maxDepth, childData.maxDepthReached);
        }
      }
    }

    return maxDepth;
  }

  /**
   * Execute an agent with the given input
   *
   * @param agentId - Agent ID
   * @param input - Input for the agent
   * @returns Agent's output
   */
  private async executeAgent(agentId: string, input: string): Promise<string> {
    // Placeholder implementation
    await this.wait(10);
    return `[${agentId}] Processed: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"`;
  }
}
