/**
 * UserProxy Pattern Tests
 *
 * Tests for UserProxy Pattern
 * EARS: WHEN a task requires human approval, the system SHALL wait for explicit approval
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UserProxyPattern } from '../../patterns/user-proxy.js';
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
  UserProxyConfig,
} from '../../types/pattern.js';
import type { Agent, AgentRole, AgentStatus } from '../../types/agent.js';

describe('UserProxyPattern', () => {
  let userProxyPattern: UserProxyPattern;
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
    userProxyPattern = new UserProxyPattern(
      conversationHistory,
      toolRegistry,
      capabilityRegistry
    );

    // Register mock agent
    const mockAgent: Agent = {
      id: 'test-agent',
      name: 'Test Agent',
      description: 'Test agent for approval testing',
      role: 'executor' as AgentRole,
      capabilities: [],
      status: 'available' as AgentStatus,
    };

    capabilityRegistry.registerAgent(mockAgent);

    // Create mock task (requires approval)
    mockTask = {
      id: 'task1',
      name: 'Approval Task',
      description: 'Task requiring human approval',
      priority: 'normal' as TaskPriority,
      status: 'pending' as TaskStatus,
      requiredCapabilities: [],
      assignedAgents: ['test-agent'],
      dependencies: [],
      subtasks: [],
      requiresHumanApproval: true,
      createdAt: new Date(),
    };

    // Create mock conversation context
    const executionContext: PatternExecutionContext = {
      executionId: 'exec1',
      pattern: 'user_proxy',
      config: {
        agentId: 'test-agent',
        approvalTimeout: 30000,
        defaultAction: 'reject',
        requireApprovalForAll: false,
      } as UserProxyConfig,
      status: 'initializing' as PatternExecutionStatus,
      startTime: new Date(),
    };

    mockContext = {
      conversationId: 'conv1',
      agents: ['test-agent'],
      pattern: 'user_proxy',
      execution: executionContext,
      sharedState: {},
    };
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration', () => {
      const config: UserProxyConfig = {
        agentId: 'test-agent',
        approvalTimeout: 30000,
        defaultAction: 'reject',
        requireApprovalForAll: false,
      };

      expect(() => {
        (userProxyPattern as any).validateConfig(config);
      }).not.toThrow();
    });

    it('should throw error for missing agent ID', () => {
      const config = {
        approvalTimeout: 30000,
      } as UserProxyConfig;

      expect(() => {
        (userProxyPattern as any).validateConfig(config);
      }).toThrow('Agent ID is required');
    });

    it('should throw error for negative approval timeout', () => {
      const config: UserProxyConfig = {
        agentId: 'test-agent',
        approvalTimeout: -1000,
      };

      expect(() => {
        (userProxyPattern as any).validateConfig(config);
      }).toThrow('Approval timeout must be non-negative');
    });

    it('should throw error for invalid default action', () => {
      const config: UserProxyConfig = {
        agentId: 'test-agent',
        defaultAction: 'invalid' as any,
      };

      expect(() => {
        (userProxyPattern as any).validateConfig(config);
      }).toThrow('Default action must be');
    });

    it('should allow zero timeout', () => {
      const config: UserProxyConfig = {
        agentId: 'test-agent',
        approvalTimeout: 0,
      };

      expect(() => {
        (userProxyPattern as any).validateConfig(config);
      }).not.toThrow();
    });
  });

  describe('Approval Required Scenarios', () => {
    it('should request approval for task with requiresHumanApproval flag', async () => {
      const result = await userProxyPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.context.status).toBe('completed');

      // Verify approval messages exist
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const approvalMessages = messages.messages.filter(m =>
        m.content.includes('Approval required')
      );

      expect(approvalMessages.length).toBeGreaterThan(0);
    });

    it('should request approval when requireApprovalForAll is true', async () => {
      const config = mockContext.execution.config as UserProxyConfig;
      config.requireApprovalForAll = true;

      // Task without requiresHumanApproval flag
      mockTask.requiresHumanApproval = false;

      const result = await userProxyPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      // Verify approval was requested
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const approvalMessages = messages.messages.filter(m =>
        m.content.includes('Approval required')
      );

      expect(approvalMessages.length).toBeGreaterThan(0);
    });

    it('should execute without approval when not required', async () => {
      const config = mockContext.execution.config as UserProxyConfig;
      config.requireApprovalForAll = false;

      // Task without requiresHumanApproval flag
      mockTask.requiresHumanApproval = false;

      const result = await userProxyPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      // Verify no approval messages
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const approvalMessages = messages.messages.filter(m =>
        m.content.includes('Approval required')
      );

      expect(approvalMessages.length).toBe(0);
    });
  });

  describe('Approval Status Tracking', () => {
    it('should track approval status in task result', async () => {
      const result = await userProxyPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.result?.data).toHaveProperty('approvalRequired');
      expect(result.result?.data).toHaveProperty('approvalStatus');

      const data = result.result?.data as any;
      expect(data.approvalRequired).toBe(true);
      expect(data.approvalStatus).toBe('approved');
    });

    it('should mark status as not_required when approval not needed', async () => {
      mockTask.requiresHumanApproval = false;

      const result = await userProxyPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      const data = result.result?.data as any;
      expect(data.approvalRequired).toBe(false);
      expect(data.approvalStatus).toBe('not_required');
    });
  });

  describe('Agent Execution', () => {
    it('should execute agent after approval', async () => {
      const result = await userProxyPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      // Verify agent execution message exists
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const agentMessages = messages.messages.filter(
        m => m.sender === 'test-agent' && m.type === 'result'
      );

      expect(agentMessages.length).toBeGreaterThan(0);
      expect(agentMessages[0].content).toContain('Executed with approval');
    });

    it('should include agent output in task result', async () => {
      const result = await userProxyPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.result?.data).toHaveProperty('output');

      const data = result.result?.data as any;
      expect(data.output).toContain('[test-agent]');
    });
  });

  describe('Placeholder Auto-Approval Behavior', () => {
    it('should auto-approve in placeholder implementation', async () => {
      const result = await userProxyPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      // Verify approval response message
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const responseMessages = messages.messages.filter(
        m => m.sender === 'user' && m.content === 'Approved'
      );

      expect(responseMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle agent not found error', async () => {
      const config = mockContext.execution.config as UserProxyConfig;
      config.agentId = 'invalid-agent';

      const result = await userProxyPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not found in registry');
    });

    it('should handle execution errors gracefully', async () => {
      const config = mockContext.execution.config as UserProxyConfig;
      config.agentId = 'test-agent';

      // Remove agent to cause error during execution
      (capabilityRegistry as any).agents.delete('test-agent');

      const result = await userProxyPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(false);
      expect(result.context.status).toBe('failed');
    });
  });

  describe('Pattern Type', () => {
    it('should return correct pattern type', () => {
      expect(userProxyPattern.getPatternType()).toBe('user_proxy');
    });
  });

  describe('Task Result Structure', () => {
    it('should return properly structured task result', async () => {
      const result = await userProxyPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result?.taskId).toBe('task1');
      expect(result.result?.success).toBe(true);
      expect(result.result?.executedBy).toBe('test-agent');
      expect(result.result?.completedAt).toBeInstanceOf(Date);
      expect(result.result?.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Message Flow', () => {
    it('should create correct message sequence', async () => {
      await userProxyPattern.execute(mockTask, mockContext);

      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      // Should have: approval request, user response, task, result
      expect(messages.messages.length).toBeGreaterThanOrEqual(4);

      // Verify message types in order
      const messageTypes = messages.messages.map(m => m.type);
      expect(messageTypes).toContain('task');
      expect(messageTypes).toContain('result');
    });

    it('should create messages from correct senders', async () => {
      await userProxyPattern.execute(mockTask, mockContext);

      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const senders = new Set(messages.messages.map(m => m.sender));

      expect(senders.has('system')).toBe(true);
      expect(senders.has('user')).toBe(true);
      expect(senders.has('test-agent')).toBe(true);
    });
  });

  describe('Manual Approval (Testing Helper)', () => {
    it('should support manual approval for testing', () => {
      // Create a mock approval request
      const requestId = 'test-request-123';
      (userProxyPattern as any).approvalRequests.set(requestId, {
        id: requestId,
        agentId: 'test-agent',
        action: 'test action',
        timestamp: new Date(),
        status: 'pending',
      });

      // Manually approve
      userProxyPattern.approveRequest(requestId, true);

      const request = (userProxyPattern as any).approvalRequests.get(requestId);
      expect(request.status).toBe('approved');
      expect(request.response).toBe('Manually approved');
    });

    it('should support manual rejection for testing', () => {
      const requestId = 'test-request-456';
      (userProxyPattern as any).approvalRequests.set(requestId, {
        id: requestId,
        agentId: 'test-agent',
        action: 'test action',
        timestamp: new Date(),
        status: 'pending',
      });

      // Manually reject
      userProxyPattern.approveRequest(requestId, false);

      const request = (userProxyPattern as any).approvalRequests.get(requestId);
      expect(request.status).toBe('rejected');
      expect(request.response).toBe('Manually rejected');
    });

    it('should not modify non-pending requests', () => {
      const requestId = 'test-request-789';
      (userProxyPattern as any).approvalRequests.set(requestId, {
        id: requestId,
        agentId: 'test-agent',
        action: 'test action',
        timestamp: new Date(),
        status: 'approved',
      });

      // Try to reject already approved request
      userProxyPattern.approveRequest(requestId, false);

      const request = (userProxyPattern as any).approvalRequests.get(requestId);
      // Should still be approved
      expect(request.status).toBe('approved');
    });
  });
});
