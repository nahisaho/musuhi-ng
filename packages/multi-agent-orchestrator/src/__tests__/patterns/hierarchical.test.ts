/**
 * Hierarchical Pattern Tests
 *
 * Tests for Hierarchical Pattern
 * EARS: WHEN a task requires hierarchical command chain, the system SHALL manage parent-child delegation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HierarchicalPattern } from '../../patterns/hierarchical.js';
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
  HierarchicalPatternConfig,
} from '../../types/pattern.js';
import type { Agent, AgentRole, AgentStatus } from '../../types/agent.js';

describe('HierarchicalPattern', () => {
  let hierarchicalPattern: HierarchicalPattern;
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
    hierarchicalPattern = new HierarchicalPattern(
      conversationHistory,
      toolRegistry,
      capabilityRegistry
    );

    // Register mock agents
    const agents: Agent[] = [
      {
        id: 'ceo',
        name: 'CEO',
        description: 'Chief Executive',
        role: 'coordinator' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'manager1',
        name: 'Manager 1',
        description: 'Department Manager 1',
        role: 'coordinator' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'manager2',
        name: 'Manager 2',
        description: 'Department Manager 2',
        role: 'coordinator' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'worker1',
        name: 'Worker 1',
        description: 'Worker under Manager 1',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'worker2',
        name: 'Worker 2',
        description: 'Worker under Manager 1',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
    ];

    agents.forEach(agent => capabilityRegistry.registerAgent(agent));

    // Create mock task
    mockTask = {
      id: 'task1',
      name: 'Hierarchical Task',
      description: 'Task requiring hierarchical execution',
      priority: 'normal' as TaskPriority,
      status: 'pending' as TaskStatus,
      requiredCapabilities: [],
      assignedAgents: ['ceo', 'manager1', 'manager2', 'worker1', 'worker2'],
      dependencies: [],
      subtasks: [],
      requiresHumanApproval: false,
      createdAt: new Date(),
    };

    // Create hierarchy: CEO -> [Manager1, Manager2] -> [Worker1, Worker2]
    const agentHierarchy: Record<string, string[]> = {
      'ceo': ['manager1', 'manager2'],
      'manager1': ['worker1', 'worker2'],
      'manager2': [],
    };

    // Create mock conversation context
    const executionContext: PatternExecutionContext = {
      executionId: 'exec1',
      pattern: 'hierarchical',
      config: {
        rootAgentId: 'ceo',
        agentHierarchy,
        maxDepth: 5,
      } as HierarchicalPatternConfig,
      status: 'initializing' as PatternExecutionStatus,
      startTime: new Date(),
    };

    mockContext = {
      conversationId: 'conv1',
      agents: ['ceo', 'manager1', 'manager2', 'worker1', 'worker2'],
      pattern: 'hierarchical',
      execution: executionContext,
      sharedState: {},
    };
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration', () => {
      const config: HierarchicalPatternConfig = {
        rootAgentId: 'ceo',
        agentHierarchy: { ceo: ['manager1'], manager1: [] },
        maxDepth: 3,
      };

      expect(() => {
        (hierarchicalPattern as any).validateConfig(config);
      }).not.toThrow();
    });

    it('should throw error for missing root agent ID', () => {
      const config = {
        agentHierarchy: {},
      } as HierarchicalPatternConfig;

      expect(() => {
        (hierarchicalPattern as any).validateConfig(config);
      }).toThrow('Root agent ID is required');
    });

    it('should throw error for missing agent hierarchy', () => {
      const config = {
        rootAgentId: 'ceo',
      } as HierarchicalPatternConfig;

      expect(() => {
        (hierarchicalPattern as any).validateConfig(config);
      }).toThrow('Agent hierarchy is required');
    });

    it('should throw error for invalid max depth', () => {
      const config: HierarchicalPatternConfig = {
        rootAgentId: 'ceo',
        agentHierarchy: { ceo: [] },
        maxDepth: 0,
      };

      expect(() => {
        (hierarchicalPattern as any).validateConfig(config);
      }).toThrow('Max depth must be at least 1');
    });
  });

  describe('Hierarchy Execution', () => {
    it('should execute agents in hierarchical order', async () => {
      const result = await hierarchicalPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.context.status).toBe('completed');

      // Verify all levels executed
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const agentIds = new Set(
        messages.messages
          .filter(m => m.type === 'result')
          .map(m => m.sender)
      );

      expect(agentIds.has('ceo')).toBe(true);
      expect(agentIds.has('manager1')).toBe(true);
      expect(agentIds.has('manager2')).toBe(true);
      expect(agentIds.has('worker1')).toBe(true);
      expect(agentIds.has('worker2')).toBe(true);
    });

    it('should aggregate child results to parent', async () => {
      const result = await hierarchicalPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      // CEO should have aggregated results from managers
      const data = result.result?.data as any;
      expect(data.hierarchyResult).toBeDefined();
      expect(data.hierarchyResult).toContain('Managed');
    });

    it('should track hierarchy depth', async () => {
      const result = await hierarchicalPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      const data = result.result?.data as any;
      expect(data.hierarchyDepth).toBe(2); // CEO (0) -> Manager (1) -> Worker (2)
    });

    it('should count total nodes executed', async () => {
      const result = await hierarchicalPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      const data = result.result?.data as any;
      expect(data.nodesExecuted).toBe(5); // CEO + 2 managers + 2 workers
    });
  });

  describe('Depth Limiting', () => {
    it('should respect max depth limit', async () => {
      const config = mockContext.execution.config as HierarchicalPatternConfig;
      config.maxDepth = 1;

      const result = await hierarchicalPattern.execute(mockTask, mockContext);

      // Should fail because actual depth (2) exceeds max (1)
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('exceeds maximum');
    });

    it('should allow execution within depth limit', async () => {
      const config = mockContext.execution.config as HierarchicalPatternConfig;
      config.maxDepth = 10;

      const result = await hierarchicalPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
    });
  });

  describe('Cycle Detection', () => {
    it('should detect cycles in hierarchy', async () => {
      const config = mockContext.execution.config as HierarchicalPatternConfig;

      // Create circular hierarchy: ceo -> manager1 -> ceo
      config.agentHierarchy = {
        ceo: ['manager1'],
        manager1: ['ceo'],
      };

      const result = await hierarchicalPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Cycle detected');
    });
  });

  describe('Leaf Nodes', () => {
    it('should handle leaf nodes without children', async () => {
      const config = mockContext.execution.config as HierarchicalPatternConfig;

      // Single agent (leaf node)
      config.agentHierarchy = {
        ceo: [],
      };

      const result = await hierarchicalPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      const data = result.result?.data as any;
      expect(data.nodesExecuted).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid agent in hierarchy', async () => {
      const config = mockContext.execution.config as HierarchicalPatternConfig;
      config.agentHierarchy.ceo = ['invalid_manager'];

      const result = await hierarchicalPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not found in registry');
    });

    it('should handle missing root agent', async () => {
      const config = mockContext.execution.config as HierarchicalPatternConfig;
      config.rootAgentId = 'invalid_ceo';

      const result = await hierarchicalPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(false);
    });
  });

  describe('Pattern Type', () => {
    it('should return correct pattern type', () => {
      expect(hierarchicalPattern.getPatternType()).toBe('hierarchical');
    });
  });

  describe('Task Result Structure', () => {
    it('should return properly structured task result', async () => {
      const result = await hierarchicalPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result?.taskId).toBe('task1');
      expect(result.result?.data).toHaveProperty('hierarchyResult');
      expect(result.result?.data).toHaveProperty('hierarchyDepth');
      expect(result.result?.data).toHaveProperty('nodesExecuted');
      expect(result.result?.executedBy).toBe('ceo');
    });
  });
});
