/**
 * ProgressTracker - Real-time progress monitoring and event emission
 *
 * AC-4.9: Progress Monitoring
 * - Track task status changes in real-time
 * - Emit progress events for dashboard integration
 * - Provide current progress snapshots
 */

import { EventEmitter } from 'node:events';
import type { Task, ProgressSnapshot, ProgressEvent } from '../types/index.js';

/**
 * Tracks execution progress and emits real-time updates
 *
 * AC-4.9: WHEN tasks are executing, the system SHALL provide real-time progress updates
 * including active, completed, pending, failed, and cancelled task counts
 */
export class ProgressTracker extends EventEmitter {
  private tasks: Task[];
  private currentWave?: number;

  constructor(tasks: Task[]) {
    super();
    this.tasks = tasks;
  }

  /**
   * Get current progress snapshot
   *
   * AC-4.9: Real-time progress monitoring
   *
   * @returns Current progress snapshot
   *
   * @example
   * ```typescript
   * const tracker = new ProgressTracker(tasks);
   * const snapshot = tracker.getSnapshot();
   * // Returns: { active: 3, completed: 5, pending: 2, failed: 0, cancelled: 0, total: 10 }
   * ```
   */
  public getSnapshot(): ProgressSnapshot {
    const counts = {
      active: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      cancelled: 0,
    };

    for (const task of this.tasks) {
      switch (task.status) {
        case 'running':
          counts.active++;
          break;
        case 'completed':
          counts.completed++;
          break;
        case 'pending':
          counts.pending++;
          break;
        case 'failed':
          counts.failed++;
          break;
        case 'cancelled':
          counts.cancelled++;
          break;
      }
    }

    return {
      ...counts,
      total: this.tasks.length,
      currentWave: this.currentWave,
      timestamp: Date.now(),
    };
  }

  /**
   * Notify task start
   *
   * Emits 'task-start' event
   *
   * @param taskId - Task that started
   */
  public notifyTaskStart(taskId: string): void {
    const event: ProgressEvent = {
      type: 'task-start',
      taskId,
      progress: this.getSnapshot(),
      timestamp: Date.now(),
    };

    this.emit('progress', event);
    this.emit('task-start', event);
  }

  /**
   * Notify task completion
   *
   * Emits 'task-complete' event
   *
   * @param taskId - Task that completed
   */
  public notifyTaskComplete(taskId: string): void {
    const event: ProgressEvent = {
      type: 'task-complete',
      taskId,
      progress: this.getSnapshot(),
      timestamp: Date.now(),
    };

    this.emit('progress', event);
    this.emit('task-complete', event);
  }

  /**
   * Notify task failure
   *
   * Emits 'task-fail' event
   *
   * @param taskId - Task that failed
   */
  public notifyTaskFail(taskId: string): void {
    const event: ProgressEvent = {
      type: 'task-fail',
      taskId,
      progress: this.getSnapshot(),
      timestamp: Date.now(),
    };

    this.emit('progress', event);
    this.emit('task-fail', event);
  }

  /**
   * Notify task cancellation
   *
   * Emits 'task-cancel' event
   *
   * @param taskId - Task that was cancelled
   */
  public notifyTaskCancel(taskId: string): void {
    const event: ProgressEvent = {
      type: 'task-cancel',
      taskId,
      progress: this.getSnapshot(),
      timestamp: Date.now(),
    };

    this.emit('progress', event);
    this.emit('task-cancel', event);
  }

  /**
   * Notify wave start
   *
   * Emits 'wave-start' event
   *
   * @param wave - Wave number starting
   */
  public notifyWaveStart(wave: number): void {
    this.currentWave = wave;

    const event: ProgressEvent = {
      type: 'wave-start',
      wave,
      progress: this.getSnapshot(),
      timestamp: Date.now(),
    };

    this.emit('progress', event);
    this.emit('wave-start', event);
  }

  /**
   * Notify wave completion
   *
   * Emits 'wave-complete' event
   *
   * @param wave - Wave number that completed
   */
  public notifyWaveComplete(wave: number): void {
    const event: ProgressEvent = {
      type: 'wave-complete',
      wave,
      progress: this.getSnapshot(),
      timestamp: Date.now(),
    };

    this.emit('progress', event);
    this.emit('wave-complete', event);
  }

  /**
   * Get completion percentage
   *
   * @returns Completion percentage (0-100)
   */
  public getCompletionPercentage(): number {
    const snapshot = this.getSnapshot();
    if (snapshot.total === 0) {
      return 0;
    }
    return (snapshot.completed / snapshot.total) * 100;
  }

  /**
   * Check if execution is complete
   *
   * @returns true if all tasks are in terminal state (completed/failed/cancelled)
   */
  public isComplete(): boolean {
    const snapshot = this.getSnapshot();
    return snapshot.pending === 0 && snapshot.active === 0;
  }

  /**
   * Check if execution was successful
   *
   * @returns true if all tasks completed successfully (no failures or cancellations)
   */
  public isSuccessful(): boolean {
    const snapshot = this.getSnapshot();
    return (
      this.isComplete() &&
      snapshot.failed === 0 &&
      snapshot.cancelled === 0 &&
      snapshot.completed === snapshot.total
    );
  }

  /**
   * Get progress summary string
   *
   * Human-readable progress summary
   *
   * @returns Progress summary string
   *
   * @example
   * ```typescript
   * const summary = tracker.getSummary();
   * // Returns: "Progress: 5/10 completed (50%), 3 active, 2 pending"
   * ```
   */
  public getSummary(): string {
    const snapshot = this.getSnapshot();
    const percentage = this.getCompletionPercentage().toFixed(1);

    const parts: string[] = [
      `Progress: ${snapshot.completed}/${snapshot.total} completed (${percentage}%)`,
    ];

    if (snapshot.active > 0) {
      parts.push(`${snapshot.active} active`);
    }
    if (snapshot.pending > 0) {
      parts.push(`${snapshot.pending} pending`);
    }
    if (snapshot.failed > 0) {
      parts.push(`${snapshot.failed} failed`);
    }
    if (snapshot.cancelled > 0) {
      parts.push(`${snapshot.cancelled} cancelled`);
    }

    return parts.join(', ');
  }

  /**
   * Subscribe to progress events
   *
   * Convenience method for event subscription
   *
   * @param callback - Function to call on progress events
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * const unsubscribe = tracker.subscribe((event) => {
   *   console.log('Progress:', event.progress);
   * });
   *
   * // Later: unsubscribe()
   * ```
   */
  public subscribe(callback: (event: ProgressEvent) => void): () => void {
    this.on('progress', callback);
    return () => this.off('progress', callback);
  }
}
