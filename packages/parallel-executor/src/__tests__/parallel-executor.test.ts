/**
 * Integration tests for ParallelExecutor
 *
 * Tests all acceptance criteria (AC-4.1 through AC-4.9)
 */

import { describe, it, expect } from 'vitest';
import { ParallelExecutor } from '../parallel-executor.js';
import { CircularDependencyError } from '../types/index.js';
import type { Task, ProgressEvent } from '../types/index.js';

describe('ParallelExecutor (Integration)', () => {
  describe('AC-4.1: P-Wave Labeling', () => {
    it('should assign P0/P1/P2 wave labels', async () => {
      const tasks: Task[] = [
        {
          id: 't1',
          description: 'Task 1',
          dependencies: [],
          executor: async () => 'result1',
          status: 'pending',
        },
        {
          id: 't2',
          description: 'Task 2',
          dependencies: ['t1'],
          executor: async () => 'result2',
          status: 'pending',
        },
        {
          id: 't3',
          description: 'Task 3',
          dependencies: ['t2'],
          executor: async () => 'result3',
          status: 'pending',
        },
      ];

      const executor = new ParallelExecutor();
      const result = await executor.execute(tasks);

      expect(result.waves.get('t1')).toBe(0); // P0
      expect(result.waves.get('t2')).toBe(1); // P1
      expect(result.waves.get('t3')).toBe(2); // P2
    });
  });

  describe('AC-4.2: Dependency Graph', () => {
    it('should build DAG from task dependencies', async () => {
      const tasks: Task[] = [
        {
          id: 't1',
          description: 'Root task',
          dependencies: [],
          executor: async () => {},
          status: 'pending',
        },
        {
          id: 't2',
          description: 'Dependent task',
          dependencies: ['t1'],
          executor: async () => {},
          status: 'pending',
        },
      ];

      const executor = new ParallelExecutor();
      const result = await executor.execute(tasks);

      expect(result.success).toBe(true);
      expect(result.results.length).toBe(2);
    });
  });

  describe('AC-4.3, AC-4.4, AC-4.5: Wave Execution', () => {
    it('should execute P0 tasks in parallel, then P1, then P2', async () => {
      const executionOrder: string[] = [];
      const executionTimes = new Map<string, number>();

      const tasks: Task[] = [
        {
          id: 'p0-1',
          description: 'P0 Task 1',
          dependencies: [],
          executor: async () => {
            executionTimes.set('p0-1', Date.now());
            await new Promise((resolve) => setTimeout(resolve, 10));
            executionOrder.push('p0-1');
          },
          status: 'pending',
        },
        {
          id: 'p0-2',
          description: 'P0 Task 2',
          dependencies: [],
          executor: async () => {
            executionTimes.set('p0-2', Date.now());
            await new Promise((resolve) => setTimeout(resolve, 10));
            executionOrder.push('p0-2');
          },
          status: 'pending',
        },
        {
          id: 'p1-1',
          description: 'P1 Task 1',
          dependencies: ['p0-1', 'p0-2'],
          executor: async () => {
            executionTimes.set('p1-1', Date.now());
            executionOrder.push('p1-1');
          },
          status: 'pending',
        },
      ];

      const executor = new ParallelExecutor();
      const result = await executor.execute(tasks);

      // AC-4.3: P0 tasks execute in parallel
      expect(result.waves.get('p0-1')).toBe(0);
      expect(result.waves.get('p0-2')).toBe(0);

      // AC-4.4: P1 executes after P0
      expect(result.waves.get('p1-1')).toBe(1);

      // Verify P0 tasks completed before P1
      expect(executionOrder.indexOf('p1-1')).toBeGreaterThan(
        Math.max(executionOrder.indexOf('p0-1'), executionOrder.indexOf('p0-2'))
      );

      expect(result.success).toBe(true);
    });
  });

  describe('AC-4.6: Time Savings Measurement', () => {
    it('should measure 50%+ time savings for parallel execution', async () => {
      const tasks: Task[] = [
        // 5 P0 tasks (parallel)
        { id: 'p0-1', description: '', dependencies: [], executor: async () => await new Promise((r) => setTimeout(r, 50)), status: 'pending' },
        { id: 'p0-2', description: '', dependencies: [], executor: async () => await new Promise((r) => setTimeout(r, 50)), status: 'pending' },
        { id: 'p0-3', description: '', dependencies: [], executor: async () => await new Promise((r) => setTimeout(r, 50)), status: 'pending' },
        { id: 'p0-4', description: '', dependencies: [], executor: async () => await new Promise((r) => setTimeout(r, 50)), status: 'pending' },
        { id: 'p0-5', description: '', dependencies: [], executor: async () => await new Promise((r) => setTimeout(r, 50)), status: 'pending' },
      ];

      const executor = new ParallelExecutor();
      const result = await executor.execute(tasks);

      // Sequential time = 5 * 50ms = 250ms
      // Parallel time ≈ 50ms (all run concurrently)
      // Expected savings ≈ 80%
      expect(result.metrics.timeSavings).toBeGreaterThanOrEqual(50); // AC-4.6 requirement
    });

    it('should have routing overhead < 200ms', async () => {
      // NFR-P.4: Routing overhead must be < 200ms
      const tasks: Task[] = [
        { id: 't1', description: '', dependencies: [], executor: async () => {}, status: 'pending' },
        { id: 't2', description: '', dependencies: [], executor: async () => {}, status: 'pending' },
      ];

      const executor = new ParallelExecutor();
      const result = await executor.execute(tasks);

      expect(result.metrics.routingOverhead).toBeLessThan(200); // NFR-P.4
    });
  });

  describe('AC-4.7: Race Condition Prevention', () => {
    it('should detect and prevent circular dependencies', async () => {
      const tasks: Task[] = [
        {
          id: 't1',
          description: 'Task 1',
          dependencies: ['t2'],
          executor: async () => {},
          status: 'pending',
        },
        {
          id: 't2',
          description: 'Task 2',
          dependencies: ['t1'],
          executor: async () => {},
          status: 'pending',
        },
      ];

      const executor = new ParallelExecutor();

      await expect(executor.execute(tasks)).rejects.toThrow(CircularDependencyError);
    });
  });

  describe('AC-4.8: Failure Handling', () => {
    it('should cancel dependent tasks when predecessor fails', async () => {
      const tasks: Task[] = [
        {
          id: 't1',
          description: 'Failing task',
          dependencies: [],
          executor: async () => {
            throw new Error('Task 1 failed');
          },
          status: 'pending',
        },
        {
          id: 't2',
          description: 'Dependent task',
          dependencies: ['t1'],
          executor: async () => 'should not execute',
          status: 'pending',
        },
        {
          id: 't3',
          description: 'Another dependent',
          dependencies: ['t2'],
          executor: async () => 'should not execute',
          status: 'pending',
        },
      ];

      const executor = new ParallelExecutor();
      const result = await executor.execute(tasks);

      // t1 should fail
      expect(result.failedTasks).toContain('t1');

      // t2 and t3 should be cancelled
      expect(result.cancelledTasks).toContain('t2');
      expect(result.cancelledTasks).toContain('t3');

      expect(result.success).toBe(false);
    });
  });

  describe('AC-4.9: Progress Monitoring', () => {
    it('should provide real-time progress updates', async () => {
      const progressEvents: ProgressEvent[] = [];

      const tasks: Task[] = [
        { id: 't1', description: '', dependencies: [], executor: async () => await new Promise((r) => setTimeout(r, 10)), status: 'pending' },
        { id: 't2', description: '', dependencies: [], executor: async () => await new Promise((r) => setTimeout(r, 10)), status: 'pending' },
        { id: 't3', description: '', dependencies: ['t1', 't2'], executor: async () => await new Promise((r) => setTimeout(r, 10)), status: 'pending' },
      ];

      const executor = new ParallelExecutor();
      const result = await executor.execute(tasks, (event) => {
        progressEvents.push(event);
      });

      // Should have received progress events
      expect(progressEvents.length).toBeGreaterThan(0);

      // Should have wave-start and wave-complete events
      const waveStarts = progressEvents.filter((e) => e.type === 'wave-start');
      const waveCompletes = progressEvents.filter((e) => e.type === 'wave-complete');

      expect(waveStarts.length).toBeGreaterThan(0);
      expect(waveCompletes.length).toBeGreaterThan(0);

      // Final progress should show all tasks completed
      expect(result.progress.completed).toBe(3);
      expect(result.progress.pending).toBe(0);
      expect(result.progress.active).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid dependencies', async () => {
      const tasks: Task[] = [
        {
          id: 't1',
          description: 'Task with invalid dependency',
          dependencies: ['non-existent'],
          executor: async () => {},
          status: 'pending',
        },
      ];

      const executor = new ParallelExecutor();

      await expect(executor.execute(tasks)).rejects.toThrow(/non-existent/);
    });

    it('should throw error for duplicate task IDs', async () => {
      const tasks: Task[] = [
        { id: 't1', description: '', dependencies: [], executor: async () => {}, status: 'pending' },
        { id: 't1', description: '', dependencies: [], executor: async () => {}, status: 'pending' },
      ];

      const executor = new ParallelExecutor();

      await expect(executor.execute(tasks)).rejects.toThrow(/Duplicate/);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty task list', async () => {
      const tasks: Task[] = [];

      const executor = new ParallelExecutor();

      await expect(executor.execute(tasks)).rejects.toThrow(/No tasks/);
    });

    it('should handle single task', async () => {
      const tasks: Task[] = [
        { id: 't1', description: '', dependencies: [], executor: async () => 'result', status: 'pending' },
      ];

      const executor = new ParallelExecutor();
      const result = await executor.execute(tasks);

      expect(result.success).toBe(true);
      expect(result.results.length).toBe(1);
      expect(result.results[0]?.output).toBe('result');
    });
  });
});
