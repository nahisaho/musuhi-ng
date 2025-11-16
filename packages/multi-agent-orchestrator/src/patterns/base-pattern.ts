/**
 * Base Pattern
 *
 * Abstract base class for all orchestration patterns.
 * Provides common functionality for message handling, error handling,
 * and conversation history integration.
 *
 * All patterns (Sequential, Group, Nested, Swarm, FSM, Hierarchical, UserProxy)
 * extend this base class.
 */

import type {
  Task,
  TaskResult,
} from '../types/task.js';
import {
  PatternExecutionStatus,
} from '../types/pattern.js';
import type {
  PatternConfig,
  PatternExecutionContext,
  OrchestrationPattern,
  ConversationContext,
} from '../types/pattern.js';
import {
  MessageType,
  MessageStatus,
} from '../types/message.js';
import type {
  Message,
} from '../types/message.js';
import { ConversationHistory } from '../core/conversation-history.js';
import { ToolRegistry } from '../registry/tool-registry.js';
import { CapabilityRegistry } from '../registry/capability-registry.js';

/**
 * Pattern execution result
 */
export interface PatternExecutionResult {
  /** Whether execution succeeded */
  success: boolean;
  /** Task result (if applicable) */
  result?: TaskResult;
  /** Messages generated during execution */
  messages: Message[];
  /** Execution context */
  context: PatternExecutionContext;
  /** Error information (if failed) */
  error?: Error;
}

/**
 * Abstract base pattern class
 *
 * Provides:
 * - Message handling utilities
 * - Error handling
 * - Conversation history integration
 * - Tool registry access
 * - Capability registry access
 */
export abstract class BasePattern {
  /**
   * Conversation history instance
   */
  protected conversationHistory: ConversationHistory;

  /**
   * Tool registry instance
   */
  protected toolRegistry: ToolRegistry;

  /**
   * Capability registry instance
   */
  protected capabilityRegistry: CapabilityRegistry;

  /**
   * Pattern type
   */
  protected abstract readonly patternType: OrchestrationPattern;

  /**
   * Constructor
   *
   * @param conversationHistory - Conversation history instance
   * @param toolRegistry - Tool registry instance
   * @param capabilityRegistry - Capability registry instance
   */
  constructor(
    conversationHistory: ConversationHistory,
    toolRegistry: ToolRegistry,
    capabilityRegistry: CapabilityRegistry
  ) {
    this.conversationHistory = conversationHistory;
    this.toolRegistry = toolRegistry;
    this.capabilityRegistry = capabilityRegistry;
  }

  /**
   * Execute the pattern
   *
   * Abstract method to be implemented by subclasses.
   * Each pattern implements its own execution logic.
   *
   * @param task - Task to execute
   * @param context - Conversation context
   * @returns Execution result
   */
  abstract execute(
    task: Task,
    context: ConversationContext
  ): Promise<PatternExecutionResult>;

  /**
   * Validate pattern configuration
   *
   * Abstract method to validate pattern-specific configuration.
   *
   * @param config - Pattern configuration
   * @throws Error if configuration is invalid
   */
  protected abstract validateConfig(config: PatternConfig): void;

  /**
   * Create a message
   *
   * Utility method to create a message and add it to conversation history.
   *
   * @param sender - Sender agent ID
   * @param receiver - Receiver agent ID
   * @param content - Message content
   * @param type - Message type
   * @param conversationId - Conversation ID
   * @returns Created message
   */
  protected async createMessage(
    sender: string,
    receiver: string,
    content: string,
    type: MessageType,
    conversationId: string
  ): Promise<Message> {
    const message: Message = {
      id: this.generateMessageId(),
      type,
      sender,
      receiver,
      content,
      status: 'sent' as MessageStatus,
      timestamp: new Date(),
      conversationId,
    };

    await this.conversationHistory.addMessage(message);
    return message;
  }

  /**
   * Create an error message
   *
   * Utility method to create an error message.
   *
   * @param sender - Sender agent ID
   * @param error - Error object
   * @param conversationId - Conversation ID
   * @returns Created error message
   */
  protected async createErrorMessage(
    sender: string,
    error: Error,
    conversationId: string
  ): Promise<Message> {
    return this.createMessage(
      sender,
      'system',
      `Error: ${error.message}`,
      MessageType.ERROR,
      conversationId
    );
  }

  /**
   * Create execution context
   *
   * Creates a new pattern execution context.
   *
   * @param config - Pattern configuration
   * @param conversationId - Conversation ID
   * @returns Execution context
   */
  protected createExecutionContext(
    config: PatternConfig,
    conversationId: string
  ): PatternExecutionContext {
    return {
      executionId: this.generateExecutionId(),
      pattern: this.patternType,
      config,
      status: 'initializing' as PatternExecutionStatus,
      startTime: new Date(),
      metadata: {
        conversationId,
      },
    };
  }

  /**
   * Update execution context status
   *
   * Updates the status of an execution context.
   *
   * @param context - Execution context to update
   * @param status - New status
   */
  protected updateContextStatus(
    context: PatternExecutionContext,
    status: PatternExecutionStatus
  ): void {
    context.status = status;
    if (status === 'completed' || status === PatternExecutionStatus.FAILED || status === 'cancelled') {
      context.endTime = new Date();
    }
  }

  /**
   * Update execution context step
   *
   * Updates the current step of execution.
   *
   * @param context - Execution context to update
   * @param currentStep - Current step number
   * @param totalSteps - Total steps (optional)
   */
  protected updateContextStep(
    context: PatternExecutionContext,
    currentStep: number,
    totalSteps?: number
  ): void {
    context.currentStep = currentStep;
    if (totalSteps !== undefined) {
      context.totalSteps = totalSteps;
    }
  }

  /**
   * Handle execution error
   *
   * Handles errors during pattern execution.
   *
   * @param error - Error object
   * @param context - Execution context
   * @param conversationId - Conversation ID
   * @returns Pattern execution result with error
   */
  protected async handleExecutionError(
    error: Error,
    context: PatternExecutionContext,
    conversationId: string
  ): Promise<PatternExecutionResult> {
    this.updateContextStatus(context, PatternExecutionStatus.FAILED);
    context.error = error;

    const errorMessage = await this.createErrorMessage(
      'system',
      error,
      conversationId
    );

    return {
      success: false,
      messages: [errorMessage],
      context,
      error,
    };
  }

  /**
   * Generate unique message ID
   *
   * @returns Unique message ID
   */
  protected generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique execution ID
   *
   * @returns Unique execution ID
   */
  protected generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Wait for specified duration
   *
   * Utility method for delays (useful for testing and rate limiting).
   *
   * @param ms - Milliseconds to wait
   */
  protected async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute with timeout
   *
   * Executes a promise with a timeout.
   *
   * @param promise - Promise to execute
   * @param timeoutMs - Timeout in milliseconds
   * @param timeoutMessage - Error message for timeout
   * @returns Promise result
   * @throws Error if timeout occurs
   */
  protected async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string = 'Operation timed out'
  ): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Get pattern type
   *
   * @returns Pattern type
   */
  getPatternType(): OrchestrationPattern {
    return this.patternType;
  }
}
