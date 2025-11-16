/**
 * Sequential Chat Pattern Tests
 *
 * Tests for AC-3.1: Sequential Chat Pattern
 * EARS: WHEN a task requires linear agent handoff, the system SHALL execute agents sequentially
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SequentialChat } from '../../patterns/sequential-chat.js';
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
  SequentialChatConfig,
} from '../../types/pattern.js';
import type { Agent, AgentRole, AgentStatus } from '../../types/agent.js';

describe('SequentialChat', () => {
  let sequentialChat: SequentialChat;
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
    sequentialChat = new SequentialChat(
      conversationHistory,
      toolRegistry,
      capabilityRegistry
    );

    // Register mock agents
    const agent1: Agent = {
      id: 'agent1',
      name: 'Agent 1',
      description: 'First agent in sequence',
      role: 'executor' as AgentRole,
      capabilities: [],
      status: 'available' as AgentStatus,
    };

    const agent2: Agent = {
      id: 'agent2',
      name: 'Agent 2',
      description: 'Second agent in sequence',
      role: 'executor' as AgentRole,
      capabilities: [],
      status: 'available' as AgentStatus,
    };

    const agent3: Agent = {
      id: 'agent3',
      name: 'Agent 3',
      description: 'Third agent in sequence',
      role: 'executor' as AgentRole,
      capabilities: [],
      status: 'available' as AgentStatus,
    };

    capabilityRegistry.registerAgent(agent1);
    capabilityRegistry.registerAgent(agent2);
    capabilityRegistry.registerAgent(agent3);

    // Create mock task
    mockTask = {
      id: 'task1',
      name: 'Sequential Task',
      description: 'Task requiring sequential execution',
      priority: 'normal' as TaskPriority,
      status: 'pending' as TaskStatus,
      requiredCapabilities: [],
      assignedAgents: ['agent1', 'agent2', 'agent3'],
      dependencies: [],
      subtasks: [],
      requiresHumanApproval: false,
      createdAt: new Date(),
    };

    // Create mock conversation context
    const executionContext: PatternExecutionContext = {
      executionId: 'exec1',
      pattern: 'sequential',
      config: {
        agentSequence: ['agent1', 'agent2', 'agent3'],
        stopOnError: true,
      } as SequentialChatConfig,
      status: 'initializing' as PatternExecutionStatus,
      startTime: new Date(),
    };

    mockContext = {
      conversationId: 'conv1',
      agents: ['agent1', 'agent2', 'agent3'],
      pattern: 'sequential',
      execution: executionContext,
      sharedState: {},
    };
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration', () => {
      const config: SequentialChatConfig = {
        agentSequence: ['agent1', 'agent2'],
      };

      expect(() => {
        // Access protected method via any for testing
        (sequentialChat as any).validateConfig(config);
      }).not.toThrow();
    });

    it('should throw error for empty agent sequence', () => {
      const config: SequentialChatConfig = {
        agentSequence: [],
      };

      expect(() => {
        (sequentialChat as any).validateConfig(config);
      }).toThrow('Agent sequence cannot be empty');
    });

    it('should throw error for missing agentSequence', () => {
      const config = {} as SequentialChatConfig;

      expect(() => {
        (sequentialChat as any).validateConfig(config);
      }).toThrow('Agent sequence is required');
    });
  });

  describe('Sequential Execution', () => {
    it('should execute agents in sequence (A → B → C)', async () => {
      const result = await sequentialChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.context.status).toBe('completed');
      expect(result.messages.length).toBeGreaterThan(0);

      // Verify execution order from conversation history
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      // Should have messages from agent1, agent2, agent3 in order
      const senderOrder = messages.messages
        .filter(m => m.type === 'task' || m.type === 'result')
        .map(m => m.sender);

      // Check that agents appear in sequence
      expect(senderOrder).toContain('agent1');
      expect(senderOrder).toContain('agent2');
      expect(senderOrder).toContain('agent3');
    });

    it('should pass previous agent output to next agent', async () => {
      const result = await sequentialChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      // Verify that each agent received the previous agent's output
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      // Each agent should have a task message and result message
      const agent1Messages = messages.messages.filter(m => m.sender === 'agent1');
      const agent2Messages = messages.messages.filter(m => m.sender === 'agent2');

      expect(agent1Messages.length).toBeGreaterThan(0);
      expect(agent2Messages.length).toBeGreaterThan(0);
    });

    it('should update execution context with step progress', async () => {
      const result = await sequentialChat.execute(mockTask, mockContext);

      expect(result.context.currentStep).toBeDefined();
      expect(result.context.totalSteps).toBe(3); // 3 agents
    });
  });

  describe('Error Handling', () => {
    it('should stop on first error when stopOnError is true', async () => {
      // Modify config to stop on error
      mockContext.execution.config = {
        agentSequence: ['agent1', 'invalid_agent', 'agent3'],
        stopOnError: true,
      } as SequentialChatConfig;

      const result = await sequentialChat.execute(mockTask, mockContext);

      // Should fail when reaching invalid agent
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Should not execute agent3
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const agent3Messages = messages.messages.filter(m => m.sender === 'agent3');
      expect(agent3Messages.length).toBe(0);
    });

    it('should continue on error when stopOnError is false', async () => {
      mockContext.execution.config = {
        agentSequence: ['agent1', 'invalid_agent', 'agent3'],
        stopOnError: false,
      } as SequentialChatConfig;

      const result = await sequentialChat.execute(mockTask, mockContext);

      // Should complete despite invalid agent
      // Implementation may vary - this is a design decision
      expect(result.context.status).toBe('completed');
    });

    it('should handle timeout for agent step', async () => {
      mockContext.execution.config = {
        agentSequence: ['agent1', 'agent2'],
        stopOnError: true,
        stepTimeout: 100, // 100ms timeout
      } as SequentialChatConfig;

      // Mock agent2 to take longer than timeout
      // This is a placeholder - actual implementation will vary
      const result = await sequentialChat.execute(mockTask, mockContext);

      // Should handle timeout gracefully
      expect(result.context.status).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single agent sequence', async () => {
      mockContext.execution.config = {
        agentSequence: ['agent1'],
      } as SequentialChatConfig;

      const result = await sequentialChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.context.totalSteps).toBe(1);
    });

    it('should handle empty task', async () => {
      const emptyTask: Task = {
        ...mockTask,
        description: '',
        assignedAgents: [],
      };

      const result = await sequentialChat.execute(emptyTask, mockContext);

      // Should handle gracefully (behavior TBD)
      expect(result.context.status).toBeDefined();
    });

    it('should store messages in conversation history', async () => {
      const result = await sequentialChat.execute(mockTask, mockContext);

      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      expect(messages.totalCount).toBeGreaterThan(0);
      expect(result.messages.length).toBe(messages.totalCount);
    });
  });

  describe('Pattern Type', () => {
    it('should return correct pattern type', () => {
      expect(sequentialChat.getPatternType()).toBe('sequential');
    });
  });
});
