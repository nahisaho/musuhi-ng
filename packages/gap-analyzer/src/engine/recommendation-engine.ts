/**
 * Recommendation Engine
 *
 * AC-5.5: Reconciliation Recommendations
 * Generates actionable recommendations to address gaps.
 *
 * @packageDocumentation
 */

import type { Gap } from '../types/index.js';

/**
 * Recommendation types
 *
 * AC-5.5: "Add feature", "Update requirement", "Deprecate code"
 */
export type RecommendationType = 'add-feature' | 'update-requirement' | 'deprecate-code' | 'resolve-conflict' | 'plan-migration';

/**
 * Recommendation with priority and rationale
 */
export interface Recommendation {
  /** Type of recommendation */
  type: RecommendationType;

  /** Human-readable description */
  description: string;

  /** Priority level (inherited from gap severity) */
  priority: 'critical' | 'high' | 'medium' | 'low';

  /** Rationale for this recommendation */
  rationale: string;

  /** Associated gap */
  gap: Gap;

  /** Estimated effort (hours) */
  estimatedEffort?: number;

  /** Dependencies (other recommendations that must be done first) */
  dependencies?: string[];
}

/**
 * Recommendation Engine
 *
 * AC-5.5: Provides "Add feature", "Update requirement", "Deprecate code" recommendations
 *
 * Analyzes gaps and generates prioritized, actionable recommendations.
 */
