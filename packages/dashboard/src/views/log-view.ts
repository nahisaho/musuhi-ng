/**
 * Log View (Activity Stream)
 * Displays real-time activity log for dashboard events
 *
 * Shows timestamped log entries for:
 * - Dashboard updates
 * - Agent activity
 * - Navigation events
 * - User commands
 */

import type { DashboardState } from '../types/index.js';

/**
 * LogView Component
 *
 * Displays activity stream log with timestamps:
 * - Dashboard state changes
 * - User navigation actions
 * - Agent updates
 * - System events
 */
export class LogView {
  private log: any; // blessed-contrib log widget

  /**
   * Initialize log view with grid positioning
   * @param grid - blessed-contrib grid (12x12)
   * @param row - Starting row (0-11)
   * @param col - Starting column (0-11)
   */
  constructor(grid: any, row: number, col: number) {
    // blessed-contrib log widget for activity stream
    this.log = grid.set(row, col, 3, 12, require('blessed-contrib').log, {
      fg: 'green',
      selectedFg: 'green',
      label: 'Activity Log',
      border: { type: 'line', fg: 'cyan' },
    });
  }

  /**
   * Render log view from dashboard state
   * @param _state - Current dashboard state (unused, for interface compatibility)
   */
  render(_state: DashboardState): void {
    // Display latest update timestamp
    this.log.log(`[${new Date().toLocaleTimeString()}] Dashboard updated`);
  }

  /**
   * Log a custom message with timestamp
   * @param message - Message to log
   */
  logMessage(message: string): void {
    this.log.log(`[${new Date().toLocaleTimeString()}] ${message}`);
  }
}
