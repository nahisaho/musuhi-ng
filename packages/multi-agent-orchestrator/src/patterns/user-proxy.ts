/**
 * UserProxy Pattern
 *
 * Implements human-in-the-loop approval gates.
 * Critical actions require explicit human approval before execution.
 *
 * Maps to AC-3.6: UserProxyAgent Pattern
 * EARS: WHEN a task requires human approval, the system SHALL wait for explicit approval
 */

import { BasePattern, type PatternExecutionResult } from './base-pattern.js';
import type {
  Task,
  TaskResult,
} from '../types/task.js';
import {
  OrchestrationPattern,
  PatternExecutionStatus,
} from '../types/pattern.js';
import type {
  ConversationContext,
  UserProxyConfig,
  PatternConfig,
} from '../types/pattern.js';
import { MessageType } from '../types/message.js';
import type { Message } from '../types/message.js';

/**
 * Approval request
 */
interface ApprovalRequest {
  /** Request ID */
  id: string;
  /** Agent requesting approval */
  agentId: string;
  /** Action to approve */
  action: string;
  /** Timestamp */
  timestamp: Date;
  /** Approval status */
  status: 'pending' | 'approved' | 'rejected' | 'timeout';
  /** User response (if any) */
  response?: string;
}

/**
 * UserProxy Pattern Implementation
 *
 * Implements approval gates where critical agent actions require
 * explicit human approval before execution.
 *
 * NOTE: This is a placeholder implementation. In a real system:
 * - Approval requests would be sent to a UI/CLI
 * - Human would approve/reject via interactive interface
 * - System would wait asynchronously for approval
 */
export class UserProxyPattern extends BasePattern {
  /**
   * Pattern type identifier
   */
  protected readonly patternType: OrchestrationPattern = OrchestrationPattern.USER_PROXY;

  /**
   * Pending approval requests
   */
  private approvalRequests: Map<string, ApprovalRequest> = new Map();

