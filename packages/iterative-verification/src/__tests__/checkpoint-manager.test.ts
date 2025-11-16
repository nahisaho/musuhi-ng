/**
 * CheckpointManager Unit Tests
 *
 * Tests AC-7.6: Resume from Checkpoint
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import { CheckpointManager } from '../core/checkpoint-manager.js';
import type { CheckpointState } from '../types/index.js';

describe('CheckpointManager', () => {
  let manager: CheckpointManager;
  const testProjectRoot = '/tmp/musuhi-test-checkpoint';
  const checkpointPath = path.join(testProjectRoot, '.musuhi', 'checkpoint.json');

  beforeEach(async () => {
    manager = new CheckpointManager(testProjectRoot);
    // Clean up test directory
    try {
      await fs.rm(testProjectRoot, { recursive: true });
    } catch {
      // Directory doesn't exist
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testProjectRoot, { recursive: true });
    } catch {
      // Directory doesn't exist
    }
  });

  describe('AC-7.6: Resume from Checkpoint', () => {
    it('should save checkpoint to disk', async () => {
      const state: CheckpointState = {
        filesSnapshot: new Map([['file1.ts', 'content1']]),
        currentTaskIndex: 0,
        totalTasks: 5,
        errors: [],
      };

      await manager.saveCheckpoint('t1', ['t1'], ['t2', 't3'], state);

      // Verify file exists
      const exists = await fs
        .access(checkpointPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);

      // Verify content
      const content = await fs.readFile(checkpointPath, 'utf-8');
      const checkpoint = JSON.parse(content);
      expect(checkpoint.taskId).toBe('t1');
      expect(checkpoint.completedTasks).toEqual(['t1']);
      expect(checkpoint.pendingTasks).toEqual(['t2', 't3']);
    });

    it('should load checkpoint from disk', async () => {
      const state: CheckpointState = {
        filesSnapshot: new Map([['file1.ts', 'content1']]),
        currentTaskIndex: 2,
        totalTasks: 5,
        errors: [],
      };

      await manager.saveCheckpoint('t2', ['t1', 't2'], ['t3', 't4', 't5'], state);

      const loaded = await manager.loadCheckpoint();

      expect(loaded).not.toBeNull();
      expect(loaded!.taskId).toBe('t2');
      expect(loaded!.completedTasks).toEqual(['t1', 't2']);
      expect(loaded!.pendingTasks).toEqual(['t3', 't4', 't5']);
      expect(loaded!.state.currentTaskIndex).toBe(2);
      expect(loaded!.state.totalTasks).toBe(5);
    });

    it('should return null when no checkpoint exists', async () => {
      const loaded = await manager.loadCheckpoint();
      expect(loaded).toBeNull();
    });

    it('should clear checkpoint from disk', async () => {
      const state: CheckpointState = {
        filesSnapshot: new Map(),
        currentTaskIndex: 0,
        totalTasks: 1,
        errors: [],
      };

      await manager.saveCheckpoint('t1', ['t1'], [], state);

      // Verify checkpoint exists
      let exists = await fs
        .access(checkpointPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);

      // Clear checkpoint
      await manager.clearCheckpoint();

      // Verify checkpoint is deleted
      exists = await fs
        .access(checkpointPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(false);
    });

    it('should handle Map serialization in checkpoint state', async () => {
      const state: CheckpointState = {
        filesSnapshot: new Map([
          ['file1.ts', 'content1'],
          ['file2.ts', 'content2'],
          ['file3.ts', 'content3'],
        ]),
        currentTaskIndex: 1,
        totalTasks: 3,
        errors: [],
      };

      await manager.saveCheckpoint('t2', ['t1', 't2'], ['t3'], state);

      const loaded = await manager.loadCheckpoint();

      expect(loaded).not.toBeNull();
      expect(loaded!.state.filesSnapshot).toBeInstanceOf(Map);
      expect(loaded!.state.filesSnapshot.size).toBe(3);
      expect(loaded!.state.filesSnapshot.get('file1.ts')).toBe('content1');
      expect(loaded!.state.filesSnapshot.get('file2.ts')).toBe('content2');
      expect(loaded!.state.filesSnapshot.get('file3.ts')).toBe('content3');
    });

    it('should update current checkpoint in memory', async () => {
      expect(manager.getCurrentCheckpoint()).toBeUndefined();

      const state: CheckpointState = {
        filesSnapshot: new Map(),
        currentTaskIndex: 0,
        totalTasks: 1,
        errors: [],
      };

      await manager.saveCheckpoint('t1', ['t1'], [], state);

      const current = manager.getCurrentCheckpoint();
      expect(current).toBeDefined();
      expect(current!.taskId).toBe('t1');
    });

    it('should handle multiple save/load cycles', async () => {
      const state1: CheckpointState = {
        filesSnapshot: new Map([['file1.ts', 'v1']]),
        currentTaskIndex: 0,
        totalTasks: 3,
        errors: [],
      };

      const state2: CheckpointState = {
        filesSnapshot: new Map([['file1.ts', 'v2']]),
        currentTaskIndex: 1,
        totalTasks: 3,
        errors: [],
      };

      // Save checkpoint 1
      await manager.saveCheckpoint('t1', ['t1'], ['t2', 't3'], state1);
      let loaded = await manager.loadCheckpoint();
      expect(loaded!.state.filesSnapshot.get('file1.ts')).toBe('v1');

      // Save checkpoint 2 (overwrites checkpoint 1)
      await manager.saveCheckpoint('t2', ['t1', 't2'], ['t3'], state2);
      loaded = await manager.loadCheckpoint();
      expect(loaded!.state.filesSnapshot.get('file1.ts')).toBe('v2');
      expect(loaded!.taskId).toBe('t2');
    });

    it('should create .musuhi directory if it does not exist', async () => {
      const state: CheckpointState = {
        filesSnapshot: new Map(),
        currentTaskIndex: 0,
        totalTasks: 1,
        errors: [],
      };

      // Directory should not exist initially
      const dirExists = await fs
        .access(path.dirname(checkpointPath))
        .then(() => true)
        .catch(() => false);
      expect(dirExists).toBe(false);

      await manager.saveCheckpoint('t1', ['t1'], [], state);

      // Directory should be created
      const dirExistsAfter = await fs
        .access(path.dirname(checkpointPath))
        .then(() => true)
        .catch(() => false);
      expect(dirExistsAfter).toBe(true);
    });
  });
});
