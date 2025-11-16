/**
 * AC-6.5: Active Agents View
 * WHILE agents are executing tasks, the system SHALL display agent status and progress
 *
 * Displays active AI agents with:
 * - Agent name
 * - Status (idle/active/paused/error)
 * - Current task description
 * - Progress percentage
 */

import type { DashboardState, AgentStatus } from '../types/index.js';

/**
 * ActiveAgentsView Component
 *
 * Displays active agents in a table format with:
 * - Agent name (truncated to 22 chars)
 * - Status (IDLE/ACTIVE/PAUSED/ERROR)
 * - Current task (truncated to 35 chars)
 * - Progress (0-100%)
 *
 * AC-6.5: WHILE agents executing, SHALL display agent status, task, progress
 */
export class ActiveAgentsView {
  private table: any; // blessed-contrib table widget

  /**
   * Initialize active agents view with grid positioning
   * @param grid - blessed-contrib grid (12x12)
   * @param row - Starting row (0-11)
   * @param col - Starting column (0-11)
   */
  constructor(grid: any, row: number, col: number) {
    // AC-6.5: Table widget for agent name, status, task, progress
    this.table = grid.set(row, col, 3, 12, require('blessed-contrib').table, {
      keys: true,
      fg: 'white',
      selectedFg: 'white',
      selectedBg: 'blue',
      interactive: false,
      label: 'Active Agents',
      width: '100%',
      height: '100%',
      border: { type: 'line', fg: 'cyan' },
      columnSpacing: 2,
      columnWidth: [22, 10, 35, 8], // Agent, Status, Task, Progress
    });
  }

  /**
   * Render active agents from dashboard state
   * AC-6.5: WHILE agents executing, display status
   *
   * @param state - Current dashboard state
   */
  render(state: DashboardState): void {
    const headers = ['Agent', 'Status', 'Current Task', 'Progress'];

    // AC-6.5: Display agent status, current task, progress
    const data =
      state.activeAgents.length > 0
        ? state.activeAgents.map((agent) => [
            this.truncate(agent.name, 20),
            this.formatStatus(agent.status),
            agent.currentTask ? this.truncate(agent.currentTask, 33) : '-',
            agent.progress !== undefined ? `${agent.progress}%` : '-',
          ])
        : [['No active agents', '', '', '']];

    this.table.setData({
      headers,
      data,
    });
  }

  /**
   * Format agent status for display
   * @param status - Agent status (idle/active/paused/error)
   * @returns Formatted status string
   */
  private formatStatus(status: AgentStatus['status']): string {
    const statusMap = {
      idle: '[IDLE]',
      active: '[ACTIVE]',
      paused: '[PAUSED]',
      error: '[ERROR]',
    };
    return statusMap[status] || status;
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
