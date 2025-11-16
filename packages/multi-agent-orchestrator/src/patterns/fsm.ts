/**
 * Finite State Machine (FSM) Pattern
 *
 * Implements state-driven agent orchestration.
 * Agents execute based on current state with defined transitions.
 *
 * Maps to Multi-Agent Orchestration requirements
 * EARS: WHEN a task requires state-based execution, the system SHALL manage FSM transitions
 */

import { MessageType } from '../types/message.js';
import type { Message } from '../types/message.js';
import { OrchestrationPattern, PatternExecutionStatus } from '../types/pattern.js';
import type {
  ConversationContext,
  FSMPatternConfig,
  FSMTransition,
  PatternConfig,
} from '../types/pattern.js';
import type { Task, TaskResult } from '../types/task.js';

import { BasePattern, type PatternExecutionResult } from './base-pattern.js';

/**
 * FSM execution state
 */
interface FSMExecutionState {
  /** Current state */
  currentState: string;
  /** Previous state */
  previousState?: string;
  /** State history */
  stateHistory: string[];
  /** Current state data */
  stateData: Record<string, unknown>;
}

/**
 * FSM Pattern Implementation
 *
 * Executes tasks using a finite state machine with defined states and transitions.
 * Each state is handled by a specific agent, and transitions are triggered by conditions.
 */
export class FSMPattern extends BasePattern {
  /**
   * Pattern type identifier
   */
  protected readonly patternType: OrchestrationPattern = OrchestrationPattern.FSM;

  /**
   * Maximum transitions to prevent infinite loops
   */
  private readonly MAX_TRANSITIONS = 100;

