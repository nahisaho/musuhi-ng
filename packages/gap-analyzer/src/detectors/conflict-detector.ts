/**
 * Conflict Detector
 *
 * AC-5.4: Conflict Detection
 * Identifies requirements that conflict with existing patterns or code.
 *
 * @packageDocumentation
 */

import type { Requirement, CodebaseMetadata, Gap } from '../types/index.js';

/**
 * Conflict Detector
 *
 * AC-5.4: IF requirement conflicts with existing patterns,
 * THEN Gap Analysis SHALL flag conflict and suggest reconciliation
 *
 * Detects conflicts between requirements and existing codebase patterns.
 */
export class ConflictDetector {
  /**
   * AC-5.4: Detect conflicts
   *
   * Analyzes requirements against codebase metadata to find conflicts.
   * Examples:
   * - Requirement specifies specs/ but code uses requirements/
   * - Requirement specifies Redux but code uses Zustand
   * - Requirement specifies REST but code uses GraphQL
   *
   * @param requirements - All requirements to check
   * @param codebaseMetadata - Metadata about existing codebase
   * @returns Array of gap objects for conflicts
   */
  detect(requirements: Requirement[], codebaseMetadata: CodebaseMetadata): Gap[] {
    const gaps: Gap[] = [];

    for (const req of requirements) {
      // Check directory pattern conflicts
      const directoryConflicts = this.detectDirectoryConflicts(req, codebaseMetadata);
      gaps.push(...directoryConflicts);

      // Check technology stack conflicts
      const technologyConflicts = this.detectTechnologyConflicts(req, codebaseMetadata);
      gaps.push(...technologyConflicts);

      // Check architectural pattern conflicts
      const architecturalConflicts = this.detectArchitecturalConflicts(req, codebaseMetadata);
      gaps.push(...architecturalConflicts);
    }

    return gaps;
  }

  /**
   * Detect directory pattern conflicts
   *
   * Example: Requirement specifies specs/ but codebase uses requirements/
   *
   * @param requirement - Requirement to check
   * @param metadata - Codebase metadata
   * @returns Array of gap objects for directory conflicts
   */
  private detectDirectoryConflicts(
    requirement: Requirement,
    metadata: CodebaseMetadata
  ): Gap[] {
    const gaps: Gap[] = [];

    // Check if requirement has expectedFiles
    if (!requirement.expectedFiles || requirement.expectedFiles.length === 0) {
      return gaps;
    }

    // Check each expected file path
    for (const expectedFile of requirement.expectedFiles) {
      // Extract directory from expected file (e.g., "specs/requirements.md" -> "specs")
      const expectedDir = expectedFile.split('/')[0]!;  // Safe - split always returns at least one element

      // Check if codebase uses a different directory for the same purpose
      for (const dirPattern of metadata.directoryPatterns) {
        const codebaseDir = dirPattern.pattern;

        // If directories are different but serve similar purpose, flag as conflict
        if (this.areConflictingDirectories(expectedDir, codebaseDir, dirPattern.name)) {
          gaps.push({
            type: 'conflict',
            requirement: requirement.id,
            description: `${requirement.id} requires ${expectedDir}/ directory, but codebase uses ${codebaseDir}/ (CONFLICT)`,
            recommendation: `Align requirement with codebase structure (${codebaseDir}/) OR migrate codebase to ${expectedDir}/`,
            severity: requirement.priority === 'P0' ? 'high' : 'medium',
            context: `Requirement: ${requirement.description}`,
          });
        }
      }
    }

    return gaps;
  }

  /**
   * Check if two directories conflict (different names, same purpose)
   *
   * @param expectedDir - Directory expected by requirement
   * @param codebaseDir - Directory used in codebase
   * @param name - Purpose of the codebase directory
   * @returns True if directories conflict
   */
  private areConflictingDirectories(expectedDir: string, codebaseDir: string, name: string): boolean {
    // Same directory name - no conflict
    if (expectedDir === codebaseDir) {
      return false;
    }

    // Check if directories serve similar purposes
    const nameKeywords = name.toLowerCase();
    const expectedKeywords = expectedDir.toLowerCase();

    // Examples:
    // expectedDir="specs", codebaseDir="requirements", name="Requirements documentation" -> CONFLICT
    // expectedDir="specs", codebaseDir="src", name="Source code" -> NOT CONFLICT
    return (
      (expectedKeywords.includes('spec') && nameKeywords.includes('requirement')) ||
      (expectedKeywords.includes('requirement') && nameKeywords.includes('requirement') && codebaseDir !== expectedDir) ||
      (expectedKeywords.includes('change') && nameKeywords.includes('change')) ||
      (expectedKeywords.includes('doc') && nameKeywords.includes('document'))
    );
  }

