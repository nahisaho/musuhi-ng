/**
 * Tests for EventBus
 *
 * AC-6.7: Real-Time Updates
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '../core/event-bus.js';
import type { DashboardState, LogEntry } from '../types/dashboard.js';
import type { AgentStatus, PWaveStatus } from '../types/agent-status.js';
import type { WorkflowStage } from '../types/workflow.js';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('State Change Events', () => {
    it('should emit and receive state-change events', () => {
      // AC-6.7: Real-time state updates
      const mockState: Partial<DashboardState> = {
        workflowStage: 'design',
        workflowProgress: 37.5,
        lastUpdate: new Date(),
      };

      const callback = vi.fn();
      eventBus.onStateChange(callback);

      eventBus.emitStateChange(mockState as DashboardState);

      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(mockState);
    });

    it('should allow unsubscribing from state-change events', () => {
      const callback = vi.fn();
      const unsubscribe = eventBus.onStateChange(callback);

      unsubscribe();
      eventBus.emitStateChange({} as DashboardState);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Agent Update Events', () => {
    it('should emit and receive agent-update events', () => {
      // AC-6.5: Real-time agent status updates
      const mockAgent: AgentStatus = {
        name: 'system-architect',
        status: 'active',
        currentTask: 'Generating C4 diagrams',
        progress: 75,
        startedAt: new Date(),
      };

      const callback = vi.fn();
      eventBus.onAgentUpdate(callback);

      eventBus.emitAgentUpdate(mockAgent);

      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(mockAgent);
    });
  });

  describe('P-Wave Update Events', () => {
    it('should emit and receive pwave-update events', () => {
      // AC-6.6: Real-time P-wave progress updates
      const mockPWave: PWaveStatus = {
        waves: new Map([
          [
            0,
            {
              wave: 0,
              totalTasks: 5,
              completedTasks: 5,
              activeTasks: 0,
              pendingTasks: 0,
              estimatedTime: 0,
            },
          ],
        ]),
        timeSavings: 60,
        sequentialTime: 30,
        parallelTime: 12,
      };

      const callback = vi.fn();
      eventBus.onPWaveUpdate(callback);

      eventBus.emitPWaveUpdate(mockPWave);

      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(mockPWave);
    });
  });

  describe('Workflow Change Events', () => {
    it('should emit and receive workflow-change events', () => {
      // AC-6.2: Workflow status updates
      const newStage: WorkflowStage = 'implementation';

      const callback = vi.fn();
      eventBus.onWorkflowChange(callback);

      eventBus.emitWorkflowChange(newStage);

      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(newStage);
    });
  });

  describe('Log Entry Events', () => {
    it('should emit and receive log-entry events', () => {
      const mockLog: LogEntry = {
        timestamp: new Date(),
        level: 'info',
        message: 'Task completed successfully',
        agent: 'software-developer',
      };

      const callback = vi.fn();
      eventBus.onLogEntry(callback);

      eventBus.emitLogEntry(mockLog);

      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(mockLog);
    });
  });

  describe('Multiple Subscribers', () => {
    it('should notify all subscribers of an event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      eventBus.onStateChange(callback1);
      eventBus.onStateChange(callback2);
      eventBus.onStateChange(callback3);

      const mockState = {} as DashboardState;
      eventBus.emitStateChange(mockState);

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();
      expect(callback3).toHaveBeenCalledOnce();
    });
  });

  describe('Disposal', () => {
    it('should remove all listeners on dispose', () => {
      const callback = vi.fn();
      eventBus.onStateChange(callback);

      eventBus.dispose();
      eventBus.emitStateChange({} as DashboardState);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
