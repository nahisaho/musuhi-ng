/**
 * Task Executor
 *
 * Executes tasks one at a time with optional human approval checkpoints.
 *
 * Requirement Coverage:
 * - AC-7.1: Task-by-Task Mode - Execute one task at a time with approval
 *
 * Architecture:
 * - SOLID Principle: Single Responsibility - Only responsible for task execution
 * - Article 2: Test-First - All methods covered by unit tests
 */

import type { Task, TaskResult, TaskError, FileChange, VerificationMode } from '../types/index.js';

/**
 * TaskExecutor - Executes tasks with optional verification checkpoints
 *
 * AC-7.1: Task-by-Task Mode
 * - Execute one task at a time
 * - Pause for user approval in enabled mode
 * - Auto-continue in disabled mode
 */
export class TaskExecutor {
  private currentTask?: Task;
  private mode: VerificationMode;

  constructor(mode: VerificationMode = 'enabled') {
    this.mode = mode;
  }

  /**
   * Execute a single task
   *
   * AC-7.1: Task-by-Task Mode
   * - Mark task as in-progress
   * - Execute task logic
   * - Return result (pause for approval if mode is enabled)
   */
  async executeTask(task: Task): Promise<TaskResult> {
    this.currentTask = task;
    task.status = 'in-progress';
    task.startedAt = new Date();

    try {
      // Execute the task (implementation-specific)
      const result = await this.runTask(task);

      if (this.mode === 'enabled') {
        // AC-7.2: Pause for user approval
        // (Handled by IterativeVerifier)
        return result;
      } else {
        // Non-iterative mode: auto-continue
        task.status = result.success ? 'completed' : 'failed';
        task.completedAt = new Date();
        return result;
      }
    } catch (error) {
      const result: TaskResult = {
        success: false,
        changes: [],
        errors: [
          {
            message: error instanceof Error ? error.message : String(error),
            severity: 'error',
          },
        ],
        duration: Date.now() - task.startedAt!.getTime(),
        output: '',
      };

      task.status = 'failed';
      task.completedAt = new Date();
      return result;
    }
  }

  /**
   * Execute task logic (placeholder for actual implementation)
   *
   * In real implementation, this would integrate with Software Developer AI agent
   * to execute the task and track file changes.
   */
  private async runTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();
    const changes: FileChange[] = [];
    const errors: TaskError[] = [];

    // TODO: Implement actual task execution
    // This would integrate with Software Developer AI agent
    // For now, simulate successful execution
    const output = `Task ${task.id} executed successfully`;

    const duration = Date.now() - startTime;

    return {
      success: errors.filter((e) => e.severity === 'error').length === 0,
      changes,
      errors,
      duration,
      output,
    };
  }

  /**
   * Get currently executing task
   */
  getCurrentTask(): Task | undefined {
    return this.currentTask;
  }

  /**
   * Set verification mode
   *
   * AC-7.9: Mode Persistence - Apply saved preference
   */
  setMode(mode: VerificationMode): void {
    this.mode = mode;
  }

  /**
   * Get current verification mode
   */
  getMode(): VerificationMode {
    return this.mode;
  }
}
