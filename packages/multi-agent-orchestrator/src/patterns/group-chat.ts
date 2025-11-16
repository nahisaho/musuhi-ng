/**
 * Group Chat Pattern
 *
 * Implements round-robin/dynamic speaker selection pattern.
 * Manager selects next speaker based on conversation context.
 *
 * Maps to AC-3.2: Group Chat Pattern
 * EARS: WHEN a task requires multi-agent discussion, the system SHALL coordinate speaker selection
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
  GroupChatConfig,
  PatternConfig,
  // @ts-expect-error - Type imported for future use
  SpeakerSelectionStrategy,
} from '../types/pattern.js';
import { MessageType } from '../types/message.js';
import type { Message } from '../types/message.js';

/**
 * Group Chat Pattern Implementation
 *
 * Coordinates multi-agent discussions with dynamic speaker selection.
 * Supports multiple selection strategies:
 * - Round-robin: Agents speak in order
 * - Random: Random agent selection
 * - Manager-driven: Manager selects based on context
 * - Volunteer: Agents volunteer to speak
 * - Capability-based: Select agent with matching capability
 */
export class GroupChat extends BasePattern {
  /**
   * Pattern type identifier
   */
  protected readonly patternType: OrchestrationPattern = OrchestrationPattern.GROUP_CHAT;

  /**
   * Current round number
   */
  private currentRound: number = 0;

  /**
   * Current speaker index (for round-robin)
   */
  private currentSpeakerIndex: number = 0;

  /**
   * Speakers who have spoken in current round
   */
  private spokenThisRound: Set<string> = new Set();

  /**
   * Execute group chat pattern
   *
   * Facilitates multi-agent discussion with dynamic speaker selection.
   *
   * @param task - Task to execute
   * @param context - Conversation context
   * @returns Pattern execution result
   */
  async execute(
    task: Task,
    context: ConversationContext
  ): Promise<PatternExecutionResult> {
    const config = context.execution.config as GroupChatConfig;
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
      const maxRounds = config.maxRounds || 10;

      // Initialize round tracking
      this.currentRound = 0;
      this.currentSpeakerIndex = 0;
      this.spokenThisRound = new Set();

      this.updateContextStep(executionContext, 0, maxRounds);

      let conversationComplete = false;
      let lastOutput: string = task.description;

      // Execute rounds until completion or max rounds reached
      while (!conversationComplete && this.currentRound < maxRounds) {
        this.currentRound++;
        this.updateContextStep(executionContext, this.currentRound, maxRounds);

        // Select next speaker
        const speaker = await this.selectNextSpeaker(
          config,
          context.conversationId,
          lastOutput
        );

        if (!speaker) {
          // No more speakers available
          conversationComplete = true;
          break;
        }

        try {
          // Verify agent exists
          const agent = await this.capabilityRegistry.getAgent(speaker);
          if (!agent) {
            throw new Error(`Agent '${speaker}' not found in registry`);
          }

          // Create task message for speaker
          const taskMessage = await this.createMessage(
            config.managerId || 'system',
            speaker,
            `Round ${this.currentRound}: ${lastOutput}`,
            MessageType.TASK,
            context.conversationId
          );
          messages.push(taskMessage);

          // Execute speaker
          const speakerResult = await this.executeAgent(
            speaker,
            lastOutput,
            config
          );

          // Create result message from speaker
          const resultMessage = await this.createMessage(
            speaker,
            config.managerId || 'system',
            speakerResult,
            MessageType.RESULT,
            context.conversationId
          );
          messages.push(resultMessage);

          // Update last output
          lastOutput = speakerResult;

          // Mark speaker as spoken this round
          if (!config.allowMultipleTurns) {
            this.spokenThisRound.add(speaker);
          }

          // Check if conversation is complete
          conversationComplete = this.isConversationComplete(
            speakerResult,
            config
          );

        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));

          // Create error message
          const errorMessage = await this.createErrorMessage(
            speaker,
            err,
            context.conversationId
          );
          messages.push(errorMessage);

          // Continue to next round
          lastOutput = `Error from ${speaker}: ${err.message}`;
        }

