/**
 * Refresh Timer for dashboard auto-updates
 *
 * AC-6.7: Real-Time Updates (2s refresh)
 * Manages periodic dashboard refresh cycle.
 *
 * @packageDocumentation
 */

/**
 * RefreshTimer manages periodic execution of a callback
 *
 * AC-6.7: Dashboard SHALL refresh every 2 seconds
 *
 * @example
 * ```typescript
 * const timer = new RefreshTimer(2000, () => {
 *   console.log('Refresh!');
 * });
 *
 * timer.start(); // Begin periodic refresh
 * // ... later ...
 * timer.stop();  // Stop refresh
 * ```
 */
export class RefreshTimer {
  private timer?: NodeJS.Timeout;
  private interval: number;
  private callback: () => void | Promise<void>;
  private isRunning: boolean = false;

  /**
   * Creates a new RefreshTimer
   *
   * @param interval - Refresh interval in milliseconds (AC-6.7: 2000ms)
   * @param callback - Function to execute on each refresh
   */
  constructor(interval: number, callback: () => void | Promise<void>) {
    this.interval = interval;
    this.callback = callback;
  }

  /**
   * Starts the refresh timer
   *
   * AC-6.7: Begin periodic refresh cycle
   *
   * If timer is already running, this is a no-op.
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.scheduleNext();
  }

  /**
   * Stops the refresh timer
   *
   * AC-6.7: Stop periodic refresh cycle
   *
   * If timer is not running, this is a no-op.
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  /**
   * Restarts the refresh timer
   *
   * Stops and immediately starts the timer again.
   * Useful for resetting the refresh cycle.
   */
  restart(): void {
    this.stop();
    this.start();
  }

  /**
   * Changes the refresh interval
   *
   * @param newInterval - New refresh interval in milliseconds
   *
   * If timer is running, restarts with new interval.
   */
  setInterval(newInterval: number): void {
    this.interval = newInterval;

    if (this.isRunning) {
      this.restart();
    }
  }

  /**
   * Gets the current refresh interval
   *
   * @returns Current interval in milliseconds
   */
  getInterval(): number {
    return this.interval;
  }

  /**
   * Checks if timer is currently running
   *
   * @returns True if timer is running, false otherwise
   */
  running(): boolean {
    return this.isRunning;
  }

  /**
   * Manually triggers the callback once
   *
   * Does not affect the timer schedule.
   *
   * @returns Promise that resolves when callback completes
   */
  async trigger(): Promise<void> {
    await this.callback();
  }

  /**
   * Schedules the next refresh execution
   *
   * @private
   */
  private scheduleNext(): void {
    if (!this.isRunning) {
      return;
    }

    this.timer = setTimeout(async () => {
      try {
        await this.callback();
      } catch (error) {
        // Log error but continue refresh cycle
        console.error('Refresh callback error:', error);
      }

      // Schedule next refresh
      this.scheduleNext();
    }, this.interval);
  }

  /**
   * Disposes the timer
   *
   * Stops the timer and cleans up resources.
   * Call this when destroying the dashboard.
   */
  dispose(): void {
    this.stop();
  }
}
