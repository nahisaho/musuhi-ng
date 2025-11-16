/**
 * Breaking Change Detector
 *
 * AC-5.6: Breaking Change Detection
 * Identifies requirements that introduce breaking changes and suggests migration strategies.
 *
 * @packageDocumentation
 */

import type { Requirement, Gap, BreakingChange } from '../types/index.js';
import type { PatternMatcher } from '../parsers/pattern-matcher.js';

/**
 * Breaking Change Detector
 *
 * AC-5.6: IF requirement introduces breaking changes,
 * THEN Gap Analysis SHALL flag and suggest migration strategies
 *
 * Detects API-breaking changes that require major version bump.
 */
export class BreakingChangeDetector {
  /**
   * Creates a new breaking change detector
   *
   * @param patternMatcher - Pattern matcher for fast keyword scanning
   */
  constructor(private patternMatcher: PatternMatcher) {}

  /**
   * AC-5.6: Detect breaking changes
   *
   * Analyzes requirements to identify breaking changes:
   * - Interface/type changes
   * - Function signature changes
   * - API endpoint changes
   * - Removed features
   * - Renamed components
   *
   * @param requirements - All requirements to check
   * @param codebase - Existing codebase text
   * @returns Array of gap objects for breaking changes
   */
  detect(requirements: Requirement[], _codebase: string): Gap[] {
    const gaps: Gap[] = [];

    for (const req of requirements) {
      // Check if this is an additive change (non-breaking)
      if (this.isAdditiveChange(req)) {
        continue; // Skip non-breaking additive changes
      }

      // Use pattern matcher for quick scan
      const isBreaking = this.patternMatcher.findBreakingChanges(_codebase, req);

      if (isBreaking) {
        const breakingChange = this.analyzeBreakingChange(req, _codebase);

        // Create detailed description with requirement keywords
        const description = this.createDetailedDescription(req, breakingChange, _codebase);

        // Set severity based on priority
        const severity = req.priority === 'P0' ? 'critical' : req.priority === 'P1' ? 'high' : 'medium';

        gaps.push({
          type: 'breaking-change',
          requirement: req.id,
          description,
          recommendation: breakingChange.migrationStrategy,
          severity,
          context: `Change type: ${breakingChange.changeType}, Version impact: ${breakingChange.versionImpact}`,
        });
      }
    }

    return gaps;
  }

  /**
   * Create detailed description for breaking change
   *
   * @param requirement - Requirement introducing breaking change
   * @param breakingChange - Breaking change details
   * @param codebase - Existing codebase
   * @returns Detailed description
   */
  private createDetailedDescription(requirement: Requirement, breakingChange: BreakingChange, _codebase: string): string {
    const changeType = breakingChange.changeType;
    const feature = requirement.feature;
    // @ts-ignore - Future use: analyze description for detailed breakage detection
    const _desc = requirement.description.toLowerCase();

    switch (changeType) {
      case 'interface': {
        // Find interface name from keywords or description
        const interfaceName = requirement.keywords.find(k =>
          !['interface', 'change', 'update', 'modify'].includes(k.toLowerCase())
        ) || 'interface';
        return `Breaking change: ${feature} - interface ${interfaceName} changes that affect existing implementations`;
      }
      case 'signature': {
        // Find function name from keywords
        const functionName = requirement.keywords.find(k =>
          !['function', 'signature', 'parameter', 'accept', 'options'].includes(k.toLowerCase())
        ) || 'function';
        return `Breaking change: ${feature} - signature changes to ${functionName} incompatible with existing usage`;
      }
      case 'removal': {
        // Find what's being removed
        const removed = requirement.keywords.find(k =>
          ['endpoint', 'api', 'legacy'].includes(k.toLowerCase())
        ) || 'endpoint';
        return `Breaking change: ${feature} - removes ${removed} currently in use`;
      }
      case 'rename': {
        const oldName = requirement.keywords[0] || 'component';
        return `Breaking change: ${feature} - renames ${oldName} requiring code updates`;
      }
      case 'behavior': {
        // Find what validation/behavior is changing
        const behavior = requirement.keywords.find(k =>
          ['validation', 'email', 'behavior'].includes(k.toLowerCase())
        ) || requirement.keywords[0] || 'validation';
        return `Breaking change: ${feature} - changes ${behavior} affecting existing functionality`;
      }
      default:
        return `Breaking change: ${feature} introduces incompatible changes`;
    }
  }

