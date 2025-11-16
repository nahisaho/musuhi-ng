/**
 * Dashboard state and view types
 *
 * Defines the main dashboard state structure and view types.
 *
 * @packageDocumentation
 */

import type { WorkflowStage } from './workflow.js';
import type { AgentStatus, PWaveStatus } from './agent-status.js';

/**
 * Dashboard view modes
 *
 * AC-6.8: Interactive Navigation
 */
export type DashboardView = 'main' | 'changes' | 'specs' | 'agents' | 'logs';

/**
 * Change proposal information
 *
 * AC-6.3: Active Changes View
 */
export interface Change {
  /** Unique change ID (YYYY-MM-DD-name format) */
  id: string;
  /** Change title */
  title: string;
  /** Change status */
  status: 'draft' | 'review' | 'approved' | 'archived';
  /** Progress percentage (0-100) */
  progress: number;
  /** Last updated timestamp */
  lastUpdated: Date;
  /** Author of the change */
  author?: string;
  /** Number of affected specs */
  affectedSpecs?: number;
}

/**
 * Specification file information
 *
 * AC-6.4: Current Specs View
 */
export interface Spec {
  /** Unique spec ID */
  id: string;
  /** Spec file name (relative to specs/ directory) */
  fileName: string;
  /** Number of requirements in this spec */
  requirementCount: number;
  /** Last modified timestamp */
  lastModified: Date;
  /** Spec file size (bytes) */
  fileSize?: number;
}

/**
 * Dashboard activity log entry
 *
 * Used for displaying agent activity stream
 */
export interface LogEntry {
  /** Log entry timestamp */
  timestamp: Date;
  /** Log level */
  level: 'info' | 'warn' | 'error' | 'debug';
  /** Log message */
  message: string;
  /** Agent that generated the log (if applicable) */
  agent?: string;
}

/**
 * Main dashboard state
 *
 * Consolidates all dashboard information for rendering
 */
export interface DashboardState {
  /** Current view mode */
  currentView: DashboardView;
  /** Current workflow stage */
  workflowStage: WorkflowStage;
  /** Workflow progress percentage (0-100) */
  workflowProgress: number;
  /** List of active changes (from changes/ directory) */
  activeChanges: Change[];
  /** List of current specs (from specs/ directory) */
  currentSpecs: Spec[];
  /** Status of all agents */
  activeAgents: AgentStatus[];
  /** P-wave parallel execution status (if active) */
  pWaveStatus?: PWaveStatus;
  /** Recent activity logs */
  logs: LogEntry[];
  /** Last state update timestamp */
  lastUpdate: Date;
}

/**
 * Dashboard configuration options
 */
export interface DashboardConfig {
  /** Refresh interval in milliseconds (AC-6.7: 2s = 2000ms) */
  refreshInterval: number;
  /** Maximum number of log entries to keep */
  maxLogEntries: number;
  /** Enable real-time updates (AC-6.7) */
  enableRealTimeUpdates: boolean;
  /** Dashboard theme (future enhancement) */
  theme?: 'light' | 'dark';
}

/**
 * Default dashboard configuration
 *
 * AC-6.7: Refresh every 2 seconds
 */
export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  refreshInterval: 2000, // 2 seconds
  maxLogEntries: 100,
  enableRealTimeUpdates: true,
};

/**
 * Change status display colors (for TUI)
 */
export const CHANGE_STATUS_COLORS: Record<Change['status'], string> = {
  draft: 'yellow',
  review: 'blue',
  approved: 'green',
  archived: 'gray',
};

/**
 * Formats timestamp as relative time (e.g., "2 min ago")
 *
 * AC-6.3: Display last updated timestamp
 *
 * @param date - Timestamp to format
 * @returns Formatted relative time string
 *
 * @example
 * ```typescript
 * const now = new Date();
 * const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
 * formatRelativeTime(twoMinutesAgo) // Returns '2 min ago'
 * ```
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  return date.toLocaleDateString();
}

/**
 * Formats file size in human-readable format
 *
 * @param bytes - File size in bytes
 * @returns Formatted size string (e.g., "1.5 KB", "2.3 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