  /**
   * Execute user proxy pattern
   *
   * Executes agent with approval gates.
   *
   * @param task - Task to execute
   * @param context - Conversation context
   * @returns Pattern execution result
   */
  async execute(
    task: Task,
    context: ConversationContext
  ): Promise<PatternExecutionResult> {
    const config = context.execution.config as UserProxyConfig;
    const executionContext = this.createExecutionContext(
      config,
      context.conversationId
    );

    try {
      // Validate configuration
      this.validateConfig(config);

      // Update status to running
      this.updateContextStatus(executionContext, PatternExecutionStatus.RUNNING);

      const messages: Message[] = [];

      // Verify agent exists
      const agent = await this.capabilityRegistry.getAgent(config.agentId);
      if (!agent) {
        throw new Error(`Agent '${config.agentId}' not found in registry`);
      }

      // Check if task requires approval
      const requiresApproval = task.requiresHumanApproval || config.requireApprovalForAll;

      if (requiresApproval) {
        // Request approval
        const approvalRequest = await this.requestApproval(
          config.agentId,
          task.description,
          config,
          context.conversationId,
          messages
        );

        if (approvalRequest.status === 'rejected') {
          // User rejected - do not execute
          this.updateContextStatus(executionContext, PatternExecutionStatus.CANCELLED);

          const taskResult: TaskResult = {
            taskId: task.id,
            success: false,
            error: new Error('Task rejected by user'),
            duration: 0,
            completedAt: new Date(),
            executedBy: config.agentId,
          };

          return {
            success: false,
            result: taskResult,
            messages,
            context: executionContext,
            error: new Error('Task rejected by user'),
          };
        }

        if (approvalRequest.status === 'timeout') {
          // Timeout occurred - use default action
          const defaultAction = config.defaultAction || 'reject';

          if (defaultAction === 'reject' || defaultAction === 'cancel') {
            this.updateContextStatus(executionContext, PatternExecutionStatus.CANCELLED);

            const taskResult: TaskResult = {
              taskId: task.id,
              success: false,
              error: new Error('Approval timeout'),
              duration: 0,
              completedAt: new Date(),
              executedBy: config.agentId,
            };

            return {
              success: false,
              result: taskResult,
              messages,
              context: executionContext,
              error: new Error('Approval timeout'),
            };
          }
          // If defaultAction is 'approve', continue execution
        }
      }

      // Execute agent (approval granted or not required)
      const taskMessage = await this.createMessage(
        'user',
        config.agentId,
        task.description,
        MessageType.TASK,
        context.conversationId
      );
      messages.push(taskMessage);

      const agentResult = await this.executeAgent(
        config.agentId,
        task.description
      );

      const resultMessage = await this.createMessage(
        config.agentId,
        'user',
        agentResult,
        MessageType.RESULT,
        context.conversationId
      );
      messages.push(resultMessage);

      // Mark execution as completed
      this.updateContextStatus(executionContext, PatternExecutionStatus.COMPLETED);

      // Create task result
      const taskResult: TaskResult = {
        taskId: task.id,
        success: true,
        data: {
          output: agentResult,
          approvalRequired: requiresApproval,
          approvalStatus: requiresApproval ? 'approved' : 'not_required',
        },
        duration: executionContext.endTime
          ? executionContext.endTime.getTime() - executionContext.startTime.getTime()
          : 0,
        completedAt: new Date(),
        executedBy: config.agentId,
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
   * Validate user proxy configuration
   *
   * @param config - Pattern configuration
   * @throws Error if configuration is invalid
   */
  protected validateConfig(config: PatternConfig): void {
    const proxyConfig = config as UserProxyConfig;

    if (!proxyConfig.agentId) {
      throw new Error('Agent ID is required for user proxy pattern');
    }

    if (proxyConfig.approvalTimeout !== undefined && proxyConfig.approvalTimeout < 0) {
      throw new Error('Approval timeout must be non-negative');
    }

    if (
      proxyConfig.defaultAction &&
      !['approve', 'reject', 'cancel'].includes(proxyConfig.defaultAction)
    ) {
      throw new Error('Default action must be "approve", "reject", or "cancel"');
    }
  }

  /**
   * Request approval from user
   *
   * NOTE: This is a placeholder implementation.
   * In a real system, this would:
   * 1. Send approval request to UI/CLI
   * 2. Wait asynchronously for user response
   * 3. Handle timeout if no response received
   *
   * For testing, this simulates auto-approval.
   *
   * @param agentId - Agent requesting approval
   * @param action - Action to approve
   * @param config - User proxy configuration
   * @param conversationId - Conversation ID
   * @param messages - Message array
   * @returns Approval request result
   */
  private async requestApproval(
    agentId: string,
    action: string,
    config: UserProxyConfig,
    conversationId: string,
    messages: Message[]
  ): Promise<ApprovalRequest> {
    const requestId = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const approvalRequest: ApprovalRequest = {
      id: requestId,
      agentId,
      action,
      timestamp: new Date(),
      status: 'pending',
    };

    this.approvalRequests.set(requestId, approvalRequest);

    // Create approval request message
    const requestMessage = await this.createMessage(
      'system',
      'user',
      `Approval required: Agent '${agentId}' wants to execute:\n${action}\n\n[Approve/Reject]`,
      MessageType.TASK,
      conversationId
    );
    messages.push(requestMessage);

    // Simulate user response (placeholder)
    // In real implementation, this would wait for actual user input
    const timeout = config.approvalTimeout || 30000; // 30s default

    try {
      const approval = await this.waitForApproval(requestId, timeout);

      const responseMessage = await this.createMessage(
        'user',
        'system',
        approval.status === 'approved' ? 'Approved' : 'Rejected',
        MessageType.RESULT,
        conversationId
      );
      messages.push(responseMessage);

      return approval;

    } catch (error) {
      // Timeout occurred
      approvalRequest.status = 'timeout';

      const timeoutMessage = await this.createMessage(
        'system',
        'user',
        `Approval timeout after ${timeout}ms. Using default action: ${config.defaultAction || 'reject'}`,
        MessageType.RESULT,
        conversationId
      );
      messages.push(timeoutMessage);

      return approvalRequest;
    }
  }

  /**
   * Wait for user approval
   *
   * Placeholder implementation that auto-approves.
   * Real implementation would wait for user input.
   *
   * @param requestId - Approval request ID
   * @param timeout - Timeout in milliseconds
   * @returns Approval request
   */
  private async waitForApproval(
    requestId: string,
    timeout: number
  ): Promise<ApprovalRequest> {
    return new Promise((resolve, reject) => {
      // Placeholder: Auto-approve after small delay
      setTimeout(() => {
        const request = this.approvalRequests.get(requestId);
        if (request) {
          request.status = 'approved';
          request.response = 'Auto-approved (placeholder)';
          resolve(request);
        } else {
          reject(new Error('Approval request not found'));
        }
      }, 100);

      // Timeout handling
      setTimeout(() => {
        const request = this.approvalRequests.get(requestId);
        if (request && request.status === 'pending') {
          reject(new Error('Approval timeout'));
        }
      }, timeout);
    });
  }

  /**
   * Execute an agent with the given input
   *
   * @param agentId - Agent ID
   * @param input - Input for the agent
   * @returns Agent's output
   */
  private async executeAgent(
    agentId: string,
    input: string
  ): Promise<string> {
    // Placeholder implementation
    await this.wait(10);
    return `[${agentId}] Executed with approval: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"`;
  }

  /**
   * Manually approve a pending request (for testing)
   *
   * @param requestId - Approval request ID
   * @param approved - Whether to approve or reject
   */
  public approveRequest(requestId: string, approved: boolean): void {
    const request = this.approvalRequests.get(requestId);
    if (request && request.status === 'pending') {
      request.status = approved ? 'approved' : 'rejected';
      request.response = approved ? 'Manually approved' : 'Manually rejected';
    }
  }
}
