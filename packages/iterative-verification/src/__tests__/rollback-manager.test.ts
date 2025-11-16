/**
 * RollbackManager Unit Tests
 *
 * Tests AC-7.5: Rollback Option
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import { RollbackManager } from '../core/rollback-manager.js';
import type { TaskResult, FileChange } from '../types/index.js';

describe('RollbackManager', () => {
  let manager: RollbackManager;
  const testDir = '/tmp/musuhi-test-rollback';
  const testFile1 = path.join(testDir, 'file1.ts');
  const testFile2 = path.join(testDir, 'file2.ts');
  const testFile3 = path.join(testDir, 'file3.ts');

  beforeEach(async () => {
    manager = new RollbackManager();
    // Clean up and create test directory
    try {
      await fs.rm(testDir, { recursive: true });
    } catch {
      // Directory doesn't exist
    }
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true });
    } catch {
      // Directory doesn't exist
    }
  });

  describe('AC-7.5: Rollback Option', () => {
    it('should rollback created file (delete)', async () => {
      // Create a file
      await fs.writeFile(testFile1, 'new content', 'utf-8');

      const result: TaskResult = {
        success: true,
        changes: [
          {
            path: testFile1,
            type: 'created',
            afterContent: 'new content',
          },
        ],
        errors: [],
        duration: 100,
        output: '',
      };

      await manager.rollback(result);

      // File should be deleted
      const exists = await fs
        .access(testFile1)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(false);
    });

    it('should rollback modified file (restore original)', async () => {
      const originalContent = 'original content';
      const modifiedContent = 'modified content';

      // Create original file
      await fs.writeFile(testFile1, modifiedContent, 'utf-8');

      const result: TaskResult = {
        success: true,
        changes: [
          {
            path: testFile1,
            type: 'modified',
            beforeContent: originalContent,
            afterContent: modifiedContent,
          },
        ],
        errors: [],
        duration: 100,
        output: '',
      };

      await manager.rollback(result);

      // File should have original content
      const content = await fs.readFile(testFile1, 'utf-8');
      expect(content).toBe(originalContent);
    });

    it('should rollback deleted file (restore)', async () => {
      const originalContent = 'deleted content';

      const result: TaskResult = {
        success: true,
        changes: [
          {
            path: testFile1,
            type: 'deleted',
            beforeContent: originalContent,
          },
        ],
        errors: [],
        duration: 100,
        output: '',
      };

      await manager.rollback(result);

      // File should be restored
      const content = await fs.readFile(testFile1, 'utf-8');
      expect(content).toBe(originalContent);
    });

    it('should rollback multiple changes in reverse order', async () => {
      // Simulate multiple file changes
      await fs.writeFile(testFile1, 'new1', 'utf-8');
      await fs.writeFile(testFile2, 'modified2', 'utf-8');
      await fs.writeFile(testFile3, 'new3', 'utf-8');

      const result: TaskResult = {
        success: true,
        changes: [
          { path: testFile1, type: 'created', afterContent: 'new1' },
          {
            path: testFile2,
            type: 'modified',
            beforeContent: 'original2',
            afterContent: 'modified2',
          },
          { path: testFile3, type: 'created', afterContent: 'new3' },
        ],
        errors: [],
        duration: 100,
        output: '',
      };

      await manager.rollback(result);

      // File1 and File3 should be deleted (created files)
      const exists1 = await fs
        .access(testFile1)
        .then(() => true)
        .catch(() => false);
      const exists3 = await fs
        .access(testFile3)
        .then(() => true)
        .catch(() => false);
      expect(exists1).toBe(false);
      expect(exists3).toBe(false);

      // File2 should be restored
      const content2 = await fs.readFile(testFile2, 'utf-8');
      expect(content2).toBe('original2');
    });

    it('should handle rollback errors gracefully', async () => {
      // Try to rollback non-existent file
      const result: TaskResult = {
        success: true,
        changes: [
          {
            path: '/nonexistent/file.ts',
            type: 'created',
          },
        ],
        errors: [],
        duration: 100,
        output: '',
      };

      // Should not throw error
      await expect(manager.rollback(result)).resolves.not.toThrow();
    });

    it('should create snapshot of file contents', async () => {
      await fs.writeFile(testFile1, 'content1', 'utf-8');
      await fs.writeFile(testFile2, 'content2', 'utf-8');

      const snapshot = await manager.createSnapshot([testFile1, testFile2, testFile3]);

      expect(snapshot.size).toBe(3);
      expect(snapshot.get(testFile1)).toBe('content1');
      expect(snapshot.get(testFile2)).toBe('content2');
      expect(snapshot.get(testFile3)).toBe(''); // Non-existent file
    });

    it('should handle empty changes list', async () => {
      const result: TaskResult = {
        success: true,
        changes: [],
        errors: [],
        duration: 100,
        output: '',
      };

      await expect(manager.rollback(result)).resolves.not.toThrow();
    });
  });
});
