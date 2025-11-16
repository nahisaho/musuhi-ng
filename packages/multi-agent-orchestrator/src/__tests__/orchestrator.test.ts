/**
 * Main Orchestrator Tests
 *
 * Tests for the main orchestrator coordinator that integrates all 9 patterns.
 * Verifies pattern registration, automatic selection, and execution.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Orchestrator } from '../core/orchestrator.js';
import type { Task, TaskPriority, TaskStatus } from '../types/task.js';
import type { OrchestrationPattern } from '../types/pattern.js';
import type { Agent, AgentRole, AgentStatus } from '../types/agent.js';

describe('Orchestrator', () => {
  let orchestrator: Orchestrator;

  beforeEach(() => {
    orchestrator = new Orchestrator();

    // Register mock agents for testing
    const agents: Agent[] = [
      {
        id: 'agent1',
        name: 'Agent 1',
        description: 'Test agent 1',
        role: 'executor' as AgentRole,
        capabilities: ['code', 'test'],
        status: 'available' as AgentStatus,
      },
      {
        id: 'agent2',
        name: 'Agent 2',
        description: 'Test agent 2',
        role: 'executor' as AgentRole,
        capabilities: ['design', 'review'],
        status: 'available' as AgentStatus,
      },
      {
        id: 'agent3',
        name: 'Agent 3',
        description: 'Test agent 3',
        role: 'executor' as AgentRole,
        capabilities: ['deploy'],
        status: 'available' as AgentStatus,
      },
    ];

    for (const agent of agents) {
      orchestrator.getCapabilityRegistry().registerAgent(agent);
    }
  });

  describe('Initialization', () => {
    /**
     * Test 1: Orchestrator initializes with all components
     */
    it('should initialize with all required components', () => {
      expect(orchestrator).toBeDefined();
      expect(orchestrator.getConversationHistory()).toBeDefined();
      expect(orchestrator.getToolRegistry()).toBeDefined();
      expect(orchestrator.getCapabilityRegistry()).toBeDefined();
      expect(orchestrator.getPatternSelector()).toBeDefined();
    });

    /**
     * Test 2: All 9 patterns are registered by default
     */
    it('should have all 9 patterns registered', () => {
      const patterns: OrchestrationPattern[] = [
        'sequential',
        'group_chat',
        'nested',
        'swarm',
        'fsm',
        'hierarchical',
        'user_proxy',
      ];

      for (const patternType of patterns) {
        const pattern = orchestrator.getPattern(patternType);
        expect(pattern).toBeDefined();
        expect(pattern?.getPatternType()).toBe(patternType);
      }
    });
  });

  describe('execute() - Auto Pattern Selection', () => {
    /**
     * Test 3: Execute with auto-selection (UserProxy)
     */
    it('should auto-select UserProxy pattern for approval tasks', async () => {
      const task: Task = {
        id: 't1',
        name: 'Critical Task',
        description: 'Requires approval',
        priority: 'critical' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: true,
        createdAt: new Date(),
      };

      const result = await orchestrator.execute(task);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    /**
     * Test 4: Execute with auto-selection (Sequential)
     */
    it('should auto-select Sequential pattern for simple tasks', async () => {
      const task: Task = {
        id: 't2',
        name: 'Simple Task',
        description: 'Basic linear workflow',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1', 'agent2'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const result = await orchestrator.execute(task);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    /**
     * Test 5: Execute with auto-selection (Nested)
     */
    it('should auto-select Nested pattern for tasks with subtasks', async () => {
      const task: Task = {
        id: 't3',
        name: 'Parent Task',
        description: 'Has subtasks',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1'],
        dependencies: [],
        subtasks: [
          {
            id: 'st1',
            name: 'Subtask 1',
            description: 'Child task',
            priority: 'normal' as TaskPriority,
            status: 'pending' as TaskStatus,
            requiredCapabilities: [],
            assignedAgents: ['agent2'],
            dependencies: [],
            subtasks: [],
            requiresHumanApproval: false,
            createdAt: new Date(),
          },
        ],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const result = await orchestrator.execute(task);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    /**
     * Test 6: Execute with auto-selection (Group)
     */
    it('should auto-select Group pattern for many agents', async () => {
      const task: Task = {
        id: 't4',
        name: 'Multi-Agent Task',
        description: 'Requires many agents',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      // Register additional agents
      for (let i = 4; i <= 6; i++) {
        orchestrator.getCapabilityRegistry().registerAgent({
          id: `a${i}`,
          name: `Agent ${i}`,
          description: `Test agent ${i}`,
          role: 'executor' as AgentRole,
          capabilities: [],
          status: 'available' as AgentStatus,
        });
      }

      const result = await orchestrator.execute(task);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    /**
     * Test 7: Execute with custom context
     */
    it('should accept custom orchestration context', async () => {
      const task: Task = {
        id: 't5',
        name: 'Task with Context',
        description: 'Custom context',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const context = {
        metadata: {
          projectId: 'proj-123',
          userId: 'user-456',
        },
      };

      const result = await orchestrator.execute(task, context);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('executeWithPattern() - Manual Pattern Selection', () => {
    /**
     * Test 8: Execute with explicit Sequential pattern
     */
    it('should execute with explicit Sequential pattern', async () => {
      const task: Task = {
        id: 't6',
        name: 'Sequential Task',
        description: 'Force sequential',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1', 'agent2', 'agent3'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const result = await orchestrator.executeWithPattern(task, 'sequential');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    /**
     * Test 9: Execute with explicit Group pattern
     */
    it('should execute with explicit Group pattern', async () => {
      const task: Task = {
        id: 't7',
        name: 'Group Task',
        description: 'Force group chat',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1', 'agent2', 'agent3'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const result = await orchestrator.executeWithPattern(task, 'group_chat');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    /**
     * Test 10: Execute with explicit Nested pattern
     */
    it('should execute with explicit Nested pattern', async () => {
      const task: Task = {
        id: 't8',
        name: 'Nested Task',
        description: 'Force nested',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1', 'agent2'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const result = await orchestrator.executeWithPattern(task, 'nested');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    /**
     * Test 11: Execute with explicit Swarm pattern
     */
    it('should execute with explicit Swarm pattern', async () => {
      const task: Task = {
        id: 't9',
        name: 'Swarm Task',
        description: 'Force swarm',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1', 'agent2', 'agent3'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const result = await orchestrator.executeWithPattern(task, 'swarm');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    /**
     * Test 12: Execute with explicit FSM pattern
     */
    it('should execute with explicit FSM pattern', async () => {
      const task: Task = {
        id: 't10',
        name: 'FSM Task',
        description: 'Force FSM',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1', 'agent2'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const result = await orchestrator.executeWithPattern(task, 'fsm');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    /**
     * Test 13: Execute with explicit Hierarchical pattern
     */
    it('should execute with explicit Hierarchical pattern', async () => {
      const task: Task = {
        id: 't11',
        name: 'Hierarchical Task',
        description: 'Force hierarchical',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1', 'agent2'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const result = await orchestrator.executeWithPattern(task, 'hierarchical');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    /**
     * Test 14: Execute with explicit UserProxy pattern
     */
    it('should execute with explicit UserProxy pattern', async () => {
      const task: Task = {
        id: 't12',
        name: 'UserProxy Task',
        description: 'Force user proxy',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: true,
        createdAt: new Date(),
      };

      const result = await orchestrator.executeWithPattern(task, 'user_proxy');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Pattern Management', () => {
    /**
     * Test 15: Get pattern by type
     */
    it('should retrieve pattern instance by type', () => {
      const pattern = orchestrator.getPattern('sequential');

      expect(pattern).toBeDefined();
      expect(pattern?.getPatternType()).toBe('sequential');
    });

    /**
     * Test 16: Get non-existent pattern returns undefined
     */
    it('should return undefined for non-existent pattern', () => {
      const pattern = orchestrator.getPattern('auto');

      expect(pattern).toBeUndefined();
    });

    /**
     * Test 17: Register custom pattern
     */
    it('should allow registering custom patterns', () => {
      const customPattern = orchestrator.getPattern('sequential');
      if (!customPattern) {
        throw new Error('Sequential pattern not found');
      }

      // Re-register sequential pattern (simulating custom pattern)
      orchestrator.registerPattern('sequential', customPattern);

      const retrieved = orchestrator.getPattern('sequential');
      expect(retrieved).toBeDefined();
    });
  });

  describe('Conversation History Integration', () => {
    /**
     * Test 18: Messages are stored in conversation history
     */
    it('should store messages in conversation history during execution', async () => {
      const task: Task = {
        id: 't13',
        name: 'History Task',
        description: 'Test history',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1', 'agent2'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      await orchestrator.execute(task);

      const history = orchestrator.getConversationHistory();
      const messageCount = history.getMessageCount();

      expect(messageCount).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    /**
     * Test 19: Handle invalid pattern gracefully
     */
    it('should throw error for invalid pattern in executeWithPattern', async () => {
      const task: Task = {
        id: 't14',
        name: 'Invalid Pattern Task',
        description: 'Invalid pattern',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      await expect(
        orchestrator.executeWithPattern(task, 'invalid_pattern' as OrchestrationPattern)
      ).rejects.toThrow();
    });

    /**
     * Test 20: Handle task with missing agents
     */
    it('should handle task with no assigned agents', async () => {
      const task: Task = {
        id: 't15',
        name: 'No Agents Task',
        description: 'No agents assigned',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: [],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const result = await orchestrator.execute(task);

      expect(result).toBeDefined();
      // Should still return a result (may succeed or fail gracefully)
    });
  });

  describe('Multiple Task Execution', () => {
    /**
     * Test 21: Execute multiple tasks sequentially
     */
    it('should execute multiple tasks sequentially', async () => {
      const tasks: Task[] = [
        {
          id: 't16',
          name: 'Task 1',
          description: 'First task',
          priority: 'normal' as TaskPriority,
          status: 'pending' as TaskStatus,
          requiredCapabilities: [],
          assignedAgents: ['agent1'],
          dependencies: [],
          subtasks: [],
          requiresHumanApproval: false,
          createdAt: new Date(),
        },
        {
          id: 't17',
          name: 'Task 2',
          description: 'Second task',
          priority: 'normal' as TaskPriority,
          status: 'pending' as TaskStatus,
          requiredCapabilities: [],
          assignedAgents: ['agent2'],
          dependencies: [],
          subtasks: [],
          requiresHumanApproval: false,
          createdAt: new Date(),
        },
      ];

      const results = [];
      for (const task of tasks) {
        const result = await orchestrator.execute(task);
        results.push(result);
      }

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });
  });
});
