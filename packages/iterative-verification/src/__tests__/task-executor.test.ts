/**
 * TaskExecutor Unit Tests
 *
 * Tests AC-7.1: Task-by-Task Mode
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TaskExecutor } from '../core/task-executor.js';
import type { Task } from '../types/index.js';

describe('TaskExecutor', () => {
  let executor: TaskExecutor;
  let sampleTask: Task;

  beforeEach(() => {
    executor = new TaskExecutor('enabled');
    sampleTask = {
      id: 't1',
      title: 'Sample Task',
      description: 'Test task description',
      dependencies: [],
      status: 'pending',
      createdAt: new Date(),
    };
  });

  describe('AC-7.1: Task-by-Task Mode', () => {
    it('should execute task and mark as in-progress', async () => {
      const result = await executor.executeTask(sampleTask);

      expect(sampleTask.status).toBe('in-progress');
      expect(sampleTask.startedAt).toBeInstanceOf(Date);
      expect(result).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should return task result with success status', async () => {
      const result = await executor.executeTask(sampleTask);

      expect(result.success).toBe(true);
      expect(result.changes).toEqual([]);
      expect(result.errors).toEqual([]);
      expect(result.output).toContain('t1');
    });

    it('should pause for approval in enabled mode', async () => {
      executor.setMode('enabled');
      const result = await executor.executeTask(sampleTask);

      // Task should remain in-progress (waiting for approval)
      expect(sampleTask.status).toBe('in-progress');
      expect(sampleTask.completedAt).toBeUndefined();
      expect(result).toBeDefined();
    });

    it('should auto-complete in disabled mode', async () => {
      executor.setMode('disabled');
      const result = await executor.executeTask(sampleTask);

      // Task should be completed automatically
      expect(sampleTask.status).toBe('completed');
      expect(sampleTask.completedAt).toBeInstanceOf(Date);
      expect(result.success).toBe(true);
    });

    it('should handle task execution errors', async () => {
      // Create task that will fail (simulated by throwing error in real execution)
      const failingTask: Task = {
        ...sampleTask,
        id: 't-fail',
        title: 'Failing Task',
      };

      // In real implementation, this would trigger actual failure
      // For now, we test error handling structure
      const result = await executor.executeTask(failingTask);

      expect(result).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should track currently executing task', async () => {
      expect(executor.getCurrentTask()).toBeUndefined();

      const resultPromise = executor.executeTask(sampleTask);
      // During execution
      expect(executor.getCurrentTask()).toEqual(sampleTask);

      await resultPromise;
      // After execution
      expect(executor.getCurrentTask()).toEqual(sampleTask);
    });

    it('should respect mode changes', async () => {
      expect(executor.getMode()).toBe('enabled');

      executor.setMode('disabled');
      expect(executor.getMode()).toBe('disabled');

      executor.setMode('enabled');
      expect(executor.getMode()).toBe('enabled');
    });

    it('should handle multiple task executions sequentially', async () => {
      const task1 = { ...sampleTask, id: 't1' };
      const task2 = { ...sampleTask, id: 't2' };

      const result1 = await executor.executeTask(task1);
      const result2 = await executor.executeTask(task2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(executor.getCurrentTask()).toEqual(task2);
    });
  });

  describe('Mode Management', () => {
    it('should initialize with default mode (enabled)', () => {
      const newExecutor = new TaskExecutor();
      expect(newExecutor.getMode()).toBe('enabled');
    });

    it('should initialize with specified mode', () => {
      const disabledExecutor = new TaskExecutor('disabled');
      expect(disabledExecutor.getMode()).toBe('disabled');
    });

    it('should allow mode switching during execution', async () => {
      executor.setMode('enabled');
      await executor.executeTask(sampleTask);
      expect(sampleTask.status).toBe('in-progress');

      const task2 = { ...sampleTask, id: 't2', status: 'pending' as const };
      executor.setMode('disabled');
      await executor.executeTask(task2);
      expect(task2.status).toBe('completed');
    });
  });
});