  /**
   * Execute FSM pattern
   *
   * Manages state-driven execution with transitions.
   *
   * @param task - Task to execute
   * @param context - Conversation context
   * @returns Pattern execution result
   */
  async execute(task: Task, context: ConversationContext): Promise<PatternExecutionResult> {
    const config = context.execution.config as FSMPatternConfig;
    const executionContext = this.createExecutionContext(config, context.conversationId);

    try {
      // Validate configuration
      this.validateConfig(config);

      // Update status to running
      this.updateContextStatus(executionContext, PatternExecutionStatus.RUNNING);

      const messages: Message[] = [];

      // Initialize FSM state
      const fsmState: FSMExecutionState = {
        currentState: config.initialState,
        stateHistory: [config.initialState],
        stateData: {},
      };

      let transitionCount = 0;
      let isComplete = false;

      // Execute FSM until terminal state or max transitions
      while (!isComplete && transitionCount < this.MAX_TRANSITIONS) {
        const currentState = fsmState.currentState;

        // Get agent for current state
        const agentId = config.stateAgents[currentState] || 'unknown';
        if (!agentId) {
          throw new Error(`No agent assigned to state '${currentState}'`);
        }

        // Verify agent exists
        const agent = this.capabilityRegistry.getAgent(agentId);
        if (!agent) {
          throw new Error(`Agent '${agentId}' not found in registry`);
        }

        // Create state entry message
        const stateMessage = this.createMessage(
          'system',
          agentId,
          `Entering state '${currentState}'. Task: ${task.description}`,
          MessageType.TASK,
          context.conversationId
        );
        messages.push(stateMessage);

        // Execute agent for current state
        const stateResult = await this.executeStateAgent(
          agentId,
          currentState,
          task,
          fsmState.stateData
        );

        // Create result message
        const resultMessage = this.createMessage(
          agentId,
          'system',
          stateResult.output,
          MessageType.RESULT,
          context.conversationId
        );
        messages.push(resultMessage);

        // Update state data with agent output
        fsmState.stateData = {
          ...fsmState.stateData,
          ...stateResult.data,
        };

        // Find next transition
        const transition = this.findTransition(
          config.transitions,
          currentState,
          fsmState.stateData
        );

        if (!transition) {
          // No transition found - terminal state
          isComplete = true;
        } else {
          // Execute transition action BEFORE state change if defined
          if (transition.action) {
            await this.executeTransitionAction(
              transition,
              fsmState,
              messages,
              context.conversationId
            );
          }

          // Execute transition - update state AFTER action
          fsmState.previousState = currentState;
          fsmState.currentState = transition.to;
          fsmState.stateHistory.push(transition.to);
          transitionCount++;
        }

        // Update execution progress
        this.updateContextStep(executionContext, transitionCount, this.MAX_TRANSITIONS);
      }

      if (transitionCount >= this.MAX_TRANSITIONS) {
        throw new Error(
          `Maximum transitions (${this.MAX_TRANSITIONS}) exceeded. Possible infinite loop detected.`
        );
      }

      // Mark execution as completed
      this.updateContextStatus(executionContext, PatternExecutionStatus.COMPLETED);

      // Create task result
      const taskResult: TaskResult = {
        taskId: task.id,
        success: true,
        data: {
          finalState: fsmState.currentState,
          stateHistory: fsmState.stateHistory,
          transitionCount,
          stateData: fsmState.stateData,
        },
        duration: executionContext.endTime
          ? executionContext.endTime.getTime() - executionContext.startTime.getTime()
          : 0,
        completedAt: new Date(),
        executedBy: config.stateAgents[fsmState.currentState]!, // Safe - agentId validated earlier
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
   * Validate FSM pattern configuration
   *
   * @param config - Pattern configuration
   * @throws Error if configuration is invalid
   */
  protected validateConfig(config: PatternConfig): void {
    const fsmConfig = config as FSMPatternConfig;

    if (!fsmConfig.initialState) {
      throw new Error('Initial state is required for FSM pattern');
    }

    if (!fsmConfig.transitions) {
      throw new Error('Transitions are required for FSM pattern');
    }

    if (!Array.isArray(fsmConfig.transitions)) {
      throw new Error('Transitions must be an array');
    }

    if (!fsmConfig.stateAgents || Object.keys(fsmConfig.stateAgents).length === 0) {
      throw new Error('State agents mapping is required for FSM pattern');
    }

    // Validate initial state has an agent
    if (!fsmConfig.stateAgents[fsmConfig.initialState]) {
      throw new Error(`Initial state '${fsmConfig.initialState}' has no assigned agent`);
    }

    // Validate transitions reference valid states
    const states = new Set(Object.keys(fsmConfig.stateAgents));
    fsmConfig.transitions.forEach((transition, index) => {
      if (!states.has(transition.from)) {
        throw new Error(
          `Transition ${index}: Source state '${transition.from}' not found in state agents`
        );
      }
      if (!states.has(transition.to)) {
        throw new Error(
          `Transition ${index}: Target state '${transition.to}' not found in state agents`
        );
      }
    });
  }

  /**
   * Execute agent for current state
   *
   * @param agentId - Agent ID
   * @param state - Current state
   * @param task - Task
   * @param stateData - Current state data
   * @returns Agent output and updated state data
   */
  private async executeStateAgent(
    agentId: string,
    state: string,
    task: Task,
    stateData: Record<string, unknown>
  ): Promise<{ output: string; data: Record<string, unknown> }> {
    // Placeholder implementation
    await this.wait(10);

    // Simulate state-specific processing
    const output = `[${agentId}] Executed state '${state}': ${task.description.substring(0, 30)}...`;

    // Merge previous state data with new updates
    const data: Record<string, unknown> = {
      ...stateData,
      [`${state}_completed`]: true,
      [`${state}_timestamp`]: new Date().toISOString(),
    };

    return { output, data };
  }

  /**
   * Find next transition based on current state and data
   *
   * @param transitions - Available transitions
   * @param currentState - Current state
   * @param stateData - Current state data
   * @returns Next transition or null if no matching transition
   */
  private findTransition(
    transitions: FSMTransition[],
    currentState: string,
    stateData: Record<string, unknown>
  ): FSMTransition | null {
    // Find transitions from current state
    const candidateTransitions = transitions.filter((t) => t.from === currentState);

    if (candidateTransitions.length === 0) {
      return null;
    }

    // Evaluate conditions and return first matching transition
    for (const transition of candidateTransitions) {
      if (this.evaluateCondition(transition.condition, stateData)) {
        return transition;
      }
    }

    return null;
  }

  /**
   * Evaluate transition condition
   *
   * In a real implementation, this would:
   * 1. Parse condition expression
   * 2. Evaluate against state data
   * 3. Return true if condition met
   *
   * For now, using simple string matching.
   *
   * @param condition - Condition expression
   * @param stateData - Current state data
   * @returns Whether condition is met
   */
  private evaluateCondition(condition: string, stateData: Record<string, unknown>): boolean {
    // Placeholder: Always transition
    // In real implementation, evaluate condition expression
    // e.g., "data.status === 'success'" or "data.count > 5"

    if (condition === 'always') {
      return true;
    }

    // Simple key existence check
    if (condition.startsWith('has:')) {
      const key = condition.substring(4);
      return stateData[key] !== undefined;
    }

    // Default: always transition
    return true;
  }

  /**
   * Execute transition action
   *
   * @param transition - Transition being executed
   * @param fsmState - FSM execution state
   * @param messages - Message array
   * @param conversationId - Conversation ID
   */
  private async executeTransitionAction(
    transition: FSMTransition,
    fsmState: FSMExecutionState,
    messages: Message[],
    conversationId: string
  ): Promise<void> {
    if (!transition.action) {
      return;
    }

    // Validate transition against current FSM state
    if (fsmState.currentState !== transition.from) {
      throw new Error(
        `Invalid transition: Expected state '${transition.from}' but current state is '${fsmState.currentState}'`
      );
    }

    // Create action message
    const actionMessage = this.createMessage(
      'system',
      'system',
      `Transition action: ${transition.action} (${transition.from} → ${transition.to})`,
      MessageType.RESULT,
      conversationId
    );
    messages.push(actionMessage);

    // Placeholder: In real implementation, execute action
    // e.g., update shared state, trigger events, etc.
    await this.wait(5);
  }
}
