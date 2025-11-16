/**
 * ModeStorage Unit Tests
 *
 * Tests AC-7.9: Mode Persistence
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ModeStorage } from '../persistence/mode-storage.js';

describe('ModeStorage', () => {
  let storage: ModeStorage;
  const testProjectRoot = '/tmp/musuhi-test-mode';
  const configPath = path.join(testProjectRoot, '.musuhi', 'verification-mode.json');

  beforeEach(async () => {
    storage = new ModeStorage(testProjectRoot);
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

  describe('AC-7.9: Mode Persistence', () => {
    it('should save mode preference to disk', async () => {
      await storage.saveMode('enabled');

      const exists = await fs
        .access(configPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);

      const content = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(content);
      expect(config.mode).toBe('enabled');
      expect(config.updatedAt).toBeDefined();
    });

    it('should load mode preference from disk', async () => {
      await storage.saveMode('disabled');

      const mode = await storage.loadMode();
      expect(mode).toBe('disabled');
    });

    it('should default to enabled when no config exists', async () => {
      const mode = await storage.loadMode();
      expect(mode).toBe('enabled');
    });

    it('should overwrite existing mode preference', async () => {
      await storage.saveMode('enabled');
      let mode = await storage.loadMode();
      expect(mode).toBe('enabled');

      await storage.saveMode('disabled');
      mode = await storage.loadMode();
      expect(mode).toBe('disabled');
    });

    it('should include timestamp in saved config', async () => {
      const before = Date.now();
      await storage.saveMode('enabled');
      const after = Date.now();

      const content = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(content);
      const timestamp = new Date(config.updatedAt).getTime();

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should handle corrupted config file gracefully', async () => {
      await fs.mkdir(path.dirname(configPath), { recursive: true });
      await fs.writeFile(configPath, 'invalid json {', 'utf-8');

      const mode = await storage.loadMode();
      expect(mode).toBe('enabled'); // Default to enabled
    });

    it('should create .musuhi directory if it does not exist', async () => {
      const dirExists = await fs
        .access(path.dirname(configPath))
        .then(() => true)
        .catch(() => false);
      expect(dirExists).toBe(false);

      await storage.saveMode('enabled');

      const dirExistsAfter = await fs
        .access(path.dirname(configPath))
        .then(() => true)
        .catch(() => false);
      expect(dirExistsAfter).toBe(true);
    });
  });
});
