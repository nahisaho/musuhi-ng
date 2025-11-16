/**
 * Main Orchestrator
 *
 * Coordinates multi-agent task execution using 9 orchestration patterns.
 * Integrates pattern selection, conversation history, tool registry,
 * and capability registry.
 *
 * Provides two execution modes:
 * 1. execute() - Automatic pattern selection based on task characteristics
 * 2. executeWithPattern() - Manual pattern selection
 */

import { PatternSelector } from './pattern-selector.js';
import { ConversationHistory } from './conversation-history.js';
import { ToolRegistry } from '../registry/tool-registry.js';
import { CapabilityRegistry } from '../registry/capability-registry.js';

// Import all 9 patterns
import { SequentialChat } from '../patterns/sequential-chat.js';
import { GroupChat } from '../patterns/group-chat.js';
import { NestedChat } from '../patterns/nested-chat.js';
import { SwarmPattern } from '../patterns/swarm.js';
import { FSMPattern } from '../patterns/fsm.js';
import { HierarchicalPattern } from '../patterns/hierarchical.js';
import { UserProxyPattern } from '../patterns/user-proxy.js';

import type { BasePattern, PatternExecutionResult } from '../patterns/base-pattern.js';
import type { Task, TaskResult } from '../types/task.js';
import {
  OrchestrationPattern,
  PatternExecutionStatus,
} from '../types/pattern.js';
import type {
  ConversationContext,
  PatternExecutionContext,
  SequentialChatConfig,
  GroupChatConfig,
  NestedChatConfig,
  SwarmPatternConfig,
  FSMPatternConfig,
  HierarchicalPatternConfig,
  UserProxyConfig,
  SpeakerSelectionStrategy,
} from '../types/pattern.js';

/**
 * Orchestration context for execute() method
 */
export interface OrchestrationContext {
  /** Custom metadata */
  metadata?: Record<string, unknown>;
  /** Timeout for entire orchestration (milliseconds) */
  timeout?: number;
}

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  /** Enable debug logging */
  debug?: boolean;
  /** Default timeout (milliseconds) */
  defaultTimeout?: number;
}

/**
 * Main Orchestrator
 *
 * Coordinates multi-agent workflows using 9 orchestration patterns.
 * Provides automatic pattern selection and manual pattern override.
 */
export class Orchestrator {
  private patternSelector: PatternSelector;
  private conversationHistory: ConversationHistory;
  private toolRegistry: ToolRegistry;
  private capabilityRegistry: CapabilityRegistry;
  private patterns: Map<OrchestrationPattern, BasePattern>;
  private config: OrchestratorConfig;

  /**
   * Constructor
   *
   * @param config - Orchestrator configuration
   */
  constructor(config?: OrchestratorConfig) {
    this.config = config || {};
    this.patternSelector = new PatternSelector();
    this.conversationHistory = new ConversationHistory();
    this.toolRegistry = new ToolRegistry();
    this.capabilityRegistry = new CapabilityRegistry();
    this.patterns = new Map();

    // Register all 9 patterns
    this.initializePatterns();
  }

  /**
   * Initialize and register all orchestration patterns
   */
  private initializePatterns(): void {
    // Create pattern instances
    const sequential = new SequentialChat(
      this.conversationHistory,
      this.toolRegistry,
      this.capabilityRegistry
    );
    const groupChat = new GroupChat(
      this.conversationHistory,
      this.toolRegistry,
      this.capabilityRegistry
    );
    const nested = new NestedChat(
      this.conversationHistory,
      this.toolRegistry,
      this.capabilityRegistry
    );
    const swarm = new SwarmPattern(
      this.conversationHistory,
      this.toolRegistry,
      this.capabilityRegistry
    );
    const fsm = new FSMPattern(
      this.conversationHistory,
      this.toolRegistry,
      this.capabilityRegistry
    );
    const hierarchical = new HierarchicalPattern(
      this.conversationHistory,
      this.toolRegistry,
      this.capabilityRegistry
    );
    const userProxy = new UserProxyPattern(
      this.conversationHistory,
      this.toolRegistry,
      this.capabilityRegistry
    );

    // Register patterns
    this.patterns.set(OrchestrationPattern.SEQUENTIAL, sequential);
    this.patterns.set(OrchestrationPattern.GROUP_CHAT, groupChat);
    this.patterns.set(OrchestrationPattern.NESTED, nested);
    this.patterns.set(OrchestrationPattern.SWARM, swarm);
    this.patterns.set(OrchestrationPattern.FSM, fsm);
    this.patterns.set(OrchestrationPattern.HIERARCHICAL, hierarchical);
    this.patterns.set(OrchestrationPattern.USER_PROXY, userProxy);
  }

