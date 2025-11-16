/**
 * MUSUHI 2.0 Dashboard Package
 *
 * Feature 6: Interactive Dashboard (AC-6.1 through AC-6.9)
 *
 * This package provides a terminal-based (TUI) dashboard for visualizing
 * the 8-stage SDD workflow, active agents, P-wave progress, and more.
 *
 * @packageDocumentation
 */

// Core types
export type {
  DashboardState,
  DashboardConfig,
  DashboardView,
  Change,
  Spec,
  LogEntry,
} from './types/dashboard.js';

export type { WorkflowStage, StageProgress } from './types/workflow.js';

export type { AgentStatus, PWaveStatus, WaveProgress } from './types/agent-status.js';

// Constants and utilities
export {
  DEFAULT_DASHBOARD_CONFIG,
  CHANGE_STATUS_COLORS,
  formatRelativeTime,
  formatFileSize,
} from './types/dashboard.js';

export {
  WORKFLOW_STAGES,
  WORKFLOW_STAGE_NAMES,
  calculateWorkflowProgress,
  getNextStage,
  getPreviousStage,
} from './types/workflow.js';

export {
  AGENT_NAMES,
  formatAgentStatus,
  calculateWaveCompletion,
  getWaveLabel,
} from './types/agent-status.js';

// Core components
export { EventBus } from './core/event-bus.js';
export { RefreshTimer } from './core/refresh-timer.js';
export { NavigationHandler } from './core/navigation-handler.js';
export type { NavigationKey, ShortcutKey } from './core/navigation-handler.js';

// View components
export {
  WorkflowStatusView,
  ActiveChangesView,
  CurrentSpecsView,
  ActiveAgentsView,
  PWaveView,
  LogView,
} from './views/index.js';

// Main dashboard TUI
export { DashboardTUI, launchDashboard } from './dashboard-tui.js';