  /**
   * Detect technology stack conflicts
   *
   * Example: Requirement specifies Redux but codebase uses Zustand
   *
   * @param requirement - Requirement to check
   * @param metadata - Codebase metadata
   * @returns Array of gap objects for technology conflicts
   */
  private detectTechnologyConflicts(
    requirement: Requirement,
    metadata: CodebaseMetadata
  ): Gap[] {
    const gaps: Gap[] = [];

    // Map of conflicting technologies
    const conflictingTechs = new Map<string, string[]>([
      ['redux', ['zustand', 'jotai', 'recoil']],
      ['zustand', ['redux', 'jotai', 'recoil']],
      ['rest', ['graphql', 'grpc']],
      ['graphql', ['rest']],
      ['jest', ['vitest', 'mocha']],
      ['vitest', ['jest', 'mocha']],
      ['webpack', ['vite', 'rollup', 'parcel']],
      ['vite', ['webpack', 'rollup']],
    ]);

    for (const keyword of requirement.keywords) {
      const lowerKeyword = keyword.toLowerCase();

      // Check if keyword is a known technology
      const conflicts = conflictingTechs.get(lowerKeyword);
      if (!conflicts) continue;

      // Check if codebase uses conflicting technology
      for (const conflict of conflicts) {
        if (this.codebaseUsesTechnology(conflict, metadata)) {
          gaps.push({
            type: 'conflict',
            requirement: requirement.id,
            description: `${requirement.id} requires ${keyword}, but codebase uses ${conflict} (CONFLICT)`,
            recommendation: `Migrate from ${conflict} to ${keyword} OR update requirement to use ${conflict}`,
            severity: 'high',
            context: `Requirement: ${requirement.description}`,
          });
        }
      }
    }

    return gaps;
  }

  /**
   * Detect architectural pattern conflicts
   *
   * Example: Requirement specifies microservices but code is monolithic
   *
   * @param requirement - Requirement to check
   * @param metadata - Codebase metadata
   * @returns Array of gap objects for architectural conflicts
   */
  private detectArchitecturalConflicts(
    requirement: Requirement,
    metadata: CodebaseMetadata
  ): Gap[] {
    const gaps: Gap[] = [];

    // Map of conflicting architectural patterns
    const conflictingPatterns = new Map<string, string[]>([
      ['monolith', ['microservices', 'serverless']],
      ['microservices', ['monolith']],
      ['mvc', ['mvvm', 'mvp']],
      ['layered', ['hexagonal', 'clean-architecture', 'feature-based', 'feature']],
      ['feature-based', ['layered', 'hexagonal', 'clean-architecture']],
      ['feature', ['layered', 'hexagonal', 'clean-architecture']],
    ]);

    // Check if requirement mentions architecture but no specific pattern
    const hasArchitectureKeyword = requirement.keywords.some(k => k.toLowerCase().includes('architecture'));
    const hasSpecificPattern = requirement.keywords.some(k => conflictingPatterns.has(k.toLowerCase()));

    // If requirement has "architecture" keyword but not a specific pattern,
    // and codebase has architectural patterns, it could be a conflict
    if (hasArchitectureKeyword && !hasSpecificPattern && metadata.architecturalPatterns.length > 0) {
      // Generic architecture requirement vs existing pattern
      const existingPattern = metadata.architecturalPatterns[0]!;  // Safe - length check ensures element exists
      gaps.push({
        type: 'conflict',
        requirement: requirement.id,
        description: `${requirement.id} requires specific architecture, but codebase uses ${existingPattern} (CONFLICT)`,
        recommendation: `Update requirement to specify ${existingPattern} OR refactor to different architecture`,
        severity: requirement.priority === 'P0' ? 'high' : 'medium',
        context: `Requirement: ${requirement.description}`,
      });
      return gaps;
    }

    for (const keyword of requirement.keywords) {
      const lowerKeyword = keyword.toLowerCase();

      // Check if keyword is an architectural pattern
      const conflicts = conflictingPatterns.get(lowerKeyword);
      if (!conflicts) continue;

      // Check if codebase uses conflicting pattern
      for (const conflict of conflicts) {
        const hasConflict = metadata.architecturalPatterns.some(
          (pattern) => pattern.toLowerCase().includes(conflict) || conflict.includes(pattern.toLowerCase())
        );

        if (hasConflict) {
          const conflictPattern = metadata.architecturalPatterns.find((p) => p.toLowerCase().includes(conflict));

          gaps.push({
            type: 'conflict',
            requirement: requirement.id,
            description: `${requirement.id} requires ${keyword} architecture, but codebase uses ${conflictPattern || conflict} (CONFLICT)`,
            recommendation: `Refactor to ${keyword} architecture OR update requirement to accept ${conflictPattern || conflict}`,
            severity: requirement.priority === 'P0' ? 'high' : 'medium',
            context: `Requirement: ${requirement.description}`,
          });
        }
      }
    }

    return gaps;
  }


  /**
   * Check if codebase uses specific technology
   *
   * @param technology - Technology name to check
   * @param metadata - Codebase metadata
   * @returns True if technology is used
   */
  private codebaseUsesTechnology(technology: string, metadata: CodebaseMetadata): boolean {
    // Check in dependencies
    const hasInDeps = metadata.dependencies.some((dep) =>
      dep.name.toLowerCase().includes(technology)
    );

    // Check in build tool
    const hasInBuildTool = metadata.buildTool?.toLowerCase().includes(technology);

    // Check in test framework
    const hasInTestFramework = metadata.testFramework?.toLowerCase().includes(technology);

    return hasInDeps || hasInBuildTool || hasInTestFramework || false;
  }

  /**
   * Suggest reconciliation strategy
   *
   * @param conflict - Conflict gap object
   * @returns Recommended reconciliation approach
   */
  suggestReconciliation(conflict: Gap): 'update-code' | 'update-requirement' | 'discuss' {
    // High severity conflicts likely need code changes
    if (conflict.severity === 'critical' || conflict.severity === 'high') {
      return 'discuss'; // Needs team discussion
    }

    // Medium severity conflicts can update requirement
    if (conflict.severity === 'medium') {
      return 'update-requirement';
    }

    // Low severity conflicts can update code
    return 'update-code';
  }
}