  /**
   * Analyze breaking change details
   *
   * @param requirement - Requirement introducing breaking change
   * @param codebase - Existing codebase
   * @returns Breaking change details
   */
  analyzeBreakingChange(requirement: Requirement, _codebase: string): BreakingChange {
    // Detect type of breaking change
    const changeType = this.detectChangeType(requirement, _codebase);

    // Generate migration strategy
    const migrationStrategy = this.generateMigrationStrategy(changeType, requirement);

    // Determine version impact
    const versionImpact = this.determineVersionImpact(changeType);

    return {
      requirement: requirement.id,
      changeType,
      affected: requirement.feature,
      description: requirement.description,
      migrationStrategy,
      versionImpact,
    };
  }

  /**
   * Detect type of breaking change
   *
   * @param requirement - Requirement to analyze
   * @param codebase - Existing codebase
   * @returns Type of breaking change
   */
  private detectChangeType(
    requirement: Requirement,
    codebase: string
  ): 'interface' | 'signature' | 'removal' | 'rename' | 'behavior' {
    const desc = requirement.description.toLowerCase();
    const feature = requirement.feature.toLowerCase();

    // Check for interface/type changes
    if ((desc.includes('interface') || feature.includes('interface')) &&
        (codebase.toLowerCase().includes('interface') || this.patternMatcher.search(requirement.keywords.join(' '), ['interface', 'type']))) {
      return 'interface';
    }

    // Check for removals (highest priority after interface)
    if (
      this.patternMatcher.search(requirement.description, [
        'remove',
        'delete',
        'deprecate',
        'drop',
      ]) || desc.includes('remove') || desc.includes('delete')
    ) {
      return 'removal';
    }

    // Check for renames
    if (this.patternMatcher.search(requirement.description, ['rename', 'move', 'relocate']) || desc.includes('rename')) {
      return 'rename';
    }

    // Check for signature changes
    if (
      this.patternMatcher.search(requirement.description, [
        'parameter',
        'argument',
        'return',
        'signature',
        'accept',
      ]) || desc.includes('signature') || desc.includes('accept')
    ) {
      return 'signature';
    }

    // Default to behavior change
    return 'behavior';
  }

  /**
   * Check if requirement is an additive change (non-breaking)
   *
   * @param requirement - Requirement to check
   * @returns True if additive (non-breaking)
   */
  private isAdditiveChange(requirement: Requirement): boolean {
    const description = requirement.description.toLowerCase();
    const feature = requirement.feature.toLowerCase();

    // Check for additive keywords
    const additiveKeywords = ['add', 'optional', 'may include', 'new field', 'extend'];
    const hasAdditiveKeyword = additiveKeywords.some(keyword =>
      description.includes(keyword) || feature.includes(keyword)
    );

    // Check for breaking keywords that override additive
    const breakingKeywords = ['remove', 'delete', 'deprecate', 'rename', 'change', 'modify', 'update'];
    const hasBreakingKeyword = breakingKeywords.some(keyword =>
      description.includes(keyword) || feature.includes(keyword)
    );

    // Check for optional pattern (EARS WHERE pattern)
    const isOptionalPattern = requirement.pattern === 'optional';

    // If optional pattern and additive keyword, it's non-breaking
    if (hasAdditiveKeyword && isOptionalPattern) {
      return true;
    }

    // If purely additive (add/new) without breaking keywords, it's non-breaking
    if (hasAdditiveKeyword && !hasBreakingKeyword) {
      return true;
    }

    return false;
  }