        // Reset spoken set if all participants have spoken
        if (this.spokenThisRound.size === config.participants.length) {
          this.spokenThisRound.clear();
        }
      }

      // Mark execution as completed
      this.updateContextStatus(executionContext, PatternExecutionStatus.COMPLETED);

      // Create task result
      const taskResult: TaskResult = {
        taskId: task.id,
        success: true,
        data: {
          finalOutput: lastOutput,
          rounds: this.currentRound,
          participants: config.participants,
        },
        duration: executionContext.endTime
          ? executionContext.endTime.getTime() - executionContext.startTime.getTime()
          : 0,
        completedAt: new Date(),
        executedBy: config.managerId || 'group',
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
   * Validate group chat configuration
   *
   * @param config - Pattern configuration
   * @throws Error if configuration is invalid
   */
  protected validateConfig(config: PatternConfig): void {
    const groupConfig = config as GroupChatConfig;

    if (!groupConfig.participants) {
      throw new Error('Participants list is required for group chat pattern');
    }

    if (!Array.isArray(groupConfig.participants)) {
      throw new Error('Participants must be an array');
    }

    if (groupConfig.participants.length < 2) {
      throw new Error('Group chat requires at least 2 participants');
    }

    if (!groupConfig.selectionStrategy) {
      throw new Error('Selection strategy is required for group chat pattern');
    }

    if (groupConfig.managerId && !groupConfig.participants.includes(groupConfig.managerId)) {
      // Manager can be external to participants
    }
  }

  /**
   * Select next speaker based on selection strategy
   *
   * @param config - Group chat configuration
   * @param conversationId - Conversation ID
   * @param context - Current conversation context
   * @returns Selected speaker ID or null if none available
   */
  private async selectNextSpeaker(
    // @ts-ignore - TODO: Use conversationId for history lookup
    config: GroupChatConfig,
    _conversationId: string,
    context: string
  ): Promise<string | null> {
    const availableParticipants = config.allowMultipleTurns
      ? config.participants
      : config.participants.filter(p => !this.spokenThisRound.has(p));

    if (availableParticipants.length === 0) {
      return null;
    }

    switch (config.selectionStrategy) {
      case 'round_robin':
        return this.selectRoundRobin(availableParticipants);

      case 'random':
        return this.selectRandom(availableParticipants);

      case 'manager_driven':
        return this.selectManagerDriven(
          config,
          availableParticipants,
          context
        );

      case 'volunteer':
        return this.selectVolunteer(availableParticipants);

      case 'capability_based':
        return this.selectCapabilityBased(
          availableParticipants,
          context
        );

      default:
        // Default to round-robin
        return this.selectRoundRobin(availableParticipants);
    }
  }

  /**
   * Round-robin speaker selection
   */
  private selectRoundRobin(participants: string[]): string {
    const speaker = participants[this.currentSpeakerIndex % participants.length]!;  // Safe - modulo ensures valid index
    this.currentSpeakerIndex++;
    return speaker;
  }

  /**
   * Random speaker selection
   */
  private selectRandom(participants: string[]): string {
    const index = Math.floor(Math.random() * participants.length);
    return participants[index]!;  // Safe - Math.floor returns valid index
  }

  /**
   * Manager-driven speaker selection
   *
   * In a real implementation, this would:
   * 1. Ask manager to analyze conversation context
   * 2. Manager selects most appropriate next speaker
   * 3. Return manager's selection
   */
    // @ts-ignore - TODO: Use config for volunteer strategy
  private async selectManagerDriven(
    // @ts-ignore - TODO: Use context for state management
    config: GroupChatConfig,
    participants: string[],
    _context: string
  ): Promise<string> {
    // Placeholder: In real implementation, ask manager LLM
    // For now, use round-robin
    return this.selectRoundRobin(participants);
  }

  /**
   * Volunteer-based speaker selection
   *
   * In a real implementation, this would:
   * 1. Ask all participants if they want to speak
   * 2. Collect volunteers
   * 3. Select from volunteers (or random if multiple)
   */
  private async selectVolunteer(participants: string[]): Promise<string> {
    // Placeholder: In real implementation, query participants
    // For now, use random
    return this.selectRandom(participants);
  }

  /**
   * Capability-based speaker selection
   *
   * Selects agent whose capabilities best match current context.
    // @ts-ignore - TODO: Use context for capability lookup
   */
  private async selectCapabilityBased(
    participants: string[],
    _context: string
  ): Promise<string> {
    // Placeholder: In real implementation, match capabilities to context
    // For now, use first participant
    return participants[0]!;  // Safe - Math.floor returns valid index
  }

  /**
   * Check if conversation is complete
   *
    // @ts-ignore - TODO: Use config for selection tuning
   * Determines if the group conversation has reached a conclusion.
   */
  private isConversationComplete(
    lastOutput: string,
    _config: GroupChatConfig
  ): boolean {
    // Check for termination keywords
    const terminationKeywords = [
      'TERMINATE',
      'CONVERSATION_COMPLETE',
      'TASK_COMPLETE',
    ];

    return terminationKeywords.some(keyword =>
      lastOutput.toUpperCase().includes(keyword)
    );
  }

  /**
   * Execute an agent with the given input
   *
   * @param agentId - Agent ID
   * @param input - Input for the agent
   * @param config - Group chat configuration
    // @ts-ignore - TODO: Use config for random seed
   * @returns Agent's output
   */
  private async executeAgent(
    agentId: string,
    input: string,
    _config: GroupChatConfig
  ): Promise<string> {
    // Placeholder implementation
    // In real implementation, this would invoke the agent's LLM
    await this.wait(10); // Simulate processing

    // Mock output
    return `[${agentId}]: Processed input in round ${this.currentRound}. "${input.substring(0, 30)}${input.length > 30 ? '...' : ''}"`;
  }
}
