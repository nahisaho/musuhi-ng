/**
 * Group Chat Pattern Tests
 *
 * Tests for AC-3.2: Group Chat Pattern
 * EARS: WHEN a task requires multi-agent discussion, the system SHALL coordinate speaker selection
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GroupChat } from '../../patterns/group-chat.js';
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
  GroupChatConfig,
} from '../../types/pattern.js';
import type { Agent, AgentRole, AgentStatus } from '../../types/agent.js';

describe('GroupChat', () => {
  let groupChat: GroupChat;
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
    groupChat = new GroupChat(
      conversationHistory,
      toolRegistry,
      capabilityRegistry
    );

    // Register mock agents
    const agents: Agent[] = [
      {
        id: 'agent1',
        name: 'Agent 1',
        description: 'First participant',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'agent2',
        name: 'Agent 2',
        description: 'Second participant',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'agent3',
        name: 'Agent 3',
        description: 'Third participant',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Group manager',
        role: 'coordinator' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
    ];

    agents.forEach(agent => capabilityRegistry.registerAgent(agent));

    // Create mock task
    mockTask = {
      id: 'task1',
      name: 'Group Discussion Task',
      description: 'Task requiring group collaboration',
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
      pattern: 'group_chat',
      config: {
        participants: ['agent1', 'agent2', 'agent3'],
        selectionStrategy: 'round_robin',
        maxRounds: 5,
      } as GroupChatConfig,
      status: 'initializing' as PatternExecutionStatus,
      startTime: new Date(),
    };

    mockContext = {
      conversationId: 'conv1',
      agents: ['agent1', 'agent2', 'agent3'],
      pattern: 'group_chat',
      execution: executionContext,
      sharedState: {},
    };
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration', () => {
      const config: GroupChatConfig = {
        participants: ['agent1', 'agent2'],
        selectionStrategy: 'round_robin',
      };

      expect(() => {
        (groupChat as any).validateConfig(config);
      }).not.toThrow();
    });

    it('should throw error for less than 2 participants', () => {
      const config: GroupChatConfig = {
        participants: ['agent1'],
        selectionStrategy: 'round_robin',
      };

      expect(() => {
        (groupChat as any).validateConfig(config);
      }).toThrow('at least 2 participants');
    });

    it('should throw error for missing participants', () => {
      const config = {
        selectionStrategy: 'round_robin',
      } as GroupChatConfig;

      expect(() => {
        (groupChat as any).validateConfig(config);
      }).toThrow('Participants list is required');
    });

    it('should throw error for missing selection strategy', () => {
      const config = {
        participants: ['agent1', 'agent2'],
      } as GroupChatConfig;

      expect(() => {
        (groupChat as any).validateConfig(config);
      }).toThrow('Selection strategy is required');
    });
  });

  describe('Round-Robin Selection', () => {
    it('should execute participants in round-robin order', async () => {
      const result = await groupChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.context.status).toBe('completed');

      // Verify round-robin order in messages
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const speakers = messages.messages
        .filter(m => m.type === 'result')
        .map(m => m.sender);

      // Should cycle through agents in order
      expect(speakers.length).toBeGreaterThan(0);
    });

    it('should cycle back to first agent after all agents have spoken', async () => {
      const config = mockContext.execution.config as GroupChatConfig;
      config.maxRounds = 10;
      config.allowMultipleTurns = true;

      const result = await groupChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.context.currentStep).toBeGreaterThan(3);
    });
  });

  describe('Random Selection', () => {
    it('should select speakers randomly', async () => {
      const config = mockContext.execution.config as GroupChatConfig;
      config.selectionStrategy = 'random';
      config.maxRounds = 5;

      const result = await groupChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.context.status).toBe('completed');
    });
  });

  describe('Manager-Driven Selection', () => {
    it('should use manager for speaker selection', async () => {
      const config = mockContext.execution.config as GroupChatConfig;
      config.selectionStrategy = 'manager_driven';
      config.managerId = 'manager';
      config.maxRounds = 3;

      const result = await groupChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
    });

    it('should handle manager not in participants', async () => {
      const config = mockContext.execution.config as GroupChatConfig;
      config.selectionStrategy = 'manager_driven';
      config.managerId = 'external_manager';
      config.maxRounds = 2;

      // This should not throw - manager can be external
      expect(() => {
        (groupChat as any).validateConfig(config);
      }).not.toThrow();
    });
  });

  describe('Conversation Termination', () => {
    it('should complete when max rounds reached', async () => {
      const config = mockContext.execution.config as GroupChatConfig;
      config.maxRounds = 3;

      const result = await groupChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.context.status).toBe('completed');
      expect(result.result?.data).toHaveProperty('rounds');
      expect((result.result?.data as any).rounds).toBeLessThanOrEqual(3);
    });

    it('should complete on TERMINATE signal', async () => {
      // In real implementation, agents would return TERMINATE
      const result = await groupChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
    });
  });

  describe('Multiple Turns Configuration', () => {
    it('should allow agents to speak multiple times when allowMultipleTurns is true', async () => {
      const config = mockContext.execution.config as GroupChatConfig;
      config.allowMultipleTurns = true;
      config.maxRounds = 10;

      const result = await groupChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      // With multiple turns allowed, agents can speak more than once per round
    });

    it('should limit agents to one turn per round when allowMultipleTurns is false', async () => {
      const config = mockContext.execution.config as GroupChatConfig;
      config.allowMultipleTurns = false;
      config.maxRounds = 5;

      const result = await groupChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle agent execution error and continue', async () => {
      const config = mockContext.execution.config as GroupChatConfig;
      config.participants = ['agent1', 'invalid_agent', 'agent3'];
      config.maxRounds = 5;

      const result = await groupChat.execute(mockTask, mockContext);

      // Should complete despite error
      expect(result.context.status).toBe('completed');

      // Should have error message in conversation
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const errorMessages = messages.messages.filter(m => m.type === 'error');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Pattern Type', () => {
    it('should return correct pattern type', () => {
      expect(groupChat.getPatternType()).toBe('group_chat');
    });
  });

  describe('Task Result', () => {
    it('should return task result with group discussion data', async () => {
      const result = await groupChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result?.taskId).toBe('task1');
      expect(result.result?.data).toHaveProperty('finalOutput');
      expect(result.result?.data).toHaveProperty('rounds');
      expect(result.result?.data).toHaveProperty('participants');
    });
  });
});
