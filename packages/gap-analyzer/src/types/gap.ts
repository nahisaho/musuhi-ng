/**
 * Gap Analysis Types
 *
 * Defines core types for brownfield gap analysis, including gap types,
 * gap reports, and detection results.
 *
 * @packageDocumentation
 */

/**
 * Types of gaps that can be detected in brownfield analysis
 *
 * AC-5.2: missing-feature - Requirements with no implementation
 * AC-5.3: undocumented-feature - Code with no requirements
 * AC-5.4: conflict - Requirements conflict with existing patterns
 * AC-5.6: breaking-change - Requirements introduce breaking changes
 * AC-5.7: pattern-violation - Requirements violate architectural patterns
 */
export type GapType =
  | 'missing-feature'
  | 'undocumented-feature'
  | 'conflict'
  | 'breaking-change'
  | 'pattern-violation';

/**
 * Severity levels for gap findings
 *
 * - critical: Must be addressed before deployment (e.g., breaking changes)
 * - high: Should be addressed soon (e.g., missing P0 features)
 * - medium: Should be addressed eventually (e.g., pattern violations)
 * - low: Nice to have (e.g., minor documentation gaps)
 */
export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Individual gap finding
 *
 * Represents a single detected gap between requirements and implementation.
 */
export interface Gap {
  /** Type of gap detected */
  type: GapType;

  /** Associated requirement ID (AC-X.Y), if applicable */
  requirement?: string;

  /** File path where gap was detected, if applicable */
  file?: string;

  /** Human-readable description of the gap */
  description: string;

  /** Actionable recommendation to address the gap (AC-5.5) */
  recommendation: string;

  /** Severity level determining prioritization */
  severity: GapSeverity;

  /** Line number in file, if applicable */
  line?: number;

  /** Additional context for debugging */
  context?: string;
}

/**
 * Summary statistics for gap analysis
 *
 * Provides aggregate counts of each gap type for reporting (AC-5.8)
 */
export interface GapSummary {
  /** Number of missing features (AC-5.2) */
  missingFeatures: number;

  /** Number of undocumented features (AC-5.3) */
  undocumentedFeatures: number;

  /** Number of conflicts detected (AC-5.4) */
  conflicts: number;

  /** Number of breaking changes detected (AC-5.6) */
  breakingChanges: number;

  /** Number of pattern violations detected (AC-5.7) */
  patternViolations: number;

  /** Total number of gaps */
  total: number;
}

/**
 * Complete gap analysis report
 *
 * AC-5.8: Gap Report Format
 * Contains all gap findings, summary statistics, and metadata.
 */
export interface GapReport {
  /** Timestamp when analysis was performed */
  timestamp: Date;

  /** Path to analyzed codebase */
  codebasePath: string;

  /** Total lines of code analyzed */
  linesOfCode: number;

  /** Total number of requirements analyzed */
  totalRequirements: number;

  /** Requirement coverage (0.0 to 1.0) */
  coverage: number;

  /** List of all detected gaps */
  gaps: Gap[];

  /** Summary statistics (AC-5.8) */
  summary: GapSummary;

  /** Path to requirements file */
  requirementsPath?: string;

  /** Analysis duration in milliseconds (NFR-P.3: <60s) */
  durationMs?: number;

  /** Detected breaking changes requiring major version bump */
  breakingChanges?: BreakingChange[];
}

/**
 * Breaking change details
 *
 * AC-5.6: Breaking Change Detection
 * Tracks API changes that require migration strategies
 */
export interface BreakingChange {
  /** Requirement introducing the breaking change */
  requirement: string;

  /** Type of breaking change */
  changeType: 'interface' | 'signature' | 'removal' | 'rename' | 'behavior';

  /** Affected component/API */
  affected: string;

  /** Description of the change */
  description: string;

  /** Suggested migration strategy */
  migrationStrategy: string;

  /** Version bump required (major, minor, patch) */
  versionImpact: 'major' | 'minor' | 'patch';
}

/**
 * Configuration options for gap analysis
 */
export interface GapAnalysisConfig {
  /** Path to codebase to analyze */
  codebasePath: string;

  /** Path to requirements file */
  requirementsPath: string;

  /** Path to steering directory */
  steeringPath: string;

  /** File patterns to include (glob) */
  includePatterns?: string[];

  /** File patterns to exclude (glob) */
  excludePatterns?: string[];

  /** Whether to detect breaking changes (AC-5.6) */
  detectBreakingChanges?: boolean;

  /** Whether to detect pattern violations (AC-5.7) */
  detectPatternViolations?: boolean;

  /** Maximum analysis time in ms (NFR-P.3: <60000) */
  timeoutMs?: number;
}
