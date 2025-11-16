/**
 * Pattern Selector
 *
 * Implements automatic orchestration pattern selection based on task characteristics.
 * Maps to AC-3.5: AutoPattern Selection
 *
 * EARS: WHEN Orchestrator receives task, System SHALL automatically select
 * most appropriate pattern based on complexity, capabilities, dependencies
 *
 * Selection Algorithm (from ADR-003):
 * 1. UserProxy (highest priority) - if task.requiresHumanApproval === true
 * 2. Nested - if task.subtasks.length > 0
 * 3. Swarm - if no dependencies AND many subtasks (dependencies.length === 0 && subtasks.length > 3)
 * 4. Group - if many agents (agents.length > 5)
 * 5. Sequential (default fallback)
 */

import type { Task } from '../types/task.js';
import { OrchestrationPattern } from '../types/pattern.js';

/**
 * Pattern recommendation with score and reasoning
 */
export interface PatternRecommendation {
  /** Recommended pattern */
  pattern: OrchestrationPattern;
  /** Suitability score (0-100, higher is better) */
  score: number;
  /** Human-readable reason for recommendation */
  reason: string;
}

/**
 * Pattern Selector
 *
 * Analyzes task characteristics and selects the most appropriate
 * orchestration pattern.
 */
export class PatternSelector {
  /**
   * Select best orchestration pattern for task
   *
   * AC-3.5: AutoPattern Selection
   *
   * @param task - Task to analyze
   * @returns Selected orchestration pattern
   */
  selectPattern(task: Task): OrchestrationPattern {
    // Rule 1: UserProxy (highest priority)
    if (task.requiresHumanApproval) {
      return OrchestrationPattern.USER_PROXY;
    }

    // Rule 2: Nested (if subtasks exist)
    if (task.subtasks && task.subtasks.length > 0) {
      // Check if subtasks are independent (no dependencies)
      const hasNoDependencies = task.dependencies.length === 0;
      const hasIndependentSubtasks = this.areSubtasksIndependent(task.subtasks);

      // If many independent subtasks, prefer Swarm
      if (
        hasNoDependencies &&
        hasIndependentSubtasks &&
        task.subtasks.length > 3
      ) {
        return OrchestrationPattern.SWARM;
      }

      // Otherwise use Nested
      return OrchestrationPattern.NESTED;
    }

    // Rule 3: Group (if many agents)
    const agentCount = task.assignedAgents?.length || 0;
    if (agentCount > 5) {
      return OrchestrationPattern.GROUP_CHAT;
    }

    // Rule 4: Sequential (default fallback)
    return OrchestrationPattern.SEQUENTIAL;
  }

  /**
   * Explain why a pattern was selected
   *
   * Provides human-readable explanation of pattern selection decision.
   *
   * @param task - Task that was analyzed
   * @param pattern - Pattern that was selected
   * @returns Explanation string
   */
  explainSelection(task: Task, pattern: OrchestrationPattern): string {
    switch (pattern) {
      case OrchestrationPattern.USER_PROXY:
        return `Selected UserProxy pattern because task "${task.name}" requires human approval. This pattern will pause execution and wait for user confirmation before proceeding.`;

      case OrchestrationPattern.NESTED:
        return `Selected Nested pattern because task "${task.name}" has ${task.subtasks.length} subtask(s). This pattern allows hierarchical task delegation with parent-child relationships.`;

      case OrchestrationPattern.SWARM:
        return `Selected Swarm pattern because task "${task.name}" has ${task.subtasks.length} independent subtasks with no dependencies. This pattern enables parallel execution with autonomous coordination.`;

      case OrchestrationPattern.GROUP_CHAT:
        return `Selected Group Chat pattern because task "${task.name}" requires ${task.assignedAgents.length} agents. This pattern uses manager-driven speaker selection for multi-agent collaboration.`;

      case OrchestrationPattern.SEQUENTIAL:
        return `Selected Sequential pattern because task "${task.name}" is a straightforward linear workflow. This pattern executes agents in sequence (A → B → C).`;

      case OrchestrationPattern.FSM:
        return `Selected Finite State Machine pattern because task "${task.name}" follows a state-driven workflow. This pattern manages transitions between discrete states.`;

      case OrchestrationPattern.HIERARCHICAL:
        return `Selected Hierarchical pattern because task "${task.name}" requires a command chain structure. This pattern organizes agents in a parent-child hierarchy.`;

      default:
        return `Selected ${pattern} pattern for task "${task.name}".`;
    }
  }