  /**
   * Execute task with automatic pattern selection
   *
   * Analyzes task characteristics and selects the most appropriate
   * orchestration pattern.
   *
   * @param task - Task to execute
   * @param context - Optional orchestration context
   * @returns Task execution result
   */
  async execute(
    task: Task,
    context?: OrchestrationContext
  ): Promise<TaskResult> {
    // 1. Select pattern using PatternSelector
    const selectedPattern = this.patternSelector.selectPattern(task);

    if (this.config.debug) {
      const explanation = this.patternSelector.explainSelection(task, selectedPattern);
      console.log(`[Orchestrator] ${explanation}`);
    }

    // 2. Execute with selected pattern
    return this.executeWithPattern(task, selectedPattern, context);
  }

  /**
   * Execute task with specific pattern
   *
   * Bypasses automatic pattern selection and uses the specified pattern.
   *
   * @param task - Task to execute
   * @param pattern - Orchestration pattern to use
   * @param context - Optional orchestration context
   * @returns Task execution result
   */
  async executeWithPattern(
    task: Task,
    pattern: OrchestrationPattern,
    context?: OrchestrationContext
  ): Promise<TaskResult> {
    // Get pattern instance
    const patternInstance = this.patterns.get(pattern);
    if (!patternInstance) {
      throw new Error(`Pattern '${pattern}' is not registered`);
    }

    // Create conversation context
    const conversationId = this.generateConversationId();
    const patternConfig = this.createPatternConfig(task, pattern);
    const executionContext = this.createExecutionContext(
      pattern,
      patternConfig,
      conversationId
    );

    const conversationContext: ConversationContext = {
      conversationId,
      agents: task.assignedAgents || [],
      pattern,
      execution: executionContext,
      sharedState: {},
      metadata: context?.metadata,
    };

    // Execute pattern
    try {
      const result = await this.executeWithTimeout(
        patternInstance.execute(task, conversationContext),
        context?.timeout || this.config.defaultTimeout
      );

      // Convert PatternExecutionResult to TaskResult
      return this.convertToTaskResult(task, result);

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Return failed task result
      return {
        taskId: task.id,
        success: false,
        error: err,
        duration: 0,
        completedAt: new Date(),
        executedBy: 'orchestrator',
      };
    }
  }

  /**
   * Get registered pattern instance
   *
   * @param pattern - Pattern type
   * @returns Pattern instance or undefined
   */
  getPattern(pattern: OrchestrationPattern): BasePattern | undefined {
    return this.patterns.get(pattern);
  }

  /**
   * Register custom pattern
   *
   * Allows adding or replacing pattern implementations.
   *
   * @param pattern - Pattern type
   * @param instance - Pattern instance
   */
  registerPattern(pattern: OrchestrationPattern, instance: BasePattern): void {
    this.patterns.set(pattern, instance);
  }

  /**
   * Get pattern selector
   *
   * @returns PatternSelector instance
   */
  getPatternSelector(): PatternSelector {
    return this.patternSelector;
  }

  /**
   * Get conversation history
   *
   * @returns ConversationHistory instance
   */
  getConversationHistory(): ConversationHistory {
    return this.conversationHistory;
  }

