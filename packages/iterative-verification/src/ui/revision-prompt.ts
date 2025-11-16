/**
 * Revision Prompt
 *
 * Prompts user for revision instructions when task needs to be re-executed.
 *
 * Requirement Coverage:
 * - AC-7.4: Revise Option - Get revision instructions and re-execute task
 *
 * Architecture:
 * - SOLID Principle: Single Responsibility - Only responsible for revision prompts
 * - Article 2: Test-First - All methods covered by unit tests
 */

import type { Task, RevisionRequest } from '../types/index.js';

/**
 * RevisionPrompt - Prompts user for task revision instructions
 *
 * AC-7.4: Revise Option
 * - Display task details
 * - Prompt for revision instructions
 * - Track retry count
 */
export class RevisionPrompt {
  /**
   * Prompt user for revision instructions
   *
   * AC-7.4: Revise Option
   * - Show task details
   * - Get revision instructions from user
   * - Increment retry count
   */
  async prompt(task: Task, retryCount: number): Promise<RevisionRequest> {
    console.log('\n' + '='.repeat(80));
    console.log(`Revise Task: ${task.title}`);
    console.log('='.repeat(80));
    console.log(`\nTask ID: ${task.id}`);
    console.log(`Description: ${task.description}`);
    console.log(`Retry Count: ${retryCount}`);
    console.log('\nPlease provide revision instructions:');
    console.log('(What should be changed or fixed?)');
    console.log('='.repeat(80));

    // Get user instructions (in real implementation, use readline)
    const instructions = await this.getUserInstructions();

    return {
      taskId: task.id,
      instructions,
      retryCount: retryCount + 1,
    };
  }

  /**
   * Get revision instructions from user
   *
   * AC-7.4: Revise Option
   * - In real implementation, use readline for multi-line input
   * - For now, return placeholder for testing
   */
  private async getUserInstructions(): Promise<string> {
    // TODO: Implement actual user input (readline, blessed, etc.)
    // For now, return placeholder for testing
    return 'Please fix the errors and try again';
  }
}
