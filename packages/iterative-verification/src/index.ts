/**
 * @musuhi-ng/iterative-verification
 *
 * Task-by-task execution with human review checkpoints for early error detection.
 *
 * Features:
 * - AC-7.1: Task-by-Task Mode - Execute one task at a time with approval
 * - AC-7.2: Task Completion Prompt - Continue/Revise/Rollback options
 * - AC-7.3: Continue Option - Mark complete and proceed to next
 * - AC-7.4: Revise Option - Get revision instructions and re-execute
 * - AC-7.5: Rollback Option - Undo changes and mark task failed
 * - AC-7.6: Resume from Checkpoint - Restart from last completed task
 * - AC-7.7: Progress Checkboxes - Update tasks.md checkboxes
 * - AC-7.8: Error Detection Metrics - Track errors per task
 * - AC-7.9: Mode Persistence - Save and apply preference
 *
 * Expected Impact: 40% earlier error detection
 *
 * @packageDocumentation
 */

// Main orchestrator
export { IterativeVerifier } from './iterative-verifier.js';

// Core components
export { TaskExecutor } from './core/task-executor.js';
export { CheckpointManager } from './core/checkpoint-manager.js';
export { RollbackManager } from './core/rollback-manager.js';
export { MetricsTracker } from './core/metrics-tracker.js';

// UI components
export { CompletionPrompt } from './ui/completion-prompt.js';
export { RevisionPrompt } from './ui/revision-prompt.js';
export { ProgressUpdater } from './ui/progress-updater.js';

// Persistence components
export { ModeStorage } from './persistence/mode-storage.js';
export { StateSerializer } from './persistence/state-serializer.js';

// Type exports
export type {
  Task,
  TaskStatus,
  TaskResult,
  FileChange,
  TaskError,
  Checkpoint,
  CheckpointState,
  VerificationMode,
  UserAction,
  UserPrompt,
  RevisionRequest,
  ErrorMetrics,
  DetectionStats,
} from './types/index.js';
