/**
 * Pattern Violation Detector
 *
 * AC-5.7: Pattern Violation Detection
 * Identifies requirements that violate architectural patterns from steering/structure.md.
 *
 * @packageDocumentation
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Requirement, Gap } from '../types/index.js';

/**
 * Pattern Violation Detector
 *
 * AC-5.7: IF requirements violate architectural patterns (from steering/structure.md),
 * THEN Gap Analysis SHALL flag violations
 *
 * Checks requirements against documented patterns in steering files.
 */
export class PatternViolationDetector {
  /**
   * AC-5.7: Detect pattern violations
   *
   * Analyzes requirements against patterns documented in steering/structure.md.
   * Flags requirements that contradict established architectural patterns.
   *
   * @param requirements - All requirements to check
   * @param steeringPath - Path to steering directory
   * @returns Array of gap objects for pattern violations
   */
  async detect(requirements: Requirement[], steeringPath: string): Promise<Gap[]> {
    const gaps: Gap[] = [];

    try {
      // AC-3.4: Validate steering path to prevent path traversal
      const resolvedSteeringPath = path.resolve(steeringPath);
      const structureFilePath = path.join(resolvedSteeringPath, 'structure.md');

      // AC-3.4: Ensure structure.md path is within steering directory
      if (!structureFilePath.startsWith(resolvedSteeringPath)) {
        throw new Error('Security: Path traversal detected in structure.md path');
      }

      // Read steering/structure.md
      const structureMd = await readFile(structureFilePath, 'utf-8');

      // Extract documented patterns
      const patterns = this.extractPatterns(structureMd);

      // Check each requirement
      for (const req of requirements) {
        // Check if requirement violates any pattern
        const violation = this.checkViolation(req, patterns, structureMd);

        if (violation) {
          // Create more specific recommendation based on violation type
          let recommendation = 'Align requirement with steering patterns OR update steering/structure.md';

          if (violation.includes('PascalCase') || violation.includes('kebab-case')) {
            const targetCase = violation.includes('PascalCase') ? 'PascalCase' : 'kebab-case';
            recommendation = `Update file naming to follow ${targetCase} convention as specified in steering/structure.md`;
          } else if (violation.includes('directory')) {
            recommendation = 'Align directory structure with steering/structure.md OR update steering to match implementation';
          } else if (violation.includes('but steering specifies')) {
            // Extract the pattern that steering specifies
            const match = violation.match(/but steering specifies ([a-z]+)/i);
            if (match) {
              recommendation = `Follow ${match[1]} pattern as documented in steering/structure.md OR update steering if ${req.keywords[0]} is preferred`;
            }
          }

          gaps.push({
            type: 'pattern-violation',
            requirement: req.id,
            description: `${req.id} violates architectural pattern: ${violation}`,
            recommendation,
            severity: 'high',
            context: `Requirement: ${req.description}`,
          });
        }
      }
    } catch (error) {
      // If steering file doesn't exist, skip pattern validation
      console.warn(`Pattern validation skipped: ${error instanceof Error ? error.message : String(error)}`);
    }

    return gaps;
  }

