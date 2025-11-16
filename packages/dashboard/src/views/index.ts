/**
 * View Components Barrel Export
 *
 * Exports all TUI view components for dashboard:
 * - WorkflowStatusView (AC-6.2)
 * - ActiveChangesView (AC-6.3)
 * - CurrentSpecsView (AC-6.4)
 * - ActiveAgentsView (AC-6.5)
 * - PWaveView (AC-6.6)
 * - LogView (Activity stream)
 */

export { WorkflowStatusView, WORKFLOW_STAGES } from './workflow-status-view.js';
export { ActiveChangesView } from './active-changes-view.js';
export { CurrentSpecsView } from './current-specs-view.js';
export { ActiveAgentsView } from './active-agents-view.js';
export { PWaveView } from './pwave-view.js';
export { LogView } from './log-view.js';
