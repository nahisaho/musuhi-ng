/**
 * Progress Updater
 *
 * Updates task checkboxes in tasks.md to reflect completion status.
 *
 * Requirement Coverage:
 * - AC-7.7: Progress Checkboxes - Update tasks.md checkboxes on completion
 *
 * Architecture:
 * - SOLID Principle: Single Responsibility - Only responsible for tasks.md updates
 * - Article 2: Test-First - All methods covered by unit tests
 */

import { promises as fs } from 'fs';
import type { Task } from '../types/index.js';

/**
 * ProgressUpdater - Updates task checkboxes in tasks.md
 *
 * AC-7.7: Progress Checkboxes
 * - Mark task as checked [ ] → [x] when completed
 * - Mark task as unchecked [x] → [ ] when rolled back
 * - Get current progress (completed / total)
 */
export class ProgressUpdater {
  private tasksFilePath: string;

  constructor(tasksFilePath: string) {
    this.tasksFilePath = tasksFilePath;
  }

  /**
   * Update task checkbox in tasks.md
   *
   * AC-7.7: Progress Checkboxes
   * - Find task checkbox by title
   * - Mark as checked [x] if completed
   * - Mark as unchecked [ ] if not completed
   */
  async updateProgress(task: Task, completed: boolean): Promise<void> {
    try {
      let content = await fs.readFile(this.tasksFilePath, 'utf-8');

      // Find checkbox for this task
      // Pattern: - [ ] or - [x] followed by task title
      const taskPattern = new RegExp(
        `^- \\[([ x])\\] (.*)${this.escapeRegex(task.title)}`,
        'gm'
      );

      const newCheckbox = completed ? '[x]' : '[ ]';

      content = content.replace(taskPattern, (_match, _checkbox, rest) => {
        return `- ${newCheckbox} ${rest}${task.title}`;
      });

      await fs.writeFile(this.tasksFilePath, content, 'utf-8');
    } catch (error) {
      console.warn(`Failed to update tasks.md:`, error);
    }
  }

  /**
   * Escape special regex characters in string
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get current progress from tasks.md
   *
   * AC-7.7: Progress Checkboxes
   * - Count total checkboxes
   * - Count checked checkboxes
   * - Return progress ratio
   */
  async getProgress(): Promise<{ total: number; completed: number }> {
    try {
      const content = await fs.readFile(this.tasksFilePath, 'utf-8');

      const totalMatch = content.match(/^- \[[ x]\]/gm);
      const completedMatch = content.match(/^- \[x\]/gm);

      return {
        total: totalMatch?.length || 0,
        completed: completedMatch?.length || 0,
      };
    } catch {
      return { total: 0, completed: 0 };
    }
  }
}
