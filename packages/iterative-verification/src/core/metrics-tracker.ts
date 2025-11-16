/**
 * Metrics Tracker
 *
 * Tracks error detection metrics for measuring verification effectiveness.
 *
 * Requirement Coverage:
 * - AC-7.8: Error Detection Metrics - Track errors per task
 *
 * Architecture:
 * - SOLID Principle: Single Responsibility - Only responsible for metrics collection
 * - Article 2: Test-First - All methods covered by unit tests
 */

import type { ErrorMetrics, DetectionStats, TaskError } from '../types/index.js';

/**
 * MetricsTracker - Collects and analyzes error detection metrics
 *
 * AC-7.8: Error Detection Metrics
 * - Track error counts per task
 * - Calculate detection rate (% tasks with errors)
 * - Calculate average errors per task
 * - Measure time to error detection
 */
export class MetricsTracker {
  private taskErrors = new Map<string, TaskError[]>();
  private totalTasks = 0;
  private detectionTimes: number[] = [];

  /**
   * Record task execution with errors
   *
   * AC-7.8: Error Detection Metrics
   * - Increment total task count
   * - Store errors for tasks with errors
   */
  recordTask(taskId: string, errors: TaskError[]): void {
    this.totalTasks++;
    if (errors.length > 0) {
      this.taskErrors.set(taskId, errors);
    }
  }

  /**
   * Record error detection time
   *
   * AC-7.8: Error Detection Metrics
   * - Track time to detect errors (in minutes)
   * - Used to calculate average detection time
   */
  recordDetectionTime(minutes: number): void {
    this.detectionTimes.push(minutes);
  }

  /**
   * Get error metrics summary
   *
   * AC-7.8: Error Detection Metrics
   * - Total tasks executed
   * - Tasks with errors
   * - Total errors across all tasks
   * - Error count by task
   * - Detection rate (% tasks with errors)
   * - Average errors per task
   */
  getMetrics(): ErrorMetrics {
    const tasksWithErrors = this.taskErrors.size;
    const totalErrors = Array.from(this.taskErrors.values()).reduce(
      (sum, errors) => sum + errors.length,
      0
    );

    return {
      totalTasks: this.totalTasks,
      tasksWithErrors,
      totalErrors,
      errorsByTask: new Map(
        Array.from(this.taskErrors.entries()).map(([id, errors]) => [id, errors.length])
      ),
      detectionRate: this.totalTasks > 0 ? (tasksWithErrors / this.totalTasks) * 100 : 0,
      averageErrorsPerTask: this.totalTasks > 0 ? totalErrors / this.totalTasks : 0,
    };
  }

  /**
   * Get error detection statistics
   *
   * AC-7.8: Error Detection Metrics
   * - Errors caught in iterative verification
   * - Errors escaped to later stages (placeholder)
   * - Catch rate (% errors caught early)
   * - Average time to error detection
   */
  getDetectionStats(): DetectionStats {
    const errorsCaught = Array.from(this.taskErrors.values()).reduce(
      (sum, errors) => sum + errors.length,
      0
    );

    const avgTime =
      this.detectionTimes.length > 0
        ? this.detectionTimes.reduce((a, b) => a + b, 0) / this.detectionTimes.length
        : 0;

    return {
      errorsCaught,
      errorsEscaped: 0, // Would need integration with later stages to track
      catchRate: 100, // Simplified for now (all caught errors)
      timeToDetection: avgTime,
    };
  }

  /**
   * Reset all metrics
   *
   * Used for starting a new workflow or testing
   */
  reset(): void {
    this.taskErrors.clear();
    this.totalTasks = 0;
    this.detectionTimes = [];
  }
}
