/**
 * AC-6.6: P-Wave Visualization View
 * WHEN dashboard is displayed, the system SHALL show P-wave execution status and time savings
 *
 * Displays parallel execution (P-wave) status with:
 * - Bar chart of tasks per wave (P0, P1, P2, ...)
 * - Time savings percentage
 * - Sequential vs parallel time comparison
 */

import type { DashboardState } from '../types/index.js';

/**
 * PWaveView Component
 *
 * Displays P-wave parallel execution visualization:
 * - Bar chart showing completed tasks per wave (P0, P1, P2, ...)
 * - Time savings percentage (green)
 * - Sequential vs parallel time comparison
 *
 * AC-6.6: WHEN dashboard displayed, SHALL show P-wave status, time savings
 */
export class PWaveView {
  private bar: any; // blessed-contrib bar chart widget
  private text: any; // blessed text widget

  /**
   * Initialize P-wave view with grid positioning
   * @param grid - blessed-contrib grid (12x12)
   * @param row - Starting row (0-11)
   * @param col - Starting column (0-11)
   */
  constructor(grid: any, row: number, col: number) {
    // AC-6.6: Bar chart for P-wave progress (P0/P1/P2/...)
    this.bar = grid.set(row, col, 3, 9, require('blessed-contrib').bar, {
      label: 'Parallel Execution (P-Wave)',
      barWidth: 6,
      barSpacing: 8,
      xOffset: 0,
      maxHeight: 9,
      border: { type: 'line', fg: 'cyan' },
    });

    // AC-6.6: Text widget for time savings display
    this.text = grid.set(row, col + 9, 3, 3, require('blessed').text, {
      label: 'Time Savings',
      content: '',
      border: { type: 'line', fg: 'cyan' },
      tags: true, // Enable color tags
    });
  }

  /**
   * Render P-wave status from dashboard state
   * AC-6.6: Display active tasks per wave, completed tasks, time savings
   *
   * @param state - Current dashboard state
   */
  render(state: DashboardState): void {
    if (!state.pWaveStatus) {
      // No P-wave data available
      this.bar.setData({ titles: [], data: [] });
      this.text.setContent('N/A');
      return;
    }

    // AC-6.6: Display completed tasks per wave
    const titles: string[] = [];
    const data: number[] = [];

    for (const [wave, progress] of state.pWaveStatus.waves) {
      titles.push(`P${wave}`);
      data.push(progress.completedTasks);
    }

    this.bar.setData({ titles, data });

    // AC-6.6: Display time savings percentage with sequential/parallel comparison
    const savings = state.pWaveStatus.timeSavings;
    const seqTime = state.pWaveStatus.sequentialTime;
    const parTime = state.pWaveStatus.parallelTime;

    const content =
      `{green-fg}{bold}${savings}%{/bold}{/green-fg}\n\n` +
      `Sequential:\n${seqTime} min\n\n` +
      `Parallel:\n${parTime} min`;

    this.text.setContent(content);
  }
}
