/**
 * TimeMetricsCollector - Measures time savings from parallel execution
 *
 * AC-4.6: Time Savings Measurement
 * - Calculate sequential baseline time
 * - Measure actual parallel execution time
 * - Compute time savings percentage (must be 50%+)
 * - Track routing overhead (must be < 200ms per NFR-P.4)
 */

import type { Task, ExecutionResult, TimeMetrics } from '../types/index.js';

/**
 * Collects and analyzes time metrics for parallel execution
 *
 * AC-4.6: WHEN parallel execution completes, the system SHALL measure time savings
 * of 50%+ compared to sequential execution
 */
export class TimeMetricsCollector {
  private executionStartTime?: number;
  private executionEndTime?: number;
  private routingStartTime?: number;
  private routingEndTime?: number;

  /**
   * Mark execution start
   *
   * Call this before starting task execution
   */
  public markExecutionStart(): void {
    this.executionStartTime = Date.now();
  }

  /**
   * Mark execution end
   *
   * Call this after all tasks complete
   */
  public markExecutionEnd(): void {
    this.executionEndTime = Date.now();
  }

  /**
   * Mark routing start (orchestration overhead)
   *
   * NFR-P.4: Routing overhead must be < 200ms
   */
  public markRoutingStart(): void {
    this.routingStartTime = Date.now();
  }

  /**
   * Mark routing end
   */
  public markRoutingEnd(): void {
    this.routingEndTime = Date.now();
  }

  /**
   * Calculate time metrics
   *
   * AC-4.6: Measures sequential time, parallel time, and time savings
   *
   * @param tasks - All tasks
   * @param waves - P-wave assignments
   * @param results - Execution results
   * @returns Time metrics object
   *
   * @example
   * ```typescript
   * const collector = new TimeMetricsCollector();
   * collector.markExecutionStart();
   * // ... execute tasks ...
   * collector.markExecutionEnd();
   * const metrics = collector.calculate(tasks, waves, results);
   * // Returns: { sequentialTime: 1000, parallelTime: 300, timeSavings: 70, ... }
   * ```
   */
  public calculate(
    _tasks: Task[],
    waves: Map<string, number>,
    results: ExecutionResult[]
  ): TimeMetrics {
    // Calculate sequential time (sum of all task durations)
    const sequentialTime = this.calculateSequentialTime(results);

    // Calculate parallel time (actual wall-clock time)
    const parallelTime = this.calculateParallelTime();

    // Calculate wave breakdown
    const waveBreakdown = this.calculateWaveBreakdown(waves, results);

    // Calculate time savings percentage
    const timeSavings = this.calculateTimeSavings(sequentialTime, parallelTime);

    // Calculate routing overhead
    const routingOverhead = this.calculateRoutingOverhead();

    return {
      sequentialTime,
      parallelTime,
      timeSavings,
      waveBreakdown,
      routingOverhead,
    };
  }

  /**
   * Calculate sequential baseline time
   *
   * Sum of all task execution durations
   *
   * @param results - Execution results
   * @returns Total sequential time in milliseconds
   */
  private calculateSequentialTime(results: ExecutionResult[]): number {
    return results.reduce((total, result) => total + result.duration, 0);
  }

  /**
   * Calculate actual parallel execution time
   *
   * Wall-clock time from start to end
   *
   * @returns Parallel execution time in milliseconds
   */
  private calculateParallelTime(): number {
    if (!this.executionStartTime || !this.executionEndTime) {
      throw new Error('Execution time not marked. Call markExecutionStart/End()');
    }
    return this.executionEndTime - this.executionStartTime;
  }

  /**
   * Calculate wave breakdown
   *
   * Maps wave number to execution time
   *
   * @param waves - P-wave assignments
   * @param results - Execution results
   * @returns Wave breakdown object
   */
  private calculateWaveBreakdown(
    waves: Map<string, number>,
    results: ExecutionResult[]
  ): Record<number, number> {
    const breakdown: Record<number, number> = {};

    // Group results by wave
    const resultsByWave = new Map<number, ExecutionResult[]>();
    for (const result of results) {
      const wave = waves.get(result.taskId);
      if (wave !== undefined) {
        if (!resultsByWave.has(wave)) {
          resultsByWave.set(wave, []);
        }
        resultsByWave.get(wave)!.push(result);
      }
    }

    // Calculate max duration for each wave (parallel execution time)
    for (const [wave, waveResults] of resultsByWave.entries()) {
      // Wave time = max task duration in that wave (tasks run in parallel)
      const waveTime = Math.max(...waveResults.map((r) => r.duration));
      breakdown[wave] = waveTime;
    }

    return breakdown;
  }

