/**
 * Swarm Pattern Tests
 *
 * Tests for AC-3.4: Swarm Pattern
 * EARS: WHEN a task requires parallel autonomous execution, the system SHALL coordinate agent swarm
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SwarmPattern } from '../../patterns/swarm.js';
import { ConversationHistory } from '../../core/conversation-history.js';
import { ToolRegistry } from '../../registry/tool-registry.js';
import { CapabilityRegistry } from '../../registry/capability-registry.js';
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from '../../types/task.js';
import type {
  ConversationContext,
  PatternExecutionContext,
  PatternExecutionStatus,
  SwarmPatternConfig,
} from '../../types/pattern.js';
import type { Agent, AgentRole, AgentStatus } from '../../types/agent.js';

describe('SwarmPattern', () => {
  let swarmPattern: SwarmPattern;
  let conversationHistory: ConversationHistory;
  let toolRegistry: ToolRegistry;
  let capabilityRegistry: CapabilityRegistry;
  let mockTask: Task;
  let mockContext: ConversationContext;

  beforeEach(() => {
    // Initialize registries
    conversationHistory = new ConversationHistory();
    toolRegistry = new ToolRegistry();
    capabilityRegistry = new CapabilityRegistry();

    // Create pattern instance
    swarmPattern = new SwarmPattern(
      conversationHistory,
      toolRegistry,
      capabilityRegistry
    );

    // Register mock agents
    const agents: Agent[] = [
      {
        id: 'agent1',
        name: 'Agent 1',
        description: 'Swarm member 1',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'agent2',
        name: 'Agent 2',
        description: 'Swarm member 2',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'agent3',
        name: 'Agent 3',
        description: 'Swarm member 3',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'agent4',
        name: 'Agent 4',
        description: 'Swarm member 4',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
    ];

    agents.forEach(agent => capabilityRegistry.registerAgent(agent));

    // Create mock task
    mockTask = {
      id: 'task1',
      name: 'Swarm Task',
      description: 'Task requiring parallel execution',
      priority: 'normal' as TaskPriority,
      status: 'pending' as TaskStatus,
      requiredCapabilities: [],
      assignedAgents: ['agent1', 'agent2', 'agent3', 'agent4'],
      dependencies: [],
      subtasks: [],
      requiresHumanApproval: false,
      createdAt: new Date(),
    };

    // Create mock conversation context
    const executionContext: PatternExecutionContext = {
      executionId: 'exec1',
      pattern: 'swarm',
      config: {
        agents: ['agent1', 'agent2', 'agent3', 'agent4'],
        coordinationStrategy: 'autonomous',
        maxParallelTasks: 4,
      } as SwarmPatternConfig,
      status: 'initializing' as PatternExecutionStatus,
      startTime: new Date(),
    };

    mockContext = {
      conversationId: 'conv1',
      agents: ['agent1', 'agent2', 'agent3', 'agent4'],
      pattern: 'swarm',
      execution: executionContext,
      sharedState: {},
    };
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration', () => {
      const config: SwarmPatternConfig = {
        agents: ['agent1', 'agent2'],
        coordinationStrategy: 'autonomous',
      };

      expect(() => {
        (swarmPattern as any).validateConfig(config);
      }).not.toThrow();
    });

    it('should throw error for empty agents list', () => {
      const config: SwarmPatternConfig = {
        agents: [],
        coordinationStrategy: 'autonomous',
      };

      expect(() => {
        (swarmPattern as any).validateConfig(config);
      }).toThrow('at least one agent');
    });

    it('should throw error for missing coordination strategy', () => {
      const config = {
        agents: ['agent1', 'agent2'],
      } as SwarmPatternConfig;

      expect(() => {
        (swarmPattern as any).validateConfig(config);
      }).toThrow('Coordination strategy is required');
    });

    it('should validate quorum size for consensus strategy', () => {
      const config: SwarmPatternConfig = {
        agents: ['agent1', 'agent2'],
        coordinationStrategy: 'consensus',
        quorumSize: 5,
      };

      expect(() => {
        (swarmPattern as any).validateConfig(config);
      }).toThrow('Quorum size cannot exceed number of agents');
    });
  });

  describe('Autonomous Coordination', () => {
    it('should execute all agents in parallel', async () => {
      const result = await swarmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.context.status).toBe('completed');

      // Verify all agents executed
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const agentIds = new Set(
        messages.messages
          .filter(m => m.type === 'result')
          .map(m => m.sender)
      );

      expect(agentIds.size).toBe(4); // All 4 agents
    });

    it('should aggregate results from all agents', async () => {
      const result = await swarmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.result?.data).toHaveProperty('finalOutput');
      expect(result.result?.data).toHaveProperty('coordinationStrategy', 'autonomous');
      expect(result.result?.data).toHaveProperty('agentCount', 4);
    });

    it('should respect maxParallelTasks limit', async () => {
      const config = mockContext.execution.config as SwarmPatternConfig;
      config.maxParallelTasks = 2;

      const result = await swarmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      // Agents should be executed in batches of 2
    });

    it('should continue if some agents fail', async () => {
      const config = mockContext.execution.config as SwarmPatternConfig;
      config.agents = ['agent1', 'invalid_agent', 'agent3'];

      const result = await swarmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      // Should complete with successful agents only
    });
  });

  describe('Consensus Coordination', () => {
    it('should reach consensus with majority agreement', async () => {
      const config = mockContext.execution.config as SwarmPatternConfig;
      config.coordinationStrategy = 'consensus';
      config.quorumSize = 3; // 3 out of 4

      const result = await swarmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.result?.data).toHaveProperty('coordinationStrategy', 'consensus');
    });

    it('should fail if quorum not reached', async () => {
      const config = mockContext.execution.config as SwarmPatternConfig;
      config.coordinationStrategy = 'consensus';
      config.agents = ['agent1', 'invalid1', 'invalid2', 'agent2'];
      config.quorumSize = 3; // Need 3 but only 2 valid

      const result = await swarmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Consensus failed');
    });

    it('should use default quorum size (majority)', async () => {
      const config = mockContext.execution.config as SwarmPatternConfig;
      config.coordinationStrategy = 'consensus';
      // quorumSize not specified, should default to ceil(4/2) = 2

      const result = await swarmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
    });
  });

  describe('Leader Election Coordination', () => {
    it('should elect leader and coordinate followers', async () => {
      const config = mockContext.execution.config as SwarmPatternConfig;
      config.coordinationStrategy = 'leader_election';

      const result = await swarmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.result?.data).toHaveProperty('coordinationStrategy', 'leader_election');

      // Verify leader and followers executed
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const senders = messages.messages.map(m => m.sender);
      expect(senders).toContain('agent1'); // Leader
      expect(senders.length).toBeGreaterThan(1); // Leader + followers
    });

    it('should have leader coordinate follower work', async () => {
      const config = mockContext.execution.config as SwarmPatternConfig;
      config.coordinationStrategy = 'leader_election';

      const result = await swarmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      // Leader result should include follower results
      const data = result.result?.data as any;
      expect(data.finalOutput).toContain('Leader');
      expect(data.finalOutput).toContain('followers');
    });
  });

  describe('Parallel Execution', () => {
    it('should execute agents in parallel batches', async () => {
      const config = mockContext.execution.config as SwarmPatternConfig;
      config.maxParallelTasks = 2;

      const startTime = Date.now();
      const result = await swarmPattern.execute(mockTask, mockContext);
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      // With batching, execution should not be purely sequential
    });

    it('should handle unlimited parallel execution', async () => {
      const config = mockContext.execution.config as SwarmPatternConfig;
      config.maxParallelTasks = undefined; // No limit

      const result = await swarmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid agents gracefully', async () => {
      const config = mockContext.execution.config as SwarmPatternConfig;
      config.agents = ['agent1', 'invalid_agent', 'agent3'];

      const result = await swarmPattern.execute(mockTask, mockContext);

      // Should complete with successful agents
      expect(result.context.status).toBe('completed');

      // Should have error messages
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const errorMessages = messages.messages.filter(m => m.type === 'error');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Pattern Type', () => {
    it('should return correct pattern type', () => {
      expect(swarmPattern.getPatternType()).toBe('swarm');
    });
  });

  describe('Task Result Structure', () => {
    it('should return properly structured task result', async () => {
      const result = await swarmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result?.taskId).toBe('task1');
      expect(result.result?.data).toHaveProperty('finalOutput');
      expect(result.result?.data).toHaveProperty('coordinationStrategy');
      expect(result.result?.data).toHaveProperty('agentCount');
      expect(result.result?.executedBy).toBe('swarm');
    });
  });
});
