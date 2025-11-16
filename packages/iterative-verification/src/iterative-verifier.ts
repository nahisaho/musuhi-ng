/**
 * Iterative Verifier
 *
 * Main orchestrator for task-by-task execution with human review checkpoints.
 *
 * Requirement Coverage:
 * - AC-7.1: Task-by-Task Mode
 * - AC-7.2: Task Completion Prompt
 * - AC-7.3: Continue Option
 * - AC-7.4: Revise Option
 * - AC-7.5: Rollback Option
 * - AC-7.6: Resume from Checkpoint
 * - AC-7.7: Progress Checkboxes
 * - AC-7.8: Error Detection Metrics
 * - AC-7.9: Mode Persistence
 *
 * Architecture:
 * - SOLID Principle: Single Responsibility - Orchestrates verification workflow
 * - Article 2: Test-First - All methods covered by integration tests
 */

import { TaskExecutor } from './core/task-executor.js';
import { CheckpointManager } from './core/checkpoint-manager.js';
import { RollbackManager } from './core/rollback-manager.js';
import { MetricsTracker } from './core/metrics-tracker.js';
import { CompletionPrompt } from './ui/completion-prompt.js';
import { RevisionPrompt } from './ui/revision-prompt.js';
import { ProgressUpdater } from './ui/progress-updater.js';
import { ModeStorage } from './persistence/mode-storage.js';
import type {
  Task,
  TaskResult,
  VerificationMode,
  UserAction,
  CheckpointState,
  ErrorMetrics,
  DetectionStats,
} from './types/index.js';

/**
 * IterativeVerifier - Main orchestrator for iterative verification workflow
 *
 * Coordinates all components to provide task-by-task execution with
 * human checkpoints, rollback support, and error detection metrics.
 */
export class IterativeVerifier {
  private executor: TaskExecutor;
  private checkpointManager: CheckpointManager;
  private rollbackManager: RollbackManager;
  private metricsTracker: MetricsTracker;
  private completionPrompt: CompletionPrompt;
  private revisionPrompt: RevisionPrompt;
  private progressUpdater: ProgressUpdater;
  private modeStorage: ModeStorage;

  constructor(projectRoot: string, tasksFilePath: string) {
    const mode = 'enabled'; // Will be loaded from storage in initialize()

    this.executor = new TaskExecutor(mode);
    this.checkpointManager = new CheckpointManager(projectRoot);
    this.rollbackManager = new RollbackManager();
    this.metricsTracker = new MetricsTracker();
    this.completionPrompt = new CompletionPrompt();
    this.revisionPrompt = new RevisionPrompt();
    this.progressUpdater = new ProgressUpdater(tasksFilePath);
    this.modeStorage = new ModeStorage(projectRoot);
  }

  /**
   * Initialize verifier
   *
   * AC-7.9: Mode Persistence - Load saved mode preference
   */
  async initialize(): Promise<void> {
    const mode = await this.modeStorage.loadMode();
    this.executor.setMode(mode);
  }

  /**
   * Execute tasks with iterative verification
   *
   * AC-7.1: Task-by-Task Mode - Execute one task at a time
   * AC-7.6: Resume from Checkpoint - Resume from last completed task
   */
  async executeTasks(tasks: Task[]): Promise<void> {
    // AC-7.6: Resume from checkpoint
    const checkpoint = await this.checkpointManager.loadCheckpoint();
    const startIndex = checkpoint
      ? tasks.findIndex((t) => t.id === checkpoint.taskId) + 1
      : 0;

    for (let i = startIndex; i < tasks.length; i++) {
      const task = tasks[i];
      if (!task) continue;

      // AC-7.1: Execute task
      const result = await this.executor.executeTask(task);

      // AC-7.8: Track errors
      this.metricsTracker.recordTask(task.id, result.errors);

      if (this.executor.getMode() === 'enabled') {
        // AC-7.2: Prompt user
        const action = await this.completionPrompt.prompt(task, result);

        const continueToNext = await this.handleUserAction(action, task, result, tasks, i);

        if (!continueToNext) {
          break; // Abort workflow
        }
      } else {
        // Auto-continue in non-iterative mode
        await this.completeTask(task, tasks, i);
      }
    }

    // Clear checkpoint when all tasks complete
    await this.checkpointManager.clearCheckpoint();
  }

  /**
   * Handle user action after task completion
   *
   * AC-7.3: Continue Option
   * AC-7.4: Revise Option
   * AC-7.5: Rollback Option
   */
  private async handleUserAction(
    action: UserAction,
    task: Task,
    result: TaskResult,
    tasks: Task[],
    index: number
  ): Promise<boolean> {
    switch (action) {
      case 'continue':
        // AC-7.3: Continue to next task
        await this.completeTask(task, tasks, index);
        return true;

      case 'revise':
        // AC-7.4: Revise and re-execute
        const revisionRequest = await this.revisionPrompt.prompt(task, 0);
        console.log(`Revising task with instructions: ${revisionRequest.instructions}`);
        // TODO: Apply revision instructions and re-execute task
        await this.executor.executeTask(task);
        return true;

      case 'rollback':
        // AC-7.5: Rollback changes
        await this.rollbackManager.rollback(result);
        task.status = 'failed';
        await this.saveCheckpoint(tasks, index);
        return true;

      case 'skip':
        task.status = 'skipped';
        await this.saveCheckpoint(tasks, index);
        return true;

      case 'abort':
        await this.saveCheckpoint(tasks, index);
        return false;

      default:
        return true;
    }
  }

  /**
   * Complete task and update progress
   *
   * AC-7.3: Continue Option - Mark complete and proceed
   * AC-7.7: Progress Checkboxes - Update tasks.md
   * AC-7.6: Resume from Checkpoint - Save checkpoint
   */
  private async completeTask(task: Task, tasks: Task[], index: number): Promise<void> {
    task.status = 'completed';
    task.completedAt = new Date();

    // AC-7.7: Update checkbox
    await this.progressUpdater.updateProgress(task, true);

    // AC-7.6: Save checkpoint
    await this.saveCheckpoint(tasks, index);
  }

  /**
   * Save checkpoint for resume
   *
   * AC-7.6: Resume from Checkpoint - Save state after each task
   */
  private async saveCheckpoint(tasks: Task[], currentIndex: number): Promise<void> {
    const currentTask = tasks[currentIndex];
    if (!currentTask) return;

    const completedTasks = tasks.slice(0, currentIndex + 1).map((t) => t.id);
    const pendingTasks = tasks.slice(currentIndex + 1).map((t) => t.id);

    const state: CheckpointState = {
      filesSnapshot: new Map(),
      currentTaskIndex: currentIndex,
      totalTasks: tasks.length,
      errors: [],
    };

    await this.checkpointManager.saveCheckpoint(
      currentTask.id,
      completedTasks,
      pendingTasks,
      state
    );
  }

  /**
   * Set verification mode
   *
   * AC-7.9: Mode Persistence - Persist mode preference
   */
  async setMode(mode: VerificationMode): Promise<void> {
    await this.modeStorage.saveMode(mode);
    this.executor.setMode(mode);
  }

  /**
   * Get error metrics
   *
   * AC-7.8: Error Detection Metrics
   */
  getMetrics(): ErrorMetrics {
    return this.metricsTracker.getMetrics();
  }

  /**
   * Get error detection statistics
   *
   * AC-7.8: Error Detection Metrics
   */
  getDetectionStats(): DetectionStats {
    return this.metricsTracker.getDetectionStats();
  }
}
