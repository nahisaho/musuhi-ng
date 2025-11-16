/**
 * Performance metrics collector
 */
export class PerformanceMetrics {
  private startTime: number = 0;
  private endTime: number = 0;
  private metrics: Map<string, number> = new Map();

  /**
   * Starts the timer
   */
  start(): void {
    this.startTime = performance.now();
  }

  /**
   * Stops the timer
   */
  stop(): void {
    this.endTime = performance.now();
  }

  /**
   * Gets elapsed time in milliseconds
   */
  getElapsedMs(): number {
    if (this.endTime === 0) {
      return performance.now() - this.startTime;
    }
    return this.endTime - this.startTime;
  }

  /**
   * Gets elapsed time in seconds
   */
  getElapsedSeconds(): number {
    return this.getElapsedMs() / 1000;
  }

  /**
   * Records a metric
   */
  record(name: string, value: number): void {
    this.metrics.set(name, value);
  }

  /**
   * Gets a metric
   */
  get(name: string): number | undefined {
    return this.metrics.get(name);
  }

  /**
   * Gets all metrics
   */
  getAll(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Resets all metrics
   */
  reset(): void {
    this.startTime = 0;
    this.endTime = 0;
    this.metrics.clear();
  }

  /**
   * Measures execution time of a function
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    this.record(name, end - start);
    return result;
  }

  /**
   * Calculates time savings percentage
   */
  calculateTimeSavings(sequentialTime: number, parallelTime: number): number {
    return ((sequentialTime - parallelTime) / sequentialTime) * 100;
  }
}

/**
 * Creates a new performance metrics instance
 */
export function createMetrics(): PerformanceMetrics {
  return new PerformanceMetrics();
}
