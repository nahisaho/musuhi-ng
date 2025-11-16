/**
 * Undocumented Feature Detector
 *
 * AC-5.3: Undocumented Features Detection
 * Identifies implementations with no requirements (code without specs).
 *
 * @packageDocumentation
 */

import type { Requirement, Gap } from '../types/index.js';
import type { ASTParser } from '../parsers/ast-parser.js';

/**
 * Undocumented Feature Detector
 *
 * AC-5.3: Identifies implementations with no requirements (undocumented features)
 *
 * Uses AST Parser to find code that lacks corresponding requirements.
 * Helps ensure complete requirement coverage.
 */
export class UndocumentedFeatureDetector {
  /**
   * Creates a new undocumented feature detector
   *
   * @param astParser - AST parser instance for codebase analysis
   */
  constructor(private astParser: ASTParser) {}

  /**
   * AC-5.3: Detect undocumented features
   *
   * Analyzes codebase and identifies files/exports that have no
   * corresponding requirements. Returns gap objects for each undocumented feature.
   *
   * @param requirements - All requirements to check against
   * @returns Array of gap objects for undocumented features
   */
  detect(requirements: Requirement[]): Gap[] {
    const gaps: Gap[] = [];

    // Find files with undocumented features
    const undocumentedFiles = this.astParser.findUndocumentedFeaturesWithSymbols(requirements);

    for (const { file, symbols } of undocumentedFiles) {
      // Skip if should be excluded
      if (this.shouldExclude(file)) {
        continue;
      }

      // Include symbol names in description
      const symbolNames = symbols.map(s => s.name).join(', ');
      const description = symbols.length > 0
        ? `${file} exports ${symbolNames} (NO REQUIREMENT)`
        : `${file} (NO REQUIREMENT)`;

      gaps.push({
        type: 'undocumented-feature',
        file,
        description,
        recommendation: `Add AC-X.Y requirement for ${symbolNames || 'this feature'} or remove if unused`,
        severity: 'medium',
        context: 'This code has no corresponding requirement specification',
      });
    }

    return gaps;
  }

  /**
   * Detect undocumented features in specific directory
   *
   * @param requirements - All requirements
   * @param directoryPattern - Directory pattern to filter (e.g., "src/features")
   * @returns Array of gap objects for undocumented features in directory
   */
  detectInDirectory(requirements: Requirement[], directoryPattern: string): Gap[] {
    const allGaps = this.detect(requirements);

    return allGaps.filter((gap) => gap.file && gap.file.includes(directoryPattern));
  }

  /**
   * Detect undocumented features by file extension
   *
   * @param requirements - All requirements
   * @param extension - File extension to filter (e.g., ".ts", ".tsx")
   * @returns Array of gap objects for undocumented features with this extension
   */
  detectByExtension(requirements: Requirement[], extension: string): Gap[] {
    const allGaps = this.detect(requirements);

    return allGaps.filter((gap) => gap.file && gap.file.endsWith(extension));
  }

  /**
   * Get undocumented features summary
   *
   * @param gaps - All gap objects
   * @returns Summary of undocumented features by file type
   */
  getSummary(gaps: Gap[]): { byExtension: Map<string, number>; total: number } {
    const byExtension = new Map<string, number>();

    for (const gap of gaps) {
      if (gap.file) {
        const ext = this.getFileExtension(gap.file);
        byExtension.set(ext, (byExtension.get(ext) || 0) + 1);
      }
    }

    return {
      byExtension,
      total: gaps.length,
    };
  }

  /**
   * Check if undocumented file should be excluded
   *
   * Some files are expected to have no requirements (test files, config, etc.)
   *
   * @param filePath - File path to check
   * @returns True if file should be excluded from undocumented detection
   */
  shouldExclude(filePath: string): boolean {
    const excludePatterns = [
      // Test files
      /\.test\.(ts|tsx|js|jsx)$/,
      /\.spec\.(ts|tsx|js|jsx)$/,
      /__tests__\//,

      // Config files
      /\.config\.(ts|js)$/,
      /tsconfig\.json$/,
      /package\.json$/,
      /vite\.config/,
      /vitest\.config/,

      // Build artifacts
      /\/dist\//,
      /\/build\//,
      /\/node_modules\//,

      // Type definitions only
      /types?\.ts$/,
      /\.d\.ts$/,

      // Index files (often just re-exports)
      /\/index\.(ts|js)$/,
    ];

    return excludePatterns.some((pattern) => pattern.test(filePath));
  }

  /**
   * Filter out excluded files from gaps
   *
   * @param gaps - All gap objects
   * @returns Filtered gap objects (excluding test/config files)
   */
  filterExcluded(gaps: Gap[]): Gap[] {
    return gaps.filter((gap) => !gap.file || !this.shouldExclude(gap.file));
  }

  /**
   * Group undocumented features by directory
   *
   * @param gaps - All gap objects
   * @returns Map of directory to gap objects
   */
  groupByDirectory(gaps: Gap[]): Map<string, Gap[]> {
    const grouped = new Map<string, Gap[]>();

    for (const gap of gaps) {
      if (gap.file) {
        const dir = this.getDirectory(gap.file);
        const existing = grouped.get(dir) || [];
        existing.push(gap);
        grouped.set(dir, existing);
      }
    }

    return grouped;
  }

  /**
   * Suggest requirement ID for undocumented feature
   *
   * @param filePath - File path of undocumented feature
   * @param existingRequirements - Existing requirements for ID generation
   * @returns Suggested requirement ID (AC-X.Y)
   */
  suggestRequirementId(filePath: string, existingRequirements: Requirement[]): string {
    // Infer feature number from directory structure
    const featureNumber = this.inferFeatureNumber(filePath);

    // Find next available AC number for this feature
    const featureRequirements = existingRequirements.filter(
      (req) => req.id.startsWith(`AC-${featureNumber}.`)
    );

    const nextNumber = featureRequirements.length + 1;

    return `AC-${featureNumber}.${nextNumber}`;
  }

  /**
   * Extract file extension
   *
   * @param filePath - File path
   * @returns File extension (e.g., ".ts")
   */
  private getFileExtension(filePath: string): string {
    const match = filePath.match(/\.([^.]+)$/);
    return match ? `.${match[1]}` : '';
  }

  /**
   * Extract directory from file path
   *
   * @param filePath - File path
   * @returns Directory path
   */
  private getDirectory(filePath: string): string {
    const lastSlash = filePath.lastIndexOf('/');
    return lastSlash >= 0 ? filePath.substring(0, lastSlash) : '';
  }

  /**
   * Infer feature number from file path
   *
   * @param filePath - File path
   * @returns Feature number (1-8) or 9 for unknown
   */
  private inferFeatureNumber(filePath: string): number {
    // Map directory patterns to feature numbers
    const featurePatterns = [
      { pattern: /constitutional/i, number: 1 },
      { pattern: /change-workflow|workflow/i, number: 2 },
      { pattern: /orchestrat/i, number: 3 },
      { pattern: /parallel/i, number: 4 },
      { pattern: /gap-analy/i, number: 5 },
      { pattern: /dashboard/i, number: 6 },
      { pattern: /verification/i, number: 7 },
      { pattern: /platform|adapter/i, number: 8 },
    ];

    for (const { pattern, number } of featurePatterns) {
      if (pattern.test(filePath)) {
        return number;
      }
    }

    // Default to feature 9 (future features)
    return 9;
  }
}
