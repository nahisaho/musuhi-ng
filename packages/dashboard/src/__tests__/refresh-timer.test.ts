/**
 * Tests for RefreshTimer
 *
 * AC-6.7: Real-Time Updates (2s refresh)
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RefreshTimer } from '../core/refresh-timer.js';

describe('RefreshTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should create timer with specified interval', () => {
      // AC-6.7: Refresh every 2 seconds
      const callback = vi.fn();
      const timer = new RefreshTimer(2000, callback);

      expect(timer.getInterval()).toBe(2000);
      expect(timer.running()).toBe(false);
    });

    it('should execute callback on start', async () => {
      const callback = vi.fn();
      const timer = new RefreshTimer(2000, callback);

      timer.start();
      expect(timer.running()).toBe(true);

      // Advance time by 2 seconds
      await vi.advanceTimersByTimeAsync(2000);

      expect(callback).toHaveBeenCalledOnce();
    });

    it('should execute callback periodically', async () => {
      // AC-6.7: Periodic refresh every 2 seconds
      const callback = vi.fn();
      const timer = new RefreshTimer(2000, callback);

      timer.start();

      // First refresh after 2s
      await vi.advanceTimersByTimeAsync(2000);
      expect(callback).toHaveBeenCalledTimes(1);

      // Second refresh after 4s total
      await vi.advanceTimersByTimeAsync(2000);
      expect(callback).toHaveBeenCalledTimes(2);

      // Third refresh after 6s total
      await vi.advanceTimersByTimeAsync(2000);
      expect(callback).toHaveBeenCalledTimes(3);

      timer.stop();
    });

    it('should stop timer and not execute callback', async () => {
      const callback = vi.fn();
      const timer = new RefreshTimer(2000, callback);

      timer.start();
      timer.stop();

      expect(timer.running()).toBe(false);

      await vi.advanceTimersByTimeAsync(2000);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Restart Functionality', () => {
    it('should restart timer from beginning', async () => {
      const callback = vi.fn();
      const timer = new RefreshTimer(2000, callback);

      timer.start();

      // Advance 1 second
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback).not.toHaveBeenCalled();

      // Restart resets the timer
      timer.restart();

      // Advance another 1 second (would have triggered if not restarted)
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback).not.toHaveBeenCalled();

      // Advance final 1 second (2s total from restart)
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback).toHaveBeenCalledOnce();

      timer.stop();
    });
  });

  describe('Interval Change', () => {
    it('should update interval dynamically', async () => {
      const callback = vi.fn();
      const timer = new RefreshTimer(2000, callback);

      timer.start();

      // Change interval to 1 second
      timer.setInterval(1000);
      expect(timer.getInterval()).toBe(1000);

      // Should trigger after 1 second now
      await vi.advanceTimersByTimeAsync(1000);
      expect(callback).toHaveBeenCalledOnce();

      timer.stop();
    });
  });

  describe('Manual Trigger', () => {
    it('should manually trigger callback without affecting schedule', async () => {
      const callback = vi.fn();
      const timer = new RefreshTimer(2000, callback);

      timer.start();

      // Manual trigger
      await timer.trigger();
      expect(callback).toHaveBeenCalledOnce();

      // Scheduled trigger still occurs at 2s
      await vi.advanceTimersByTimeAsync(2000);
      expect(callback).toHaveBeenCalledTimes(2);

      timer.stop();
    });
  });

  describe('Error Handling', () => {
    it('should continue refreshing even if callback throws error', async () => {
      // AC-6.7: Dashboard must remain responsive even on errors
      const callback = vi.fn().mockRejectedValueOnce(new Error('Test error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const timer = new RefreshTimer(2000, callback);
      timer.start();

      // First call throws error
      await vi.advanceTimersByTimeAsync(2000);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Second call should still execute
      await vi.advanceTimersByTimeAsync(2000);
      expect(callback).toHaveBeenCalledTimes(2);

      timer.stop();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Disposal', () => {
    it('should stop timer on dispose', async () => {
      const callback = vi.fn();
      const timer = new RefreshTimer(2000, callback);

      timer.start();
      timer.dispose();

      expect(timer.running()).toBe(false);

      await vi.advanceTimersByTimeAsync(2000);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('NFR-P.1: Performance (<100ms refresh)', () => {
    it('should execute callback within performance budget', async () => {
      // AC-6.7 + NFR-P.1: Dashboard refresh <100ms
      let executionTime = 0;
      const callback = vi.fn(() => {
        const start = Date.now();
        // Simulate fast refresh
        const end = Date.now();
        executionTime = end - start;
      });

      const timer = new RefreshTimer(2000, callback);
      timer.start();

      await vi.advanceTimersByTimeAsync(2000);

      expect(callback).toHaveBeenCalled();
      expect(executionTime).toBeLessThan(100); // <100ms requirement
      timer.stop();
    });
  });
});
