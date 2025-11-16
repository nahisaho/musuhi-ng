/**
 * Gap Analyzer
 *
 * AC-5.1: Gap Analysis Command
 * Main orchestrator for brownfield gap analysis.
 *
 * @packageDocumentation
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  GapReport,
  GapSummary,
  Gap,
  Requirement,
  GapAnalysisConfig,
  CodebaseMetadata,
} from './types/index.js';
import { ASTParser } from './parsers/ast-parser.js';
import { PatternMatcher } from './parsers/pattern-matcher.js';
import { MissingFeatureDetector } from './detectors/missing-feature-detector.js';
import { UndocumentedFeatureDetector } from './detectors/undocumented-feature-detector.js';
import { ConflictDetector } from './detectors/conflict-detector.js';
import { BreakingChangeDetector } from './detectors/breaking-change-detector.js';
import { PatternViolationDetector } from './detectors/pattern-violation-detector.js';
import { RecommendationEngine } from './engine/recommendation-engine.js';
import { GapReportGenerator } from './engine/gap-report-generator.js';

/**
 * Gap Analyzer
 *
 * AC-5.1: WHEN user executes /musuhi:validate-gap,
 * System SHALL analyze requirements vs codebase and generate gap-report.md
 *
 * Main orchestrator coordinating all gap detection strategies.
 */
export class GapAnalyzer {
  private codebasePath: string;
  private requirementsPath: string;
  private steeringPath: string;
  // @ts-ignore - Future use: configuration options
  private _config: GapAnalysisConfig;

  /**
   * Creates a new gap analyzer instance
   *
   * AC-3.4: Path Traversal Protection
   * Validates all paths to prevent directory traversal attacks.
   *
   * @param config - Configuration for gap analysis
   * @throws Error if path traversal is detected
   */
  constructor(config: GapAnalysisConfig) {
    // AC-3.4: Validate paths to prevent path traversal
    this.codebasePath = this.validatePath(config.codebasePath, 'codebasePath');
    this.requirementsPath = this.validatePath(config.requirementsPath, 'requirementsPath');
    this.steeringPath = this.validatePath(config.steeringPath, 'steeringPath');
    this._config = config;
  }

  /**
   * AC-5.1: Execute gap analysis
   *
   * Orchestrates all detectors and generates comprehensive gap report.
   * Implements NFR-P.3: <60s for 100k LOC
   *
   * @returns Complete gap analysis report
   */
  async analyze(): Promise<GapReport> {
    const startTime = Date.now();

    // 1. Parse requirements
    console.log('Loading requirements...');
    const requirements = await this.loadRequirements();
    console.log(`Loaded ${requirements.length} requirements`);

    // 2. Initialize parsers
    console.log('Initializing AST parser...');
    const astParser = new ASTParser(this.codebasePath);
    const patternMatcher = new PatternMatcher();

    // 3. Extract codebase metadata
    console.log('Analyzing codebase...');
    const codebaseMetadata = await this.extractCodebaseMetadata(astParser);
    const linesOfCode = astParser.getTotalLinesOfCode();

    // 4. Initialize detectors
    const missingFeatureDetector = new MissingFeatureDetector(astParser);
    const undocumentedDetector = new UndocumentedFeatureDetector(astParser);
    const conflictDetector = new ConflictDetector();
    const breakingChangeDetector = new BreakingChangeDetector(patternMatcher);
    const patternViolationDetector = new PatternViolationDetector();

    // 5. Run all detectors in parallel for performance (NFR-P.3)
    console.log('Running gap detectors...');
    const [
      missingFeatures,
      undocumented,
      conflicts,
      breakingChanges,
      patternViolations,
    ] = await Promise.all([
      Promise.resolve(missingFeatureDetector.detect(requirements)),
      Promise.resolve(undocumentedDetector.detect(requirements)),
      Promise.resolve(conflictDetector.detect(requirements, codebaseMetadata)),
      this.detectBreakingChanges(requirements, breakingChangeDetector),
      patternViolationDetector.detect(requirements, this.steeringPath),
    ]);

    // 6. Combine all gaps
    const gaps: Gap[] = [
      ...missingFeatures,
      ...undocumented,
      ...conflicts,
      ...breakingChanges,
      ...patternViolations,
    ];

    // 7. Calculate coverage
    const implemented = requirements.length - missingFeatures.length;
    const coverage = requirements.length > 0 ? implemented / requirements.length : 0;

    // 8. Generate summary
    const summary: GapSummary = {
      missingFeatures: missingFeatures.length,
      undocumentedFeatures: undocumented.length,
      conflicts: conflicts.length,
      breakingChanges: breakingChanges.length,
      patternViolations: patternViolations.length,
      total: gaps.length,
    };

    // 9. Calculate duration (NFR-P.3: verify <60s)
    const durationMs = Date.now() - startTime;

    // 10. Create report
    const report: GapReport = {
      timestamp: new Date(),
      codebasePath: this.codebasePath,
      linesOfCode,
      totalRequirements: requirements.length,
      coverage,
      gaps,
      summary,
      requirementsPath: this.requirementsPath,
      durationMs,
    };

    console.log(`Gap analysis completed in ${(durationMs / 1000).toFixed(2)}s`);
    console.log(`Coverage: ${(coverage * 100).toFixed(1)}%`);
    console.log(`Total gaps: ${gaps.length}`);

    // Verify performance requirement (NFR-P.3)
    if (durationMs > 60000 && linesOfCode >= 100000) {
      console.warn(`⚠️ Performance warning: Analysis took ${(durationMs / 1000).toFixed(2)}s for ${linesOfCode} LOC (target: <60s)`);
    }

    return report;
  }

