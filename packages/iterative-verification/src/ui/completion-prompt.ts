/**
 * Completion Prompt
 *
 * Displays task completion summary and prompts user for action.
 *
 * Requirement Coverage:
 * - AC-7.2: Task Completion Prompt - Display summary and prompt for Continue/Revise/Rollback
 *
 * Architecture:
 * - SOLID Principle: Single Responsibility - Only responsible for user prompts
 * - Article 2: Test-First - All methods covered by unit tests
 */

import * as readline from 'node:readline';

import type { Task, TaskResult, UserAction, UserPrompt } from '../types/index.js';

/**
 * CompletionPrompt - Displays task results and prompts for user action
 *
 * AC-7.2: Task Completion Prompt
 * - Display task summary (status, duration, changes, errors)
 * - Show available options (Continue/Revise/Rollback/Skip/Abort)
 * - Get user input for action selection
 */
export class CompletionPrompt {
  /**
   * Prompt user for action after task completion
   *
   * AC-7.2: Task Completion Prompt
   * - Create formatted prompt with task summary
   * - Display options to user
   * - Get user action (Continue/Revise/Rollback/Skip/Abort)
   */
  async prompt(task: Task, result: TaskResult): Promise<UserAction> {
    const userPrompt = this.createPrompt(task, result);

    console.log('\n' + '='.repeat(80));
    console.log(`Task Completed: ${task.title}`);
    console.log('='.repeat(80));
    console.log(userPrompt.message);
    console.log('\nOptions:');
    console.log('  [C]ontinue  - Mark complete and proceed to next task (AC-7.3)');
    console.log('  [R]evise    - Provide revision instructions and re-execute (AC-7.4)');
    console.log('  [B]ack      - Rollback changes and mark task failed (AC-7.5)');
    console.log('  [S]kip      - Skip this task');
    console.log('  [A]bort     - Abort entire workflow');
    console.log('='.repeat(80));

    // Get user input (in real implementation, use readline or blessed)
    const action = await this.getUserInput();

    return action;
  }

  /**
   * Create formatted user prompt
   *
   * AC-7.2: Task Completion Prompt
   * - Format task status, duration, changes, and errors
   * - Create human-readable summary
   */
  private createPrompt(task: Task, result: TaskResult): UserPrompt {
    let message = '';

    // Summary
    message += `\nStatus: ${result.success ? '✅ Success' : '❌ Failed'}\n`;
    message += `Duration: ${(result.duration / 1000).toFixed(2)}s\n`;

    // Changes
    if (result.changes.length > 0) {
      message += `\nChanges (${result.changes.length} files):\n`;
      for (const change of result.changes) {
        const icon = change.type === 'created' ? '➕' : change.type === 'modified' ? '✏️' : '➖';
        message += `  ${icon} ${change.path}\n`;
      }
    }

    // Errors
    if (result.errors.length > 0) {
      message += `\nErrors (${result.errors.length}):\n`;
      for (const error of result.errors) {
        const icon = error.severity === 'error' ? '🔴' : '🟡';
        message += `  ${icon} ${error.message}\n`;
        if (error.file) {
          message += `     at ${error.file}${error.line ? `:${error.line}` : ''}\n`;
        }
      }
    }

    return {
      task,
      result,
      options: ['continue', 'revise', 'rollback', 'skip', 'abort'],
      message,
    };
  }

  /**
   * Get user input for action selection
   *
   * AC-7.2: Task Completion Prompt
   * - Prompts user interactively via readline
   * - Validates input and maps to UserAction
   * - Defaults to 'continue' in non-interactive environments (CI/testing)
   */
  private async getUserInput(): Promise<UserAction> {
    // Check if running in non-interactive environment (CI/testing)
    if (!process.stdin.isTTY) {
      console.log('Non-interactive environment detected, defaulting to: Continue');
      return 'continue';
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      const promptUser = (): void => {
        rl.question('\nYour choice [C/R/B/S/A]: ', (answer) => {
          const input = answer.trim().toLowerCase();

          // Map input to UserAction
          const actionMap: Record<string, UserAction> = {
            c: 'continue',
            r: 'revise',
            b: 'rollback',
            s: 'skip',
            a: 'abort',
            continue: 'continue',
            revise: 'revise',
            rollback: 'rollback',
            back: 'rollback',
            skip: 'skip',
            abort: 'abort',
          };

          const action = actionMap[input];

          if (action) {
            rl.close();
            resolve(action);
          } else {
            console.log('Invalid input. Please enter C, R, B, S, or A.');
            promptUser(); // Re-prompt on invalid input
          }
        });
      };

      promptUser();
    });
  }
}
