/**
 * Workflow Engine
 * Manages the 8-stage SDD workflow
 * @module @musuhi-ng/core/workflow
 */

import type {
  WorkflowStage,
  WorkflowStageConfig,
  WorkflowContext,
  QualityGate,
  GateValidationResult,
} from '../types/workflow.js';

/**
 * Workflow Engine
 * Manages workflow stage transitions and quality gates
 */
export class WorkflowEngine {
  private context: WorkflowContext;

  constructor(projectRoot: string) {
    this.context = this.initializeContext(projectRoot);
  }

  /**
   * Initialize workflow context
   */
  private initializeContext(projectRoot: string): WorkflowContext {
    const stages: WorkflowStageConfig[] = [
      { stage: 'research', status: 'not-started', deliverables: [], qualityGates: [] },
      { stage: 'requirements', status: 'not-started', deliverables: [], qualityGates: [] },
      { stage: 'design', status: 'not-started', deliverables: [], qualityGates: [] },
      { stage: 'tasks', status: 'not-started', deliverables: [], qualityGates: [] },
      { stage: 'implementation', status: 'not-started', deliverables: [], qualityGates: [] },
      { stage: 'testing', status: 'not-started', deliverables: [], qualityGates: [] },
      { stage: 'deployment', status: 'not-started', deliverables: [], qualityGates: [] },
      { stage: 'monitoring', status: 'not-started', deliverables: [], qualityGates: [] },
    ];

    return {
      projectRoot,
      currentStage: 'research',
      stages,
      metadata: {
        startedAt: new Date(),
      },
    };
  }

  /**
   * Get current workflow context
   */
  getContext(): WorkflowContext {
    return this.context;
  }

  /**
   * Get current stage
   */
  getCurrentStage(): WorkflowStageConfig | undefined {
    return this.context.stages.find((s) => s.stage === this.context.currentStage);
  }

  /**
   * Get stage by name
   */
  getStage(stage: WorkflowStage): WorkflowStageConfig | undefined {
    return this.context.stages.find((s) => s.stage === stage);
  }

  /**
   * Start a stage
   */
  startStage(stage: WorkflowStage): void {
    const stageConfig = this.getStage(stage);
    if (!stageConfig) {
      throw new Error(`Stage ${stage} not found`);
    }

    if (stageConfig.status === 'in-progress') {
      throw new Error(`Stage ${stage} is already in progress`);
    }

    if (stageConfig.status === 'completed') {
      throw new Error(`Stage ${stage} is already completed`);
    }

    stageConfig.status = 'in-progress';
    stageConfig.startedAt = new Date();
    this.context.currentStage = stage;
  }

  /**
   * Complete a stage
   */
  async completeStage(stage: WorkflowStage): Promise<GateValidationResult> {
    const stageConfig = this.getStage(stage);
    if (!stageConfig) {
      throw new Error(`Stage ${stage} not found`);
    }

    if (stageConfig.status !== 'in-progress') {
      throw new Error(`Stage ${stage} is not in progress`);
    }

    // Run quality gates
    const gateResults = await this.runQualityGates(stage);

    const mandatoryFailed = gateResults.filter((r) => !r.passed && r.mandatory);
    if (mandatoryFailed.length > 0) {
      stageConfig.status = 'blocked';
      return {
        passed: false,
        message: `${mandatoryFailed.length} mandatory quality gates failed`,
        details: { failedGates: mandatoryFailed },
        suggestions: mandatoryFailed.flatMap((g) => g.suggestions || []),
      };
    }

    stageConfig.status = 'completed';
    stageConfig.completedAt = new Date();

    // Move to next stage
    const nextStage = this.getNextStage(stage);
    if (nextStage) {
      this.context.currentStage = nextStage.stage;
    }

    return {
      passed: true,
      message: `Stage ${stage} completed successfully`,
    };
  }

  /**
   * Run quality gates for a stage
   */
  private async runQualityGates(
    stage: WorkflowStage
  ): Promise<Array<GateValidationResult & { mandatory: boolean }>> {
    const stageConfig = this.getStage(stage);
    if (!stageConfig || !stageConfig.qualityGates) {
      return [];
    }

    const results: Array<GateValidationResult & { mandatory: boolean }> = [];

    for (const gate of stageConfig.qualityGates) {
      const result = await gate.validator(this.context);
      results.push({
        ...result,
        mandatory: gate.mandatory,
      });
    }

    return results;
  }

  /**
   * Get next stage
   */
  private getNextStage(currentStage: WorkflowStage): WorkflowStageConfig | undefined {
    const stageOrder: WorkflowStage[] = [
      'research',
      'requirements',
      'design',
      'tasks',
      'implementation',
      'testing',
      'deployment',
      'monitoring',
    ];

    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === stageOrder.length - 1) {
      return undefined;
    }

    const nextStageName = stageOrder[currentIndex + 1];
    if (!nextStageName) {
      return undefined;
    }
    return this.getStage(nextStageName);
  }

  /**
   * Add quality gate to stage
   */
  addQualityGate(stage: WorkflowStage, gate: QualityGate): void {
    const stageConfig = this.getStage(stage);
    if (!stageConfig) {
      throw new Error(`Stage ${stage} not found`);
    }

    if (!stageConfig.qualityGates) {
      stageConfig.qualityGates = [];
    }

    stageConfig.qualityGates.push(gate);
    stageConfig.qualityGates.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Add deliverable to stage
   */
  addDeliverable(stage: WorkflowStage, path: string): void {
    const stageConfig = this.getStage(stage);
    if (!stageConfig) {
      throw new Error(`Stage ${stage} not found`);
    }

    if (!stageConfig.deliverables) {
      stageConfig.deliverables = [];
    }

    if (!stageConfig.deliverables.includes(path)) {
      stageConfig.deliverables.push(path);
    }
  }

  /**
   * Get workflow progress (percentage)
   */
  getProgress(): number {
    const completed = this.context.stages.filter((s) => s.status === 'completed').length;
    return (completed / this.context.stages.length) * 100;
  }

  /**
   * Get workflow summary
   */
  getSummary(): {
    currentStage: WorkflowStage;
    progress: number;
    completedStages: WorkflowStage[];
    blockedStages: WorkflowStage[];
    totalDeliverables: number;
  } {
    const completedStages = this.context.stages
      .filter((s) => s.status === 'completed')
      .map((s) => s.stage);

    const blockedStages = this.context.stages
      .filter((s) => s.status === 'blocked')
      .map((s) => s.stage);

    const totalDeliverables = this.context.stages.reduce(
      (sum, s) => sum + (s.deliverables?.length || 0),
      0
    );

    return {
      currentStage: this.context.currentStage,
      progress: this.getProgress(),
      completedStages,
      blockedStages,
      totalDeliverables,
    };
  }
}
