/**
 * Dashboard types export barrel
 *
 * Re-exports all dashboard type definitions for convenient importing.
 *
 * @packageDocumentation
 */

// Workflow types
export type { WorkflowStage, StageProgress } from './workflow.js';
export {
  WORKFLOW_STAGES,
  WORKFLOW_STAGE_NAMES,
  calculateWorkflowProgress,
  getNextStage,
  getPreviousStage,
} from './workflow.js';

// Agent status types
export type { AgentStatus, PWaveStatus, WaveProgress } from './agent-status.js';
export {
  AGENT_NAMES,
  formatAgentStatus,
  calculateWaveCompletion,
  getWaveLabel,
} from './agent-status.js';

// Dashboard types
export type {
  DashboardView,
  Change,
  Spec,
  LogEntry,
  DashboardState,
  DashboardConfig,
} from './dashboard.js';
export {
  DEFAULT_DASHBOARD_CONFIG,
  CHANGE_STATUS_COLORS,
  formatRelativeTime,
  formatFileSize,
} from './dashboard.js';
