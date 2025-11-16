/**
 * Node.js File System Implementation
 * Implements IFileSystem interface using Node.js fs module
 * @module @musuhi/core/file-system
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import { glob } from 'glob';
import type {
  IFileSystem,
  FileMetadata,
  ReadOptions,
  WriteOptions,
  ReadResult,
  WriteResult,
} from '../types/file-system.js';

/**
 * Node.js-based File System implementation
 * Provides platform-independent file operations using Node.js fs module
 */
export class NodeFileSystem implements IFileSystem {
  /**
   * Read a file from the file system
   */
  async readFile(filePath: string, options?: ReadOptions): Promise<ReadResult> {
    const encoding = options?.encoding ?? 'utf-8';

    try {
      const content = await fs.readFile(filePath, encoding);

      const result: ReadResult = {
        content,
      };

      if (options?.includeMetadata) {
        result.metadata = await this.getMetadata(filePath);
      }

      return result;
    } catch (error) {
      throw new Error(
        `Failed to read file at ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Write content to a file
   */
  async writeFile(
    filePath: string,
    content: string,
    options?: WriteOptions
  ): Promise<WriteResult> {
    const encoding = options?.encoding ?? 'utf-8';

    try {
      // Check if file exists
      const exists = await this.fileExists(filePath);
      if (exists && options?.overwrite === false) {
        throw new Error(`File already exists at ${filePath} and overwrite is disabled`);
      }

      // Create parent directories if needed
      if (options?.createDirs) {
        const dirPath = path.dirname(filePath);
        await this.createDirectory(dirPath, { recursive: true });
      }

      // Write file
      await fs.writeFile(filePath, content, { encoding, mode: options?.mode });

      // Get metadata
      const metadata = await this.getMetadata(filePath);
      const bytesWritten = Buffer.byteLength(content, encoding);

      return {
        path: filePath,
        bytesWritten,
        metadata,
      };
    } catch (error) {
      throw new Error(
        `Failed to write file at ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getMetadata(filePath: string): Promise<FileMetadata> {
    try {
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath).toLowerCase();

      // Determine format from extension
      let format: 'markdown' | 'yaml' | 'json' = 'markdown';
      if (ext === '.yaml' || ext === '.yml') {
        format = 'yaml';
      } else if (ext === '.json') {
        format = 'json';
      }

      // Calculate checksum
      const content = await fs.readFile(filePath);
      const checksum = createHash('sha256').update(content).digest('hex');

      return {
        path: filePath,
        format,
        lastModified: stats.mtime,
        size: stats.size,
        checksum,
      };
    } catch (error) {
      throw new Error(
        `Failed to get metadata for ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(dirPath: string, pattern?: string): Promise<string[]> {
    try {
      const searchPattern = pattern ?? '**/*';
      const fullPattern = path.join(dirPath, searchPattern);

      const files = await glob(fullPattern, {
        nodir: true,
        absolute: true,
      });

      return files;
    } catch (error) {
      throw new Error(
        `Failed to list files in ${dirPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Create directory (and parent directories if needed)
   */
  async createDirectory(
    dirPath: string,
    options?: { recursive?: boolean }
  ): Promise<string> {
    try {
      await fs.mkdir(dirPath, { recursive: options?.recursive ?? false });
      return dirPath;
    } catch (error) {
      throw new Error(
        `Failed to create directory at ${dirPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      throw new Error(
        `Failed to delete file at ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Copy a file
   */
  async copyFile(
    sourcePath: string,
    destPath: string,
    options?: WriteOptions
  ): Promise<string> {
    try {
      // Create parent directories if needed
      if (options?.createDirs) {
        const dirPath = path.dirname(destPath);
        await this.createDirectory(dirPath, { recursive: true });
      }

      // Check if destination exists
      const exists = await this.fileExists(destPath);
      if (exists && options?.overwrite === false) {
        throw new Error(`File already exists at ${destPath} and overwrite is disabled`);
      }

      await fs.copyFile(sourcePath, destPath);
      return destPath;
    } catch (error) {
      throw new Error(
        `Failed to copy file from ${sourcePath} to ${destPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Move a file
   */
  async moveFile(
    sourcePath: string,
    destPath: string,
    options?: WriteOptions
  ): Promise<string> {
    try {
      // Create parent directories if needed
      if (options?.createDirs) {
        const dirPath = path.dirname(destPath);
        await this.createDirectory(dirPath, { recursive: true });
      }

      // Check if destination exists
      const exists = await this.fileExists(destPath);
      if (exists && options?.overwrite === false) {
        throw new Error(`File already exists at ${destPath} and overwrite is disabled`);
      }

      await fs.rename(sourcePath, destPath);
      return destPath;
    } catch (error) {
      throw new Error(
        `Failed to move file from ${sourcePath} to ${destPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
