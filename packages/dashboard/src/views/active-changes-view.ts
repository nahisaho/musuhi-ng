/**
 * AC-6.3: Active Changes View
 * WHEN dashboard is displayed, the system SHALL show list of active changes with status and progress
 *
 * Displays changes from changes/ directory with:
 * - Change ID (file name or title)
 * - Status (draft/review/approved/archived)
 * - Progress percentage
 * - Last updated timestamp
 */

import type { DashboardState, Change } from '../types/index.js';

/**
 * ActiveChangesView Component
 *
 * Displays active changes in a table format with:
 * - Change ID (truncated to 20 chars)
 * - Status (Draft/Review/Approved/Archived)
 * - Progress (0-100%)
 * - Last updated (relative time: 5m ago, 2h ago, etc.)
 *
 * AC-6.3: WHEN dashboard displayed, SHALL show active changes with status, progress%, timestamp
 */
export class ActiveChangesView {
  private table: any; // blessed-contrib table widget

  /**
   * Initialize active changes view with grid positioning
   * @param grid - blessed-contrib grid (12x12)
   * @param row - Starting row (0-11)
   * @param col - Starting column (0-11)
   */
  constructor(grid: any, row: number, col: number) {
    // AC-6.3: Table widget for change status, progress, timestamp
    this.table = grid.set(row, col, 4, 6, require('blessed-contrib').table, {
      keys: true,
      fg: 'white',
      selectedFg: 'white',
      selectedBg: 'blue',
      interactive: false,
      label: 'Active Changes',
      width: '100%',
      height: '100%',
      border: { type: 'line', fg: 'cyan' },
      columnSpacing: 2,
      columnWidth: [20, 10, 8, 14], // Change ID, Status, Progress, Updated
    });
  }

  /**
   * Render active changes from dashboard state
   * AC-6.3: Display status, progress%, last updated timestamp
   *
   * @param state - Current dashboard state
   */
  render(state: DashboardState): void {
    const headers = ['Change ID', 'Status', 'Progress', 'Updated'];

    // AC-6.3: Display change status, progress percentage, timestamp
    const data =
      state.activeChanges.length > 0
        ? state.activeChanges.map((change) => [
            this.truncate(change.title, 18),
            this.formatStatus(change.status),
            `${change.progress}%`,
            this.formatTimestamp(change.lastUpdated),
          ])
        : [['No active changes', '', '', '']];

    this.table.setData({
      headers,
      data,
    });
  }

  /**
   * Format change status for display
   * @param status - Change status (draft/review/approved/archived)
   * @returns Formatted status string
   */
  private formatStatus(status: Change['status']): string {
    const statusMap = {
      draft: 'Draft',
      review: 'Review',
      approved: 'Approved',
      archived: 'Archived',
    };
    return statusMap[status] || status;
  }

  /**
   * Format timestamp as relative time
   * AC-6.3: Display timestamp as "5m ago", "2h ago", "3d ago"
   *
   * @param date - Date to format
   * @returns Relative time string
   */
  private formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
