/**
 * Missing Feature Detector
 *
 * AC-5.2: Missing Features Detection
 * Identifies requirements with no implementation in the codebase.
 *
 * @packageDocumentation
 */

import type { Requirement, Gap } from '../types/index.js';
import type { ASTParser } from '../parsers/ast-parser.js';

/**
 * Missing Feature Detector
 *
 * AC-5.2: Identifies requirements with no implementation (missing features)
 *
 * Uses AST Parser for high-accuracy detection (Article 1: Library-First).
 */
export class MissingFeatureDetector {
  /**
   * Creates a new missing feature detector
   *
   * @param astParser - AST parser instance for codebase analysis
   */
  constructor(private astParser: ASTParser) {}

  /**
   * AC-5.2: Detect missing features
   *
   * Analyzes requirements and identifies which ones have no implementation
   * in the codebase. Returns gap objects for each missing feature.
   *
   * @param requirements - All requirements to check
   * @returns Array of gap objects for missing features
   */
  detect(requirements: Requirement[]): Gap[] {
    const gaps: Gap[] = [];

    for (const req of requirements) {
      // Use AST Parser to check for implementation
      const hasImplementation = this.astParser.findImplementation(req);

      if (!hasImplementation) {
        // Determine severity based on priority
        const severity = this.determineSeverity(req.priority);

        gaps.push({
          type: 'missing-feature',
          requirement: req.id,
          description: `${req.id}: ${req.feature} (NOT FOUND in codebase)`,
          recommendation: `Implement ${req.feature} following ${req.description}`,
          severity,
          context: `Description: ${req.description}`,
        });
      }
    }

    return gaps;
  }

  /**
   * Detect missing features for a specific feature group
   *
   * @param requirements - All requirements
   * @param featureNumber - Feature number to filter (1-8)
   * @returns Array of gap objects for missing features in this feature
   */
  detectForFeature(requirements: Requirement[], featureNumber: number): Gap[] {
    const featureRequirements = requirements.filter(
      (req) => req.featureNumber === featureNumber
    );

    return this.detect(featureRequirements);
  }

  /**
   * Detect missing features by priority
   *
   * @param requirements - All requirements
   * @param priority - Priority level to filter (P0, P1, P2)
   * @returns Array of gap objects for missing features at this priority
   */
  detectByPriority(requirements: Requirement[], priority: string): Gap[] {
    const priorityRequirements = requirements.filter((req) => req.priority === priority);

    return this.detect(priorityRequirements);
  }

  /**
   * Get missing features summary
   *
   * @param gaps - All gap objects
   * @returns Summary of missing features by priority
   */
  getSummary(gaps: Gap[]): { p0: number; p1: number; p2: number; total: number } {
    const summary = { p0: 0, p1: 0, p2: 0, total: gaps.length };

    for (const gap of gaps) {
      // Extract priority from requirement ID (AC-X.Y)
      if (gap.requirement) {
        const match = gap.requirement.match(/AC-(\d+)\./);
        if (match) {
          const featureNum = parseInt(match[1]!, 10);  // Safe - regex match[1] exists

          // Map feature number to priority (based on requirements)
          // Features 1-3: P0, Features 4-6: P1, Features 7-8: P2
          if (featureNum <= 3) {
            summary.p0++;
          } else if (featureNum <= 6) {
            summary.p1++;
          } else {
            summary.p2++;
          }
        }
      }
    }

    return summary;
  }

  /**
   * Determine severity based on requirement priority
   *
   * @param priority - Requirement priority
   * @returns Gap severity level
   */
  private determineSeverity(priority: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (priority) {
      case 'P0':
        return 'critical';
      case 'P1':
        return 'high';
      case 'P2':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Filter gaps by severity
   *
   * @param gaps - All gap objects
   * @param severity - Severity level to filter
   * @returns Filtered gap objects
   */
  filterBySeverity(gaps: Gap[], severity: string): Gap[] {
    return gaps.filter((gap) => gap.severity === severity);
  }

  /**
   * Sort gaps by severity (critical first)
   *
   * @param gaps - All gap objects
   * @returns Sorted gap objects
   */
  sortBySeverity(gaps: Gap[]): Gap[] {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    return [...gaps].sort((a, b) => {
      const orderA = severityOrder[a.severity] ?? 999;
      const orderB = severityOrder[b.severity] ?? 999;
      return orderA - orderB;
    });
  }
}
