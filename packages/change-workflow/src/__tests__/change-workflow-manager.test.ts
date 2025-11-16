/**
 * Change Workflow Manager Tests
 * @module @musuhi/change-workflow
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChangeWorkflowManager } from '../change-workflow-manager.js';
import { NodeFileSystem } from '@musuhi/core';
import * as path from 'path';
import { promises as fs } from 'fs';

describe('ChangeWorkflowManager', () => {
  let manager: ChangeWorkflowManager;
  let fsManager: NodeFileSystem;
  let testRoot: string;

  beforeEach(async () => {
    // Create temporary test directory
    testRoot = path.join('/tmp', `musuhi-test-${Date.now()}`);
    await fs.mkdir(testRoot, { recursive: true });

    fsManager = new NodeFileSystem();
    manager = new ChangeWorkflowManager(fsManager, testRoot);
  });

  afterEach(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testRoot, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('initialize', () => {
    it('should create specs/, changes/, and archive/ directories', async () => {
      await manager.initialize();

      // Use fs.access to check directory existence
      const specsExists = await fs.access(manager.getSpecsPath()).then(() => true).catch(() => false);
      const changesExists = await fs.access(manager.getChangesPath()).then(() => true).catch(() => false);
      const archiveExists = await fs.access(manager.getArchivePath()).then(() => true).catch(() => false);

      expect(specsExists).toBe(true);
      expect(changesExists).toBe(true);
      expect(archiveExists).toBe(true);
    });

    it('should be idempotent (safe to call multiple times)', async () => {
      await manager.initialize();
      await manager.initialize();
      await manager.initialize();

      // Use fs.access to check directory existence
      const specsExists = await fs.access(manager.getSpecsPath()).then(() => true).catch(() => false);
      expect(specsExists).toBe(true);
    });
  });

  describe('validatePermissions', () => {
    it('should validate permissions successfully after initialization', async () => {
      const result = await manager.validatePermissions();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation if project root does not exist', async () => {
      const invalidManager = new ChangeWorkflowManager(fsManager, '/nonexistent/path/xyz');

      const result = await invalidManager.validatePermissions();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('createChangeWorkspace', () => {
    it('should create workspace with correct structure', async () => {
      await manager.initialize();

      const workspace = await manager.createChangeWorkspace('add-new-feature');

      expect(workspace.root).toContain('add-new-feature');
      expect(workspace.proposalPath).toContain('proposal.md');
      expect(workspace.tasksPath).toContain('tasks.md');
      expect(workspace.designPath).toContain('design.md');
      expect(workspace.specsDir).toContain('specs');

      // Verify directories exist using fs.access
      const rootExists = await fs.access(workspace.root).then(() => true).catch(() => false);
      const specsExists = await fs.access(workspace.specsDir).then(() => true).catch(() => false);

      expect(rootExists).toBe(true);
      expect(specsExists).toBe(true);
    });

    it('should include date prefix in workspace name', async () => {
      await manager.initialize();

      const workspace = await manager.createChangeWorkspace('test-change');

      // Should match pattern: YYYY-MM-DD-test-change
      const datePattern = /\d{4}-\d{2}-\d{2}-test-change/;
      expect(workspace.root).toMatch(datePattern);
    });
  });

  describe('listChanges', () => {
    it('should return empty array when no changes exist', async () => {
      await manager.initialize();

      const changes = await manager.listChanges();

      expect(changes).toEqual([]);
    });

    it('should list all changes (excluding archive)', async () => {
      await manager.initialize();

      await manager.createChangeWorkspace('change-1');
      await manager.createChangeWorkspace('change-2');

      const changes = await manager.listChanges();

      expect(changes.length).toBe(2);
      // Most recent first (sorted in reverse)
      expect(changes[0]).toContain('change-2');
      expect(changes[1]).toContain('change-1');
    });

    it('should exclude archive directory from listing', async () => {
      await manager.initialize();

      await manager.createChangeWorkspace('test-change');

      const changes = await manager.listChanges();

      // Should not include 'archive' in the list
      const hasArchive = changes.some((c) => c === 'archive');
      expect(hasArchive).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return correct specs path', () => {
      const specsPath = manager.getSpecsPath();

      expect(specsPath).toBe(`${testRoot}/specs`);
    });

    it('should return correct changes path', () => {
      const changesPath = manager.getChangesPath();

      expect(changesPath).toBe(`${testRoot}/changes`);
    });

    it('should return correct archive path', () => {
      const archivePath = manager.getArchivePath();

      expect(archivePath).toBe(`${testRoot}/changes/archive`);
    });
  });
});
