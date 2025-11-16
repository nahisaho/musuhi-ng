/**
 * Agent status types for Dashboard
 *
 * Defines agent execution status and P-wave progress tracking.
 *
 * @packageDocumentation
 */

/**
 * Agent execution status
 *
 * AC-6.5: Active Agent Status
 */
export interface AgentStatus {
  /** Agent name (e.g., 'requirements-analyst', 'system-architect') */
  name: string;
  /** Current execution status */
  status: 'idle' | 'active' | 'paused' | 'error';
  /** Current task description (if active) */
  currentTask?: string;
  /** Task progress percentage (0-100, if active) */
  progress?: number;
  /** Task start timestamp (if active) */
  startedAt?: Date;
  /** Error message (if status is 'error') */
  errorMessage?: string;
}

/**
 * P-wave parallel execution status
 *
 * AC-6.6: Parallel Execution Visualization
 */
export interface PWaveStatus {
  /** Progress information for each wave (P0, P1, P2, ...) */
  waves: Map<number, WaveProgress>;
  /** Time savings percentage vs. sequential execution */
  timeSavings: number;
  /** Estimated sequential execution time (minutes) */
  sequentialTime: number;
  /** Estimated parallel execution time (minutes) */
  parallelTime: number;
}

/**
 * Progress information for a single P-wave
 *
 * AC-6.6: Displays active tasks per wave, completed tasks
 */
export interface WaveProgress {
  /** Wave number (0 = P0, 1 = P1, 2 = P2, etc.) */
  wave: number;
  /** Total number of tasks in this wave */
  totalTasks: number;
  /** Number of completed tasks */
  completedTasks: number;
  /** Number of currently executing tasks */
  activeTasks: number;
  /** Number of pending tasks (not started) */
  pendingTasks: number;
  /** Estimated time to complete wave (minutes) */
  estimatedTime: number;
}

/**
 * Agent display names mapping
 *
 * Maps agent IDs to human-readable names for dashboard display
 */
export const AGENT_NAMES: Record<string, string> = {
  'orchestrator': 'Orchestrator',
  'steering': 'Steering',
  'requirements-analyst': 'Requirements Analyst',
  'project-manager': 'Project Manager',
  'system-architect': 'System Architect',
  'api-designer': 'API Designer',
  'database-schema-designer': 'Database Schema Designer',
  'ui-ux-designer': 'UI/UX Designer',
  'software-developer': 'Software Developer',
  'test-engineer': 'Test Engineer',
  'code-reviewer': 'Code Reviewer',
  'bug-hunter': 'Bug Hunter',
  'quality-assurance': 'Quality Assurance',
  'security-auditor': 'Security Auditor',
  'performance-optimizer': 'Performance Optimizer',
  'devops-engineer': 'DevOps Engineer',
  'cloud-architect': 'Cloud Architect',
  'database-administrator': 'Database Administrator',
  'technical-writer': 'Technical Writer',
  'ai-ml-engineer': 'AI/ML Engineer',
};

/**
 * Formats agent status for display
 *
 * @param status - Agent status
 * @returns Formatted status string with color/symbol indicators
 *
 * @example
 * ```typescript
 * formatAgentStatus('idle') // Returns '[IDLE]'
 * formatAgentStatus('active') // Returns '[ACTIVE]'
 * formatAgentStatus('error') // Returns '[ERROR]'
 * ```
 */
export function formatAgentStatus(status: AgentStatus['status']): string {
  const statusMap = {
    idle: '[IDLE]',
    active: '[ACTIVE]',
    paused: '[PAUSED]',
    error: '[ERROR]',
  };
  return statusMap[status];
}

/**
 * Calculates wave completion percentage
 *
 * @param wave - Wave progress information
 * @returns Completion percentage (0-100)
 */
export function calculateWaveCompletion(wave: WaveProgress): number {
  if (wave.totalTasks === 0) {
    return 0;
  }
  return Math.round((wave.completedTasks / wave.totalTasks) * 100);
}

/**
 * Gets wave label (P0, P1, P2, etc.)
 *
 * @param wave - Wave number
 * @returns Wave label string
 *
 * @example
 * ```typescript
 * getWaveLabel(0) // Returns 'P0'
 * getWaveLabel(1) // Returns 'P1'
 * ```
 */
export function getWaveLabel(wave: number): string {
  return `P${wave}`;
}
