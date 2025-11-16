/**
 * Change Workflow Manager
 * Manages specs/, changes/, archive/ directories
 * @module @musuhi-ng/change-workflow
 */

import type { IFileSystem } from '@musuhi-ng/core';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { ChangeWorkspace } from './types.js';

/**
 * Change Workflow Manager
 * Manages change workflow directories and permissions
 */
export class ChangeWorkflowManager {
  private projectRoot: string;

  /** Standard directory names */
  private readonly SPECS_DIR = 'specs';
  private readonly CHANGES_DIR = 'changes';
  private readonly ARCHIVE_DIR = 'archive';

  constructor(_fileSystem: IFileSystem, projectRoot: string) {
    // Keep fileSystem parameter for interface compatibility but use Node.js fs directly
    this.projectRoot = projectRoot;
  }

  /**
   * Initialize workflow directories
   * Creates specs/, changes/, archive/ if they don't exist
   */
  async initialize(): Promise<void> {
    const specsPath = this.getSpecsPath();
    const changesPath = this.getChangesPath();
    const archivePath = this.getArchivePath();

    // Create directories if they don't exist
    await this.ensureDirectoryExists(specsPath);
    await this.ensureDirectoryExists(changesPath);
    await this.ensureDirectoryExists(archivePath);
  }

  /**
   * Validate directory permissions
   */
  async validatePermissions(): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Check if project root exists
    try {
      await fs.access(this.projectRoot);
    } catch {
      errors.push(`Project root does not exist: ${this.projectRoot}`);
      return { valid: false, errors };
    }

    // Check if we can create directories
    try {
      await this.initialize();
    } catch (error) {
      errors.push(`Cannot create workflow directories: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get specs directory path
   */
  getSpecsPath(): string {
    return `${this.projectRoot}/${this.SPECS_DIR}`;
  }

  /**
   * Get changes directory path
   */
  getChangesPath(): string {
    return `${this.projectRoot}/${this.CHANGES_DIR}`;
  }

  /**
   * Get archive directory path
   */
  getArchivePath(): string {
    return `${this.projectRoot}/${this.CHANGES_DIR}/${this.ARCHIVE_DIR}`;
  }

  /**
   * Create change workspace
   * Returns workspace structure
   */
  async createChangeWorkspace(changeName: string): Promise<ChangeWorkspace> {
    // Ensure changes directory exists
    await this.ensureDirectoryExists(this.getChangesPath());

    // Create workspace directory with timestamp prefix
    const timestamp = this.getDatePrefix();
    const workspaceName = `${timestamp}-${changeName}`;
    const workspaceRoot = `${this.getChangesPath()}/${workspaceName}`;

    await this.ensureDirectoryExists(workspaceRoot);

    // Create specs subdirectory
    const specsDir = `${workspaceRoot}/specs`;
    await this.ensureDirectoryExists(specsDir);

    const workspace: ChangeWorkspace = {
      root: workspaceRoot,
      proposalPath: `${workspaceRoot}/proposal.md`,
      tasksPath: `${workspaceRoot}/tasks.md`,
      designPath: `${workspaceRoot}/design.md`,
      specsDir,
      createdAt: new Date(),
    };

    return workspace;
  }

  /**
   * List all changes (excluding archive)
   */
  async listChanges(): Promise<string[]> {
    const changesPath = this.getChangesPath();

    try {
      await fs.access(changesPath);
    } catch {
      return [];
    }

    try {
      const entries = await fs.readdir(changesPath, { withFileTypes: true });

      // Filter out archive directory and non-directories
      const changes: string[] = [];
      for (const entry of entries) {
        if (entry.name === this.ARCHIVE_DIR) {
          continue;
        }
        if (entry.isDirectory()) {
          changes.push(entry.name);
        }
      }

      return changes.sort().reverse(); // Most recent first
    } catch {
      return [];
    }
  }

  /**
   * Archive a change
   */
  async archiveChange(changeName: string): Promise<void> {
    const sourcePath = `${this.getChangesPath()}/${changeName}`;
    const destPath = `${this.getArchivePath()}/${changeName}`;

    // Ensure archive directory exists
    await this.ensureDirectoryExists(this.getArchivePath());

    // Check if source exists
    try {
      await fs.access(sourcePath);
    } catch {
      throw new Error(`Change directory does not exist: ${sourcePath}`);
    }

    // Move to archive recursively
    await this.copyDirectory(sourcePath, destPath);
    await this.deleteDirectory(sourcePath);
  }

  /**
   * Ensure directory exists, create if not
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Get current date prefix (YYYY-MM-DD format)
   */
  private getDatePrefix(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Copy directory recursively
   */
  private async copyDirectory(source: string, dest: string): Promise<void> {
    await this.ensureDirectoryExists(dest);

    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, destPath);
      } else if (entry.isFile()) {
        await fs.copyFile(sourcePath, destPath);
      }
    }
  }

  /**
   * Delete directory recursively
   */
  private async deleteDirectory(dirPath: string): Promise<void> {
    await fs.rm(dirPath, { recursive: true, force: true });
  }
}