  /**
   * Generate migration strategy for breaking change
   *
   * @param changeType - Type of breaking change
   * @param _requirement - Requirement details (future use for custom strategies)
   * @returns Migration strategy description
   */
  private generateMigrationStrategy(
    changeType: 'interface' | 'signature' | 'removal' | 'rename' | 'behavior',
    _requirement: Requirement
  ): string {
    switch (changeType) {
      case 'interface':
        return `MIGRATION: Update all implementations. Add adapter layer for backward compatibility during transition. Version as major release. Deprecation period: 2 releases.`;

      case 'signature':
        return `MIGRATION: Use adapter pattern or method overloading wrapper to support both signatures. Deprecate old signature in v2.x, remove in v3.0.`;

      case 'removal':
        return `MIGRATION: Mark as @deprecated in v2.x. Sunset timeline: 6 months. Version as major release (v3.0). Document migration path in changelog.`;

      case 'rename':
        return `MIGRATION: Create alias pointing to new name. Deprecate old name with warning. Provide automated migration codemod script.`;

      case 'behavior':
        return `MIGRATION: Plan gradual rollout with feature flag. Document effort estimation in ADR. Provide backward-compatible mode during transition.`;

      default:
        return `MIGRATION: Plan manual review with team. Estimate effort and create migration guide. Version as major release.`;
    }
  }

  /**
   * Determine version impact (major, minor, patch)
   *
   * @param changeType - Type of breaking change
   * @returns Version impact level
   */
  private determineVersionImpact(
    changeType: 'interface' | 'signature' | 'removal' | 'rename' | 'behavior'
  ): 'major' | 'minor' | 'patch' {
    // All breaking changes require major version bump
    if (['interface', 'signature', 'removal', 'rename'].includes(changeType)) {
      return 'major';
    }

    // Behavior changes might be minor if backward compatible
    if (changeType === 'behavior') {
      return 'minor';
    }

    return 'major';
  }

  /**
   * Detect if change affects public API
   *
   * @param requirement - Requirement to check
   * @param codebase - Existing codebase
   * @returns True if public API affected
   */
  detectPublicAPIChange(requirement: Requirement, _codebase: string): boolean {
    const publicKeywords = ['export', 'public', 'api', 'interface', 'endpoint'];

    return this.patternMatcher.search(requirement.description, publicKeywords);
  }

  /**
   * Suggest version bump
   *
   * @param breakingChanges - All detected breaking changes
   * @returns Suggested version bump (major, minor, patch)
   */
  suggestVersionBump(breakingChanges: BreakingChange[]): 'major' | 'minor' | 'patch' {
    // If any breaking change requires major, suggest major
    if (breakingChanges.some((change) => change.versionImpact === 'major')) {
      return 'major';
    }

    // If any breaking change requires minor, suggest minor
    if (breakingChanges.some((change) => change.versionImpact === 'minor')) {
      return 'minor';
    }

    // Otherwise patch
    return 'patch';
  }

  /**
   * Generate migration plan for all breaking changes
   *
   * @param breakingChanges - All detected breaking changes
   * @returns Formatted migration plan
   */
  generateMigrationPlan(breakingChanges: BreakingChange[]): string {
    let plan = '# Migration Plan\n\n';

    // Group by change type
    const byType = new Map<string, BreakingChange[]>();
    for (const change of breakingChanges) {
      const existing = byType.get(change.changeType) || [];
      existing.push(change);
      byType.set(change.changeType, existing);
    }

    // Generate plan for each type
    byType.forEach((changes, type) => {
      plan += `## ${type.charAt(0).toUpperCase() + type.slice(1)} Changes (${changes.length})\n\n`;

      for (const change of changes) {
        plan += `### ${change.requirement}: ${change.affected}\n\n`;
        plan += `**Description**: ${change.description}\n\n`;
        plan += `**Migration Strategy**:\n${change.migrationStrategy}\n\n`;
        plan += `**Version Impact**: ${change.versionImpact.toUpperCase()}\n\n`;
        plan += `---\n\n`;
      }
    });

    return plan;
  }
}
