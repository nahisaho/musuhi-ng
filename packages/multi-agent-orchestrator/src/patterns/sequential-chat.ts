/**
 * Sequential Chat Pattern
 *
 * Implements linear agent handoff pattern (A → B → C).
 * Each agent processes the previous agent's output.
 *
 * Maps to AC-3.1: Sequential Chat Pattern
 * EARS: WHEN a task requires linear agent handoff, the system SHALL execute agents sequentially
 */

import { MessageType } from '../types/message.js';
import type { Message } from '../types/message.js';
import { OrchestrationPattern, PatternExecutionStatus } from '../types/pattern.js';
import type { ConversationContext, SequentialChatConfig, PatternConfig } from '../types/pattern.js';
import type { Task, TaskResult } from '../types/task.js';

import { BasePattern, type PatternExecutionResult } from './base-pattern.js';

/**
 * Sequential Chat Pattern Implementation
 *
 * Executes agents in a linear sequence (A → B → C).
 * Each agent receives the output of the previous agent.
 */
export class SequentialChat extends BasePattern {
  /**
   * Pattern type identifier
   */
  protected readonly patternType: OrchestrationPattern = OrchestrationPattern.SEQUENTIAL;

  /**
   * Execute sequential chat pattern
   *
   * Executes agents in the specified sequence, passing output from each agent
   * to the next agent in the chain.
   *
   * @param task - Task to execute
   * @param context - Conversation context
   * @returns Pattern execution result
   */
  async execute(task: Task, context: ConversationContext): Promise<PatternExecutionResult> {
    const config = context.execution.config as SequentialChatConfig;
    const executionContext = this.createExecutionContext(config, context.conversationId);

    try {
      // Validate configuration
      this.validateConfig(config);

      // Update status to running
      this.updateContextStatus(executionContext, PatternExecutionStatus.RUNNING);

      const messages: Message[] = [];
      const agentSequence = config.agentSequence;
      const totalSteps = agentSequence.length;

      this.updateContextStep(executionContext, 0, totalSteps);

      let previousOutput: string = task.description;

      // Execute agents sequentially
      for (let i = 0; i < agentSequence.length; i++) {
        const agentId = agentSequence[i]!; // Safe - i is within loop bounds
        this.updateContextStep(executionContext, i + 1, totalSteps);

        try {
          // Verify agent exists
          const agent = this.capabilityRegistry.getAgent(agentId);
          if (!agent) {
            throw new Error(`Agent '${agentId}' not found in registry`);
          }

          // Create task message for agent
          const taskMessage = this.createMessage(
            'system',
            agentId,
            `Task: ${task.name}\n\nInput: ${previousOutput}`,
            MessageType.TASK,
            context.conversationId
          );
          messages.push(taskMessage);

          // Simulate agent execution (in real implementation, this would call the actual agent)
          const agentResult = await this.executeAgent(agentId, previousOutput, config.stepTimeout);

          // Create result message from agent
          const resultMessage = this.createMessage(
            agentId,
            'system',
            agentResult,
            MessageType.RESULT,
            context.conversationId
          );
          messages.push(resultMessage);

          // Update previous output for next agent
          previousOutput = agentResult;
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));

          // Create error message
          const errorMessage = this.createErrorMessage(agentId, err, context.conversationId);
          messages.push(errorMessage);

          // Stop on error if configured
          if (config.stopOnError !== false) {
            throw new Error(
              `Agent '${agentId}' failed at step ${i + 1}/${totalSteps}: ${err.message}`
            );
          }

          // Continue with error message as input for next agent
          previousOutput = `Error from previous agent: ${err.message}`;
        }
      }

      // Mark execution as completed
      this.updateContextStatus(executionContext, PatternExecutionStatus.COMPLETED);

      // Create task result
      const taskResult: TaskResult = {
        taskId: task.id,
        success: true,
        data: previousOutput,
        duration: executionContext.endTime
          ? executionContext.endTime.getTime() - executionContext.startTime.getTime()
          : 0,
        completedAt: new Date(),
        executedBy: agentSequence[agentSequence.length - 1]!, // Safe - agentSequence validated as non-empty
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
   * Validate sequential chat configuration
   *
   * @param config - Pattern configuration
   * @throws Error if configuration is invalid
   */
  protected validateConfig(config: PatternConfig): void {
    const seqConfig = config as SequentialChatConfig;

    if (!seqConfig.agentSequence) {
      throw new Error('Agent sequence is required for sequential chat pattern');
    }

    if (!Array.isArray(seqConfig.agentSequence)) {
      throw new Error('Agent sequence must be an array');
    }

    if (seqConfig.agentSequence.length === 0) {
      throw new Error('Agent sequence cannot be empty');
    }
  }

  /**
   * Execute an agent with the given input
   *
   * This is a placeholder for actual agent execution.
   * In a real implementation, this would:
   * 1. Call the agent's LLM with the input
   * 2. Execute any tool calls the agent makes
   * 3. Return the agent's final response
   *
   * @param agentId - Agent ID
   * @param input - Input for the agent
   * @param timeout - Optional timeout in milliseconds
   * @returns Agent's output
   */
  private async executeAgent(agentId: string, input: string, timeout?: number): Promise<string> {
    // Placeholder implementation
    // In real implementation, this would invoke the agent's LLM
    const execution = async (): Promise<string> => {
      // Simulate agent processing
      await this.wait(10); // Small delay to simulate processing

      // Mock output
      return `Agent ${agentId} processed: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"`;
    };

    if (timeout) {
      return this.executeWithTimeout(
        execution(),
        timeout,
        `Agent '${agentId}' execution timed out after ${timeout}ms`
      );
    }

    return execution();
  }
}
