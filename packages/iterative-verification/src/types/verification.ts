/**
 * Verification Type Definitions
 *
 * Defines verification mode, user actions, and prompts for iterative verification.
 *
 * Requirement Coverage:
 * - AC-7.2: Task Completion Prompt (UserPrompt, UserAction)
 * - AC-7.3: Continue Option (UserAction.continue)
 * - AC-7.4: Revise Option (UserAction.revise, RevisionRequest)
 * - AC-7.5: Rollback Option (UserAction.rollback)
 * - AC-7.9: Mode Persistence (VerificationMode)
 */

import type { Task, TaskResult } from './task.js';

/**
 * Verification mode setting
 * AC-7.9: Mode Persistence - Save and apply user preference
 */
export type VerificationMode = 'enabled' | 'disabled';

/**
 * User action after task completion
 * AC-7.2: Task Completion Prompt - User chooses action
 * AC-7.3: Continue Option - Mark complete and proceed
 * AC-7.4: Revise Option - Provide revision instructions
 * AC-7.5: Rollback Option - Undo changes
 */
export type UserAction = 'continue' | 'revise' | 'rollback' | 'skip' | 'abort';

/**
 * User prompt displayed after task completion
 * AC-7.2: Task Completion Prompt - Display summary and options
 */
export interface UserPrompt {
  /** Task that was executed */
  task: Task;

  /** Task execution result */
  result: TaskResult;

  /** Available user actions */
  options: UserAction[];

  /** Formatted message to display to user */
  message: string;
}

/**
 * Revision request from user
 * AC-7.4: Revise Option - Get revision instructions and re-execute
 */
export interface RevisionRequest {
  /** ID of task to revise */
  taskId: string;

  /** User's revision instructions */
  instructions: string;

  /** Number of times this task has been retried */
  retryCount: number;
}
