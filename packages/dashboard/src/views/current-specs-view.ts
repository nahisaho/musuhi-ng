/**
 * AC-6.4: Current Specs View
 * WHEN dashboard is displayed, the system SHALL show list of current specs with requirement counts
 *
 * Displays specification files from specs/ directory with:
 * - Spec file name
 * - Requirement count (AC-X.Y format)
 * - Last modified date
 */

import type { DashboardState } from '../types/index.js';

/**
 * CurrentSpecsView Component
 *
 * Displays current specifications in a table format with:
 * - Spec file name (truncated to 22 chars)
 * - Requirement count (number of AC-X.Y requirements)
 * - Last modified (today's time or date)
 *
 * AC-6.4: WHEN dashboard displayed, SHALL show specs with requirement count, last modified
 */
export class CurrentSpecsView {
  private table: any; // blessed-contrib table widget

  /**
   * Initialize current specs view with grid positioning
   * @param grid - blessed-contrib grid (12x12)
   * @param row - Starting row (0-11)
   * @param col - Starting column (0-11)
   */
  constructor(grid: any, row: number, col: number) {
    // AC-6.4: Table widget for spec files, requirement count, last modified
    this.table = grid.set(row, col, 4, 6, require('blessed-contrib').table, {
      keys: true,
      fg: 'white',
      selectedFg: 'white',
      selectedBg: 'blue',
      interactive: false,
      label: 'Current Specs',
      width: '100%',
      height: '100%',
      border: { type: 'line', fg: 'cyan' },
      columnSpacing: 2,
      columnWidth: [22, 10, 18], // Spec File, Reqs, Last Modified
    });
  }

  /**
   * Render current specs from dashboard state
   * AC-6.4: Display requirement count, last modified date
   *
   * @param state - Current dashboard state
   */
  render(state: DashboardState): void {
    const headers = ['Spec File', 'Reqs', 'Last Modified'];

    // AC-6.4: Display spec file, requirement count, last modified
    const data =
      state.currentSpecs.length > 0
        ? state.currentSpecs.map((spec) => [
            this.truncate(spec.fileName, 20),
            spec.requirementCount.toString(),
            this.formatDate(spec.lastModified),
          ])
        : [['No specs found', '', '']];

    this.table.setData({
      headers,
      data,
    });
  }

  /**
   * Format date for display
   * AC-6.4: Show time for today, date for other days
   *
   * @param date - Date to format
   * @returns Formatted date string
   */
  private formatDate(date: Date): string {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      // Show time for today (HH:MM format)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Show date for other days (MMM DD format)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Truncate string to max length with ellipsis
   * @param str - String to truncate
   * @param maxLen - Maximum length
   * @returns Truncated string
   */
  private truncate(str: string, maxLen: number): string {
    return str.length > maxLen ? str.substring(0, maxLen - 2) + '..' : str;
  }
}
