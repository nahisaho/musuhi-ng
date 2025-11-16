/**
 * FSM Pattern Tests
 *
 * Tests for FSM Pattern
 * EARS: WHEN a task requires state-based execution, the system SHALL manage FSM transitions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FSMPattern } from '../../patterns/fsm.js';
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
  FSMPatternConfig,
  FSMTransition,
} from '../../types/pattern.js';
import type { Agent, AgentRole, AgentStatus } from '../../types/agent.js';

describe('FSMPattern', () => {
  let fsmPattern: FSMPattern;
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
    fsmPattern = new FSMPattern(
      conversationHistory,
      toolRegistry,
      capabilityRegistry
    );

    // Register mock agents
    const agents: Agent[] = [
      {
        id: 'init-agent',
        name: 'Init Agent',
        description: 'Handles initial state',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'process-agent',
        name: 'Process Agent',
        description: 'Handles processing state',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
      {
        id: 'final-agent',
        name: 'Final Agent',
        description: 'Handles final state',
        role: 'executor' as AgentRole,
        capabilities: [],
        status: 'available' as AgentStatus,
      },
    ];

    agents.forEach(agent => capabilityRegistry.registerAgent(agent));

    // Create mock task
    mockTask = {
      id: 'task1',
      name: 'FSM Task',
      description: 'Task with state transitions',
      priority: 'normal' as TaskPriority,
      status: 'pending' as TaskStatus,
      requiredCapabilities: [],
      assignedAgents: ['init-agent', 'process-agent', 'final-agent'],
      dependencies: [],
      subtasks: [],
      requiresHumanApproval: false,
      createdAt: new Date(),
    };

    // Create FSM configuration
    const transitions: FSMTransition[] = [
      {
        from: 'init',
        to: 'processing',
        condition: 'always',
      },
      {
        from: 'processing',
        to: 'final',
        condition: 'always',
      },
    ];

    const stateAgents: Record<string, string> = {
      'init': 'init-agent',
      'processing': 'process-agent',
      'final': 'final-agent',
    };

    // Create mock conversation context
    const executionContext: PatternExecutionContext = {
      executionId: 'exec1',
      pattern: 'fsm',
      config: {
        initialState: 'init',
        transitions,
        stateAgents,
      } as FSMPatternConfig,
      status: 'initializing' as PatternExecutionStatus,
      startTime: new Date(),
    };

    mockContext = {
      conversationId: 'conv1',
      agents: ['init-agent', 'process-agent', 'final-agent'],
      pattern: 'fsm',
      execution: executionContext,
      sharedState: {},
    };
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration', () => {
      const config: FSMPatternConfig = {
        initialState: 'init',
        transitions: [{ from: 'init', to: 'final', condition: 'always' }],
        stateAgents: { init: 'agent1', final: 'agent2' },
      };

      expect(() => {
        (fsmPattern as any).validateConfig(config);
      }).not.toThrow();
    });

    it('should throw error for missing initial state', () => {
      const config = {
        transitions: [],
        stateAgents: {},
      } as FSMPatternConfig;

      expect(() => {
        (fsmPattern as any).validateConfig(config);
      }).toThrow('Initial state is required');
    });

    it('should throw error for missing transitions', () => {
      const config = {
        initialState: 'init',
        stateAgents: { init: 'agent1' },
      } as FSMPatternConfig;

      expect(() => {
        (fsmPattern as any).validateConfig(config);
      }).toThrow('Transitions are required');
    });

    it('should throw error for missing state agents', () => {
      const config = {
        initialState: 'init',
        transitions: [],
      } as FSMPatternConfig;

      expect(() => {
        (fsmPattern as any).validateConfig(config);
      }).toThrow('State agents mapping is required');
    });

    it('should throw error for initial state without agent', () => {
      const config: FSMPatternConfig = {
        initialState: 'init',
        transitions: [],
        stateAgents: { other: 'agent1' },
      };

      expect(() => {
        (fsmPattern as any).validateConfig(config);
      }).toThrow('Initial state \'init\' has no assigned agent');
    });

    it('should throw error for invalid transition source state', () => {
      const config: FSMPatternConfig = {
        initialState: 'init',
        transitions: [{ from: 'invalid', to: 'final', condition: 'always' }],
        stateAgents: { init: 'agent1', final: 'agent2' },
      };

      expect(() => {
        (fsmPattern as any).validateConfig(config);
      }).toThrow('Source state \'invalid\' not found');
    });
  });

  describe('State Transitions', () => {
    it('should execute states in order', async () => {
      const result = await fsmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.context.status).toBe('completed');

      // Verify state history
      const data = result.result?.data as any;
      expect(data.stateHistory).toEqual(['init', 'processing', 'final']);
      expect(data.finalState).toBe('final');
    });

    it('should execute agent for each state', async () => {
      const result = await fsmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      // Verify all state agents executed
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const agentIds = new Set(
        messages.messages
          .filter(m => m.type === 'result')
          .map(m => m.sender)
      );

      expect(agentIds.has('init-agent')).toBe(true);
      expect(agentIds.has('process-agent')).toBe(true);
      expect(agentIds.has('final-agent')).toBe(true);
    });

    it('should track transition count', async () => {
      const result = await fsmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      const data = result.result?.data as any;
      expect(data.transitionCount).toBe(2); // init->processing, processing->final
    });
  });

  describe('Terminal States', () => {
    it('should stop at terminal state (no outgoing transitions)', async () => {
      const result = await fsmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.context.status).toBe('completed');

      const data = result.result?.data as any;
      expect(data.finalState).toBe('final'); // Terminal state
    });
  });

  describe('Transition Actions', () => {
    it('should execute transition actions', async () => {
      const config = mockContext.execution.config as FSMPatternConfig;
      config.transitions[0].action = 'log_transition';

      const result = await fsmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      // Verify action message exists
      const messages = conversationHistory.queryMessages({
        conversationId: 'conv1',
      });

      const actionMessages = messages.messages.filter(m =>
        m.content.includes('Transition action')
      );

      expect(actionMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Infinite Loop Detection', () => {
    it('should detect and prevent infinite loops', async () => {
      const config = mockContext.execution.config as FSMPatternConfig;

      // Create circular transitions
      config.transitions = [
        { from: 'init', to: 'processing', condition: 'always' },
        { from: 'processing', to: 'init', condition: 'always' },
      ];

      const result = await fsmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Maximum transitions');
      expect(result.error?.message).toContain('infinite loop');
    });
  });

  describe('State Data Management', () => {
    it('should maintain state data across transitions', async () => {
      const result = await fsmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);

      const data = result.result?.data as any;
      expect(data.stateData).toBeDefined();
      // State data should have entries from all executed states
    });
  });

  describe('Error Handling', () => {
    it('should handle missing agent for state', async () => {
      const config = mockContext.execution.config as FSMPatternConfig;
      config.stateAgents['init'] = 'invalid-agent';

      const result = await fsmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not found in registry');
    });

    it('should handle state without assigned agent', async () => {
      const config = mockContext.execution.config as FSMPatternConfig;
      delete config.stateAgents['processing'];

      const result = await fsmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not found in state agents');
    });
  });

  describe('Pattern Type', () => {
    it('should return correct pattern type', () => {
      expect(fsmPattern.getPatternType()).toBe('fsm');
    });
  });

  describe('Task Result Structure', () => {
    it('should return properly structured task result', async () => {
      const result = await fsmPattern.execute(mockTask, mockContext);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result?.taskId).toBe('task1');
      expect(result.result?.data).toHaveProperty('finalState');
      expect(result.result?.data).toHaveProperty('stateHistory');
      expect(result.result?.data).toHaveProperty('transitionCount');
      expect(result.result?.data).toHaveProperty('stateData');
    });
  });
});
