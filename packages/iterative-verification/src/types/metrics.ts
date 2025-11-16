/**
 * Metrics Type Definitions
 *
 * Defines error detection metrics and statistics for measuring verification effectiveness.
 *
 * Requirement Coverage:
 * - AC-7.8: Error Detection Metrics (ErrorMetrics, DetectionStats)
 */

/**
 * Error detection metrics
 * AC-7.8: Error Detection Metrics - Track errors per task
 */
export interface ErrorMetrics {
  /** Total number of tasks executed */
  totalTasks: number;

  /** Number of tasks with at least one error */
  tasksWithErrors: number;

  /** Total number of errors across all tasks */
  totalErrors: number;

  /** Map of task ID to error count */
  errorsByTask: Map<string, number>;

  /** Percentage of tasks with errors (tasksWithErrors / totalTasks * 100) */
  detectionRate: number;

  /** Average errors per task (totalErrors / totalTasks) */
  averageErrorsPerTask: number;
}

/**
 * Error detection statistics
 * AC-7.8: Error Detection Metrics - Measure early detection effectiveness
 */
export interface DetectionStats {
  /** Number of errors caught in iterative verification */
  errorsCaught: number;

  /** Number of errors escaped to later stages */
  errorsEscaped: number;

  /** Percentage of errors caught early (errorsCaught / (errorsCaught + errorsEscaped) * 100) */
  catchRate: number;

  /** Average time to error detection in minutes */
  timeToDetection: number;
}
