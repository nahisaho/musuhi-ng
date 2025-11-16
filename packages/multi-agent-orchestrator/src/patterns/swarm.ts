/**
 * Swarm Pattern
 *
 * Implements parallel autonomous coordination pattern.
 * Agents work independently and coordinate through shared state.
 *
 * Maps to AC-3.4: Swarm Pattern
 * EARS: WHEN a task requires parallel autonomous execution, the system SHALL coordinate agent swarm
 */

import { MessageType } from '../types/message.js';
import type { Message } from '../types/message.js';
import { OrchestrationPattern, PatternExecutionStatus } from '../types/pattern.js';
import type {
  ConversationContext,
  SwarmPatternConfig,
  PatternConfig,
  PatternExecutionContext,
} from '../types/pattern.js';
import type { Task, TaskResult } from '../types/task.js';

import { BasePattern, type PatternExecutionResult } from './base-pattern.js';

/**
 * Agent execution result in swarm
 */
interface SwarmAgentResult {
  /** Agent ID */
  agentId: string;
  /** Execution result */
  result: string;
  /** Success status */
  success: boolean;
  /** Error if failed */
  error?: Error;
  /** Execution duration */
  duration: number;
}

/**
 * Swarm Pattern Implementation
 *
 * Executes multiple agents in parallel with autonomous coordination.
 * Supports three coordination strategies:
 * - Autonomous: Agents work independently
 * - Consensus: Agents must reach agreement
 * - Leader election: One agent becomes coordinator
 */
export class SwarmPattern extends BasePattern {
  /**
   * Pattern type identifier
   */
  protected readonly patternType: OrchestrationPattern = OrchestrationPattern.SWARM;