  /**
   * AC-5.1: Generate gap report file
   *
   * Writes gap-report.md to the specified output path.
   *
   * @param outputPath - Path where gap-report.md should be written
   */
  async generateReport(outputPath: string): Promise<void> {
    console.log('Generating gap report...');

    // Run analysis
    const report = await this.analyze();

    // Generate recommendations
    const recommendationEngine = new RecommendationEngine();
    const recommendations = recommendationEngine.generate(report.gaps);

    // Generate markdown report
    const generator = new GapReportGenerator();
    const markdown = generator.generate(report, recommendations);

    // Write to file
    await writeFile(outputPath, markdown, 'utf-8');

    console.log(`Gap report written to: ${outputPath}`);
  }

  /**
   * Load requirements from requirements file
   *
   * Parses EARS-format requirements.md and extracts AC-X.Y requirements.
   *
   * @returns Array of requirements
   */
  private async loadRequirements(): Promise<Requirement[]> {
    try {
      const content = await readFile(this.requirementsPath, 'utf-8');

      // Parse EARS requirements
      return this.parseEARSRequirements(content);
    } catch (error) {
      console.error(`Failed to load requirements: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Parse EARS-format requirements from markdown
   *
   * Extracts AC-X.Y requirements with their metadata.
   *
   * @param content - Requirements document content
   * @returns Array of parsed requirements
   */
  private parseEARSRequirements(content: string): Requirement[] {
    const requirements: Requirement[] = [];

    // Match AC-X.Y sections
    const acPattern = /####\s+AC-(\d+)\.(\d+):\s+(.+?)\n.*?Pattern.*?:(.*?)\n.*?```(.*?)```/gs;

    let match;
    while ((match = acPattern.exec(content)) !== null) {
      const featureNumber = parseInt(match[1]!, 10);  // Safe - regex validated
      const criterionNumber = parseInt(match[2]!, 10);  // Safe - regex validated
      const feature = match[3]!.trim();  // Safe - regex capture group exists
      const pattern = match[4]!.trim().toLowerCase();  // Safe - regex capture group exists
      const description = match[5]!.trim();  // Safe - regex capture group exists

      // Determine priority based on feature number
      let priority: 'P0' | 'P1' | 'P2' = 'P1';
      if (featureNumber <= 3) {
        priority = 'P0';
      } else if (featureNumber >= 7) {
        priority = 'P2';
      }

      // Extract keywords from feature name
      const keywords = this.extractKeywordsFromText(feature);

      requirements.push({
        id: `AC-${featureNumber}.${criterionNumber}`,
        feature,
        description,
        pattern: this.mapPatternType(pattern),
        priority,
        keywords,
        featureNumber,
      });
    }

    return requirements;
  }

  /**
   * Extract keywords from text
   *
   * @param text - Text to extract keywords from
   * @returns Array of keywords
   */
  private extractKeywordsFromText(text: string): string[] {
    // Simple keyword extraction (split on spaces, remove common words)
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);

    return words.filter((word) => word.length > 3 && !stopWords.has(word));
  }

  /**
   * Map pattern string to EARS pattern type
   *
   * @param pattern - Pattern string from requirements
   * @returns EARS pattern type
   */
  private mapPatternType(pattern: string): 'event-driven' | 'state-driven' | 'unwanted' | 'optional' | 'ubiquitous' {
    if (pattern.includes('event') || pattern.includes('when')) {
      return 'event-driven';
    }
    if (pattern.includes('state') || pattern.includes('while')) {
      return 'state-driven';
    }
    if (pattern.includes('unwanted') || pattern.includes('if')) {
      return 'unwanted';
    }
    if (pattern.includes('optional') || pattern.includes('where')) {
      return 'optional';
    }
    return 'ubiquitous';
  }

  /**
   * Extract codebase metadata
   *
   * @param astParser - AST parser instance
   * @returns Codebase metadata
   */
  private async extractCodebaseMetadata(astParser: ASTParser): Promise<CodebaseMetadata> {
    // Simplified metadata extraction
    // In production, this would analyze package.json, tsconfig.json, etc.

    return {
      rootPath: this.codebasePath,
      primaryLanguage: 'typescript',
      linesOfCode: astParser.getTotalLinesOfCode(),
      fileCount: astParser.getSourceFiles().length,
      fileTypes: new Map([['ts', astParser.getSourceFiles().length]]),
      directoryPatterns: [],
      architecturalPatterns: [],
      dependencies: [],
      usesTypeScript: true,
      usesTests: true,
      testFramework: 'vitest',
      buildTool: 'vite',
    };
  }

  /**
   * Detect breaking changes
   *
   * @param requirements - All requirements
   * @param detector - Breaking change detector
   * @returns Array of breaking change gaps
   */
  private async detectBreakingChanges(
    requirements: Requirement[],
    detector: BreakingChangeDetector
  ): Promise<Gap[]> {
    // For simplicity, we read entire codebase as text
    // In production, this could be optimized with caching

    try {
      const sourceFiles = await this.getSourceFileContents();
      const codebaseText = sourceFiles.join('\n');

      return detector.detect(requirements, codebaseText);
    } catch (error) {
      console.warn(`Breaking change detection failed: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Get all source file contents
   *
   * @returns Array of file contents
   */
  private async getSourceFileContents(): Promise<string[]> {
    // Simplified implementation
    // In production, this would use glob patterns and read all source files

    return [];
  }

  /**
   * AC-3.4: Validate path to prevent path traversal attacks
   *
   * Ensures that the provided path does not attempt to traverse outside
   * the intended directory structure using '..' or contains malicious patterns.
   *
   * @param inputPath - Path to validate
   * @param paramName - Parameter name for error messages
   * @returns Resolved absolute path
   * @throws Error if path traversal is detected
   */
  private validatePath(inputPath: string, paramName: string): string {
    // AC-3.4: Check for null bytes (common attack vector)
    if (inputPath.includes('\0')) {
      throw new Error(
        `Security: Path traversal detected in ${paramName}: null byte found`
      );
    }

    // AC-3.4: Check for parent directory traversal patterns
    // This catches attempts like: ../../../etc/passwd or ..\..\..\windows\system32
    if (/\.\.[/\\]/.test(inputPath)) {
      throw new Error(
        `Security: Path traversal detected in ${paramName}: parent directory traversal (..) found`
      );
    }

    // AC-3.4: Check for home directory expansion (only suspicious in certain contexts)
    if (/^~[/\\]/.test(inputPath)) {
      throw new Error(
        `Security: Path traversal detected in ${paramName}: home directory expansion (~/) not allowed`
      );
    }

    // AC-3.4: Resolve to absolute path
    // This normalizes the path and resolves any remaining relative components
    const resolvedPath = path.resolve(inputPath);

    // AC-3.4: Additional validation - check for system directories
    // Prevent access to sensitive system directories
    const systemDirs = ['/etc', '/sys', '/proc', 'C:\\Windows', 'C:\\System32'];
    for (const sysDir of systemDirs) {
      if (resolvedPath.startsWith(sysDir)) {
        throw new Error(
          `Security: Access to system directory denied in ${paramName}: ${resolvedPath}`
        );
      }
    }

    return resolvedPath;
  }
}