export class RecommendationEngine {
  /**
   * Generate recommendations from gaps
   *
   * AC-5.5: Main recommendation generation logic
   * Maps each gap to one or more actionable recommendations.
   *
   * @param gaps - All detected gaps
   * @returns Array of recommendations
   */
  generate(gaps: Gap[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    for (const gap of gaps) {
      const recs = this.generateForGap(gap);
      recommendations.push(...recs);
    }

    // Sort by priority (critical first)
    return this.sortByPriority(recommendations);
  }

  /**
   * Generate recommendations for a single gap
   *
   * @param gap - Gap to generate recommendations for
   * @returns Array of recommendations for this gap
   */
  private generateForGap(gap: Gap): Recommendation[] {
    switch (gap.type) {
      case 'missing-feature':
        return this.generateForMissingFeature(gap);

      case 'undocumented-feature':
        return this.generateForUndocumentedFeature(gap);

      case 'conflict':
        return this.generateForConflict(gap);

      case 'breaking-change':
        return this.generateForBreakingChange(gap);

      case 'pattern-violation':
        return this.generateForPatternViolation(gap);

      default:
        return [];
    }
  }

  /**
   * Generate recommendations for missing features
   *
   * AC-5.5: "Add feature" recommendation
   *
   * @param gap - Missing feature gap
   * @returns Array of recommendations
   */
  private generateForMissingFeature(gap: Gap): Recommendation[] {
    return [
      {
        type: 'add-feature',
        description: gap.recommendation,
        priority: gap.severity,
        rationale: `Requirement ${gap.requirement} is specified but not implemented. This creates a gap between specification and reality.`,
        gap,
        estimatedEffort: this.estimateImplementationEffort(gap),
      },
    ];
  }

  /**
   * Generate recommendations for undocumented features
   *
   * AC-5.5: "Update requirement" recommendation
   *
   * @param gap - Undocumented feature gap
   * @returns Array of recommendations
   */
  private generateForUndocumentedFeature(gap: Gap): Recommendation[] {
    return [
      {
        type: 'update-requirement',
        description: gap.recommendation,
        priority: gap.severity,
        rationale: `File ${gap.file} exists but has no corresponding requirement. Either document it or remove it to reduce technical debt.`,
        gap,
        estimatedEffort: 2, // 2 hours to write requirement
      },
      {
        type: 'deprecate-code',
        description: `Deprecate ${gap.file} if no longer needed`,
        priority: 'low',
        rationale: `If this code is not essential, deprecating it reduces maintenance burden.`,
        gap,
        estimatedEffort: 1, // 1 hour to deprecate
      },
    ];
  }

  /**
   * Generate recommendations for conflicts
   *
   * AC-5.5: "Resolve conflict" recommendation
   *
   * @param gap - Conflict gap
   * @returns Array of recommendations
   */
  private generateForConflict(gap: Gap): Recommendation[] {
    return [
      {
        type: 'resolve-conflict',
        description: gap.recommendation,
        priority: gap.severity,
        rationale: `Conflict detected: ${gap.description}. This must be resolved to ensure consistency.`,
        gap,
        estimatedEffort: this.estimateConflictResolutionEffort(gap),
      },
    ];
  }

  /**
   * Generate recommendations for breaking changes
   *
   * AC-5.5: "Plan migration" recommendation
   *
   * @param gap - Breaking change gap
   * @returns Array of recommendations
   */
  private generateForBreakingChange(gap: Gap): Recommendation[] {
    return [
      {
        type: 'plan-migration',
        description: gap.recommendation,
        priority: gap.severity,
        rationale: `Breaking change detected for ${gap.requirement}. Migration plan required before implementation.`,
        gap,
        estimatedEffort: this.estimateMigrationEffort(gap),
      },
    ];
  }

  /**
   * Generate recommendations for pattern violations
   *
   * AC-5.5: "Update requirement" recommendation
   *
   * @param gap - Pattern violation gap
   * @returns Array of recommendations
   */
  private generateForPatternViolation(gap: Gap): Recommendation[] {
    return [
      {
        type: 'update-requirement',
        description: gap.recommendation,
        priority: gap.severity,
        rationale: `Requirement ${gap.requirement} violates documented architectural patterns. Align with steering or update patterns.`,
        gap,
        estimatedEffort: 4, // 4 hours to align or update steering
      },
    ];
  }

  /**
   * Estimate implementation effort for missing feature
   *
   * @param gap - Missing feature gap
   * @returns Estimated hours
   */
  private estimateImplementationEffort(gap: Gap): number {
    // Heuristic based on severity
    switch (gap.severity) {
      case 'critical':
        return 40; // 1 week (5 days × 8 hours)
      case 'high':
        return 20; // 2.5 days
      case 'medium':
        return 10; // 1.25 days
      case 'low':
        return 5; // 5 hours
      default:
        return 8; // 1 day default
    }
  }

  /**
   * Estimate conflict resolution effort
   *
   * @param gap - Conflict gap
   * @returns Estimated hours
   */
  private estimateConflictResolutionEffort(gap: Gap): number {
    // Conflicts typically require more discussion and refactoring
    switch (gap.severity) {
      case 'critical':
        return 80; // 2 weeks
      case 'high':
        return 40; // 1 week
      case 'medium':
        return 20; // 2.5 days
      case 'low':
        return 10; // 1.25 days
      default:
        return 16; // 2 days default
    }
  }

  /**
   * Estimate migration effort for breaking change
   *
   * @param _gap - Breaking change gap (future use for custom estimates)
   * @returns Estimated hours
   */
  private estimateMigrationEffort(_gap: Gap): number {
    // Breaking changes require planning, implementation, and user migration
    return 80; // 2 weeks default for breaking changes
  }

  /**
   * Sort recommendations by priority
   *
   * @param recommendations - All recommendations
   * @returns Sorted recommendations (critical first)
   */
  private sortByPriority(recommendations: Recommendation[]): Recommendation[] {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    return [...recommendations].sort((a, b) => {
      const orderA = priorityOrder[a.priority] ?? 999;
      const orderB = priorityOrder[b.priority] ?? 999;
      return orderA - orderB;
    });
  }

  /**
   * Group recommendations by type
   *
   * @param recommendations - All recommendations
   * @returns Map of recommendation type to recommendations
   */
  groupByType(recommendations: Recommendation[]): Map<RecommendationType, Recommendation[]> {
    const grouped = new Map<RecommendationType, Recommendation[]>();

    for (const rec of recommendations) {
      const existing = grouped.get(rec.type) || [];
      existing.push(rec);
      grouped.set(rec.type, existing);
    }

    return grouped;
  }

  /**
   * Calculate total estimated effort
   *
   * @param recommendations - All recommendations
   * @returns Total hours
   */
  getTotalEffort(recommendations: Recommendation[]): number {
    return recommendations.reduce((total, rec) => total + (rec.estimatedEffort || 0), 0);
  }

  /**
   * Generate action plan (roadmap)
   *
   * @param recommendations - All recommendations
   * @returns Formatted action plan
   */
  generateActionPlan(recommendations: Recommendation[]): string {
    let plan = '# Action Plan\n\n';

    // Group by priority
    const byPriority = new Map<string, Recommendation[]>();
    for (const rec of recommendations) {
      const existing = byPriority.get(rec.priority) || [];
      existing.push(rec);
      byPriority.set(rec.priority, existing);
    }

    // Critical first
    const priorities = ['critical', 'high', 'medium', 'low'];

    for (const priority of priorities) {
      const recs = byPriority.get(priority);
      if (!recs || recs.length === 0) continue;

      plan += `## ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority (${recs.length} items)\n\n`;

      for (const rec of recs) {
        plan += `### ${rec.type}: ${rec.description}\n\n`;
        plan += `**Rationale**: ${rec.rationale}\n\n`;
        plan += `**Estimated Effort**: ${rec.estimatedEffort || 'Unknown'} hours\n\n`;
        plan += `**Gap**: ${rec.gap.type} - ${rec.gap.description}\n\n`;
        plan += `---\n\n`;
      }
    }

    // Add summary
    const totalEffort = this.getTotalEffort(recommendations);
    plan += `\n## Summary\n\n`;
    plan += `**Total Items**: ${recommendations.length}\n`;
    plan += `**Total Estimated Effort**: ${totalEffort} hours (${(totalEffort / 8).toFixed(1)} days)\n`;

    return plan;
  }
}
