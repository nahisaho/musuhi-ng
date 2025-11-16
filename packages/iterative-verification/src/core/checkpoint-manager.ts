/**
 * Checkpoint Manager
 *
 * Manages checkpoint persistence for resuming interrupted workflows.
 *
 * Requirement Coverage:
 * - AC-7.6: Resume from Checkpoint - Save and load checkpoint after each task
 *
 * Architecture:
 * - SOLID Principle: Single Responsibility - Only responsible for checkpoint persistence
 * - Article 2: Test-First - All methods covered by unit tests
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import type { Checkpoint, CheckpointState } from '../types/index.js';

/**
 * CheckpointManager - Persists and restores workflow checkpoints
 *
 * AC-7.6: Resume from Checkpoint
 * - Save checkpoint after each task completion
 * - Load checkpoint on workflow resume
 * - Clear checkpoint when workflow completes
 */
export class CheckpointManager {
  private checkpointPath: string;
  private currentCheckpoint?: Checkpoint;

  constructor(projectRoot: string) {
    this.checkpointPath = path.join(projectRoot, '.musuhi', 'checkpoint.json');
  }

  /**
   * Save checkpoint after task completion
   *
   * AC-7.6: Resume from Checkpoint
   * - Persist task ID, completed tasks, pending tasks, and state snapshot
   * - Serialize Map objects for JSON compatibility
   */
  async saveCheckpoint(
    taskId: string,
    completedTasks: string[],
    pendingTasks: string[],
    state: CheckpointState
  ): Promise<void> {
    const checkpoint: Checkpoint = {
      id: `checkpoint-${Date.now()}`,
      timestamp: new Date(),
      taskId,
      completedTasks,
      pendingTasks,
      state,
    };

    this.currentCheckpoint = checkpoint;

    // Ensure directory exists
    await fs.mkdir(path.dirname(this.checkpointPath), { recursive: true });

    // Write checkpoint with custom replacer for Map serialization
    await fs.writeFile(
      this.checkpointPath,
      JSON.stringify(checkpoint, this.replacer, 2),
      'utf-8'
    );
  }

  /**
   * Load checkpoint for workflow resume
   *
   * AC-7.6: Resume from Checkpoint
   * - Read checkpoint from disk
   * - Deserialize Map objects from JSON
   * - Return null if no checkpoint exists
   */
  async loadCheckpoint(): Promise<Checkpoint | null> {
    try {
      const content = await fs.readFile(this.checkpointPath, 'utf-8');
      const checkpoint = JSON.parse(content, this.reviver) as Checkpoint;
      this.currentCheckpoint = checkpoint;
      return checkpoint;
    } catch (error) {
      // No checkpoint exists or file is corrupted
      return null;
    }
  }

  /**
   * Clear checkpoint when workflow completes
   *
   * AC-7.6: Resume from Checkpoint
   * - Delete checkpoint file
   * - Clear in-memory checkpoint
   */
  async clearCheckpoint(): Promise<void> {
    try {
      await fs.unlink(this.checkpointPath);
      this.currentCheckpoint = undefined;
    } catch {
      // Checkpoint doesn't exist (already cleared)
    }
  }

  /**
   * Get current checkpoint (in-memory)
   */
  getCurrentCheckpoint(): Checkpoint | undefined {
    return this.currentCheckpoint;
  }

  /**
   * Custom JSON replacer for Map serialization
   *
   * Maps are not JSON-serializable by default, so we convert them to
   * a custom format: { __type: 'Map', value: Array<[key, value]> }
   */
  private replacer(_key: string, value: unknown): unknown {
    if (value instanceof Map) {
      return {
        __type: 'Map',
        value: Array.from(value.entries()),
      };
    }
    return value;
  }

  /**
   * Custom JSON reviver for Map deserialization
   *
   * Converts custom Map format back to Map objects
   */
  private reviver(_key: string, value: unknown): unknown {
    if (
      value &&
      typeof value === 'object' &&
      '__type' in value &&
      value.__type === 'Map' &&
      'value' in value &&
      Array.isArray(value.value)
    ) {
      return new Map(value.value as Array<[string, unknown]>);
    }
    return value;
  }
}
