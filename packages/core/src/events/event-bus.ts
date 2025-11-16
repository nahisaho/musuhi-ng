/**
 * Event Bus Implementation
 * Pub/sub pattern for real-time dashboard updates and inter-component communication
 * @module @musuhi/core/events
 */

import { EventEmitter } from 'events';

/**
 * Event types emitted by the Event Bus
 */
export enum EventType {
  // Workflow events
  PHASE_TRANSITION = 'phase:transition',
  STAGE_STARTED = 'stage:started',
  STAGE_COMPLETED = 'stage:completed',
  STAGE_FAILED = 'stage:failed',

  // Task events
  TASK_STARTED = 'task:started',
  TASK_COMPLETED = 'task:completed',
  TASK_FAILED = 'task:failed',
  TASK_PROGRESS = 'task:progress',

  // Agent events
  AGENT_INVOKED = 'agent:invoked',
  AGENT_COMPLETED = 'agent:completed',
  AGENT_FAILED = 'agent:failed',

  // Validation events
  VALIDATION_STARTED = 'validation:started',
  VALIDATION_PASSED = 'validation:passed',
  VALIDATION_FAILED = 'validation:failed',

  // Constitutional events
  PHASE_GATE_CHECK = 'phase_gate:check',
  PHASE_GATE_PASSED = 'phase_gate:passed',
  PHASE_GATE_REJECTED = 'phase_gate:rejected',

  // Traceability events
  TRACEABILITY_UPDATED = 'traceability:updated',
  TRACEABILITY_VERIFIED = 'traceability:verified',

  // Config events
  CONFIG_LOADED = 'config:loaded',
  CONFIG_CHANGED = 'config:changed',

  // Dashboard events
  DASHBOARD_REFRESH = 'dashboard:refresh',
  METRICS_UPDATED = 'metrics:updated',
}

/**
 * Base event payload
 */
export interface BaseEventPayload {
  timestamp: Date;
  source?: string;
}

/**
 * Phase transition event payload
 */
export interface PhaseTransitionPayload extends BaseEventPayload {
  from: string;
  to: string;
  projectRoot: string;
}

/**
 * Stage event payload
 */
export interface StageEventPayload extends BaseEventPayload {
  stage: string;
  status: 'started' | 'completed' | 'failed';
  error?: Error;
  metadata?: Record<string, unknown>;
}

/**
 * Task event payload
 */
export interface TaskEventPayload extends BaseEventPayload {
  taskId: string;
  taskName: string;
  status: 'started' | 'completed' | 'failed' | 'progress';
  progress?: number; // 0-100
  error?: Error;
  metadata?: Record<string, unknown>;
}

/**
 * Agent event payload
 */
export interface AgentEventPayload extends BaseEventPayload {
  agentType: string;
  agentId: string;
  status: 'invoked' | 'completed' | 'failed';
  result?: unknown;
  error?: Error;
}

/**
 * Validation event payload
 */
export interface ValidationEventPayload extends BaseEventPayload {
  validationType: string;
  status: 'started' | 'passed' | 'failed';
  details?: string[];
  suggestions?: string[];
  error?: Error;
}

/**
 * Phase Gate event payload
 */
export interface PhaseGateEventPayload extends BaseEventPayload {
  articles: number[];
  status: 'check' | 'passed' | 'rejected';
  violations?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Traceability event payload
 */
export interface TraceabilityEventPayload extends BaseEventPayload {
  requirementId?: string;
  designId?: string;
  taskId?: string;
  codeRef?: string;
  testId?: string;
  action: 'updated' | 'verified';
}

/**
 * Config event payload
 */
export interface ConfigEventPayload extends BaseEventPayload {
  configPath: string;
  config?: Record<string, unknown>;
}

/**
 * Dashboard event payload
 */
export interface DashboardEventPayload extends BaseEventPayload {
  refreshType: 'full' | 'partial';
  metrics?: Record<string, unknown>;
}

/**
 * Union type for all event payloads
 */
export type EventPayload =
  | PhaseTransitionPayload
  | StageEventPayload
  | TaskEventPayload
  | AgentEventPayload
  | ValidationEventPayload
  | PhaseGateEventPayload
  | TraceabilityEventPayload
  | ConfigEventPayload
  | DashboardEventPayload;

/**
 * Event listener function type
 */
export type EventListener<T extends EventPayload = EventPayload> = (payload: T) => void | Promise<void>;

/**
 * Event Bus for pub/sub communication
 * Enables real-time dashboard updates and loose coupling between components
 */
export class EventBus {
  private emitter: EventEmitter;
  private maxListeners: number;

  constructor(maxListeners = 100) {
    this.emitter = new EventEmitter();
    this.maxListeners = maxListeners;
    this.emitter.setMaxListeners(maxListeners);
  }

  /**
   * Subscribe to an event
   * @param eventType - Event type to subscribe to
   * @param listener - Callback function to invoke when event is emitted
   * @returns Unsubscribe function
   */
  on<T extends EventPayload = EventPayload>(
    eventType: EventType,
    listener: EventListener<T>
  ): () => void {
    this.emitter.on(eventType, listener as EventListener);
    return () => this.off(eventType, listener);
  }

  /**
   * Subscribe to an event (one-time)
   * @param eventType - Event type to subscribe to
   * @param listener - Callback function to invoke when event is emitted
   */
  once<T extends EventPayload = EventPayload>(eventType: EventType, listener: EventListener<T>): void {
    this.emitter.once(eventType, listener as EventListener);
  }

  /**
   * Unsubscribe from an event
   * @param eventType - Event type to unsubscribe from
   * @param listener - Callback function to remove
   */
  off<T extends EventPayload = EventPayload>(eventType: EventType, listener: EventListener<T>): void {
    this.emitter.off(eventType, listener as EventListener);
  }

  /**
   * Emit an event
   * @param eventType - Event type to emit
   * @param payload - Event payload
   */
  emit<T extends EventPayload = EventPayload>(eventType: EventType, payload: T): void {
    this.emitter.emit(eventType, payload);
  }

  /**
   * Remove all listeners for a specific event type
   * @param eventType - Event type to clear listeners for
   */
  removeAllListeners(eventType?: EventType): void {
    if (eventType) {
      this.emitter.removeAllListeners(eventType);
    } else {
      this.emitter.removeAllListeners();
    }
  }

  /**
   * Get the number of listeners for an event type
   * @param eventType - Event type to count listeners for
   * @returns Number of listeners
   */
  listenerCount(eventType: EventType): number {
    return this.emitter.listenerCount(eventType);
  }

  /**
   * Get all event types that have listeners
   * @returns Array of event types
   */
  eventNames(): EventType[] {
    return this.emitter.eventNames() as EventType[];
  }

  /**
   * Update max listeners limit
   * @param maxListeners - New max listeners limit
   */
  setMaxListeners(maxListeners: number): void {
    this.maxListeners = maxListeners;
    this.emitter.setMaxListeners(maxListeners);
  }

  /**
   * Get max listeners limit
   * @returns Max listeners limit
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }
}

/**
 * Singleton instance of Event Bus
 */
let globalEventBus: EventBus | null = null;

/**
 * Get the global Event Bus instance
 * @returns Global Event Bus instance
 */
export function getEventBus(): EventBus {
  if (!globalEventBus) {
    globalEventBus = new EventBus();
  }
  return globalEventBus;
}

/**
 * Reset the global Event Bus (useful for testing)
 */
export function resetEventBus(): void {
  if (globalEventBus) {
    globalEventBus.removeAllListeners();
    globalEventBus = null;
  }
}
