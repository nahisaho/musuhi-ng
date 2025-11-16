/**
 * ProgressUpdater Unit Tests
 *
 * Tests AC-7.7: Progress Checkboxes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ProgressUpdater } from '../ui/progress-updater.js';
import type { Task } from '../types/index.js';

describe('ProgressUpdater', () => {
  let updater: ProgressUpdater;
  const testDir = '/tmp/musuhi-test-progress';
  const tasksFile = path.join(testDir, 'tasks.md');

  const sampleTasksMd = `# Tasks

- [ ] Task 1: Sample Task
- [ ] Task 2: Another Task
- [x] Task 3: Completed Task
- [ ] Task 4: Final Task
`;

  beforeEach(async () => {
    // Clean up and create test directory
    try {
      await fs.rm(testDir, { recursive: true });
    } catch {
      // Directory doesn't exist
    }
    await fs.mkdir(testDir, { recursive: true });

    // Create sample tasks.md
    await fs.writeFile(tasksFile, sampleTasksMd, 'utf-8');

    updater = new ProgressUpdater(tasksFile);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true });
    } catch {
      // Directory doesn't exist
    }
  });

  describe('AC-7.7: Progress Checkboxes', () => {
    it('should mark task as completed ([ ] → [x])', async () => {
      const task: Task = {
        id: 't1',
        title: 'Sample Task',
        description: '',
        dependencies: [],
        status: 'completed',
        createdAt: new Date(),
      };

      await updater.updateProgress(task, true);

      const content = await fs.readFile(tasksFile, 'utf-8');
      expect(content).toContain('- [x] Task 1: Sample Task');
    });

    it('should mark task as not completed ([x] → [ ])', async () => {
      const task: Task = {
        id: 't3',
        title: 'Completed Task',
        description: '',
        dependencies: [],
        status: 'pending',
        createdAt: new Date(),
      };

      await updater.updateProgress(task, false);

      const content = await fs.readFile(tasksFile, 'utf-8');
      expect(content).toContain('- [ ] Task 3: Completed Task');
    });

    it('should get current progress', async () => {
      const progress = await updater.getProgress();

      expect(progress.total).toBe(4);
      expect(progress.completed).toBe(1); // Only Task 3 is completed
    });

    it('should update progress correctly after marking tasks', async () => {
      const task1: Task = {
        id: 't1',
        title: 'Sample Task',
        description: '',
        dependencies: [],
        status: 'completed',
        createdAt: new Date(),
      };

      const task2: Task = {
        id: 't2',
        title: 'Another Task',
        description: '',
        dependencies: [],
        status: 'completed',
        createdAt: new Date(),
      };

      await updater.updateProgress(task1, true);
      await updater.updateProgress(task2, true);

      const progress = await updater.getProgress();
      expect(progress.total).toBe(4);
      expect(progress.completed).toBe(3); // Tasks 1, 2, and 3 completed
    });

    it('should handle non-existent tasks.md gracefully', async () => {
      const nonExistentUpdater = new ProgressUpdater('/nonexistent/tasks.md');

      const task: Task = {
        id: 't1',
        title: 'Sample Task',
        description: '',
        dependencies: [],
        status: 'completed',
        createdAt: new Date(),
      };

      // Should not throw error
      await expect(nonExistentUpdater.updateProgress(task, true)).resolves.not.toThrow();

      const progress = await nonExistentUpdater.getProgress();
      expect(progress.total).toBe(0);
      expect(progress.completed).toBe(0);
    });

    it('should handle task title with special regex characters', async () => {
      const specialTasksMd = `# Tasks

- [ ] Task 1: Test (with parentheses)
- [ ] Task 2: Test [with brackets]
- [ ] Task 3: Test $with* special? chars+
`;

      await fs.writeFile(tasksFile, specialTasksMd, 'utf-8');

      const task: Task = {
        id: 't1',
        title: 'Test (with parentheses)',
        description: '',
        dependencies: [],
        status: 'completed',
        createdAt: new Date(),
      };

      await updater.updateProgress(task, true);

      const content = await fs.readFile(tasksFile, 'utf-8');
      expect(content).toContain('- [x] Task 1: Test (with parentheses)');
    });
  });
});