  /**
   * Get recommended patterns ranked by suitability
   *
   * Returns top 3 recommended patterns with scores and reasons.
   *
   * @param task - Task to analyze
   * @returns Array of pattern recommendations (top 3, sorted by score)
   */
  recommendPatterns(task: Task): PatternRecommendation[] {
    const recommendations: PatternRecommendation[] = [];

    // Score each pattern
    const agentCount = task.assignedAgents?.length || 0;
    const subtaskCount = task.subtasks?.length || 0;
    const dependencyCount = task.dependencies?.length || 0;
    const hasSubtasks = subtaskCount > 0;
    const hasNoDependencies = dependencyCount === 0;
    const hasIndependentSubtasks = hasSubtasks && this.areSubtasksIndependent(task.subtasks);

    // UserProxy scoring
    if (task.requiresHumanApproval) {
      recommendations.push({
        pattern: OrchestrationPattern.USER_PROXY,
        score: 100,
        reason: 'Task requires human approval (mandatory)',
      });
    } else {
      recommendations.push({
        pattern: OrchestrationPattern.USER_PROXY,
        score: 0,
        reason: 'Task does not require human approval',
      });
    }

    // Nested scoring
    if (hasSubtasks) {
      const score = 80 + Math.min(subtaskCount * 2, 20);
      recommendations.push({
        pattern: OrchestrationPattern.NESTED,
        score,
        reason: `Task has ${subtaskCount} subtask(s), suitable for hierarchical delegation`,
      });
    } else {
      recommendations.push({
        pattern: OrchestrationPattern.NESTED,
        score: 10,
        reason: 'Task has no subtasks',
      });
    }

    // Swarm scoring
    if (hasNoDependencies && hasIndependentSubtasks && subtaskCount > 3) {
      const score = 90 + Math.min(subtaskCount, 10);
      recommendations.push({
        pattern: OrchestrationPattern.SWARM,
        score,
        reason: `Task has ${subtaskCount} independent subtasks, ideal for parallel execution`,
      });
    } else if (hasSubtasks) {
      recommendations.push({
        pattern: OrchestrationPattern.SWARM,
        score: 30,
        reason: 'Task has subtasks but they are not fully independent',
      });
    } else {
      recommendations.push({
        pattern: OrchestrationPattern.SWARM,
        score: 10,
        reason: 'Task has no subtasks for parallel execution',
      });
    }

    // Group Chat scoring
    if (agentCount > 5) {
      const score = 85 + Math.min(agentCount - 5, 15);
      recommendations.push({
        pattern: OrchestrationPattern.GROUP_CHAT,
        score,
        reason: `Task requires ${agentCount} agents, suitable for group coordination`,
      });
    } else if (agentCount > 3) {
      recommendations.push({
        pattern: OrchestrationPattern.GROUP_CHAT,
        score: 50,
        reason: `Task has ${agentCount} agents, group chat is possible but not optimal`,
      });
    } else {
      recommendations.push({
        pattern: OrchestrationPattern.GROUP_CHAT,
        score: 20,
        reason: `Task has only ${agentCount} agent(s), group chat is overkill`,
      });
    }

    // Sequential scoring (always viable as fallback)
    if (agentCount <= 5 && !hasSubtasks) {
      const score = 70 + (agentCount === 0 ? 0 : Math.min(agentCount * 5, 20));
      recommendations.push({
        pattern: OrchestrationPattern.SEQUENTIAL,
        score,
        reason: 'Task is simple linear workflow, sequential execution is efficient',
      });
    } else {
      recommendations.push({
        pattern: OrchestrationPattern.SEQUENTIAL,
        score: 40,
        reason: 'Sequential execution is always possible but may not be optimal',
      });
    }

    // FSM scoring (context-dependent, low by default)
    recommendations.push({
      pattern: OrchestrationPattern.FSM,
      score: 20,
      reason: 'Finite State Machine requires explicit state definitions',
    });

    // Hierarchical scoring (context-dependent, low by default)
    recommendations.push({
      pattern: OrchestrationPattern.HIERARCHICAL,
      score: 20,
      reason: 'Hierarchical pattern requires explicit hierarchy definition',
    });

    // Sort by score (descending) and return top 3
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  /**
   * Check if subtasks are independent (no dependencies between them)
   *
   * @param subtasks - Array of subtasks to check
   * @returns True if all subtasks are independent
   */
  private areSubtasksIndependent(subtasks: Task[]): boolean {
    if (!subtasks || subtasks.length === 0) {
      return true;
    }

    // Check if any subtask has dependencies
    for (const subtask of subtasks) {
      if (subtask.dependencies && subtask.dependencies.length > 0) {
        return false;
      }
    }

    return true;
  }
}
