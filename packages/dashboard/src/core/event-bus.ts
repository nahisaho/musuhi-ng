/**
 * Event Bus for real-time dashboard updates
 *
 * AC-6.7: Real-Time Updates
 * Provides event-driven communication for dashboard state changes.
 *
 * @packageDocumentation
 */

import { EventEmitter } from 'events';
import type { DashboardState, LogEntry } from '../types/dashboard.js';
import type { AgentStatus, PWaveStatus } from '../types/agent-status.js';
import type { WorkflowStage } from '../types/workflow.js';

/**
 * Event names emitted by the EventBus
 */
export type EventName =
  | 'state-change'
  | 'agent-update'
  | 'pwave-update'
  | 'workflow-change'
  | 'log-entry';

/**
 * EventBus for real-time dashboard updates
 *
 * AC-6.7: Refresh every 2 seconds for real-time visibility
 *
 * Extends Node.js EventEmitter to provide typed event broadcasting
 * for dashboard state changes.
 *
 * @example
 * ```typescript
 * const eventBus = new EventBus();
 *
 * // Subscribe to state changes
 * eventBus.onStateChange((state) => {
 *   console.log('State updated:', state);
 * });
 *
 * // Emit state change
 * eventBus.emitStateChange(newState);
 * ```
 */
export class EventBus extends EventEmitter {
  constructor() {
    super();
    // Increase max listeners to support multiple views
    this.setMaxListeners(20);
  }

  /**
   * Emits a full dashboard state change event
   *
   * @param state - New dashboard state
   *
   * AC-6.7: Trigger UI updates when state changes
   */
  emitStateChange(state: DashboardState): void {
    this.emit('state-change', state);
  }

  /**
   * Emits an agent status update event
   *
   * @param agent - Updated agent status
   *
   * AC-6.5: Real-time agent status updates
   */
  emitAgentUpdate(agent: AgentStatus): void {
    this.emit('agent-update', agent);
  }

  /**
   * Emits a P-wave execution status update event
   *
   * @param status - Updated P-wave status
   *
   * AC-6.6: Real-time P-wave progress updates
   */
  emitPWaveUpdate(status: PWaveStatus): void {
    this.emit('pwave-update', status);
  }

  /**
   * Emits a workflow stage change event
   *
   * @param stage - New workflow stage
   *
   * AC-6.2: Workflow status updates
   */
  emitWorkflowChange(stage: WorkflowStage): void {
    this.emit('workflow-change', stage);
  }

  /**
   * Emits a navigation event
   *
   * @param direction - Navigation direction
   */
  emitNavigate(direction: string): void {
    this.emit('navigate', direction);
  }

  /**
   * Emits a keyboard shortcut event
   *
   * @param key - Shortcut key pressed
   */
  emitShortcut(key: string): void {
    this.emit('shortcut', key);
  }

  /**
   * Emits a new log entry event
   *
   * @param entry - New log entry
   */
  emitLogEntry(entry: LogEntry): void {
    this.emit('log-entry', entry);
  }

  /**
   * Subscribes to dashboard state change events
   *
   * @param callback - Function called when state changes
   * @returns Unsubscribe function
   */
  onStateChange(callback: (state: DashboardState) => void): () => void {
    this.on('state-change', callback);
    return () => this.off('state-change', callback);
  }

  /**
   * Subscribes to agent update events
   *
   * @param callback - Function called when agent status updates
   * @returns Unsubscribe function
   */
  onAgentUpdate(callback: (agent: AgentStatus) => void): () => void {
    this.on('agent-update', callback);
    return () => this.off('agent-update', callback);
  }

  /**
   * Subscribes to P-wave update events
   *
   * @param callback - Function called when P-wave status updates
   * @returns Unsubscribe function
   */
  onPWaveUpdate(callback: (status: PWaveStatus) => void): () => void {
    this.on('pwave-update', callback);
    return () => this.off('pwave-update', callback);
  }

  /**
   * Subscribes to workflow change events
   *
   * @param callback - Function called when workflow stage changes
   * @returns Unsubscribe function
   */
  onWorkflowChange(callback: (stage: WorkflowStage) => void): () => void {
    this.on('workflow-change', callback);
    return () => this.off('workflow-change', callback);
  }

  /**
   * Subscribes to log entry events
   *
   * @param callback - Function called when new log entry is added
   * @returns Unsubscribe function
   */
  onLogEntry(callback: (entry: LogEntry) => void): () => void {
    this.on('log-entry', callback);
    return () => this.off('log-entry', callback);
  }

  /**
   * Subscribes to navigation events
   *
   * @param callback - Function called when navigation occurs
   * @returns Unsubscribe function
   */
  onNavigate(callback: (direction: string) => void): () => void {
    this.on('navigate', callback);
    return () => this.off('navigate', callback);
  }

  /**
   * Subscribes to shortcut key events
   *
   * @param callback - Function called when shortcut key is pressed
   * @returns Unsubscribe function
   */
  onShortcut(callback: (key: string) => void): () => void {
    this.on('shortcut', callback);
    return () => this.off('shortcut', callback);
  }

  /**
   * Removes all event listeners
   *
   * Call this when disposing the EventBus to prevent memory leaks
   */
  dispose(): void {
    this.removeAllListeners();
  }
}
