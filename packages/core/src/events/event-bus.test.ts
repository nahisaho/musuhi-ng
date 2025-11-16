/**
 * Event Bus Tests
 * @module @musuhi-ng/core/events
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  EventBus,
  EventType,
  getEventBus,
  resetEventBus,
  type TaskEventPayload,
  type PhaseTransitionPayload,
} from './event-bus.js';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('Basic Pub/Sub', () => {
    it('should subscribe and emit events', () => {
      const listener = vi.fn();
      eventBus.on(EventType.TASK_STARTED, listener);

      const payload: TaskEventPayload = {
        taskId: 'T-001',
        taskName: 'Test Task',
        status: 'started',
        timestamp: new Date(),
      };

      eventBus.emit(EventType.TASK_STARTED, payload);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(payload);
    });

    it('should support multiple subscribers', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on(EventType.TASK_COMPLETED, listener1);
      eventBus.on(EventType.TASK_COMPLETED, listener2);

      const payload: TaskEventPayload = {
        taskId: 'T-002',
        taskName: 'Test Task 2',
        status: 'completed',
        timestamp: new Date(),
      };

      eventBus.emit(EventType.TASK_COMPLETED, payload);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from events', () => {
      const listener = vi.fn();
      const unsubscribe = eventBus.on(EventType.TASK_FAILED, listener);

      const payload: TaskEventPayload = {
        taskId: 'T-003',
        taskName: 'Test Task 3',
        status: 'failed',
        timestamp: new Date(),
        error: new Error('Task failed'),
      };

      eventBus.emit(EventType.TASK_FAILED, payload);
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      eventBus.emit(EventType.TASK_FAILED, payload);
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });

  describe('One-time Subscribers', () => {
    it('should subscribe once and auto-unsubscribe', () => {
      const listener = vi.fn();
      eventBus.once(EventType.PHASE_TRANSITION, listener);

      const payload: PhaseTransitionPayload = {
        from: 'design',
        to: 'implementation',
        projectRoot: '/test',
        timestamp: new Date(),
      };

      eventBus.emit(EventType.PHASE_TRANSITION, payload);
      expect(listener).toHaveBeenCalledTimes(1);

      eventBus.emit(EventType.PHASE_TRANSITION, payload);
      expect(listener).toHaveBeenCalledTimes(1); // Still 1
    });
  });

  describe('Listener Management', () => {
    it('should return correct listener count', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      expect(eventBus.listenerCount(EventType.TASK_STARTED)).toBe(0);

      eventBus.on(EventType.TASK_STARTED, listener1);
      expect(eventBus.listenerCount(EventType.TASK_STARTED)).toBe(1);

      eventBus.on(EventType.TASK_STARTED, listener2);
      expect(eventBus.listenerCount(EventType.TASK_STARTED)).toBe(2);

      eventBus.off(EventType.TASK_STARTED, listener1);
      expect(eventBus.listenerCount(EventType.TASK_STARTED)).toBe(1);
    });

    it('should remove all listeners for an event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on(EventType.TASK_STARTED, listener1);
      eventBus.on(EventType.TASK_STARTED, listener2);
      expect(eventBus.listenerCount(EventType.TASK_STARTED)).toBe(2);

      eventBus.removeAllListeners(EventType.TASK_STARTED);
      expect(eventBus.listenerCount(EventType.TASK_STARTED)).toBe(0);
    });

    it('should remove all listeners for all events', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on(EventType.TASK_STARTED, listener1);
      eventBus.on(EventType.TASK_COMPLETED, listener2);

      expect(eventBus.listenerCount(EventType.TASK_STARTED)).toBe(1);
      expect(eventBus.listenerCount(EventType.TASK_COMPLETED)).toBe(1);

      eventBus.removeAllListeners();

      expect(eventBus.listenerCount(EventType.TASK_STARTED)).toBe(0);
      expect(eventBus.listenerCount(EventType.TASK_COMPLETED)).toBe(0);
    });

    it('should return active event names', () => {
      const listener = vi.fn();

      eventBus.on(EventType.TASK_STARTED, listener);
      eventBus.on(EventType.TASK_COMPLETED, listener);

      const eventNames = eventBus.eventNames();
      expect(eventNames).toContain(EventType.TASK_STARTED);
      expect(eventNames).toContain(EventType.TASK_COMPLETED);
    });
  });

  describe('Max Listeners', () => {
    it('should have default max listeners', () => {
      expect(eventBus.getMaxListeners()).toBe(100);
    });

    it('should update max listeners', () => {
      eventBus.setMaxListeners(50);
      expect(eventBus.getMaxListeners()).toBe(50);
    });
  });
});

describe('Global EventBus', () => {
  beforeEach(() => {
    resetEventBus();
  });

  it('should return singleton instance', () => {
    const bus1 = getEventBus();
    const bus2 = getEventBus();

    expect(bus1).toBe(bus2);
  });

  it('should reset global instance', () => {
    const bus1 = getEventBus();
    const listener = vi.fn();
    bus1.on(EventType.TASK_STARTED, listener);

    expect(bus1.listenerCount(EventType.TASK_STARTED)).toBe(1);

    resetEventBus();

    const bus2 = getEventBus();
    expect(bus2.listenerCount(EventType.TASK_STARTED)).toBe(0);
  });
});