  /**
   * Get tool registry
   *
   * @returns ToolRegistry instance
   */
  getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }

  /**
   * Get capability registry
   *
   * @returns CapabilityRegistry instance
   */
  getCapabilityRegistry(): CapabilityRegistry {
    return this.capabilityRegistry;
  }

  /**
   * Create pattern-specific configuration
   *
   * @param task - Task to execute
   * @param pattern - Pattern type
   * @returns Pattern configuration
   */
  private createPatternConfig(
    task: Task,
    pattern: OrchestrationPattern
  ): SequentialChatConfig | GroupChatConfig | NestedChatConfig | SwarmPatternConfig | FSMPatternConfig | HierarchicalPatternConfig | UserProxyConfig {
    const agents = task.assignedAgents || [];

    switch (pattern) {
      case 'sequential':
        return {
          agentSequence: agents,
          stopOnError: true,
        } as SequentialChatConfig;

      case 'group_chat':
        return {
          participants: agents,
          selectionStrategy: 'round_robin' as SpeakerSelectionStrategy,
          maxRounds: 10,
        } as GroupChatConfig;

      case 'nested':
        return {
          rootAgentId: agents[0] || 'system',
          maxDepth: 5,
          allowRecursion: false,
        } as NestedChatConfig;

      case 'swarm':
        return {
          agents,
          coordinationStrategy: 'autonomous',
          maxParallelTasks: agents.length,
        } as SwarmPatternConfig;

      case 'fsm':
        return {
          initialState: 'start',
          transitions: [
            { from: 'start', to: 'processing', condition: 'task_received' },
            { from: 'processing', to: 'completed', condition: 'task_done' },
          ],
          stateAgents: {
            start: agents[0] || 'system',
            processing: agents[1] || agents[0] || 'system',
            completed: agents[2] || agents[0] || 'system',
          },
        } as FSMPatternConfig;

      case 'hierarchical':
        return {
          rootAgentId: agents[0] || 'system',
          agentHierarchy: this.createDefaultHierarchy(agents),
          maxDepth: 3,
        } as HierarchicalPatternConfig;

      case 'user_proxy':
        return {
          agentId: agents[0] || 'system',
          approvalTimeout: 60000, // 1 minute
          defaultAction: 'reject',
          requireApprovalForAll: task.requiresHumanApproval,
        } as UserProxyConfig;

      default:
        return {
          agentSequence: agents,
          stopOnError: true,
        } as SequentialChatConfig;
    }
  }

  /**
   * Create default agent hierarchy
   *
   * @param agents - List of agent IDs
   * @returns Agent hierarchy mapping
   */
  private createDefaultHierarchy(agents: string[]): Record<string, string[]> {
    if (agents.length === 0) {
      return {};
    }

    const hierarchy: Record<string, string[]> = {};
    const root = agents[0]!; // Safe - length check ensures element exists

    if (agents.length > 1) {
      hierarchy[root] = agents.slice(1);
    }

    return hierarchy;
  }

  /**
   * Create execution context
   *
   * @param pattern - Pattern type
   * @param config - Pattern configuration
   * @param conversationId - Conversation ID
   * @returns Execution context
   */
  private createExecutionContext(
    pattern: OrchestrationPattern,
    config: any,
    conversationId: string
  ): PatternExecutionContext {
    return {
      executionId: this.generateExecutionId(),
      pattern,
      config,
      status: PatternExecutionStatus.INITIALIZING,
      startTime: new Date(),
      metadata: {
        conversationId,
      },
    };
  }

  /**
   * Convert PatternExecutionResult to TaskResult
   *
   * @param task - Original task
   * @param result - Pattern execution result
   * @returns Task result
   */
  private convertToTaskResult(
    task: Task,
    result: PatternExecutionResult
  ): TaskResult {
    if (result.result) {
      return result.result;
    }

    // Fallback: create task result from pattern result
    return {
      taskId: task.id,
      success: result.success,
      data: result.messages,
      error: result.error,
      duration: result.context.endTime
        ? result.context.endTime.getTime() - result.context.startTime.getTime()
        : 0,
      completedAt: result.context.endTime || new Date(),
      executedBy: 'orchestrator',
    };
  }

  /**
   * Execute with timeout
   *
   * @param promise - Promise to execute
   * @param timeoutMs - Timeout in milliseconds (optional)
   * @returns Promise result
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs?: number
  ): Promise<T> {
    if (!timeoutMs) {
      return promise;
    }

    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Orchestration timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Generate unique conversation ID
   *
   * @returns Conversation ID
   */
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique execution ID
   *
   * @returns Execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
