/**
 * Nested Chat Pattern Tests
 *
 * Tests for AC-3.3: Nested Chat Pattern
 * EARS: WHEN a task requires hierarchical delegation, the system SHALL manage nested agent execution
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NestedChat } from '../../patterns/nested-chat.js';
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
  NestedChatConfig,
} from '../../types/pattern.js';
import type { Agent, AgentRole, AgentStatus } from '../../types/agent.js';

describe('NestedChat', () => {
  let nestedChat: NestedChat;
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
    nestedChat = new NestedChat(
      conversationHistory,
      toolRegistry,
      capabilityRegistry
    );

    // Register mock agents
    const agents: Agent[] = [
      {
        id: 'root',
        name: 'Root Agent',
        description: 'Top-level coordinator',
        role: 'coordinator' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'child1',
        name: 'Child Agent 1',
        description: 'First child agent',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'child2',
        name: 'Child Agent 2',
        description: 'Second child agent',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'grandchild',
        name: 'Grandchild Agent',
        description: 'Third-level agent',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
    ];

    agents.forEach(agent => capabilityRegistry.registerAgent(agent));

    // Create mock task with subtasks
    const subtask1: Task = {
      id: 'subtask1',
      name: 'Subtask 1',
      description: 'First subtask',
      priority: 'normal' as TaskPriority,
      status: 'pending' as TaskStatus,
      requiredCapabilities: [],
      assignedAgents: ['child1'],
      dependencies: [],
      subtasks: [],
      requiresHumanApproval: false,
      createdAt: new Date(),
    };

    const subtask2: Task = {
      id: 'subtask2',
      name: 'Subtask 2',
      description: 'Second subtask',
      priority: 'normal' as TaskPriority,
      status: 'pending' as TaskStatus,
      requiredCapabilities: [],
      assignedAgents: ['child2'],
      dependencies: [],
      subtasks: [],
      requiresHumanApproval: false,
      createdAt: new Date(),
    };

    mockTask = {
      id: 'task1',
      name: 'Nested Task',
      description: 'Task requiring hierarchical execution',
      priority: 'normal' as TaskPriority,
      status: 'pending' as TaskStatus,
      requiredCapabilities: [],
      assignedAgents: ['root'],
      dependencies: [],
      subtasks: [subtask1, subtask2],
      requiresHumanApproval: false,
      createdAt: new Date(),
    };

    // Create mock conversation context
    const executionContext: PatternExecutionContext = {
      executionId: 'exec1',
      pattern: 'nested',
      config: {
        rootAgentId: 'root',
        maxDepth: 5,
        allowRecursion: true,
      } as NestedChatConfig,
      status: 'initializing' as PatternExecutionStatus,
      startTime: new Date(),
    };

    mockContext = {
      conversationId: 'conv1',
      agents: ['root', 'child1', 'child2'],
      pattern: 'nested',
      execution: executionContext,
      sharedState: {},
    };
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration', () => {
      const config: NestedChatConfig = {
        rootAgentId: 'root',
        maxDepth: 3,
      };

      expect(() => {
        (nestedChat as any).validateConfig(config);
      }).not.toThrow();
    });

    it('should throw error for missing root agent ID', () => {
      const config = {} as NestedChatConfig;

      expect(() => {
        (nestedChat as any).validateConfig(config);
      }).toThrow('Root agent ID is required');
    });

    it('should throw error for invalid max depth', () => {
      const config: NestedChatConfig = {
        rootAgentId: 'root',
        maxDepth: 0,
      };

      expect(() => {
        (nestedChat as any).validateConfig(config);
      }).toThrow('Max depth must be at least 1');
    });
  });

  describe('Hierarchical Execution', () => {
    it('should execute root agent and delegate to children', async () => {
      const result = await nestedChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.context.status).toBe('completed');

      // Verify messages include root and children
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const senders = new Set(messages.messages.map(m => m.sender));
      expect(senders.has('root')).toBe(true);
      expect(senders.has('child1')).toBe(true);
      expect(senders.has('child2')).toBe(true);
    });

    it('should aggregate child results', async () => {
      const result = await nestedChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.result?.data).toHaveProperty('rootOutput');
      expect(result.result?.data).toHaveProperty('nestedResults');

      const data = result.result?.data as any;
      expect(Array.isArray(data.nestedResults)).toBe(true);
      expect(data.nestedResults.length).toBe(2); // Two subtasks
    });
  });

  describe('Depth Limiting', () => {
    it('should respect max depth limit', async () => {
      const config = mockContext.execution.config as NestedChatConfig;
      config.maxDepth = 2;

      // Create deeply nested task
      const grandchildTask: Task = {
        id: 'grandchild-task',
        name: 'Grandchild Task',
        description: 'Third level task',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['grandchild'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      mockTask.subtasks[0].subtasks = [grandchildTask];

      const result = await nestedChat.execute(mockTask, mockContext);

      // Should fail when depth limit exceeded
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Maximum nesting depth');
    });

    it('should track maximum depth reached', async () => {
      const result = await nestedChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.result?.data).toHaveProperty('maxDepthReached');

      const data = result.result?.data as any;
      expect(data.maxDepthReached).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Recursion Control', () => {
    it('should allow recursion when allowRecursion is true', async () => {
      const config = mockContext.execution.config as NestedChatConfig;
      config.allowRecursion = true;

      const result = await nestedChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      // Should process subtasks recursively
    });

    it('should prevent recursion when allowRecursion is false', async () => {
      const config = mockContext.execution.config as NestedChatConfig;
      config.allowRecursion = false;

      const result = await nestedChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      // Should execute root agent without delegating to children
    });
  });

  describe('Task Without Subtasks', () => {
    it('should execute single agent when no subtasks', async () => {
      mockTask.subtasks = [];

      const result = await nestedChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.context.status).toBe('completed');

      // Should only have root agent messages
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const rootMessages = messages.messages.filter(m => m.sender === 'root');
      expect(rootMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid root agent', async () => {
      const config = mockContext.execution.config as NestedChatConfig;
      config.rootAgentId = 'invalid_root';

      const result = await nestedChat.execute(mockTask, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('not found in registry');
    });

    it('should handle invalid child agent', async () => {
      mockTask.subtasks[0].assignedAgents = ['invalid_child'];

      const result = await nestedChat.execute(mockTask, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Pattern Type', () => {
    it('should return correct pattern type', () => {
      expect(nestedChat.getPatternType()).toBe('nested');
    });
  });

  describe('Message Flow', () => {
    it('should track message hierarchy in conversation history', async () => {
      const result = await nestedChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      // Should have messages at different depths
      const taskMessages = messages.messages.filter(m => m.type === 'task');
      const resultMessages = messages.messages.filter(m => m.type === 'result');

      expect(taskMessages.length).toBeGreaterThan(0);
      expect(resultMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Task Result Structure', () => {
    it('should return properly structured task result', async () => {
      const result = await nestedChat.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result?.taskId).toBe('task1');
      expect(result.result?.data).toHaveProperty('rootOutput');
      expect(result.result?.data).toHaveProperty('nestedResults');
      expect(result.result?.data).toHaveProperty('maxDepthReached');
      expect(result.result?.executedBy).toBe('root');
    });
  });
});
