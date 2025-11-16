/**
 * Rollback Manager
 *
 * Manages rollback of task changes to restore previous state.
 *
 * Requirement Coverage:
 * - AC-7.5: Rollback Option - Undo changes and mark task failed
 *
 * Architecture:
 * - SOLID Principle: Single Responsibility - Only responsible for rollback operations
 * - Article 2: Test-First - All methods covered by unit tests
 */

import { promises as fs } from 'fs';
import type { FileChange, TaskResult } from '../types/index.js';

/**
 * RollbackManager - Reverts file changes made by task execution
 *
 * AC-7.5: Rollback Option
 * - Undo all file changes (created, modified, deleted)
 * - Restore original file content
 * - Handle missing files gracefully
 */
export class RollbackManager {
  /**
   * Rollback all task changes
   *
   * AC-7.5: Rollback Option
   * - Iterate through all file changes in reverse order
   * - Revert each change based on change type
   * - Log warnings for failed rollbacks (non-blocking)
   */
  async rollback(result: TaskResult): Promise<void> {
    // Process changes in reverse order (LIFO for safety)
    for (let i = result.changes.length - 1; i >= 0; i--) {
      const change = result.changes[i];
      if (change) {
        await this.revertChange(change);
      }
    }
  }

  /**
   * Revert a single file change
   *
   * AC-7.5: Rollback Option
   * - created: Delete the file
   * - modified: Restore original content
   * - deleted: Restore the file
   */
  private async revertChange(change: FileChange): Promise<void> {
    switch (change.type) {
      case 'created':
        // Delete created file
        try {
          await fs.unlink(change.path);
        } catch (error) {
          console.warn(`Failed to delete ${change.path}:`, error);
        }
        break;

      case 'modified':
        // Restore original content
        if (change.beforeContent !== undefined) {
          try {
            await fs.writeFile(change.path, change.beforeContent, 'utf-8');
          } catch (error) {
            console.warn(`Failed to restore ${change.path}:`, error);
          }
        }
        break;

      case 'deleted':
        // Restore deleted file
        if (change.beforeContent !== undefined) {
          try {
            await fs.writeFile(change.path, change.beforeContent, 'utf-8');
          } catch (error) {
            console.warn(`Failed to restore ${change.path}:`, error);
          }
        }
        break;
    }
  }

  /**
   * Create snapshot of file contents for rollback
   *
   * AC-7.5: Rollback Option
   * - Read current file contents before task execution
   * - Store snapshot for later rollback
   * - Handle non-existent files (empty string)
   */
  async createSnapshot(filePaths: string[]): Promise<Map<string, string>> {
    const snapshot = new Map<string, string>();

    for (const filePath of filePaths) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        snapshot.set(filePath, content);
      } catch {
        // File doesn't exist yet (will be created by task)
        snapshot.set(filePath, '');
      }
    }

    return snapshot;
  }
}