  /**
   * Extract architectural patterns from structure.md
   *
   * @param structureMd - Contents of steering/structure.md
   * @returns Map of pattern names to pattern descriptions
   */
  private extractPatterns(structureMd: string): Map<string, string> {
    const patterns = new Map<string, string>();

    // Extract sections under "Architectural Patterns"
    const patternSectionMatch = structureMd.match(
      /## Architectural Patterns(.*?)(?=\n## |$)/s
    );

    if (!patternSectionMatch) {
      return patterns;
    }

    const patternSection = patternSectionMatch[1]!;  // Safe - regex validated

    // Extract individual patterns (### headings)
    const patternMatches = patternSection.matchAll(/### (.+?)\n(.*?)(?=\n### |$)/gs);

    for (const match of patternMatches) {
      const patternName = match[1]!.trim();  // Safe - regex capture group exists
      const patternContent = match[2]!.trim();  // Safe - regex capture group exists
      patterns.set(patternName, patternContent);
    }

    return patterns;
  }

  /**
   * Check if requirement violates any pattern
   *
   * @param requirement - Requirement to check
   * @param patterns - Extracted patterns
   * @param structureMd - Full structure.md content
   * @returns Violation description, or undefined if no violation
   */
  private checkViolation(
    requirement: Requirement,
    patterns: Map<string, string>,
    structureMd: string
  ): string | undefined {
    // Check for directory structure violations
    const dirViolation = this.checkDirectoryViolation(requirement, structureMd);
    if (dirViolation) {
      return dirViolation;
    }

    // Check for technology stack violations
    const techViolation = this.checkTechnologyViolation(requirement, structureMd);
    if (techViolation) {
      return techViolation;
    }

    // Check for pattern-specific violations using extracted patterns
    for (const [patternName, patternContent] of patterns) {
      const violation = this.checkPatternSpecificViolation(
        requirement,
        patternName,
        patternContent
      );
      if (violation) {
        return `${patternName}: ${violation}`;
      }
    }

    // Also check against the full structure.md content if no patterns were extracted
    // This handles cases where patterns are documented inline without formal sections
    if (patterns.size === 0) {
      const inlineViolation = this.checkPatternSpecificViolation(
        requirement,
        'Architecture',
        structureMd
      );
      if (inlineViolation) {
        return inlineViolation;
      }
    }

    return undefined;
  }

  /**
   * Check for directory structure violations
   *
   * Example: Requirement uses Redux but steering specifies Zustand
   *
   * @param requirement - Requirement to check
   * @param structureMd - Structure.md content
   * @returns Violation description, or undefined
   */
  private checkDirectoryViolation(
    requirement: Requirement,
    structureMd: string
  ): string | undefined {
    // Check if requirement mentions directory that contradicts structure.md
    const requiredDirs = ['specs/', 'changes/', 'archive/', 'requirements/'];

    for (const dir of requiredDirs) {
      // Check if requirement mentions this directory
      const dirInDescription = requirement.description.toLowerCase().includes(dir);
      const dirInKeywords = requirement.keywords.some((kw) => kw.toLowerCase().includes(dir));

      if (dirInDescription || dirInKeywords) {
        // Check if structure.md documents different directory
        if (dir === 'requirements/' && structureMd.includes('specs/')) {
          return `Uses 'requirements/' directory but steering/structure.md specifies 'specs/' directory`;
        }
        if (dir === 'specs/' && structureMd.includes('requirements/') && !structureMd.includes('specs/')) {
          return `Uses 'specs/' directory but steering/structure.md specifies 'requirements/' directory`;
        }
      }
    }

    // Check for directory organization violations
    if (requirement.expectedFiles) {
      for (const file of requirement.expectedFiles) {
        // Check for feature-based organization violations
        if (structureMd.includes('features/') && structureMd.includes('Feature-based organization')) {
          if (file.includes('/components/') && !file.includes('/features/')) {
            return `Uses components/ directory but steering specifies features/ (Feature-based organization)`;
          }
        }
      }
    }

    // Check for feature-based structure violations based on description
    if (structureMd.toLowerCase().includes('feature-based')) {
      const descLower = requirement.description.toLowerCase();
      if (
        descLower.includes('outside features') ||
        descLower.includes('outside feature') ||
        (descLower.includes('outside') && requirement.keywords.some((kw) => kw.toLowerCase() === 'code'))
      ) {
        return `Violates feature-based structure (code should be within features/ directory)`;
      }
    }

    // Check for naming convention violations
    if (requirement.expectedFiles) {
      for (const file of requirement.expectedFiles) {
        const fileName = path.basename(file);

        // Check for snake_case violation of PascalCase
        if (fileName.includes('_') && structureMd.includes('PascalCase')) {
          return `File naming violates PascalCase convention (uses snake_case: ${fileName})`;
        }

        // Check for kebab-case vs PascalCase violations
        if (fileName.includes('-') && structureMd.includes('PascalCase')) {
          return `File naming violates PascalCase convention (uses kebab-case: ${fileName})`;
        }

        // Check for PascalCase violation of kebab-case
        if (/[A-Z]/.test(fileName) && structureMd.includes('kebab-case')) {
          return `File naming violates kebab-case convention (uses PascalCase: ${fileName})`;
        }
      }
    }

    return undefined;
  }

  /**
   * Check for technology stack violations
   *
   * @param requirement - Requirement to check
   * @param structureMd - Structure.md content
   * @returns Violation description, or undefined
   */
  private checkTechnologyViolation(
    requirement: Requirement,
    structureMd: string
  ): string | undefined {
    // Map of technology alternatives
    const techAlternatives = new Map<string, string[]>([
      ['redux', ['zustand', 'jotai', 'recoil', 'mobx']],
      ['jest', ['vitest', 'mocha', 'jasmine']],
      ['webpack', ['vite', 'rollup', 'parcel', 'esbuild']],
      ['rest', ['graphql', 'grpc', 'trpc']],
    ]);

    for (const keyword of requirement.keywords) {
      const lowerKeyword = keyword.toLowerCase();

      // Check if keyword is a known technology
      const alternatives = techAlternatives.get(lowerKeyword);
      if (!alternatives) continue;

      // Check if steering documents different technology
      for (const alt of alternatives) {
        if (this.isDocumented(alt, structureMd)) {
          return `Requires ${alt} but uses ${keyword} (violates approved stack)`;
        }
      }
    }

    return undefined;
  }

  /**
   * Check for pattern-specific violations
   *
   * @param requirement - Requirement to check
   * @param patternName - Pattern name
   * @param patternContent - Pattern description
   * @returns Violation description, or undefined
   */
  private checkPatternSpecificViolation(
    requirement: Requirement,
    patternName: string,
    patternContent: string
  ): string | undefined {
    // Check if requirement contradicts pattern content
    // This is a heuristic check based on keyword matching

    // Check for Layered Architecture violations
    if (patternContent.includes('Business logic must be in services')) {
      const hasBusinessLogic =
        requirement.keywords.some((kw) =>
          ['logic', 'authentication', 'validation', 'business'].includes(kw.toLowerCase())
        ) ||
        requirement.description.toLowerCase().includes('logic') ||
        requirement.description.toLowerCase().includes('authentication');

      const inComponent =
        requirement.keywords.some((kw) => kw.toLowerCase() === 'component') ||
        requirement.description.toLowerCase().includes('component');

      if (hasBusinessLogic && inComponent) {
        return 'Business logic in component violates Layered Architecture (should be in services/)';
      }
    }

    // Example: If pattern says "Library-First" and requirement says "custom implementation"
    if (patternName.includes('Library-First')) {
      if (
        requirement.description.toLowerCase().includes('custom') &&
        !requirement.description.toLowerCase().includes('library')
      ) {
        return 'Violates Library-First principle (prefer existing libraries)';
      }
    }

    // Example: If pattern says "Test-First" and requirement doesn't mention tests
    if (patternName.includes('Test-First')) {
      if (!requirement.description.toLowerCase().includes('test')) {
        return 'Violates Test-First principle (missing test requirement)';
      }
    }

    return undefined;
  }

  /**
   * Check if technology/pattern is documented in structure.md
   *
   * @param technology - Technology name
   * @param structureMd - Structure.md content
   * @returns True if documented
   */
  private isDocumented(technology: string, structureMd: string): boolean {
    return structureMd.toLowerCase().includes(technology.toLowerCase());
  }

  /**
   * Suggest pattern alignment
   *
   * @param violation - Pattern violation gap
   * @returns Suggested alignment approach
   */
  suggestAlignment(violation: Gap): 'update-requirement' | 'update-steering' | 'discuss' {
    // High severity violations need discussion
    if (violation.severity === 'critical' || violation.severity === 'high') {
      return 'discuss';
    }

    // If violation is about documented patterns, update requirement
    if (violation.description.includes('steering specifies')) {
      return 'update-requirement';
    }

    // If violation is about undocumented patterns, update steering
    return 'update-steering';
  }

  /**
   * Generate pattern compliance report
   *
   * @param requirements - All requirements
   * @param violations - All pattern violations
   * @returns Compliance report
   */
  generateComplianceReport(requirements: Requirement[], violations: Gap[]): string {
    const totalRequirements = requirements.length;
    const violationCount = violations.length;
    const complianceRate = ((totalRequirements - violationCount) / totalRequirements) * 100;

    let report = '# Pattern Compliance Report\n\n';
    report += `**Total Requirements**: ${totalRequirements}\n`;
    report += `**Pattern Violations**: ${violationCount}\n`;
    report += `**Compliance Rate**: ${complianceRate.toFixed(1)}%\n\n`;

    if (violations.length > 0) {
      report += `## Violations\n\n`;

      for (const violation of violations) {
        report += `### ${violation.requirement}\n\n`;
        report += `**Issue**: ${violation.description}\n\n`;
        report += `**Recommendation**: ${violation.recommendation}\n\n`;
        report += `**Severity**: ${violation.severity}\n\n`;
        report += `---\n\n`;
      }
    } else {
      report += `✅ All requirements comply with documented patterns.\n`;
    }

    return report;
  }
}