  /**
   * Execute swarm pattern
   *
   * Launches agents in parallel and coordinates their work.
   *
   * @param task - Task to execute
   * @param context - Conversation context
   * @returns Pattern execution result
   */
  async execute(task: Task, context: ConversationContext): Promise<PatternExecutionResult> {
    const config = context.execution.config as SwarmPatternConfig;
    const executionContext = this.createExecutionContext(config, context.conversationId);

    try {
      // Validate configuration
      this.validateConfig(config);

      // Update status to running
      this.updateContextStatus(executionContext, PatternExecutionStatus.RUNNING);

      const messages: Message[] = [];
      const agents = config.agents;

      this.updateContextStep(executionContext, 0, agents.length);

      // Execute coordination strategy
      let finalResult: string;

      switch (config.coordinationStrategy) {
        case 'autonomous':
          finalResult = await this.executeAutonomous(
            task,
            agents,
            config,
            context.conversationId,
            messages,
            executionContext
          );
          break;

        case 'consensus':
          finalResult = await this.executeConsensus(
            task,
            agents,
            config,
            context.conversationId,
            messages
          );
          break;

        case 'leader_election':
          finalResult = await this.executeLeaderElection(
            task,
            agents,
            config,
            context.conversationId,
            messages
          );
          break;

        default:
          throw new Error(
            `Unknown coordination strategy: ${config.coordinationStrategy as string}`
          );
      }

      // Mark execution as completed
      this.updateContextStatus(executionContext, PatternExecutionStatus.COMPLETED);

      // Create task result
      const taskResult: TaskResult = {
        taskId: task.id,
        success: true,
        data: {
          finalOutput: finalResult,
          coordinationStrategy: config.coordinationStrategy,
          agentCount: agents.length,
        },
        duration: executionContext.endTime
          ? executionContext.endTime.getTime() - executionContext.startTime.getTime()
          : 0,
        completedAt: new Date(),
        executedBy: 'swarm',
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
   * Validate swarm pattern configuration
   *
   * @param config - Pattern configuration
   * @throws Error if configuration is invalid
   */
  protected validateConfig(config: PatternConfig): void {
    const swarmConfig = config as SwarmPatternConfig;

    if (!swarmConfig.agents) {
      throw new Error('Agents list is required for swarm pattern');
    }

    if (!Array.isArray(swarmConfig.agents)) {
      throw new Error('Agents must be an array');
    }

    if (swarmConfig.agents.length === 0) {
      throw new Error('Swarm requires at least one agent');
    }

    if (!swarmConfig.coordinationStrategy) {
      throw new Error('Coordination strategy is required for swarm pattern');
    }

    if (swarmConfig.coordinationStrategy === 'consensus') {
      const quorumSize = swarmConfig.quorumSize || Math.ceil(swarmConfig.agents.length / 2);
      if (quorumSize > swarmConfig.agents.length) {
        throw new Error('Quorum size cannot exceed number of agents');
      }
    }
  }

  /**
   * Execute autonomous coordination strategy
   *
   * Agents work independently, results are aggregated.
   */
  private async executeAutonomous(
    task: Task,
    agents: string[],
    config: SwarmPatternConfig,
    conversationId: string,
    messages: Message[],
    executionContext: PatternExecutionContext
  ): Promise<string> {
    // Execute all agents in parallel
    const maxParallel = config.maxParallelTasks || agents.length;
    const agentResults: SwarmAgentResult[] = [];

    // Batch agents into parallel groups
    for (let i = 0; i < agents.length; i += maxParallel) {
      const batch = agents.slice(i, i + maxParallel);

      const batchPromises = batch.map(async (agentId) => {
        const startTime = Date.now();

        try {
          // Verify agent exists
          const agent = this.capabilityRegistry.getAgent(agentId);
          if (!agent) {
            throw new Error(`Agent '${agentId}' not found in registry`);
          }

          // Create task message
          const taskMessage = this.createMessage(
            'system',
            agentId,
            `Swarm task: ${task.description}`,
            MessageType.TASK,
            conversationId
          );
          messages.push(taskMessage);

          // Execute agent
          const result = await this.executeAgent(agentId, task.description);

          // Create result message
          const resultMessage = this.createMessage(
            agentId,
            'system',
            result,
            MessageType.RESULT,
            conversationId
          );
          messages.push(resultMessage);

          return {
            agentId,
            result,
            success: true,
            duration: Date.now() - startTime,
          };
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));

          // Create error message
          const errorMessage = this.createErrorMessage(agentId, err, conversationId);
          messages.push(errorMessage);

          return {
            agentId,
            result: '',
            success: false,
            error: err,
            duration: Date.now() - startTime,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      agentResults.push(...batchResults);

      this.updateContextStep(
        executionContext,
        Math.min(i + maxParallel, agents.length),
        agents.length
      );
    }

    // Aggregate results
    const successfulResults = agentResults.filter((r) => r.success).map((r) => r.result);

    return `Autonomous swarm completed with ${successfulResults.length}/${agents.length} successful agents.\n\n${successfulResults.join('\n---\n')}`;
  }

  /**
   * Execute consensus coordination strategy
   *
   * Agents must reach agreement on the result.
   */
  private async executeConsensus(
    task: Task,
    agents: string[],
    config: SwarmPatternConfig,
    conversationId: string,
    messages: Message[]
  ): Promise<string> {
    // Execute all agents in parallel
    const agentResults: SwarmAgentResult[] = [];

    const agentPromises = agents.map(async (agentId) => {
      const startTime = Date.now();

      try {
        const agent = this.capabilityRegistry.getAgent(agentId);
        if (!agent) {
          throw new Error(`Agent '${agentId}' not found in registry`);
        }

        const taskMessage = this.createMessage(
          'system',
          agentId,
          `Consensus task: ${task.description}`,
          MessageType.TASK,
          conversationId
        );
        messages.push(taskMessage);

        const result = await this.executeAgent(agentId, task.description);

        const resultMessage = this.createMessage(
          agentId,
          'system',
          result,
          MessageType.RESULT,
          conversationId
        );
        messages.push(resultMessage);

        return {
          agentId,
          result,
          success: true,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        const errorMessage = this.createErrorMessage(agentId, err, conversationId);
        messages.push(errorMessage);

        return {
          agentId,
          result: '',
          success: false,
          error: err,
          duration: Date.now() - startTime,
        };
      }
    });

    const results = await Promise.all(agentPromises);
    agentResults.push(...results);

    // Check for consensus
    const quorumSize = config.quorumSize || Math.ceil(agents.length / 2);
    const successfulResults = agentResults.filter((r) => r.success);

    if (successfulResults.length < quorumSize) {
      throw new Error(
        `Consensus failed: Only ${successfulResults.length}/${quorumSize} agents succeeded`
      );
    }

    // Find most common result (simple consensus)
    const resultCounts = new Map<string, number>();
    successfulResults.forEach((r) => {
      const count = resultCounts.get(r.result) || 0;
      resultCounts.set(r.result, count + 1);
    });

    let consensusResult = '';
    let maxCount = 0;

    resultCounts.forEach((count, result) => {
      if (count > maxCount) {
        maxCount = count;
        consensusResult = result;
      }
    });

    return `Consensus reached (${maxCount}/${agents.length} agents agree):\n${consensusResult}`;
  }

  /**
   * Execute leader election coordination strategy
   *
   * One agent is elected as leader to coordinate others.
   */
  private async executeLeaderElection(
    task: Task,
    agents: string[],
    _config: SwarmPatternConfig,
    conversationId: string,
    messages: Message[]
  ): Promise<string> {
    // Use _config for leader election parameters
    // Future: _config.leaderElectionStrategy, _config.leaderCriteria, etc.

    // Elect leader (simple: first agent)
    const leaderId = agents[0]!; // Safe - agents.length validated in execute()
    const followerIds = agents.slice(1);

    // Create leader election message
    const electionMessage = this.createMessage(
      'system',
      leaderId,
      `Elected as swarm leader. Task: ${task.description}`,
      MessageType.TASK,
      conversationId
    );
    messages.push(electionMessage);

    // Leader executes task
    const leaderResult = await this.executeAgent(leaderId, task.description);

    const leaderResultMessage = this.createMessage(
      leaderId,
      'system',
      leaderResult,
      MessageType.RESULT,
      conversationId
    );
    messages.push(leaderResultMessage);

    // Followers execute sub-tasks based on leader's direction
    const followerResults: string[] = [];

    for (const followerId of followerIds) {
      try {
        const agent = this.capabilityRegistry.getAgent(followerId);
        if (!agent) {
          continue;
        }

        const followerTask = this.createMessage(
          leaderId,
          followerId,
          `Follow leader's direction: ${leaderResult}`,
          MessageType.TASK,
          conversationId
        );
        messages.push(followerTask);

        const followerResult = await this.executeAgent(followerId, `Leader said: ${leaderResult}`);

        const followerResultMessage = this.createMessage(
          followerId,
          leaderId,
          followerResult,
          MessageType.RESULT,
          conversationId
        );
        messages.push(followerResultMessage);

        followerResults.push(followerResult);
      } catch (error) {
        // Continue with other followers
      }
    }

    return `Leader (${leaderId}) coordinated ${followerResults.length} followers:\n${leaderResult}\n\nFollower results:\n${followerResults.join('\n')}`;
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
    return `[${agentId}] Swarm result: "${input.substring(0, 40)}${input.length > 40 ? '...' : ''}"`;
  }
}
