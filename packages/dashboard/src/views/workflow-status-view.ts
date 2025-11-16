/**
 * AC-6.2: Workflow Status View
 * WHEN dashboard is displayed, the system SHALL show 8-stage SDD workflow with progress gauge
 *
 * Displays current workflow stage (Research → Requirements → Design → Tasks →
 * Implementation → Testing → Deployment → Monitoring) with progress percentage.
 */

import type { DashboardState, WorkflowStage } from '../types/index.js';

/**
 * 8-stage SDD workflow stages in order
 * AC-6.2: Display progression through Research → Monitoring
 */
export const WORKFLOW_STAGES: WorkflowStage[] = [
  'research',
  'requirements',
  'design',
  'tasks',
  'implementation',
  'testing',
  'deployment',
  'monitoring',
];

/**
 * WorkflowStatusView Component
 *
 * Displays 8-stage SDD workflow with visual indicators:
 * - Progress gauge showing overall completion percentage
 * - Stage progression with symbols (● completed, ◆ current, ○ pending)
 * - Color-coded stage names
 *
 * AC-6.2: WHEN dashboard displayed, SHALL show workflow status with progress
 */
export class WorkflowStatusView {
  private gauge: any; // blessed-contrib gauge widget
  private text: any; // blessed text widget

  /**
   * Initialize workflow status view with grid positioning
   * @param grid - blessed-contrib grid (12x12)
   * @param row - Starting row (0-11)
   * @param col - Starting column (0-11)
   */
  constructor(grid: any, row: number, col: number) {
    // AC-6.2: Progress gauge for workflow completion
    this.gauge = grid.set(row, col, 2, 6, require('blessed-contrib').gauge, {
      label: 'Workflow Progress',
      stroke: 'green',
      fill: 'white',
      border: { type: 'line', fg: 'cyan' },
    });

    // AC-6.2: Text widget for stage progression visualization
    this.text = grid.set(row, col + 6, 2, 6, require('blessed').text, {
      label: 'Current Stage',
      content: '',
      border: { type: 'line', fg: 'cyan' },
      tags: true, // Enable color tags
    });
  }

  /**
   * Render workflow status from dashboard state
   * AC-6.2: Calculate and display workflow progress with stage indicators
   *
   * @param state - Current dashboard state
   */
  render(state: DashboardState): void {
    // AC-6.2: Calculate workflow progress based on current stage
    const stageIndex = WORKFLOW_STAGES.indexOf(state.workflowStage);
    const progress = Math.round(((stageIndex + 1) / WORKFLOW_STAGES.length) * 100);

    // Update progress gauge (0-100%)
    this.gauge.setPercent(progress);

    // AC-6.2: Generate stage progression text with visual indicators
    const stageText = WORKFLOW_STAGES.map((stage, i) => {
      const isCurrent = stage === state.workflowStage;
      const isComplete = i < stageIndex;

      let symbol = '○'; // Pending
      let color = 'white';

      if (isCurrent) {
        symbol = '◆'; // Current (diamond)
        color = 'yellow';
      } else if (isComplete) {
        symbol = '●'; // Completed (filled circle)
        color = 'green';
      }

      // Capitalize first letter of stage name
      const stageCapitalized = stage.charAt(0).toUpperCase() + stage.slice(1);
      return `{${color}-fg}${symbol} ${stageCapitalized}{/${color}-fg}`;
    }).join(' → ');

    // Display stage progression and progress percentage
    this.text.setContent(`${stageText}\n\n{bold}Progress: ${progress}%{/bold}`);
  }
}
