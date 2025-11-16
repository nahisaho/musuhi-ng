/**
 * Delta Manager Tests
 * @module @musuhi/change-workflow
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DeltaManager } from '../delta-manager.js';
import type { ChangeDelta, DeltaOperation } from '../types.js';
import { promises as fs } from 'fs';
import * as path from 'path';

describe('DeltaManager', () => {
  let manager: DeltaManager;
  let testDir: string;

  beforeEach(async () => {
    manager = new DeltaManager();
    testDir = path.join('/tmp', `delta-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('detectChanges', () => {
    it('should detect added files', async () => {
      const baseDir = path.join(testDir, 'base');
      const changedDir = path.join(testDir, 'changed');

      await fs.mkdir(baseDir, { recursive: true });
      await fs.mkdir(changedDir, { recursive: true });

      // Add a new file in changedDir
      await fs.writeFile(path.join(changedDir, 'new-file.md'), 'New content', 'utf-8');

      const delta = await manager.detectChanges(baseDir, changedDir);

      expect(delta.operations).toHaveLength(1);
      expect(delta.operations[0]!.type).toBe('ADDED');
      expect(delta.operations[0]!.specPath).toBe('new-file.md');
      expect(delta.operations[0]!.content).toBe('New content');
      expect(delta.affectedSpecs).toEqual(['new-file.md']);
    });

    it('should detect removed files', async () => {
      const baseDir = path.join(testDir, 'base');
      const changedDir = path.join(testDir, 'changed');

      await fs.mkdir(baseDir, { recursive: true });
      await fs.mkdir(changedDir, { recursive: true });

      // File exists in base but not in changed
      await fs.writeFile(path.join(baseDir, 'removed-file.md'), 'Content', 'utf-8');

      const delta = await manager.detectChanges(baseDir, changedDir);

      expect(delta.operations).toHaveLength(1);
      expect(delta.operations[0]!.type).toBe('REMOVED');
      expect(delta.operations[0]!.specPath).toBe('removed-file.md');
      expect(delta.affectedSpecs).toEqual(['removed-file.md']);
    });

    it('should detect modified files', async () => {
      const baseDir = path.join(testDir, 'base');
      const changedDir = path.join(testDir, 'changed');

      await fs.mkdir(baseDir, { recursive: true });
      await fs.mkdir(changedDir, { recursive: true });

      // Same file with different content
      await fs.writeFile(path.join(baseDir, 'file.md'), 'Original content', 'utf-8');
      await fs.writeFile(path.join(changedDir, 'file.md'), 'Modified content', 'utf-8');

      const delta = await manager.detectChanges(baseDir, changedDir);

      expect(delta.operations).toHaveLength(1);
      expect(delta.operations[0]!.type).toBe('MODIFIED');
      expect(delta.operations[0]!.specPath).toBe('file.md');
      expect(delta.operations[0]!.content).toBe('Modified content');
      expect(delta.affectedSpecs).toEqual(['file.md']);
    });

    it('should detect multiple changes', async () => {
      const baseDir = path.join(testDir, 'base');
      const changedDir = path.join(testDir, 'changed');

      await fs.mkdir(baseDir, { recursive: true });
      await fs.mkdir(changedDir, { recursive: true });

      await fs.writeFile(path.join(baseDir, 'old.md'), 'Old', 'utf-8');
      await fs.writeFile(path.join(baseDir, 'modified.md'), 'Original', 'utf-8');
      await fs.writeFile(path.join(changedDir, 'modified.md'), 'Modified', 'utf-8');
      await fs.writeFile(path.join(changedDir, 'new.md'), 'New', 'utf-8');

      const delta = await manager.detectChanges(baseDir, changedDir);

      expect(delta.operations).toHaveLength(3);
      expect(delta.affectedSpecs).toContain('old.md');
      expect(delta.affectedSpecs).toContain('modified.md');
      expect(delta.affectedSpecs).toContain('new.md');
    });

    it('should ignore unchanged files', async () => {
      const baseDir = path.join(testDir, 'base');
      const changedDir = path.join(testDir, 'changed');

      await fs.mkdir(baseDir, { recursive: true });
      await fs.mkdir(changedDir, { recursive: true });

      const content = 'Same content';
      await fs.writeFile(path.join(baseDir, 'unchanged.md'), content, 'utf-8');
      await fs.writeFile(path.join(changedDir, 'unchanged.md'), content, 'utf-8');

      const delta = await manager.detectChanges(baseDir, changedDir);

      expect(delta.operations).toHaveLength(0);
      expect(delta.affectedSpecs).toHaveLength(0);
    });
  });

  describe('createDelta', () => {
    it('should create delta from single operation', () => {
      const operation: DeltaOperation = {
        type: 'ADDED',
        specPath: 'test.md',
        content: 'Test content',
      };

      const delta = manager.createDelta(operation);

      expect(delta.operations).toHaveLength(1);
      expect(delta.operations[0]).toEqual(operation);
      expect(delta.affectedSpecs).toEqual(['test.md']);
    });
  });

  describe('mergeDeltas', () => {
    it('should merge multiple deltas', () => {
      const delta1: ChangeDelta = {
        operations: [
          { type: 'ADDED', specPath: 'file1.md', content: 'Content 1' },
        ],
        affectedSpecs: ['file1.md'],
      };

      const delta2: ChangeDelta = {
        operations: [
          { type: 'ADDED', specPath: 'file2.md', content: 'Content 2' },
        ],
        affectedSpecs: ['file2.md'],
      };

      const merged = manager.mergeDeltas([delta1, delta2]);

      expect(merged.operations).toHaveLength(2);
      expect(merged.affectedSpecs).toContain('file1.md');
      expect(merged.affectedSpecs).toContain('file2.md');
    });

    it('should handle duplicate spec paths (keep last)', () => {
      const delta1: ChangeDelta = {
        operations: [
          { type: 'ADDED', specPath: 'file.md', content: 'First' },
        ],
        affectedSpecs: ['file.md'],
      };

      const delta2: ChangeDelta = {
        operations: [
          { type: 'MODIFIED', specPath: 'file.md', content: 'Second' },
        ],
        affectedSpecs: ['file.md'],
      };

      const merged = manager.mergeDeltas([delta1, delta2]);

      expect(merged.operations).toHaveLength(1);
      expect(merged.operations[0]!.type).toBe('MODIFIED');
      expect(merged.operations[0]!.content).toBe('Second');
    });
  });

  describe('applyDelta', () => {
    it('should apply ADDED operation', async () => {
      const targetDir = path.join(testDir, 'target');
      await fs.mkdir(targetDir, { recursive: true });

      const delta: ChangeDelta = {
        operations: [
          { type: 'ADDED', specPath: 'new.md', content: 'New content' },
        ],
        affectedSpecs: ['new.md'],
      };

      const result = await manager.applyDelta(delta, targetDir);

      expect(result.success).toBe(true);
      expect(result.appliedOperations).toBe(1);
      expect(result.errors).toHaveLength(0);

      const fileContent = await fs.readFile(path.join(targetDir, 'new.md'), 'utf-8');
      expect(fileContent).toBe('New content');
    });

    it('should apply MODIFIED operation', async () => {
      const targetDir = path.join(testDir, 'target');
      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(path.join(targetDir, 'file.md'), 'Original', 'utf-8');

      const delta: ChangeDelta = {
        operations: [
          { type: 'MODIFIED', specPath: 'file.md', content: 'Modified' },
        ],
        affectedSpecs: ['file.md'],
      };

      const result = await manager.applyDelta(delta, targetDir);

      expect(result.success).toBe(true);
      expect(result.appliedOperations).toBe(1);

      const fileContent = await fs.readFile(path.join(targetDir, 'file.md'), 'utf-8');
      expect(fileContent).toBe('Modified');
    });

    it('should apply REMOVED operation', async () => {
      const targetDir = path.join(testDir, 'target');
      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(path.join(targetDir, 'file.md'), 'Content', 'utf-8');

      const delta: ChangeDelta = {
        operations: [
          { type: 'REMOVED', specPath: 'file.md', content: '' },
        ],
        affectedSpecs: ['file.md'],
      };

      const result = await manager.applyDelta(delta, targetDir);

      expect(result.success).toBe(true);
      expect(result.appliedOperations).toBe(1);

      await expect(fs.access(path.join(targetDir, 'file.md'))).rejects.toThrow();
    });

    it('should handle remove of non-existent file with warning', async () => {
      const targetDir = path.join(testDir, 'target');
      await fs.mkdir(targetDir, { recursive: true });

      const delta: ChangeDelta = {
        operations: [
          { type: 'REMOVED', specPath: 'nonexistent.md', content: '' },
        ],
        affectedSpecs: ['nonexistent.md'],
      };

      const result = await manager.applyDelta(delta, targetDir);

      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('already removed');
    });
  });

  describe('compareDelta', () => {
    it('should identify added files', () => {
      const delta1: ChangeDelta = {
        operations: [],
        affectedSpecs: [],
      };

      const delta2: ChangeDelta = {
        operations: [
          { type: 'ADDED', specPath: 'new.md', content: 'New' },
        ],
        affectedSpecs: ['new.md'],
      };

      const comparison = manager.compareDelta(delta1, delta2);

      expect(comparison.added).toEqual(['new.md']);
      expect(comparison.modified).toHaveLength(0);
      expect(comparison.removed).toHaveLength(0);
      expect(comparison.totalChanges).toBe(1);
    });

    it('should identify modified files', () => {
      const delta1: ChangeDelta = {
        operations: [
          { type: 'ADDED', specPath: 'file.md', content: 'Original' },
        ],
        affectedSpecs: ['file.md'],
      };

      const delta2: ChangeDelta = {
        operations: [
          { type: 'MODIFIED', specPath: 'file.md', content: 'Modified' },
        ],
        affectedSpecs: ['file.md'],
      };

      const comparison = manager.compareDelta(delta1, delta2);

      expect(comparison.modified).toEqual(['file.md']);
      expect(comparison.totalChanges).toBe(1);
    });
  });

  describe('serialize/deserialize', () => {
    it('should serialize and deserialize delta', () => {
      const delta: ChangeDelta = {
        operations: [
          { type: 'ADDED', specPath: 'file.md', content: 'Content' },
        ],
        affectedSpecs: ['file.md'],
      };

      const serialized = manager.serializeDelta(delta);
      const deserialized = manager.deserializeDelta(serialized);

      expect(deserialized).toEqual(delta);
    });
  });

  describe('getDeltaSummary', () => {
    it('should generate summary for delta', () => {
      const delta: ChangeDelta = {
        operations: [
          { type: 'ADDED', specPath: 'new.md', content: 'New' },
          { type: 'MODIFIED', specPath: 'changed.md', content: 'Changed' },
          { type: 'REMOVED', specPath: 'deleted.md', content: '' },
        ],
        affectedSpecs: ['new.md', 'changed.md', 'deleted.md'],
      };

      const summary = manager.getDeltaSummary(delta);

      expect(summary).toContain('3 files affected');
      expect(summary).toContain('1 added');
      expect(summary).toContain('1 modified');
      expect(summary).toContain('1 removed');
    });

    it('should handle empty delta', () => {
      const delta: ChangeDelta = {
        operations: [],
        affectedSpecs: [],
      };

      const summary = manager.getDeltaSummary(delta);

      expect(summary).toBe('No changes');
    });
  });

  describe('validateDelta', () => {
    it('should validate correct delta', () => {
      const delta: ChangeDelta = {
        operations: [
          { type: 'ADDED', specPath: 'file.md', content: 'Content' },
        ],
        affectedSpecs: ['file.md'],
      };

      const result = manager.validateDelta(delta);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing content for non-REMOVED operations', () => {
      const delta: ChangeDelta = {
        operations: [
          { type: 'ADDED', specPath: 'file.md', content: '' },
        ],
        affectedSpecs: ['file.md'],
      };

      const result = manager.validateDelta(delta);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid operation type', () => {
      const delta: ChangeDelta = {
        operations: [
          { type: 'INVALID' as any, specPath: 'file.md', content: 'Content' },
        ],
        affectedSpecs: ['file.md'],
      };

      const result = manager.validateDelta(delta);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid operation type'))).toBe(true);
    });
  });
});
