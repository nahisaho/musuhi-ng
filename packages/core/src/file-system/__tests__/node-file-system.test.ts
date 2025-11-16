/**
 * Tests for NodeFileSystem
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import { NodeFileSystem } from '../node-file-system.js';

describe('NodeFileSystem', () => {
  let fileSystem: NodeFileSystem;
  let testDir: string;

  beforeEach(async () => {
    fileSystem = new NodeFileSystem();
    testDir = path.join(process.cwd(), '.test-tmp');
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('writeFile and readFile', () => {
    it('should write and read a file successfully', async () => {
      const filePath = path.join(testDir, 'test.md');
      const content = '# Test Content';

      const writeResult = await fileSystem.writeFile(filePath, content, {
        createDirs: true,
      });

      expect(writeResult.path).toBe(filePath);
      expect(writeResult.bytesWritten).toBe(Buffer.byteLength(content));

      const readResult = await fileSystem.readFile(filePath);
      expect(readResult.content).toBe(content);
    });

    it('should include metadata when requested', async () => {
      const filePath = path.join(testDir, 'test.md');
      const content = '# Test';

      await fileSystem.writeFile(filePath, content, { createDirs: true });

      const readResult = await fileSystem.readFile(filePath, {
        includeMetadata: true,
      });

      expect(readResult.metadata).toBeDefined();
      expect(readResult.metadata?.path).toBe(filePath);
      expect(readResult.metadata?.format).toBe('markdown');
      expect(readResult.metadata?.checksum).toBeDefined();
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const filePath = path.join(testDir, 'exists.md');
      await fileSystem.writeFile(filePath, 'content', { createDirs: true });

      const exists = await fileSystem.fileExists(filePath);
      expect(exists).toBe(true);
    });

    it('should return false for non-existing file', async () => {
      const filePath = path.join(testDir, 'not-exists.md');
      const exists = await fileSystem.fileExists(filePath);
      expect(exists).toBe(false);
    });
  });

  describe('createDirectory', () => {
    it('should create directory recursively', async () => {
      const dirPath = path.join(testDir, 'a', 'b', 'c');

      const result = await fileSystem.createDirectory(dirPath, {
        recursive: true,
      });

      expect(result).toBe(dirPath);

      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
    });
  });

  describe('copyFile', () => {
    it('should copy file successfully', async () => {
      const sourcePath = path.join(testDir, 'source.md');
      const destPath = path.join(testDir, 'dest.md');
      const content = '# Source';

      await fileSystem.writeFile(sourcePath, content, { createDirs: true });

      const result = await fileSystem.copyFile(sourcePath, destPath, {
        createDirs: true,
      });

      expect(result).toBe(destPath);

      const readResult = await fileSystem.readFile(destPath);
      expect(readResult.content).toBe(content);
    });
  });

  describe('moveFile', () => {
    it('should move file successfully', async () => {
      const sourcePath = path.join(testDir, 'source.md');
      const destPath = path.join(testDir, 'dest.md');
      const content = '# Source';

      await fileSystem.writeFile(sourcePath, content, { createDirs: true });

      const result = await fileSystem.moveFile(sourcePath, destPath, {
        createDirs: true,
      });

      expect(result).toBe(destPath);

      const sourceExists = await fileSystem.fileExists(sourcePath);
      expect(sourceExists).toBe(false);

      const destExists = await fileSystem.fileExists(destPath);
      expect(destExists).toBe(true);

      const readResult = await fileSystem.readFile(destPath);
      expect(readResult.content).toBe(content);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const filePath = path.join(testDir, 'delete.md');
      await fileSystem.writeFile(filePath, 'content', { createDirs: true });

      await fileSystem.deleteFile(filePath);

      const exists = await fileSystem.fileExists(filePath);
      expect(exists).toBe(false);
    });
  });

  describe('listFiles', () => {
    it('should list all files in directory', async () => {
      await fileSystem.writeFile(path.join(testDir, 'file1.md'), 'content', {
        createDirs: true,
      });
      await fileSystem.writeFile(path.join(testDir, 'file2.md'), 'content', {
        createDirs: true,
      });
      await fileSystem.writeFile(path.join(testDir, 'sub', 'file3.md'), 'content', {
        createDirs: true,
      });

      const files = await fileSystem.listFiles(testDir);

      expect(files).toHaveLength(3);
      expect(files.some((f) => f.endsWith('file1.md'))).toBe(true);
      expect(files.some((f) => f.endsWith('file2.md'))).toBe(true);
      expect(files.some((f) => f.endsWith('file3.md'))).toBe(true);
    });

    it('should filter files by pattern', async () => {
      await fileSystem.writeFile(path.join(testDir, 'file1.md'), 'content', {
        createDirs: true,
      });
      await fileSystem.writeFile(path.join(testDir, 'file2.txt'), 'content', {
        createDirs: true,
      });

      const files = await fileSystem.listFiles(testDir, '*.md');

      expect(files).toHaveLength(1);
      expect(files[0]).toContain('file1.md');
    });
  });
});