  /**
   * Calculate time savings percentage
   *
   * AC-4.6: Must be 50%+ for successful parallel execution
   *
   * Formula: ((sequential - parallel) / sequential) * 100
   *
   * @param sequentialTime - Sequential execution time
   * @param parallelTime - Parallel execution time
   * @returns Time savings percentage (0-100)
   */
  private calculateTimeSavings(sequentialTime: number, parallelTime: number): number {
    if (sequentialTime === 0) {
      return 0;
    }

    const savings = ((sequentialTime - parallelTime) / sequentialTime) * 100;
    return Math.max(0, Math.min(100, savings)); // Clamp to 0-100%
  }

  /**
   * Calculate routing overhead
   *
   * NFR-P.4: Must be < 200ms
   *
   * @returns Routing overhead in milliseconds
   */
  private calculateRoutingOverhead(): number {
    if (!this.routingStartTime || !this.routingEndTime) {
      return 0; // Routing time not tracked
    }
    return this.routingEndTime - this.routingStartTime;
  }

  /**
   * Validate time savings meet requirement
   *
   * AC-4.6: Time savings must be >= 50%
   *
   * @param metrics - Time metrics
   * @returns true if time savings >= 50%
   */
  public validateTimeSavings(metrics: TimeMetrics): boolean {
    return metrics.timeSavings >= 50;
  }

  /**
   * Validate routing overhead meets requirement
   *
   * NFR-P.4: Routing overhead must be < 200ms
   *
   * @param metrics - Time metrics
   * @returns true if routing overhead < 200ms
   */
  public validateRoutingOverhead(metrics: TimeMetrics): boolean {
    return metrics.routingOverhead < 200;
  }

  /**
   * Get metrics summary string
   *
   * Human-readable summary
   *
   * @param metrics - Time metrics
   * @returns Summary string
   *
   * @example
   * ```typescript
   * const summary = collector.getSummary(metrics);
   * // Returns: "Sequential: 1000ms, Parallel: 300ms, Savings: 70%, Overhead: 50ms"
   * ```
   */
  public getSummary(metrics: TimeMetrics): string {
    const parts = [
      `Sequential: ${metrics.sequentialTime}ms`,
      `Parallel: ${metrics.parallelTime}ms`,
      `Savings: ${metrics.timeSavings.toFixed(1)}%`,
      `Overhead: ${metrics.routingOverhead}ms`,
    ];

    return parts.join(', ');
  }

  /**
   * Format metrics for reporting
   *
   * @param metrics - Time metrics
   * @returns Formatted report
   */
  public formatReport(metrics: TimeMetrics): string {
    const lines: string[] = [
      '=== Parallel Execution Time Metrics ===',
      '',
      `Sequential Time (baseline): ${metrics.sequentialTime}ms`,
      `Parallel Time (actual): ${metrics.parallelTime}ms`,
      `Time Savings: ${metrics.timeSavings.toFixed(1)}%`,
      `Routing Overhead: ${metrics.routingOverhead}ms`,
      '',
      'Wave Breakdown:',
    ];

    for (const [wave, time] of Object.entries(metrics.waveBreakdown)) {
      lines.push(`  P${wave}: ${time}ms`);
    }

    lines.push('');
    lines.push(`AC-4.6 Compliance: ${this.validateTimeSavings(metrics) ? '✓ PASS' : '✗ FAIL'} (>= 50% required)`);
    lines.push(`NFR-P.4 Compliance: ${this.validateRoutingOverhead(metrics) ? '✓ PASS' : '✗ FAIL'} (< 200ms required)`);

    return lines.join('\n');
  }
}
