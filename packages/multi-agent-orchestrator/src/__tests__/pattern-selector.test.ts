/**
 * Pattern Selector Tests
 *
 * Tests for AC-3.5: AutoPattern Selection
 * EARS: WHEN Orchestrator receives task, System SHALL automatically select
 * most appropriate pattern based on complexity, capabilities, dependencies
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PatternSelector } from '../core/pattern-selector.js';
import type { Task, TaskPriority, TaskStatus } from '../types/task.js';
import type { OrchestrationPattern } from '../types/pattern.js';

describe('PatternSelector', () => {
  let selector: PatternSelector;

  beforeEach(() => {
    selector = new PatternSelector();
  });

  describe('selectPattern - AC-3.5', () => {
    /**
     * Test 1: Select UserProxy when requiresHumanApproval is true
     * Highest priority rule
     */
    it('should select UserProxy pattern when task requires human approval', () => {
      const task: Task = {
        id: 't1',
        name: 'Critical Task',
        description: 'Task requiring human review',
        priority: 'critical' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: true,
        createdAt: new Date(),
      };

      const pattern = selector.selectPattern(task);
      expect(pattern).toBe('user_proxy');
    });

    /**
     * Test 2: Select UserProxy even with subtasks if approval required
     */
    it('should prioritize UserProxy over Nested when approval required', () => {
      const task: Task = {
        id: 't2',
        name: 'Complex Approved Task',
        description: 'Task with subtasks but needs approval',
        priority: 'high' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1', 'agent2'],
        dependencies: [],
        subtasks: [
          {
            id: 'st1',
            name: 'Subtask 1',
            description: 'First subtask',
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
        requiresHumanApproval: true,
        createdAt: new Date(),
      };

      const pattern = selector.selectPattern(task);
      expect(pattern).toBe('user_proxy');
    });

    /**
     * Test 3: Select Nested when subtasks exist
     */
    it('should select Nested pattern when task has subtasks', () => {
      const task: Task = {
        id: 't3',
        name: 'Task with Subtasks',
        description: 'Parent task',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1'],
        dependencies: [],
        subtasks: [
          {
            id: 'st1',
            name: 'Subtask 1',
            description: 'First subtask',
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

      const pattern = selector.selectPattern(task);
      expect(pattern).toBe('nested');
    });

    /**
     * Test 4: Select Swarm when no dependencies and many subtasks
     */
    it('should select Swarm pattern when no dependencies and many subtasks', () => {
      const subtasks: Task[] = [];
      for (let i = 0; i < 5; i++) {
        subtasks.push({
          id: `st${i}`,
          name: `Subtask ${i}`,
          description: `Independent subtask ${i}`,
          priority: 'normal' as TaskPriority,
          status: 'pending' as TaskStatus,
          requiredCapabilities: [],
          assignedAgents: [`agent${i}`],
          dependencies: [],
          subtasks: [],
          requiresHumanApproval: false,
          createdAt: new Date(),
        });
      }

      const task: Task = {
        id: 't4',
        name: 'Parallel Task',
        description: 'Task with many independent subtasks',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1', 'agent2', 'agent3', 'agent4', 'agent5'],
        dependencies: [],
        subtasks,
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const pattern = selector.selectPattern(task);
      expect(pattern).toBe('swarm');
    });

    /**
     * Test 5: Select Group when many agents (>5)
     */
    it('should select Group pattern when many agents assigned', () => {
      const task: Task = {
        id: 't5',
        name: 'Multi-Agent Task',
        description: 'Task requiring many agents',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const pattern = selector.selectPattern(task);
      expect(pattern).toBe('group_chat');
    });

    /**
     * Test 6: Select Sequential as default fallback
     */
    it('should select Sequential pattern as default fallback', () => {
      const task: Task = {
        id: 't6',
        name: 'Simple Task',
        description: 'Basic task',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1', 'agent2'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const pattern = selector.selectPattern(task);
      expect(pattern).toBe('sequential');
    });

    /**
     * Test 7: Select Nested over Swarm when subtasks have dependencies
     */
    it('should select Nested when subtasks have dependencies', () => {
      const subtasks: Task[] = [];
      for (let i = 0; i < 5; i++) {
        subtasks.push({
          id: `st${i}`,
          name: `Subtask ${i}`,
          description: `Dependent subtask ${i}`,
          priority: 'normal' as TaskPriority,
          status: 'pending' as TaskStatus,
          requiredCapabilities: [],
          assignedAgents: [`agent${i}`],
          dependencies: i > 0 ? [{ taskId: `st${i - 1}`, type: 'requires', isCritical: true }] : [],
          subtasks: [],
          requiresHumanApproval: false,
          createdAt: new Date(),
        });
      }

      const task: Task = {
        id: 't7',
        name: 'Dependent Subtasks',
        description: 'Task with dependent subtasks',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['a1', 'a2', 'a3', 'a4', 'a5'],
        dependencies: [],
        subtasks,
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const pattern = selector.selectPattern(task);
      expect(pattern).toBe('nested');
    });

    /**
     * Test 8: Select Sequential for few agents
     */
    it('should select Sequential when few agents and no subtasks', () => {
      const task: Task = {
        id: 't8',
        name: 'Linear Task',
        description: 'Task with 3 agents',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1', 'agent2', 'agent3'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const pattern = selector.selectPattern(task);
      expect(pattern).toBe('sequential');
    });

    /**
     * Test 9: Handle empty task (edge case)
     */
    it('should select Sequential for empty task', () => {
      const task: Task = {
        id: 't9',
        name: 'Empty Task',
        description: 'Minimal task',
        priority: 'low' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: [],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const pattern = selector.selectPattern(task);
      expect(pattern).toBe('sequential');
    });

    /**
     * Test 10: Handle single agent task
     */
    it('should select Sequential for single agent task', () => {
      const task: Task = {
        id: 't10',
        name: 'Single Agent Task',
        description: 'Task for one agent',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const pattern = selector.selectPattern(task);
      expect(pattern).toBe('sequential');
    });
  });

  describe('explainSelection', () => {
    /**
     * Test 11: Explain UserProxy selection
     */
    it('should explain UserProxy selection correctly', () => {
      const task: Task = {
        id: 't11',
        name: 'Approval Task',
        description: 'Task requiring approval',
        priority: 'critical' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: true,
        createdAt: new Date(),
      };

      const pattern = selector.selectPattern(task);
      const explanation = selector.explainSelection(task, pattern);

      expect(explanation).toContain('requires human approval');
      expect(explanation).toContain('UserProxy');
    });

    /**
     * Test 12: Explain Nested selection
     */
    it('should explain Nested selection correctly', () => {
      const task: Task = {
        id: 't12',
        name: 'Parent Task',
        description: 'Task with subtasks',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1'],
        dependencies: [],
        subtasks: [
          {
            id: 'st1',
            name: 'Subtask',
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

      const pattern = selector.selectPattern(task);
      const explanation = selector.explainSelection(task, pattern);

      expect(explanation).toContain('subtask');
      expect(explanation).toContain('Nested');
    });

    /**
     * Test 13: Explain Sequential selection
     */
    it('should explain Sequential selection correctly', () => {
      const task: Task = {
        id: 't13',
        name: 'Simple Task',
        description: 'Basic task',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['agent1', 'agent2'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const pattern = selector.selectPattern(task);
      const explanation = selector.explainSelection(task, pattern);

      expect(explanation).toContain('Sequential');
    });
  });

  describe('recommendPatterns', () => {
    /**
     * Test 14: Recommend multiple patterns with scores
     */
    it('should recommend top 3 patterns with scores and reasons', () => {
      const task: Task = {
        id: 't14',
        name: 'Ambiguous Task',
        description: 'Task that could use multiple patterns',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['a1', 'a2', 'a3', 'a4'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const recommendations = selector.recommendPatterns(task);

      expect(recommendations).toHaveLength(3);
      expect(recommendations[0]).toHaveProperty('pattern');
      expect(recommendations[0]).toHaveProperty('score');
      expect(recommendations[0]).toHaveProperty('reason');
      expect(recommendations[0].score).toBeGreaterThan(0);
      expect(recommendations[0].score).toBeLessThanOrEqual(100);
    });

    /**
     * Test 15: Recommendations should be sorted by score (descending)
     */
    it('should return recommendations sorted by score (highest first)', () => {
      const task: Task = {
        id: 't15',
        name: 'Task for Ranking',
        description: 'Test ranking',
        priority: 'normal' as TaskPriority,
        status: 'pending' as TaskStatus,
        requiredCapabilities: [],
        assignedAgents: ['a1', 'a2', 'a3'],
        dependencies: [],
        subtasks: [],
        requiresHumanApproval: false,
        createdAt: new Date(),
      };

      const recommendations = selector.recommendPatterns(task);

      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].score).toBeGreaterThanOrEqual(
          recommendations[i].score
        );
      }
    });
  });
});
