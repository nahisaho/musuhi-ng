/**
 * Workflow types for Dashboard
 *
 * Defines workflow stages and progress tracking for the 8-stage SDD workflow.
 *
 * @packageDocumentation
 */

/**
 * 8-stage SDD workflow stages
 *
 * AC-6.2: Workflow Status View
 */
export type WorkflowStage =
  | 'research'
  | 'requirements'
  | 'design'
  | 'tasks'
  | 'implementation'
  | 'testing'
  | 'deployment'
  | 'monitoring';

/**
 * Workflow stage progress information
 *
 * AC-6.2: Displays current stage with progress percentage
 */
export interface StageProgress {
  /** Current workflow stage */
  stage: WorkflowStage;
  /** Progress percentage (0-100) */
  progress: number;
  /** Stage status */
  status: 'pending' | 'in-progress' | 'completed';
}

/**
 * Ordered list of workflow stages
 *
 * Used for calculating workflow progress and stage transitions
 */
export const WORKFLOW_STAGES: readonly WorkflowStage[] = [
  'research',
  'requirements',
  'design',
  'tasks',
  'implementation',
  'testing',
  'deployment',
  'monitoring',
] as const;

/**
 * Maps workflow stage to display name
 */
export const WORKFLOW_STAGE_NAMES: Record<WorkflowStage, string> = {
  research: 'Research',
  requirements: 'Requirements',
  design: 'Design',
  tasks: 'Tasks',
  implementation: 'Implementation',
  testing: 'Testing',
  deployment: 'Deployment',
  monitoring: 'Monitoring',
};

/**
 * Calculates overall workflow progress based on current stage
 *
 * @param stage - Current workflow stage
 * @returns Progress percentage (0-100)
 *
 * @example
 * ```typescript
 * const progress = calculateWorkflowProgress('design'); // Returns 37.5 (3/8 * 100)
 * ```
 */
export function calculateWorkflowProgress(stage: WorkflowStage): number {
  const index = WORKFLOW_STAGES.indexOf(stage);
  if (index === -1) {
    return 0;
  }
  return Math.round(((index + 1) / WORKFLOW_STAGES.length) * 100);
}

/**
 * Gets the next workflow stage
 *
 * @param currentStage - Current workflow stage
 * @returns Next stage, or undefined if at the last stage
 */
export function getNextStage(currentStage: WorkflowStage): WorkflowStage | undefined {
  const index = WORKFLOW_STAGES.indexOf(currentStage);
  if (index === -1 || index === WORKFLOW_STAGES.length - 1) {
    return undefined;
  }
  return WORKFLOW_STAGES[index + 1];
}

/**
 * Gets the previous workflow stage
 *
 * @param currentStage - Current workflow stage
 * @returns Previous stage, or undefined if at the first stage
 */
export function getPreviousStage(currentStage: WorkflowStage): WorkflowStage | undefined {
  const index = WORKFLOW_STAGES.indexOf(currentStage);
  if (index <= 0) {
    return undefined;
  }
  return WORKFLOW_STAGES[index - 1];
}
